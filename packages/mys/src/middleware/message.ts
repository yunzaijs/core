import { middlewareOptions, useEvent } from 'yunzai'
const srReg = /^#?(\*|星铁|星轨|穹轨|星穹|崩铁|星穹铁道|崩坏星穹铁道|铁道)+/
const zzzReg = /^#?(%|zzz|绝区零|ZZZ)+/
/**
 * 处理特殊指令
 */
export default () => {
  // 返回中间件
  return middlewareOptions({
    // 类型
    typing: 'message',
    // 插件名
    name: 'message-commands',
    //
    on: event => {
      useEvent(
        e => {
          /**
           * tudo
           * 在回调模型中，这个代理是无意义的
           * ***************************
           */
          Object.defineProperty(e, 'isSr', {
            get: () => e.game === 'sr',
            set: v => (e.game = v ? 'sr' : 'gs')
          })
          Object.defineProperty(e, 'isGs', {
            get: () => e.game === 'gs',
            set: v => (e.game = v ? 'gs' : 'sr')
          })
          /**
           * end
           * ***************************
           */
          //
          if (srReg.test(e.msg)) {
            // 设置为星铁
            e.game = 'sr'
          } else if (zzzReg.test(e.msg)) {
            e.game = 'zzz'
          }
          //
          if (srReg.test(e.msg)) {
            // 重置消息 -- 转为喵喵插件的消息格式
            e.msg = e.msg.replace(srReg, '#星铁')
          } else if (zzzReg.test(e.msg)) {
            // 重置消息 -- 转为ZZZ插件的消息格式
            e.msg = e.msg.replace(srReg, '#绝区零')
          }
        },
        [event, 'message.group', 'message.private']
      )
    }
  })
}
