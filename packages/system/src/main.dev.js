import { Client, createLogin, Processor } from 'yunzaijs'
setTimeout(async () => {
  await createLogin()
  await Client.run().then(async () => {
    // 读取yunzai.dev.js
    await Processor.install('yunzai.dev.js')
  })
}, 0)
