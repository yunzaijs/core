import lodash from 'lodash'
import schedule from 'node-schedule'
import { segment } from 'icqq'
import chokidar from 'chokidar'
import moment from 'moment'
import { basename, join } from 'node:path'
import { existsSync } from 'node:fs'
import { stat, readdir } from 'node:fs/promises'
// types
import { EventType } from '../types.js'
// handler
import Handler from './handler.js'
// config
import cfg from '../../config/config.js'
// 中间
import Runtime from '../middleware/runtime.js'
import { PLUGINS_PATH } from '../../config/system.js'

/**
 * 加载插件
 */
class PluginsLoader {
  /**
   *
   */
  priority = []
  /**
   *
   */
  handler = {}
  /**
   *
   */
  task = []

  /**
   * 命令冷却cd
   */
  groupGlobalCD = {}

  /**
   *
   */
  singleCD = {}

  /**
   * 插件监听
   */
  watcher = {}

  /**
   *
   */
  msgThrottle = {}

  /**
   *
   */
  pluginCount = null

  /**
   * 星铁命令前缀
   */
  srReg = /^#?(\*|星铁|星轨|穹轨|星穹|崩铁|星穹铁道|崩坏星穹铁道|铁道)+/

  /**
   *
   */
  eventMap = {
    /**
     *
     */
    message: ['post_type', 'message_type', 'sub_type'],
    /**
     *
     */
    notice: ['post_type', 'notice_type', 'sub_type'],
    /**
     *
     */
    request: ['post_type', 'request_type', 'sub_type']
  }

