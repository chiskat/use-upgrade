import { readFileSync } from 'fs'
import { http, HttpResponse } from 'msw'
import { resolve } from 'path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { defaultSkipMetaName, upgradeEventName } from '../../src/core/constants'
import { startCheckUpgrade } from '../../src/core/startCheckUpgrade'
import { triggerCheckUpgrade } from '../../src/core/triggerCheckUpgrade'
import { calcHash } from '../../src/lib/calcHash'
import { cleanPageState, getPageState } from '../../src/lib/pageState'
import { cleanStorageState, getStorageState, setStorageState } from '../../src/lib/storageState'
import { server } from '../server'

function mockSkipMeta(html: string, skipMetaName: string): string {
  const metaName = skipMetaName
  const result = html.replace(`<head>`, `<head><meta name="${metaName}" />`)

  return result
}

const html = readFileSync(resolve(__dirname, '../../fixture/mock.html')).toString()
const htmlHash = calcHash(html)

describe(`基本功能`, () => {
  beforeEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  afterEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  test(`初次启动`, async () => {
    const callback = vi.fn()
    const serverCb = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        serverCb()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback, { disableTimestamp: true })

    expect(serverCb).toBeCalledTimes(1)
    expect(callback).toBeCalledTimes(0)
    expect(getPageState().enable).toBe(true)
    expect(getPageState().hash).toBe(htmlHash)
    expect(getStorageState().remoteHash).toBe(htmlHash)
  })

  test(`重复启动会先取消之前的实例`, async () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback1)
    await startCheckUpgrade(callback2)

    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.c39ae0f.js')

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 200))

    expect(callback1).toBeCalledTimes(0)
    expect(callback2).toBeCalledTimes(1)
  })
})

describe(`版本检测`, () => {
  beforeEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  afterEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  test(`检测到新版本时触发回调`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback)
    expect(callback).toBeCalledTimes(0)

    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.c39ae0f.js')

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
  })

  test(`版本未变化时不触发回调`, async () => {
    const callback = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback)
    expect(callback).toBeCalledTimes(0)

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(0)
  })

  test(`多个 Tab 页共享版本信息`, async () => {
    const callback = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback)

    // 模拟另一个 Tab 页更新了 localStorage
    const newHtml = html.replace('main.8a21dc.js', 'main.newversion.js')
    const newHash = calcHash(newHtml)
    setStorageState({ remoteHash: newHash })

    // 本地检查应该检测到新版本
    await triggerCheckUpgrade()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
  })

  test(`检测到新版本时触发 upgradeEvent`, async () => {
    const eventCallback = vi.fn()
    window.addEventListener(upgradeEventName, eventCallback)

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade()

    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(eventCallback).toBeCalledTimes(1)

    window.removeEventListener(upgradeEventName, eventCallback)
  })
})

describe(`配置选项`, () => {
  beforeEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  afterEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  test(`自定义 storageKey`, async () => {
    const customKey = 'myCustomKey'

    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

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

    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ checkInterval: customInterval })

    expect(getPageState().checkInterval).toBe(customInterval)
  })

  test(`checkInterval 设为 0 禁用定时检查`, async () => {
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ checkInterval: 0 })

    expect(getPageState().checkInterval).toBe(0)
  })

  test(`自定义 fetchInterval`, async () => {
    const customInterval = 600000

    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

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

  test(`overrideFetchVersionHash 自定义拉取逻辑`, async () => {
    const callback = vi.fn()
    const customHash = 'custom-hash-12345'

    // 设置 server mock 返回 HTML，但 overrideFetchVersionHash 会覆盖它
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback, {
      overrideFetchVersionHash: async () => customHash,
    })

    expect(getStorageState().remoteHash).toBe(customHash)
    expect(getPageState().hash).toBe(customHash)
  })
})

