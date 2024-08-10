import { ConfigController as cfg } from 'yunzai'
import { Plugin } from 'yunzai'

/**
 * *****
 * 自动退群
 * ****
 */

export class quit extends Plugin {
  constructor() {
    super({
      name: 'notice',
      event: 'notice.group.increase'
    })
  }

  /**
   *
   * @returns
   */
  async accept() {
    if (this.e.user_id != this.e.bot.uin) return
    //
    let other = cfg.other
    //
    if (other.autoQuit <= 0) return
    // 判断主人，主人邀请不退群
    let gl = await this.e.group.getMemberMap()
    for (let qq of cfg.other.masterQQ) {
      if (gl.has(Number(qq))) {
        logger.mark(`[主人拉群] ${this.e.group_id}`)
        return
      }
    }
    // 自动退群
    if (Array.from(gl).length <= other.autoQuit && !this.e.group.is_owner) {
      await this.e.reply('禁止拉群，已自动退出')
      logger.mark(`[自动退群] ${this.e.group_id}`)
      setTimeout(() => {
        this.e.group.quit()
      }, 2000)
    }
  }
}
