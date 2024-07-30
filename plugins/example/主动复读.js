import { Plugin } from 'yunzai'
export class example2 extends Plugin {
  constructor() {
    super({
      name: '复读',
      priority: 5000,
      rule: [
        {
          reg: '^#复读$',
          fnc: 'repeat'
        }
      ]
    })
  }

  /**
   * 复读
   */
  async repeat() {
    /**
     * 设置上下文，后续接收到内容会执行doRep方法
     */
    this.setContext('doRep')
    /**
     * 回复
     */
    await this.reply('请发送要复读的内容', false, { at: true })
  }

  /**
   * 接受内容
   */
  doRep() {
    /**
     * 复读内容
     */
    this.reply(this.e.message, false, { recallMsg: 5 })
    /**
     * 结束上下文
     */
    this.finish('doRep')
  }
}
