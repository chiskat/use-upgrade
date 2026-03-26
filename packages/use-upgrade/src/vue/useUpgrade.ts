import { onMounted, onUnmounted, ref } from 'vue'

import { upgradeEventName } from '../core/constants'
import { localCheck } from '../lib/localCheck'

/**
 * Vue Hook · 获取当前站点是否有新版本
 * @param callback 有新版本检测到时，触发此回调
 * @returns 站点是否有新版本
 */
export function useUpgrade(callback?: () => void) {
  const hasNewVersion = ref(localCheck())

  const upgradeHandler = () => {
    hasNewVersion.value = true

    if (typeof callback === 'function') {
      callback()
    }
  }

  onMounted(() => {
    window.addEventListener(upgradeEventName, upgradeHandler)
  })

  onUnmounted(() => {
    window.removeEventListener(upgradeEventName, upgradeHandler)
  })

  return hasNewVersion
}
