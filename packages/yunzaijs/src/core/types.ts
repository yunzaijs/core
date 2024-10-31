import { PrivateMessage, Sendable, type GroupMessage } from 'icqq'
import { Client } from 'icqq'
import { EventMap, PrivateMessageEvent, DiscussMessageEvent } from 'icqq'

// 可去除的keys
export type OmitKeys<T, K extends keyof T> = {
  [Key in keyof T as Key extends K ? never : Key]: T[Key]
}

// 去除 'message.group' 键
type PersonWithoutEmail = OmitKeys<
  EventMap,
  'message.group' | 'message' | 'message.private'
>

// 扩展
export interface EventEmun extends PersonWithoutEmail {
  'message.group': (event: EventType) => void
  'message': (
    event: EventType
  ) => void | PrivateMessageEvent | DiscussMessageEvent
  'message.private': (event: PrivateMessageType) => void
}

// 插件类基础参数
export type PluginSuperType = {
  /**
   * 应用名
   * 用于过滤功能启动和关闭
   * @param name
   */
  name?: string
  /**
   * @param dsc 插件描述
   * @deprecated 已废弃
   */
  dsc?: string
  /**
   * namespace，设置handler时建议设置
   * @deprecated 已废弃
   */
  namespace?: any
  /**
   * @param handler handler配置
   * @param handler.key handler支持的事件key
   * @param handler.fn handler的处理func
   * @deprecated 已废弃
   */
  handler?: any
  /**
   *  task
   *  task.name 定时任务名称
   *  task.cron 定时任务cron表达式
   *  task.fnc 定时任务方法名
   *  task.log  false时不显示执行日志
   * @deprecated 已废弃
   */
  task?: any
  /**
   * 优先级
   */
  priority?: number
  /**
   * 事件
   */
  event?: keyof EventEmun
  /**
   *  rule
   *  rule.reg 命令正则
   *  rule.fnc 命令执行方法
   *  rule.event 执行事件，默认message
   *  rule.log  false时不显示执行日志
   *  rule.permission 权限 master,owner,admin,all
   */
  rule?: RulesType
}

export type PermissionEnum = 'master' | 'owner' | 'admin' | 'all'

export type RulesType = {
  /**
   * 正则
   */
  reg?: RegExp | string
  /**
   * 函数名
   */
  fnc?: string
  /**
   * 事件
   */
  event?: keyof EventEmun
  /**
   * 是否打印log
   */
  log?: boolean
  /**
   * 权限
   */
  permission?: PermissionEnum
}[]

export interface PrivateMessageType extends PrivateMessage {
  /**
   * 支持扩展属性
   */
  [key: string]: any
  /**
   *  'group' | 'private'
   * @deprecated 已废弃
   */
  message_type: any
  /**
   * 是否是机器人主人
   */
  isMaster: boolean
  /**
   * 是否是机器人管理员
   */
  // isAdmin: boolean;
  /**
   * 是否是群里
   */
  isGroup: boolean
  /**
   * 是否是群管理
   */
  // isGroupAdmin:boolean
  /**
   * 是私聊
   */
  isPrivate: boolean
  /**
   * 是频道
   */
  isGuild: boolean
  /**
   * 用户名
   */
  user_id: number
  /**
   * 用户名
   */
  user_name: string
  /**
   * 用户头像
   */
  user_avatar: string
  /**
   * 用户消息
   */
  msg: string
  /**
   * 图片
   * @deprecated 已废弃
   */
  img: string[]
  /**
   * 群号
   */
  group_id: number
  /**
   * 群名
   */
  group_name: string
  /**
   *  群头像
   */
  group_avatar: string
  /**
   * 是否存在at
   */
  at?: any
  /**
   * 是否at了机器人
   */
  atBot: any
  /**
   * 携带的文件
   */
  file: any
  /**
   * 被执行的地址
   */
  logText: string
  /**
   * 被执行的方法
   */
  logFnc: string
  /**
   * @param msg 发送的消息
   * @param quote 是否引用回复
   * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
   * @param data.at 是否at用户
   */
  reply: (
    msg: Sendable,
    quote?: boolean,
    data?: {
      recallMsg?: number
      at?: any
    }
  ) => Promise<any>
  /**
   * @param msg 发送的消息
   * @param quote 是否引用回复
   */
  send: (msg: Sendable, quote?: boolean) => Promise<any>

