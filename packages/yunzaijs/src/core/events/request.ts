import EventListener from '@/core/events/listener.js'
/**
 * 监听群聊消息
 */
export class EventRequest extends EventListener {
  /**
   *
   */
  constructor() {
    /**
     *
     */
    super({ event: 'request' })
  }

  /**
   *
   * @param e
   */
  async execute(e) {
    // 执行插件
    this.plugins.deal(e)
  }
}
