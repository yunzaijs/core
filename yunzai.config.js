import runtime from 'yz-mw-runtime'
import starRail from 'yz-mw-star-rail'
// v3中称之为修仙插件
// import xiuxian from 'yz-app-xiuxian'
/**
 * @type {import("yunzai").ConifigOptions}
 */
export default {
  // 插件
  // plugins: [],
  // 应用
  // application: [xiuxian()],
  // 中间件
  middlewares: [runtime(), starRail()]
}
