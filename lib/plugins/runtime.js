import { Handler } from 'yunzai'
import { MysInfo, NoteUser } from 'yunzai-mys'
import { Runtime as runtime } from 'yz-mw-runtime'
/**
 * @deprecated 已废弃
 */
export default class Runtime extends runtime {
  handler = null
  _mysInfo = {}
  e
  /**
   * @param e
   */
  constructor(e) {
    super(e)
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
            ].includes(key)
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
            ].includes(key)
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
}
