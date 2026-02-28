import { readFileSync } from 'fs'
import { http, HttpResponse } from 'msw'
import { resolve } from 'path'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { cancelCheckUpgrade } from '../../../src/core/cancelCheckUpgrade'
import { defaultSkipMetaName } from '../../../src/core/constants'
import { startCheckUpgrade } from '../../../src/core/startCheckUpgrade'
import { triggerCheckUpgrade } from '../../../src/core/triggerCheckUpgrade'
import { cleanStorageState, getStorageState } from '../../../src/lib/storageState'
import { server } from '../../server'

function mockSkipMeta(html: string, skipMetaName: string): string {
  const metaName = skipMetaName
  const result = html.replace(`<head>`, `<head><meta name="${metaName}" />`)

  return result
}

const html = readFileSync(resolve(__dirname, '../../../fixture/mock.html')).toString()

describe(`Skip Meta 功能`, () => {
  afterEach(() => {
    cleanStorageState()
    cancelCheckUpgrade()
  })

  test(`检测到 skip meta 时不触发回调`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

    await startCheckUpgrade(callback, { skipMetaName: null })

    tempHtml = mockSkipMeta(tempHtml.replace('main.8a21dc.js', 'main.newversion.js'), defaultSkipMetaName)

    await triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
  })
})
