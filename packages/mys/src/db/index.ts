import UserDB from './UserDB.js'
import MysUserDB from './MysUserDB.js'
import UserGameDB from './UserGameDB.js'
import { sequelize } from './BaseModel.js'
/**
 * 接口不可改动，仅能新增
 */
export { UserDB, MysUserDB, UserGameDB, sequelize }
