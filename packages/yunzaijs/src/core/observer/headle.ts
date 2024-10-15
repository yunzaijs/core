import { EventEmun } from '@/core/types.js'
import { middlewareStack } from '@/core/observer/stack.js'
/**
 *
 * @param key
 * @param e
 * @returns
 */
export const observerHandle = (
  e: Parameters<EventEmun['message.group' | 'message.private']>[0]
) => {
  if (!e?.post_type) {
    // 放行
    return true
  }

  const KEY1 = `${e?.group_id}:${e.post_type}`
  const KEY2 = `${e.user_id}:${e?.group_id ?? ''}:${e.post_type}`
  const KEY3 = `${e.user_id}:${e.post_type}`

  let KEY = ''

  if (middlewareStack[KEY1]) {
    if (middlewareStack[KEY1].length >= 1) KEY = KEY1
  } else if (middlewareStack[KEY2]) {
    if (middlewareStack[KEY2].length >= 1) {
      KEY = KEY2
    }
  } else if (middlewareStack[KEY3]) {
    if (middlewareStack[KEY3].length >= 1) {
      KEY = KEY3
    }
  } else {
    return true
  }

  let index = 0
  const close = () => {
    logger.info('close')
    // 结束即清空 , 需要重头开始推送
    delete middlewareStack[KEY]
  }
  const next = () => {
    logger.info('next')
    const middleware = middlewareStack[KEY][index]
    if (middleware) {
      index++
      middleware(e, next, close)
    }
  }
  next()
}
