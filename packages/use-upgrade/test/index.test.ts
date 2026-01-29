import { describe, expect, test } from 'vitest'

import { cancelCheckUpgrade, startCheckUpgrade, triggerCheckUpgrade } from '../src'

describe(`检查库导出`, () => {
  test(`需为函数`, () => {
    expect(cancelCheckUpgrade).toBeTypeOf('function')
    expect(startCheckUpgrade).toBeTypeOf('function')
    expect(triggerCheckUpgrade).toBeTypeOf('function')
  })
})
