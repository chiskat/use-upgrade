import { cancelEventName } from '../core/constants'

/** 设置路由触发器，在网页使用 History API 导航时自动触发 */
export function setupRouteEmitter(checkFn: () => void) {
  const rawPushState = window.history.pushState
  const rawReplaceState = window.history.replaceState

  function routeCallback() {
    checkFn()
  }

  window.history.pushState = (...params) => {
    routeCallback()
    return rawPushState.apply(window.history, params)
  }

  window.history.replaceState = (...params) => {
    routeCallback()
    return rawReplaceState.apply(window.history, params)
  }

  window.addEventListener(
    cancelEventName,
    () => {
      window.history.pushState = rawPushState
      window.history.replaceState = rawReplaceState
    },
    { once: true }
  )
}
