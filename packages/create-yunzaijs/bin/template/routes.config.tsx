import React from 'react'
import { defineConfig } from 'react-puppeteer'
import { DefineOptions } from '@/image/index.js'
import Music from '@/image/views/music.js'
import Image from '@/image/views/image.js'
import Hello from '@/image/views/hello.js'
export default defineConfig([
  {
    url: '/',
    options: {
      ...DefineOptions,
      html_body: <Hello data={{ name: 'pages' }} movies={[]} />
    }
  },
  {
    url: '/music',
    options: {
      ...DefineOptions,
      html_body: <Music />
    }
  },
  {
    url: '/image',
    options: {
      ...DefineOptions,
      html_body: <Image />
    }
  }
])
