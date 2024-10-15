import lodash from 'lodash'
import util from 'node:util'

/**
 *
 * @param data
 * @returns
 */
export const isPromise = data => util.types.isPromise(data)

/**
 *
 * @param data
 * @param fn
 */
export async function forEach(data, fn) {
  if (lodash.isArray(data)) {
    for (let idx = 0; idx < data.length; idx++) {
      let ret = fn(data[idx], idx)
      ret = isPromise(ret) ? await ret : ret
      if (ret === false) {
        break
      }
    }
  } else if (lodash.isPlainObject(data)) {
    for (const idx in data) {
      let ret = fn(data[idx], idx)
      ret = isPromise(ret) ? await ret : ret
      if (ret === false) {
        break
      }
    }
  }
}