  /**
   * 得到插件地址
   * @returns
   */
  #getPlugins = async () => {
    // 便利得到目录和文件
    const files = await readdir(PLUGINS_PATH, { withFileTypes: true })
    const ret = []
    for (const val of files) {
      // 是文件
      if (val.isFile()) continue
      try {
        let dir = `${PLUGINS_PATH}/${val.name}/index.ts`
        if (!existsSync(dir)) {
          dir = `${PLUGINS_PATH}/${val.name}/index.js`
        }
        if (await stat(dir)) {
          ret.push({
            name: val.name,
            path: dir
          })
          continue
        }
      } catch (err) {
        logger.error(err)
      }
    }
    return ret
  }

  /**
   * 监听事件加载
   * @param isRefresh 是否刷新
   */
  async load(isRefresh = false) {
    // 重置
    this.delCount()
    // 累计
    if (isRefresh) this.priority = []
    // 如果
    if (this.priority.length) return

    // 得到插件地址
    const files = await this.#getPlugins()

    logger.info('-----------')
    logger.info('加载插件中...')

    this.pluginCount = 0
    const packageErr = []

    // 返回成功的
    await Promise.allSettled(
      files.map(file => this.#importPlugin(file, packageErr))
    )

    this.packageTips(packageErr)
    this.createTask()

    logger.info(`加载定时任务[${this.task.length}个]`)
    logger.info(`加载插件[${this.pluginCount}个]`)

    /** 优先级排序 */
    this.priority = lodash.orderBy(this.priority, ['priority'], ['asc'])
  }

  /**
   * 引入插件
   * @param file
   * @param packageErr
   */
  #importPlugin = async (file, packageErr?: any) => {
    try {
      const app = await import(`file://${join(process.cwd(), file.path)}`)
      const pluginArray = []
      for (const key in app.apps) {
        pluginArray.push(this.loadPlugin(file, app.apps[key], key))
      }
      for (const i of await Promise.allSettled(pluginArray))
        if (i?.status && i.status != 'fulfilled') {
          logger.error(`加载插件错误：${logger.red(file.name)}`)
          logger.error(decodeURI(i.reason))
        }
    } catch (error) {
      logger.error(error)
      if (packageErr && error.stack.includes('Cannot find package')) {
        packageErr.push({ error, file })
      } else {
        logger.error(`加载插件错误：${logger.red(file.name)}`)
        logger.error(decodeURI(error.stack))
      }
    }
  }

  /**
   * 解析插件
   * @param file
   * @param p
   * @param name
   * @returns
   */
  async loadPlugin(file, p, name) {
    // 不存在原型链
    if (!p?.prototype) return

    /**
     *
     */
    this.pluginCount++

    /**
     *
     */
    const plugin = new p()

    /**
     *
     */
    logger.debug(`加载插件 [${file.name}][${name}]`)

    /**
     * 执行初始化，返回 return 则跳过加载
     */
    if (plugin.init && (await plugin.init()) == 'return') return

    /**
     * 初始化定时任务
     */
    this.collectTask(plugin.task)

    /**
     *
     */
    this.priority.push({
      // tudo 不标准写法 - -- 使用 关键词
      class: p,
      // 插件名
      key: file.name,
      // 单例名
      name: name,
      // 优先级
      priority: plugin.priority
    })

    /**
     *
     */
    if (plugin.handler) {
      /**
       *
       */
      lodash.forEach(plugin.handler, ({ fn, key, priority }) => {
        /**
         *
         */
        Handler.add({
          ns: plugin.namespace || file.name,
          key,
          self: plugin,
          property: priority || plugin.priority || 9999,
          fn: plugin[fn]
        })
      })
    }
  }

  /**
   *
   * @param packageErr
   * @returns
   */
  packageTips(packageErr) {
    if (!packageErr || packageErr.length <= 0) return
    logger.mark('--------插件载入错误--------')
    packageErr.forEach(v => {
      let pack = v.error.stack.match(/'(.+?)'/g)[0].replace(/'/g, '')
      logger.mark(`${v.file.name} 缺少依赖：${logger.red(pack)}`)
      logger.mark(`新增插件后请执行安装命令：${logger.red('pnpm i')} 安装依赖`)
      logger.mark(
        `如安装后仍未解决可联系插件作者将 ${logger.red(pack)} 依赖添加至插件的package.json dependencies中，或手工安装依赖`
      )
    })
    logger.mark('---------------------')
  }

  /**
   * 处理事件
   * 参数文档 https://oicqjs.github.io/oicq/interfaces/GroupMessageEvent.html
   * 这里是每个事件发送的入口
   * @param e icqq Events
   */
  async deal(e: EventType) {

    // 代理 bot 属性  访问时获取参数
    Object.defineProperty(e, 'bot', {
      value: global.Bot[e?.self_id ?? global.Bot.uin]
    })

    /**
     * 检查频道消息
     */
    if (this.checkGuildMsg(e)) return

    /**
     * 冷却
     */
    if (!this.checkLimit(e)) return

    /**
     * 重新处理e
     */
    this.dealMsg(e)

    /**
     * 检查黑白名单
     */
    if (!this.checkBlack(e)) return

    /**
     * 消息中间
     * 处理回复
     */
    this.reply(e)

    /**
     * 消息中间
     * 注册runtime
     */
    await Runtime.init(e)


    /**
     * 消息中间
     * 注册runtime
     */

    // 判断是否是星铁命令，若是星铁命令则标准化处理
    // e.isSr = true，且命令标准化为 #星铁 开头
    Object.defineProperty(e, 'isSr', {
      get: () => e.game === 'sr',
      set: v => (e.game = v ? 'sr' : 'gs')
    })
    Object.defineProperty(e, 'isGs', {
      get: () => e.game === 'gs',
      set: v => (e.game = v ? 'gs' : 'sr')
    })
    if (this.srReg.test(e.msg)) {
      e.game = 'sr'
      e.msg = e.msg.replace(this.srReg, '#星铁')
    }

    /**
     *
     */
    const priority = []

    /**
     *
     */
    for (const i of this.priority) {
      const p = new i.class(e)
      // 现在给e，后续e将无法访问新增字段
      p._key = i.key
      p._name = i.name
      p.e = e
      /**
       * 判断是否启用功能，过滤事件
       */
      if (this.checkDisable(p) && this.filtEvent(e, p)) priority.push(p)
    }

    /**
     *
     */
    for (const plugin of priority) {
      if (!plugin?.getContext) continue
      const context = {
        ...plugin.getContext(),
        ...plugin.getContext(false, true)
      }

      if (lodash.isEmpty(context)) {
        continue
      }

      // 不为空的时候
      let ret = false

      // 从方法里执行
      for (const fnc in context) {
        // 不是函数，错误插件错误写法
        if (typeof plugin[fnc] !== 'function') {
          continue
        }
        ret = await plugin[fnc](context[fnc])
      }

      // 不是约定的直接
      if (typeof ret != 'boolean' && ret !== true) {
        break
      }

      //
    }

    /**
     * 是否只关注主动at
     */
    if (!this.onlyReplyAt(e)) return

    /**
     * 优先执行 accept
     */
    for (const plugin of priority) {
      if (!plugin.accept) continue
      // e 引入将丢失
      const res = await plugin.accept(e)
      // 结束所有
      if (res == 'return') return
      // 结束当前
      if (res) break
    }

    /**
     * 便利执行
     */
    for (const plugin of priority) {
      if (!Array.isArray(plugin?.rule) || plugin.rule.length < 1) continue
      for (const v of plugin.rule) {
        /**
         * 判断事件
         */
        if (v.event && !this.filtEvent(e, v)) continue
        /**
         *
         */
        if (!new RegExp(v.reg).test(e.msg)) continue
        /**
         * tudo
         * 名字是被识别起来的名字
         * 不是开发者自己随便起的
         */
        const LOG = `[${plugin._key}][${plugin._name}][${v.fnc}]`
        /**
         *
         */
        if (v.log !== false) {
          logger.info(
            `${LOG}${e.logText} ${lodash.truncate(e.msg, { length: 100 })}`
          )
        }
        /**
         * 判断权限
         */
        if (!this.filtPermission(e, v)) break
        /**
         *
         */
        try {
          const start = Date.now()
          // 不是函数。
          if (typeof plugin[v.fnc] !== 'function') {
            continue
          }
          const res = await plugin[v.fnc](e)
          // 非常规返回，不是true，直接结束。
          if (typeof res != 'boolean' && res !== true) {
            /**
             * 设置冷却cd
             */
            this.setLimit(e)
            if (v.log !== false) {
              logger.mark(
                `${LOG} ${lodash.truncate(e.msg, { length: 100 })} 处理完成 ${Date.now() - start}ms`
              )
            }
            break
          }
          //
        } catch (error) {
          logger.error(LOG)
          logger.error(error.stack)
          break
        }
      }
    }

    //
  }

  /**
   * 过滤事件
   * @param e
   * @param v
   * @returns
   */
  filtEvent(e: EventType, v) {
    if (!v.event) return false
    const event = v.event.split('.')
    const eventMap = this.eventMap[e.post_type] || []
    const newEvent = []
    for (const i in event) {
      if (event[i] == '*') newEvent.push(event[i])
      else newEvent.push(e[eventMap[i]])
    }
    return v.event == newEvent.join('.')
  }

  /**
   * 判断权限
   * @param e
   * @param v
   * @returns
   */
  filtPermission(e: EventType, v) {
    if (v.permission == 'all' || !v.permission) return true
    if (v.permission == 'master') {
      if (e.isMaster) {
        return true
      } else {
        e.reply('暂无权限，只有主人才能操作')
        return false
      }
    }
    if (e.isGroup) {
      if (!e.member?._info) {
        e.reply('数据加载中，请稍后再试')
        return false
      }
      if (v.permission == 'owner') {
        if (!e.member.is_owner) {
          e.reply('暂无权限，只有群主才能操作')
          return false
        }
      }
      if (v.permission == 'admin') {
        if (!e.member.is_admin) {
          e.reply('暂无权限，只有管理员才能操作')
          return false
        }
      }
    }
    return true
  }

  /**
   * 
   * 消息中间件
   * -----
   * 处理消息，加入自定义字段
   * @param e.msg 文本消息，多行会自动拼接
   * @param e.img 图片消息数组
   * @param e.atBot 是否at机器人
   * @param e.at 是否at，多个at 以最后的为准
   * @param e.file 接受到的文件
   * @param e.isPrivate 是否私聊
   * @param e.isGroup 是否群聊
   * @param e.isMaster 是否管理员
   * @param e.logText 日志用户字符串
   * @param e.logFnc  日志方法字符串
   * 频道
   * @param e.isGuild 是否频道
   * @param e.at 支持频道 tiny_id
   * @param e.atBot 支持频道
   */
  dealMsg(e: EventType) {
    if (e.message) {
      for (let val of e.message) {
        switch (val.type) {
          case 'text':
            e.msg =
              (e.msg || '') +
              (val.text || '')
                .replace(/^\s*[＃井#]+\s*/, '#')
                .replace(/^\s*[\\*※＊]+\s*/, '*')
                .trim()
            break
          case 'image':
            if (!e.img) {
              e.img = []
            }
            e.img.push(val.url)
            break
          case 'at':
            if (val.qq == e.bot.uin) {
              e.atBot = true
            } else if (e.bot.tiny_id && val.id == e.bot.tiny_id) {
              e.atBot = true
              /** 多个at 以最后的为准 */
            } else if (val.id) {
              e.at = val.id
            } else {
              e.at = val.qq
            }
            break
          case 'file':
            e.file = { name: val.name, fid: val.fid }
            break
          case 'xml':
          case 'json':
            e.msg =
              (e.msg || '') +
              (typeof val.data == 'string'
                ? val.data
                : JSON.stringify(val.data))
            break
        }
      }
    }

    /**
     *
     */
    e.logText = ''

    /**
     * 私聊
     */
    if (e.message_type === 'private' || e.notice_type === 'friend') {
      e.isPrivate = true

      // 存在
      if (e.sender) {
        e.sender.card = e.sender?.nickname
      } else {
        e.sender = {} as any
        // 不存在
        e.sender = {
          card: e.friend?.nickname,
          nickname: e.friend?.nickname
        } as any
      }
      e.logText = `[私聊][${e.sender?.nickname}(${e.user_id})]`
    }

    /**
     * 群聊
     */
    if (e.message_type === 'group' || e.notice_type === 'group') {
      //
      e.isGroup = true

      // 存在
      if (e.sender) {
        e.sender.card = e.sender.card ?? e.sender?.nickname
      } else if (e.member) {
        e.sender = {
          card: e.member.card ?? e.member?.nickname,
          nickname: e.member.card ?? e.member?.nickname
        } as any
      } else if (e?.nickname) {
        e.sender = {
          card: e?.nickname,
          nickname: e?.nickname
        } as any
      } else {
        e.sender = {} as any
        e.sender = {
          card: e?.user_id ?? '',
          nickname: e?.user_id ?? ''
        } as any
      }

      if (!e.group_name) e.group_name = e.group?.name

      e.logText = `[${e.group_name}(${e.sender.card})]`

      //
    } else if (e.detail_type === 'guild') {
      //
      e.isGuild = true
    }

    if (!e.user_id) {
      e.user_id = e.sender?.user_id
    }
    if (e?.user_id) {
      e.user_avatar = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`
    }
    if (e?.group_id) {
      e.group_avatar = `https://p.qlogo.cn/gh/${e.group_id}/${e.group_id}/640/`
    }
    if (e.sender?.nickname) {
      e.user_name = e.sender?.nickname
    }

    /**
     *
     */
    if (e.user_id && cfg.masterQQ.includes(String(e.user_id))) {
      e.isMaster = true
    }

    /**
     * 只关注主动at msg处理
     */
    if (e.msg && e.isGroup) {
      const groupCfg = cfg.getGroup(String(e.group_id))
      let alias = groupCfg.botAlias
      if (!Array.isArray(alias)) {
        alias = [alias]
      }
      for (let name of alias) {
        if (e.msg.startsWith(name)) {
          e.msg = lodash.trimStart(e.msg, name).trim()
          e.hasAlias = true
          break
        }
      }
    }
  }

  /**
   * 处理回复
   * 捕获发送失败异常
   * 重写this.reply
   * @param e
   */
  reply(e: EventType) {
    /**
     *
     */
    if (e.reply) {
      /**
       *
       */
      e.replyNew = e.reply

      /**
       * 去除
       */
      delete e.reply

      /**
       * @param msg 发送的消息
       * @param quote 是否引用回复
       * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
       * @param data.at 是否at用户
       */
      e.reply = async (
        msg: any = '',
        quote = false,
        data?: {
          recallMsg?: number
          at?: any
        }
      ) => {
        if (!msg) return false

        /** 禁言中 */
        if (e.isGroup && e?.group?.mute_left > 0) return false

        let { recallMsg = 0, at = '' } = data ?? {}

        // 如果存在 at 而且是群聊
        if (at && e.isGroup) {
          let text = ''
          //
          if (e?.sender?.card) {
            text = lodash.truncate(e.sender.card, { length: 10 })
          }
          //
          if (at === true) {
            at = Number(e.user_id) || String(e.user_id)
          } else if (!isNaN(at)) {
            // 如果是频道
            if (e.isGuild) {
              text = e.sender?.nickname
            } else {
              let info = e.group.pickMember(at).info
              text = info?.card ?? info?.nickname
            }
            text = lodash.truncate(text, { length: 10 })
          }
          if (Array.isArray(msg)) {
            msg.unshift(segment.at(at, text), '\n')
          } else {
            msg = [segment.at(at, text), '\n', msg]
          }
        }

        // 得到返回的消息
        let msgRes

        // 如果不是数组
        if (!Array.isArray(msg)) {
          msg = [msg]
        }

        // 不是频道模式
        if (!e.isGuild) {
          // 去掉所有button。
          msg = msg.filter(item => item.type != 'button')
        }

        // file不是bool的留下
        msg = msg.filter(item => typeof item.file !== 'boolean')

        // 空消息
        if (msg.length <= 0) return msgRes

        //
        try {
          msgRes = await e.replyNew(msg, quote)
        } catch (err) {
          // 控制是否打印
          let open = false

          // 捕获错误格式数据里是否有message
          const findItem = msg.filter(item => Array.isArray(item.message))

          // 找到了
          if (findItem.length >= 1) {
            open = true
            // 合并所有满足条件的 message
            msg = findItem.reduce((acc, item) => acc.concat(item.message), [])

            // 尝试重发
            try {
              msgRes = await e.reply(msg, quote)
              open = true
            } catch {
              // 发送失败
              open = true
            }

            //
          }

          // 打印错误信息
          if (!open) {
            //
            msg = msg.map(item => {
              // 存在 file得去掉
              if (item?.file) {
                delete item.file
              }
              return item
            })

            // 格式化json

            msg = lodash.truncate(JSON.stringify(msg), { length: 300 })

            //
            logger.error(`发送消息错误:${msg}`)
            logger.error(err)

            // 发送错误消息
            if (cfg.bot.sendmsg_error && cfg?.masterQQ?.length > 0) {
              global.Bot[global.Bot.uin]
                .pickUser(cfg.masterQQ[0])
                .sendMsg('错误消息~请翻阅执行记录。')
            }

            //
          }
        }

        // 频道一下是不是频道
        if (!e.isGuild && recallMsg > 0 && msgRes?.message_id) {
          if (e.isGroup) {
            setTimeout(
              () => e.group.recallMsg(msgRes.message_id),
              recallMsg * 1000
            )
          } else if (e.friend) {
            setTimeout(
              () => e.friend.recallMsg(msgRes.message_id),
              recallMsg * 1000
            )
          }
        }
        // ?
        this.count(e, msg)
        return msgRes
      }
      /**
       *
       */
    } else {
      /**
       */
      e.reply = async (msg = '', _ = false, __ = {}) => {
        // 不存在消息
        if (!msg) return false
        // ?
        this.count(e, msg)
        // 群在qunid
        if (e.group_id) {
          return await e.group.sendMsg(msg).catch(err => {
            logger.warn(err)
          })
        } else {
          // 好友列表
          const friend = e.bot.fl.get(e.user_id)
          if (!friend) return
          // 发送消息
          return await e.bot
            .pickUser(e.user_id)
            .sendMsg(msg)
            .catch(err => {
              logger.warn(err)
            })
        }
      }
    }
  }

  /**
   *
   * @param e
   * @param msg
   */
  count(e, msg) {
    /**
     *
     */
    let screenshot = false
    /**
     *
     */
    if (msg && msg?.file && Buffer.isBuffer(msg?.file)) {
      screenshot = true
    }

    /**
     *
     */
    this.saveCount('sendMsg')
    /**
     *
     */
    if (screenshot) this.saveCount('screenshot')

    /**
     *
     */
    if (e.group_id) {
      /**
       *
       */
      this.saveCount('sendMsg', e.group_id)
      /**
       *
       */
      if (screenshot) this.saveCount('screenshot', e.group_id)
    }
  }

  /**
   *
   * @param type
   * @param groupId
   */
  saveCount(type, groupId = '') {
    /**
     *
     */
    let key = 'Yz:count:'

    /**
     *
     */
    if (groupId) {
      /**
       *
       */
      key += `group:${groupId}:`
    }

    /**
     *
     */
    let dayKey = `${key}${type}:day:${moment().format('MMDD')}`
    /**
     *
     */
    let monthKey = `${key}${type}:month:${Number(moment().month()) + 1}`
    /**
     *
     */
    let totalKey = `${key}${type}:total`

    /**
     *
     */
    redis.incr(dayKey)
    /**
     *
     */
    redis.incr(monthKey)
    /**
     *
     */
    if (!groupId) redis.incr(totalKey)
    /**
     *
     */
    redis.expire(dayKey, 3600 * 24 * 30)
    /**
     *
     */
    redis.expire(monthKey, 3600 * 24 * 30)
  }

  /**
   *
   */
  delCount() {
    /**
     *
     */
    let key = 'Yz:count:'
    /**
     *
     */
    redis.set(`${key}sendMsg:total`, '0')
    /**
     *
     */
    redis.set(`${key}screenshot:total`, '0')
  }

  /**
   * 收集定时任务
   * @param task
   */
  collectTask(task) {
    /**
     *
     */
    for (const i of Array.isArray(task) ? task : [task]) {
      if (i?.cron && i?.name) {
        this.task.push(i)
      }
    }
  }

  /**
   * 创建定时任务
   */
  createTask() {
    /**
     *
     */
    for (const i of this.task) {
      /**
       *
       */
      i.job = schedule.scheduleJob(i?.cron, async () => {
        /**
         *
         */
        try {
          if (i.log == true) logger.mark(`开始定时任务：${i.name}`)
          await i.fnc()
          if (i.log == true) logger.mark(`定时任务完成：${i.name}`)
        } catch (error) {
          logger.error(`定时任务报错：${i.name}`)
          logger.error(error)
        }
      })
    }
  }

  /**
   * 检查命令冷却cd
   * @param e
   * @returns
   */
  checkLimit(e: EventType) {
    /** 禁言中 */
    if (e.isGroup && e?.group?.mute_left > 0) return false
    /**
     *
     */
    if (!e.message || e.isPrivate) return true

    /**
     *
     */
    let config = cfg.getGroup(String(e.group_id))

    /**
     *
     */
    if (config.groupGlobalCD && this.groupGlobalCD[e.group_id]) {
      return false
    }
    /**
     *
     */
    if (config.singleCD && this.singleCD[`${e.group_id}.${e.user_id}`]) {
      return false
    }

    /**
     *
     */
    let { msgThrottle } = this

    /**
     *
     */
    let msgId = e.user_id + ':' + e.raw_message
    if (msgThrottle[msgId]) {
      return false
    }
    /**
     *
     */
    msgThrottle[msgId] = true
    /**
     *
     */
    setTimeout(() => {
      delete msgThrottle[msgId]
    }, 200)

    return true
  }

  /**
   * 设置冷却cd
   * @param e
   * @returns
   */
  setLimit(e: EventType) {
    /**
     *
     */
    if (!e.message || e.isPrivate) return
    /**
     *
     */
    let config = cfg.getGroup(String(e.group_id))

    /**
     *
     */
    if (config.groupGlobalCD) {
      this.groupGlobalCD[e.group_id] = true
      setTimeout(() => {
        delete this.groupGlobalCD[e.group_id]
      }, config.groupGlobalCD)
    }
    if (config.singleCD) {
      let key = `${e.group_id}.${e.user_id}`
      this.singleCD[key] = true
      setTimeout(() => {
        delete this.singleCD[key]
      }, config.singleCD)
    }
  }

  /**
   * 是否只关注主动at
   * @param e
   * @returns
   */
  onlyReplyAt(e: EventType) {
    if (!e.message || e.isPrivate) return true

    let groupCfg = cfg.getGroup(String(e.group_id))

    /** 模式0，未开启前缀 */
    if (groupCfg.onlyReplyAt == 0 || !groupCfg.botAlias) return true

    /** 模式2，非主人需带前缀或at机器人 */
    if (groupCfg.onlyReplyAt == 2 && e.isMaster) return true

    /** at机器人 */
    if (e.atBot) return true

    /** 消息带前缀 */
    if (e.hasAlias) return true

    return false
  }

  /**
   * 判断频道消息
   * @param e
   * @returns
   */
  checkGuildMsg(e: EventType) {
    return cfg.other.disableGuildMsg && e.detail_type == 'guild'
  }

  /**
   * 判断黑白名单
   * @param e
   * @returns
   */
  checkBlack(e: EventType) {
    const other = cfg.other

    /** 黑名单qq */
    if (other.blackQQ?.length) {
      if (other.blackQQ.includes(Number(e.user_id) || String(e.user_id)))
        return false
      if (e.at && other.blackQQ.includes(Number(e.at) || String(e.at)))
        return false
    }
    /** 白名单qq */
    if (other.whiteQQ?.length)
      if (!other.whiteQQ.includes(Number(e.user_id) || String(e.user_id)))
        return false

    if (e.group_id) {
      /** 黑名单群 */
      if (
        other.blackGroup?.length &&
        other.blackGroup.includes(Number(e.group_id) || String(e.group_id))
      )
        return false
      /** 白名单群 */
      if (
        other.whiteGroup?.length &&
        !other.whiteGroup.includes(Number(e.group_id) || String(e.group_id))
      )
        return false
    }

    return true
  }

  /**
   * 判断是否启用功能
   * @param p
   * @returns
   */
  checkDisable(p) {
    const groupCfg = cfg.getGroup(p.e.group_id)
    if (groupCfg.disable?.length && groupCfg.disable.includes(p.name))
      return false
    if (groupCfg.enable?.length && !groupCfg.enable.includes(p.name))
      return false
    return true
  }

  /**
   *
   * @param key
   */
  async changePlugin(key) {
    try {
      let app = await import(`../../${PLUGINS_PATH}/${key}?${moment().format('x')}`)
      if (app.apps) app = { ...app.apps }
      lodash.forEach(app, p => {
        const plugin = new p()
        for (const i in this.priority)
          if (
            this.priority[i].key == key &&
            this.priority[i].name == plugin.name
          ) {
            this.priority[i].class = p
            this.priority[i].priority = plugin.priority
          }
      })
      this.priority = lodash.orderBy(this.priority, ['priority'], ['asc'])
    } catch (error) {
      logger.error(`加载插件错误：${logger.red(key)}`)
      logger.error(decodeURI(error.stack))
    }
  }

  /**
   * 监听热更新
   * @param dirName
   * @param appName
   * @returns
   */
  watch(dirName, appName) {
    this.watchDir(dirName)
    if (this.watcher[`${dirName}.${appName}`]) return

    const file = `./${PLUGINS_PATH}/${dirName}/${appName}`
    const watcher = chokidar.watch(file)
    const key = `${dirName}/${appName}`

    /**
     * 监听修改
     */
    watcher.on('change', () => {
      logger.mark(`[修改插件][${dirName}][${appName}]`)
      this.changePlugin(key)
    })

    /**
     * 监听删除
     */
    watcher.on('unlink', () => {
      logger.mark(`[卸载插件][${dirName}][${appName}]`)
      /** 停止更新监听 */
      this.watcher[`${dirName}.${appName}`].removeAllListeners('change')
      // lodash.remove(this.priority, { key })
      for (let i = this.priority.length - 1; i >= 0; i--) {
        if (this.priority[i].key === key) {
          this.priority.splice(i, 1)
        }
      }
    })
    this.watcher[`${dirName}.${appName}`] = watcher
  }

  /**
   * 监听文件夹更新
   * @param dirName
   * @returns
   */
  watchDir(dirName) {
    if (this.watcher[dirName]) return

    //
    const watcher = chokidar.watch(`./${PLUGINS_PATH}/${dirName}/`)

    /**
     * 热更新
     */
    setTimeout(() => {
      /**
       * 新增文件
       */
      watcher.on('add', async PluPath => {
        const appName = basename(PluPath)
        /**
         */
        if (!/^(.js|.ts)$/.test(appName)) return
        logger.mark(`[新增插件][${dirName}][${appName}]`)
        const key = `${dirName}/${appName}`
        /**
         *
         */
        await this.#importPlugin({
          name: key,
          path: `../../${PLUGINS_PATH}/${key}?${moment().format('X')}`
        })
        /**
         * 优先级排序
         */
        this.priority = lodash.orderBy(this.priority, ['priority'], ['asc'])
        /**
         *
         */
        this.watch(dirName, appName)
      })
    }, 10000)
    this.watcher[dirName] = watcher


    //
  }
}

/**
 *
 */
export default new PluginsLoader()
