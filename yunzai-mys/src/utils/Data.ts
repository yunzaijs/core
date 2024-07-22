import lodash from 'lodash'
import { existsSync, mkdirSync } from 'node:fs'
import util from 'node:util'

const _path = process.cwd()

/**
 *
 * @param root
 * @returns
 */
export function getRoot(root = '') {
  if (!root) {
    root = `${_path}/`
  } else if (root === 'root' || root === 'yunzai') {
    root = `${_path}/`
  } else if (root === 'miao') {
    root = `${_path}/plugins/miao-plugin/`
  } else {
    root = `${_path}/plugins/${root}/`
  }
  return root
}

/**
 *
 * @param path
 * @param root
 * @param includeFile
 */
export function createDir(path = '', root = '', includeFile = false) {
  root = getRoot(root)
  let pathList = path.split('/')
  let nowPath = root
  pathList.forEach((name, idx) => {
    name = name.trim()
    if (!includeFile && idx <= pathList.length - 1) {
      nowPath += name + '/'
      if (name) {
        if (!existsSync(nowPath)) {
          mkdirSync(nowPath)
        }
      }
    }
  })
}

/**
 *
 * @param data
 * @returns
 */
export function isPromise(data) {
  return util.types.isPromise(data)
}

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
