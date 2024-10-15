import { Store } from './store'
export async function Init() {
  const data = await redis.get(Store.RESTART_KEY)
  if (data) {
    const restart = JSON.parse(data)
    const uin = restart?.uin || Bot.uin
    let time = restart.time || new Date().getTime()
    time = (new Date().getTime() - time) / 1000
    let msg = `重启成功：耗时${time.toFixed(2)}秒`
    try {
      if (restart.isGroup) {
        Bot[uin].pickGroup(restart.id).sendMsg(msg)
      } else {
        Bot[uin].pickUser(restart.id).sendMsg(msg)
      }
    } catch (error) {
      // 不发了，发不出去
      logger.debug(error)
    }
    // 发送成功后删除key
    redis.del(Store.RESTART_KEY)
  }
}
