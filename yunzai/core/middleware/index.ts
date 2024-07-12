import { join } from 'path'
import { MIDDLEWARE_PATH } from '../../config/system.js'
import { readdirSync } from 'fs'

/**
 * 中间件类型
 */
export type MiddlewareType = 'event' | 'message'

/**
 *
 */
class Middleware {
  #data = {
    event: new Map(),
    message: new Map()
  }

  /**
   * 载入中间件
   * @param middlewares
   */
  async install() {
    const js = join(process.cwd(), 'yunzai.config.js')
    const config = (await import(`file://${js}`)).default
    const middleware = config.middlewares
    for (const item of middleware) {
      this.use({
        typing: item.typing,
        // 中间件名称
        name: `${item.typing}-${item.name}`,
        // 植入
        val: item
      })
    }
  }

  /**
   * 插入中间件
   */
  use(plugin: { typing: MiddlewareType; name: string; val: any }) {
    this.#data[plugin.typing].set(plugin.name, plugin.val)
    logger.info('加载中间件:', plugin.name)
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
