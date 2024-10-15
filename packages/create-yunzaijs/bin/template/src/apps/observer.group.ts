import { Messages, Observer } from 'yunzai'
// 群聊
const message = new Messages('message.group')
message.use(
  async e => {
    await e.reply('请发送要复读的内容', false, { at: true })
    const O = new Observer('message.group')
    O.use(
      (e, _, close) => {
        /** 复读内容 */
        e.reply(e.message, false, { recallMsg: 5 })
        close()
        // next()
      },
      [e.user_id]
    )
  },
  [/^#复读$/]
)
export const example2 = message.ok
