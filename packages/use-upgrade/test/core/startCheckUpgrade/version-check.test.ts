import { readFileSync } from 'fs'
import { http, HttpResponse } from 'msw'
import { resolve } from 'path'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { cancelCheckUpgrade } from '../../../src/core/cancelCheckUpgrade'
import { upgradeEventName } from '../../../src/core/constants'
import { startCheckUpgrade } from '../../../src/core/startCheckUpgrade'
import { triggerCheckUpgrade } from '../../../src/core/triggerCheckUpgrade'
import { calcHash } from '../../../src/lib/calcHash'
import { cleanStorageState, setStorageState } from '../../../src/lib/storageState'
import { server } from '../../server'

const html = readFileSync(resolve(__dirname, '../../../fixture/mock.html')).toString()

describe(`版本检测`, () => {
  afterEach(() => {
    cleanStorageState()
    cancelCheckUpgrade()
  })

  test(`检测到新版本时触发回调`, async () => {
    const callback = vi.fn()

    let tempHtml = html
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

    await startCheckUpgrade(callback)
    expect(callback).toBeCalledTimes(0)

    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.c39ae0f.js')

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
  })

  test(`版本未变化时不触发回调`, async () => {
    const callback = vi.fn()

    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade(callback)
    expect(callback).toBeCalledTimes(0)

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(0)
  })

  test(`多个 Tab 页共享版本信息`, async () => {
    const callback = vi.fn()

    server.use(http.get(window.location.origin, () => HttpResponse.html(html)))

    await startCheckUpgrade(callback)

    const newHtml = html.replace('main.8a21dc.js', 'main.newversion.js')
    const newHash = calcHash(newHtml)
    setStorageState({ remoteHash: newHash })

    triggerCheckUpgrade()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(callback).toBeCalledTimes(1)
  })

  test(`检测到新版本时触发 upgradeEvent`, async () => {
    const eventCallback = vi.fn()
    window.addEventListener(upgradeEventName, eventCallback)

    let tempHtml = html
    server.use(http.get(window.location.origin, () => HttpResponse.html(tempHtml)))

    await startCheckUpgrade()

    tempHtml = tempHtml.replace('main.8a21dc.js', 'main.newversion.js')

    triggerCheckUpgrade(true)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(eventCallback).toBeCalledTimes(1)

    window.removeEventListener(upgradeEventName, eventCallback)
  })
})
