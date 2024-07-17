import { Client, loader, createLogin, Processor } from 'yunzai'
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
    // 读取yunzai.config.js
    await Processor.install()

    /**
     * 加载插件
     */
    await loader.load()
  })
}, 0)
