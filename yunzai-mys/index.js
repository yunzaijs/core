import { randomRange, ConfigController, SQLITE_DB_DIR } from 'yunzai'
import lodash from 'lodash'
import { existsSync, mkdirSync, readFileSync, copyFileSync } from 'node:fs'
import util from 'node:util'
import moment from 'moment'
import YAML from 'yaml'
import chokidar from 'chokidar'
import fetch from 'node-fetch'
import md5 from 'md5'
import { Sequelize, Model, DataTypes } from 'sequelize'
import { join } from 'path'
import { join as join$1 } from 'node:path'

let apiTool$1 = class apiTool {
  uid = null
  isSr = false
  server = null
  game = 'genshin'
  constructor(uid, server, isSr = false) {
    uid && (this.uid = uid)
    typeof isSr != 'undefined' && (this.uid = uid)
    server && (this.server = server)
    this.game = 'genshin'
    if (isSr) this.game = 'honkaisr'
    if (typeof isSr !== 'boolean') this.game = isSr
  }
  getUrlMap = (data = {}) => {
    let host, hostRecord, hostPublicData
    if (
      ['cn_gf01', 'cn_qd01', 'prod_gf_cn', 'prod_qd_cn'].includes(this.server)
    ) {
      host = 'https://api-takumi.mihoyo.com/'
      hostRecord = 'https://api-takumi-record.mihoyo.com/'
      hostPublicData = 'https://public-data-api.mihoyo.com/'
    } else if (/os_|official/.test(this.server)) {
      host = 'https://sg-public-api.hoyolab.com/'
      hostRecord = 'https://bbs-api-os.hoyolab.com/'
      hostPublicData = 'https://sg-public-data-api.hoyoverse.com/'
    }
    let urlMap = {
      genshin: {
        ...(['cn_gf01', 'cn_qd01'].includes(this.server)
          ? {
              getFp: {
                url: `${hostPublicData}device-fp/api/getFp`,
                body: {
                  seed_id: data.seed_id,
                  device_id: data.deviceId.toUpperCase(),
                  platform: '1',
                  seed_time: new Date().getTime() + '',
                  ext_fields: `{"proxyStatus":"0","accelerometer":"-0.159515x-0.830887x-0.682495","ramCapacity":"3746","IDFV":"${data.deviceId.toUpperCase()}","gyroscope":"-0.191951x-0.112927x0.632637","isJailBreak":"0","model":"iPhone12,5","ramRemain":"115","chargeStatus":"1","networkType":"WIFI","vendor":"--","osVersion":"17.0.2","batteryStatus":"50","screenSize":"414×896","cpuCores":"6","appMemory":"55","romCapacity":"488153","romRemain":"157348","cpuType":"CPU_TYPE_ARM64","magnetometer":"-84.426331x-89.708435x-37.117889"}`,
                  app_name: 'bbs_cn',
                  device_fp: '38d7ee834d1e9'
                }
              }
            }
          : {
              getFp: {
                url: `${hostPublicData}device-fp/api/getFp`,
                body: {
                  seed_id: data.seed_id,
                  device_id: data.deviceId.toUpperCase(),
                  platform: '5',
                  seed_time: new Date().getTime() + '',
                  ext_fields: `{"userAgent":"Mozilla/5.0 (Linux; Android 11; J9110 Build/55.2.A.4.332; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBSOversea/2.55.0","browserScreenSize":"387904","maxTouchPoints":"5","isTouchSupported":"1","browserLanguage":"zh-CN","browserPlat":"Linux aarch64","browserTimeZone":"Asia/Shanghai","webGlRender":"Adreno (TM) 640","webGlVendor":"Qualcomm","numOfPlugins":"0","listOfPlugins":"unknown","screenRatio":"2.625","deviceMemory":"4","hardwareConcurrency":"8","cpuClass":"unknown","ifNotTrack":"unknown","ifAdBlock":"0","hasLiedLanguage":"0","hasLiedResolution":"1","hasLiedOs":"0","hasLiedBrowser":"0","canvas":"${randomRange()}","webDriver":"0","colorDepth":"24","pixelRatio":"2.625","packageName":"unknown","packageVersion":"2.27.0","webgl":"${randomRange()}"}`,
                  app_name: 'hk4e_global',
                  device_fp: '38d7f2364db95'
                }
              }
            }),
        index: {
          url: `${hostRecord}game_record/app/genshin/api/index`,
          query: `role_id=${this.uid}&server=${this.server}`
        },
        spiralAbyss: {
          url: `${hostRecord}game_record/app/genshin/api/spiralAbyss`,
          query: `role_id=${this.uid}&schedule_type=${data.schedule_type || 1}&server=${this.server}`
        },
        character: {
          url: `${hostRecord}game_record/app/genshin/api/character`,
          body: { role_id: this.uid, server: this.server }
        },
        dailyNote: {
          url: `${hostRecord}game_record/app/genshin/api/dailyNote`,
          query: `role_id=${this.uid}&server=${this.server}`
        },
        detail: {
          url: `${host}event/e20200928calculate/v1/sync/avatar/detail`,
          query: `uid=${this.uid}&region=${this.server}&avatar_id=${data.avatar_id}`
        },
        ys_ledger: {
          url: 'https://hk4e-api.mihoyo.com/event/ys_ledger/monthInfo',
          query: `month=${data.month}&bind_uid=${this.uid}&bind_region=${this.server}`
        },
        compute: {
          url: `${host}event/e20200928calculate/v3/batch_compute`,
          body: data.body
        },
        blueprintCompute: {
          url: `${host}event/e20200928calculate/v1/furniture/compute`,
          body: data.body
        },
        blueprint: {
          url: `${host}event/e20200928calculate/v1/furniture/blueprint`,
          query: `share_code=${data.share_code}&region=${this.server}`
        },
        avatarSkill: {
          url: `${host}event/e20200928calculate/v1/avatarSkill/list`,
          query: `avatar_id=${data.avatar_id}`
        },
        basicInfo: {
          url: `${hostRecord}game_record/app/genshin/api/gcg/basicInfo`,
          query: `role_id=${this.uid}&server=${this.server}`
        },
        deckList: {
          url: `${hostRecord}game_record/app/genshin/api/gcg/deckList`,
          query: `role_id=${this.uid}&server=${this.server}`
        },
        avatar_cardList: {
          url: `${hostRecord}game_record/app/genshin/api/gcg/cardList`,
          query: `limit=999&need_action=false&need_avatar=true&need_stats=true&offset=0&role_id=${this.uid}&server=${this.server}`
        },
        action_cardList: {
          url: `${hostRecord}game_record/app/genshin/api/gcg/cardList`,
          query: `limit=999&need_action=true&need_avatar=false&need_stats=true&offset=0&role_id=${this.uid}&server=${this.server}`
        },
        useCdk: {
          url: 'PLACE_HOLDER',
          query: null
        }
      },
      honkaisr: {
        ...(['prod_gf_cn', 'prod_qd_cn'].includes(this.server)
          ? {
              UserGame: {
                url: `${host}binding/api/getUserGameRolesByCookie`,
                query: `game_biz=hkrpg_cn&region=${this.server}&game_uid=${this.uid}`
              },
              getFp: {
                url: `${hostPublicData}device-fp/api/getFp`,
                body: {
                  seed_id: data.seed_id,
                  device_id: data.deviceId.toUpperCase(),
                  platform: '1',
                  seed_time: new Date().getTime() + '',
                  ext_fields: `{"proxyStatus":"0","accelerometer":"-0.159515x-0.830887x-0.682495","ramCapacity":"3746","IDFV":"${data.deviceId.toUpperCase()}","gyroscope":"-0.191951x-0.112927x0.632637","isJailBreak":"0","model":"iPhone12,5","ramRemain":"115","chargeStatus":"1","networkType":"WIFI","vendor":"--","osVersion":"17.0.2","batteryStatus":"50","screenSize":"414×896","cpuCores":"6","appMemory":"55","romCapacity":"488153","romRemain":"157348","cpuType":"CPU_TYPE_ARM64","magnetometer":"-84.426331x-89.708435x-37.117889"}`,
                  app_name: 'bbs_cn',
                  device_fp: '38d7ee834d1e9'
                }
              }
            }
          : {
              UserGame: {
                url: `${host}binding/api/getUserGameRolesByCookie`,
                query: `game_biz=hkrpg_global&region=${this.server}&game_uid=${this.uid}`
              },
              getFp: {
                url: `${hostPublicData}device-fp/api/getFp`,
                body: {
                  seed_id: data.seed_id,
                  device_id: data.deviceId.toUpperCase(),
                  platform: '5',
                  seed_time: new Date().getTime() + '',
                  ext_fields: `{"userAgent":"Mozilla/5.0 (Linux; Android 11; J9110 Build/55.2.A.4.332; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBSOversea/2.55.0","browserScreenSize":"387904","maxTouchPoints":"5","isTouchSupported":"1","browserLanguage":"zh-CN","browserPlat":"Linux aarch64","browserTimeZone":"Asia/Shanghai","webGlRender":"Adreno (TM) 640","webGlVendor":"Qualcomm","numOfPlugins":"0","listOfPlugins":"unknown","screenRatio":"2.625","deviceMemory":"4","hardwareConcurrency":"8","cpuClass":"unknown","ifNotTrack":"unknown","ifAdBlock":"0","hasLiedLanguage":"0","hasLiedResolution":"1","hasLiedOs":"0","hasLiedBrowser":"0","canvas":"${randomRange()}","webDriver":"0","colorDepth":"24","pixelRatio":"2.625","packageName":"unknown","packageVersion":"2.27.0","webgl":"${randomRange()}"}`,
                  app_name: 'hkrpg_global',
                  device_fp: '38d7f2364db95'
                }
              }
            }),
        index: {
          url: `${hostRecord}game_record/app/hkrpg/api/index`,
          query: `role_id=${this.uid}&server=${this.server}`
        },
        basicInfo: {
          url: `${hostRecord}game_record/app/hkrpg/api/role/basicInfo`,
          query: `role_id=${this.uid}&server=${this.server}`
        },
        spiralAbyss: {
          url: `${hostRecord}game_record/app/hkrpg/api/challenge`,
          query: `role_id=${this.uid}&schedule_type=${data.schedule_type || 1}&server=${this.server}`
        },
        avatarInfo: {
          url: `${hostRecord}game_record/app/hkrpg/api/avatar/info`,
          query: `need_wiki=true&role_id=${this.uid}&server=${this.server}`
        },
        ys_ledger: {
          url: `${host}event/srledger/month_info`,
          query: `lang=zh-cn&region=${this.server}&uid=${this.uid}&month=${data.month}`
        },
        character: {
          url: `${hostRecord}game_record/app/hkrpg/api/avatar/basic`,
          query: `role_id=${this.uid}&server=${this.server}`
        },
        dailyNote: {
          url: `${hostRecord}game_record/app/hkrpg/api/note`,
          query: `role_id=${this.uid}&server=${this.server}`
        },
        compute: {
          url: `${host}event/rpgcalc/compute?`,
          query: `game=hkrpg`,
          body: data.body
        },
        detail: {
          url: `${host}event/rpgcalc/avatar/detail`,
          query: `game=hkrpg&lang=zh-cn&item_id=${data.avatar_id}&tab_from=${data.tab_from}&change_target_level=0&uid=${this.uid}&region=${this.server}`
        }
      }
    }
    if (this.server.startsWith('os')) {
      urlMap.genshin.detail.url =
        'https://sg-public-api.hoyolab.com/event/calculateos/sync/avatar/detail'
      urlMap.genshin.detail.query = `lang=zh-cn&uid=${this.uid}&region=${this.server}&avatar_id=${data.avatar_id}`
      urlMap.genshin.avatarSkill.url =
        'https://sg-public-api.hoyolab.com/event/calculateos/avatar/skill_list'
      urlMap.genshin.avatarSkill.query = `lang=zh-cn&avatar_id=${data.avatar_id}`
      urlMap.genshin.compute.url =
        'https://sg-public-api.hoyolab.com/event/calculateos/compute'
      urlMap.genshin.blueprint.url =
        'https://sg-public-api.hoyolab.com/event/calculateos/furniture/blueprint'
      urlMap.genshin.blueprint.query = `share_code=${data.share_code}&region=${this.server}&lang=zh-cn`
      urlMap.genshin.blueprintCompute.url =
        'https://sg-public-api.hoyolab.com/event/calculateos/furniture/compute'
      urlMap.genshin.blueprintCompute.body = { lang: 'zh-cn', ...data.body }
      urlMap.genshin.ys_ledger.url =
        'https://sg-hk4e-api.hoyolab.com/event/ysledgeros/month_info'
      urlMap.genshin.ys_ledger.query = `lang=zh-cn&month=${data.month}&uid=${this.uid}&region=${this.server}`
      urlMap.genshin.useCdk.url =
        'https://sg-hk4e-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey'
      urlMap.genshin.useCdk.query = `uid=${this.uid}&region=${this.server}&lang=zh-cn&cdkey=${data.cdk}&game_biz=hk4e_global`
    }
    return urlMap[this.game]
  }
}

