import { EventMap } from 'icqq'
import { EventEmun } from '@/core/types.js'

/**
 *
 */
export const EventTypeMap = {
  // 对  post_tyoe 中的事件  进行分化成
  // post_type = 'message'
  // message_type = 'private'
  // sub_type = 'friend'
  message: ['post_type', 'message_type', 'sub_type'],
  notice: ['post_type', 'notice_type', 'sub_type'],
  request: ['post_type', 'request_type', 'sub_type']
}

/**
 *
 * @param event
 * @returns
 */
export const getEventPostType = (event: keyof EventEmun) => {
  const EventArr = event.split('.')
  const key = EventArr[0] ?? ''
  if (EventTypeMap[key]) return key
  return event
}

/**
 *
 * @param e
 * @param v
 * @returns
 */
export const EventTypeMapFilter = (
  e: Parameters<EventMap['message' | 'notice' | 'request']>[0],
  v: {
    event: keyof EventMap
  }
) => {
  if (!v.event) return false
  const event = v.event.split('.')
  const eventMap = EventTypeMap[e.post_type] || []
  const newEvent = []
  for (const i in event) {
    if (event[i] == '*') newEvent.push(event[i])
    else newEvent.push(e[eventMap[i]])
  }
  return v.event == newEvent.join('.')
}
