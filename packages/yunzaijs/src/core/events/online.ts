import EventListener from '@/core/events/listener.js'
import cfg from '@/config/config.js'
import { relpyPrivate } from '@/core/app/common.js'
import { BOT_NAME, BOT_LOGIN_KEY } from '@/config/system.js'
import { Redis } from '@/init/redis.js'
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
    logger.mark(BOT_NAME, logger.chalk.green(`V${cfg.package.version}`), '上线')
    // 没上线消息
    if (!cfg.bot.online_msg) return
    const masterQQ = cfg.other.masterQQ
    // 没主人
    if (!masterQQ || !masterQQ[0]) return
    const key = `${BOT_LOGIN_KEY}:${global.Bot.uin}`
    if (await Redis.get(key)) return
    const msg = `欢迎使用【${BOT_NAME} V${cfg.package.version} 】`
    Redis.set(key, '1', { EX: cfg.bot.online_msg_exp })
    setTimeout(() => {
      // 私聊发送消息
      relpyPrivate(masterQQ[0], msg)
    }, 1000)
  }
}
