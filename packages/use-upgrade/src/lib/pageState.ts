import { pageStateGlobalVar } from '../core/constants'
import { CheckUpgradeOptions } from '../core/startCheckUpgrade'

declare global {
  interface Window {
    [pageStateGlobalVar]?: PageState
  }
}

export interface PageState extends CheckUpgradeOptions {
  /** 是否已启用 useUpgrade */
  enable: boolean

  /** 当前 hash */
  hash: string

  /** 本页面 useUpgrade 版本号 */
  lib: string

  /** 已触发过回调的 hash */
  triggered?: string
}

/** 设置页面变量 */
export function setPageState(globalState: Partial<PageState>) {
  window[pageStateGlobalVar] = { ...window[pageStateGlobalVar], ...globalState } as PageState
}

/** 提取页面变量 */
export function getPageState() {
  return { ...window[pageStateGlobalVar] }
}

/** 清理页面变量 */
export function cleanPageState() {
  window[pageStateGlobalVar] = undefined
}
