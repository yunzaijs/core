import pm2 from 'pm2'
import config from '@/config/config.js'

/**
 * 询问运行情况
 * @returns
 */
function inquiryProcess() {
  return new Promise((resolve, reject) => {
    const cfg = config.pm2
    pm2.connect(err => {
      if (err) {
        reject(err)
        return
      }
      pm2.list((err, processList) => {
        if (err) {
          pm2.disconnect()
          reject(err)
          return
        }
        const app = processList.find(p => p.name === cfg.apps[0].name)
        if (app && app.pm2_env.status === 'online') {
          console.log('检测到后台正在运行')
          // 关闭
          pm2.stop(cfg.apps[0].name, err => {
            if (err) {
              reject(err)
            } else {
              console.log('已停止后台进程，防止重复运行')
            }
            pm2.disconnect()
            resolve(true)
          })
        } else {
          // 断开连接
          pm2.disconnect()
          resolve(true)
        }
      })
    })
  })
}

/**
 * 询问
 */
if (process.env.NODE_ENV != 'production') {
  await inquiryProcess().catch(err => {
    // 打印错误
    console.error(err)
    // 关闭进程
    process.exit(2)
  })
}
