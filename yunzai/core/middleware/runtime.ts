import { filter, repeat } from 'lodash-es'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
// config
import { BOT_NAME } from '../../config/system.js'
// config
import CFG from '../../config/config.js'
// utils
import puppeteer from '../../utils/puppeteer/puppeteer.js'
import * as common from '../../utils/common.js'
//
import Handler from '../plugins/handler.js'
// mys
import {
  gsCfg,
  mysApi as MysApi,
  mysInfo as MysInfo,
  NoteUser,
  MysUser
} from '../../mys/index.js'

/**
 * 这是专属于原神的模块
 * 这在未来是要废弃的
 *
 * 会制作成 机器人 中间件
 *
 * @deprecated 已废弃
 */
export default class Runtime {
  e = null
  _mysInfo = null
  handler = null

  /**
   *
   * @param e
   */
  constructor(e) {
    this.e = e
    this._mysInfo = {}
    this.handler = {
      has: Handler.has,
      call: Handler.call,
      callAll: Handler.callAll
    }
  }

  /**
   *
   */
  get uid() {
    return this.user?.uid
  }

  /**
   *
   */
  get hasCk() {
    return this.user?.hasCk
  }

  /**
   *
   */
  get user() {
    return this.e.user
  }

  /**
   *
   */
  get cfg() {
    return CFG
  }

  /**
   *
   */
  get gsCfg() {
    return gsCfg
  }

  /**
   *
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
   *
   */
  get MysInfo() {
    return MysInfo
  }

  /**
   *
   */
  get NoteUser() {
    return NoteUser
  }

  /**
   *
   */
  get MysUser() {
    return MysUser
  }

  /**
   *
   * @param e
   * @returns
   */
  static async init(e) {
    await MysInfo.initCache()
    const runtime = new Runtime(e)
    e.runtime = runtime
    await runtime.initUser()
    return runtime
  }

  /**
   * 初始化
   */
  async initUser() {
    let e = this.e
    let user = await NoteUser.create(e)
    if (user) {
      // 对象代理
      e.user = new Proxy(user, {
        get(self, key) {
          let game = e.game
          let fnMap = {
            uid: 'getUid',
            uidList: 'getUidList',
            mysUser: 'getMysUser',
            ckUidList: 'getCkUidList'
          }
          if (fnMap[key]) {
            return self[fnMap[key]](game)
          }
          if (key === 'uidData') {
            return self.getUidData('', game)
          }
          // 不能将类型“symbol”分配给类型“string”。
          if (
            [
              'getUid',
              'getUidList',
              'getMysUser',
              'getCkUidList',
              'getUidMapList',
              'getGameDs'
            ].includes(key as string)
          ) {
            return (_game, arg2) => {
              return self[key](_game || game, arg2)
            }
          }
          // 不能将类型“symbol”分配给类型“string”。
          if (
            [
              'getUidData',
              'hasUid',
              'addRegUid',
              'delRegUid',
              'setMainUid'
            ].includes(key as string)
          ) {
            return (uid, _game = '') => {
              return self[key](uid, _game || game)
            }
          }
          return self[key]
        }
      })
    }
  }

  /**
   * 获取MysInfo实例
   *
   * @param targetType all: 所有用户均可， cookie：查询用户必须具备Cookie
   * @returns {Promise<boolean|MysInfo>}
   */
  async getMysInfo(targetType = 'all') {
    if (!this._mysInfo[targetType]) {
      this._mysInfo[targetType] = await MysInfo.init(
        this.e,
        targetType === 'cookie' ? 'detail' : 'roleIndex'
      )
    }
    return this._mysInfo[targetType]
  }

  /**
   *
   * @returns
   */
  async getUid() {
    return await MysInfo.getUid(this.e)
  }

  /**
   * 获取MysApi实例
   *
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
  async render(
    plugin_name: string,
    basePath: string,
    data: {
      [key: string]: any
      saveId?: any
      save_id?: any
      _htmlPath?: any
    } = {},
    cfg: {
      [key: string]: any
      retType?: any
      recallMsg?: any
      beforeRender?: any
    } = {}
  ) {
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

    mkdir(`html/${plugin_name}/${basePath}`)
    // 自动计算pluResPath
    const pluResPath = `../../../${repeat('../', paths.length)}plugins/${plugin_name}/resources/`
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
      _plugin: plugin_name,
      _htmlPath: basePath,
      pluResPath,
      tplFile: `./plugins/${plugin_name}/resources/${basePath}.html`,
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
      const saveDir = mkdir(`ViewData/${plugin_name}`)
      const file = `${saveDir}/${data._htmlPath.split('/').join('_')}.json`
      writeFileSync(file, JSON.stringify(data))
    }
    // 截图
    const base64 = await puppeteer.screenshot(
      `${plugin_name}/${basePath}`,
      data
    )
    if (cfg.retType === 'base64') {
      return base64
    }
    let ret = true
    if (base64) {
      if (cfg.recallMsg) {
        ret = await this.e.reply(base64, false, {})
      } else {
        ret = await this.e.reply(base64)
      }
    }
    return cfg.retType === 'msgId' ? ret : true
  }
}
