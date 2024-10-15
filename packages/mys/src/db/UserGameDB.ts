import BaseModel from './BaseModel.js'
import lodash from 'lodash'

//
class UserGameDB extends BaseModel {}

//
BaseModel.initDB(UserGameDB, {
  // 用户ID，qq为数字
  userId: {
    type: BaseModel.Types.STRING
  },
  game: BaseModel.Types.STRING,
  uid: BaseModel.Types.STRING,
  data: {
    type: BaseModel.Types.STRING,
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
})

//
await UserGameDB.sync()

//
export default UserGameDB
