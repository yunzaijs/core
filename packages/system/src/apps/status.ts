import { Application, ConfigController as cfg } from 'yunzaijs'
import moment from 'moment'

class Count {
  //
  date = null
  //
  month = null
  //
  key = null
  //
  msgKey = null
  //
  screenshotKey = null
  /**
   *
   * @param groupId
   * @returns
   */
  async getCount(groupId: number | string = '') {
    this.date = moment().format('MMDD')
    this.month = Number(moment().month()) + 1
    this.key = 'Yz:count:'
    if (groupId) {
      this.key += `group:${groupId}:`
    }
    this.msgKey = {
      day: `${this.key}sendMsg:day:`,
      month: `${this.key}sendMsg:month:`
    }
    this.screenshotKey = {
      day: `${this.key}screenshot:day:`,
      month: `${this.key}screenshot:month:`
    }
    let week = {
      msg: 0,
      screenshot: 0
    }
    for (let i = 0; i <= 6; i++) {
      const date = moment().startOf('week').add(i, 'days').format('MMDD')
      week.msg += Number(await redis.get(`${this.msgKey.day}${date}`)) ?? 0
      week.screenshot +=
        Number(await redis.get(`${this.screenshotKey.day}${date}`)) ?? 0
    }
    let count = {
      total: {
        msg: (await redis.get(`${this.key}sendMsg:total`)) || 0,
        screenshot: (await redis.get(`${this.key}screenshot:total`)) || 0
      },
      today: {
        msg: (await redis.get(`${this.msgKey.day}${this.date}`)) || 0,
        screenshot:
          (await redis.get(`${this.screenshotKey.day}${this.date}`)) || 0
      },
      week,
      month: {
        msg: (await redis.get(`${this.msgKey.month}${this.month}`)) || 0,
        screenshot:
          (await redis.get(`${this.screenshotKey.month}${this.month}`)) || 0
      }
    }
    let msg = ''
    if (groupId) {
      msg = `\n发送消息：${count.today.msg}条`
      msg += `\n生成图片：${count.today.screenshot}次`
    } else {
      msg = `\n发送消息：${count.total.msg}条`
      msg += `\n生成图片：${count.total.screenshot}次`
    }
    if (Number(count.month.msg) > 200) {
      msg += '\n-------本周-------'
      msg += `\n发送消息：${count.week.msg}条`
      msg += `\n生成图片：${count.week.screenshot}次`
    }
    if (Number(moment().format('D')) >= 8 && Number(count.month.msg) > 400) {
      msg += '\n-------本月-------'
      msg += `\n发送消息：${count.month.msg}条`
      msg += `\n生成图片：${count.month.screenshot}次`
    }
    return msg
  }
}

export class Status extends Application<'message'> {
  constructor(e) {
    super('message')
    // event
    if (e) this.e = e
    this.rule = [
      {
        reg: /^(#|\/)状态$/,
        fnc: this.status.name
      }
    ]
  }

  /**
   * 状态
   * @returns
   */
  async status() {
    // 是主人
    if (this.e.isMaster) return await this.statusMaster()
    // 不是主人，不能在私聊中查看
    if (!this.e.isGroup) {
      this.e.reply('请群聊查看')
      return
    }
    return await this.statusGroup()
  }

  /**
   *
   */
  async statusMaster() {
    const runTime = moment().diff(
      moment.unix(this.e.bot.stat.start_time),
      'seconds'
    )
    const Day = Math.floor(runTime / 3600 / 24)
    const Hour = Math.floor((runTime / 3600) % 24)
    const Min = Math.floor((runTime / 60) % 60)
    let data = ''
    if (Day > 0) {
      data = `${Day}天${Hour}小时${Min}分钟`
    } else {
      data = `${Hour}小时${Min}分钟`
    }
    const format = bytes => {
      return (bytes / 1024 / 1024).toFixed(2) + 'MB'
    }
    const CON = new Count()
    let msg = '-------状态-------'
    msg += `\n运行时间：${data}`
    msg += `\n内存使用：${format(process.memoryUsage().rss)}`
    msg += `\n当前版本：v${cfg.package.version}`
    msg += '\n-------累计-------'
    msg += await CON.getCount()
    await this.e.reply(msg)
  }

  /**
   *
   */
  async statusGroup() {
    const CON = new Count()
    const msg = await CON.getCount(this.e.group_id)
    await this.e.reply(`-------状态-------${msg}`)
  }
}
