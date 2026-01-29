import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { cancelEventName } from '../../src/core/constants'
import { defaultCheckUpgradeOptions } from '../../src/core/startCheckUpgrade'
import { setupTimerEmitter } from '../../src/lib/emitterTimer'
import { cleanPageState, setPageState } from '../../src/lib/pageState'

describe(`时间间隔触发器 默认 "checkInterval"`, async () => {
  beforeAll(() => void setPageState(defaultCheckUpgradeOptions))
  afterAll(() => void cleanPageState())

  beforeEach(() => void vi.useFakeTimers())
  afterEach(() => void vi.useRealTimers())

  const callback = vi.fn()

  test(`时间间隔`, () => {
    setupTimerEmitter(callback)
    expect(callback).toBeCalledTimes(0)

    vi.advanceTimersByTime(defaultCheckUpgradeOptions.checkInterval)
    expect(callback).toBeCalledTimes(1)

    vi.advanceTimersByTime(defaultCheckUpgradeOptions.checkInterval / 2)
    expect(callback).toBeCalledTimes(1)

    vi.advanceTimersByTime(defaultCheckUpgradeOptions.checkInterval / 2)
    expect(callback).toBeCalledTimes(2)
  })

  test(`卸载触发器`, () => {
    window.dispatchEvent(new Event(cancelEventName))

    vi.advanceTimersByTime(defaultCheckUpgradeOptions.checkInterval)
    expect(callback).toBeCalledTimes(2)

    vi.advanceTimersByTime(defaultCheckUpgradeOptions.checkInterval)
    expect(callback).toBeCalledTimes(2)
  })
})

describe(`时间间隔触发器 自定义 "checkInterval"`, async () => {
  beforeAll(() => void setPageState({ ...defaultCheckUpgradeOptions, checkInterval: 5000 }))
  afterAll(() => void cleanPageState())

  beforeEach(() => void vi.useFakeTimers())
  afterEach(() => void vi.useRealTimers())

  const callback = vi.fn()

  test(`时间间隔`, () => {
    setupTimerEmitter(callback)
    expect(callback).toBeCalledTimes(0)

    vi.advanceTimersByTime(1500)
    expect(callback).toBeCalledTimes(0)

    vi.advanceTimersByTime(3501)
    expect(callback).toBeCalledTimes(1)

    vi.advanceTimersByTime(5001)
    expect(callback).toBeCalledTimes(2)
  })

  test(`卸载触发器`, () => {
    window.dispatchEvent(new Event(cancelEventName))

    vi.advanceTimersByTime(5001)
    expect(callback).toBeCalledTimes(2)

    vi.advanceTimersByTime(5001)
    expect(callback).toBeCalledTimes(2)
  })
})
