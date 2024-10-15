import { Messages, Segment } from 'yunzai'
import { Screenshot } from '@/image/index.js'
// 私聊
const Private = new Messages('message.private')
Private.use(
  async e => {
    const img = await Screenshot.createHelp({})
    if (Buffer.isBuffer(img)) {
      e.reply(Segment.image(img))
    } else {
      e.reply('截图失败了')
    }
  },
  [/^pic/]
)
export const PicPrivate = Private.ok
