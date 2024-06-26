import UserDB from './UserDB.js'
import MysUserDB from './MysUserDB.js'
import UserGameDB from './UserGameDB.js'
import { sequelize } from './BaseModel.js'
/**
 *
 */
export { UserDB, MysUserDB, UserGameDB, sequelize }
/**
 * 不推荐使用，可能放弃
 * @deprecated
 */
export const Redis = global.redis
