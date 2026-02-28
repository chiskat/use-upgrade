import { readFileSync } from 'fs'
import { http, HttpResponse } from 'msw'
import { resolve } from 'path'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { cancelCheckUpgrade } from '../../../src/core/cancelCheckUpgrade'
import { startCheckUpgrade } from '../../../src/core/startCheckUpgrade'
import { triggerCheckUpgrade } from '../../../src/core/triggerCheckUpgrade'
import { calcHash } from '../../../src/lib/calcHash'
import { cleanPageState, getPageState } from '../../../src/lib/pageState'
import { cleanStorageState, getStorageState, setStorageState } from '../../../src/lib/storageState'
import { server } from '../../server'

const html = readFileSync(resolve(__dirname, '../../../fixture/mock.html')).toString()
const htmlHash = calcHash(html)

describe(`边界情况和错误处理`, () => {
  afterEach(() => {
    cancelCheckUpgrade()
    cleanStorageState()
    cleanPageState()
  })

  test(`网络请求失败时不触发回调`, async () => {
    const callback = vi.fn()

    let shouldError = false
    server.use(
      http.get(window.location.origin, () => {
        if (shouldError) {
          return HttpResponse.error()
        }
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback)

    // 模拟网络错误
    shouldError = true

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(0)
  })

  test(`页面在后台时不自动拉取 HTML`, async () => {
    const callback = vi.fn()
    const serverCb = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        serverCb()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback, { fetchInterval: 100 })
    expect(serverCb).toBeCalledTimes(1)

    // 模拟页面切换到后台
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // 不应该再次请求
    expect(serverCb).toBeCalledTimes(1)

    // 恢复
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'visible',
    })
  })

  test(`网络离线时不自动拉取 HTML`, async () => {
    const callback = vi.fn()
    const serverCb = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        serverCb()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback, { fetchInterval: 100 })
    expect(serverCb).toBeCalledTimes(1)

    // 模拟网络离线
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    await new Promise(resolve => setTimeout(resolve, 200))

    // 不应该再次请求
    expect(serverCb).toBeCalledTimes(1)

    // 恢复
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })
  })

  test(`fetchInterval 控制请求频率`, async () => {
    const serverCb = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        serverCb()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ fetchInterval: 200 })

    // 等待初始化完成
    expect(serverCb).toBeCalledTimes(1)

    // 在间隔时间内触发，不应该请求
    await new Promise(resolve => setTimeout(resolve, 100))
    triggerCheckUpgrade()
    expect(serverCb).toBeCalledTimes(1)

    // 超过间隔时间后触发，应该请求
    await new Promise(resolve => setTimeout(resolve, 150))
    triggerCheckUpgrade()
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(serverCb).toBeCalledTimes(2)
  })

  test(`pending 状态防止并发请求`, async () => {
    const serverCb = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        serverCb()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ fetchInterval: 50 })
    expect(serverCb).toBeCalledTimes(1)

    await new Promise(resolve => setTimeout(resolve, 60))

    setStorageState({ pending: true })

    triggerCheckUpgrade()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(serverCb).toBeCalledTimes(1)
  })

  test(`无本地 hash 时使用远程 hash 初始化`, async () => {
    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade()

    expect(getPageState().hash).toBe(htmlHash)
    expect(getStorageState().remoteHash).toBe(htmlHash)
  })
})
