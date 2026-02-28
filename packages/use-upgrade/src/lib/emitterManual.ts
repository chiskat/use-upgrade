import { cancelEventName, triggerEventName } from '../core/constants'
import { TriggerCheckUpgradeOptions } from '../core/triggerCheckUpgrade'

/** 安装手动触发器 */
export function setupManualEmitter(checkFn: (options?: TriggerCheckUpgradeOptions) => void) {
  function manualTriggerCallback(e: CustomEvent<TriggerCheckUpgradeOptions>) {
    checkFn(e.detail)
  }

  window.addEventListener<any>(triggerEventName, manualTriggerCallback)
  window.addEventListener(
    cancelEventName,
    () => {
      window.removeEventListener<any>(triggerEventName, manualTriggerCallback)
    },
    { once: true }
  )
}
