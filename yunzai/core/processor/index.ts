/**
 * 加工厂是全局的
 * 方便在任何地方都能执行
 */

import { join } from 'path'

class ProcessorCore {
  /**
   *
   */
  #applications = null

  /**
   *
   */
  #middlewares = null

  /**
   *
   */
  #plugins = null

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
   */
  get plugins() {
    return this.#plugins
  }

  /**
   * 输入配置参数
   */
  async install(configdir = 'yunzai.config.js') {
    const js = join(process.cwd(), configdir)
    const config = (await import(`file://${js}`)).default
    this.#applications = config.applications
    this.#middlewares = config.middlewares
    this.#plugins = config.plugins
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
