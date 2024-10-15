/**
 * **********
 * 配置读取工具
 * **********
 */
import cfg from '../../config/config.js'
/**
 * **********
 * 监听
 * **********
 */
import ListenerLoader from './loader.js'

/**
 * 扩展
 */
import { Client as IcqqClient, type Config } from 'icqq'

/**
 *
 */
export class Client extends IcqqClient {
  /**
   *
   * @param conf
   */
  constructor(conf: Config) {
    super(conf)
  }

  /**
   * 登录机器人
   * @param callBack
   * @returns
   */
  static async run() {
    // 实例化
    const bot = new Client(cfg.bot)

    // 直接全局
    global.Bot = bot

    // 事件监听，传入 实例
    await ListenerLoader.load(bot)

    //
    if (cfg.bot.skip_login || process.argv.includes('--skip')) {
      await this.skip_login(bot)
      return false
    }

    //
    await bot.login(cfg.qq, cfg.pwd)

    // 额外的全局
    if (!global.Bot[bot.uin]) global.Bot[bot.uin] = null
    global.Bot[bot.uin] = bot
    return true
  }

  /**
   * 跳过登录ICQQ
   * @param bot
   * @returns
   */
  static async skip_login(bot: typeof Client.prototype) {
    bot.uin = 88888
    // 额外的全局
    if (!global.Bot[bot.uin]) global.Bot[bot.uin] = null
    global.Bot[bot.uin] = bot
    return
  }
}

/**
 * 机器人客户端
 * 是一个Proxy对象
 */
export const Bot: typeof Client.prototype = new Proxy({} as any, {
  get(_, property) {
    return global.Bot[property]
  }
})
