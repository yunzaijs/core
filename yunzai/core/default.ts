import { ConifigOptions, EventType } from './types'

type Optoins = {
  typing: 'message' | 'event'
  // 插件名
  name: string
  // 修饰 属性名
  on: (e: EventType) => any
}

/**
 * 中间件
 * @param options
 * @returns
 */
export const middlewareOptions = (options: Optoins) => options

/**
 * yunzai.config.js
 * @param options
 * @returns
 */
export const defineConfig = (options: ConifigOptions) => options

/**
 * 应用
 * @param options
 * @returns
 */
export const applicationOptions = <T>(options: T) => options

/**
 * 插件
 * @param options
 * @returns
 */
export const pluginOptions = <T>(options: T) => options
