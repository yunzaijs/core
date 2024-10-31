import fetch from 'node-fetch'
import EventListener from './listener.js'
import cfg from '../../config/config.js'
import { BOT_NAME } from '../../config/system.js'

/**
 * 监听下线事件
 */
export class EventOffline extends EventListener {
  /**
   *
   */
  constructor() {
    /**
     *
     */
    super({ event: 'system.offline' })
  }

  /**
   * 默认方法
   * @param e
   */
  async execute(e) {
    //

    logger.mark('掉线了')
    const config = cfg.getConfig('notice')
    const title = `${BOT_NAME}(${Bot.nickname})已离线，请关注`

    /**
     *
     */
    if (config.iyuu) {
      await fetch(
        `https://iyuu.cn/${config.iyuu}.send?text=${title}&desp=${e.message}`
      )
    }

    /**
     *
     */
    if (config.sct) {
      await fetch(
        `https://sctapi.ftqq.com/${config.sct}.send?title=${title}&content=${e.message}`
      )
    }

    /**
     *
     */
    if (config.feishu_webhook) {
      /**
       *
       */
      await fetch(config.feishu_webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msg_type: 'post',
          content: {
            post: {
              'zh-cn': {
                title: title,
                content: [
                  [
                    {
                      tag: 'text',
                      text: e.message
                    }
                  ]
                ]
              }
            }
          }
        })
      })

      /**
       *
       */
    }
  }
}
