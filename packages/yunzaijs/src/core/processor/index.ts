import { join } from 'path'
import { existsSync } from 'fs'
import { createRequire } from 'module'
import {
  ApplicationOptions,
  ConifigOptions,
  MiddlewareOptoins
} from '@/core/options/types.js'

const require = createRequire(import.meta.url)

class ProcessorCore {
  /**
   *
   */
  #applications: ApplicationOptions[] = []

  /**
   *
   */
  #middlewares: MiddlewareOptoins[] = []

  /**
   * 用于判断是否已经存在
   * 确保不会重复加载
   */
  #names = {}

  /**
   *
   */
  get applications() {
    return this.#applications
  }

  /**
   *
   */
  get middlewares() {
    return this.#middlewares
  }

  /**
   *
   * @param configdir
   */
  async #installOnJson(configdir: string) {
    const jsonDir = join(process.cwd(), configdir)
    if (!existsSync(jsonDir)) return
    const config = require(jsonDir)
    if (Array.isArray(config.middlewares)) {
      for (const mw of config.middlewares) {
        if (typeof mw == 'string') {
          // 判断是否已经存在
          if (this.#names[mw]) continue
          this.#names[mw] = true

          try {
            const strMW = await import(mw)
            this.#middlewares.push(strMW.default())
          } catch (e) {
            console.error(e)
          }
        } else {
          console.error('中间件配置错误', mw)
        }
      }
    }
    //
    if (Array.isArray(config.applications)) {
      for (const application of config.applications) {
        if (typeof application == 'string') {
          // 判断是否已经存在
          if (this.#names[application]) continue
          this.#names[application] = true
          try {
            const strApp = await import(application)
            const app = strApp?.default()
            if (typeof app?.create == 'function') app.create(config)
            this.#applications.push(app)
          } catch (e) {
            console.error(e)
          }
        } else {
          console.error('应用配置错误', application)
        }
      }
    }
  }

  /**
   *
   * @param configdir
   * @returns
   */
  async #installOnJs(configdir: string) {
    const jsDir = join(process.cwd(), configdir)
    if (!existsSync(jsDir)) return
    //
    const config: ConifigOptions = (
      await import(`file://${jsDir}?t=${Date.now()}`)
    ).default
    //
    if (Array.isArray(config.middlewares)) {
      for (const mw of config.middlewares) {
        if (typeof mw == 'string') {
          // 判断是否已经存在
          if (this.#names[mw]) continue
          this.#names[mw] = true
          try {
            const strMW = await import(mw)
            this.#middlewares.push(strMW.default())
          } catch (e) {
            console.error(e)
          }
        } else {
          this.#middlewares.push(mw)
        }
      }
    }
    //
    if (Array.isArray(config.applications)) {
      for (const application of config.applications) {
        if (typeof application == 'string') {
          // 判断是否已经存在
          if (this.#names[application]) continue
          this.#names[application] = true
          try {
            const strApp = await import(application)
            const app = strApp?.default()
            if (typeof app?.create == 'function') app.create(config)
            this.#applications.push(app)
          } catch (e) {
            console.error(e)
          }
        } else {
          if (typeof application?.create == 'function')
            application.create(config)
          this.#applications.push(application)
        }
      }
    }
  }

  /**
   * 输入配置参数
   */
  async install(
    configdir: string[] | string = ['yunzai.config.js', 'yunzai.config.json']
  ) {
    // init
    this.#applications = []
    // init
    this.#middlewares = []
    // init
    this.#names = {}
    // start
    if (!Array.isArray(configdir)) {
      if (/.(js|ts)$/.test(configdir)) {
        this.#installOnJs(configdir)
      } else if (/.json$/.test(configdir)) {
        this.#installOnJson(configdir)
      }
    } else {
      for (const dir of configdir) {
        if (/.(js|ts)$/.test(dir)) {
          this.#installOnJs(dir)
        } else if (/.json$/.test(dir)) {
          this.#installOnJson(dir)
        }
      }
    }
    //
  }
}

export const Processor = new ProcessorCore()
