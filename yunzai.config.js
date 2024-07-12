import runtime from 'yz-mw-runtime'
import starRail from 'yz-mw-star-rail'
/**
 *
 */
export default {
  // 插件
  plugins: [],
  // 中间件
  middlewares: [runtime(), starRail()]
}
