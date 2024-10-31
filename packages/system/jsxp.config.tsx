import React from 'react'
import { parse } from 'yaml'
import { readFileSync } from 'fs'
import { Help } from './src/image/index'
const require = createRequire(import.meta.url)
import { defineConfig, createRequire } from 'jsxp'
export default defineConfig({
  routes: {
    '/word': {
      component: (
        <Help
          helpData={parse(
            readFileSync(require('./src/assets/yaml/help.yaml'), 'utf-8')
          )}
        />
      )
    }
  }
})
