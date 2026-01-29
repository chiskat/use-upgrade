import { describe, expect, test } from 'vitest'

import { calcHash } from '../../src/lib/calcHash'

describe(`计算哈希`, async () => {
  test(`测试输入输出`, () => {
    expect(calcHash('a')).toBeTypeOf('string')
    expect(calcHash('a')).toBeTruthy()

    expect(calcHash('1')).toBeTypeOf('string')
    expect(calcHash('1')).toBeTruthy()

    expect(calcHash('')).toBeTypeOf('string')
    expect(calcHash('')).toBeTruthy()
  })

  test(`测试碰撞`, () => {
    const resultA = calcHash('a')
    const resultAA = calcHash('aa')
    expect(resultA).not.toBe(resultAA)

    const resultB = calcHash('b')
    expect(resultA).not.toBe(resultB)
  })
})
