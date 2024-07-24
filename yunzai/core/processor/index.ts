/**
 * 加工厂是全局的
 * 方便在任何地方都能执行
 */

import { join } from 'path'
import { ConifigOptions } from '../options/types.js'

class ProcessorCore {
  /**
   *
   */
  #applications: ConifigOptions['applications'] = null

  /**
   *
   */
  #middlewares: ConifigOptions['middlewares'] = null

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
   * 输入配置参数
   */
  async install(configdir = 'yunzai.config.js') {
    const jsDir = join(process.cwd(), configdir)
    const config: ConifigOptions = (
      await import(`file://${jsDir}?t=${Date.now()}`)
    ).default
    this.#applications = config.applications
    this.#middlewares = config.middlewares
    if (Array.isArray(this.#applications)) {
      for (const app of this.#applications) {
        if (typeof app?.create == 'function') app.create(config)
      }
    }
  }

  //
}

/**
 *
 */
export const Processor = new ProcessorCore()
