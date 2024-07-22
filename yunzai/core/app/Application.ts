import { EventEmun, PermissionEnum } from '../types.js'
/**
 * 改成订阅发布
 * 什么模型都能使用
 */

type RulesType = {
  /**
   * 正则
   */
  reg?: RegExp | string
  /**
   * 函数名
   */
  fnc?: string
  /**
   * 权限
   */
  permission?: PermissionEnum
}[]

export class Application<T extends keyof EventEmun = 'message.group'> {
  [key: string]:
    | (() => Promise<boolean | void> | boolean | void)
    | RulesType
    | Parameters<EventEmun[T]>[0]

  /**
   * 指令集
   */
  rule: RulesType = []

  /**
   * 事件，默认 message
   */
  event = 'message.group' as T

  /**
   * 类型
   * @param event
   */
  constructor(event: T) {
    if (event) this.event = event
  }

  e: Parameters<EventEmun[T]>[0]
}
