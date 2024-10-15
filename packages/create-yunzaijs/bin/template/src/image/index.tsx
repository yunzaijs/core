import React from 'react'
import { dirname } from 'path'
import { type ComponentCreateOpsionType, Picture } from 'react-puppeteer'
import Image from '@/image/views/image'
import { createRequire } from 'react-puppeteer'
const require = createRequire(import.meta.url)
export const DefineOptions: ComponentCreateOpsionType = {
  file_paths: {
    // 定位自身的 md文件，并获取目录地址
    '@yunzai': dirname(require('../../README.md')) // 开发环境下 等同于 process.cwd()
  },
  // <head> </head>
  html_head: (
    <link rel="stylesheet" href={require('../../public/output.css')} />
  ),
  // <head> </head>
  html_files: [require('../../assets/css/main.css')]
}
export class ScreenshotPicture extends Picture {
  constructor() {
    // 继承实例
    super()
    // 启动
    this.Pup.start()
  }
  /**
   *
   * @param uid
   * @param Props
   * @returns
   */
  createHelp(Props: Parameters<typeof Image>[0]) {
    return this.screenshot({
      // html/help/help.html
      join_dir: 'help',
      html_name: `help.html`,
      ...DefineOptions,
      // <body> </body>
      html_body: <Image {...Props} />
    })
  }
}
// 初始化 图片生成对象
export const Screenshot = new ScreenshotPicture()
