import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { upgradeEventName } from '../../src/core/constants'
import { defaultCheckUpgradeOptions } from '../../src/core/startCheckUpgrade'
import { cleanPageState, setPageState } from '../../src/lib/pageState'
import { cleanStorageState, setStorageState } from '../../src/lib/storageState'
import { useUpgrade } from '../../src/react/useUpgrade'

describe('useUpgrade', () => {
  afterEach(() => {
    cleanStorageState()
    cleanPageState()
  })

  test('初始状态：无新版本时返回 false', () => {
    const { result } = renderHook(() => useUpgrade())
    expect(result.current).toBe(false)
  })

  test('初始状态：localCheck 已检测到新版本时返回 true', () => {
    setPageState({ ...defaultCheckUpgradeOptions, hash: 'hash-v1' })
    setStorageState({ remoteHash: 'hash-v2' })
    const { result } = renderHook(() => useUpgrade())
    expect(result.current).toBe(true)
  })

  test('触发 upgradeEventName 事件后，返回值变为 true', async () => {
    const { result } = renderHook(() => useUpgrade())
    expect(result.current).toBe(false)

    await act(async () => {
      window.dispatchEvent(new Event(upgradeEventName))
    })

    expect(result.current).toBe(true)
  })

  test('触发事件时调用 callback', async () => {
    const callback = vi.fn()
    renderHook(() => useUpgrade(callback))

    await act(async () => {
      window.dispatchEvent(new Event(upgradeEventName))
    })

    expect(callback).toBeCalledTimes(1)
  })

  test('无 callback 时触发事件不报错', async () => {
    const { result } = renderHook(() => useUpgrade())

    await act(async () => {
      window.dispatchEvent(new Event(upgradeEventName))
    })

    expect(result.current).toBe(true)
  })

  test('卸载后不再响应事件', async () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => useUpgrade(callback))

    unmount()

    await act(async () => {
      window.dispatchEvent(new Event(upgradeEventName))
    })

    expect(callback).toBeCalledTimes(0)
  })

  test('callback 变化时，使用最新的 callback', async () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    let currentCallback = callback1
    const { rerender } = renderHook(() => useUpgrade(currentCallback))

    currentCallback = callback2
    rerender()

    await act(async () => {
      window.dispatchEvent(new Event(upgradeEventName))
    })

    expect(callback1).toBeCalledTimes(0)
    expect(callback2).toBeCalledTimes(1)
  })
})
