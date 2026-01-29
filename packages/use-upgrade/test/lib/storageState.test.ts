import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { defaultCheckUpgradeOptions } from '../../src/core/startCheckUpgrade'
import { cleanPageState, setPageState } from '../../src/lib/pageState'
import { cleanStorageState, getStorageState, setStorageState } from '../../src/lib/storageState'

describe(`默认 storageKey`, () => {
  beforeAll(() => void setPageState(defaultCheckUpgradeOptions))
  afterAll(() => {
    cleanStorageState()
    cleanPageState()
  })

  const now = Date.now()

  test(`初始值`, () => {
    expect(getStorageState()).toEqual({})
  })

  test(`存值取值`, () => {
    setStorageState({ lastFetchTime: now })
    expect(getStorageState()).toEqual({ lastFetchTime: now })
  })

  test(`合并值`, () => {
    setStorageState({ skipHash: 'xx' })
    expect(getStorageState()).toEqual({ lastFetchTime: now, skipHash: 'xx' })
  })

  test(`清理`, () => {
    cleanStorageState()
    expect(localStorage.getItem(defaultCheckUpgradeOptions.storageKey)).toBeFalsy()
  })
})

describe(`自定义 storageKey`, () => {
  beforeAll(() => void setPageState({ ...defaultCheckUpgradeOptions, storageKey: '__test__' }))
  afterAll(() => {
    cleanStorageState()
    cleanPageState()
  })

  test(`初始值`, () => {
    expect(getStorageState()).toEqual({})
  })

  test(`存值取值`, () => {
    setStorageState({ skipHash: 'xx' })

    expect(getStorageState()).toEqual({ skipHash: 'xx' })
    expect(JSON.parse(localStorage.getItem('__test__') || '{}')).toEqual({ skipHash: 'xx' })
    expect(localStorage.getItem(defaultCheckUpgradeOptions.storageKey)).toBeFalsy()
  })

  test(`清理`, () => {
    cleanStorageState()
    expect(localStorage.getItem('__test__')).toBeFalsy()
  })
})
