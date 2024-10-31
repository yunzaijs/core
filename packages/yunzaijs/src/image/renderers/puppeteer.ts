import os from 'node:os'
import { trim, extend } from 'lodash-es'
import puppeteer, { Browser, PuppeteerLaunchOptions } from 'puppeteer'
import cfg from '../../config/config.js'
import { Redis } from '../../init/redis.js'
import { BOT_CHROMIUM_KEY } from '../../config/system.js'
import Renderer from '../renderer/Renderer.js'
const _path = process.cwd()
/**
 * mac地址
 */
let mac = ''
/**
 * 这是被废弃的截图工具
 * ***********
 * 请阅读puppeteer了解制作截图工具
 * @deprecated 已废弃
 */
export default class Puppeteer extends Renderer {
  browser: false | Browser = false
  lock = false
  shoting = []
  /** 截图数达到时重启浏览器 避免生成速度越来越慢 */
  restartNum = 100
  /** 截图次数 */
  renderNum = 0
  config = null
  puppeteerTimeout = null
  browserMacKey = null

  /**
   *
   * @param config
   */
  constructor(
    config?: PuppeteerLaunchOptions & {
      chromiumPath?: string
      puppeteerWS?: any
      puppeteerTimeout?: any
    }
  ) {
    super({
      id: 'puppeteer',
      type: 'image',
      render: 'screenshot'
    })
    // 配置
    this.config = {
      headless: config.headless || 'new',
      args: config.args || [
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--no-zygote'
      ],
      executablePath:
        config?.chromiumPath ??
        config?.executablePath ??
        cfg?.bot?.chromium_path ??
        null,
      wsEndpoint: config?.puppeteerWS ?? cfg?.bot?.puppeteer_ws ?? 0,
      puppeteerTimeout:
        config?.puppeteerTimeout ?? cfg?.bot?.puppeteer_timeout ?? 0
    }
  }

  /**
   * 初始化chromium
   * @returns
   */
  async browserInit() {
    if (this.browser) return this.browser
    if (this.lock) return false
    this.lock = true

    logger.info('puppeteer Chromium 启动中...')

    let connectFlag = false
    try {
      // 获取Mac地址
      if (!mac) {
        mac = this.getMac()
        this.browserMacKey = `${BOT_CHROMIUM_KEY}browserWSEndpoint:${mac}`
      }
      // 是否有browser实例
      const browserUrl =
        (await Redis.get(this.browserMacKey)) || this.config.wsEndpoint
      if (browserUrl) {
        try {
          const browserWSEndpoint = await puppeteer.connect({
            browserWSEndpoint: browserUrl
          })
          // 如果有实例，直接使用
          if (browserWSEndpoint) {
            this.browser = browserWSEndpoint
            connectFlag = true
          }
          logger.info(`puppeteer Chromium 连接成功 ${browserUrl}`)
        } catch (err) {
          await Redis.del(this.browserMacKey)
        }
      }
    } catch (err) {}

    if (!this.browser || !connectFlag) {
      const Error = (err: any, trace: any) => {
        let errMsg = err.toString() + (trace ? trace.toString() : '')
        if (typeof err == 'object') {
          logger.error(JSON.stringify(err))
        } else {
          logger.error(err.toString())
          if (errMsg.includes('Could not find Chromium')) {
            logger.error('没有正确安装 Chromium..')
          } else if (errMsg.includes('cannot open shared object file')) {
            logger.error('没有正确安装 Chromium 运行库')
          }
        }
        logger.error(err, trace)
        return false
      }

      // 如果没有实例，初始化puppeteer
      this.browser = (await puppeteer
        .launch(this.config)
        .catch(Error as any)) as any
    }

    this.lock = false

    if (!this.browser) {
      logger.error('puppeteer Chromium 启动失败')
      return false
    }
    if (!connectFlag) {
      logger.info(`puppeteer Chromium 启动成功 ${this.browser.wsEndpoint()}`)
      if (this.browserMacKey) {
        // 缓存一下实例30天
        const expireTime = 60 * 60 * 24 * 30
        await Redis.set(this.browserMacKey, this.browser.wsEndpoint(), {
          EX: expireTime
        })
      }
    }

    /** 监听Chromium实例是否断开 */
    this.browser.on('disconnected', () => this.restart(true))

    return this.browser
  }

  /**
   * 获取Mac地址
   * @returns
   */
  getMac() {
    let mac = '00:00:00:00:00:00'
    try {
      const network = os.networkInterfaces()
      let macFlag = false
      for (const a in network) {
        for (const i of network[a]) {
          if (i.mac && i.mac !== mac) {
            macFlag = true
            mac = i.mac
            break
          }
        }
        if (macFlag) {
          break
        }
      }
    } catch (e) {}
    mac = mac.replace(/:/g, '')
    return mac
  }

