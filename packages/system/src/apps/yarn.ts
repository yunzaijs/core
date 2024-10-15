import { dirname, join } from 'path'
import { Application, makeForwardMsg } from 'yunzaijs'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync
} from 'fs'
import { getCommandOutput } from '../model/utils.js'
export class nodeModules extends Application<'message'> {
  constructor(e) {
    super('message')
    // event
    if (e) this.e = e
    //
    this.rule = [
      {
        reg: /^#云崽配置$/,
        fnc: this.showConfig.name
      },
      {
        reg: /^#依赖配置$/,
        fnc: this.packagelist.name
      },
      {
        reg: /^#依赖检查/,
        fnc: this.checkPackagelist.name
      },
      {
        reg: /^#依赖锁删除$/,
        fnc: this.removePackageLock.name
      },
      {
        reg: /^#云崽(添加|删除)(中间件|应用)/,
        fnc: this.updateConfig.name
      }
    ]
  }

  /**
   * 依赖列表
   */
  async packagelist() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const dir = join(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(dir, 'utf-8'))
    let arr = []
    if (pkg?.dependencies) {
      const dependenciesArray = Object.keys(pkg.dependencies)
      if (dependenciesArray.length >= 0) {
        const arr2 = dependenciesArray.map(
          key => `${key}:"${pkg.dependencies[key]}"`
        )
        arr = [...arr, '[dependencies]', ...arr2]
      }
    }
    if (pkg?.devDependencies) {
      const devDependenciesArray = Object.keys(pkg.devDependencies)
      if (devDependenciesArray.length >= 0) {
        const arr2 = devDependenciesArray.map(
          key => `${key}:"${pkg.devDependencies[key]}"`
        )
        arr = [...arr, '[devDependencies]', ...arr2]
      }
    }
    //
    if (arr.length <= 0) {
      this.e.reply('依赖为空')
    } else {
      const msg = await makeForwardMsg(this.e, arr, 'Yunzai 依赖配置信息')
      this.e.reply(msg)
    }
  }

  /**
   * 校验依赖
   */
  checkPackagelist() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const name = this.e.msg.replace(/^#依赖检查/, '')
    const dir = join(process.cwd(), 'node_modules', name)
    if (!existsSync(dir)) {
      this.e.reply(`不存在${name}`)
      return
    }
    const dir2 = join(dir, 'package.json')
    if (!existsSync(dir2)) {
      this.e.reply(`不存在${name}/package.json`)
      return
    }
    const pkg2 = JSON.parse(readFileSync(dir2, 'utf-8'))
    const version2 = pkg2.version
    if (!version2) {
      this.e.reply('依赖版本未知')
      return
    }
    // loacl
    const dir3 = join(process.cwd(), 'package.json')
    const pkg3 = JSON.parse(readFileSync(dir3, 'utf-8'))
    if (pkg3?.dependencies) {
      const version3 = pkg3.dependencies[name]
      if (!version3) {
        this.e.reply('')
        this.e.reply(`依赖未配置${name},请执行：yarn add ${name} -W`)
        return
      }
      if (/link/.test(String(version3))) {
        this.e.reply('link 无法校验')
        return
      }
      if (String(version3).replace('^', '') !== String(version2)) {
        this.e.reply('依赖不对等，请执行 yarn')
        return
      }
      this.e.reply('对等依赖')
    } else {
      this.e.reply(`依赖未配置${name},请执行：yarn add ${name} -W`)
    }
    //
  }

  async packagelistInsall() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    await this.e.reply('yarn正在校验依赖...')
    getCommandOutput('yarn -v')
      .then(() => {
        getCommandOutput(`yarn`)
          .then(async message => {
            logger.mark(message)
            await this.e.reply('yarn 校验完成!')
          })
          .catch(err => {
            logger.error(err)
            this.e.reply('yarn 依赖存在错误，请手动检查')
          })
      })
      .catch(() => {
        this.e.reply('找不到 yarn , 请安装\nnpm i yarn@1.19.1 -g')
      })
  }

  /**
   *
   * @returns
   */
  async removePackagelist() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const name = this.e.msg.replace(/^#依赖移除/, '')
    if (!name) {
      this.e.reply('未知字符')
      return
    }
    await this.e.reply('yarn正在校验依赖...')
    getCommandOutput('yarn -v')
      .then(() => {
        getCommandOutput(`yarn remove ${name}`)
          .then(async message => {
            logger.mark(message)
            await this.e.reply('yarn 移除完成!')
          })
          .catch(err => {
            logger.error(err)
            this.e.reply('yarn 依赖存在错误，请手动检查')
          })
      })
      .catch(() => {
        this.e.reply('找不到 yarn , 请安装\nnpm i yarn@1.19.1 -g')
      })
  }

  /**
   *
   * @returns
   */
  async removePackageLock() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const dir = join(process.cwd(), 'yarn.lock')
    if (!existsSync(dir)) {
      this.e.reply('不存在 yarn.lock')
      return
    }
    unlinkSync(dir)
    this.e.reply('删除完成')
  }

  /**
   *
   * @returns
   */
  async addPackagelist() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const name = this.e.msg.replace(/^#依赖添加/, '')
    if (!name) {
      this.e.reply('未知字符')
      return
    }
    await this.e.reply('yarn正在校验依赖...')
    getCommandOutput('yarn -v')
      .then(() => {
        getCommandOutput(`yarn add ${name} -W`)
          .then(async message => {
            logger.mark(message)
            await this.e.reply('yarn 添加完成!')
          })
          .catch(err => {
            logger.error(err)
            this.e.reply('yarn 依赖存在错误，请手动检查')
          })
      })
      .catch(() => {
        this.e.reply('找不到 yarn , 请安装\nnpm i yarn@1.19.1 -g')
      })
  }

  /**
   *
   */
  showConfig() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const dir = join(process.cwd(), 'yunzai.config.json')
    if (!existsSync(dir)) {
      this.e.reply('不存在 yunzai.config.json')
      return
    }
    const msg = readFileSync(dir, 'utf-8')
    this.e.reply(msg)
  }

  /**
   *
   */
  updateConfig() {
    // 不是主人
    if (!this.e.isMaster) {
      this.e.reply('无权限')
      return
    }
    const dir = join(process.cwd(), 'yunzai.config.json')
    if (!existsSync(dir)) {
      // 不存在就创建
      writeFileSync(
        dir,
        JSON.stringify({
          applications: [],
          middlewares: []
        })
      )
    }
    //
    const name = this.e.msg.replace(/^#云崽(添加|删除)(中间件|应用)/, '')
    if (!name || name == '') {
      this.e.reply('未知字符串')
      return
    }
    // 备份之前的记录
    const condigData = readFileSync(dir, 'utf-8')
    // 保存备份
    const save = () => {
      const dir3 = join(
        join(process.cwd(), 'config', 'system'),
        `${Date.now()}.json`
      )
      mkdirSync(dirname(dir3), { recursive: true })
      writeFileSync(dir3, condigData)
    }
    //
    const Data = JSON.parse(condigData)
    //
    if (/添加/.test(this.e.msg)) {
      // 添加
      if (/中间件/.test(this.e.msg)) {
        if (!Array.isArray(Data?.middlewares)) {
          Data.middlewares = []
          Data.middlewares.push(name)
        } else {
          if (Data.middlewares.includes(name)) {
            this.e.reply('已存在')
            return
          } else {
            // 保存备份
            save()
            Data.middlewares.push(name)
            // 保存数据
            writeFileSync(dir, Data)
            this.e.reply('修改完成')
          }
        }
      } else {
        if (!Array.isArray(Data?.applications)) {
          Data.applications = []
          Data.applications.push(name)
        } else {
          if (Data.applications.includes(name)) {
            this.e.reply('已存在')
            return
          } else {
            // 保存备份
            save()
            Data.applications.push(name)
            // 保存数据
            writeFileSync(dir, Data)
            this.e.reply('修改完成')
          }
        }
      }
    } else {
      if (/中间件/.test(this.e.msg)) {
        if (!Array.isArray(Data?.middlewares)) {
          this.e.reply('不存在')
          return
        } else {
          if (Data.middlewares.includes(name)) {
            // 保存备份
            save()
            Data.middlewares = Data.middlewares.filter(item => item !== name)
            // 保存数据
            writeFileSync(dir, Data)
            this.e.reply('修改完成')
          } else {
            this.e.reply('不存在')
            return
          }
        }
      } else {
        if (!Array.isArray(Data?.applications)) {
          this.e.reply('不存在')
          return
        } else {
          if (Data.applications.includes(name)) {
            // 保存备份
            save()
            Data.applications = Data.applications.filter(item => item !== name)
            // 保存数据
            writeFileSync(dir, Data)
            this.e.reply('修改完成')
          } else {
            this.e.reply('不存在')
            return
          }
        }
      }
    }
  }
}