const _path = process.cwd()
function getRoot(root = '') {
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
function createDir(path = '', root = '', includeFile = false) {
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
function isPromise(data) {
  return util.types.isPromise(data)
}
async function forEach(data, fn) {
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

const games = [
  { key: 'gs', name: '原神' },
  { key: 'sr', name: '星穹铁道' }
]
var MysUtil = {
  getLtuid(data) {
    if (!data) {
      return false
    }
    if (/^\d{4,10}$/.test(data)) {
      return data
    }
    let testRet = /ltuid=(\d{4,10})/g.exec(data.ck || data)
    if (testRet && testRet[1]) {
      return testRet[1]
    }
    return false
  },
  getGameKey(game) {
    if (game.user_id) {
      return game.isSr ? 'sr' : 'gs'
    }
    return ['sr', 'star'].includes(game) ? 'sr' : 'gs'
  },
  getDeviceGuid() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (
      S4() +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      S4() +
      S4()
    )
  },
  async eachGame(fn) {
    await forEach(games, ds => {
      return fn(ds.key, ds)
    })
  },
  async eachServ(fn) {
    await forEach(['mys', 'hoyolab'], fn)
  }
}

const cacheMap = {}
const reFn = {}
let BaseModel$1 = class BaseModel {
  _uuid = null
  constructor() {
    return this
  }
  _getThis(model, id = '', time = 10 * 60) {
    const uuid = `${model}:${id}`
    this._uuid = uuid
    if (uuid && cacheMap[uuid]) {
      return cacheMap[uuid]._expire(time)
    }
  }
  _cacheThis(model, id, time = 10 * 60) {
    const uuid = this._uuid || `${model}:${id}`
    this._uuid = uuid
    if (uuid) {
      this._expire(time)
      cacheMap[uuid] = this
      return cacheMap[uuid]
    }
    return this
  }
  _expire(time = 10 * 60) {
    let id = this._uuid
    reFn[id] && clearTimeout(reFn[id])
    if (time > 0) {
      if (id) {
        reFn[id] = setTimeout(() => {
          reFn[id] && clearTimeout(reFn[id])
          delete reFn[id]
          delete cacheMap[id]
        }, time * 1000)
      }
      return cacheMap[id]
    }
  }
  _delCache() {
    let id = this._uuid
    reFn[id] && clearTimeout(reFn[id])
    delete reFn[id]
    delete cacheMap[id]
  }
  gameKey(game = 'gs') {
    return MysUtil.getGameKey(game)
  }
  isGs(game = 'gs') {
    return this.gameKey(game) === 'gs'
  }
  isSr(game = 'gs') {
    return this.gameKey(game) === 'sr'
  }
}

const BOT_MYS_GENSHIN = 'Yz:genshin:'
const BOT_NOTE_USER = 'Yz:NoteUser:'
const BOT_ROOT_KEY = 'Yz:cache:'

const servs = ['mys', 'hoyolab']
const EX = 3600 * 24
class DailyCache extends BaseModel$1 {
  keyPre = null
  constructor(uid, game = 'config') {
    super()
    const storeKey = DailyCache.getStoreKey(uid, game)
    let self = this._getThis('store', storeKey)
    if (self) {
      return self
    }
    this.keyPre = `${BOT_ROOT_KEY}${storeKey}`
    return this._cacheThis()
  }
  static create(uid, game = 'config') {
    return new DailyCache(uid, game)
  }
  static getStoreKey(uid, game = 'config') {
    let key
    if (!uid || game === 'config') {
      key = 'sys:config'
    } else {
      game = MysUtil.getGameKey(game)
      let serv = /^[6-9]|^hoyo|^os/i.test(uid) ? servs[1] : servs[0]
      key = `${game}:${serv}`
    }
    const date = moment().format('MM-DD')
    return `${key}-${date}`
  }
  static async eachCache(fn) {
    for (const serv of servs) {
      let cache = DailyCache.create(serv)
      if (cache) {
        await fn(cache)
      }
    }
  }
  static async clearOutdatedData() {
    let keys = await redis.keys(`${BOT_ROOT_KEY}*`)
    const date = moment().format('MM-DD')
    const testReg = new RegExp(
      `^${BOT_ROOT_KEY}(mys|hoyolab|config)-\\d{2}-\\d{2}`
    )
    const todayReg = new RegExp(`^${BOT_ROOT_KEY}(mys|hoyolab|config)-${date}`)
    for (let key of keys) {
      if (testReg.test(key) && !todayReg.test(key)) {
        await redis.del(key)
      }
    }
  }
  static decodeValue(value, decode = false) {
    if (value && decode) {
      try {
        return JSON.parse(value)
      } catch (e) {
        return false
      }
    }
    return value
  }
  static encodeValue(value) {
    if (typeof value === 'object') {
      return JSON.stringify(value) || ''
    }
    if (typeof value === 'undefined') {
      return ''
    }
    return '' + value
  }
  getTableKey(key, sub = '') {
    if (sub) {
      return `${this.keyPre}:${key}-${sub}`
    } else {
      return `${this.keyPre}:${key}`
    }
  }
  async exTable(table, hasCount = false) {
    await redis.expire(this.getTableKey(table), EX)
    if (hasCount) {
      await redis.expire(this.getTableKey(table, 'count'), EX)
    }
  }
  async empty(table) {
    await redis.del(this.getTableKey(table))
    await redis.del(this.getTableKey(table, 'count'))
  }
  async kGet(table, key, decode = false) {
    let value = await redis.hGet(this.getTableKey(table), '' + key)
    return DailyCache.decodeValue(value, decode)
  }
  async kSet(table, key, value) {
    value = DailyCache.encodeValue(value)
    await redis.hSet(this.getTableKey(table), '' + key, value)
    await this.exTable(this.getTableKey(table))
  }
  async kDel(table, key) {
    return await redis.hDel(this.getTableKey(table), '' + key)
  }
  async get(table, decode = false) {
    const tableKey = this.getTableKey(table)
    let value = await redis.get(tableKey)
    return DailyCache.decodeValue(value, decode)
  }
  async set(table, value) {
    value = DailyCache.encodeValue(value)
    return await redis.set(this.getTableKey(table), value, { EX })
  }
  async zAdd(table, key, item) {
    const tableKey = this.getTableKey(table)
    await redis.zAdd(tableKey, { score: key, value: item + '' })
    let count = (await this.zCount(table, key)) || 0
    const countKey = this.getTableKey(table, 'count')
    await redis.zAdd(countKey, { score: count, value: key + '' })
    await this.exTable(this.getTableKey(table), true)
  }
  async zList(table, key) {
    return await redis.zRangeByScore(this.getTableKey(table), key, key)
  }
  async zKey(table, item) {
    return await redis.zScore(this.getTableKey(table), item + '')
  }
  async zCount(table, key) {
    return await redis.zCount(this.getTableKey(table), key, key)
  }
  async zMinKey(table) {
    let keys = await redis.zRangeByScore(
      this.getTableKey(table, 'count'),
      0,
      60
    )
    return keys[0]
  }
  async zDisableKey(table, key, delCount = false) {
    const countKey = this.getTableKey(table, 'count')
    if (delCount) {
      await redis.zRem(countKey, key)
    } else {
      await redis.zAdd(countKey, { score: 99, value: key })
    }
  }
  async zGetDisableKey(table) {
    return await redis.zRangeByScore(this.getTableKey(table, 'count'), 99, 99)
  }
  async zDel(table, key, delCount = false) {
    key = key + ''
    let check = redis.zScore(this.getTableKey(table, 'count'), key)
    await redis.zRemRangeByScore(this.getTableKey(table), key, key)
    await this.zDisableKey(table, key, delCount)
    return !!check
  }
  async zStat(table) {
    const countKey = this.getTableKey(table, 'count')
    return await redis.zRangeByScoreWithScores(countKey, 0, 100)
  }
}

let HttpsProxyAgent = null
class MysApi {
  uid = null
  cookie = null
  isSr = null
  server = null
  apiTool = null
  cacheCd = 300
  _device = null
  option = null
  constructor(uid, cookie, option = {}, isSr = false, device = '') {
    this.uid = uid
    this.cookie = cookie
    this.isSr = isSr
    this.server = this.getServer()
    this.apiTool = new apiTool$1(uid, this.server, isSr)
    this.cacheCd = 300
    this._device = device
    this.option = {
      log: true,
      ...option
    }
  }
  get device() {
    if (!this._device) this._device = `Yz-${md5(this.uid).substring(0, 5)}`
    return this._device
  }
  getUrl(type, data = {}) {
    const urlMap = this.apiTool.getUrlMap({ ...data, deviceId: this.device })
    if (!urlMap[type]) return false
    let { url, query = '', body = '' } = urlMap[type]
    if (query) url += `?${query}`
    if (body) body = JSON.stringify(body)
    const headers = this.getHeaders(query, body)
    return { url, headers, body }
  }
  getServer() {
    switch (String(this.uid).slice(0, -8)) {
      case '1':
      case '2':
        return this.isSr ? 'prod_gf_cn' : 'cn_gf01'
      case '5':
        return this.isSr ? 'prod_qd_cn' : 'cn_qd01'
      case '6':
        return this.isSr ? 'prod_official_usa' : 'os_usa'
      case '7':
        return this.isSr ? 'prod_official_euro' : 'os_euro'
      case '8':
      case '18':
        return this.isSr ? 'prod_official_asia' : 'os_asia'
      case '9':
        return this.isSr ? 'prod_official_cht' : 'os_cht'
    }
    return this.isSr ? 'prod_gf_cn' : 'cn_gf01'
  }
  _device_fp = null
  async getData(type, data = {}, cached = false) {
    if (
      !this._device_fp &&
      !data?.Getfp &&
      !data?.headers?.['x-rpc-device_fp']
    ) {
      this._device_fp = await this.getData('getFp', {
        seed_id: this.generateSeed(16),
        Getfp: true
      })
    }
    if (type === 'getFp' && !data?.Getfp) return this._device_fp
    const UrlData = this.getUrl(type, data)
    if (!UrlData) return false
    let { url, headers, body } = UrlData
    if (!url) return false
    let cacheKey = this.cacheKey(type, data)
    let cahce = await redis.get(cacheKey)
    if (cahce) return JSON.parse(cahce)
    headers.Cookie = this.cookie
    if (data.headers) {
      headers = { ...headers, ...data.headers }
    }
    if (
      type !== 'getFp' &&
      !headers['x-rpc-device_fp'] &&
      this._device_fp.data?.device_fp
    ) {
      headers['x-rpc-device_fp'] = this._device_fp.data.device_fp
    }
    let param = {
      method: null,
      body: null,
      headers,
      agent: await this.getAgent(),
      timeout: 10000
    }
    if (body) {
      param.method = 'post'
      param.body = body
    } else {
      param.method = 'get'
    }
    let start = Date.now()
    try {
      const response = await fetch(url, param)
      if (!response.ok) {
        logger.error(
          `[米游社接口][${type}][${this.uid}] ${response.status} ${response.statusText}`
        )
        return false
      }
      if (this.option.log) {
        logger.mark(
          `[米游社接口][${type}][${this.uid}] ${Date.now() - start}ms`
        )
      }
      const data = await response.json()
      if (!data) {
        logger.mark('mys接口没有返回')
        return false
      }
      data.api = type
      if (cached) this.cache(data, cacheKey)
      return data
    } catch (error) {
      logger.error(error.toString())
      return false
    }
  }
  getHeaders(query = '', body = '') {
    const cn = {
      app_version: '2.40.1',
      User_Agent: `Mozilla/5.0 (Linux; Android 12; ${this.device}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.73 Mobile Safari/537.36 miHoYoBBS/2.40.1`,
      client_type: '5',
      Origin: 'https://webstatic.mihoyo.com',
      X_Requested_With: 'com.mihoyo.hyperion',
      Referer: 'https://webstatic.mihoyo.com/'
    }
    const os = {
      app_version: '2.55.0',
      User_Agent:
        'Mozilla/5.0 (Linux; Android 11; J9110 Build/55.2.A.4.332; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBSOversea/2.55.0',
      client_type: '2',
      Origin: 'https://act.hoyolab.com',
      X_Requested_With: 'com.mihoyo.hoyolab',
      Referer: 'https://act.hoyolab.com/'
    }
    let client
    if (/os_|official/.test(this.server)) {
      client = os
    } else {
      client = cn
    }
    return {
      'x-rpc-app_version': client.app_version,
      'x-rpc-client_type': client.client_type,
      'User-Agent': client.User_Agent,
      'Referer': client.Referer,
      'DS': this.getDs(query, body),
      'Cookie': null
    }
  }
  getDs(q = '', b = '') {
    let n = ''
    if (
      ['cn_gf01', 'cn_qd01', 'prod_gf_cn', 'prod_qd_cn'].includes(this.server)
    ) {
      n = 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs'
    } else if (/os_|official/.test(this.server)) {
      n = 'okr4obncj8bw5a65hbnn5oo6ixjc3l9w'
    }
    let t = Math.round(new Date().getTime() / 1000)
    let r = Math.floor(Math.random() * 900000 + 100000)
    let DS = md5(`salt=${n}&t=${t}&r=${r}&b=${b}&q=${q}`)
    return `${t},${r},${DS}`
  }
  getGuid() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (
      S4() +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      S4() +
      S4()
    )
  }
  cacheKey(type, data) {
    return `${BOT_MYS_GENSHIN}mys:cache:${md5(this.uid + type + JSON.stringify(data))}`
  }
  async cache(res, cacheKey) {
    if (!res || res.retcode !== 0) return
    redis.setEx(cacheKey, this.cacheCd, JSON.stringify(res))
  }
  async getAgent() {
    let proxyAddress = ConfigController.bot.proxyAddress
    if (!proxyAddress) return null
    if (proxyAddress === 'http://0.0.0.0:0') return null
    if (!/os_|official/.test(this.server)) return null
    if (HttpsProxyAgent == null) {
      const data = await import('https-proxy-agent').catch(err => {
        logger.error(err)
      })
      HttpsProxyAgent = data ? data.HttpsProxyAgent : undefined
    }
    if (HttpsProxyAgent) {
      return new HttpsProxyAgent(proxyAddress)
    }
    return null
  }
  generateSeed(length = 16) {
    const characters = '0123456789abcdef'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)]
    }
    return result
  }
}

