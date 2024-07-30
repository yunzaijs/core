import { Bot, ConfigController as cfg } from 'yunzai'
import { Plugin } from 'yunzai'

/**
 * *****
 * 主人邀请自动进群
 * *****
 */

export class invite extends Plugin {
  constructor() {
    super({
      name: 'invite',
      event: 'request.group.invite'
    })
  }

  /**
   *
   * @returns
   */
  async accept() {
    if (
      !cfg.other.masterQQ ||
      !cfg.other.masterQQ.includes(Number(this.e.user_id))
    ) {
      logger.mark(`[邀请加群]：${this.e.group_name}：${this.e.group_id}`)
      return
    }
    logger.mark(`[主人邀请加群]：${this.e.group_name}：${this.e.group_id}`)
    //
    this.e.approve(true)
    /**
     *  Bot
     */
    Bot.sendPrivateMsg(
      this.e.user_id,
      `已同意加群：${this.e.group_name}`
    ).catch(err => {
      logger.error(err)
    })
  }
}
