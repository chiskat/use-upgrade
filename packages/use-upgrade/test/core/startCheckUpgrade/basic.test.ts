import { readFileSync } from 'fs'
import { http, HttpResponse } from 'msw'
import { resolve } from 'path'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { cancelCheckUpgrade } from '../../../src/core/cancelCheckUpgrade'
import { startCheckUpgrade } from '../../../src/core/startCheckUpgrade'
import { triggerCheckUpgrade } from '../../../src/core/triggerCheckUpgrade'
import { calcHash } from '../../../src/lib/calcHash'
import { cleanPageState, getPageState } from '../../../src/lib/pageState'
import { cleanStorageState, getStorageState } from '../../../src/lib/storageState'
import { server } from '../../server'

const html = readFileSync(resolve(__dirname, '../../../fixture/mock.html')).toString()
const htmlHash = calcHash(html)

describe(`基本功能`, () => {
  afterEach(() => {
    cancelCheckUpgrade()
    cleanStorageState()
    cleanPageState()
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

    await startCheckUpgrade(callback)

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
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

    await startCheckUpgrade(callback1)
    await startCheckUpgrade(callback2)

    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.c39ae0f.js')

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 200))

    expect(callback1).toBeCalledTimes(0)
    expect(callback2).toBeCalledTimes(1)
  })
})

describe(`回调函数重载`, () => {
  afterEach(() => {
    cancelCheckUpgrade()
    cleanStorageState()
    cleanPageState()
  })

  test(`只传入 callback 参数`, async () => {
    const callback = vi.fn()

    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade(callback)

    expect(getPageState().enable).toBe(true)
    expect(callback).toBeCalledTimes(0)
  })

  test(`只传入 options 参数`, async () => {
    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade({ storageKey: 'testKey' })

    expect(getPageState().enable).toBe(true)
    expect(getPageState().storageKey).toBe('testKey')
  })

  test(`不传入任何参数`, async () => {
    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade()

    expect(getPageState().enable).toBe(true)
  })

  test(`传入 callback 和 options 参数`, async () => {
    const callback = vi.fn()

    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade(callback, { storageKey: 'testKey' })

    expect(getPageState().enable).toBe(true)
    expect(getPageState().storageKey).toBe('testKey')
    expect(callback).toBeCalledTimes(0)
  })
})
