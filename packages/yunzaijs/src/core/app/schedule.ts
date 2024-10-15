import { Client } from 'icqq'
import schedule from 'node-schedule'

/**
 * 设置一个定时任务
 * @param func - 要执行的函数
 * @param spec - 定时任务的时间规则
 * @returns - 返回创建的定时任务对象
 */
export const setBotTask = (
  func: (Bot: typeof Client.prototype) => any,
  spec: schedule.Spec
) => {
  return schedule.scheduleJob(spec, () => func(global.Bot))
}

/**
 * 清除定时任务
 * @param Job - 要取消的定时任务对象
 * @returns - 返回取消状态
 */
export const clearBotTask = (Job: schedule.Job) => {
  return Job.cancel()
}
