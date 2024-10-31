import YAML from 'yaml'
import chokidar from 'chokidar'
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import lodash from 'lodash'
import NoteUser from './NoteUser.js'
import { join } from 'node:path'

/**
 * 动态加载喵喵模块
 */
const dir = join(process.cwd(), './plugins/miao-plugin/models/index.js')
let Character: any = null
let Weapon: any = null
if (existsSync(dir)) {
  const { Character: C, Weapon: W } = await import(`file://${dir}`)
  Character = C
  Weapon = W
}

/**
 * ***********
 * 配置文件
 * ***********
 */
class GsCfg {
  nameID: typeof Map.prototype | false = new Map()
  sr_nameID: typeof Map.prototype | false = new Map()
  isSr = false
  /** 默认设置 */
  defSetPath = './plugins/genshin/defSet/'
  defSet = {}
  /** 用户设置 */
  configPath = './plugins/genshin/config/'
  config = {}
  /** 监听文件 */
  watcher = { config: {}, defSet: {} }
  ignore = ['mys.pubCk', 'gacha.set', 'bot.help', 'role.name']

  /**
   *
   */
  get element() {
    return {
      ...this.getdefSet('element', 'role'),
      ...this.getdefSet('element', 'weapon')
    }
  }

  /**
   * @param app  功能
   * @param name 配置文件名称
   */
  getdefSet(app, name) {
    return this.getYaml(app, name, 'defSet')
  }

  /**
   * tudo
   * 用户配置
   * @param app
   * @param name
   * @returns
   */
  getConfig(app, name) {
    if (this.ignore.includes(`${app}.${name}`)) {
      return this.getYaml(app, name, 'config')
    }

    return {
      ...this.getdefSet(app, name),
      ...this.getYaml(app, name, 'config')
    }
  }

  /**
   * 获取配置yaml
   * @param app 功能
   * @param name 名称
   * @param type 默认跑配置-defSet，用户配置-config
   */
  getYaml(app, name, type) {
    const file = this.getFilePath(app, name, type)
    const key = `${app}.${name}`
    if (this[type][key]) return this[type][key]
    if (!existsSync(file)) return false
    try {
      const data = readFileSync(file, 'utf8')
      this[type][key] = YAML.parse(data)
    } catch (error) {
      logger.error(`[${app}][${name}] 格式错误 ${error}`)
      return false
    }
    this.watch(file, app, name, type)
    return this[type][key]
  }

  /**
   *
   * @param app s
   * @param name
   * @param type
   * @returns
   */
  getFilePath(app, name, type) {
    if (type == 'defSet') {
      return `${this.defSetPath}${app}/${name}.yaml`
    } else {
      return `${this.configPath}${app}.${name}.yaml`
    }
  }

  /**
   * 监听配置文件
   * @param file
   * @param app
   * @param name
   * @param type
   * @returns
   */
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

  /**
   * tudo
   * 读取所有用户绑定的ck
   * @param game
   * @returns
   */
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

  /**
   * 原神角色id转换角色名字
   * @param id
   * @returns
   */
  roleIdToName(id) {
    let char = Character.get(id)
    return char?.name || ''
  }

  /**
   * 原神角色别名转id
   * @param keyword
   * @param isSr
   * @returns
   */
  roleNameToID(keyword, isSr) {
    const char = Character.get(keyword, isSr ? 'sr' : 'gs')
    return char?.id || false
  }

  /**
   * 原神角色武器长名称缩写
   * @param name 名称
   * @param isWeapon 是否武器
   */
  shortName(name, isWeapon = false) {
    const obj = (isWeapon ? Weapon : Character).get(name)
    return obj.abbr || obj.name || ''
  }

  /**
   * 公共配置ck文件修改hook 爆栈原因
   * @deprecated 已废弃
   */
  async change_myspubCk() {
    logger.info('错误行为，尝试进行循环引用！')
    logger.info('这是设计错误，请等待修复....')
    // await MysInfo.initCache()
    // await MysInfo.initPubCk()
  }

  /**
   *
   * @param groupId
   * @returns
   */
  getGachaSet(groupId = '') {
    const config = this.getYaml('gacha', 'set', 'config')
    const def = config.default
    if (config[groupId]) {
      return { ...def, ...config[groupId] }
    }
    return def
  }

