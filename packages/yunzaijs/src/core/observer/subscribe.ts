import { getEventPostType } from '@/core/client/event.js'
import { EventEmun } from '@/core/types.js'
import { middlewareStack } from '@/core/observer/stack.js'
/**
 * 订阅
 */
export class Observer<T extends keyof EventEmun> {
  #event: T = 'message.group' as T

  /**
   * 初始化配置
   * @param init
   */
  constructor(event?: T) {
    this.#event = event
  }

  /**
   *
   * @param key
   * @param middleware
   */
  use(
    middleware: (
      e: Parameters<EventEmun[T]>[0],
      next: Function,
      close: Function
    ) => any,
    keys: [number | string, number | string] | [string | number]
  ) {
    const Type = getEventPostType(this.#event)
    switch (keys.length) {
      case 1: {
        if (keys[0]) {
          const KEY = `${keys[0]}:${Type}`
          if (!middlewareStack[KEY]) middlewareStack[KEY] = []
          middlewareStack[KEY].push(middleware)
        }
        break
      }
      case 2: {
        if (keys[0] && keys[1]) {
          const KEY = `${keys[0]}:${keys[1]}:${Type}`
          if (!middlewareStack[KEY]) middlewareStack[KEY] = []
          middlewareStack[KEY].push(middleware)
        }
        break
      }
      default: {
        //
      }
    }
  }
}
