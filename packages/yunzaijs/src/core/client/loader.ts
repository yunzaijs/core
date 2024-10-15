import { type Client } from 'icqq'
import { isArray } from 'lodash-es'

// 所有事件
import * as Events from '../events/index.js'

/**
 * 加载监听事件
 */
class ListenerLoader {
  /**
   * 监听事件加载
   * @param client Bot示例
   */
  async load(client: Client) {
    //
    for (const key in Events) {
      try {
        // 实例化
        const listener = new Events[key]()

        // 赋值 客户端
        listener.client = client

        //
        const on = listener.once ? 'once' : 'on'

        //
        if (isArray(listener.event)) {
          for (const type of listener.event) {
            // 存在 则执行  不 存在 执行默认方法
            const typing = listener[type] ? type : 'execute'
            const prefix = listener.prefix

            // 监听事件 -- 执行函数  并传入 event
            client[on](`${prefix}${typing}`, event => listener[typing](event))

            //
          }
        } else {
          const typing = listener[listener.event] ? listener.event : 'execute'
          const prefix = listener.prefix
          const event = listener.event

          client[on](`${prefix}${event}`, event => listener[typing](event))

          //
        }

        //
      } catch (err) {
        logger.mark(`监听事件错误：${key}`)
        logger.error(err)
      }
    }
  }

  //
}

/**
 *
 */
export default new ListenerLoader()
