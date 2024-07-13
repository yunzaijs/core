import { createRequire } from 'module'
const require = createRequire(import.meta.url)
/**
 * @type {import('tailwindcss').Config}
 */
export default {
  /**
   * 仅对plugins目录下的jsx、tsx、html文件生效
   */
  content: [
    // 直接识别 生成后的
    './data/component/**/*.{jsx,tsx,html}',
    // 识别插件里的
    './plugins/**/*.{jsx,tsx,html}',
    // 额外插件
    'node_modules/preline/dist/*.js'
  ],
  /**
   * 并不加入preline的js逻辑
   * 需要开发并使用js交互效果
   * 请自行建立独立的web环境
   */
  plugins: [
    /**
     * 组件库
     * https://preline.co/
     */
    require('preline/plugin')
  ]
}
