import { Sendable, type GroupMessage } from 'icqq'
import { Client } from 'icqq'

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
   * 消息发送
   * @param arg
   * @returns
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
   *
   * 这是被重置的了的reply
   * 不可使用
   * @deprecated 已废弃
   */
  replyNew?: any

  /**
   *
   */

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