createDir(SQLITE_DB_DIR, 'root')
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: join(process.cwd(), `${SQLITE_DB_DIR}/data.db`),
  logging: false
})
await sequelize.authenticate()
class BaseModel extends Model {
  static Types = DataTypes
  static initDB(model, columns) {
    let name = model.name
    name = name.replace(/DB$/, 's')
    model.init(columns, { sequelize, tableName: name })
    model.COLUMNS = columns
  }
}

const { Types: Types$2 } = BaseModel
const COLUMNS$2 = {
  id: {
    type: Types$2.STRING,
    autoIncrement: false,
    primaryKey: true
  },
  type: {
    type: Types$2.STRING,
    defaultValue: 'qq',
    notNull: true
  },
  name: Types$2.STRING,
  face: Types$2.STRING,
  ltuids: Types$2.STRING,
  games: {
    type: Types$2.STRING,
    get() {
      let data = this.getDataValue('games')
      let ret = {}
      try {
        data = JSON.parse(data) || {}
      } catch (e) {
        data = {}
      }
      MysUtil.eachGame(game => {
        let ds = data[game] || {}
        ret[game] = {
          uid: ds.uid || '',
          data: ds.data || {}
        }
      })
      return ret
    },
    set(data) {
      this.setDataValue('games', JSON.stringify(data))
    }
  },
  data: Types$2.STRING
}
class UserDB extends BaseModel {
  static async find(id, type = 'qq') {
    id = type === 'qq' ? '' + id : type + id
    let user = await UserDB.findByPk(id)
    if (!user) {
      user = await UserDB.build({
        id,
        type
      })
    }
    return user
  }
  async saveDB(user) {
    const db = this
    const ltuids = []
    lodash.forEach(user.mysUsers, mys => {
      if (mys.ck && mys.ltuid) {
        ltuids.push(mys.ltuid)
      }
    })
    db.ltuids = ltuids.join(',')
    let games = {}
    lodash.forEach(user._games, (gameDs, game) => {
      games[game] = {
        uid: gameDs.uid,
        data: {}
      }
      lodash.forEach(gameDs.data, (ds, uid) => {
        games[game].data[uid] = {
          uid: ds.uid,
          type: ds.type
        }
      })
    })
    db.games = games
    await this.save()
  }
}
BaseModel.initDB(UserDB, COLUMNS$2)
await UserDB.sync()

