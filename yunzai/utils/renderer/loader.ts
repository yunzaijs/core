import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import yaml from 'yaml'
import lodash from 'lodash'
import {
  ConfigController as cfg,
  CONFIG_INIT_PATH
} from '../../config/index.js'
import { join } from 'node:path'
import rendererFn from '../renderers/index.js'

/**
 * 加载渲染器
 * 这是被废弃的截图工具
 * 请积极使用最新版
 * @deprecated 已废弃
 */
class RendererLoader {
  /**
   *
   */
  renderers = new Map()
  /**
   *
   */
  dir = join(process.cwd(), 'renderers')
  /**
   *
   */
  watcher = {}
  /**
   *
   * @returns
   */
  static async init() {
    const render = new RendererLoader()
    await render.load()
    return render
  }
  /**
   *
   */
  async load() {
    mkdirSync(this.dir, { recursive: true })
    const subFolders = readdirSync(this.dir, { withFileTypes: true }).filter(
      dirent => dirent.isDirectory()
    )
    for (const subFolder of subFolders) {
      const name = subFolder.name
      try {
        const configFile = join(CONFIG_INIT_PATH, 'puppeteer.yaml')
        const rendererCfg = existsSync(configFile)
          ? yaml.parse(readFileSync(configFile, 'utf8'))
          : {}
        const renderer = rendererFn(rendererCfg)
        if (
          !renderer.id ||
          !renderer.type ||
          !renderer.render ||
          !lodash.isFunction(renderer.render)
        ) {
          logger.warn('渲染后端 ' + (renderer.id || subFolder.name) + ' 不可用')
        }
        this.renderers.set(renderer.id ?? 'puppeteer', renderer)
        logger.info(`加载渲染器:`, renderer.id)
      } catch (err) {
        logger.error(`渲染后端 ${name} 加载失败`)
        logger.error(err)
      }
    }
  }
  /**
   *
   * @param name
   * @returns
   */
  getRenderer(name = cfg.renderer?.name || 'puppeteer') {
    // TODO 渲染器降级
    return this.renderers.get(name)
  }
  /**
   *
   */
}
/**
 *
 * @deprecated 已废弃
 */
export default await RendererLoader.init()
