# @yunzaijs/mys

Yunzai 米游社通用接口模块

使用了全局变量 redis 进行字段存储

使用了 sequelize 和 sqlite 作为主要数据存储

当前版本必须安装`喵喵插件`才能使用

## 使用教程

- install

```sh
npm install @yunzaijs/mys
```

- use

```ts
import {
  BaseModel,
  DailyCache,
  MysUser,
  MysUtil,
  NoteUser
} from '@yunzaijs/mys'
import { ApiTool, MysApi } from '@yunzaijs/mys'
```

- Yunzai V3

Yunzai V3 环境内置对其他插件指令的处理

- YunzaiJS

如果你的环境是 YunzaiJS

需要设置中间件来处理消息，

否则只能依靠插件原始的正则匹配

```ts
import { defineConfig } from 'yunzaijs'
export default defineConfig({
  // 消息处理  + v3兼容中间件runtime
  middlewares: ['@yunzaijs/mys/message', '@yunzaijs/mys/runtime']
})
```

## 代理地址

```ts
redis.set('mys:proxy:address', '127.0.0.1')
```

## 存储地址

```ts
const dir = join(process.cwd(), `/data/db/data.db`)
```
