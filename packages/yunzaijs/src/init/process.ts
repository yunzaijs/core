import { BOT_NAME } from '../config/system.js'
import config from '../config/config.js'
import { Redis } from './redis.js'
/**
 * 设置标题
 */
process.title = BOT_NAME
/**
 * 设置时区
 */
process.env.TZ = 'Asia/Shanghai'
/**
 *
 */
process.on('SIGHUP', () => process.exit())
/**
 * 捕获未处理的错误
 */
process.on('uncaughtException', error => {
  if (typeof logger == 'undefined') console.log(error)
  else logger.error(error)
})
/**
 * 捕获未处理的Promise错误
 */
process.on('unhandledRejection', error => {
  if (typeof logger == 'undefined') console.log(error)
  else logger.error(error)
})
/**
 * 退出事件
 */
process.on('exit', async () => {
  // 退出之前，保存redis
  if (typeof Redis != 'undefined') await Redis.save()
  if (typeof logger == 'undefined') {
    console.log(`${BOT_NAME} 已停止运行`)
  } else {
    logger.mark(logger.magenta(`${BOT_NAME} 已停止运行`))
  }
})
/**
 * 添加一些多余的标题内容
 */
let title = BOT_NAME
//
const qq = config.qq
/**
 *
 */
if (qq) {
  title += `@${qq}`
  switch (config.platform) {
    case 1: {
      title += ' 安卓手机'
      break
    }
    case 2: {
      title += ' aPad'
      break
    }
    case 3: {
      title += ' 安卓手表'
      break
    }
    case 4: {
      title += ' MacOS'
      break
    }
    case 5: {
      title += ' iPad'
      break
    }
    case 6: {
      title += ' Tim'
      break
    }
    default: {
      break
    }
  }
}
/**
 * 设置标题
 */
process.title = title
