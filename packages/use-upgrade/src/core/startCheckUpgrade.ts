import { setupNetworkEmitter } from '../lib/emitterNetwork'
import { setupRouteEmitter } from '../lib/emitterRoute'
import { setupTimerEmitter } from '../lib/emitterTimer'
import { setupVisibilityEmitter } from '../lib/emitterVisibility'
import { fetchVersionHash } from '../lib/fetchVersionHash'
import { cleanPageState, getPageState, setPageState } from '../lib/pageState'
import { setStorageState, getStorageState, cleanStorageState } from '../lib/storageState'
import { verifyParams } from '../lib/verifyParams'
import { cancelCheckUpgrade } from './cancelCheckUpgrade'
import {
  cancelEventName,
  defaultSkipMetaName,
  defaultStorageKey,
  maxFetchTimeout,
  triggerEventName,
  upgradeEventName,
} from './constants'

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
   * 配置此项后，直接覆写会使 `basename`、`disableTimestamp` 配置失效
   */
  overrideHtmlUrl?: string | (() => string) | (() => Promise<string>)

  /**
   * 覆写拉取 index.html 并计算 hash 的回调
   */
  overrideFetchVersionHash?: (fetchURL: string) => Promise<string>
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
export type UseUpgradeCallback = () => void

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

  const global = getPageState()
  // 如果当前页面已注册，则先取消之
  if (global.enable) {
    cancelCheckUpgrade()
  }

  // 初始化标记
  setPageState({ ...options, enable: true, lib: 'use-upgrade@__VERSION__' })
  setStorageState({ lib: 'use-upgrade@__VERSION__' })

  /** 比较本地 hash */
  function checkByLocal(): boolean {
    const { hash } = getPageState()
    const { remoteHash, skipHash } = getStorageState()

    // 无远程记录 / 无本地记录 / 被标记为 skip，均强制返回 false
    if (!remoteHash || !hash || skipHash === remoteHash) {
      return false
    }

    return hash !== remoteHash
  }

  /** 比较本地和远程 hash */
  async function checkByRemoteAndLocal(): Promise<boolean> {
    setStorageState({ pending: true })
    const remoteHash = await fetchVersionHash()
    setStorageState({ pending: false, remoteHash, lastFetchTime: Date.now() })

    return checkByLocal()
  }

  /** 检查网站是否有更新 */
  async function check() {
    const now = Date.now()
    const { lastFetchTime, pending } = getStorageState()

    // 先检查本地变量
    let hasNew = checkByLocal()
    if (
      // 本地检查通过
      !hasNew &&
      // 间隔已小于请求间隔
      fetchInterval > 0 &&
      (lastFetchTime || 0) + fetchInterval < now &&
      // 没有正在进行的请求 或 达到最大超时时间
      (!pending || (lastFetchTime || 0) + maxFetchTimeout < now) &&
      // 网页处在前台
      document.visibilityState !== 'hidden' &&
      // 网络可用
      window.navigator.onLine !== false
    ) {
      hasNew = await checkByRemoteAndLocal()
    }

    // 如果是首次运行，没有本地 hash，则尝试使用最后一次远程 hash
    if (!getPageState().hash) {
      setPageState({ hash: getStorageState().remoteHash })
    }

    if (hasNew) {
      window.dispatchEvent(new Event(upgradeEventName))
      callback()
    }
  }

  // 依据配置项，安装触发器
  if (!disablePageVisibleEmitter) setupVisibilityEmitter(check)
  if (!disablePageReonlineEmitter) setupNetworkEmitter(check)
  if (!disablePageRouteEmitter) setupRouteEmitter(check)
  if (checkInterval > 0) setupTimerEmitter(check)

  // 安装手动触发监听器
  async function globalTrigger(e: CustomEvent<{ isSendRequest: boolean }>) {
    const isFetch = e?.detail?.isSendRequest
    if (isFetch && !getStorageState().pending) {
      await checkByRemoteAndLocal()
    }
    check()
  }
  window.addEventListener<any>(triggerEventName, globalTrigger)

  // 安装取消监听器
  window.addEventListener(
    cancelEventName,
    () => {
      // 取消手动触发监听器
      window.removeEventListener<any>(triggerEventName, globalTrigger)
      // 清理，cleanPageState 必须在最后
      cleanStorageState()
      cleanPageState()
    },
    { once: true }
  )

  // 立刻进行一次检查
  // 初次启动或新 Tab 页，需要立刻加载本地 hash
  await check()
}
