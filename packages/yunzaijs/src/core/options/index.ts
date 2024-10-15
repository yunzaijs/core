import { Application } from '@/core/app/index.js'
import { EventEmun } from '@/core/types.js'
import {
  ApplicationOptions,
  ConifigOptions,
  MiddlewareOptoins
} from './types.js'
/**
 * 中间件
 * @param options
 * @returns
 */
export const middlewareOptions = <T extends MiddlewareOptoins>(options: T): T =>
  options
/**
 * yunzai.config.js
 * @param options
 * @returns
 */
export const defineConfig = <T extends ConifigOptions>(options: T): T => options
/**
 * 应用
 * @param options
 * @returns
 */
export const applicationOptions = <T extends ApplicationOptions>(
  options: T
): T => options
/**
 * 插件
 * @param options
 * @returns
 */
export const pluginOptions = <T>(options: T) => options
/**
 * 应用存储
 * @returns
 */
export const useAppStorage = (
  apps?: Array<typeof Application.prototype>
): Array<typeof Application.prototype> => {
  return apps ?? []
}
/**
 * 输入事件并校验类型
 * 如果类型正确
 * 则执行函数家
 * 如果类型不正确则返回false
 *
 * @param e
 * @returns
 */
export const useEvent = <T extends keyof EventEmun>(
  func: (
    e: Parameters<EventEmun[T]>[0]
  ) => boolean | void | Promise<boolean | void>,
  keys: [Parameters<EventEmun[keyof EventEmun]>[0], ...Array<T>]
): boolean | void | Promise<boolean | void> => {
  // const KEYS = keys.slice(1, keys.length - 1)
  return func(keys[0])
}
