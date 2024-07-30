import { Plugin } from 'yunzai'

const tips = '退群了'

/**
 * *****
 * 欢迎新人
 * ****
 */
export class newcomer extends Plugin {
  constructor() {
    super({
      name: '欢迎新人',
      event: 'notice.group.increase',
      priority: 5000
    })
  }

  /**
   * 接受到消息都会执行一次
   * @returns
   */
  async accept() {
    /** 定义入群欢迎内容 */
    let msg = '欢迎新人！'
    /** 冷却cd 30s */
    let cd = 30

    if (this.e.user_id == this.e.bot.uin) return

    /** cd */
    let key = `Yz:newcomers:${this.e.group_id}`
    if (await redis.get(key)) return
    redis.set(key, '1', { EX: cd })

    /** 回复 */
    await this.reply([global.segment.at(this.e.user_id), msg])
  }
}

/**
 * ******
 * 退群通知
 * ****
 */
export class outNotice extends Plugin {
  constructor() {
    super({
      name: '退群通知',
      dsc: 'xx退群了',
      event: 'notice.group.decrease'
    })
  }

  /**
   *
   * @returns
   */
  async accept() {
    if (this.e.user_id == this.e.bot.uin) return
    const msg = `${this.e?.user_name ?? ''}(${this.e.user_id}) ${tips}`
    logger.mark(`[退出通知]${this.e.logText} ${msg}`)
    await this.reply(msg)
  }
}
