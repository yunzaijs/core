import EventListener from './listener.js'
import cfg from '../../config/config.js'
import { relpyPrivate } from '../app/common.js'
import { BOT_NAME, BOT_LOGIN_KEY } from '../../config/system.js'
import { levelStorage } from '../../db/local.js'

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
    const online_msg_exp = cfg.bot?.online_msg_exp ?? 86400
    let val = 0
    try {
      const str = await levelStorage.get(key).then(res => res.toString()).catch(() => '0')
      const n = Number(str)
      val = isNaN(n) ? 0 : n
    } catch {
      //
    }
    const NowTime = Date.now()
    const size = val + online_msg_exp * 1000
    // 没到时间
    if (val !== 0 && size > NowTime) return
    // 发送消息并做标记
    const msg = `欢迎使用【${BOT_NAME} V${cfg.package.version} 】`
    levelStorage.put(key, `${NowTime}`)
    setTimeout(() => {
      // 私聊发送消息
      relpyPrivate(masterQQ[0], msg)
      //
    }, 1000)
    //
  }
}