const { Types: Types$1 } = BaseModel
const COLUMNS$1 = {
  ltuid: {
    type: Types$1.INTEGER,
    primaryKey: true
  },
  type: {
    type: Types$1.STRING,
    defaultValue: 'mys',
    notNull: true
  },
  ck: Types$1.STRING,
  device: Types$1.STRING,
  uids: {
    type: Types$1.STRING,
    get() {
      let data = this.getDataValue('uids')
      let ret = {}
      try {
        ret = JSON.parse(data)
      } catch (e) {
        ret = {}
      }
      return ret
    },
    set(uids) {
      this.setDataValue('uids', JSON.stringify(uids))
    }
  }
}
class MysUserDB extends BaseModel {
  static async find(ltuid = '', create = false) {
    let mys = await MysUserDB.findByPk(ltuid)
    if (!mys && create) {
      mys = await MysUserDB.build({
        ltuid
      })
    }
    return mys || false
  }
  ck = null
  type = null
  device = null
  uids = null
  async saveDB(mys) {
    if (!mys.ck || !mys.device || !mys.db) {
      return false
    }
    let db = this
    this.ck = mys.ck
    this.type = mys.type
    this.device = mys.device
    this.uids = mys.uids
    await db.save()
  }
}
BaseModel.initDB(MysUserDB, COLUMNS$1)
await MysUserDB.sync()

const { Types } = BaseModel
const COLUMNS = {
  userId: {
    type: Types.STRING
  },
  game: Types.STRING,
  uid: Types.STRING,
  data: {
    type: Types.STRING,
    get() {
      let data = this.getDataValue('data')
      let ret = {}
      try {
        data = JSON.parse(data)
      } catch (e) {
        data = []
      }
      lodash.forEach(data, ds => {
        if (ds.uid) {
          ret[ds.uid] = ds
        }
      })
      return ret
    },
    set(data) {
      this.setDataValue('data', JSON.stringify(lodash.values(data)))
    }
  }
}
class UserGameDB extends BaseModel {}
BaseModel.initDB(UserGameDB, COLUMNS)
await UserGameDB.sync()

