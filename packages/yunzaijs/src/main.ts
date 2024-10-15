import { createLogin } from './config/login.js'
import { Client, Processor } from './core/index.js'
if (process.argv0.includes('--run-client')) {
  setTimeout(async () => {
    await createLogin()
    await Client.run().then(async () => {
      await Processor.install(['yunzai.config.ts', 'yunzai.config.json'])
    })
  }, 0)
}