describe(`Skip Meta 功能`, () => {
  beforeEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  afterEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  test(`检测到 skip meta 时不触发回调`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback)
    expect(callback).toBeCalledTimes(0)

    // 更新 HTML 并添加 skip meta
    tempHtml = mockSkipMeta(tempHtml.replace('main.8a21dc.js', 'main.newversion.js'), defaultSkipMetaName)

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(0)
    expect(getStorageState().skipHash).toBeTruthy()
  })

  test(`skip meta 被移除后可以触发回调`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback)

    // 第一次更新：带 skip meta
    tempHtml = mockSkipMeta(tempHtml.replace('main.8a21dc.js', 'main.v1.js'), defaultSkipMetaName)

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(callback).toBeCalledTimes(0)

    // 第二次更新：移除 skip meta
    tempHtml = html.replace('main.8a21dc.js', 'main.v2.js')

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(callback).toBeCalledTimes(1)
  })

  test(`自定义 skipMetaName`, async () => {
    const callback = vi.fn()
    const customSkipName = 'myCustomSkip'

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { skipMetaName: customSkipName })

    tempHtml = mockSkipMeta(tempHtml.replace('main.8a21dc.js', 'main.newversion.js'), customSkipName)

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(0)
    expect(getStorageState().skipHash).toBeTruthy()
  })

  test(`skipMetaName 设为 null 禁用 skip 功能`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { skipMetaName: null })

    tempHtml = mockSkipMeta(tempHtml.replace('main.8a21dc.js', 'main.newversion.js'), defaultSkipMetaName)

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
  })
})

describe(`手动触发检查`, () => {
  beforeEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  afterEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  test(`triggerCheckUpgrade() 仅本地检查`, async () => {
    const callback = vi.fn()
    const serverCb = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        serverCb()
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback, { disableTimestamp: true, fetchInterval: 0 })

    // 手动触发拉取以初始化
    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(serverCb).toBeCalledTimes(1)

    // 手动更新 storage 模拟其他 Tab 页的更新
    const newHash = calcHash(html.replace('main.8a21dc.js', 'main.newversion.js'))
    setStorageState({ remoteHash: newHash })

    await triggerCheckUpgrade()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
    expect(serverCb).toBeCalledTimes(1) // 不应该再次请求
  })

  test(`triggerCheckUpgrade(true) 强制拉取 HTML`, async () => {
    const callback = vi.fn()
    const serverCb = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        serverCb()
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { disableTimestamp: true, fetchInterval: 0 })

    // 手动触发拉取以初始化
    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(serverCb).toBeCalledTimes(1)

    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
    expect(serverCb).toBeCalledTimes(2) // 应该再次请求
  })
})

describe(`边界情况和错误处理`, () => {
  beforeEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  afterEach(() => {
    cleanPageState()
    cleanStorageState()
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
    await triggerCheckUpgrade()
    expect(serverCb).toBeCalledTimes(1)

    // 超过间隔时间后触发，应该请求
    await new Promise(resolve => setTimeout(resolve, 150))
    await triggerCheckUpgrade()
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(serverCb).toBeCalledTimes(2)
  })

  test(`pending 状态防止并发请求`, async () => {
    const serverCb = vi.fn()

    server.use(
      http.get(window.location.origin, async () => {
        serverCb()
        await new Promise(resolve => setTimeout(resolve, 200))
        return HttpResponse.html(html)
      })
    )

    const promise = startCheckUpgrade({ fetchInterval: 50 })

    // 等待第一次请求开始
    await new Promise(resolve => setTimeout(resolve, 10))

    // 在请求进行中时再次触发，不应该发起新请求
    await triggerCheckUpgrade()

    await promise
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(serverCb).toBeCalledTimes(1)
  })

  test(`无本地 hash 时使用远程 hash 初始化`, async () => {
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade()

    expect(getPageState().hash).toBe(htmlHash)
    expect(getStorageState().remoteHash).toBe(htmlHash)
  })
})