  /**
   *
   * @param msg
   * @returns
   */
  getMsgUid(msg) {
    const ret = /([1-9]|18)[0-9]{8}/g.exec(msg)
    if (!ret) return false
    return ret[0]
  }

  /**
   * 获取消息内原神角色名称，uid
   * @param msg 判断消息
   * @param filterMsg 过滤消息
   * @return roleId 角色id
   * @return name 角色名称
   * @return alias 当前别名
   * @return uid 游戏uid
   */
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

  /**
   *
   * @param app
   * @param name
   */
  cpCfg(app, name) {
    if (!existsSync('./plugins/genshin/config')) {
      mkdirSync('./plugins/genshin/config')
    }
    let set = `./plugins/genshin/config/${app}.${name}.yaml`
    if (!existsSync(set)) {
      copyFileSync(`./plugins/genshin/defSet/${app}/${name}.yaml`, set)
    }
  }

  /**
   * 仅供内部调用
   * @returns
   */
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

  /**
   * 仅供内部调用
   * @param keyword
   * @param isSr
   * @returns
   */
  _roleNameToID(keyword, isSr?: boolean) {
    if (isSr) this.isSr = isSr
    if (!isNaN(keyword)) keyword = Number(keyword)
    this._getAbbr()
    const key = this.isSr ? 'sr_nameID' : 'nameID'
    if (typeof this[key] != 'boolean') {
      let roelId = this[key].get(String(keyword))
      return roelId || false
    }
    return false
  }

  /**
   * 仅供内部调用
   * @param msg
   * @param filterMsg
   * @param isSr
   * @returns
   */
  _getRole(msg, filterMsg = '', _ = false) {
    let alias = msg.replace(/#|老婆|老公|([1-9]|18)[0-9]{8}/g, '').trim()
    if (filterMsg) {
      alias = alias.replace(new RegExp(filterMsg, 'g'), '').trim()
    }
    /**
     * 判断是否命中别名
     */
    let roleId = this._roleNameToID(alias)
    if (!roleId) return false
    /**
     * 获取uid
     */
    let uid = this.getMsgUid(msg) || ''
    return {
      roleId,
      uid,
      alias,
      name: this.roleIdToName(roleId)
    }
  }

  /**
   * 仅供内部调用
   * @param hash
   * @deprecated 已废弃
   * @returns
   */
  getWeaponDataByWeaponHash(_) {
    logger.info('gsCfg.getWeaponDataByWeaponHash() 已废弃')
    return {}
  }

  /**
   *
   * @deprecated 已废弃
   * @returns
   */
  getAllAbbr() {
    logger.info('gsCfg.getAllAbbr() 已废弃')
    return {}
  }

  /**
   *
   * @deprecated 已废弃
   * @param userId
   * @returns
   */
  getBingCkSingle(_) {
    logger.info('gsCfg.getBingCkSingle() 已废弃')
    return {}
  }

  /**
   *
   * @deprecated 已废弃
   * @param userId
   * @param data
   */
  saveBingCk(_, __) {
    logger.info('gsCfg.saveBingCk() 已废弃')
  }

  /**
   *
   * @deprecated 已废弃
   * @param roleName
   * @returns
   */
  getElementByRoleName(_) {
    logger.info('gsCfg.getElementByRoleName() 已废弃')
    return ''
  }

  /**
   *
   * @deprecated 已废弃
   * @param skillId
   * @param roleName
   * @returns
   */
  getSkillDataByskillId(_, __) {
    logger.info('gsCfg.getSkillDataByskillId() 已废弃')
    return {}
  }

  /**
   *
   * @deprecated 已废弃
   * @param propId
   * @returns
   */
  fightPropIdToName(_) {
    logger.info('gsCfg.fightPropIdToName() 已废弃')
    return ''
  }

  /**
   *
   * @deprecated 已废弃
   * @param talentId
   * @returns
   */
  getRoleTalentByTalentId(_) {
    logger.info('gsCfg.getRoleTalentByTalentId 已废弃')
    return {}
  }

  /**
   *
   * @deprecated 已废弃
   */
  getAbbr() {
    logger.info('gsCfg.getAbbr() 已经废弃')
  }
}

export default new GsCfg()
