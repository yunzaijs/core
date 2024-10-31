import { LinkStyleSheet } from 'jsxp'
import React from 'react'
import css_output from './input.css'
export default (_ = {}) => {
  return (
    <html>
      <head>
        <LinkStyleSheet src={css_output} />
      </head>
      <body>
        <div className="show-image p-8 w-full "></div>
      </body>
    </html>
  )
}
