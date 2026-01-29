import { calcHash } from './calcHash'
import { checkSkip } from './checkSkip'
import { getPageState } from './pageState'
import { setStorageState } from './storageState'

/** 请求拉取 index.html 提取版本 hash */
export async function fetchVersionHash(): Promise<string | undefined> {
  const { basename, disableTimestamp, overrideHtmlUrl, overrideFetchVersionHash } = getPageState()

  const url =
    typeof overrideHtmlUrl === 'function'
      ? await overrideHtmlUrl()
      : overrideHtmlUrl || window.location.origin + basename

  const timestamp = disableTimestamp || overrideHtmlUrl ? '' : `?_t=${new Date().getTime()}`
  const fetchURL = url + timestamp

  const html =
    typeof overrideFetchVersionHash === 'function'
      ? await overrideFetchVersionHash(fetchURL)
      : await fetch(fetchURL, { cache: 'no-store' })
          .then(res => res.text())
          .catch(() => undefined)

  if (!html) {
    return undefined
  }

  const result = overrideFetchVersionHash ? html : calcHash(html)

  if (checkSkip(html)) {
    setStorageState({ skipHash: result })
  }

  return result
}
