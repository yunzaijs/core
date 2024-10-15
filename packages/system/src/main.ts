import { Client, createLogin, Processor } from 'yunzaijs'
setTimeout(async () => {
  await createLogin()
  await Client.run().then(async () => {
    await Processor.install(['yunzai.config.ts', 'yunzai.config.json'])
  })
}, 0)
