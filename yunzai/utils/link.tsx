import React from 'react'
import { renderToString } from 'react-dom/server'
import { MainCSS, OutputCSS } from '../css.url'
/**
 * 得到基础link组件
 * @returns
 */
export const getLink = () => {
  return renderToString(
    <>
      <link rel="stylesheet" href={OutputCSS} />
      <link rel="stylesheet" href={MainCSS} />
    </>
  )
}
