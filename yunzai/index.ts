import './init/index.js'
export * from './config/index.js'
export * from './core/index.js'
export * from './db/index.js'
export * from './image/index.js'
export * from './mys/index.js'
export * from './utils/index.js'

/**
 * 配置选择
 */
export type ConifigOptions = {
  plugins?: any[]
  application?: any[]
  middlewares?: any[]
}
