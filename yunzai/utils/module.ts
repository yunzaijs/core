import { createRequire } from 'module'

/**
 * @deprecated 已废弃
 * @returns
 */
export { createRequire }

/**
 * @deprecated 已废弃
 * @param path
 * @returns
 */
export function require(path: string) {
  return (url: string) => {
    return createRequire(url)(path)
  }
}

/**
 * 获取时间请求
 * @returns
 */
const now = () => `?t=${Date.now()}`

/**
 * ***********
 * 创建动态模块
 * @param basePath import.meta.url
 * @returns
 * 在env.NODE_ENV=='production'下禁用
 */
export const createDynamic = (basePath: string) => {
  /**
   * 与import作用相同
   * @param path 相对路径
   * @returns
   */
  return <T = any>(path: string): Promise<T> =>
    import(
      new URL(
        `${path}${process.env.NODE_ENV == 'production' ? '' : now()}`,
        basePath
      ).href
    )
}

/**
 * ***********
 * 创建动态组件
 * @param basePath import.meta.url
 * @returns
 * 在env.NODE_ENV=='production'下禁用
 */
export const createDynamicComponent = (basePath: string) => {
  /**
   * 与import作用相同
   * @param path 相对路径
   * @returns
   */
  return <T = any>(path: string): Promise<T> =>
    import(
      new URL(
        `${path}${process.env.NODE_ENV == 'production' ? '' : now()}`,
        basePath
      ).href
    )
}
