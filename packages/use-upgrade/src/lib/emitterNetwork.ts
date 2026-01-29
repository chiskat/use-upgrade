import { cancelEventName } from '../core/constants'

/** 设置网络触发器，在网页重联网后自动检查 */
export function setupNetworkEmitter(checkFn: () => void) {
  function pageReonlineCallback() {
    if (window.navigator.onLine) {
      checkFn()
    }
  }
  window.addEventListener('online', pageReonlineCallback)
  window.addEventListener(
    cancelEventName,
    () => {
      window.removeEventListener('online', pageReonlineCallback)
    },
    { once: true }
  )
}
