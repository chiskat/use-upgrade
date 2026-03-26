import { CheckUpgradeOptions, UseUpgradeCallback } from '../core/startCheckUpgrade'
import { UseUpgradeError } from '../core/UseUpgradeError'

export function verifyParams(callback: UseUpgradeCallback, options?: CheckUpgradeOptions): void {
  if (typeof callback !== 'function') {
    throw new UseUpgradeError(`useUpgrade: 参数 "callback" 必须为函数。`)
  }

  if (options !== undefined && typeof options !== 'object') {
    throw new UseUpgradeError(`useUpgrade: 参数 "options" 必须为对象。`)
  } else if (options === null) {
    throw new UseUpgradeError(`useUpgrade: 参数 "options" 必须为对象。`)
  }

  if (!options) {
    return
  }

  const {
    storageKey,
    basename,
    checkInterval,
    fetchInterval,
    skipMetaName,
    overrideHtmlUrl,
    overrideFetchHTML,
    overrideCalcVersionHash,
  } = options

  if (storageKey !== undefined && (typeof storageKey !== 'string' || storageKey.trim() === '')) {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.storageKey" 必须为非空字符串。`)
  }

  if (basename !== undefined && (typeof basename !== 'string' || basename.trim() === '')) {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.basename" 必须为非空字符串。`)
  }

  if (checkInterval !== undefined && (typeof checkInterval !== 'number' || checkInterval < 0 || isNaN(checkInterval))) {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.checkInterval" 必须为非负数。`)
  }

  if (fetchInterval !== undefined && (typeof fetchInterval !== 'number' || fetchInterval < 0 || isNaN(fetchInterval))) {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.fetchInterval" 必须为非负数。`)
  }

  if (skipMetaName !== undefined && skipMetaName !== null && typeof skipMetaName !== 'string') {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.skipMetaName" 必须为非空字符串，或是 null 表示关闭此功能。`)
  } else if (skipMetaName?.trim() === '') {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.skipMetaName" 必须为非空字符串，或是 null 表示关闭此功能。`)
  }

  if (overrideHtmlUrl !== undefined && typeof overrideHtmlUrl !== 'string' && typeof overrideHtmlUrl !== 'function') {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.overrideHtmlUrl" 必须为非空字符串或返回上述结果的函数。`)
  } else if (typeof overrideHtmlUrl === 'string' && overrideHtmlUrl.trim() === '') {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.overrideHtmlUrl" 必须为非空字符串或返回上述结果的函数。`)
  }

  if (overrideFetchHTML !== undefined && typeof overrideFetchHTML !== 'function') {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.overrideFetchHTML" 必须为函数。`)
  }

  if (overrideCalcVersionHash !== undefined && typeof overrideCalcVersionHash !== 'function') {
    throw new UseUpgradeError(`useUpgrade: 参数 "options.overrideCalcVersionHash" 必须为函数。`)
  }
}
