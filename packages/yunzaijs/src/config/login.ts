import { readFileSync, writeFileSync } from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'
import {
  BOT_NAME,
  CONFIG_DEFAULT_PATH,
  CONFIG_INIT_PATH,
} from './system.js'
import cfg from './config.js'
import { join } from 'path'
import { promisify } from 'util'
const sleep = promisify(setTimeout)
/**
 * 创建登录配置询问输入流
 * Git Bash 运行npm命令会无法选择列表
 * @returns
 */
export async function createLogin() {
  /**
   * 跳过登录ICQQ
   */
  if (cfg.bot.skip_login || process.argv.includes('--skip')) return false
  /**
   * 是否登录
   */
  const T = process.argv.includes('login') || process.argv.includes('--login') || process.argv.includes('--relogin')
  /**
   * qq 存在且不是登录
   */
  if (cfg.qq && !T) return true
  /**
   *
   */
  logger.info(
    `欢迎使用${chalk.green(`${BOT_NAME} V${cfg.package.version}`)}\n请按提示输入完成QQ配置`
  )
  /**
   *
   */
  const propmtList = [
    {
      type: 'Input',
      message: '请输入机器人QQ号(建议用小号)：',
      name: 'QQ',
      validate(value: string) {
        if (/^[1-9][0-9]{4,14}$/.test(value)) return true
        return '请输入正确的QQ号'
      }
    },
    {
      type: process.platform == 'win32' ? 'Input' : 'password',
      message: '请输入登录密码(为空则扫码登录)：',
      name: 'pwd'
    },
    {
      type: 'list',
      message: '请选择登录端口：',
      name: 'platform',
      default: '6',
      choices: ['Tim', 'iPad', '安卓手机', '安卓手表', 'MacOS', 'aPad'],
      filter: (val: string) => {
        switch (val) {
          case 'Tim':
            return 6
          case 'iPad':
            return 5
          case 'MacOS':
            return 4
          case '安卓手机':
            return 1
          case '安卓手表':
            return 3
          case 'aPad':
            return 2
          default:
            return 6
        }
      }
    }
  ]
  /**
   * 不是重新登录
   */
  if (!process.argv.includes('login')) {
    propmtList.push({
      type: 'Input',
      message: '请输入主人QQ号：',
      name: 'masterQQ'
    })
  }
  /**
   * 新签名
   */
  propmtList.push({
    type: 'input',
    message: '请输入签名API地址（可留空）：',
    name: 'signAPI'
  })
  /**
   *
   */
  const ret = await inquirer.prompt(propmtList)

  /**
   * 
   */
  if (!ret) {
    logger.error("额外状况退出。。。")
    process.exit(2)
  }


  /**
   * 读取配置
   */
  let qq = readFileSync(join(CONFIG_DEFAULT_PATH, 'qq.yaml'), 'utf8')

  qq = qq.replace(/qq:/g, 'qq: ' + ret.QQ)
  qq = qq.replace(/pwd:/g, `pwd:  '${ret.pwd}'`)
  qq = qq.replace(/platform: [1-6]/g, 'platform: ' + Number(ret.platform))

  // 写入
  writeFileSync(join(CONFIG_INIT_PATH, 'qq.yaml'), qq, 'utf8')


  /**
   * 读取配置
   */
  let bot = readFileSync(join(CONFIG_DEFAULT_PATH, 'bot.yaml'), 'utf8')
  if (ret.signAPI) {
    bot = bot.replace(/sign_api_addr:/g, `sign_api_addr: ${ret.signAPI}`)
  }

  /**
   * 
   */
  writeFileSync(join(CONFIG_INIT_PATH, 'bot.yaml'), bot, 'utf8')

  /**
   *
   */
  if (ret.masterQQ) {
    // 修改主人QQ配置
    let other = readFileSync(join(CONFIG_DEFAULT_PATH, 'other.yaml'), 'utf8')
    other = other.replace(/masterQQ:/g, `masterQQ:\n  - ${ret.masterQQ}`)
    writeFileSync(join(CONFIG_INIT_PATH, 'other.yaml'), other, 'utf8')
  }


  logger.info(
    `\nQQ配置完成，正在登录\n后续修改账号可以运行命令： ${chalk.green('npm run login')}\n`
  )

  /**
   * 阻塞2秒
   */
  await sleep(2000)

  return true
}
