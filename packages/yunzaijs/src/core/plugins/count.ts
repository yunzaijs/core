import { BOT_COUNT_KEY } from '../../config/system.js'
import { EventType } from '../types.js'
import { Redis } from '../../init/redis.js'
import moment from 'moment'
export class Count {
  /**
   * 插件个数
   */
  pluginCount = null

  /**
   *
   * @param e
   * @param msg
   */
  count(e: EventType, msg) {
    //
    let screenshot = false
    //
    if (msg && msg?.file && Buffer.isBuffer(msg?.file)) {
      screenshot = true
    }
    //
    this.save('sendMsg')
    //
    if (screenshot) this.save('screenshot')
    //
    if (e.group_id) {
      //
      this.save('sendMsg', e.group_id)
      //
      if (screenshot) this.save('screenshot', e.group_id)
    }
  }

  /**
   *
   * 保持计数
   * @param type
   * @param groupId
   */
  save(type: string, groupId = 0) {
    //
    let key = BOT_COUNT_KEY
    //
    if (groupId) {
      key += `group:${groupId}:`
    }
    //
    const dayKey = `${key}${type}:day:${moment().format('MMDD')}`
    //
    const monthKey = `${key}${type}:month:${Number(moment().month()) + 1}`
    //
    const totalKey = `${key}${type}:total`
    //
    Redis.incr(dayKey)
    //
    Redis.incr(monthKey)
    //
    if (!groupId) Redis.incr(totalKey)
    //
    Redis.expire(dayKey, 3600 * 24 * 30)
    //
    Redis.expire(monthKey, 3600 * 24 * 30)
  }

  /**
   * 删除记数
   */
  del() {
    //
    Redis.set(`${BOT_COUNT_KEY}sendMsg:total`, '0')
    //
    Redis.set(`${BOT_COUNT_KEY}screenshot:total`, '0')
  }
}
