import { getPageState } from './pageState'

export interface StorageState {
  pending?: boolean
  remoteHash?: string
  skipHash?: string
  lastFetchTime?: number
  lib: string
}

/** 从存储中取值 */
export function getStorageState(): StorageState {
  const storageKey = getPageState().storageKey!
  const result = JSON.parse(localStorage.getItem(storageKey) || '{}')

  return result
}

/** 将值合并入存储 */
export function setStorageState(data: Partial<StorageState>) {
  const storageKey = getPageState().storageKey!
  localStorage.setItem(storageKey, JSON.stringify({ ...getStorageState(), ...data }))
}

/** 清理存储 */
export function cleanStorageState() {
  const storageKey = getPageState().storageKey!
  localStorage.removeItem(storageKey)
}
