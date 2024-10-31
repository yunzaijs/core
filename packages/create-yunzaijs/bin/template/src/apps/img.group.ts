import { Messages, Segment } from 'yunzaijs'
import { screenshotRender } from '@src/image/index.js'
// 群聊
const Group = new Messages('message.group')
Group.use(
  async e => {
    const img = await screenshotRender({})
    if (Buffer.isBuffer(img)) {
      e.reply(Segment.image(img))
    } else {
      e.reply('截图失败了')
    }
  },
  [/^pic/]
)
export const PicGroup = Group.ok
