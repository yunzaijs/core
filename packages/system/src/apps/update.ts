import { Application, makeForwardMsg, execAsync, PLUGINS_PATH } from 'yunzaijs'
import { trim } from 'lodash-es'
import { existsSync, readdirSync } from 'node:fs'
import { BOT_NAME } from 'yunzaijs'
import { join } from 'node:path'

// id
let oldCommitId = null

// 执行锁
let lock = false

/**
 *
 * @param name
 * @returns
 */
const isPluinName = (name: string) => {
  // 指定插件不存在
  if (!existsSync(join(PLUGINS_PATH, name, '.git'))) return false
  return true
}

/**
 *
 * @returns
 */
const isLocalGit = () => {
  if (!existsSync(join(process.cwd(), '.git'))) return false
  return true
}

/**
 *
 * @param name
 * @returns
 */
const getcommitId = async (pluginName = '') => {
  const Shells = ['git rev-parse --short HEAD']
  if (pluginName && pluginName != '') {
    Shells.unshift(`cd "plugins/${pluginName}"`)
  }
  const commitId = await execAsync(Shells.join(' && '))
  return trim(commitId?.stderr ?? commitId.stdout)
}

/**
 *
 * @param plugin
 * @returns
 */
const getTime = async (pluginName = '') => {
  const Shells = ['git log -1 --pretty=%cd --date=format:"%F %T"']
  if (pluginName != '') Shells.unshift(`cd "plugins/${pluginName}"`)
  try {
    const res = await execAsync(Shells.join(' && '))
    return trim(res?.stdout)
  } catch (error) {
    logger.error(error.toString())
    return '获取时间失败'
  }
}

/**
 *
 * @param stdErr
 * @param stdout
 * @returns
 */
const getGitErr = (stdErr: string, stdout: string) => {
  const MSG = ['更新失败！']
  if (stdErr.includes('Timed out')) {
    MSG.push(`连接超时:${stdErr.match(/'(.+?)'/g)[0].replace(/'/g, '')}`)
    return
  }
  if (/Failed to connect|unable to access/g.test(stdErr)) {
    MSG.push(`连接失败：${stdErr.match(/'(.+?)'/g)[0].replace(/'/g, '')}`)
    return MSG
  }
  if (
    stdErr.includes('be overwritten by merge') ||
    stdout.includes('CONFLICT')
  ) {
    MSG.push(`存在冲突：\n${stdErr}`)
    MSG.push('请解决冲突后再更新，或者执行#强制更新，放弃本地修改')
    return MSG
  }
  return MSG
}

/**
 *
 * @param name
 * @returns
 */
const getGitLog = async (name: string) => {
  const Shells = ['git log -100 --pretty="%h||[%cd] %s" --date=format:"%F %T"']
  // 进入插件
  if (name != '') Shells.unshift(`cd "plugins/${name}`)
  // 执行
  const res = await execAsync(Shells.join(' && '))
  if (!res.stdout) {
    return ['记录不存在']
  }
  // 去除前后空格，并转为数组
  const LogArray = res.stdout.trim().split('\n')
  // logs记录
  const Logs: string[] = []
  for (const str of LogArray) {
    const strArr = str.split('||')
    if (strArr[0] == oldCommitId) break
    if (strArr[1].includes('Merge branch')) continue
    if (strArr[1] && strArr[1] !== '') {
      Logs.push(strArr[1])
    }
  }
  // 记录为空
  if (Logs.length <= 0) {
    return ['记录不存在']
  }
  // 记录条数
  const Size = Logs.length
  try {
    const Shell2 = ['git config -l', `cd "plugins/${name}"`]
    const res = await execAsync(Shell2.join(' && '))
    if (res?.stdout) {
      const end = res.stdout
        .match(/remote\..*\.url=.+/g)
        .join('\n\n')
        .replace(/remote\..*\.url=/g, '')
        .replace(/\/\/([^@]+)@/, '//')
      Logs.push(end)
    }
  } catch (error) {
    logger.error(error.toString())
  }
  return {
    msg: Logs,
    docs: `${name || BOT_NAME} 更新日志，共${Size}条`
  }
}

