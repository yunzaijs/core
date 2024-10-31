import { defineConfig } from 'lvyjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createServer as useJSXP } from 'jsxp'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const useYunzaiJS = async () => {
  const { Client, createLogin, Processor } = await import('yunzaijs')
  setTimeout(async () => {
    await createLogin()
    Client.run()
      .then(() => Processor.install(['yunzai.config.ts', 'yunzai.config.json']))
      .catch(console.error)
  }, 0)
}
export default defineConfig({
  plugins: [
    {
      name: 'alemon',
      useApp: () => process.argv.includes('--yunzai') && useYunzaiJS()
    },
    {
      name: 'jsxp',
      useApp: () => process.argv.includes('--view') && useJSXP()
    }
  ],
  build: {
    alias: {
      entries: [{ find: '@src', replacement: join(__dirname, 'src') }]
    }
  }
})