const tables = {
  detail: 'query-detail',
  uid: 'ltuid-uid',
  ck: 'ltuid-ck',
  qq: 'ltuid-qq',
  del: 'del-detail'
}
class MysUser extends BaseModel$1 {
  gsUids = []
  srUids = []
  ltuid = null
  uids = []
  constructor(ltuid) {
    super()
    if (!ltuid) {
      return
    }
    let self = this._getThis('mys', ltuid)
    if (!self) {
      self = this
    }
    this.ltuid = ltuid
    return self._cacheThis()
  }
  get uid() {
    return this.uids?.gs?.[0] || ''
  }
  static async create(ltuid, db = false) {
    ltuid = MysUtil.getLtuid(ltuid)
    if (!ltuid) {
      return false
    }
    let mys = new MysUser(ltuid)
    await mys.initDB(db)
    return mys
  }
  static async forEach(fn) {
    let dbs = await MysUserDB.findAll()
    await forEach(dbs, async db => {
      let mys = await MysUser.create(db.ltuid, db)
      return await fn(mys)
    })
  }
  static async getByQueryUid(uid, game = 'gs', onlySelfCk = false) {
    let servCache = DailyCache.create(uid, game)
    const create = async function (ltuid) {
      if (!ltuid) return false
      let ckUser = await MysUser.create(ltuid)
      if (!ckUser) {
        await servCache.zDel(tables.detail, ltuid)
        return false
      }
      if (onlySelfCk && !ckUser.ownUid(uid, game)) {
        return false
      }
      return ckUser
    }
    let ret = await create(await servCache.zKey(tables.detail, uid))
    if (ret) {
      logger.mark(
        `[米游社查询][uid：${uid}]${logger.chalk.green(`[使用已查询ck：${ret.ltuid}]`)}`
      )
      return ret
    }
    if (onlySelfCk) return false
    ret = await create(await servCache.zMinKey(tables.detail))
    if (ret) {
      logger.mark(
        `[米游社查询][uid：${uid}]${logger.chalk.green(`[分配查询ck：${ret.ltuid}]`)}`
      )
      return ret
    }
    return false
  }
  static async eachServ(fn) {
    await MysUtil.eachServ(async serv => {
      await MysUtil.eachGame(async game => {
        let servCache = DailyCache.create(serv, game)
        await fn(servCache, serv, game)
      })
    })
  }
  static async clearCache() {
    await MysUser.eachServ(async function (servCache) {
      await servCache.empty(tables.detail)
    })
    let cache = DailyCache.create()
    await cache.empty(tables.uid)
    await cache.empty(tables.ck)
    await cache.empty(tables.qq)
  }
  static async getStatData() {
    let totalCount = {}
    let ret = { servs: {}, count: null }
    await MysUser.eachServ(async function (servCache, serv) {
      let data = await servCache.zStat(tables.detail)
      let count = {
        normal: null,
        query: null
      }
      let list = []
      let query = 0
      const stat = (type, num) => {
        count[type] = num
        totalCount[type] = (totalCount[type] || 0) + num
      }
      lodash.forEach(data, ds => {
        list.push({
          ltuid: ds.value,
          num: ds.score
        })
        if (ds.score < 30) {
          query += ds.score
        }
      })
      stat('total', list.length)
      stat('normal', lodash.filter(list, ds => ds.num < 29).length)
      stat('disable', lodash.filter(list, ds => ds.num > 30).length)
      stat('query', query)
      stat('last', count.normal * 30 - count.query)
      list = lodash.sortBy(list, ['num', 'ltuid']).reverse()
      ret.servs[serv] = {
        list,
        count
      }
    })
    ret.count = totalCount
    return ret
  }
  static async delDisable() {
    let count = 0
    await MysUser.eachServ(async function (servCache) {
      let cks = await servCache.zGetDisableKey(tables.detail)
      for (let ck of cks) {
        if (await servCache.zDel(tables.detail, ck, true)) {
          count++
        }
        let ckUser = await MysUser.create(ck)
        if (ckUser) {
          await ckUser.delWithUser()
        }
      }
    })
    return count
  }
  static async checkCkStatus(ck) {
    if (!ck) {
      return false
    }
    let uids = []
    const err = (msg, status = 2) => {
      msg = msg + '\n请退出米游社并重新登录后，再次获取CK'
      return {
        status,
        msg,
        uids
      }
    }
    let uid = uids[0] ?? '0'
    let mys = new MysApi(String(uid), ck, { log: false })
    let noteRet = await mys.getData('dailyNote')
    if (noteRet.retcode !== 0 || lodash.isEmpty(noteRet.data)) {
      let msg = noteRet.message !== 'OK' ? noteRet.message : 'CK失效'
      return err(`${msg || 'CK失效或验证码'}，无法查询体力及角色信息`, 3)
    }
    let roleRet = await mys.getData('character')
    if (roleRet.retcode !== 0 || lodash.isEmpty(roleRet.data)) {
      let msg = noteRet.message !== 'OK' ? noteRet.message : 'CK失效'
      return err(`${msg || 'CK失效'}，当前CK仍可查询体力，无法查询角色信息`, 2)
    }
    let detailRet = await mys.getData('detail', { avatar_id: 10000021 })
    if (detailRet.retcode !== 0 || lodash.isEmpty(detailRet.data)) {
      let msg = noteRet.message !== 'OK' ? noteRet.message : 'CK失效'
      return err(
        `${msg || 'CK失效'}，当前CK仍可查询体力及角色，但无法查询角色详情数据`,
        1
      )
    }
    return {
      uids,
      status: 0,
      msg: 'CK状态正常'
    }
  }
  getCkInfo(game = 'gs') {
    return {
      ck: this.ck,
      uid: this.getUid(game),
      qq: '',
      ltuid: this.ltuid
    }
  }
  getUidData(uid, game = 'gs') {
    game = this.gameKey(game)
    if (!this.hasUid(uid, game)) {
      return false
    }
    return {
      uid,
      type: 'ck',
      ltuid: this.ltuid,
      game
    }
  }
  hasUid(uid, game = 'gs') {
    game = this.gameKey(game)
    return this.uids[game].includes(uid + '')
  }
  getUid(game = 'gs') {
    return this.getUids(game)[0]
  }
  getUids(game = 'gs') {
    let gameKey = this.gameKey(game)
    return this.uids[gameKey] || []
  }
  getUidInfo() {
    let ret = []
    MysUtil.eachGame((game, gameDs) => {
      let uids = this.getUids(game)
      if (uids && uids.length > 0) {
        ret.push(`【${gameDs.name}】:${uids.join(', ')}`)
      }
    })
    return ret.join('\n')
  }
  async reqMysUid() {
    let err = (msg = 'error', status = 1) => {
      return { status, msg }
    }
    let res = null
    let msg = 'error'
    for (let serv of ['mys', 'hoyolab']) {
      const roleRes = await this.getGameRole(serv)
      if (roleRes?.retcode === 0) {
        res = roleRes
        if (serv === 'hoyolab') {
          this.type = 'hoyolab'
        }
        break
      }
      if (roleRes.retcode * 1 === -100) {
        msg = '该ck已失效，请重新登录获取'
      }
      msg = roleRes.message || 'error'
    }
    if (!res) return err(msg)
    let playerList = res?.data?.list || []
    playerList = playerList.filter(v =>
      ['hk4e_cn', 'hkrpg_cn', 'hk4e_global', 'hkrpg_global'].includes(
        v.game_biz
      )
    )
    if (!playerList || playerList.length <= 0) {
      return err('该账号尚未绑定原神或星穹角色')
    }
    this.gsUids = []
    this.srUids = []
    for (let val of playerList) {
      this.addUid(
        val.game_uid,
        ['hk4e_cn', 'hk4e_global'].includes(val.game_biz) ? 'gs' : 'sr'
      )
    }
    await this.save()
    return { status: 0, msg: '' }
  }
  async getGameRole(serv = 'mys') {
    const ck = this.ck
    const url = {
      mys: 'https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie',
      hoyolab:
        'https://sg-public-api.hoyolab.com/binding/api/getUserGameRolesByCookie'
    }
    const res = await fetch(url[serv], {
      method: 'get',
      headers: { Cookie: ck }
    })
    if (!res.ok) return false
    return await res.json()
  }
  async getUserFullInfo(serv = 'mys') {
    let ck = this.ck
    let url = {
      mys: 'https://bbs-api.mihoyo.com/user/wapi/getUserFullInfo?gids=2',
      hoyolab: ''
    }
    let res = await fetch(url[serv], {
      method: 'get',
      headers: {
        Cookie: ck,
        Accept: 'application/json, text/plain, */*',
        Connection: 'keep-alive',
        Host: 'bbs-api.mihoyo.com',
        Origin: 'https://m.bbs.mihoyo.com',
        Referer: 'https://m.bbs.mihoyo.com/'
      }
    })
    if (!res.ok) return res
    return await res.json()
  }
  cache = null
  getCache(game = 'gs') {
    if (!this.cache) {
      this.cache = {}
    }
    const { cache } = this
    if (game !== 'config') {
      game = this.gameKey(game)
    }
    if (!cache[game]) {
      cache[game] = DailyCache.create(this.type, game)
    }
    return cache[game]
  }
  async initDB(db) {
    if (this.db && !db) {
      return
    }
    if (!db || db === true) {
      db = await MysUserDB.find(this.ltuid, true)
    }
    this.db = db
    this.setCkData(db)
  }
  type = null
  device = null
  setCkData(data) {
    this.ck = data.ck || this.ck || ''
    this.type = data.type || this.type || 'mys'
    this.device = data.device || this.device || MysUtil.getDeviceGuid()
    this.uids = this.uids || {}
    let self = this
    MysUtil.eachGame(game => {
      self.uids[game] = data?.uids?.[game] || self.uids[game] || []
    })
  }
  db = null
  async save() {
    await this.db.saveDB(this)
  }
  addUid(uid, game = 'gs') {
    if (lodash.isArray(uid)) {
      for (let u of uid) {
        this.addUid(u, game)
      }
      return true
    }
    uid = '' + uid
    if (/\d{9,10}/.test(uid)) {
      let gameKey = this.gameKey(game)
      let uids = this.uids[gameKey]
      if (!uids.includes(uid)) {
        uids.push(uid)
      }
    }
    return true
  }
  hasGame(game = 'gs') {
    game = this.gameKey(game)
    return this.uids[game]?.length > 0
  }
  ck = null
  async initCache() {
    if (!this.ltuid || !this.ck) return
    let self = this
    await MysUtil.eachGame(async game => {
      let uids = self.uids[game]
      await this.addQueryUid(uids, game)
      let cache = self.getCache(game)
      let cacheSearchList = await cache.get(tables.del, this.ltuid, true)
      if (cacheSearchList && cacheSearchList.length > 0) {
        for (let searchedUid of cacheSearchList) {
          if (!(await this.getQueryLtuid(searchedUid, game))) {
            await this.addQueryUid(searchedUid, game)
          }
        }
      }
    })
    return true
  }
  async disable(game = 'gs') {
    let cache = this.getCache(game)
    await cache.zDel(tables.detail, this.ltuid)
    logger.mark(`[标记无效ck][game:${game}, ltuid:${this.ltuid}`)
  }
  async del() {
    let self = this
    await MysUtil.eachGame(async game => {
      let uids = await this.getQueryUids(game)
      let cache = self.getCache(game)
      await cache.set(tables.del, uids)
      await cache.zDel(tables.detail, this.ltuid)
    })
    await self.db.destroy()
    self._delCache()
    logger.mark(`[删除失效ck][ltuid:${this.ltuid}]`)
  }
  async delWithUser(_ = 'gs') {
    logger.info('错误行为，尝试进行循环引用！')
    logger.info('这是设计错误，请等待修复....')
  }
  async addQueryUid(uid, game = 'gs') {
    if (lodash.isArray(uid)) {
      for (let u of uid) {
        await this.addQueryUid(u, game)
      }
      return
    }
    if (uid) {
      let cache = this.getCache(game)
      await cache.zAdd(tables.detail, this.ltuid, uid)
    }
  }
  async getQueryUids(game = 'gs') {
    let cache = this.getCache(game)
    return await cache.zList(tables.detail, this.ltuid)
  }
  async getQueryLtuid(uid, game = 'gs') {
    let cache = this.getCache(game)
    return await cache.zKey(tables.detail, uid)
  }
  ownUid(uid, game = 'gs') {
    if (!uid) {
      return false
    }
    let gameKey = this.gameKey(game)
    let uids = this.uids[gameKey]
    return uids.includes(uid + '')
  }
}

