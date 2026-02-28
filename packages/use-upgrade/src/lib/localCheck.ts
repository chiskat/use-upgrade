import { getPageState } from './pageState'
import { getStorageState } from './storageState'

/** 通过本地存储的版本 hash 判断是否有新版本发布 */
export function localCheck(): boolean {
  const { hash } = getPageState()
  const { remoteHash, skipHash } = getStorageState()

  // 无远程记录 / 无本地记录 / 被标记为 skip，均强制返回 false
  if (!remoteHash || !hash || skipHash === remoteHash) {
    return false
  }

  return hash !== remoteHash
}
