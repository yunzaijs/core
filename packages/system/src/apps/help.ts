import { Application, Segment } from 'yunzaijs'
import { screenshotRender } from '../image/index'
import { parse } from 'yaml'
import { createRequire } from 'jsxp'
import { readFileSync } from 'fs'
const require = createRequire(import.meta.url)
let cache: Buffer | null = null
export class help extends Application<'message'> {
  constructor(e) {
    super('message')
    if (e) this.e = e
    this.event = 'message'
    this.rule = [
      {
        reg: /^(#|\/)系统帮助$/,
        fnc: this.help.name
      },
      {
        reg: /^(#|\/)系统帮助缓冲释放/,
        fnc: this.helpDelete.name
      }
    ]
  }

  /**
   *
   */
  async helpDelete() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    cache = null
    this.e.reply('清理完成')
  }

  /**
   *
   * @returns
   */
  async help() {
    if (cache) {
      this.e.reply(Segment.image(cache))
      return
    }
    const dir = require('../../assets/yaml/help.yaml')
    try {
      const Data = parse(readFileSync(dir, 'utf-8'))
      const Bf = await screenshotRender({
        helpData: Data
      })
      if (Bf && typeof Bf !== 'string') {
        cache = Bf
      } else {
        this.e.reply('出错啦～')
        return
      }
      this.e.reply(Segment.image(cache))
    } catch {
      this.e.reply('出错啦～')
      return
    }
  }
}
