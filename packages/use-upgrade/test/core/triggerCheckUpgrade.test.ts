import { afterEach, describe, expect, test, vi } from 'vitest'

import { triggerCheckUpgrade } from '../../src'
import { triggerEventName } from '../../src/core/constants'

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

  test(`测试强制请求参数关闭`, async () => {
    window.removeEventListener(triggerEventName, callback)
    window.addEventListener(triggerEventName, callback)
    triggerCheckUpgrade()
    expect(callback).toBeCalledWith(expect.objectContaining({ detail: { isSendRequest: false } }))
  })

  test(`测试强制请求参数开启`, async () => {
    window.removeEventListener(triggerEventName, callback)
    window.addEventListener(triggerEventName, callback)
    triggerCheckUpgrade(true)
    expect(callback).toBeCalledWith(expect.objectContaining({ detail: { isSendRequest: true } }))
  })
})
