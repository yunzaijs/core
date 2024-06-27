import { segment as se } from 'icqq'
import { RedisClientType } from 'redis'
import chalk, { type ChalkInstance } from 'chalk'
import { Client, plugin as p } from '../core/index.js'
import { Renderer } from '../utils/index.js'

/**
 *
 */
type LogType = string | Error | unknown

/**
 *
 */
type LoggerType = {
  /**
   *痕迹
   * @param arg
   */
  trace(...arg: LogType[]): any
  /**
   *调试
   * @param arg
   */
  debug(...arg: LogType[]): any
  /**
   *信息
   * @param arg
   */
  info(...arg: LogType[]): any
  /**
   *警告
   * @param arg
   */
  warn(...arg: LogType[]): any
  /**
   *错误
   * @param arg
   */
  error(...arg: LogType[]): any
  /**
   *致命
   * @param arg
   */
  fatal(...arg: LogType[]): any
  /**
   *标记
   * @param arg
   */
  mark(...arg: LogType[]): any
}

/**
 * @deprecated 不推荐使用
 */
type ChalkInstanceType = {
  /**
   * 红色的
   * @deprecated 不推荐使用
   */
  red: ChalkInstance.red
  /**
   * 绿色的
   * @deprecated 不推荐使用
   */
  green: ChalkInstance.green
  /**
   * 蓝色的
   * @deprecated 不推荐使用
   */
  blue: ChalkInstance.blue
  /**
   * 黄色的
   * @deprecated 不推荐使用
   */
  yellow: ChalkInstance.yellow
  /**
   * 品红
   * @deprecated 不推荐使用
   */
  magenta: ChalkInstance.magenta
  /**
   * 青色
   * @deprecated 不推荐使用
   */
  cyan: ChalkInstance.cyan
}

declare global {
  /**
   * 键值对型数据库
   * @deprecated 不推荐使用，未来将废弃
   * import { Redis } from 'yunzai/core'
   */
  var redis: RedisClientType
  /**
   * 机器人客户端
   * @deprecated 不推荐使用，未来将废弃
   * import { Bot } from 'yunzai/core'
   */
  var Bot: typeof Client.prototype
  /**
   * import { Segment } from 'yunzai/core'
   * @deprecated 不推荐使用，未来将废弃
   */
  var segment: typeof se
  /**
   * @deprecated 不推荐使用，未来将废弃
   * import { Plugin } from 'yunzai/core'
   */
  var plugin: typeof p
  /**
   * 统一化的打印对象
   * 构造颜色请使用 logger.chalk
   */
  var logger: LoggerType &
    ChalkInstanceType & {
      chalk: ChalkInstance
    }
  /**
   *
   * @deprecated 不推荐使用，未来将废弃
   */
  var Renderer: typeof Ren
}
