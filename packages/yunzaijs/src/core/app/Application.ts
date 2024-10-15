import { EventEmun, PermissionEnum } from '@/core/types.js'
/**
 * 改成订阅发布
 * 什么模型都能使用
 */

export type AppsRulesType = {
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
    | ((...arg: any) => Promise<boolean | void> | boolean | void)
    | AppsRulesType
    | Parameters<EventEmun[T]>[0]

  /**
   * 指令集
   */
  rule: AppsRulesType = []

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
