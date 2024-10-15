import schedule from 'node-schedule'
/**
 *
 * 定时任务 是 个 无效的 设计，
 * 因为 e 是会丢失的，
 * 但很多开发者 误以为 fnc 和 常规的回调一样能进行，
 * 这对新人开发插件来说是毁灭性的打击，
 * 我们应该避免把所有概念都拥堵在一个pluin里，
 * ********************************
 * 若想设计成定时可指令的方法，
 * 应该采用订阅发布模型，
 * 使用BOT变量去发送消息，
 * 或者对BOT进行二次封装，
 * 让开发更容易理解。
 * ********************************
 */
export class Task {
  /**
   * 定时任务
   */
  task = []

  /**
   * 收集定时任务
   * @param task
   */
  collectTask(task) {
    for (const i of Array.isArray(task) ? task : [task]) {
      if (i?.cron && i?.name) {
        this.task.push(i)
      }
    }
  }

  /**
   * 创建定时任务
   */
  createTask() {
    // 便利存储好的定时任务
    for (const i of this.task) {
      // 开始定时
      i.job = schedule.scheduleJob(i?.cron, async () => {
        // 指令
        try {
          if (i.log == true) logger.mark(`开始定时任务：${i.name}`)
          await i.fnc()
          if (i.log == true) logger.mark(`定时任务完成：${i.name}`)
        } catch (error) {
          logger.error(`定时任务报错：${i.name}`)
          logger.error(error)
        }
        //
      })
    }
  }
}
