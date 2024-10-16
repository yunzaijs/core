import { defineConfig } from 'lvyjs'
import { alias, files } from 'lvyjs/plugins'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export default defineConfig({
  plugins: [
    {
      name: 'yunzaijs',
      callback: async () => {
        console.log('yunzaijs')
        if (process.argv.includes('--yunzai')) {
          const { Client, createLogin, Processor } = await import('yunzaijs')
          setTimeout(async () => {
            await createLogin()
            await Client.run().then(async () => {
              await Processor.install([
                'yunzai.config.ts',
                'yunzai.config.json'
              ])
            })
          }, 0)
        }
      }
    },
    {
      name: 'jsxp',
      callback: async () => {
        console.log('JSXP', process.argv)
        if (process.argv.includes('--view')) {
          const { createServer } = await import('jsxp')
          setTimeout(async () => {
            await createServer()
          }, 0)
        }
      }
    }
  ],
  build: {
    plugins: [
      alias({
        entries: [{ find: '@src', replacement: join(__dirname, 'src') }]
      }),
      files({ filter: /\.(png|jpg|jpeg|gif|svg)$/ })
    ]
  }
})
