import React from 'react'
import { render } from 'jsxp'
import { Help } from './component/index'

/**
 *
 * @param Props
 * @returns
 */
export const screenshotRender = (Props: Parameters<typeof Help>[0]) => {
  return render({
    path: 'help',
    name: `help.html`,
    component: <Help {...Props} />
  })
}

export * from './component/index'
