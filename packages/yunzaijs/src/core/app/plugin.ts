import { render } from '@/core/app/render.js'
import { EventType } from '@/core/types.js'
import { type EventMap } from 'icqq'
import { PluginSuperType, RulesType } from '@/core/types.js'

const State = {}
const SymbolTimeout = Symbol('Timeout')
const SymbolResolve = Symbol('Resolve')

class BasePlugin {
  /**
   * 指令集
   */
  rule: RulesType = []
  /**
   * 优先级
   */
  priority: number = 9999
  /**
   * 事件，默认 message
   */
  event: keyof EventMap = 'message'
  /**
   * 事件
   */
  e: EventType

  /**
   * @param msg 发送的消息
   * @param quote 是否引用回复
   * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
   * @param data.at 是否at用户
   */
  reply(msg: any[] | string = '', quote = false, data = {}) {
    // 不存在 e.reply
    if (!this.e?.reply || !msg) return false
    return this.e.reply(msg, quote, data)
  }

  /**
   *
   * @param isGroup
   * @returns
   */
  conKey(isGroup = false) {
    if (isGroup && this.e.isGroup) {
      return `${this.e.group_id}`
    } else {
      return `${this.e.user_id}`
    }
  }

  /**
   * @param type 执行方法
   * @param isGroup 是否群聊
   * @param time 操作时间
   * @param timeout 操作超时回复
   */
  setContext(
    type: string,
    isGroup = false,
    time = 120,
    timeout = '操作超时已取消'
  ) {
    const key = this.conKey(isGroup)
    if (!State[key]) State[key] = {}
    State[key][type] = this.e
    if (time) {
      State[key][type][SymbolTimeout] = setTimeout(() => {
        if (State[key][type]) {
          const resolve = State[key][type][SymbolResolve]
          delete State[key][type]
          resolve ? resolve(false) : this.reply(timeout, true)
        }
      }, time * 1000)
    }
    return State[key][type]
  }

  /**
   *
   * @param type
   * @param isGroup
   * @returns
   */
  getContext(type?: string, isGroup?: boolean) {
    if (type) return State[this.conKey(isGroup)]?.[type]
    return State[this.conKey(isGroup)]
  }

  /**
   *
   * @param type
   * @param isGroup
   */
  finish(type: string, isGroup?: boolean) {
    const key = this.conKey(isGroup)
    if (State[key]?.[type]) {
      clearTimeout(State[key][type][SymbolTimeout])
      delete State[key][type]
    }
  }
}

export class Plugin extends BasePlugin {
  /**
   * 应用名
   * 用于过滤功能启动和关闭
   */
  name: PluginSuperType['name'] = 'your-plugin'
  /**
   * @deprecated 已废弃
   */
  dsc: PluginSuperType['dsc'] = '无'
  /**
   * @deprecated 已废弃
   */
  task: PluginSuperType['task'] = null
  /**
   * @deprecated 已废弃
   */
  namespace: PluginSuperType['namespace'] = null
  /**
   * @deprecated 已废弃
   */
  handler: PluginSuperType['handler'] = null
  /**
   * @deprecated 已废弃
   */
  group_id: number
  /**
   * @deprecated 已废弃
   */
  groupId: number
  /**
   * @deprecated 已废弃
   */
  user_id: number
  /**
   * @deprecated 已废弃
   */
  userId: number

  // global.Bot.on('notice.group.poke',(e)=>{ } )

  /**
   * @param event 执行事件，默认message
   * @param priority 优先级，数字越小优先级越高
   * @param rule 优先级，数字越小优先级越高
   */
  constructor(init: PluginSuperType = {}) {
    //
    super()

    const {
      event,
      priority = 5000,
      rule,
      name,
      dsc,
      handler,
      namespace,
      task
    } = init

    name && (this.name = name)
    dsc && (this.dsc = dsc)
    event && (this.event = event)
    priority && (this.priority = priority)

    /**
     * 定时任务，可以是数组
     */
    task &&
      (this.task = {
        /** 任务名 */
        name: task?.name ?? '',
        /** 任务方法名 */
        fnc: task?.fnc ?? '',
        /** 任务cron表达式 */
        cron: task?.cron ?? ''
      })

    /**
     * 命令规则
     */
    rule && (this.rule = rule)

    if (handler) {
      this.handler = handler
      this.namespace = namespace || ''
    }
  }

  /**
   *
   * @deprecated 已废弃
   * @param args
   * @returns
   */
  awaitContext(...args) {
    return new Promise(
      resolve =>
        (this.setContext('resolveContext', ...args)[SymbolResolve] = resolve)
    )
  }

  /**
   *
   * @deprecated 已废弃
   * @param context
   */
  resolveContext(context) {
    this.finish('resolveContext')
    context[SymbolResolve](this.e)
  }

  /**
   * @deprecated 已废弃
   * @param plugin
   * @param tpl
   * @param data
   * @param cfg
   * @returns
   */
  async renderImg(plugin, tpl, data, cfg = {}) {
    return render(plugin, tpl, data, { ...cfg, e: this.e })
  }
}

/**
 *
 * @deprecated 已废弃
 */
export const plugin = Plugin

/**
 * global.plugin
 */
global.plugin = plugin
