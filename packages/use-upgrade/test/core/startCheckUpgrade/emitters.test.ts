import { readFileSync } from 'fs'
import { http, HttpResponse } from 'msw'
import { resolve } from 'path'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { cancelCheckUpgrade } from '../../../src/core/cancelCheckUpgrade'
import { startCheckUpgrade } from '../../../src/core/startCheckUpgrade'
import { calcHash } from '../../../src/lib/calcHash'
import { cleanStorageState, setStorageState } from '../../../src/lib/storageState'
import { server } from '../../server'

const html = readFileSync(resolve(__dirname, '../../../fixture/mock.html')).toString()

describe(`触发器功能`, () => {
  afterEach(() => {
    cleanStorageState()
    cancelCheckUpgrade()
  })

  test(`页面从后台切换到前台时自动检查`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

    await startCheckUpgrade(callback, { checkInterval: 0 })

    // 更新 HTML 内容
    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')

    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 200))

    // 不应该触发回调
    expect(callback).toBeCalledTimes(0)
  })
})
