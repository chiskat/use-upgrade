import { useEffect, useState } from 'react'

import { upgradeEventName } from '../core/constants'
import { localCheck } from '../lib/localCheck'

/**
 * React Hook · 获取当前站点是否有新版本
 * @param callback 有新版本检测到时，触发此回调
 * @returns 站点是否有新版本
 */
export function useUpgrade(callback?: () => void): boolean {
  const [hasNewVersion, setHasNewVersion] = useState(() => localCheck())

  useEffect(() => {
    const upgradeHandler = () => {
      setHasNewVersion(true)

      if (typeof callback === 'function') {
        callback()
      }
    }

    window.addEventListener(upgradeEventName, upgradeHandler)

    return () => {
      window.removeEventListener(upgradeEventName, upgradeHandler)
    }
  }, [callback])

  return hasNewVersion
}
