import { EventEmun, RuleType } from '../types.js'

const State = {}
const SymbolTimeout = Symbol('Timeout')
const SymbolResolve = Symbol('Resolve')

/**
 * tudo
 * @deprecated 实验性方法
 */
export class Application<T extends keyof EventEmun = 'message.group'> {
  /**
   * 指令集
   */
  rule: RuleType = []
  /**
   * 优先级
   */
  priority: number = 9999
  /**
   * 事件，默认 message
   */
  event: T = 'message.group' as T
  /**
   * 事件
   */
  e: Parameters<EventEmun[T]>[0]

  /**
   * 类型
   * @param event
   */
  constructor(event: T) {
    if (event) this.event = event
  }

  /**
   *
   * @param isGroup
   * @returns
   */
  #conKey(isGroup = false) {
    type MessageGroupType = Parameters<EventEmun['message.group']>[0]
    const e = this.e as MessageGroupType
    if (isGroup && e.isGroup) {
      return `${e.group_id}`
    } else {
      return `${e.user_id}`
    }
  }

  /**
   * @param type 执行方法
   * @param isGroup 是否群聊
   * @param time 操作时间
   * @param timeout 操作超时回复
   */
  setContext(
    type: string,
    isGroup = false,
    time = 120,
    timeout = '操作超时已取消'
  ) {
    type MessageGroupType = Parameters<EventEmun['message.group']>[0]
    const e = this.e as MessageGroupType
    const key = this.#conKey(isGroup)
    if (!State[key]) State[key] = {}
    State[key][type] = e
    if (time) {
      State[key][type][SymbolTimeout] = setTimeout(() => {
        if (State[key][type]) {
          const resolve = State[key][type][SymbolResolve]
          delete State[key][type]
          resolve ? resolve(false) : e.reply(timeout, true)
        }
      }, time * 1000)
    }
    return State[key][type]
  }

  /**
   *
   * @param type
   * @param isGroup
   * @returns
   */
  getContext(type?: string, isGroup?: boolean) {
    if (type) return State[this.#conKey(isGroup)]?.[type]
    return State[this.#conKey(isGroup)]
  }

  /**
   *
   * @param type
   * @param isGroup
   */
  finish(type: string, isGroup?: boolean) {
    const key = this.#conKey(isGroup)
    if (State[key]?.[type]) {
      clearTimeout(State[key][type][SymbolTimeout])
      delete State[key][type]
    }
  }
}
