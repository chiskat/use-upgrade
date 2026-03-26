import { readFileSync } from 'fs'
import { resolve } from 'path'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { cancelCheckUpgrade } from '../../../src/core/cancelCheckUpgrade'
import { startCheckUpgrade } from '../../../src/core/startCheckUpgrade'
import { triggerCheckUpgrade } from '../../../src/core/triggerCheckUpgrade'
import { getPageState } from '../../../src/lib/pageState'
import { cleanStorageState, getStorageState } from '../../../src/lib/storageState'
import { server } from '../../server'

const html = readFileSync(resolve(__dirname, '../../../fixture/mock.html')).toString()

describe(`配置选项`, () => {
  afterEach(() => {
    cleanStorageState()
    cancelCheckUpgrade()
  })

  test(`自定义 storageKey`, async () => {
    const customKey = 'myCustomKey'

    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade({ storageKey: customKey })

    expect(getPageState().storageKey).toBe(customKey)
    expect(localStorage.getItem(customKey)).toBeTruthy()
  })

  test(`自定义 basename`, async () => {
    const handleRequest = vi.fn()

    server.use(
      http.get(`${window.location.origin}/app`, () => {
        handleRequest()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ basename: '/app', disableTimestamp: true, fetchInterval: 0 })

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(handleRequest).toBeCalledTimes(1)
    expect(getPageState().basename).toBe('/app')
  })

  test(`自定义 checkInterval`, async () => {
    const customInterval = 60000

    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade({ checkInterval: customInterval })

    expect(getPageState().checkInterval).toBe(customInterval)
  })

  test(`checkInterval 设为 0 禁用定时检查`, async () => {
    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade({ checkInterval: 0 })

    expect(getPageState().checkInterval).toBe(0)
  })

  test(`自定义 fetchInterval`, async () => {
    const customInterval = 600000

    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade({ fetchInterval: customInterval })

    expect(getPageState().fetchInterval).toBe(customInterval)
  })

  test(`fetchInterval 设为 0 禁用自动拉取`, async () => {
    const callback = vi.fn()
    const serverCb = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        serverCb()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback, { fetchInterval: 0, disableTimestamp: true })

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(serverCb).toBeCalledTimes(1)

    // 等待一段时间，不应该再次拉取
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(serverCb).toBeCalledTimes(1)
  })

  test(`disableTimestamp 选项`, async () => {
    const handleRequest = vi.fn()

    server.use(
      http.get(window.location.origin, ({ request }) => {
        handleRequest()
        const url = new URL(request.url)
        expect(url.searchParams.has('_t')).toBe(false)
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ disableTimestamp: true, fetchInterval: 0 })

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(handleRequest).toBeCalledTimes(1)
  })

  test(`overrideHtmlUrl 字符串`, async () => {
    const handleRequest = vi.fn()
    const customUrl = `${window.location.origin}/custom`

    server.use(
      http.get(customUrl, () => {
        handleRequest()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ overrideHtmlUrl: customUrl, fetchInterval: 0 })

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(handleRequest).toBeCalledTimes(1)
  })

  test(`overrideHtmlUrl 同步函数`, async () => {
    const handleRequest = vi.fn()
    const customUrl = `${window.location.origin}/custom-sync`

    server.use(
      http.get(customUrl, () => {
        handleRequest()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ overrideHtmlUrl: () => customUrl, fetchInterval: 0 })

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(handleRequest).toBeCalledTimes(1)
  })

  test(`overrideHtmlUrl 异步函数`, async () => {
    const handleRequest = vi.fn()
    const customUrl = `${window.location.origin}/custom-async`

    server.use(
      http.get(customUrl, () => {
        handleRequest()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ overrideHtmlUrl: async () => customUrl, fetchInterval: 0 })

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(handleRequest).toBeCalledTimes(1)
  })

  test(`overrideFetchHTML 自定义拉取逻辑`, async () => {
    const callback = vi.fn()
    const handleFetch = vi.fn()

    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade(callback, {
      overrideFetchHTML: async fetchURL => {
        handleFetch()
        const res = await fetch(fetchURL, { cache: 'no-store' })
        return res.text()
      },
    })

    expect(handleFetch).toHaveBeenCalledTimes(1)
    expect(getStorageState().remoteHash).toBeTruthy()
    expect(getPageState().hash).toBeTruthy()
  })

  test(`overrideCalcVersionHash 自定义 hash 计算`, async () => {
    const callback = vi.fn()
    const customHash = 'custom-hash-12345'

    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade(callback, {
      overrideCalcVersionHash: () => customHash,
    })

    expect(getStorageState().remoteHash).toBe(customHash)
    expect(getPageState().hash).toBe(customHash)
  })
})
