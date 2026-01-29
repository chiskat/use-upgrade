import { triggerEventName } from './constants'

/**
 * 检查新版本
 * @param isSendRequest 是否发出网络请求获取最新的 index.html
 */
export function triggerCheckUpgrade(isSendRequest?: boolean) {
  window.dispatchEvent(
    new CustomEvent<{ isSendRequest?: boolean }>(triggerEventName, { detail: { isSendRequest: !!isSendRequest } })
  )
}
