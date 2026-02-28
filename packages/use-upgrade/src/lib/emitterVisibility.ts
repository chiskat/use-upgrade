import { cancelEventName } from '../core/constants'

/** 设置页面可见性触发器，在页面从后台切至前台时自动检查 */
export function setupVisibilityEmitter(checkFn: () => void) {
  function pageVisibleCallback() {
    if (document.visibilityState === 'visible') {
      checkFn()
    }
  }

  window.document.addEventListener('visibilitychange', pageVisibleCallback)
  window.addEventListener(
    cancelEventName,
    () => {
      window.document.removeEventListener('visibilitychange', pageVisibleCallback)
    },
    { once: true }
  )
}
