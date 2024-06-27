import 'yunzai/init'
import { Client, MiddlewareStore } from 'yunzai/core'
import { createLogin } from 'yunzai/config'
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
    /**
     * 自动识别中间件
     * middlewares
     */
    await MiddlewareStore.install()

    // 载入其他中间件
    // MiddlewareStore.use()
  })
}, 0)
