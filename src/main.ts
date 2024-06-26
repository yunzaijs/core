import 'yunzai/init'
import { Client } from 'yunzai/core'
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
  await Client.run()
}, 0)
