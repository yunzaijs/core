import inquirer from 'inquirer'
import { trim } from 'lodash-es'
import fetch from 'node-fetch'
import { promisify } from 'util'
import EventListener from './listener.js'
const sleep = promisify(setTimeout)
/**
 * 监听上线事件
 */
let inSlider = false

/**
 *
 */
export class EventLogin extends EventListener {
  /**
   * ？？
   */
  client = null

  /**
   *
   */
  constructor() {
    /**
     *
     */
    super({
      prefix: 'system.login.',
      event: ['qrcode', 'slider', 'device', 'error'],
      once: false
    })
  }

  /**
   *
   * @param event
   */
  async execute() {
    // 不执行插件
  }

  /**
   * 扫码登录现在仅能在同一ip下进行
   * @param event
   */
  async qrcode(_) {
    logger.mark(`\n`)
    logger.mark(`请使用登录当前QQ的手机${logger.chalk.green('扫码')}完成登录`)
    logger.mark(
      `如果显示二维码过期，可以按${logger.chalk.green('回车键（Enter）')}刷新`
    )
    logger.mark(
      `重新输入密码请退出后执行命令：${logger.chalk.green('npm run login')}`
    )
    logger.mark(`\n`)

    // 次数
    let time = 0

    let timeout = null

    const start = async () => {
      // 积累次数
      time++

      // 得到扫码结果
      const res = await this.client.queryQrcodeResult()

      // 成功
      if (res.retcode === 0) {
        inSlider = true

        logger.info(logger.chalk.green('\n扫码成功，开始登录...\n'))

        // 阻塞1秒
        await sleep(1000)

        // 二维码登录
        this.client.qrcodeLogin()
      }

      if (time >= 150) {
        logger.error('等待扫码超时，已停止运行\n')
        process.exit()
      } else {
        timeout = setTimeout(start, 1000 * 3)
      }
    }

    timeout = setTimeout(start, 2000)

    // 未完成
    if (!inSlider) {
      // 刷新二维码
      inquirer
        .prompt({
          type: 'input',
          message: '回车刷新二维码，等待扫码中...\n',
          name: 'enter'
        })
        .then(async () => {
          // 完成登录了
          if (inSlider) return
          // 取消任务
          timeout && clearTimeout(timeout)

          console.log('\n重新刷新二维码...\n\n')

          // 阻塞1秒
          await sleep(1000)

          // 刷新二维码
          this.client.fetchQrcode()
        })
        .catch(() => {
          timeout && clearTimeout(timeout)
        })
    }
  }

