import { watch } from 'chokidar'
import { parse } from 'yaml'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { createRequire } from 'module'
import { CONFIG_DEFAULT_PATH, CONFIG_INIT_PATH } from '@/config/system.js'
const require = createRequire(import.meta.url)

/**
 * ********
 * 配置文件
 * ********
 */
export class ProcessConfig {
  #config = {}
  #watcher = { config: {}, defSet: {} }
  #package = null
  constructor() {
    const files = readdirSync(CONFIG_DEFAULT_PATH).filter(file => file.endsWith('.yaml'))
    mkdirSync(CONFIG_INIT_PATH, { recursive: true })
    for (const file of files) {
      if (!existsSync(join(CONFIG_INIT_PATH, file))) {
        copyFileSync(join(CONFIG_DEFAULT_PATH, file), join(CONFIG_INIT_PATH, file))
      }
    }
  }

  /**
   * bot配置
   * @returns 
   */
  get bot() {
    const bot = this.getConfig('bot')
    const defbot = this.getDefSet('bot')
    const Config = { ...defbot, ...bot }
    // platform
    Config.platform = this.platform
    // /data/icqq/qq
    Config.data_dir = join(process.cwd(), `/data/icqq/${this.qq}`)
    // ffmpeg
    if (!Config?.ffmpeg_path) delete Config.ffmpeg_path
    // ffprobe
    if (!Config?.ffprobe_path) delete Config.ffprobe_path
    return Config
  }

  /**
   * 群配置
   * @returns 
   */
  get group() {
    const defCfg = this.getDefSet('group')
    const config = this.getConfig('group')
    return { ...defCfg, ...config }
  }

  /**
   * @returns 
   */
  get notice() {
    const def = this.getDefSet('notice')
    const config = this.getConfig('notice')
    return { ...def, ...config }
  }

  /**
   * @returns 
   */
  get other() {
    const def = this.getDefSet('other')
    const config = this.getConfig('other')
    // 格式化 masterQQ
    config.masterQQ = config?.masterQQ || []
    if (Array.isArray(config.masterQQ)) {
      config.masterQQ = config.masterQQ.map(item => String(item))
    } else {
      config.masterQQ = [String(config.masterQQ)]
    }
    return { ...def, ...config }
  }

  /**
   * @returns 
   */
  get puppeteer() {
    return this.getConfig('puppeteer')
  }

  /**
   *  qq账号
   * @returns 
   */
  get qq() {
    return Number(this.getConfig('qq').qq)
  }

  /**
   * qq密码
   * @returns 
   */
  get pwd() {
    return String(this.getConfig('qq').pwd)
  }

  /**
   * qq平台
   * @returns 
   */
  get platform() {
    return Number(this.getConfig('qq').platform)
  }


  /**
   * @returns 
   */
  get redis() {
    return this.getConfig('redis')
  }

  /**
   * @returns 
   */
  get renderer() {
    return this.getConfig('renderer');
  }


  /**
   * 得到默认配置
   * @param name 配置文件名称
   * @returns 
   */
  getDefSet(name: string) {
    return this.getYaml('default_config', name)
  }

  /**
   * 得到生成式配置
   * @param name 
   * @returns 
   */
  getConfig(name: string) {
    return this.getYaml('config', name)
  }

  /**
   * 获取配置yaml
   * @param type  
   * @param name 名称
   */
  getYaml(type: 'config' | 'default_config', name: string) {
    let file = join(CONFIG_INIT_PATH, `${name}.yaml`)
    if (type == 'default_config') {
      file = (join(CONFIG_DEFAULT_PATH, `${name}.yaml`))
    }
    const key = `${type}.${name}`
    // 存在则读取
    if (this.#config[key]) return this.#config[key]
    // 不存在的
    const data = readFileSync(file, 'utf8')
    this.#config[key] = parse(data)
    // 监听
    this.watch(file, name, type)
    return this.#config[key]
  }

  /**
   * 监听配置文件
   * @param file 
   * @param name 
   * @param type 
   * @returns 
   */
  watch(file: string, name: string, type = 'default_config') {
    const key = `${type}.${name}`
    // 监听key
    if (this.#watcher[key]) return
    const watcher = watch(file)
    watcher.on('change', () => {
      // 清理缓存
      delete this.#config[key]
      // bot没启动
      if (typeof global.Bot == 'undefined') return
      // 修改
      logger.mark(`[修改配置文件][${type}][${name}]`)
    })
    this.#watcher[key] = watcher
  }


  /**
   * package.json 
   */
  get package() {
    if (this.#package) return this.#package
    try {
      const data = readFileSync(join(process.cwd(), 'package.json'), 'utf8')
      this.#package = JSON.parse(data)
      return this.#package
    } catch {
      return {
        version: '4'
      }
    }
  }


  /**
   * 
   */
  get pm2() {
    const dir = join(process.cwd(), 'pm2.config.cjs')
    return existsSync(dir) ? require(dir) : require('../../pm2/config.cjs')
  }


  /**
  * 群配置
  * @param groupId 
  * @returns 
  */
  getGroup(groupId: number | string = '') {
    const config = this.group
    if (config[groupId]) return { ...config.default, ...config[groupId] }
    return { ...config.default }
  }

}

/**
 * ********
 * 配置文件
 * ********
 * @deprecated 已废弃
 */
class ConfigController extends ProcessConfig {
  constructor() {
    // 继承
    super()
  }

  /**
   * @returns 
   * @deprecated 已废弃 请使用 this.other
   */
  getOther() {
    return this.other
  }

  /**
   * 得到主人QQ号
   * @deprecated 已废弃 请使用 this.other.masterQQ
   */
  get masterQQ() {
    return this.other?.masterQQ ?? []
  }

  /**
   * 得到默认配置
   * @param name 配置文件名称
   * @returns 
   * @deprecated 已废弃 请使用 this.getDefSet
   */
  getdefSet(name: string) {
    return this.getDefSet(name)
  }


}

export default new ConfigController()
