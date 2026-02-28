import { calcHash } from './calcHash'
import { checkSkip } from './checkSkip'
import { getPageState } from './pageState'
import { setStorageState } from './storageState'

/** 请求拉取 index.html 提取版本 hash */
export async function fetchVersionHash(): Promise<string | undefined> {
  setStorageState({ pending: true })
  const { basename, disableTimestamp, overrideHtmlUrl, overrideFetchVersionHash } = getPageState()

  const url =
    typeof overrideHtmlUrl === 'function'
      ? await overrideHtmlUrl()
      : overrideHtmlUrl || window.location.origin + basename

  const timestamp = disableTimestamp || overrideHtmlUrl ? '' : `?_t=${new Date().getTime()}`
  const fetchURL = url + timestamp

  const html =
    typeof overrideFetchVersionHash === 'function'
      ? await overrideFetchVersionHash(fetchURL).catch(() => undefined)
      : await fetch(fetchURL, { cache: 'no-store' })
          .then(res => res.text())
          .catch(() => undefined)

  if (!html) {
    setStorageState({ pending: false })

    return undefined
  }

  const result = overrideFetchVersionHash ? html : calcHash(html)

  setStorageState({
    pending: false,
    remoteHash: result,
    lastFetchTime: Date.now(),
    skipHash: checkSkip(html) ? result : '',
  })

  return result
}
