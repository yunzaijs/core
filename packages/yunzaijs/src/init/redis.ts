import { createClient } from 'redis'
import cfg from '@/config/config.js'
import { execAsync } from '@/utils/common.js'

/**
 *
 * @returns
 */
async function aarch64() {
  if (process.platform == 'win32') return ''
  return await execAsync('uname -m').then(async arch => {
    if (arch.stdout && arch.stdout.includes('aarch64')) {
      /** 判断redis版本 */
      let v = await execAsync('redis-server -v')
      if (v.stdout) {
        const data = v.stdout.match(/v=(\d)./)
        /** 忽略arm警告 */
        if (data && Number(data[1]) >= 6) {
          return ' --ignore-warnings ARM64-COW-BUG'
        }
      }
    }
    return ''
  })
}

/**
 * 错误结束进程
 * @param err
 */
const Error = async err => {
  logger.error(`Redis 错误：${logger.chalk.red(err)}`)
  const os = await aarch64()
  const cmd = `redis-server --save 900 1 --save 300 10 --daemonize yes ${os}`
  logger.error(`请先启动 Redis：${cmd}`)
  process.exit()
}

const createRedis = () => {
  const rc = cfg.redis
  const redisUn = rc.username || ''
  let redisPw = rc.password ? `:${rc.password}` : ''
  if (rc.username || rc.password) redisPw += '@'
  const redisUrl = `redis://${redisUn}${redisPw}${rc.host}:${rc.port}/${rc.db}`
  const redis = createClient({ url: redisUrl })
  logger.info(`正在连接 ${logger.chalk.blue(redisUrl)}`)
  redis.connect()
  redis.on('error', Error)
  global.redis = redis as any
  logger.info('Redis 连接成功')
  return redis
}

export const Redis = createRedis()
