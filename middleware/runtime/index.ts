import { middlewareOptions, useEvent } from 'yunzai'
import { MysInfo, NoteUser } from 'yunzai-mys'
export * from './src/runtime.js'
import { Runtime } from './src/runtime.js'
type options = { name: string }
export default (config?: options) => {
  // 返回中间件
  return middlewareOptions({
    typing: 'message',
    name: config?.name ?? 'Runtime',
    // 监听事件
    on: async event => {
      await useEvent(
        async e => {
          // init
          await MysInfo.initCache()
          // e.user
          const user = await NoteUser.create(e)
          if (user) {
            // 对象代理
            e.user = new Proxy(user, {
              get(self, key: string) {
                const fnMap = {
                  uid: 'getUid',
                  uidList: 'getUidList',
                  mysUser: 'getMysUser',
                  ckUidList: 'getCkUidList'
                }
                if (fnMap[key]) {
                  return self[fnMap[key]](e.game)
                }
                if (key === 'uidData') {
                  return self.getUidData('', e.game)
                }
                const list = [
                  'getUid',
                  'getUidList',
                  'getMysUser',
                  'getCkUidList',
                  'getUidMapList',
                  'getGameDs'
                ]
                if (list.includes(key)) {
                  return (_game, arg2) => {
                    return self[key](_game || e.game, arg2)
                  }
                }
                const list2 = [
                  'getUidData',
                  'hasUid',
                  'addRegUid',
                  'delRegUid',
                  'setMainUid'
                ]
                if (list2.includes(key)) {
                  return (uid, _game = '') => {
                    return self[key](uid, _game || e.game)
                  }
                }
                return self[key]
              }
            })
          }
          // runtime
          e.runtime = new Runtime(e)
        },
        [event, 'message.group', 'message.private']
      )
    }
  })
}
