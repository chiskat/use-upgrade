import { afterEach, describe, expect, test, vi } from 'vitest'

import { triggerCheckUpgrade } from '../../src'
import { cancelEventName, triggerEventName } from '../../src/core/constants'
import { setupManualEmitter } from '../../src/lib/emitterManual'

describe(`测试手动检测新版本事件`, async () => {
  const callback = vi.fn()

  afterEach(() => void callback.mockReset())

  test(`未注册触发器前`, async () => {
    triggerCheckUpgrade()
    expect(callback).toBeCalledTimes(0)
  })

  test(`注册触发器并触发`, async () => {
    window.addEventListener(triggerEventName, callback)
    triggerCheckUpgrade()
    expect(callback).toBeCalledTimes(1)
  })

  test(`移除触发器并触发`, async () => {
    window.removeEventListener(triggerEventName, callback)
    triggerCheckUpgrade()
    expect(callback).toBeCalledTimes(0)
  })

  test(`测试 fetch 参数默认为 false`, async () => {
    window.removeEventListener(triggerEventName, callback)
    window.addEventListener(triggerEventName, callback)
    triggerCheckUpgrade()
    expect(callback.mock.calls[0][0].detail).toEqual({ fetch: false, duplicate: false })
  })

  test(`测试 fetch 参数为 true（布尔值方式）`, async () => {
    window.removeEventListener(triggerEventName, callback)
    window.addEventListener(triggerEventName, callback)
    triggerCheckUpgrade(true)
    expect(callback.mock.calls[0][0].detail).toEqual({ fetch: true, duplicate: false })
  })

  test(`测试 fetch 参数为 true（对象方式）`, async () => {
    window.removeEventListener(triggerEventName, callback)
    window.addEventListener(triggerEventName, callback)
    triggerCheckUpgrade({ fetch: true })
    expect(callback.mock.calls[0][0].detail).toEqual({ fetch: true, duplicate: false })
  })

  test(`测试 duplicate 参数`, async () => {
    window.removeEventListener(triggerEventName, callback)
    window.addEventListener(triggerEventName, callback)
    triggerCheckUpgrade({ duplicate: true })
    expect(callback).toBeCalledWith(expect.objectContaining({ detail: { fetch: false, duplicate: true } }))
  })

  test(`测试同时设置 fetch 和 duplicate 参数`, async () => {
    window.removeEventListener(triggerEventName, callback)
    window.addEventListener(triggerEventName, callback)
    triggerCheckUpgrade({ fetch: true, duplicate: true })
    expect(callback).toBeCalledWith(expect.objectContaining({ detail: { fetch: true, duplicate: true } }))
  })
})

describe(`测试 triggerCheckUpgrade 与 setupManualEmitter 集成`, () => {
  const callback = vi.fn()

  afterEach(() => void callback.mockReset())

  test(`注册手动触发器后触发`, () => {
    setupManualEmitter(callback)
    triggerCheckUpgrade()
    expect(callback).toBeCalledTimes(1)
    expect(callback).toBeCalledWith({ fetch: false, duplicate: false })
  })

  test(`传递 fetch: true（布尔值方式）`, () => {
    triggerCheckUpgrade(true)
    expect(callback).toBeCalledTimes(1)
    expect(callback).toBeCalledWith({ fetch: true, duplicate: false })
  })

  test(`传递 fetch: true（对象方式）`, () => {
    triggerCheckUpgrade({ fetch: true })
    expect(callback).toBeCalledTimes(1)
    expect(callback).toBeCalledWith({ fetch: true, duplicate: false })
  })

  test(`传递 duplicate: true`, () => {
    triggerCheckUpgrade({ duplicate: true })
    expect(callback).toBeCalledTimes(1)
    expect(callback).toBeCalledWith({ fetch: false, duplicate: true })
  })

  test(`取消后不再触发`, () => {
    window.dispatchEvent(new Event(cancelEventName))
    triggerCheckUpgrade()
    expect(callback).toBeCalledTimes(0)
  })
})
