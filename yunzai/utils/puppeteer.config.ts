import { type PuppeteerLaunchOptions } from 'puppeteer'
import { BaseConfig } from './config.js'

/**
 * 全局Puppeteer初始化配置控制器
 * **************
 * 修改此处，在运行时
 * 如果发生从新初始化的无头浏览器
 * 该无头浏览器将以此配置作为初始化
 * **************
 * 非必要请勿修改此处
 */
export const PuppeteerLunchConfig = new BaseConfig<PuppeteerLaunchOptions>({
  // 禁用超时
  timeout: 0, //otocolTimeout: 0,
  // 请求头
  headless: true,
  //
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    '--single-process'
  ]
  // executablePath: ''
  // BOT浏览器默认尺寸 753 X 1180
})