class NoteUser extends BaseModel$1 {
  db = null
  qq = null
  mysUsers = {}
  _map = null
  constructor(qq) {
    super()
    let cacheObj = this._getThis('user', qq)
    if (cacheObj) {
      return cacheObj
    }
    this.qq = qq
    return this._cacheThis()
  }
  get uid() {
    console.warn('NoteUser.uid 默认返回原神UID，可更改为 user.getUid(game)')
    return this.getUid()
  }
  get ckUids() {
    console.warn(
      'NoteUser.ckUids 默认返回原神UID，可更改为 user.getCkUidList(game)'
    )
    const uids = this.getCkUidList('gs')
    return lodash.map(uids, ds => ds.uid)
  }
  get cks() {
    console.warn('NoteUser.cks 即将废弃')
    let game = 'gs'
    let cks = {}
    if (!this.hasCk) {
      return cks
    }
    for (let ltuid in this.mysUsers) {
      let mys = this.mysUsers[ltuid]
      if (mys && mys.ltuid && mys.uid) {
        cks[ltuid] = cks[ltuid] || {
          ckData: mys.getCkInfo(game),
          ck: mys.ck,
          uids: mys.getUids(game)
        }
      }
    }
    return cks
  }
  get hasCk() {
    return !lodash.isEmpty(this.mysUsers)
  }
  static async create(qq, db = false) {
    if (qq && qq.user_id) {
      let e = qq
      let id = e.originalUserId || e.user_id
      let mainId = await redis.get(`${BOT_NOTE_USER}mainId:${e.user_id}`)
      if (mainId) {
        id = mainId
        e.mainUserId = mainId
        e.originalUserId = e.originalUserId || e.user_id
      }
      let user = await NoteUser.create(id)
      e.user = user
      return user
    }
    let user = new NoteUser(qq)
    await user.initDB(db)
    return user
  }
  static async forEach(fn) {
    let dbs = await UserDB.findAll()
    await forEach(dbs, async db => {
      let user = await NoteUser.create(db.id, db)
      return await fn(user)
    })
  }
  async initDB(db = false) {
    if (this.db && !db) {
      return
    }
    if (db && db !== true) {
      this.db = db
    } else {
      this.db = await UserDB.find(this.qq, 'qq')
    }
    await this.initMysUser()
    this._games = this.db.games
    await this.save()
  }
  async initMysUser() {
    let ltuids = this.db?.ltuids || ''
    this.mysUsers = {}
    for (let ltuid of ltuids.split(',')) {
      let mys = await MysUser.create(ltuid)
      if (mys) {
        this.mysUsers[ltuid] = mys
      }
    }
  }
  async save() {
    await this.db.saveDB(this)
  }
  getUidMapList(game = 'gs', type = 'all') {
    if (this._map?.[game]?.[type]) {
      return this._map[game][type]
    }
    game = this.gameKey(game)
    let uidMap = {}
    let uidList = []
    lodash.forEach(this.mysUsers, mys => {
      if (!mys) {
        return
      }
      lodash.forEach(mys.uids[game] || [], uid => {
        uid = uid + ''
        if (uid && !uidMap[uid]) {
          uidMap[uid] = mys.getUidData(uid, game)
          uidList.push(uidMap[uid])
        }
      })
    })
    if (type === 'all') {
      let gameDs = this.getGameDs(game)
      lodash.forEach(gameDs.data, ds => {
        if (ds.uid && !uidMap[ds.uid]) {
          uidMap[ds.uid] = ds
          uidList.push(ds)
        }
      })
    }
    this._map = this._map || {}
    this._map[game] = this._map[game] || {}
    this._map[game][type] = {
      map: uidMap,
      list: uidList
    }
    return this._map[game][type]
  }
  getUidData(uid = '', game = 'gs') {
    if (!uid) {
      uid = this.getUid(game)
    }
    return this.getUidMapList(game, 'all').map[uid]
  }
  hasUid(uid = '', game = '') {
    if (!uid) {
      return this.getUidMapList(game, 'all').list?.length > 0
    }
    return !!this.getUidData(uid, game)
  }
  getCkUid(game = 'gs') {
    let uid = this.getUid(game)
    let { map, list } = this.getUidMapList(game, 'ck')
    return (map[uid] ? uid : list[0]?.uid) || ''
  }
  getCkUidList(game = 'gs') {
    return this.getUidMapList(game, 'ck').list
  }
  getUid(game = 'gs') {
    game = this.gameKey(game)
    let ds = this.getGameDs(game)
    if (!ds.uid) {
      this.setMainUid('', game)
    }
    return ds.uid || ''
  }
  getUidList(game = 'gs') {
    return this.getUidMapList(game, 'all').list
  }
  getMysUser(game = 'gs') {
    if (lodash.isEmpty(this.mysUsers)) {
      return false
    }
    let uid = this.getCkUid(game)
    if (!uid) {
      return false
    }
    let uidData = this.getUidData(uid, game)
    return this.mysUsers[uidData.ltuid]
  }
  addRegUid(uid, game = 'gs', save = true) {
    game = this.gameKey(game)
    uid = uid + ''
    let gameDs = this.getGameDs(game)
    gameDs.data[uid] = { uid, type: 'reg' }
    this._map = false
    this.setMainUid(uid, game, false)
    if (save) {
      this.save()
    }
  }
  delRegUid(uid, game = 'gs') {
    game = this.gameKey(game)
    let gameDs = this.getGameDs(game)
    let dsData = gameDs.data
    delete dsData[uid]
    gameDs.data = dsData
    this._map = false
    if (gameDs.uid === uid) {
      this.setMainUid('', game, false)
    }
    this.save()
  }
  _games = {}
  getGameDs(game = 'gs') {
    game = this.gameKey(game)
    if (!this._games) {
      this._games = {}
    }
    if (!this._games[game]) {
      this._games[game] = {
        uid: '',
        data: {}
      }
    }
    return this._games[game]
  }
  autoRegUid(uid = '', game = 'gs') {
    if (this.getUid(game)) {
      return uid
    }
    this.addRegUid(uid, game)
    return uid
  }
  setMainUid(uid = '', game = 'gs', save = true) {
    this._map = false
    game = this.gameKey(game)
    if (Number(uid) < 100 || !uid) {
      let uids = this.getUidList(game)
      uid = (uids?.[uid] || uids?.[0])?.uid || ''
    }
    if (!uid) {
      return false
    }
    if (this.hasUid(uid, game)) {
      let gameDs = this.getGameDs(game)
      gameDs.uid = uid
    }
    if (save) {
      this.save()
    }
  }
  async addMysUser(mysUser) {
    this.mysUsers[mysUser.ltuid] = mysUser
    this._map = false
    MysUtil.eachGame(game => {
      let uid = mysUser.getUid(game)
      if (uid && this.getUid(game) == '') {
        this.setMainUid(uid, game, false)
      }
    })
    this.save()
  }
  async delCk(ltuid = '') {
    console.warn('delCk即将废弃')
    return await this.delMysUser(ltuid)
  }
  async delMysUser(mysUser = '') {
    let ltuid = mysUser.ltuid || mysUser
    if (ltuid && this.mysUsers[ltuid]) {
      let mys = this.mysUsers[ltuid]
      this.mysUsers[ltuid] = false
      this._map = false
      await mys.del()
    }
    this._map = false
    await this.save()
  }
  async eachMysUser(fn) {
    await forEach(this.mysUsers, async (mys, ltuid) => {
      if (!mys) {
        return true
      }
      return fn(mys, ltuid)
    })
  }
  async eachAllMysUser(fn) {
    return MysUser.forEach(fn)
  }
  async checkCk() {
    let cks = this.cks
    let ret = []
    for (let ltuid in cks) {
      let ck = cks[ltuid].ck
      if (!ltuid || !ck) {
        continue
      }
      let checkRet = await MysUser.checkCkStatus(ck)
      let mysUser = await MysUser.create(ck)
      if (mysUser && checkRet) {
        let status = checkRet.status
        if (status === 0 || status === 1) {
          await mysUser.initCache()
        } else if (status === 2) {
          await mysUser.del()
        } else if (status === 3) {
          await this.delCk(ltuid)
        }
      }
      ret.push({
        ltuid,
        ...checkRet
      })
    }
    return ret
  }
}

