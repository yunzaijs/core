import '../init/index'
import Koa from 'koa'
import KoaStatic from 'koa-static'
import Router from 'koa-router'
import { Dirent, readdirSync } from 'fs'
import { join } from 'path'
import mount from 'koa-mount'
import { Component } from '../utils/index.js'
export * from './types.js'

const PATH = process.cwd().replace(/\\/g, '\\\\')

/**
 *
 * @param Router
 * @returns
 */
const Dynamic = async (Router: Dirent) => {
  const modulePath = `file://${join(Router.parentPath, Router.name)}?update=${Date.now()}`
  return (await import(modulePath))?.default
}

/**
 *
 * @param Port
 */
export async function createServer(Port = 8080) {
  //
  const Com = new Component()
  const app = new Koa()
  const router = new Router()

  // 得到plugins目录
  const flies = readdirSync(join(process.cwd(), 'plugins'), {
    withFileTypes: true
  })
    .filter(flie => !flie.isFile())
    .map(flie => {
      const dir = flie?.path ?? flie?.parentPath
      flie.parentPath = dir
      return flie
    }) // 增加兼容性

  //
  const Routers = []

  // 解析路由
  for (const flie of flies) {
    const plugins = readdirSync(join(flie?.parentPath, flie.name), {
      withFileTypes: true
    })
      .filter(
        flie => flie.isFile() && /^(routes.jsx|routes.tsx)$/.test(flie.name)
      )
      .map(flie => {
        const dir = flie?.path ?? flie?.parentPath
        flie.parentPath = dir
        return flie
      }) // 增加兼容性

    //
    for (const plugin of plugins) {
      const routes = await Dynamic(plugin)
      // 不存在
      if (!routes) continue
      // 不是数组
      if (!Array.isArray(routes)) continue
      //
      for (const item of routes) {
        const url = `/${flie.name}${item.url}`
        console.log(`http://127.0.0.1:${Port}${url}`)
        Routers.push({
          parentPath: plugin.parentPath,
          name: plugin.name,
          uri: url,
          url: item.url
        })
      }
    }
  }

  for (const Router of Routers) {
    router.get(Router.uri, async ctx => {
      // 动态加载
      const routes = await Dynamic(Router)
      // 不存在
      if (!routes) return
      // 不是数组
      if (!Array.isArray(routes)) return
      // 查找
      const item = routes.find(i => i.url == Router.url)
      // 丢失了
      if (!item) return
      /**
       * 渲染html
       */
      const options = item?.options ?? {}
      const HTML = Com.create(item.element, {
        ...options,
        file_create: false,
        server: true
      })
      // 置换为file请求
      ctx.body = HTML
    })
  }

  // static
  app.use(mount('/file', KoaStatic(PATH)))

  // routes
  app.use(router.routes())

  // listen 8000
  app.listen(Port, () => {
    console.log('______________')
    console.log('Server is running on port ' + Port)
    console.log('______________')
    console.log('自行调整默认浏览器尺寸 800 X 1280 100%')
    console.log('如果需要运行时重新计算className')
    console.log('请确保一直打开此程序')
    console.log('______________')
  })
}
