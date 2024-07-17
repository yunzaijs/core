import { ApplicationOptions, ConifigOptions, MiddlewareOptoins } from './types'
/**
 * 中间件
 * @param options
 * @returns
 */
export const middlewareOptions = (options: MiddlewareOptoins) => options
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
export const applicationOptions = (options: ApplicationOptions) => options
/**
 * 插件
 * @param options
 * @returns
 */
export const pluginOptions = <T>(options: T) => options
