import 'yunzai/init'
import { Client, MiddlewareStore } from 'yunzai/core'
import { MIDDLEWARE_PATH, createLogin } from 'yunzai/config'
import { readdirSync } from 'node:fs'

// 便利得到目录和文件
const files = readdirSync(MIDDLEWARE_PATH, { withFileTypes: true }).filter(
  val => !val.isFile()
)
const middlewares = {}
for (const file of files) {
  const names = readdirSync(`${file?.path ?? file.parentPath}/${file.name}`, {
    withFileTypes: true
  })
    .filter(val => val.isFile() && /(.js|.ts)$/.test(val.name))
    .map(val => val.name)
  if (names.length > 0) {
    middlewares[file.name] = names
  }
}

/**
 * *********************
 * 确保所有微任务做好准备后
 * 再进行宏任务
 * ****************
 */
setTimeout(async () => {
  /**
   * login
   */
  await createLogin()
  /**
   * run
   */
  await Client.run().then(async () => {
    console.log('middlewares', middlewares)

    /**
     * middlewares
     */
    await MiddlewareStore.install(middlewares)
  })
}, 0)
