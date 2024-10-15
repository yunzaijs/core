import React from 'react'
import { parse } from 'yaml'
import { readFileSync } from 'fs'
import { defineConfig, createRequire } from 'react-puppeteer'
import { DefineOptions, Help } from './src/puppeteer/index'
const require = createRequire(import.meta.url)
export default defineConfig([
  {
    url: '/help',
    options: {
      ...DefineOptions,
      html_body: (
        <Help
          helpData={parse(
            readFileSync(require('./assets/yaml/help.yaml'), 'utf-8')
          )}
        />
      )
    }
  }
])
