import React from 'react'
import Music from '@src/image/views/music.js'
import Image from '@src/image/views/image.js'
import Hello from '@src/image/views/hello.js'
import { defineConfig } from 'jsxp'
export default defineConfig({
  routes: {
    '/word': {
      component: <Hello data={{ name: 'pages' }} movies={[]} />
    },
    '/music': {
      component: <Music />
    },
    '/image': {
      component: <Image />
    }
  }
})
