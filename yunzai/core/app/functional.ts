import { EventType } from '../types.js'
import { Plugin } from './plugin.js'
import { EventMap, PrivateMessageEvent, DiscussMessageEvent } from 'icqq'

// 可去除的keys
type OmitKeys<T, K extends keyof T> = {
  [Key in keyof T as Key extends K ? never : Key]: T[Key]
}

// 去除 'message.group' 键
type PersonWithoutEmail = OmitKeys<EventMap, 'message.group' | 'message'>

// 扩展
interface EventEmun extends PersonWithoutEmail {
  'message.group': (event: EventType) => void
  'message': (
    event: EventType
  ) => void | PrivateMessageEvent | DiscussMessageEvent
}

/**
 * 消息
 */
export class Messages<T extends keyof EventEmun> {
  #init: {
    event: T
    priority?: number
  } = {
    event: 'message.group' as T,
    priority: 9999
  }

  /**
   * 初始化配置
   * @param init
   */
  constructor(init?: { event?: T; priority?: number }) {
    for (const key in init) {
      // 存在的才能获取
      if (Object.prototype.hasOwnProperty.call(this.#init, key)) {
        this.#init[key] = init[key]
      }
    }
  }

  #count = 0
  #rule: {
    reg: RegExp
    fnc: string
  }[] = []

  /**
   *
   * @param reg
   * @param fnc
   */
  response(
    reg: RegExp,
    fnc: (
      ...arg: Parameters<EventEmun[T]>
    ) => Promise<boolean | undefined | void>
  ) {
    this.#count++
    const propName = `prop_${this.#count}`
    this[propName] = fnc
    this.#rule.push({
      reg,
      fnc: propName
    })
  }

  /**
   *
   */
  get ok() {
    const App = this
    class Children extends Plugin {
      constructor() {
        // init
        super()
        // 丢给this
        const init = {
          ...App.#init,
          rule: App.#rule
        }
        for (const key in init) {
          this[key] = init[key]
        }
        for (const key of App.#rule) {
          // 确认存在该函数
          if (App[key.fnc] instanceof Function) {
            // 改变this指向 确保未来废除 fun(e) 后可用
            this[key.fnc] = () => App[key.fnc].call(this, this.e)
          }
        }
      }
    }
    return Children
  }
}

/**
 * 事件
 */
export class Events {
  #count = 0
  #data: {
    [key: string]: typeof Plugin
  } = {}
  /**
   *
   * @param val
   */
  use(val: typeof Plugin) {
    this.#count++
    this.#data[this.#count] = val
  }
  /**
   *
   */
  get ok() {
    return this.#data
  }
}