  /**
   * 收到滑动验证码提示后，必须使用手机拉动，PC浏览器已经无效
   * @param event
   */
  async slider(event) {
    inSlider = true
    console.log(
      `\n\n------------------${logger.chalk.green(
        '↓↓滑动验证链接↓↓'
      )}----------------------\n`
    )
    console.log(logger.chalk.green(event.url))
    console.log('\n--------------------------------------------------------')
    console.log(
      `提示：打开上面链接获取ticket，可使用${logger.chalk.green(
        '【滑动验证app】'
      )}获取`
    )
    console.log(
      `链接存在${logger.chalk.green(
        '有效期'
      )}，请尽快操作，多次操作失败可能会被冻结`
    )
    console.log(
      '滑动验证app下载地址：https://wwp.lanzouy.com/i6w3J08um92h 密码:3kuu\n'
    )

    const ret = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '触发滑动验证，需要获取ticket通过验证，请选择获取方式:',
        choices: [
          '0.自动获取ticket',
          '1.手动获取ticket',
          '2.滑动验证app请求码获取'
        ]
      }
    ])

    await sleep(200)
    let ticket

    if (ret.type == '0.自动获取ticket') {
      ticket = await this.getTicket(event.url)
      if (!ticket) console.log('\n请求错误，返回手动获取ticket方式\n')
    }

    if (ret.type == '2.滑动验证app请求码获取') {
      ticket = await this.requestCode(event.url)
      if (!ticket) console.log('\n请求错误，返回手动获取ticket方式\n')
    }

    if (!ticket) {
      const res = await inquirer.prompt({
        type: 'input',
        message: '请输入ticket:',
        name: 'ticket',
        validate(value) {
          if (!value) return 'ticket不能为空'
          if (value.toLowerCase() == 'ticket') return '请输入获取的ticket'
          if (value == event.url) return '请勿输入滑动验证链接'
          return true
        }
      })
      ticket = trim(res.ticket, '"')
    }
    global.inputTicket = true
    this.client.submitSlider(ticket.trim())
  }

  /**
   *
   * @param url
   * @returns
   */
  async getTicket(url) {
    const req = `https://hlhs-nb.cn/captcha/slider?key=${Bot.uin}`
    await fetch(req, {
      method: 'POST',
      body: JSON.stringify({ url })
    })

    console.log('\n----请打开下方链接并在2分钟内进行验证----')
    console.log(`${logger.chalk.green(req)}\n----完成后将自动进行登录----`)

    for (let i = 0; i < 40; i++) {
      const res: {
        data?: {
          ticket: null
        }
      } = await fetch(req, {
        method: 'POST',
        body: JSON.stringify({ submit: Bot.uin })
      }).then(res => res.json())
      if (res.data?.ticket) return res.data.ticket
      await sleep(3000)
    }
  }

  /**
   *
   * @param url
   * @returns
   */
  async requestCode(url) {
    const txhelper = {
      req: null,
      res: null,
      code: null,
      url: url.replace('ssl.captcha.qq.com', 'txhelper.glitch.me')
    }
    txhelper.req = await fetch(txhelper.url).catch(err =>
      console.log(err.toString())
    )

    if (!txhelper.req?.ok) return false

    txhelper.req = await txhelper.req.text()
    if (!txhelper.req.includes('使用请求码')) return false

    txhelper.code = /\d+/g.exec(txhelper.req)
    if (!txhelper.code) return false

    console.log(
      `\n请打开滑动验证app，输入请求码${logger.chalk.green(
        '【' + txhelper.code + '】'
      )}，然后完成滑动验证\n`
    )

    await sleep(200)

    //
    await inquirer.prompt({
      type: 'input',
      message: '验证完成后按回车确认，等待在操作中...',
      name: 'enter'
    })

    //
    txhelper.res = await fetch(txhelper.url).catch(err =>
      console.log(err.toString())
    )

    //
    if (!txhelper.res) return false

    //
    txhelper.res = await txhelper.res.text()

    if (!txhelper.res) return false
    if (txhelper.res == txhelper.req) {
      console.log('\n未完成滑动验证')
      return false
    }

    console.log(`\n获取ticket成功：\n${txhelper.res}\n`)
    return trim(txhelper.res)
  }

  /**
   * 设备锁
   * @param event
   */
  async device(event) {
    global.inputTicket = false
    console.log(
      `\n\n------------------${logger.chalk.green(
        '↓↓设备锁验证↓↓'
      )}----------------------\n`
    )
    const ret = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '触发设备锁验证，请选择验证方式:',
        choices: ['1.网页扫码验证', '2.发送短信验证码到密保手机']
      }
    ])

    await sleep(200)

    if (ret.type == '1.网页扫码验证') {
      console.log('\n' + logger.chalk.green(event.url) + '\n')
      console.log('请打开上面链接，完成验证后按回车')
      await inquirer.prompt({
        type: 'input',
        message: '等待操作中...',
        name: 'enter'
      })
      await this.client.login()
    } else {
      console.log('\n')
      this.client.sendSmsCode()
      await sleep(200)
      logger.info(`验证码已发送：${event.phone}\n`)
      let res = await inquirer.prompt({
        type: 'input',
        message: '请输入短信验证码:',
        name: 'sms'
      })
      await this.client.submitSmsCode(res.sms)
    }
  }

  /**
   * 登录错误
   * @param event
   */
  error(event) {
    if (Number(event.code) === 1)
      logger.error('QQ密码错误，运行命令重新登录：npm run login')
    if (global.inputTicket && event.code == 237) {
      logger.error(
        `${logger.chalk.red(
          'ticket'
        )}输入错误或者已失效，已停止运行，请重新登录验证`
      )
    } else if (event?.message.includes('冻结')) {
      logger.error('账号已被冻结，已停止运行')
    } else {
      logger.error('登录错误，已停止运行')
    }
    process.exit()
  }
}
