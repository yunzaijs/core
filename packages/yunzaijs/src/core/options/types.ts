import { Application } from '@/core/app/index.js'
import { EventEmun } from '@/core/types.js'

/**
 * 配置选择
 */
export type ConifigOptions = {
  applications?: (string | ApplicationOptions)[]
  middlewares?: (MiddlewareOptoins | string)[]
}

/**
 *
 */
export type MiddlewareOptoins = {
  typing: 'message' | 'event'
  // 插件名
  name: string
  // 修饰 属性名
  on: <T extends keyof EventEmun = 'message.group'>(
    e: Parameters<EventEmun[T]>[0]
  ) => any
}

/**
 *
 */
export type ApplicationOptions = {
  /**
   * 插件创建时
   * 处理的函数
   * @param config
   * @returns
   */
  create?: (config: ConifigOptions) => any
  /**
   * 安装中间件之前的函数
   */
  beforeMount?: <T extends keyof EventEmun = 'message.group'>(
    e: Parameters<EventEmun[T]>[0]
  ) => any
  /**
   * 安装中间件之上会执行的函数
   * 也就是响应前处理的函数
   * @returns
   */
  mounted: <T extends keyof EventEmun = 'message.group'>(
    e: Parameters<EventEmun[T]>[0]
  ) =>
    | (typeof Application.prototype)[]
    | Promise<(typeof Application.prototype)[]>
  /**
   * 每条响应时会都处理的函数
   * @returns
   */
  response?: () => any
  /**
   * 响应后
   */
  afterResponse?: () => any
}
