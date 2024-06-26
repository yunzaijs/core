import { Sequelize, DataTypes, Model } from 'sequelize'

// Data.createDir
import { createDir } from '../utils/Data.js'
import { SQLITE_DB_DIR } from '../config/system.js'
import { join } from 'path'

createDir(SQLITE_DB_DIR, 'root')

// TODO DB自定义
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: join(process.cwd(), `${SQLITE_DB_DIR}/data.db`),
  logging: false
})

await sequelize.authenticate()

/**
 *
 */
export default class BaseModel extends Model {
  /**
   *
   */
  static Types = DataTypes

  /**
   *
   * @param model
   * @param columns
   */
  static initDB(model, columns) {
    let name = model.name
    name = name.replace(/DB$/, 's')
    model.init(columns, { sequelize, tableName: name })
    model.COLUMNS = columns
  }
}

/**
 *
 */
export { sequelize }
