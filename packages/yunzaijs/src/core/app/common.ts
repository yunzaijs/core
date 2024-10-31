import { Sendable } from 'icqq'
import { EventType } from '../types.js'

/**
 * 发送私聊消息，仅给好友发送
 * @param userId qq号
 * @param msg 消息
 * @param uin 指定bot发送，默认为Bot
 */
export async function relpyPrivate(
  userId: number | string,
  msg: Sendable,
  uin = global.Bot.uin
) {
  userId = Number(userId)
  const friend = Bot.fl.get(userId)
  if (friend) {
    logger.mark(`发送好友消息[${friend.nickname}](${userId})`)
    return await global.Bot[uin]
      .pickUser(userId)
      .sendMsg(msg)
      .catch(err => {
        logger.mark(err)
      })
  }
}

/**
 * 制作转发消息
 * @param e 消息事件
 * @param msg 消息数组
 * @param dec 转发描述
 * @param msgsscr 转发信息是否伪装
 */
export async function makeForwardMsg(
  e: EventType,
  msg: Sendable = [],
  dec: string = '',
  msgsscr = false
) {
  // 不是数组
  if (!Array.isArray(msg)) msg = [msg]

  //
  let name = msgsscr ? e.sender.card || e.user_id : Bot.nickname

  //
  const Id = msgsscr ? e.user_id : Bot.uin

  // 是群聊
  if (e.isGroup) {
    try {
      const Info = await e.bot.getGroupMemberInfo(e.group_id, Id)
      name = Info.card || Info.nickname
    } catch (err) {
      console.error(err)
    }
  }

  let forwardMsg:
    | {
        user_id: number
        nickname: string | number
        message: any
      }[]
    | {
        data: any
      } = []

  /**
   *
   */
  for (const message of msg) {
    if (!message) continue
    forwardMsg.push({
      user_id: Id,
      nickname: name,
      message: message
    })
  }

  /**
   * 制作转发内容
   */
  try {
    /**
     *
     */
    if (e?.group?.makeForwardMsg) {
      // ?
      forwardMsg = await e.group.makeForwardMsg(forwardMsg)
    } else if (e?.friend?.makeForwardMsg) {
      // ?
      forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
    } else {
      //
      return msg.join('\n')
    }

    /**
     *
     */
    if (dec && !Array.isArray(forwardMsg)) {
      /**
       * 处理描述
       */
      if (typeof forwardMsg.data === 'object') {
        const Detail = forwardMsg.data?.meta?.detail
        if (Detail) {
          Detail.news = [{ text: dec }]
        }
      } else {
        /**
         *
         */
        forwardMsg.data = forwardMsg.data
          .replace(/\n/g, '')
          .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
          .replace(/___+/, `<title color="#777777" size="26">${dec}</title>`)
      }
    }
  } catch (err) {
    console.error(err)
  }

  /**
   *
   */
  return forwardMsg as Sendable
}
