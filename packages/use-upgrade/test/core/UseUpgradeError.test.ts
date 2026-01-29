import { describe, expect, test } from 'vitest'

import { UseUpgradeError } from '../../src'

describe(`检查 UseUpgradeError 错误类型`, () => {
  test('需派生自 Error', () => {
    expect(new UseUpgradeError('错误信息1')).toBeInstanceOf(Error)
  })

  test('正确带有 message', () => {
    expect(() => {
      throw new UseUpgradeError('错误信息2')
    }).toThrow('错误信息2')
  })
})
