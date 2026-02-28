import { describe, expect, test } from 'vitest'

import {
  cancelEventName,
  defaultSkipMetaName,
  defaultStorageKey,
  pageStateGlobalVar,
  triggerEventName,
  upgradeEventName,
} from '../../src/core/constants'

describe(`检查内部常量`, () => {
  test(`类型`, () => {
    expect(defaultStorageKey).toBeTypeOf('string')
    expect(defaultSkipMetaName).toBeTypeOf('string')
    expect(pageStateGlobalVar).toBeTypeOf('string')
    expect(upgradeEventName).toBeTypeOf('string')
    expect(triggerEventName).toBeTypeOf('string')
    expect(cancelEventName).toBeTypeOf('string')
  })

  test(`非空`, () => {
    expect(defaultStorageKey).toBeTruthy()
    expect(defaultSkipMetaName).toBeTruthy()
    expect(pageStateGlobalVar).toBeTruthy()
    expect(upgradeEventName).toBeTruthy()
    expect(triggerEventName).toBeTruthy()
    expect(cancelEventName).toBeTruthy()
  })
})
