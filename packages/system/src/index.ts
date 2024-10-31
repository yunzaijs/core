import { Application, applicationOptions, useEvent } from 'yunzaijs'
import * as apps from './apps.js'
import { Init } from './model/init.js'
export default () => {
  const rules: {
    reg: RegExp | string | undefined
    key: string
  }[] = []
  // options
  return applicationOptions({
    create() {
      // created
      for (const key in apps) {
        // 连接
        const app: typeof Application.prototype = new apps[key]()
        // 用  reg 和 key 连接起来。
        for (const rule of app.rule) {
          rules.push({
            reg: rule.reg,
            key: key
          })
        }
      }
      // init
      Init()
    },
    async mounted(e) {
      // 存储
      const data = []
      // 如果key不存在
      const cache = {}
      // 使用event以确保得到正常类型
      await useEvent(
        e => {
          for (const item of rules) {
            // 匹配正则
            // 存在key
            // 第一次new
            if (
              item.reg &&
              new RegExp(item.reg).test(e['msg']) &&
              apps[item.key] &&
              !cache[item.key]
            ) {
              cache[item.key] = true
              data.push(new apps[item.key]())
            }
          }
        },
        [e, 'message']
      )
      // back
      return data
    }
  })
}

export * from './apps.js'
