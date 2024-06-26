import { existsSync, mkdirSync } from 'node:fs'
// init
import '../config/config.js'
const exists = ['data', 'resources', 'plugins']
for (const item of exists) {
  if (!existsSync(item)) {
    mkdirSync(item, {
      recursive: true
    })
  }
}
