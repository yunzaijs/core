import { Application } from '@/core/app/Application.js'
import { EventEmun, PermissionEnum } from '@/core/types.js'

/**
 * 消息
 */
export class Messages<T extends keyof EventEmun> {
  #event = 'message.group' as T
  /**
   *
   */
  #count = 0
  /**
   *
   */
  #rule: {
    /**
     * 正则
     */
    reg?: RegExp | string
    /**
     * 函数名
     */
    fnc?: string
    /**
     * 权限
     */
    permission?: PermissionEnum
  }[] = []

  /**
   * 初始化配置
   * @param init
   */
  constructor(event?: T) {
    this.#event = event
  }

  /**
   *
   * @param reg
   * @param fnc
   */
  use(
    fnc: (
      ...arg: Parameters<EventEmun[T]>
    ) => Promise<boolean | void> | boolean | void,
    values: [] | [RegExp] | [RegExp, PermissionEnum] = []
  ) {
    this.#count++
    const propName = `prop_${this.#count}`
    this[propName] = fnc
    this.#rule.push({
      fnc: propName,
      reg: values[0],
      permission: values[1] ?? 'all'
    })
  }

  /**
   *
   */
  get ok() {
    const App = this
    class Children extends Application<any> {
      constructor() {
        // init
        super(App.#event)
        //
        this.event = App.#event
        //
        this.rule = App.#rule

        for (const key of App.#rule) {
          // 确认存在该函数
          if (App[key.fnc] instanceof Function) {
            // 改变this指向 确保未来废除 fun(e) 后可用
            this[key.fnc] = () => App[key.fnc].call(this, this.e)
          }
        }
      }
    }
    return Children
  }
}
