import { cancelEventName } from './constants'

/**
 * 取消新版本检测
 *
 * 调用后，`useUpgrade` 暂停工作，事件监听器被移除
 */
export function cancelCheckUpgrade() {
  window.dispatchEvent(new Event(cancelEventName))
}
