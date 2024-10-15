import chokidar from 'chokidar'
import template from 'art-template'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

/**
 *
 * 这是被废弃的截图工具
 * 请积极使用最新版
 * @deprecated 已废弃
 */
export default class Renderer {
  id = null
  type = null
  render = null
  dir = './temp/html'
  html = {}
  watcher = {}
  /**
   * 渲染器
   * @param data.id 渲染器ID
   * @param data.type 渲染器类型
   * @param data.render 渲染器入口
   */
  constructor(data?: { id?: any; type?: any; render?: any }) {
    /** 渲染器ID */
    this.id = data.id || 'renderer'
    /** 渲染器类型 */
    this.type = data.type || 'image'
    /** 渲染器入口 */
    this.render = this[data.render || 'render']
    /** 确保目录存在 */
    mkdirSync(this.dir, { recursive: true })
  }
  /**
   * 模板
   * @param name
   * @param data
   * @returns
   */
  dealTpl(name: string, data: any) {
    const { tplFile, saveId = name } = data
    const savePath = `./temp/html/${name}/${saveId}.html`
    /** 读取html模板 */
    if (!this.html[tplFile]) {
      /** 确保目录存在 */
      mkdirSync(`./temp/html/${name}`, { recursive: true })
      try {
        this.html[tplFile] = readFileSync(tplFile, 'utf8')
      } catch (error) {
        logger.error(`加载html错误：${tplFile}`)
        return false
      }
      this.watch(tplFile)
    }
    data.resPath = `./resources/`
    /** 替换模板 */
    const tmpHtml = template.render(this.html[tplFile], data)
    /** 保存模板 */
    writeFileSync(savePath, tmpHtml)
    logger.debug(`[图片生成][使用模板] ${savePath}`)
    return savePath
  }
  /**
   * 监听配置文件
   * @param tplFile
   * @returns
   */
  watch(tplFile: string) {
    if (this.watcher[tplFile]) return
    const watcher = chokidar.watch(tplFile)
    watcher.on('change', () => {
      delete this.html[tplFile]
      logger.mark(`[修改html模板] ${tplFile}`)
    })
    this.watcher[tplFile] = watcher
  }
}

/**
 * global.Renderer
 */
global.Renderer = Renderer
