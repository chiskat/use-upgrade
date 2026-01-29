import { describe, expect, test } from 'vitest'

import { useUpgrade } from '../../src/vue'

describe(`检查库 Vue 子目录导出`, () => {
  test(`需为函数`, () => {
    expect(useUpgrade).toBeTypeOf('function')
  })

  test(`需符合 hooks 命名规范`, () => {
    expect(useUpgrade.name).toMatch(/^use/)
  })
})
