import { join } from "node:path"
import { app } from "../config"
// 生成式配置
export const CONFIG_INIT_PATH = join(process.cwd(), 'config', 'config')
// 默认配置
export const CONFIG_DEFAULT_PATH = join(app.cwd(), 'yaml')
// 插件目录
export const PLUGINS_PATH = join(process.cwd(), 'plugins')
// 中间件目录
export const MIDDLEWARE_PATH = 'middleware'
// 数据文件存储目录
export const SQLITE_DB_DIR = '/data/storage/sqlite'
// 机器人名称
export const BOT_NAME = 'Yunzai'
// 机器人登录控制key
export const BOT_LOGIN_KEY = 'Yz:loginMsg:'
// 机器计数key
export const BOT_COUNT_KEY = 'Yz:count:'
// 机器人浏览器存储key   -- levelStorage
export const BOT_CHROMIUM_KEY = 'Yz:chromium:'