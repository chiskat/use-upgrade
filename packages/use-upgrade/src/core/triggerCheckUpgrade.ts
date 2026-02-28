import { triggerEventName } from './constants'

export interface TriggerCheckUpgradeOptions {
  /**
   * 是否立即发起网络请求拉取 HTML
   *
   * 默认 `false`
   */
  fetch?: boolean

  /**
   * 即使此版本号已触发回调，也强制再次触发
   *
   * 默认 `false`
   */
  duplicate?: boolean
}

export const defaultTriggerCheckUpgradeOptions = {
  fetch: false,
  duplicate: false,
} satisfies TriggerCheckUpgradeOptions

/**
 * 手动触发检查新版本
 * @param fetch 是否立即发起网络请求拉取 HTML
 */
export function triggerCheckUpgrade(fetch?: boolean): void
/**
 * 手动触发检查新版本
 * @param options 配置项
 */
export function triggerCheckUpgrade(options?: TriggerCheckUpgradeOptions): void

export function triggerCheckUpgrade(fetchOrOptions?: boolean | TriggerCheckUpgradeOptions): void {
  const options =
    typeof fetchOrOptions === 'boolean'
      ? { ...defaultTriggerCheckUpgradeOptions, fetch: fetchOrOptions }
      : { ...defaultTriggerCheckUpgradeOptions, ...fetchOrOptions }

  window.dispatchEvent(new CustomEvent<TriggerCheckUpgradeOptions>(triggerEventName, { detail: options }))
}
