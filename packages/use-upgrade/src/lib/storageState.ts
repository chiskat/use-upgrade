import { getPageState } from './pageState'

export interface StorageState {
  /** 当前是否有某个实例正在发送请求 HTML */
  pending?: boolean

  /** 远程最新版的 HTML 版本 hash */
  remoteHash?: string

  /** 需要跳过触发的 HTML 版本 hash */
  skipHash?: string

  /** 上次请求的时间戳 */
  lastFetchTime?: number

  /** 当前已安装的 useUpgrade 版本号 */
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
