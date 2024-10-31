import { Application } from 'yunzaijs'
import { makeForwardMsg } from 'yunzaijs'
import { readFileSync } from 'node:fs'
import { slice, isEmpty } from 'lodash-es'
import moment from 'moment'

let lineNum = 100
let maxNum = 1000
let errFile = 'logs/error.log'
let logFile = `logs/command.${moment().format('YYYY-MM-DD')}.log`
let keyWord = null

/**
 *
 * @param logFile
 * @returns
 */
function getLog(logFile: string) {
  const data = readFileSync(logFile, { encoding: 'utf-8' })
  let log = data.split('\n')
  if (keyWord) {
    for (const i in log) if (!log[i].includes(keyWord)) delete log[i]
  } else {
    log = slice(log, (Number(lineNum) + 1) * -1)
  }
  log = log.reverse()
  const tmp = []
  for (let i of log) {
    if (!i) continue
    if (keyWord && tmp.length >= maxNum) return
    i = i.replace(/\x1b[[0-9;]*m/g, '')
    i = i.replace(/\r|\n/, '')
    tmp.push(i)
  }
  return tmp
}

export class SendLog extends Application<'message'> {
  constructor(e) {
    super('message')
    // event
    if (e) this.e = e
    this.rule = [
      {
        reg: /^(#|\/)(运行|错误)*日志[0-9]*(.*)/,
        fnc: this.sendLog.name
      }
    ]
  }

  /**
   *
   * @returns
   */
  async sendLog() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const line = this.e.msg.match(/\d+/g)
    if (line) {
      lineNum = Number(line[0])
    } else {
      keyWord = this.e.msg.replace(/#|\/|运行|错误|日志|\d/g, '')
    }
    let lf = logFile
    let type = '运行'
    if (this.e.msg.includes('错误')) {
      lf = errFile
      type = '错误'
    }
    if (keyWord) type = keyWord
    const log = getLog(lf)
    if (isEmpty(log)) {
      this.e.reply(`暂无相关日志：${type}`)
      return
    }
    const data = await makeForwardMsg(
      this.e,
      [log.join('\n')],
      `最近${log.length}条${type}日志`
    )
    if (typeof data == 'string') {
      this.e.reply(data)
      return
    } else {
      this.e.reply(data)
      return
    }
  }
}
