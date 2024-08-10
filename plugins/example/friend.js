import { ConfigController as cfg } from 'yunzai'
import { Plugin } from 'yunzai'
import { promisify } from 'util'
const sleep = promisify(setTimeout)

/**
 * ******
 * 自动同意好友
 * *****
 */
export class friend extends Plugin {
  constructor() {
    super({
      name: 'autoFriend',
      event: 'request.friend'
    })
  }

  /**
   *
   */
  async accept() {
    if (this.e.sub_type == 'add' || this.e.sub_type == 'single') {
      if (cfg.other.autoFriend == 1) {
        logger.mark(`[自动同意][添加好友] ${this.e.user_id}`)
        await sleep(2000)
        this.e.approve(true)
      }
    }
  }
}
