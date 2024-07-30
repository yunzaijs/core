import { exec } from 'child_process'
import { Plugin } from 'yunzai'

const getCommandOutput = command => {
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

export class ShellsTests extends Plugin {
  constructor() {
    super()
    this.name = '指令调试'
    this.priority = 5000
    this.rule = [
      {
        reg: /^#shell/,
        fnc: this.start.name,
        permission: 'master'
      }
    ]
  }

  async start() {
    const shell = this.e.msg.replace(/^#shell/, '')
    getCommandOutput(shell)
      .then(res => {
        this.e.reply(res.toString())
      })
      .catch(err => {
        this.e.reply(err.toString())
      })
  }
}
