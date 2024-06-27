import UserDB from './UserDB.js'
import MysUserDB from './MysUserDB.js'
import UserGameDB from './UserGameDB.js'
import { sequelize } from './BaseModel.js'
/**
 * 不推荐使用，可能放弃
 */
export { UserDB, MysUserDB, UserGameDB, sequelize }
/**
 * @deprecated
 */
export const Redis = global.redis

/**
 * 数据模块
 * 每个应用自行设计存储
 * 并不需要此模块进行管理
 */
