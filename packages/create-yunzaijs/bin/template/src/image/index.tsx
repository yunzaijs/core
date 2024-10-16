import React from 'react'
import { render } from 'jsxp'
import { Help } from './component/index'
export const screenshotRender = (Props: Parameters<typeof Help>[0]) => {
  // 生成 html 地址 或 html字符串
  return render({
    path: 'help',
    name: `help.html`,
    component: <Help {...Props} />
  })
}
export * from './component/index'
