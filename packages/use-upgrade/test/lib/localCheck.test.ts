import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { defaultCheckUpgradeOptions } from '../../src/core/startCheckUpgrade'
import { localCheck } from '../../src/lib/localCheck'
import { cleanPageState, setPageState } from '../../src/lib/pageState'
import { cleanStorageState, setStorageState } from '../../src/lib/storageState'

describe('localCheck', () => {
  beforeEach(() => {
    setPageState({ ...defaultCheckUpgradeOptions, hash: 'hash-v1' })
  })

  afterEach(() => {
    cleanStorageState()
    cleanPageState()
  })

  test('无远程版本', () => {
    expect(localCheck()).toBe(false)
  })

  test('无本地版本', () => {
    cleanPageState()
    setPageState(defaultCheckUpgradeOptions)
    setStorageState({ remoteHash: 'hash-v2' })
    expect(localCheck()).toBe(false)
  })

  test('跳过更新', () => {
    setStorageState({ remoteHash: 'hash-v2', skipHash: 'hash-v2' })
    expect(localCheck()).toBe(false)
  })

  test('版本号相同', () => {
    setStorageState({ remoteHash: 'hash-v1' })
    expect(localCheck()).toBe(false)
  })

  test('触发新版本', () => {
    setStorageState({ remoteHash: 'hash-v2' })
    expect(localCheck()).toBe(true)
  })

  test('出发新版本且不是应跳过的版本', () => {
    setStorageState({ remoteHash: 'hash-v2', skipHash: 'hash-v1' })
    expect(localCheck()).toBe(true)
  })
})
