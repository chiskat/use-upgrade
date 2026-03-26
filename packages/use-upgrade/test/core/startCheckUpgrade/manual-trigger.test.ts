import { readFileSync } from 'fs'
import { resolve } from 'path'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { cancelCheckUpgrade } from '../../../src/core/cancelCheckUpgrade'
import { startCheckUpgrade } from '../../../src/core/startCheckUpgrade'
import { triggerCheckUpgrade } from '../../../src/core/triggerCheckUpgrade'
import { calcHash } from '../../../src/lib/calcHash'
import { cleanStorageState, setStorageState } from '../../../src/lib/storageState'
import { server } from '../../server'

const html = readFileSync(resolve(__dirname, '../../../fixture/mock.html')).toString()

describe(`手动触发检查`, () => {
  afterEach(() => {
    cleanStorageState()
    cancelCheckUpgrade()
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

    triggerCheckUpgrade()
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
