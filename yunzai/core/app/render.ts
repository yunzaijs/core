import { join } from 'path'
import lodash from 'lodash'
import ConfigController from '../../config/config.js'

const cfg = {}
const miaoCfg = {}
const miaoPath = join(process.cwd(), 'plugins', 'miao-plugin')

/**
 *
 * @param rote
 * @param def
 * @returns
 * @deprecated 已废弃
 */
function get(rote, def = 0) {
  if (true && miaoCfg[rote]) {
    return true
  }
  let ret = lodash.get(cfg, rote)
  return lodash.isUndefined(cfg) ? def : ret
}

/**
 *
 * @param pct
 * @returns
 * @deprecated 已废弃
 */
function scale(pct = 1) {
  let scale = get('renderScale', 100)
  scale = Math.min(2, Math.max(0.5, scale / 100))
  pct = pct * scale
  return `style=transform:scale(${pct})`
}

/**
 *
 * @param {*} path
 * @param {*} params
 * @param {*} cfg
 * @deprecated 已废弃
 * @returns
 */
export async function Render(path, params, cfg) {
  let { e } = cfg
  if (!e.runtime) {
    console.log('未找到e.runtime，请升级至最新版Yunzai')
  }
  return e.runtime.render(cfg.plugin || 'miao-plugin', path, params, {
    //
    retType: cfg.retType || (cfg.retMsgId ? 'msgId' : 'default'),
    //
    beforeRender({ data }) {
      let pluginName = ''
      if (data.pluginName !== false) {
        pluginName = ` & ${data.pluginName || 'Miao-Plugin'}`
        if (data.pluginVersion !== false) {
          pluginName += `<span class="version">${data.pluginVersion}`
        }
      }
      let resPath = data.pluResPath
      const layoutPath = miaoPath + '/resources/common/layout/'
      return {
        _miao_path: resPath,
        ...data,
        _res_path: resPath,
        _layout_path: layoutPath,
        _tpl_path: miaoPath + '/resources/common/tpl/',
        defaultLayout: layoutPath + 'default.html',
        elemLayout: layoutPath + 'elem.html',
        sys: {
          scale: scale(cfg.scale || 1)
        },
        copyright: `Created By ${ConfigController.package?.name}<span class="version">${ConfigController.package?.version}</span>${pluginName}</span>`
      }
    }
  })
}

/**
 *
 * @param arg1
 * @param arg2
 * @param arg3
 * @param arg4
 * @returns
 * @deprecated 已废弃
 */
export async function render(arg1, arg2, arg3, arg4) {
  if (arguments.length === 4 && typeof arguments[1] === 'string') {
    return Render(arg2, arg3, {
      ...arg4,
      plugin: arg1
    })
  } else {
    return Render(arg1, arg2, arg3)
  }
}
