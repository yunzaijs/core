import { Client, createLogin, Processor } from 'yunzai'
setTimeout(async () => {
  await createLogin()
  await Client.run().then(async () => {
    await Processor.install(['yunzai.config.ts', 'yunzai.config.json'])
  })
}, 0)
