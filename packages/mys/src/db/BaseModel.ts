import { Sequelize, DataTypes, Model } from 'sequelize'
import { join, dirname } from 'path'
import fs from 'fs'
const dir = join(process.cwd(), `/data/db/data.db`)
fs.mkdirSync(dirname(dir), { recursive: true })
// TODO DB自定义
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dir,
  logging: false
})
await sequelize.authenticate()
export default class BaseModel extends Model {
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
export { sequelize }