const dir = join$1(process.cwd(), './plugins/miao-plugin/models/index.js')
let { Character, Weapon } = {}
if (existsSync(dir)) {
  const { Character: C, Weapon: W } = await import(`file://${dir}`)
  Character = C
  Weapon = W
}
class GsCfg {
  nameID = new Map()
  sr_nameID = new Map()
  isSr = false
  defSetPath = './plugins/genshin/defSet/'
  defSet = {}
  configPath = './plugins/genshin/config/'
  config = {}
  watcher = { config: {}, defSet: {} }
  ignore = ['mys.pubCk', 'gacha.set', 'bot.help', 'role.name']
  get element() {
    return {
      ...this.getdefSet('element', 'role'),
      ...this.getdefSet('element', 'weapon')
    }
  }
  getdefSet(app, name) {
    return this.getYaml(app, name, 'defSet')
  }
  getConfig(app, name) {
    if (this.ignore.includes(`${app}.${name}`)) {
      return this.getYaml(app, name, 'config')
    }
    return {
      ...this.getdefSet(app, name),
      ...this.getYaml(app, name, 'config')
    }
  }
  getYaml(app, name, type) {
    let file = this.getFilePath(app, name, type)
    let key = `${app}.${name}`
    if (this[type][key]) return this[type][key]
    try {
      this[type][key] = YAML.parse(readFileSync(file, 'utf8'))
    } catch (error) {
      logger.error(`[${app}][${name}] 格式错误 ${error}`)
      return false
    }
    this.watch(file, app, name, type)
    return this[type][key]
  }
  getFilePath(app, name, type) {
    if (type == 'defSet') {
      return `${this.defSetPath}${app}/${name}.yaml`
    } else {
      return `${this.configPath}${app}.${name}.yaml`
    }
  }
  watch(file, app, name, type = 'defSet') {
    let key = `${app}.${name}`
    if (this.watcher[type][key]) return
    const watcher = chokidar.watch(file)
    watcher.on('change', () => {
      delete this[type][key]
      logger.mark(`[修改配置文件][${type}][${app}][${name}]`)
      if (this[`change_${app}${name}`]) {
        this[`change_${app}${name}`]()
      }
    })
    this.watcher[type][key] = watcher
  }
  async getBingCk(game = 'gs') {
    let ck = {}
    let ckQQ = {}
    let noteCk = {}
    await NoteUser.forEach(async function (user) {
      let qq = user.qq + ''
      let tmp = {}
      lodash.forEach(user.mysUsers, mys => {
        let uids = mys.getUids(game)
        lodash.forEach(uids, uid => {
          let ckData = mys.getCkInfo(game)
          ckData.qq = qq
          if (!ck[uid]) {
            ck[uid] = ckData
            ckQQ[qq] = ckData
          }
          tmp[uid] = ckData
        })
      })
      noteCk[qq] = tmp
    })
    return { ck, ckQQ, noteCk }
  }
  roleIdToName(id) {
    let char = Character.get(id)
    return char?.name || ''
  }
  roleNameToID(keyword, isSr) {
    const char = Character.get(keyword, isSr ? 'sr' : 'gs')
    return char?.id || false
  }
  shortName(name, isWeapon = false) {
    const obj = (isWeapon ? Weapon : Character).get(name)
    return obj.abbr || obj.name || ''
  }
  async change_myspubCk() {
    logger.info('错误行为，尝试进行循环引用！')
    logger.info('这是设计错误，请等待修复....')
  }
  getGachaSet(groupId = '') {
    const config = this.getYaml('gacha', 'set', 'config')
    const def = config.default
    if (config[groupId]) {
      return { ...def, ...config[groupId] }
    }
    return def
  }
  getMsgUid(msg) {
    const ret = /([1-9]|18)[0-9]{8}/g.exec(msg)
    if (!ret) return false
    return ret[0]
  }
  getRole(msg, filterMsg = '', isSr = false) {
    let alias = msg.replace(/#|老婆|老公|([1-9]|18)[0-9]{8}/g, '').trim()
    if (filterMsg) {
      alias = alias.replace(new RegExp(filterMsg, 'g'), '').trim()
    }
    this.isSr = isSr
    let char = Character.get(alias, isSr ? 'sr' : 'gs')
    if (!char) {
      return false
    }
    let uid = this.getMsgUid(msg) || ''
    return {
      roleId: char.id,
      uid,
      alias,
      game: char.game,
      name: char.name
    }
  }
  cpCfg(app, name) {
    if (!existsSync('./plugins/genshin/config')) {
      mkdirSync('./plugins/genshin/config')
    }
    let set = `./plugins/genshin/config/${app}.${name}.yaml`
    if (!existsSync(set)) {
      copyFileSync(`./plugins/genshin/defSet/${app}/${name}.yaml`, set)
    }
  }
  _getAbbr() {
    if (this[this.isSr ? 'sr_nameID' : 'nameID']) return
    this.nameID = new Map()
    this.sr_nameID = new Map()
    let nameArr = this.getdefSet('role', 'name')
    let sr_nameArr = this.getdefSet('role', 'sr_name')
    let nameArrUser = this.getConfig('role', 'name')
    let nameID = {}
    for (let i in nameArr) {
      nameID[nameArr[i][0]] = i
      for (let abbr of nameArr[i]) {
        this.nameID.set(String(abbr), i)
      }
    }
    for (let i in sr_nameArr) {
      nameID[sr_nameArr[i][0]] = i
      for (let abbr of sr_nameArr[i]) {
        this.sr_nameID.set(String(abbr), i)
      }
    }
    for (let i in nameArrUser) {
      for (let abbr of nameArrUser[i]) {
        this.nameID.set(String(abbr), nameID[i])
      }
    }
  }
  _roleNameToID(keyword, isSr) {
    if (isSr) this.isSr = isSr
    if (!isNaN(keyword)) keyword = Number(keyword)
    this._getAbbr()
    let roelId = this[this.isSr ? 'sr_nameID' : 'nameID'].get(String(keyword))
    return roelId || false
  }
  _getRole(msg, filterMsg = '', _ = false) {
    let alias = msg.replace(/#|老婆|老公|([1-9]|18)[0-9]{8}/g, '').trim()
    if (filterMsg) {
      alias = alias.replace(new RegExp(filterMsg, 'g'), '').trim()
    }
    let roleId = this._roleNameToID(alias)
    if (!roleId) return false
    let uid = this.getMsgUid(msg) || ''
    return {
      roleId,
      uid,
      alias,
      name: this.roleIdToName(roleId)
    }
  }
  getWeaponDataByWeaponHash(_) {
    logger.info('gsCfg.getWeaponDataByWeaponHash() 已废弃')
    return {}
  }
  getAllAbbr() {
    logger.info('gsCfg.getAllAbbr() 已废弃')
    return {}
  }
  getBingCkSingle(_) {
    logger.info('gsCfg.getBingCkSingle() 已废弃')
    return {}
  }
  saveBingCk(_, __) {
    logger.info('gsCfg.saveBingCk() 已废弃')
  }
  getElementByRoleName(_) {
    logger.info('gsCfg.getElementByRoleName() 已废弃')
    return ''
  }
  getSkillDataByskillId(_, __) {
    logger.info('gsCfg.getSkillDataByskillId() 已废弃')
    return {}
  }
  fightPropIdToName(_) {
    logger.info('gsCfg.fightPropIdToName() 已废弃')
    return ''
  }
  getRoleTalentByTalentId(_) {
    logger.info('gsCfg.getRoleTalentByTalentId 已废弃')
    return {}
  }
  getAbbr() {
    logger.info('gsCfg.getAbbr() 已经废弃')
  }
}
var GSCfg = new GsCfg()

class MysInfo {
  static tips = '请先#绑定Cookie\n发送【Cookie帮助】查看配置教程'
  uid = null
  e = null
  userId = null
  ckInfo = null
  auth = null
  gtest = null
  mysButton = null
  ckUser = null
  constructor(e) {
    if (e) {
      this.e = e
      this.userId = String(e.user_id)
    }
    this.uid = ''
    this.ckInfo = {
      ck: '',
      uid: '',
      qq: '',
      ltuid: '',
      type: ''
    }
    this.ckUser = null
    this.auth = [
      'dailyNote',
      'bbs_sign_info',
      'bbs_sign_home',
      'bbs_sign',
      'ys_ledger',
      'compute',
      'avatarSkill',
      'detail',
      'blueprint',
      'UserGame',
      'deckList',
      'avatar_cardList',
      'action_cardList',
      'avatarInfo'
    ]
    this.gtest = false
    this.mysButton = segment.button([
      { text: '米游社', link: 'https://miyoushe.com' }
    ])
  }
  static async init(e, api) {
    await MysInfo.initCache()
    let mysInfo = new MysInfo(e)
    let onlySelfCk = false
    if (mysInfo.checkAuth(api)) {
      mysInfo.uid = await MysInfo.getSelfUid(e)
      onlySelfCk = true
    } else {
      mysInfo.uid = await MysInfo.getUid(e)
    }
    if (!mysInfo.uid) {
      e.noTips = true
      return false
    }
    if (
      !['1', '2', '3', '5', '6', '7', '8', '18', '9'].includes(
        String(mysInfo.uid).slice(0, -8)
      )
    ) {
      return false
    }
    if (
      !['6', '7', '8', '18', '9'].includes(String(mysInfo.uid).slice(0, -8)) &&
      api === 'useCdk'
    ) {
      e.reply('兑换码使用只支持国际服uid')
      return false
    }
    mysInfo.e.uid = mysInfo.uid
    await mysInfo.getCookie(e, onlySelfCk)
    await mysInfo.checkReply()
    return mysInfo
  }
  static async getUid(e, matchMsgUid = true) {
    let user = await NoteUser.create(e)
    if (e.uid && matchMsgUid) {
      return user.autoRegUid(e.uid, e)
    }
    let { msg = '', at = '' } = e
    if (!msg) return false
    let uid
    if (at) {
      let atUser = await NoteUser.create(at)
      uid = atUser.getUid(e)
      if (uid) return String(uid)
      if (e.noTips !== true) {
        e.reply(
          [
            '尚未绑定uid',
            segment.button([{ text: '绑定UID', input: '#绑定uid' }])
          ],
          false,
          { at }
        )
      }
      return false
    }
    let matchUid = (msg = '') => {
      let ret = /([1-9]|18)[0-9]{8}/g.exec(msg)
      if (!ret) return false
      return ret[0]
    }
    uid = matchUid(msg) || user.getUid(e) || matchUid(e.sender.card)
    if (!matchMsgUid) uid = user.getUid(e)
    if (uid) {
      return user.autoRegUid(uid, e)
    }
    if (e.noTips !== true) {
      e.reply(
        [
          '请先#绑定uid',
          segment.button([{ text: '绑定UID', input: '#绑定uid' }])
        ],
        false,
        { at: at || true }
      )
    }
    return false
  }
  static async getSelfUid(e) {
    let { msg = '', at = '' } = e
    if (!msg) return false
    let user = await NoteUser.create(e)
    let selfUser = at ? await NoteUser.create(at) : user
    if (!selfUser.hasCk) {
      if (e.noTips !== true) {
        e.reply(
          [
            '尚未绑定Cookie',
            segment.button([{ text: 'Cookie帮助', callback: '#Cookie帮助' }])
          ],
          false,
          { at: selfUser.qq }
        )
      }
      return false
    }
    return selfUser.getUid(e)
  }
  static async get(e, api, data = {}, option = {}) {
    let mysInfo = await MysInfo.init(e, api)
    if (!mysInfo) return false
    if (!mysInfo.uid || !mysInfo.ckInfo.ck) return false
    e.uid = mysInfo.uid
    let user = e.user?.getMysUser()
    let mysApi = new MysApi(
      mysInfo.uid,
      mysInfo.ckInfo.ck,
      option,
      e.isSr,
      user.device
    )
    let res
    if (lodash.isObject(api)) {
      let all = []
      await mysApi.getData('getFp')
      if (e.apiSync) {
        res = []
        for (let i in api) {
          res.push(await mysApi.getData(i, api[i]))
        }
      } else {
        lodash.forEach(api, (v, i) => {
          all.push(mysApi.getData(i, v))
        })
        res = await Promise.all(all)
      }
      for (let i in res) {
        res[i] = await mysInfo.checkCode(
          res[i],
          res[i].api,
          mysApi,
          api[res[i].api]
        )
        mysInfo.gtest = true
        if (res[i]?.retcode === 0) continue
        break
      }
    } else {
      res = await mysApi.getData(api, data)
      res = await mysInfo.checkCode(res, api, mysApi, data)
    }
    return res
  }
  static async initPubCk() {
    let pubCount = 0
    let pubCks = GSCfg.getConfig('mys', 'pubCk') || []
    for (let ck of pubCks) {
      let pubUser = await MysUser.create(ck)
      if (pubUser) {
        let ret = await pubUser.initCache()
        if (ret) {
          pubCount++
        }
        if (pubCount >= 20) {
          break
        }
      }
    }
    logger.mark(`加载公共ck：${pubCount}个`)
  }
  static async initUserCk() {
    let userCount = 0
    await MysUser.forEach(async mys => {
      let ret = await mys.initCache()
      if (ret) {
        userCount++
      }
    })
    logger.mark(`加载用户UID：${userCount}个，加入查询池`)
  }
  static initing = null
  static async initCache(force = false, clearData = false) {
    const cache = DailyCache.create()
    if ((!force && (await cache.get('cache-ready'))) || this.initing)
      return true
    this.initing = true
    await DailyCache.clearOutdatedData()
    if (clearData) await MysUser.clearCache()
    await MysInfo.initUserCk()
    await MysInfo.initPubCk()
    await cache.set('cache-ready', Date.now())
    delete this.initing
    return true
  }
  static async getBingCkUid() {
    let res = await GSCfg.getBingCk()
    return { ...res.ck }
  }
  static async checkUidBing(uid, game = 'gs') {
    let ckUser = await MysUser.getByQueryUid(uid, game, true)
    if (ckUser && ckUser.ck) {
      return ckUser
    }
    return false
  }
  static async delDisable() {
    return await MysUser.delDisable()
  }
  checkAuth(api) {
    if (api === 'cookie') {
      return true
    }
    if (lodash.isObject(api)) {
      for (let i in api) {
        if (this.auth.includes(i)) {
          return true
        }
      }
    } else if (this.auth.includes(api)) {
      return true
    }
    return false
  }
  async checkReply() {
    if (this.e.noTips === true) return
    if (!this.uid) {
      this.e.reply(
        [
          '请先#绑定uid',
          segment.button([{ text: '绑定UID', input: '#绑定uid' }])
        ],
        false,
        { at: true }
      )
    }
    if (!this.ckInfo.ck) {
      this.e.reply([
        '暂无可用CK，请绑定更多用户或设置公共ck..',
        segment.button([{ text: 'Cookie帮助', callback: '#Cookie帮助' }])
      ])
    }
    this.e.noTips = true
  }
  async getCookie(game = 'gs', onlySelfCk = false) {
    if (this.ckUser?.ck) return this.ckUser?.ck
    let mysUser = await MysUser.getByQueryUid(this.uid, game, onlySelfCk)
    if (mysUser) {
      if (mysUser.ck) {
        this.ckInfo = mysUser.getCkInfo(game)
        this.ckUser = mysUser
        await mysUser.addQueryUid(this.uid, game)
      } else {
        await mysUser.disable(game)
        return onlySelfCk ? '' : await this.getCookie(game)
      }
    }
    return this.ckUser?.ck
  }
  async checkCode(res, type, mysApi = {}, data = {}, isTask = false) {
    if (!res) {
      if (!isTask)
        this.e.reply([
          `UID:${this.uid}，米游社接口请求失败，暂时无法查询`,
          this.mysButton
        ])
      return false
    }
    res.retcode = Number(res.retcode)
    if (type === 'bbs_sign') {
      if ([-5003].includes(res.retcode)) {
        res.retcode = 0
      }
    }
    switch (res.retcode) {
      case 0:
        break
      case -1:
      case -100:
      case 1001:
      case 10001:
      case 10103:
        if (/(登录|login)/i.test(res.message)) {
          if (this.ckInfo.uid) {
            logger.mark(`[ck失效][uid:${this.uid}][qq:${this.userId}]`)
            if (!isTask)
              this.e.reply([
                `UID:${this.ckInfo.uid}，米游社Cookie已失效`,
                this.mysButton
              ])
          } else {
            logger.mark(`[公共ck失效][ltuid:${this.ckInfo.ltuid}]`)
            if (!isTask)
              this.e.reply([
                `UID:${this.uid}，米游社查询失败，请稍后再试`,
                this.mysButton
              ])
          }
          if (!isTask) await this.delCk()
        } else {
          if (!isTask)
            this.e.reply([
              `UID:${this.uid}，米游社接口报错，暂时无法查询：${res.message}`,
              this.mysButton
            ])
        }
        break
      case 1008:
        if (!isTask)
          this.e.reply(
            [`UID:${this.uid}，请先去米游社绑定角色`, this.mysButton],
            false,
            { at: this.userId }
          )
        break
      case 10101:
        if (!isTask) {
          await this.disableToday()
          this.e.reply([`UID:${this.uid}，查询已达今日上限`, this.mysButton])
        }
        break
      case 10102:
        if (res.message === 'Data is not public for the user') {
          if (!isTask)
            this.e.reply(
              [`\nUID:${this.uid}，米游社数据未公开`, this.mysButton],
              false,
              { at: this.userId }
            )
        } else {
          if (!isTask)
            this.e.reply([
              `UID:${this.uid}，请先去米游社绑定角色`,
              this.mysButton
            ])
        }
        break
      case -1002:
        if (res.api === 'detail') res.retcode = 0
        break
      case 5003:
      case 10041:
        if (!isTask)
          this.e.reply([
            `UID:${this.uid}，米游社账号异常，暂时无法查询`,
            this.mysButton
          ])
        break
      case 1034:
      case 10035:
        let handler = this.e.runtime?.handler || {}
        if (handler.has('mys.req.err')) {
          logger.mark(
            `[米游社查询][uid:${this.uid}][qq:${this.userId}] 遇到验证码，尝试调用 Handler mys.req.err`
          )
          res =
            (await handler.call('mys.req.err', this.e, {
              mysApi,
              type,
              res,
              data,
              mysInfo: this
            })) || res
        }
        if (!res || res?.retcode == 1034) {
          logger.mark(
            `[米游社查询失败][uid:${this.uid}][qq:${this.userId}] 遇到验证码`
          )
          if (!isTask)
            this.e.reply([
              `UID:${this.uid}，米游社查询遇到验证码，请稍后再试`,
              this.mysButton
            ])
        }
        break
      case 10307:
        if (!isTask)
          this.e.reply([
            `UID:${this.uid}，版本更新期间，数据维护中`,
            this.mysButton
          ])
        break
      default:
        if (!isTask)
          this.e.reply([
            `UID:${this.uid}，米游社接口报错，暂时无法查询：${res.message || 'error'}`,
            this.mysButton
          ])
        break
    }
    if (res.retcode !== 0) {
      logger.mark(`[mys接口报错]${JSON.stringify(res)}，uid：${this.uid}`)
    }
    if (!isTask) await this.ckUser.addQueryUid(this.uid)
    return res
  }
  async delCk() {
    if (!this.ckUser) {
      return false
    }
    let ckUser = this.ckUser
    await ckUser.delWithUser()
  }
  async disableToday(game = 'gs') {
    await this.ckUser.disable(game)
  }
}

const apiTool = apiTool$1
const gsCfg = GSCfg
const mysApi = MysApi
const mysInfo = MysInfo

export {
  apiTool$1 as ApiTool,
  BOT_MYS_GENSHIN,
  BOT_NOTE_USER,
  BOT_ROOT_KEY,
  BaseModel$1 as BaseModel,
  DailyCache,
  GSCfg,
  MysApi,
  MysInfo,
  MysUser,
  MysUserDB,
  MysUtil,
  NoteUser,
  UserDB,
  UserGameDB,
  apiTool,
  createDir,
  forEach,
  getRoot,
  gsCfg,
  isPromise,
  mysApi,
  mysInfo,
  sequelize
}
