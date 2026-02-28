import { describe, expect, test, vi } from 'vitest'

import { cancelEventName, triggerEventName } from '../../src/core/constants'
import { TriggerCheckUpgradeOptions } from '../../src/core/triggerCheckUpgrade'
import { setupManualEmitter } from '../../src/lib/emitterManual'

describe(`测试手动触发器 "triggerEventName"`, async () => {
  const callback = vi.fn()

  test(`未注册触发器前`, () => {
    window.dispatchEvent(new CustomEvent(triggerEventName))
    expect(callback).toBeCalledTimes(0)

    window.dispatchEvent(new CustomEvent(triggerEventName))
    expect(callback).toBeCalledTimes(0)
  })

  test(`注册触发器并触发`, () => {
    setupManualEmitter(callback)

    window.dispatchEvent(new CustomEvent(triggerEventName))
    expect(callback).toBeCalledTimes(1)

    window.dispatchEvent(new CustomEvent(triggerEventName))
    expect(callback).toBeCalledTimes(2)
  })

  test(`触发时传递参数`, () => {
    const options: TriggerCheckUpgradeOptions = { fetch: true, duplicate: true }

    window.dispatchEvent(new CustomEvent(triggerEventName, { detail: options }))
    expect(callback).toBeCalledTimes(3)
    expect(callback).toHaveBeenLastCalledWith(options)
  })

  test(`触发时传递部分参数`, () => {
    const options: TriggerCheckUpgradeOptions = { fetch: true }

    window.dispatchEvent(new CustomEvent(triggerEventName, { detail: options }))
    expect(callback).toBeCalledTimes(4)
    expect(callback).toHaveBeenLastCalledWith(options)
  })

  test(`触发时不传递参数`, () => {
    window.dispatchEvent(new CustomEvent(triggerEventName))
    expect(callback).toBeCalledTimes(5)
    expect(callback).toHaveBeenLastCalledWith(null)
  })

  test(`移除触发器并触发`, () => {
    window.dispatchEvent(new Event(cancelEventName))

    window.dispatchEvent(new CustomEvent(triggerEventName))
    expect(callback).toBeCalledTimes(5)

    window.dispatchEvent(new CustomEvent(triggerEventName))
    expect(callback).toBeCalledTimes(5)
  })
})
