import { Client, Loader, createLogin, Processor } from './index.js'

// *********************
const initialize = () => {
  // 读取 yunzai.config.js
  Processor.install(['yunzai.config.ts'])
  // 加载插件
  Loader.load()
}

// *********************
const start = async () => {
  await createLogin()
  // 登录配置校验
  const T = await Client.run()
  // 登录模式成功
  if (T) {
    // 上线时运行
    Bot.on('system.online', initialize)
  } else {
    initialize()
  }
}

/**
 * *********************
 * 确保所有微任务做好准备后
 * ****************
 */
setTimeout(start, 0)
