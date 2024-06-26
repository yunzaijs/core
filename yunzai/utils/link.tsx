import React from 'react'
import { renderToString } from 'react-dom/server'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const output = require('../../public/output.css')
const main = require('../main.css')
/**
 * 得到基础link组件
 * @returns
 */
export const getLink = () => {
  return renderToString(
    <>
      <link rel="stylesheet" href={output} />
      <link rel="stylesheet" href={main} />
    </>
  )
}
