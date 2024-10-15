import { Application, applicationOptions, useEvent } from 'yunzai'
import * as apps from '@/apps/index.js'
export default () => {
  // 预先存储
  const rules: {
    reg: RegExp | string
    key: string
  }[] = []
  // options
  return applicationOptions({
    create() {
      // created
      for (const key in apps) {
        // 推类型
        const app: typeof Application.prototype = new apps[key]()
        // 用  reg 和 key 连接起来。
        // 也可以进行自由排序
        for (const rule of app.rule) {
          rules.push({
            reg: rule.reg,
            key: key
          })
        }
      }
      console.log('测试应用初始化完成')
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
              new RegExp(item.reg).test(e.msg) &&
              apps[item.key] &&
              !cache[item.key]
            ) {
              cache[item.key] = true
              data.push(new apps[item.key]())
            }
          }
        },
        // 推倒为message类型的event
        [e, 'message']
      )
      // back
      return data
    }
  })
}
