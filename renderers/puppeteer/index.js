import Puppeteer from './lib/puppeteer.js'
/**
 *
 * @param config
 * @returns renderer 渲染器对象
 * @returns renderer.id 渲染器ID，对应renderer中选择的id
 * @returns renderer.type 渲染类型，保留字段，暂时支持image
 * @returns renderer.render 渲染入口
 * @deprecated 已废弃
 */
export default config => new Puppeteer(config)
