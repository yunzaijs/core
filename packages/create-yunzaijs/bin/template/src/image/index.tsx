import React from 'react'
import { render, ObtainProps } from 'jsxp'
import Hello from './views/hello.js'
export const screenshotRender = (Props: ObtainProps<typeof Hello>) => {
  // 生成 html 地址 或 html字符串
  return render({
    path: 'help',
    name: `help.html`,
    component: <Hello {...Props} />
  })
}