  /**
   * `chromium` 截图
   * @param name
   * @param data 模板参数
   * @param data.tplFile 模板路径，必传
   * @param data.saveId  生成html名称，为空name代替
   * @param data.imgType  screenshot参数，生成图片类型：jpeg，png
   * @param data.quality  screenshot参数，图片质量 0-100，jpeg是可传，默认90
   * @param data.omitBackground  screenshot参数，隐藏默认的白色背景，背景透明。默认不透明
   * @param data.path   screenshot参数，截图保存路径。截图图片类型将从文件扩展名推断出来。如果是相对路径，则从当前路径解析。如果没有指定路径，图片将不会保存到硬盘。
   * @param data.multiPage 是否分页截图，默认false
   * @param data.multiPageHeight 分页状态下页面高度，默认4000
   * @param data.pageGotoParams 页面goto时的参数
   * @return img 不做segment包裹
   */
  async screenshot(name: string, data: any = {}) {
    if (!(await this.browserInit())) return false
    const pageHeight = data.multiPageHeight || 4000

    const savePath = this.dealTpl(name, data)
    if (!savePath) return false

    let buff: any = ''
    const start = Date.now()

    let ret = []
    this.shoting.push(name)

    const puppeteerTimeout = this.puppeteerTimeout
    let overtime
    if (puppeteerTimeout > 0) {
      // TODO 截图超时处理
      overtime = setTimeout(() => {
        if (this.shoting.length) {
          logger.error(
            `[图片生成][${name}] 截图超时，当前等待队列：${this.shoting.join(
              ','
            )}`
          )
          this.restart(true)
          this.shoting = []
        }
      }, puppeteerTimeout)
    }

    if (!this.browser) return

    try {
      const page = await this.browser.newPage()
      const pageGotoParams = extend(
        { timeout: 120000 },
        data.pageGotoParams || {}
      )
      await page.goto(`file://${_path}${trim(savePath, '.')}`, pageGotoParams)
      const body = (await page.$('#container')) || (await page.$('body'))

      // 计算页面高度
      const boundingBox = await body.boundingBox()
      // 分页数
      let num = 1

      const randData = {
        type: data.imgType || 'jpeg',
        omitBackground: data.omitBackground || false,
        quality: data.quality || 90,
        path: data.path || ''
      }

      if (data.multiPage) {
        randData.type = 'jpeg'
        num = Math.round(boundingBox.height / pageHeight) || 1
      }

      if (data.imgType === 'png') {
        delete randData.quality
      }

      if (!data.multiPage) {
        buff = await body.screenshot(randData)
        if (buff instanceof Uint8Array) buff = Buffer.from(buff)
        this.renderNum++
        /** 计算图片大小 */
        const kb = (buff.length / 1024).toFixed(2) + 'KB'
        logger.mark(
          `[图片生成][${name}][${this.renderNum}次] ${kb} ${logger.green(
            `${Date.now() - start}ms`
          )}`
        )
        ret.push(buff)
      } else {
        // 分片截图
        if (num > 1) {
          await page.setViewport({
            width: boundingBox.width,
            height: pageHeight + 100
          })
        }
        for (let i = 1; i <= num; i++) {
          if (i !== 1 && i === num) {
            await page.setViewport({
              width: boundingBox.width,
              height: boundingBox.height - pageHeight * (num - 1)
            })
          }
          if (i !== 1 && i <= num) {
            await page.evaluate(
              pageHeight => window.scrollBy(0, pageHeight),
              pageHeight
            )
          }
          if (num === 1) {
            buff = await body.screenshot(randData)
          } else {
            buff = await page.screenshot(randData)
          }

          if (buff instanceof Uint8Array) buff = Buffer.from(buff)

          if (num > 2) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          this.renderNum++

          /** 计算图片大小 */
          const kb = (buff.length / 1024).toFixed(2) + 'KB'
          logger.mark(`[图片生成][${name}][${i}/${num}] ${kb}`)
          ret.push(buff)
        }
        if (num > 1) {
          logger.mark(`[图片生成][${name}] 处理完成`)
        }
      }
      page.close().catch(err => logger.error(err))
    } catch (err) {
      logger.error(`[图片生成][${name}] 图片生成失败`, err)
      /** 关闭浏览器 */
      this.restart(true)
      if (overtime) clearTimeout(overtime)
      ret = []
      return false
    } finally {
      if (overtime) clearTimeout(overtime)
    }

    this.shoting.pop()

    if (ret.length === 0 || !ret[0]) {
      logger.error(`[图片生成][${name}] 图片生成为空`)
      return false
    }

    this.restart()
    return data.multiPage ? ret : ret[0]
  }

  /**
   * 重启
   * @param force
   * @returns
   */
  restart(force = false) {
    /** 截图超过重启数时，自动关闭重启浏览器，避免生成速度越来越慢 */
    if (!this.browser) return
    if (!this.browser?.close || this.lock) return
    if (!force)
      if (this.renderNum % this.restartNum !== 0 || this.shoting.length > 0)
        return
    logger.info(`puppeteer Chromium ${force ? '强制' : ''}关闭重启...`)
    this.stop(this.browser)
    this.browser = false
    return this.browserInit()
  }

  /**
   * 停止
   * @param browser
   */
  async stop(browser: Browser) {
    try {
      await browser.close()
    } catch (err) {
      logger.error('puppeteer Chromium 关闭错误', err)
    }
  }
}
