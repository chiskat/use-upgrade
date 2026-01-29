import { describe, expect, test } from 'vitest'

import { verifyParams } from '../../src/lib/verifyParams'

function noop() {}

describe(`测试 callback 输入`, () => {
  test(`测试 callback 输入`, () => {
    expect(() => verifyParams(() => {})).not.toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams()).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams('1')).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(null)).toThrow()
  })
})

describe(`测试 options 输入`, () => {
  test(`空值输入`, () => {
    expect(() => verifyParams(noop)).not.toThrow()
    expect(() => verifyParams(noop, undefined)).not.toThrow()
    expect(() => verifyParams(noop, {})).not.toThrow()
    // @ts-expect-error 额外无用参数输入
    expect(() => verifyParams(noop, { xxxx: 111 })).not.toThrow()
  })

  test(`非法输入`, () => {
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, 0)).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, '')).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, null)).toThrow()
  })
})

describe(`测试各 options 配置项`, () => {
  test(`参数 storageKey`, () => {
    expect(() => verifyParams(noop, {})).not.toThrow()
    expect(() => verifyParams(noop, { storageKey: undefined })).not.toThrow()
    expect(() => verifyParams(noop, { storageKey: 'test' })).not.toThrow()

    expect(() => verifyParams(noop, { storageKey: ' ' })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { storageKey: null })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { storageKey: 111 })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { storageKey: () => 'xx' })).toThrow()
  })

  test(`参数 basename`, () => {
    expect(() => verifyParams(noop, {})).not.toThrow()
    expect(() => verifyParams(noop, { basename: undefined })).not.toThrow()
    expect(() => verifyParams(noop, { basename: 'test' })).not.toThrow()

    expect(() => verifyParams(noop, { basename: ' ' })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { basename: [] })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { basename: ['xxx'] })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { basename: {} })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { basename: null })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { basename: 111 })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { basename: [111] })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { basename: () => 'xx' })).toThrow()
  })

  test(`参数 checkInterval`, () => {
    expect(() => verifyParams(noop, {})).not.toThrow()
    expect(() => verifyParams(noop, { checkInterval: undefined })).not.toThrow()
    expect(() => verifyParams(noop, { checkInterval: 0 })).not.toThrow()
    expect(() => verifyParams(noop, { checkInterval: 1000 })).not.toThrow()

    expect(() => verifyParams(noop, { checkInterval: -1 })).toThrow()
    expect(() => verifyParams(noop, { checkInterval: NaN })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { checkInterval: null })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { checkInterval: '1000' })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { checkInterval: {} })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { checkInterval: () => 1000 })).toThrow()
  })

  test(`参数 fetchInterval`, () => {
    expect(() => verifyParams(noop, {})).not.toThrow()
    expect(() => verifyParams(noop, { fetchInterval: undefined })).not.toThrow()
    expect(() => verifyParams(noop, { fetchInterval: 0 })).not.toThrow()
    expect(() => verifyParams(noop, { fetchInterval: 1000 })).not.toThrow()

    expect(() => verifyParams(noop, { fetchInterval: -1 })).toThrow()
    expect(() => verifyParams(noop, { fetchInterval: NaN })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { fetchInterval: null })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { fetchInterval: '1000' })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { fetchInterval: {} })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { fetchInterval: () => 1000 })).toThrow()
  })

  test(`参数 skipMetaName`, () => {
    expect(() => verifyParams(noop, { skipMetaName: undefined })).not.toThrow()
    expect(() => verifyParams(noop, { skipMetaName: null })).not.toThrow()
    expect(() => verifyParams(noop, { skipMetaName: 'somevalue' })).not.toThrow()
    expect(() => verifyParams(noop, { skipMetaName: '111' })).not.toThrow()

    expect(() => verifyParams(noop, { skipMetaName: '' })).toThrow()
    expect(() => verifyParams(noop, { skipMetaName: '  ' })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { skipMetaName: 111 })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { skipMetaName: {} })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { skipMetaName: ['somevalue'] })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { skipMetaName: () => '' })).toThrow()
  })

  test(`参数 overrideHtmlUrl`, () => {
    expect(() => verifyParams(noop, { overrideHtmlUrl: undefined })).not.toThrow()
    expect(() => verifyParams(noop, { overrideHtmlUrl: '/index.html' })).not.toThrow()
    expect(() => verifyParams(noop, { overrideHtmlUrl: () => '/index.html' })).not.toThrow()

    expect(() => verifyParams(noop, { overrideHtmlUrl: '' })).toThrow()
    expect(() => verifyParams(noop, { overrideHtmlUrl: '   ' })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { overrideHtmlUrl: null })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { overrideHtmlUrl: 111 })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { overrideHtmlUrl: {} })).toThrow()
  })

  test(`参数 overrideFetchVersionHash`, () => {
    expect(() => verifyParams(noop, { overrideFetchVersionHash: undefined })).not.toThrow()
    expect(() => verifyParams(noop, { overrideFetchVersionHash: () => Promise.resolve('1a2b3c') })).not.toThrow()

    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { overrideFetchVersionHash: null })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { overrideFetchVersionHash: {} })).toThrow()
    // @ts-expect-error 测试错误参数输入
    expect(() => verifyParams(noop, { overrideFetchVersionHash: [111] })).toThrow()
  })
})
