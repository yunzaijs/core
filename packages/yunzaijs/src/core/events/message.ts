import EventListener from './listener.js'

/**
 * 监听群聊消息
 */
export class EventMessage extends EventListener {
  /**
   *
   */
  constructor() {
    /**
     *
     */
    super({ event: 'message' })
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
