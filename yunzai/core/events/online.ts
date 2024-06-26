import EventListener from './listener.js'
import cfg from '../../config/config.js'
import { relpyPrivate } from '../app/common.js'
import { BOT_NAME, REDIS_BOT_LOGIN_KEY } from '../../config/system.js'
import pluginsLoader from '../plugins/loader.js'

/**
 * 监听上线事件
 */
export class EventOnline extends EventListener {
  /**
   *
   */
  constructor() {
    /**
     *
     */
    super({
      event: 'system.online',
      once: true
    })
  }

  /**
   * 默认方法
   * @param e
   */
  async execute() {
    /**
     * 在线后执行
     */

    /**
     * 解析插件
     */
    await pluginsLoader.load()
    /**
     *
     */
    logger.mark('----^_^----')
    logger.mark(logger.chalk.green(`${BOT_NAME} V${cfg.package.version} 上线~`))

    /**
     * 上线通知
     */

    if (!cfg.bot.online_msg) return

    const masterQQ = cfg.other.masterQQ

    /**
     *
     */
    if (!masterQQ || !masterQQ[0]) return

    /**
     *
     */
    const key = `${REDIS_BOT_LOGIN_KEY}:${global.Bot.uin}`

    /**
     *
     */
    if (await redis.get(key)) return

    /**
     *
     */
    const msg = `欢迎使用【${BOT_NAME} V${cfg.package.version} 】`

    /**
     *
     */
    redis.set(key, '1', { EX: cfg.bot.online_msg_exp })

    /**
     *
     */
    setTimeout(() => {
      // 私聊发送消息
      relpyPrivate(masterQQ[0], msg)

      //
    }, 1000)

    //
  }
}