  /**
   * @deprecated 已废弃
   */
  notice_type: any
  /**
   * @deprecated 已废弃
   */
  group: {
    /**
     * @deprecated 已废弃
     */
    is_owner: any
    /**
     * @deprecated 已废弃
     */
    recallMsg: (...arg: any[]) => any
    /**
     * @deprecated 已废弃
     */
    getMemberMap: any
    /**
     * @deprecated 已废弃
     */
    quit: any
    /**
     * @deprecated 已废弃
     */
    mute_left: any
    /**
     * @deprecated 已废弃
     */
    pickMember: any
    /**
     * @deprecated 已废弃
     */
    sendMsg: any
    /**
     * @deprecated 已废弃
     */
    name: any
    /**
     * @deprecated 已废弃
     */
    makeForwardMsg: any
  }
  /**
   * @deprecated 已废弃
   */
  bot: typeof Client.prototype
  /**
   *
   * @deprecated 已废弃
   */
  approve: any
  /**
   *
   * @deprecated 已废弃
   */
  member: any
  /**
   *
   * @deprecated 已废弃
   */
  self_id?: any
  /**
   *
   * @deprecated 已废弃
   */
  detail_type?: any
  /**
   *
   * @deprecated 已废弃
   */
  hasAlias?: any
  /**
   * @deprecated 已废弃
   */
  friend?: any
}

/**
 * 消息事件体
 */
export interface EventType extends GroupMessage {
  /**
   * 支持扩展属性
   */
  [key: string]: any
  /**
   *  'group' | 'private'
   * @deprecated 已废弃
   */
  message_type: any
  /**
   * 是否是机器人主人
   */
  isMaster: boolean
  /**
   * 是否是机器人管理员
   */
  // isAdmin: boolean;
  /**
   * 是否是群里
   */
  isGroup: boolean
  /**
   * 是否是群管理
   */
  // isGroupAdmin:boolean
  /**
   * 是私聊
   */
  isPrivate: boolean
  /**
   * 是频道
   */
  isGuild: boolean
  /**
   * 用户名
   */
  user_id: number
  /**
   * 用户名
   */
  user_name: string
  /**
   * 用户头像
   */
  user_avatar: string
  /**
   * 用户消息
   */
  msg: string
  /**
   * 图片
   * @deprecated 已废弃
   */
  img: string[]
  /**
   * 群号
   */
  group_id: number
  /**
   * 群名
   */
  group_name: string
  /**
   *  群头像
   */
  group_avatar: string
  /**
   * 是否存在at
   */
  at?: any
  /**
   * 是否at了机器人
   */
  atBot: boolean
  /**
   * 携带的文件
   */
  file: any
  /**
   * 被执行的地址
   */
  logText: string
  /**
   * 被执行的方法
   */
  logFnc: string
  /**
   * @param msg 发送的消息
   * @param quote 是否引用回复
   * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
   * @param data.at 是否at用户
   */
  reply: (
    msg: Sendable,
    quote?: boolean,
    data?: {
      recallMsg?: number
      at?: any
    }
  ) => Promise<any>
  /**
   * @param msg 发送的消息
   * @param quote 是否引用回复
   */
  send: (msg: Sendable, quote?: boolean) => Promise<any>
  /**
   * @deprecated 已废弃
   */
  notice_type: any
  /**
   * @deprecated 已废弃
   */
  group: {
    /**
     * @deprecated 已废弃
     */
    is_owner: any
    /**
     * @deprecated 已废弃
     */
    recallMsg: (...arg: any[]) => any
    /**
     * @deprecated 已废弃
     */
    getMemberMap: any
    /**
     * @deprecated 已废弃
     */
    quit: any
    /**
     * @deprecated 已废弃
     */
    mute_left: any
    /**
     * @deprecated 已废弃
     */
    pickMember: any
    /**
     * @deprecated 已废弃
     */
    sendMsg: any
    /**
     * @deprecated 已废弃
     */
    name: any
    /**
     * @deprecated 已废弃
     */
    makeForwardMsg: any
  }
  /**
   * @deprecated 已废弃
   */
  bot: typeof Client.prototype
  /**
   *
   * @deprecated 已废弃
   */
  approve: any
  /**
   *
   * @deprecated 已废弃
   */
  member: any
  /**
   *
   * @deprecated 已废弃
   */
  self_id?: any
  /**
   *
   * @deprecated 已废弃
   */
  detail_type?: any
  /**
   *
   * @deprecated 已废弃
   */
  hasAlias?: any
  /**
   * @deprecated 已废弃
   */
  friend?: any
}
