import { types } from 'node:util'
import { orderBy } from 'lodash-es'

class Handler {
  /**
   *
   */
  #events = {}

  /**
   *
   * @param cfg
   * @returns
   */
  add(cfg) {
    const { ns, fn, self, property = 50 } = cfg
    const key = cfg.key || cfg.event
    if (!key || !fn) return
    this.del(ns, key)
    logger.mark(`[Handler][Reg]: [${ns}][${key}]`)
    this.#events[key] = this.#events[key] || []
    this.#events[key].push({
      property,
      fn,
      ns,
      self,
      key
    })
    this.#events[key] = orderBy(this.#events[key], ['priority'], ['asc'])
  }

  /**
   *
   * @param ns
   * @param key
   * @returns
   */
  del(ns, key = '') {
    if (!key) {
      for (let key in this.#events) {
        this.del(ns, key)
      }
      return
    }
    if (!this.#events[key]) return
    for (let idx = 0; idx < this.#events[key].length; idx++) {
      const handler = this.#events[key][idx]
      if (handler.ns === ns) {
        this.#events[key].splice(idx, 1)
        this.#events[key] = orderBy(this.#events[key], ['priority'], ['asc'])
      }
    }
  }

  /**
   *
   * @param key
   * @param e
   * @param args
   */
  async callAll(key, e, args) {
    // 暂时屏蔽调用
    return this.call(key, e, args, true)
  }

  /**
   *
   * @param key
   * @param e
   * @param args
   * @param allHandler
   * @returns
   */
  async call(key, e, args, allHandler = false) {
    let ret
    for (let obj of this.#events[key]) {
      let fn = obj.fn
      let done = true
      let reject = (msg = '') => {
        if (msg) {
          logger.mark(`[Handler][Reject]: [${obj.ns}][${key}] ${msg}`)
        }
        done = false
      }
      ret = fn.call(obj.self, e, args, reject)
      if (types.isPromise(ret)) {
        ret = await ret
      }
      if (done && !allHandler) {
        logger.mark(`[Handler][Done]: [${obj.ns}][${key}]`)
        return ret
      }
    }
    return ret
  }

  /**
   *
   * @param key
   * @returns
   */
  has(key) {
    return !!this.#events[key]
  }
}

/**
 *
 */
export default new Handler()
