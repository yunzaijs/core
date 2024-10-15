import Renderer from '@/image/renderer/loader.js'
/**
 * @deprecated 已废弃
 */
const renderer = Renderer.getRenderer()
/**
 * @deprecated 已废弃
 */
renderer.screenshot = async (name, data) => {
  const img = await renderer.render(name, data)
  return img ? global.segment.image(img) : img
}
/**
 * @deprecated 已废弃
 */
renderer.screenshots = async (name, data) => {
  data.multiPage = true
  const imgs = (await renderer.render(name, data)) || []
  const ret = []
  for (let img of imgs) {
    ret.push(img ? global.segment.image(img) : img)
  }
  return ret.length > 0 ? ret : false
}
export default renderer
