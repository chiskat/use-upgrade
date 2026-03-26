import { debounce } from 'lodash-es'

import { cancelCheckUpgrade } from './cancelCheckUpgrade'
import { cancelEventName, defaultSkipMetaName, defaultStorageKey, upgradeEventName } from './constants'
import { TriggerCheckUpgradeOptions } from './triggerCheckUpgrade'
import { setupManualEmitter } from '../lib/emitterManual'
import { setupNetworkEmitter } from '../lib/emitterNetwork'
import { setupRouteEmitter } from '../lib/emitterRoute'
import { setupTimerEmitter } from '../lib/emitterTimer'
import { setupVisibilityEmitter } from '../lib/emitterVisibility'
import { fetchVersionHash } from '../lib/fetchVersionHash'
import { localCheck } from '../lib/localCheck'
import { cleanPageState, getPageState, setPageState } from '../lib/pageState'
import { getStorageState, setStorageState } from '../lib/storageState'
import { verifyParams } from '../lib/verifyParams'

/** 网站新版本检测 `triggerCheckUpgrade()` 的配置项 */
export interface CheckUpgradeOptions {
  /**
   * 本地存储使用的 KEY 键名
   *
   * 默认 `"useUpgrade"`
   */
  storageKey?: string

  /**
   * 如果网站或 CDN 部署在子目录（subpath）上，传入此参数表示子目录
   *
   * 默认 `"/"`
   */
  basename?: string

  /**
   * 本地新版本检查的间隔时间（毫秒）
   *
   * 提供 `0` 可以关闭本地新版本检查
   *
   * 默认 `30,000` （30 秒）
   */
  checkInterval?: number

  /**
   * 请求 index.html 的间隔时间（毫秒）
   *
   * 提供 `0` 可以关闭自动请求 index.html
   *
   * 默认 `300,000` （5 分钟）
   */
  fetchInterval?: number

  /**
   * 每次解析 index.html 时会尝试寻找带有此 name 属性的 `<meta>` 标签，以此来判断是否跳过本次版本更新
   *
   * 提供 `null` 则会禁用跳过版本更新的逻辑
   *
   * 默认 `"useUpgradeSkip"`
   */
  skipMetaName?: string | null

  /** 是否禁用在请求 index.html 时加上时间戳（默认 `false`） */
  disableTimestamp?: boolean

  /** 是否禁用网站切换到前台时自动检查（默认 `false`） */
  disablePageVisibleEmitter?: boolean

  /** 是否禁用网站从离线切换到在线时自动检查（默认 `false`） */
  disablePageReonlineEmitter?: boolean

  /** 是否禁用网站路由导航时自动检查（默认 `false`） */
  disablePageRouteEmitter?: boolean

  /**
   * 覆写请求 index.html 的 URL
   *
   * 默认 `window.location.origin + basename`
   *
   * 配置此项后会使 `basename`、`disableTimestamp` 配置失效
   */
  overrideHtmlUrl?: string | (() => string) | (() => Promise<string>)

  /**
   * 覆写拉取 HTML 的回调，返回 HTML 全文
   *
   * @param fetchURL 原本将要请求的 URL
   */
  overrideFetchHTML?: (fetchURL: string) => Promise<string>

  /**
   * 覆写计算版本 hash 的回调
   *
   * @param html HTML 全文
   */
  overrideCalcVersionHash?: (html: string) => Promise<string> | string
}

export const defaultCheckUpgradeOptions = {
  storageKey: defaultStorageKey,
  basename: '/',
  checkInterval: 0.5 * 60 * 1000,
  fetchInterval: 5 * 60 * 1000,
  skipMetaName: defaultSkipMetaName,
  disableTimestamp: false,
  disablePageVisibleEmitter: false,
  disablePageReonlineEmitter: false,
  disablePageRouteEmitter: false,
} as const satisfies CheckUpgradeOptions

const noop = () => {}

/** 检测到新版本时触发回调 */
export type UseUpgradeCallback = (useUpgradeDetail: {
  /** 原本的版本 hash */
  currentVersionHash: string

  /** 检测到的新版本的 hash */
  newVersionHash: string

  /** 当前页面是否可见 */
  visible: boolean
}) => void

/**
 * 开启网站的新版本检测
 * @param callback 有新版本时的回调
 * @param options 配置项（可选）
 */
