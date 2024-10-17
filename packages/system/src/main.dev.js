import { Client, createLogin, Processor } from 'yunzaijs'
setTimeout(async () => {
  await createLogin()
  Client.run()
    .then(() => Processor.install(['yunzai.dev.ts']))
    .catch(console.error)
}, 0)
