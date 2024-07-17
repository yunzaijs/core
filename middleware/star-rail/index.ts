import { middlewareOptions } from 'yunzai'
const srReg = /^#?(\*|星铁|星轨|穹轨|星穹|崩铁|星穹铁道|崩坏星穹铁道|铁道)+/
export default (config?: { name: string }) => {
  // 返回中间件
  return middlewareOptions({
    // 类型
    typing: 'message',
    // 插件名
    name: config?.name ?? 'StarRail',
    //
    on(e) {
      Object.defineProperty(e, 'isSr', {
        get: () => e.game === 'sr',
        set: v => (e.game = v ? 'sr' : 'gs')
      })
      Object.defineProperty(e, 'isGs', {
        get: () => e.game === 'gs',
        set: v => (e.game = v ? 'gs' : 'sr')
      })
      if (srReg.test(e.msg)) {
        // 设置为星铁
        e.game = 'sr'
      }
      // 发现星铁消息
      if (srReg.test(e.msg)) {
        // 重置消息 -- 这是喵喵插件内 正确的匹配规则 即可  #星铁绑定uid
        e.msg = e.msg.replace(srReg, '#星铁')
      }
    }
  })
}
