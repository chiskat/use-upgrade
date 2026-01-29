import { describe, expect, test, vi } from 'vitest'

import { cancelCheckUpgrade } from '../../src'
import { cancelEventName } from '../../src/core/constants'

describe(`测试取消监听事件`, async () => {
  const callback = vi.fn()

  test(`未注册触发器前`, async () => {
    cancelCheckUpgrade()
    expect(callback).toBeCalledTimes(0)
  })

  test(`注册触发器并触发`, async () => {
    window.addEventListener(cancelEventName, callback)
    cancelCheckUpgrade()
    expect(callback).toBeCalledTimes(1)
  })

  test(`移除触发器并触发`, async () => {
    window.removeEventListener(cancelEventName, callback)
    cancelCheckUpgrade()
    expect(callback).toBeCalledTimes(1)
  })
})
