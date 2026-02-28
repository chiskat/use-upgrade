import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { nextTick } from 'vue'

import { upgradeEventName } from '../../src/core/constants'
import { defaultCheckUpgradeOptions } from '../../src/core/startCheckUpgrade'
import { cleanPageState, setPageState } from '../../src/lib/pageState'
import { cleanStorageState, setStorageState } from '../../src/lib/storageState'
import { useUpgrade } from '../../src/vue/useUpgrade'

// 在 Vue 组件上下文中运行 composable 的辅助函数
function withSetup<T>(composable: () => T) {
  let result!: T
  const wrapper = mount({
    setup() {
      result = composable()
      return () => null
    },
  })
  return { result, wrapper }
}

describe('useUpgrade', () => {
  afterEach(() => {
    cleanStorageState()
    cleanPageState()
  })

  test('初始状态：无新版本时返回 false', () => {
    const { result } = withSetup(() => useUpgrade())
    expect(result.value).toBe(false)
  })

  test('初始状态：localCheck 已检测到新版本时返回 true', () => {
    setPageState({ ...defaultCheckUpgradeOptions, hash: 'hash-v1' })
    setStorageState({ remoteHash: 'hash-v2' })
    const { result } = withSetup(() => useUpgrade())
    expect(result.value).toBe(true)
  })

  test('触发 upgradeEventName 事件后，返回值变为 true', async () => {
    const { result } = withSetup(() => useUpgrade())
    expect(result.value).toBe(false)

    window.dispatchEvent(new Event(upgradeEventName))
    await nextTick()

    expect(result.value).toBe(true)
  })

  test('触发事件时调用 callback', async () => {
    const callback = vi.fn()
    withSetup(() => useUpgrade(callback))

    window.dispatchEvent(new Event(upgradeEventName))
    await nextTick()

    expect(callback).toBeCalledTimes(1)
  })

  test('无 callback 时触发事件不报错', async () => {
    const { result } = withSetup(() => useUpgrade())

    window.dispatchEvent(new Event(upgradeEventName))
    await nextTick()

    expect(result.value).toBe(true)
  })

  test('卸载后不再响应事件', async () => {
    const callback = vi.fn()
    const { wrapper } = withSetup(() => useUpgrade(callback))

    wrapper.unmount()

    window.dispatchEvent(new Event(upgradeEventName))
    await nextTick()

    expect(callback).toBeCalledTimes(0)
  })
})
