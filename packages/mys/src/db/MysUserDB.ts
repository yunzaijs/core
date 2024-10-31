import BaseModel from './BaseModel.js'

class MysUserDB extends BaseModel {
  /**
   *
   * @param ltuid
   * @param create
   * @returns
   */
  static async find(ltuid = '', create = false) {
    // DB查询
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

  /**
   *
   * @param mys
   * @returns
   */
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

//
BaseModel.initDB(MysUserDB, {
  // 用户ID，qq为数字
  ltuid: {
    type: BaseModel.Types.INTEGER,
    primaryKey: true
  },

  // MysUser类型，mys / hoyolab
  type: {
    type: BaseModel.Types.STRING,
    defaultValue: 'mys',
    notNull: true
  },

  // CK
  ck: BaseModel.Types.STRING,
  device: BaseModel.Types.STRING,
  uids: {
    type: BaseModel.Types.STRING,
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
})

//
await MysUserDB.sync()

//
export default MysUserDB
