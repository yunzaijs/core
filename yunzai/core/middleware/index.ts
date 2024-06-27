import { join } from 'path'
import { MIDDLEWARE_PATH } from '../../config/system.js'

/**
 * 中间件类型
 */
export type MiddlewareType = 'event' | 'message'

class Middleware {
  #data = {
    event: new Map(),
    message: new Map()
  }

  /**
   * 载入中间件
   * @param middlewares
   */
  async install(middlewares: { [key: string]: string[] }) {
    for (const key in middlewares) {
      for (const name of middlewares[key]) {
        const typing = key as MiddlewareType
        // 消息中间件
        const dir = `file://${join(process.cwd(), MIDDLEWARE_PATH, typing, `${name}.ts`)}`
        this.use({
          typing,
          // 中间件名称
          name: `yunzai-${name}`,
          // 植入
          val: (await import(dir)).default
        })
        //
      }
      //
    }
  }

  /**
   * 插入中间件
   */
  use(plugin: { typing: MiddlewareType; name: string; val: any }) {
    this.#data[plugin.typing].set(plugin.name, plugin.val)
  }

  /**
   *
   * @returns
   */
  value(typing: MiddlewareType) {
    return this.#data[typing]
  }
}

/**
 * 被存储的中间件
 */
export const MiddlewareStore = new Middleware()
