/**
 * ***********
 * 消息中间件
 * **********
 * 星铁中间件
 * 对msg进行代理和裁剪
 */
import { type EventType } from 'yunzai/core'
export default class StarRail {
  static names = ['isSr', 'isGs', 'game', 'msg']

  e: EventType

  // 识别正则
  srReg = /^#?(\*|星铁|星轨|穹轨|星穹|崩铁|星穹铁道|崩坏星穹铁道|铁道)+/

  /**
   *
   */
  callNames = {
    isSr: () => {
      Object.defineProperty(this.e, 'isSr', {
        get: () => this.e.game === 'sr',
        set: v => (this.e.game = v ? 'sr' : 'gs')
      })
      return this.e.isSr
    },
    isGs: () => {
      Object.defineProperty(this.e, 'isGs', {
        get: () => this.e.game === 'gs',
        set: v => (this.e.game = v ? 'gs' : 'sr')
      })
      return this.e.isGs
    },
    game: () => {
      if (this.srReg.test(this.e.msg)) {
        // 设置为星铁
        this.e.game = 'sr'
      }
      return this.e.game
    },
    msg: () => {
      // 发现星铁消息
      if (this.srReg.test(this.e.msg)) {
        // 重置消息 -- 这是喵喵插件内 正确的匹配规则 即可  #星铁绑定uid
        this.e.msg = this.e.msg.replace(this.srReg, '#星铁')
      }
      return this.e.msg
    }
  }
}
