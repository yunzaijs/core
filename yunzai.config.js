import { defineConfig } from 'yunzai'
import runtime from 'yz-mw-runtime'
import starRail from 'yz-mw-star-rail'
import system from 'yz-system'
export default defineConfig({
  // 应用
  applications: [system()],
  // 中间件
  middlewares: [runtime(), starRail()]
})
