# YunzaiJS

[☞ 点击阅读文档了解更多](https://yunzaijs.github.io/docs/)

```sh
yarn add yunzaijs
```

> src/index.ts

```ts
import { Application, applicationOptions, useEvent } from 'yunzaijs'
import * as Apps from './apps.js'
export default () => {
  // 预先存储
  const Rules: {
    reg: RegExp | string
    key: string
  }[] = []
  // options
  return applicationOptions({
    create() {
      // created
      for (const key in Apps) {
        // 推类型
        const app: typeof Application.prototype = new Apps[key]()
        // 用  reg 和 key 连接起来。
        // 也可以进行自由排序
        for (const rule of app.rule) {
          Rules.push({
            reg: rule.reg,
            key: key
          })
        }
      }
    },
    async mounted(e) {
      // 存储
      const Data = []
      // 如果key不存在
      const Cache = {}
      // 使用event以确保得到正常类型
      await useEvent(
        e => {
          for (const Item of Rules) {
            // 匹配正则
            // 存在key
            // 第一次new
            if (
              new RegExp(Item.reg).test(e.msg) &&
              Apps[Item.key] &&
              !Cache[Item.key]
            ) {
              Cache[Item.key] = true
              Data.push(new Apps[Item.key]())
            }
          }
        },
        // 推倒为message类型的event
        [e, 'message']
      )
      // back
      return Data
    }
  })
}
```

> src/apps/index.ts

```ts

```
