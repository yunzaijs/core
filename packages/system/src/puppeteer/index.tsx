import React from 'react'
import {
  ComponentCreateOpsionType,
  createRequire,
  render
} from 'react-puppeteer'
import { Help } from './component/index'
const require = createRequire(import.meta.url)
export const DefineOptions: ComponentCreateOpsionType = {
  html_head: (
    <link rel="stylesheet" href={require('../../assets/css/help.css')} />
  )
}
export const screenshotRender = (Props: Parameters<typeof Help>[0]) => {
  // 生成 html 地址 或 html字符串
  return render({
    join_dir: 'help',
    html_name: `help.html`,
    ...DefineOptions,
    html_body: <Help {...Props} />
  })
}
export * from './component/index'
