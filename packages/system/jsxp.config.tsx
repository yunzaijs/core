import React from 'react'
import { parse } from 'yaml'
import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { defineConfig } from 'jsxp'
import { Help } from './src/image/index'
const require = createRequire(import.meta.url)
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
