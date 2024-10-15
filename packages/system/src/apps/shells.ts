import { exec } from 'child_process'
import { Application } from 'yunzaijs'

/**
 *
 * @param command
 * @returns
 */
const getCommandOutput = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout.trim())
    })
  })
}

/**
 *
 */
export class CWD extends Application<'message'> {
  constructor() {
    super('message')
    // this.name = '系统指令调试'
    // this.priority = 5000
    this.rule = [
      {
        reg: /^\/cwd/,
        fnc: this.start.name
      }
    ]
  }

  /**
   *
   * @returns
   */
  async start() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const shell = this.e.msg.replace(/^\/cwd/, '')
    getCommandOutput(shell)
      .then(res => {
        this.e.reply(res.toString())
      })
      .catch(err => {
        this.e.reply(err.toString())
      })
  }
}
