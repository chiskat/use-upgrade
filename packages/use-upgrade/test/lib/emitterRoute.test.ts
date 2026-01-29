import { describe, expect, test, vi } from 'vitest'

import { cancelEventName } from '../../src/core/constants'
import { setupRouteEmitter } from '../../src/lib/emitterRoute'

describe(`测试 History API 触发器`, async () => {
  const callback = vi.fn()

  test(`未注册触发器前`, () => {
    window.history.pushState(undefined, '', '#')
    expect(callback).toBeCalledTimes(0)

    window.history.pushState(undefined, '', '#')
    expect(callback).toBeCalledTimes(0)
  })

  test(`注册触发器并触发`, () => {
    setupRouteEmitter(callback)

    window.history.pushState(undefined, '', '#')
    expect(callback).toBeCalledTimes(1)

    window.history.replaceState(undefined, '', '#')
    expect(callback).toBeCalledTimes(2)

    window.history.pushState(undefined, '', '#')
    expect(callback).toBeCalledTimes(3)

    window.history.replaceState(undefined, '', '#')
    expect(callback).toBeCalledTimes(4)
  })

  test(`移除触发器并触发`, () => {
    window.dispatchEvent(new Event(cancelEventName))

    window.history.pushState(undefined, '', '#')
    expect(callback).toBeCalledTimes(4)

    window.history.replaceState(undefined, '', '#')
    expect(callback).toBeCalledTimes(4)
  })
})
