import { Application, ConfigController, Observer } from 'yunzaijs'
import { Store } from '../model/store'
import pm2 from 'pm2'

// 执行锁
let lock = false

// 时间锁 5 秒 时间锁
// 重启速度太快，icqq重复接收消息。
const RESTART_TIME = 5 * 1000

export class Restart extends Application<'message'> {
  constructor(e) {
    // 消息
    super('message')
    // event
    if (e) this.e = e
    // rule
    this.rule = [
      {
        reg: /^(#|\/)(控制台)?重启$/,
        fnc: this.restart.name
      },
      {
        reg: /^(#|\/)(停机|关机)$/,
        fnc: this.stop.name
      },
      {
        reg: /^(#|\/)结束进程$/,
        fnc: this.exit.name
      }
    ]
  }

  /**
   * 重启方法
   * @returns {Promise<void>}
   */
  async restart() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }

    if (lock) {
      this.e.reply('正在调控，请勿重复进行...')
      return
    }

    /**
     * 时间锁
     */
    const time = await redis.get(Store.RESTART_ACTION_KEY)
    if (time && Number(time) + RESTART_TIME > Date.now()) return
    await redis.set(Store.RESTART_ACTION_KEY, Date.now().toString())

    // 执行锁
    lock = true

    //
    const Error = (err: any, msg?: string) => {
      lock = false
      if (err) logger.error(err)
      if (msg) {
        logger.error(msg)
        this.e.reply(msg)
      }
      pm2.disconnect()
      // delete
      redis.del(Store.RESTART_KEY)
    }

    // delete
    redis.del(Store.RESTART_KEY)

    //
    const send = async () => {
      await this.e.reply('开始重启...')
      // set
      await redis.set(
        Store.RESTART_KEY,
        JSON.stringify({
          uin: this.e?.self_id || this.e.bot.uin,
          isGroup: !!this.e.isGroup,
          id: this.e.isGroup ? this.e.group_id : this.e.user_id,
          time: new Date().getTime()
        }),
        { EX: 120 }
      )
    }

    // config
    const cfg = ConfigController.pm2

    // 查看情况
    pm2.connect(err => {
      if (err) {
        Error(err?.message, 'pm2出错')
        return
      }
      // 得到列表
      pm2.list(async (err, processList) => {
        if (err) {
          Error(err?.message, 'pm2 list 获取失败')
          return
        }
        //
        if (processList.length <= 0) {
          Error(undefined, 'pm2 进程配置为空, 你从未有pm2进程记录,无法使用重启')
          return
        }
        //
        const app = processList.find(p => p.name === cfg.apps[0].name)
        //
        if (!app) {
          Error(undefined, 'pm2 未匹配到进程配置，配置可能被修改了')
          return
        }
        // 记录重启
        await send()
        // 尝试重启
        pm2.restart(cfg.apps[0].name, async err => {
          if (err) {
            Error(err?.message, 'pm2 重启错误')
          } else {
            lock = false

            if (!/^控制台/.test(this.e.msg)) {
              // 不是控制台重启，直接杀死当前进程
              process.exit()
            }

            // 下线
            global.Bot.logout()

            // 打印记录
            pm2.launchBus((err, bus) => {
              if (err) {
                console.error(err)
                process.exit(2)
              }
              bus.on('log:out', packet => {
                if (packet?.data) console.log(packet.data)
              })
              bus.on('log:err', packet => {
                if (packet?.data) console.log(packet.data)
              })
            })

            //
          }
        })
      })
    })
  }

  /**
   *
   * @returns
   */
  async stop() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    if (lock) {
      this.e.reply('正在调控，请勿重复进行...')
      return
    }
    this.e.reply('请再次发送，以确认关机')

    const O = new Observer('message')
    O.use(
      async (e, _, close) => {
        //
        const Error = (err: any, msg?: string) => {
          lock = false
          if (err) logger.error(err)
          if (msg) {
            logger.error(msg)
            e.reply(msg)
          }
          pm2.disconnect()
          // delete
          redis.del(Store.RESTART_KEY)
        }

        if (/^#(停机|关机)$/.test(e.msg)) {
          // 不是生产环境
          if (process.env?.NODE_ENV !== 'production') {
            await this.e.reply('准备杀死进程...')
            // 直接结束
            process.exit()
          }

          // config
          const cfg = ConfigController.pm2
          // 查看情况
          pm2.connect(err => {
            if (err) {
              Error(err?.message, 'pm2出错')
              return
            }
            // 得到列表
            pm2.list(async (err, processList) => {
              if (err) {
                Error(err?.message, 'pm2 list 获取失败')
                return
              }
              //
              if (processList.length <= 0) {
                Error(
                  undefined,
                  'pm2 进程配置为空, 你从未有pm2进程记录,无法使用'
                )
                return
              }
              //
              const app = processList.find(p => p.name === cfg.apps[0].name)
              //
              if (!app) {
                Error(undefined, 'pm2 未匹配到进程配置，配置可能被修改了')
                return
              }
              pm2.stop(cfg.apps[0].name, () => {
                if (err) {
                  Error(err?.message, 'pm2 关闭')
                }
              })
            })
          })
        } else {
          e.reply('已取消关机')
        }
        close()
      },
      [this.e.user_id]
    )

    //
  }

  /**
   *
   * @returns
   */
  async exit() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }

    if (lock) {
      this.e.reply('正在调控，请勿重复进行...')
      return
    }

    //
    this.e.reply('请再次发送，以确认!')

    //
    const O = new Observer('message')
    //
    O.use(
      async (e, _, close) => {
        if (/^(#|\/)结束进程$/.test(e.msg)) {
          process.exit()
        } else {
          e.reply('已取消！')
        }
        close()
      },
      [this.e.user_id]
    )

    //
  }
}
