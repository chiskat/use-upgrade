import { CheckUpgradeOptions } from '../core/startCheckUpgrade'

export interface PageState extends CheckUpgradeOptions {
  enable: boolean
  hash: string
  lib: string
}

let useUpgradeInternal: Partial<PageState> = {}

/** 设置页面变量 */
export function setPageState(globalState: Partial<PageState>) {
  useUpgradeInternal = { ...useUpgradeInternal, ...globalState } as PageState
}

/** 提取页面变量 */
export function getPageState() {
  return { ...useUpgradeInternal }
}

/** 清理页面变量 */
export function cleanPageState() {
  useUpgradeInternal = {}
}
