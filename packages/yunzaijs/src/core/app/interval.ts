import { Client } from 'icqq'

/**
 *
 * @param call
 * @param time
 * @returns
 */
export const setBotInterVal = (
  func: (Bot: typeof Client.prototype) => any,
  time: number
) => {
  return setInterval(() => {
    func(global.Bot)
  }, time)
}

/**
 *
 * @param id
 * @returns
 */
export const clearBotInterVal = (id: NodeJS.Timeout) => clearInterval(id)
