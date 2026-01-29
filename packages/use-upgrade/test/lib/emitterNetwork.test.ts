import { describe, expect, test, vi } from 'vitest'

import { cancelEventName } from '../../src/core/constants'
import { setupNetworkEmitter } from '../../src/lib/emitterNetwork'

describe(`测试 "online" 触发器`, async () => {
  const callback = vi.fn()

  test(`未注册触发器前`, () => {
    window.dispatchEvent(new Event('online'))
    expect(callback).toBeCalledTimes(0)

    window.dispatchEvent(new Event('online'))
    expect(callback).toBeCalledTimes(0)
  })

  test(`注册触发器并触发`, () => {
    setupNetworkEmitter(callback)

    window.dispatchEvent(new Event('online'))
    expect(callback).toBeCalledTimes(1)

    window.dispatchEvent(new Event('online'))
    expect(callback).toBeCalledTimes(2)
  })

  test(`移除触发器并触发`, () => {
    window.dispatchEvent(new Event(cancelEventName))

    window.dispatchEvent(new Event('online'))
    expect(callback).toBeCalledTimes(2)

    window.dispatchEvent(new Event('online'))
    expect(callback).toBeCalledTimes(2)
  })
})
