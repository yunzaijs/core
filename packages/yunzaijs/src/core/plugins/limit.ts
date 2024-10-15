import { EventType } from '@/core/types.js'
import cfg from '@/config/config.js'
export class Limit {
  groupGlobalCD = {}
  singleCD = {}
  msgThrottle = {}
  /**
   * 检查命令冷却cd
   * @param e
   * @returns
   */
  check(e: EventType) {
    /** 禁言中 */
    if (e.isGroup && e?.group?.mute_left > 0) return false
    // 消息不存在，或者是私聊
    if (!e.message || e.isPrivate) return true
    // 得到群聊配置
    const config = cfg.getGroup(e.group_id)
    //
    if (config.groupGlobalCD && this.groupGlobalCD[e.group_id]) {
      return false
    }
    //
    if (config.singleCD && this.singleCD[`${e.group_id}.${e.user_id}`]) {
      return false
    }
    //
    const { msgThrottle } = this
    //
    const msgId = e.user_id + ':' + e.raw_message
    if (msgThrottle[msgId]) return false
    //
    msgThrottle[msgId] = true
    //
    setTimeout(() => {
      delete msgThrottle[msgId]
    }, 200)
    return true
  }

  /**
   * 设置冷却cd
   * @param e
   * @returns
   */
  set(e: EventType) {
    // 不存在，且是私聊
    if (!e.message || e.isPrivate) return
    // 群聊配置
    const config = cfg.getGroup(e.group_id)
    // 锅巴
    if (config.groupGlobalCD) {
      this.groupGlobalCD[e.group_id] = true
      setTimeout(() => {
        delete this.groupGlobalCD[e.group_id]
      }, config.groupGlobalCD)
    }
    //
    if (config.singleCD) {
      const key = `${e.group_id}.${e.user_id}`
      this.singleCD[key] = true
      setTimeout(() => {
        delete this.singleCD[key]
      }, config.singleCD)
    }
  }
}
