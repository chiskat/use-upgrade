import { readFileSync } from 'fs'
import { resolve } from 'path'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { defaultCheckUpgradeOptions } from '../../src/core/startCheckUpgrade'
import { calcHash } from '../../src/lib/calcHash'
import { fetchVersionHash } from '../../src/lib/fetchVersionHash'
import { cleanPageState, setPageState } from '../../src/lib/pageState'
import { getStorageState } from '../../src/lib/storageState'
import { server } from '../server'

const html = readFileSync(resolve(__dirname, '../../fixture/mock.html')).toString()

describe(`测试 URL 相关参数`, async () => {
  afterEach(() => void cleanPageState())

  test(`默认开启时间戳`, async () => {
    setPageState(defaultCheckUpgradeOptions)
    const handleRequest = vi.fn()
    server.use(
      http.get(window.location.origin, ({ request }) => {
        handleRequest()
        expect(request.url).toMatch(new RegExp(`${window.location.origin}/\\?_t=\\d+$`))
        return HttpResponse.html(html)
      })
    )
    await fetchVersionHash()
    expect(handleRequest).toHaveBeenCalledTimes(1)
  })

  test(`禁用时间戳`, async () => {
    setPageState({ ...defaultCheckUpgradeOptions, disableTimestamp: true })
    const handleRequest = vi.fn()
    server.use(
      http.get(window.location.origin, ({ request }) => {
        handleRequest()
        const url = new URL(request.url)
        expect(url.searchParams.entries()).toHaveLength(0)
        return HttpResponse.html(html)
      })
    )
    await fetchVersionHash()
    expect(handleRequest).toHaveBeenCalledTimes(1)
  })

  test(`测试 "basename"`, async () => {
    setPageState({ ...defaultCheckUpgradeOptions, basename: '/basename', disableTimestamp: true })
    const handleRequest = vi.fn()
    const shouldNotBeCalled = vi.fn()
    server.use(
      http.get(window.location.origin, () => {
        shouldNotBeCalled()
        return HttpResponse.html(html)
      })
    )
    server.use(
      http.get(`${window.location.origin}/basename`, ({ request }) => {
        handleRequest()
        const url = new URL(request.url)
        expect(url.pathname).toBe('/basename')
        return HttpResponse.html(html)
      })
    )
    await fetchVersionHash()
    expect(handleRequest).toHaveBeenCalledTimes(1)
    expect(shouldNotBeCalled).toHaveBeenCalledTimes(0)
  })

  test(`通过 "overrideHtmlUrl" 值定制 URL`, async () => {
    setPageState({ ...defaultCheckUpgradeOptions, overrideHtmlUrl: 'http://localhost:3000/override' })
    const handleRequest = vi.fn()
    const shouldNotBeCalled = vi.fn()
    server.use(
      http.get(window.location.origin, () => {
        shouldNotBeCalled()
        return HttpResponse.html(html)
      })
    )
    server.use(
      http.get(`${window.location.origin}/override`, ({ request }) => {
        handleRequest()
        const url = new URL(request.url)
        expect(url.pathname).toBe('/override')
        return HttpResponse.html(html)
      })
    )
    await fetchVersionHash()
    expect(handleRequest).toHaveBeenCalledTimes(1)
    expect(shouldNotBeCalled).toHaveBeenCalledTimes(0)
  })

  test(`通过 "overrideHtmlUrl" 函数定制 URL`, async () => {
    const handleOverrodeHtmlUrl = vi.fn()
    const handleRequest = vi.fn()
    setPageState({
      ...defaultCheckUpgradeOptions,
      overrideHtmlUrl: () => {
        handleOverrodeHtmlUrl()
        return `${window.location.origin}/override2`
      },
    })
    server.use(
      http.get(`${window.location.origin}/override2`, ({ request }) => {
        handleRequest()
        const url = new URL(request.url)
        expect(url.pathname).toBe('/override2')
        return HttpResponse.html(html)
      })
    )
    await fetchVersionHash()
    expect(handleOverrodeHtmlUrl).toHaveBeenCalledTimes(1)
    expect(handleRequest).toHaveBeenCalledTimes(1)
  })

  test(`"overrideHtmlUrl" 函数抛出异常时应释放 pending 锁并返回 undefined`, async () => {
    setPageState({
      ...defaultCheckUpgradeOptions,
      overrideHtmlUrl: () => {
        throw new Error('overrideHtmlUrl error')
      },
    })
    const result = await fetchVersionHash()
    expect(result).toBeUndefined()
    expect(getStorageState().pending).toBe(false)
  })

  test(`"overrideHtmlUrl" 异步函数 reject 时应释放 pending 锁并返回 undefined`, async () => {
    setPageState({
      ...defaultCheckUpgradeOptions,
      overrideHtmlUrl: async () => {
        throw new Error('async overrideHtmlUrl error')
      },
    })
    const result = await fetchVersionHash()
    expect(result).toBeUndefined()
    expect(getStorageState().pending).toBe(false)
  })
})

describe(`测试远程版本拉取`, async () => {
  afterEach(() => void cleanPageState())

  test(`拉取 HTML 并计算 hash`, async () => {
    const handleRequest = vi.fn()
    setPageState(defaultCheckUpgradeOptions)
    server.use(
      http.get(window.location.origin, () => {
        handleRequest()
        return HttpResponse.html(html)
      })
    )
    const hash = await fetchVersionHash()
    expect(hash).toBe(calcHash(html))
    expect(hash).toBeTruthy()
    expect(handleRequest).toHaveBeenCalledTimes(1)
  })

  test(`使用 "overrideFetchHTML" 覆写拉取 HTML`, async () => {
    const handleOverrideFetchHTML = vi.fn()
    setPageState({
      ...defaultCheckUpgradeOptions,
      disableTimestamp: true,
      overrideFetchHTML(fetchURL) {
        handleOverrideFetchHTML()
        expect(fetchURL).toBe(window.location.origin + defaultCheckUpgradeOptions.basename)
        return Promise.resolve(html)
      },
    })
    const hash = await fetchVersionHash()
    expect(hash).toBe(calcHash(html))
    expect(handleOverrideFetchHTML).toHaveBeenCalledTimes(1)
  })

  test(`使用 "overrideCalcVersionHash" 覆写计算 hash`, async () => {
    setPageState(defaultCheckUpgradeOptions)
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )
    const hash = await fetchVersionHash()
    // 默认使用 calcHash
    expect(hash).toBe(calcHash(html))
  })

  test(`同时使用 "overrideFetchHTML" 和 "overrideCalcVersionHash"`, async () => {
    const customHash = 'custom-hash-12345'
    setPageState({
      ...defaultCheckUpgradeOptions,
      disableTimestamp: true,
      overrideFetchHTML: async fetchURL => {
        const res = await fetch(fetchURL, { cache: 'no-store' })
        return res.text()
      },
      overrideCalcVersionHash: () => customHash,
    })
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )
    const hash = await fetchVersionHash()
    expect(hash).toBe(customHash)
  })
})
