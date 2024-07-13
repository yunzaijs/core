import runtime from 'yz-mw-runtime'
import starRail from 'yz-mw-star-rail'
import system from 'yz-system'
/**
 * @type {import("yunzai").ConifigOptions}
 */
export default {
  // 应用
  applications: [system()],
  // 中间件
  middlewares: [runtime(), starRail()]
}