describe(`触发器功能`, () => {
  beforeEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  afterEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  test(`页面从后台切换到前台时自动检查`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { fetchInterval: 100 })

    // 更新 HTML 内容
    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')
    const newHash = calcHash(tempHtml)

    // 手动更新 storage 模拟其他 Tab 页的更新
    setStorageState({ remoteHash: newHash })

    // 模拟页面从后台切换到前台
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'visible',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
  })

  test(`disablePageVisibleEmitter 禁用页面可见性触发器`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { disablePageVisibleEmitter: true })

    // 更新 HTML 内容
    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')

    // 模拟页面从后台切换到前台
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'visible',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    await new Promise(resolve => setTimeout(resolve, 100))

    // 不应该触发回调
    expect(callback).toBeCalledTimes(0)
  })

  test(`网络从离线切换到在线时自动检查`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { fetchInterval: 100 })

    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 50))

    // 更新 HTML 内容
    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')
    const newHash = calcHash(tempHtml)

    // 手动更新 storage 模拟其他 Tab 页的更新
    setStorageState({ remoteHash: newHash })

    // 模拟网络从离线切换到在线
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })
    window.dispatchEvent(new Event('online'))

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
  })

  test(`disablePageReonlineEmitter 禁用网络在线触发器`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { disablePageReonlineEmitter: true })

    // 更新 HTML 内容
    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')

    // 模拟网络从离线切换到在线
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })
    window.dispatchEvent(new Event('online'))

    await new Promise(resolve => setTimeout(resolve, 100))

    // 不应该触发回调
    expect(callback).toBeCalledTimes(0)
  })

  test(`路由导航时自动检查`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { fetchInterval: 100 })

    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 50))

    // 更新 HTML 内容
    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')
    const newHash = calcHash(tempHtml)

    // 手动更新 storage 模拟其他 Tab 页的更新
    setStorageState({ remoteHash: newHash })

    // 模拟路由导航
    window.history.pushState({}, '', '/test')

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
  })

  test(`disablePageRouteEmitter 禁用路由导航触发器`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { disablePageRouteEmitter: true })

    // 更新 HTML 内容
    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')

    // 模拟路由导航
    window.history.pushState({}, '', '/test')

    await new Promise(resolve => setTimeout(resolve, 100))

    // 不应该触发回调
    expect(callback).toBeCalledTimes(0)
  })

  test(`定时器自动检查`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { checkInterval: 100, fetchInterval: 50 })

    // 更新 HTML 内容
    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')
    const newHash = calcHash(tempHtml)

    // 手动更新 storage 模拟其他 Tab 页的更新
    setStorageState({ remoteHash: newHash })

    // 等待定时器触发
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(callback).toBeCalledTimes(1)
  })

  test(`checkInterval 设为 0 禁用定时器`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(tempHtml)
      })
    )

    await startCheckUpgrade(callback, { checkInterval: 0 })

    // 更新 HTML 内容
    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')

    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 200))

    // 不应该触发回调
    expect(callback).toBeCalledTimes(0)
  })
})

describe(`回调函数重载`, () => {
  beforeEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  afterEach(() => {
    cleanPageState()
    cleanStorageState()
  })

  test(`只传入 callback 参数`, async () => {
    const callback = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback)

    expect(getPageState().enable).toBe(true)
    expect(callback).toBeCalledTimes(0)
  })

  test(`只传入 options 参数`, async () => {
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade({ storageKey: 'testKey' })

    expect(getPageState().enable).toBe(true)
    expect(getPageState().storageKey).toBe('testKey')
  })

  test(`不传入任何参数`, async () => {
    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade()

    expect(getPageState().enable).toBe(true)
  })

  test(`传入 callback 和 options 参数`, async () => {
    const callback = vi.fn()

    server.use(
      http.get(window.location.origin, () => {
        return HttpResponse.html(html)
      })
    )

    await startCheckUpgrade(callback, { storageKey: 'testKey' })

    expect(getPageState().enable).toBe(true)
    expect(getPageState().storageKey).toBe('testKey')
    expect(callback).toBeCalledTimes(0)
  })
})
