import { describe, expect, test, vi } from 'vitest'

import { cancelEventName } from '../../src/core/constants'
import { setupVisibilityEmitter } from '../../src/lib/emitterVisibility'

describe(`测试 "visibilitychange" 触发器`, async () => {
  const callback = vi.fn()

  test(`未注册触发器前`, () => {
    window.document.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toBeCalledTimes(0)

    window.document.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toBeCalledTimes(0)
  })

  test(`注册触发器并触发`, () => {
    setupVisibilityEmitter(callback)

    window.document.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toBeCalledTimes(1)

    window.document.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toBeCalledTimes(2)
  })

  test(`移除触发器并触发`, () => {
    window.dispatchEvent(new Event(cancelEventName))

    window.document.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toBeCalledTimes(2)

    window.document.dispatchEvent(new Event('visibilitychange'))
    expect(callback).toBeCalledTimes(2)
  })
})
