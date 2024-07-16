import { Component } from './component'
import { Puppeteer } from './puppeteer'
import { ComponentCreateOpsionType } from './types'

/**
 * 截图类
 */
export class Picture {
  /**
   * 浏览器控制
   */
  Pup: typeof Puppeteer.prototype = null
  /**
   * 组件控制
   */
  Com: typeof Component.prototype = null

  /**
   * 初始化组件和浏览器
   */
  constructor() {
    this.Com = new Component()
    this.Pup = new Puppeteer()
  }

  /**
   *
   * @param element
   * @param options
   * @returns
   */
  async screenshot(
    element: React.ReactNode,
    options: ComponentCreateOpsionType
  ) {
    const Address = this.Com.create(element, options)
    if (
      typeof options.file_create == 'boolean' &&
      options.file_create === false
    )
      return Address
    return this.Pup.render(Address)
  }
}
