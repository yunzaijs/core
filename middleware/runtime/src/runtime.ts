import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { filter, repeat } from 'lodash-es'
import * as common from 'yunzai'
import {
  BOT_NAME,
  ConfigController as CFG,
  Handler,
  puppeteer,
  type EventEmun
} from 'yunzai'
import { GSCfg as gsCfg, MysApi, MysInfo, NoteUser, MysUser } from 'yunzai-mys'
export class Runtime {
  #mysInfo = {}

  #e:
    | Parameters<EventEmun['message.group']>[0]
    | Parameters<EventEmun['message.private']>[0]

  constructor(
    e:
      | Parameters<EventEmun['message.group']>[0]
      | Parameters<EventEmun['message.private']>[0]
  ) {
    this.#e = e
  }

  get handler() {
    return Handler
  }

  /**
   *
   */
  get user() {
    return this.#e.user
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   */
  get uid() {
    return this.user?.uid
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   */
  get hasCk() {
    return this.user?.hasCk
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   */
  get cfg() {
    return CFG
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   */
  get gsCfg() {
    return gsCfg
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   */
  get common() {
    return common
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   */
  get puppeteer() {
    return puppeteer
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   */
  get MysInfo() {
    return MysInfo
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   */
  get NoteUser() {
    return NoteUser
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   */
  get MysUser() {
    return MysUser
  }
  /**
   *
   * @deprecated 不符合架构设计，已废弃
   *
   * 获取MysInfo实例
   *
   * @param targetType all: 所有用户均可， cookie：查询用户必须具备Cookie
   * @returns {Promise<boolean|MysInfo>}
   */
  async getMysInfo(targetType = 'all') {
    if (!this.#mysInfo[targetType]) {
      this.#mysInfo[targetType] = await MysInfo.init(
        this.#e,
        targetType === 'cookie' ? 'detail' : 'roleIndex'
      )
    }
    return this.#mysInfo[targetType]
  }
  /**
   *
   * @deprecated 不符合架构设计，已废弃
   *
   * @returns
   */
  async getUid() {
    return await MysInfo.getUid(this.#e)
  }
  /**
   *
   * @deprecated 不符合架构设计，已废弃
   *
   * 获取MysApi实例
   * @param targetType all: 所有用户均可， cookie：查询用户必须具备Cookie
   * @param option MysApi option
   * @param isSr 是否为星穹铁道
   * @returns {Promise<boolean|MysApi>}
   */
  async getMysApi(targetType = 'all', option = {}, isSr = false) {
    let mys = await this.getMysInfo(targetType)
    if (mys.uid && mys?.ckInfo?.ck) {
      return new MysApi(mys.uid, mys.ckInfo.ck, option, isSr)
    }
    return false
  }
  /**
   * 生成MysApi实例
   *
   * @deprecated 不符合架构设计，已废弃
   *
   * @param uid
   * @param ck
   * @param option
   * @param isSr 是否为星穹铁道
   * @returns {Promise<MysApi>}
   */
  async createMysApi(uid, ck, option, isSr = false) {
    return new MysApi(uid, ck, option, isSr)
  }
  /**
   * @deprecated 不符合架构设计，已废弃
   *
   * @param plugin_name plugin key
   * @param path html文件路径，相对于plugin resources目录
   * @param data 渲染数据
   * @param cfg 渲染配置
   * @param cfg.retType 返回值类型
   * * default/空：自动发送图片，返回true
   * * msgId：自动发送图片，返回msg id
   * * base64: 不自动发送图像，返回图像base64数据
   * @param cfg.beforeRender({data}) 可改写渲染的data数据
   * @returns {Promise<boolean>}
   */
  async render(pluginName, basePath, data: any = {}, cfg: any = {}) {
    // 处理传入的path
    basePath = basePath.replace(/.html$/, '')
    let paths = filter(basePath.split('/'), p => !!p)
    basePath = paths.join('/')

    // 创建目录
    const mkdir = check => {
      let currDir = `${process.cwd()}/temp`
      for (let p of check.split('/')) {
        currDir = `${currDir}/${p}`
        if (!existsSync(currDir)) {
          mkdirSync(currDir)
        }
      }
      return currDir
    }

    const PName = 'miao-plugin'

    mkdir(`html/${pluginName}/${basePath}`)
    // 自动计算pluResPath
    const pluResPath = `../../../${repeat('../', paths.length)}plugins/${pluginName}/resources/`
    const miaoResPath = `../../../${repeat('../', paths.length)}plugins/${PName}/resources/`
    const layoutPath = `${process.cwd()}/plugins/${PName}/resources/common/layout/`
    // 渲染data
    data = {
      sys: {
        scale: 1
      },
      /** miao 相关参数 **/
      copyright: `Created By ${BOT_NAME}<span class="version">${CFG.package?.version ?? '4'}</span> `,
      _res_path: pluResPath,
      _miao_path: miaoResPath,
      _tpl_path: `${process.cwd()}/plugins/${PName}/resources/common/tpl/`,
      defaultLayout: layoutPath + 'default.html',
      elemLayout: layoutPath + 'elem.html',

      ...data,

      /** 默认参数 **/
      _plugin: pluginName,
      _htmlPath: basePath,
      pluResPath,
      tplFile: `./plugins/${pluginName}/resources/${basePath}.html`,
      saveId: data.saveId || data.save_id || paths[paths.length - 1],
      pageGotoParams: {
        waitUntil: 'networkidle2'
      }
    }
    // 处理beforeRender
    if (cfg.beforeRender) {
      data = cfg.beforeRender({ data }) || data
    }
    // 保存模板数据
    if (process.argv.includes('dev')) {
      // debug下保存当前页面的渲染数据，方便模板编写与调试
      // 由于只用于调试，开发者只关注自己当时开发的文件即可，暂不考虑app及plugin的命名冲突
      const saveDir = mkdir(`ViewData/${pluginName}`)
      const file = `${saveDir}/${data._htmlPath.split('/').join('_')}.json`
      writeFileSync(file, JSON.stringify(data))
    }
    // 截图
    const base64 = await puppeteer.screenshot(`${pluginName}/${basePath}`, data)
    if (cfg.retType === 'base64') return base64
    let ret = true
    if (base64) {
      if (cfg.recallMsg) {
        ret = await this.#e.reply(base64, false, {})
      } else {
        ret = await this.#e.reply(base64)
      }
    }
    return cfg.retType === 'msgId' ? ret : true
  }
}