export async function startCheckUpgrade(callback: UseUpgradeCallback, options?: CheckUpgradeOptions): Promise<void>

/**
 * 开启网站的新版本检测
 * @param options 配置项（可选）
 */
export async function startCheckUpgrade(options?: CheckUpgradeOptions): Promise<void>

/** 开启网站的新版本检测 */
export async function startCheckUpgrade(): Promise<void>

export async function startCheckUpgrade(
  callbackOrOptions?: CheckUpgradeOptions | UseUpgradeCallback,
  mustBeOptions?: CheckUpgradeOptions
): Promise<void> {
  // 处理重载
  const callback = typeof callbackOrOptions === 'function' ? callbackOrOptions : noop
  const inputOptions = typeof callbackOrOptions === 'object' ? callbackOrOptions : mustBeOptions

  // 验证参数输入
  verifyParams(callback, inputOptions)

  // 合并默认参数
  const options = { ...defaultCheckUpgradeOptions, ...inputOptions } as Required<CheckUpgradeOptions>
  const {
    checkInterval,
    fetchInterval,
    disablePageVisibleEmitter,
    disablePageReonlineEmitter,
    disablePageRouteEmitter,
  } = options

  // 如果当前页面已注册，则先取消之
  if (getPageState().enable) {
    cancelCheckUpgrade()
  }

  // 初始化状态
  setPageState({ storageKey: options.storageKey })
  setStorageState({ lib: 'use-upgrade@__VERSION__' })
  setPageState({ ...options, enable: true, lib: 'use-upgrade@__VERSION__', hash: getStorageState().remoteHash })

  /** 比较本地和远程 hash */
  async function checkByRemoteAndLocal(): Promise<boolean> {
    const remoteHash = await fetchVersionHash()

    // 初次启动，拉取到远程 hash 后立刻设置本地 hash
    if (remoteHash && !getPageState().hash) {
      setPageState({ hash: remoteHash })
    }

    return localCheck()
  }

  /** 检查网站是否有更新 */
  async function check(options?: TriggerCheckUpgradeOptions) {
    const now = Date.now()
    const { lastFetchTime, pending } = getStorageState()

    // 先检查本地变量
    let hasNew = localCheck()

    // 满足特定条件，则触发请求拉取 HTML
    const shouldFetch =
      options?.fetch ||
      // 本地检查通过
      (!hasNew &&
        // 间隔已小于请求间隔
        fetchInterval > 0 &&
        (lastFetchTime || 0) + fetchInterval < now &&
        // 没有正在进行的请求 或 达到最大超时时间
        (!pending || (lastFetchTime || 0) + fetchInterval * 2 < now) &&
        // 网页处在前台
        document.visibilityState !== 'hidden' &&
        // 网络可用
        window.navigator.onLine !== false)

    if (shouldFetch) {
      hasNew = await checkByRemoteAndLocal()
    }

    // 有新版本，触发回调
    const shouldCallback = hasNew && (options?.duplicate || getPageState().triggered !== getStorageState().remoteHash)

    if (shouldCallback) {
      // 把此版本 hash 标记为已触发
      setPageState({ triggered: getStorageState().remoteHash })
      // 用于通知 React、Vue 的 Hooks
      window.dispatchEvent(new Event(upgradeEventName))

      callback({
        currentVersionHash: getPageState().hash!,
        newVersionHash: getStorageState().remoteHash!,
        visible: document.visibilityState === 'visible',
      })
    }
  }

  // 为自动触发器创建防抖版 check，避免短时间内多个触发器并发调用
  const debouncedCheck = debounce(check, 100, { maxWait: 500 })

  // 依据配置项，安装触发器（自动触发器使用防抖版）
  if (!disablePageVisibleEmitter) setupVisibilityEmitter(debouncedCheck)
  if (!disablePageReonlineEmitter) setupNetworkEmitter(debouncedCheck)
  if (!disablePageRouteEmitter) setupRouteEmitter(debouncedCheck)
  if (checkInterval > 0) setupTimerEmitter(debouncedCheck)
  // 手动触发器保持直接调用，确保用户操作即时响应
  setupManualEmitter(check)

  // 安装取消监听器
  window.addEventListener(
    cancelEventName,
    () => {
      debouncedCheck.cancel()
      cleanPageState()
    },
    { once: true }
  )

  // 立刻进行一次检查
  // 初次启动或新 Tab 页，需要立刻加载本地 hash
  await check()
}
