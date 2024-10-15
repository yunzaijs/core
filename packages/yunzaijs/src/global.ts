import { segment as se, Client } from 'icqq'
import { RedisClientType } from 'redis'
import { type ChalkInstance } from 'chalk'
import { plugin as p } from './core/index.js'
import { Renderer as Ren } from './image/index.js'
type LogType = string | Error | unknown
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
  red: ChalkInstance['red']
  /**
   * 绿色的
   * @deprecated 不推荐使用
   */
  green: ChalkInstance['green']
  /**
   * 蓝色的
   * @deprecated 不推荐使用
   */
  blue: ChalkInstance['blue']
  /**
   * 黄色的
   * @deprecated 不推荐使用
   */
  yellow: ChalkInstance['yellow']
  /**
   * 品红
   * @deprecated 不推荐使用
   */
  magenta: ChalkInstance['magenta']
  /**
   * 青色
   * @deprecated 不推荐使用
   */
  cyan: ChalkInstance['cyan']
}

type SegmentType = typeof se
type PluginType = typeof p
type BotType = typeof Client.prototype
type RendererType = typeof Ren

declare global {
  /**
   * 键值对型数据库
   * @deprecated 不推荐使用，请从模块中导入
   * import { Redis } from 'yunzai'
   */
  var redis: RedisClientType
  /**
   * import { Segment } from 'yunzai'
   * @deprecated 不推荐使用，请从模块中导入
   */
  var segment: SegmentType
  /**
   * @deprecated 不推荐使用，请从模块中导入
   * import { Plugin } from 'yunzai'
   */
  var plugin: PluginType
  /**
   * 机器人客户端
   * import { Bot } from 'yunzai'
   */
  var Bot: BotType
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
  var Renderer: RendererType
}
