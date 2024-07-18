import { fileURLToPath } from 'url'
import { dirname } from 'path'
export const app = {
  cwd() {
    return dirname(fileURLToPath(import.meta.url))
  }
}