export class Update extends Application<'message'> {
  constructor(e) {
    super('message')
    // event
    if (e) this.e = e
    this.rule = [
      {
        reg: /^(#|\/)更新日志/,
        fnc: this.updateLog.name
      },
      {
        reg: /^(#|\/)(全部)?(静默)?(强制)?更新/,
        fnc: this.mandatoryUpdate.name
      }
    ]
  }

  /**
   * 更新
   * @returns
   */
  async mandatoryUpdate() {
    if (/详细|详情|面板|面版/.test(this.e.msg)) return
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    // 执行锁
    if (lock) {
      this.e.reply('正在更新中..请勿重复操作')
      return
    }
    // 其他指令重合反弹
    if (/详细|详情|面板|面版/.test(this.e.msg)) {
      lock = false
      return
    }
    const name = this.e.msg.replace(/^(#|\/)(全部)?(静默)?(强制)?更新/, '')
    // 更新指定插件
    if (name != '') {
      // 判断插件是否存在
      if (!isPluinName(name)) {
        this.e.reply('插件不存在')
        return
      }
      this.runUpdate(name)
      return
    }
    if (!/全部/.test(this.e.msg)) {
      // 更新本地git
      this.runUpdate('')
      return
    }
    const names = readdirSync(PLUGINS_PATH, { withFileTypes: true })
      .filter(item => !item.isFile() && isPluinName(item.name))
      .map(item => item.name)
    // 更新全部插件,包裹本地应用
    if (isLocalGit()) names.unshift('')
    //
    if (names.length <= 0) {
      this.e.reply('无任何可进行的更新')
      return
    }
    // 并发执行
    names.map(name => this.runUpdate(name))
    return
  }

  /**
   * 运行更新
   * @param plugin
   * @returns
   */
  async runUpdate(pluginName = '') {
    const Shells: string[] = []
    if (pluginName != '') Shells.push(`cd "plugins/${pluginName}"`)
    if (/强制/.test(this.e.msg)) {
      Shells.push('git reset --hard')
      Shells.push('git pull --rebase --allow-unrelated-histories')
    } else {
      Shells.push('git pull --no-rebase')
    }
    // 开始异步行为
    oldCommitId = await getcommitId(pluginName)
    // name
    const Name = pluginName != '' ? pluginName : BOT_NAME
    // 记录
    logger.mark(`开始更新 : ${Name}`)
    // 收集消息
    const msg = [`开始更新 : ${Name}`]
    //
    const res = await execAsync(Shells.join(' && '))
    // 错误
    if (res?.stderr) {
      logger.mark(`更新失败：${Name}`)
      //
      if (!/静默/.test(this.e.msg)) {
        // 发送更新失败
        msg.push(`更新失败:${Name}`)
        const m = getGitErr(res.stderr, res.stdout)
        for (const s of m) {
          msg.push(s)
        }
        const message = await makeForwardMsg(this.e, msg, `${Name} 运行记录`)
        this.e.reply(message)
      }
      // git 错误
      return
    }
    // 得到更新时间
    const time = await getTime(pluginName)
    logger.mark(`最后更新时间：${time}`)
    //
    if (/Already up|已经是最新/g.test(res.stdout)) {
      //
      msg.push(`已是最新:${Name}\nDATE:${time}`)
      //
      if (!/静默/.test(this.e.msg)) {
        console.log('this.e.msg', this.e.msg)
        this.e.reply(await makeForwardMsg(this.e, msg, `${Name} 运行记录`))
      }
      //
    } else {
      //
      if (!/静默/.test(this.e.msg)) {
        // 更新成功
        msg.push(`更新成功:${Name}\nDATE:${time}`)
        const logs = await getGitLog(pluginName)
        if (Array.isArray(logs)) {
          for (const log of logs) {
            msg.push(log)
          }
          this.e.reply(await makeForwardMsg(this.e, msg, `${Name} 运行记录`))
        } else {
          this.e.reply(
            await makeForwardMsg(this.e, [...msg, ...logs.msg], logs.docs)
          )
        }
      }
      //
    }
    return
  }

  /**
   * git 错误
   * @param err
   * @param stdout
   * @returns
   */
  async gitErr(stdErr: string, stdout: string) {
    const MSG = ['更新失败！']
    if (stdErr.includes('Timed out')) {
      MSG.push(`连接超时:${stdErr.match(/'(.+?)'/g)[0].replace(/'/g, '')}`)
      this.e.reply(MSG.join('\n'))
      return
    }
    if (/Failed to connect|unable to access/g.test(stdErr)) {
      MSG.push(`连接失败：${stdErr.match(/'(.+?)'/g)[0].replace(/'/g, '')}`)
      return
    }
    if (
      stdErr.includes('be overwritten by merge') ||
      stdout.includes('CONFLICT')
    ) {
      MSG.push(`存在冲突：\n${stdErr}`)
      MSG.push('请解决冲突后再更新，或者执行#强制更新，放弃本地修改')
      this.e.reply(MSG.join('\n'))
      return
    }
    return
  }

  /**
   * 更新记录
   * @returns
   */
  async updateLog() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const name = this.e.msg.replace(/^(#|\/)更新日志/, '')
    // 空的，本地git不存在
    if (name == '' && !isLocalGit()) {
      this.e.reply('无更新记录')
      return
    }
    const logs = await getGitLog(name)
    if (Array.isArray(logs)) {
      this.e.reply(logs.join('\n'))
      return
    }
    this.e.reply(await makeForwardMsg(this.e, logs.msg, logs.docs))
    return
  }
}
