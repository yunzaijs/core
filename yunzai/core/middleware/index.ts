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
    //
    const middlewares = {}
    // 便利得到目录和文件
    const files = readdirSync(MIDDLEWARE_PATH, { withFileTypes: true }).filter(
      val => !val.isFile()
    )
    //
    for (const file of files) {
      const names = readdirSync(
        `${file?.path ?? file.parentPath}/${file.name}`,
        { withFileTypes: true }
      )
        .filter(val => val.isFile() && /(.js|.ts)$/.test(val.name))
        .map(val => val.name)
      //
      if (names.length > 0) middlewares[file.name] = names
    }
    //
    for (const key in middlewares) {
      //
      for (const name of middlewares[key]) {
        const typing = key as MiddlewareType
        // 消息中间件
        const dir = `file://${join(process.cwd(), MIDDLEWARE_PATH, typing, name)}`
        this.use({
          typing,
          // 中间件名称
          name: `${typing}-${name}`,
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
