import 'yunzai/init'
import { Client, MiddlewareStore } from 'yunzai/core'
import { createLogin } from 'yunzai/config'

/**
 * 中间件
 */
const middlewares = {
  message: ['runtime']
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
    /**
     * middlewares
     */
    await MiddlewareStore.install(middlewares)
  })
}, 0)
