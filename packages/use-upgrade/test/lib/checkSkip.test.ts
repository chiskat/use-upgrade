import { readFileSync } from 'fs'
import { resolve } from 'path'
import { afterEach, describe, expect, test } from 'vitest'

import { defaultSkipMetaName } from '../../src/core/constants'
import { checkSkip } from '../../src/lib/checkSkip'
import { cleanPageState, setPageState } from '../../src/lib/pageState'

function mockSkipMeta(html: string, skipMetaName: string): string {
  const metaName = skipMetaName
  const result = html.replace(`<head>`, `<head><meta name="${metaName}" />`)

  return result
}

const html = readFileSync(resolve(__dirname, '../../fixture/mock.html')).toString()

describe(`默认 skipMetaName`, async () => {
  afterEach(() => void cleanPageState())

  test(`不包含跳过标签时返回 false`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    expect(checkSkip(html)).toBe(false)
  })

  test(`包含跳过标签时返回 true - 双引号`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    const htmlWithSkip = mockSkipMeta(html, defaultSkipMetaName)
    expect(checkSkip(htmlWithSkip)).toBe(true)
  })

  test(`包含跳过标签时返回 true - 单引号`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    const htmlWithSkip = html.replace(`<head>`, `<head><meta name='${defaultSkipMetaName}' />`)
    expect(checkSkip(htmlWithSkip)).toBe(true)
  })

  test(`包含跳过标签时返回 true - 无引号`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    const htmlWithSkip = html.replace(`<head>`, `<head><meta name=${defaultSkipMetaName} />`)
    expect(checkSkip(htmlWithSkip)).toBe(true)
  })

  test(`包含跳过标签时返回 true - 带其他属性`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    const htmlWithSkip = html.replace(
      `<head>`,
      `<head><meta charset="UTF-8" name="${defaultSkipMetaName}" content="skip" />`
    )
    expect(checkSkip(htmlWithSkip)).toBe(true)
  })

  test(`包含跳过标签时返回 true - 多行格式`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    const htmlWithSkip = html.replace(
      `<head>`,
      `<head><meta
        name="${defaultSkipMetaName}"
        content="skip"
      />`
    )
    expect(checkSkip(htmlWithSkip)).toBe(true)
  })

  test(`name 属性值不匹配时返回 false`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    const htmlWithWrongName = html.replace(`<head>`, `<head><meta name="otherMetaName" />`)
    expect(checkSkip(htmlWithWrongName)).toBe(false)
  })

  test(`name 属性值部分匹配时返回 false`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    const htmlWithPartialMatch = html.replace(`<head>`, `<head><meta name="${defaultSkipMetaName}Extra" />`)
    expect(checkSkip(htmlWithPartialMatch)).toBe(false)
  })
})

describe(`自定义 skipMetaName`, async () => {
  afterEach(() => void cleanPageState())

  test(`使用自定义 skipMetaName - 不包含时返回 false`, () => {
    const customSkipName = 'myCustomSkip'
    setPageState({ skipMetaName: customSkipName })
    expect(checkSkip(html)).toBe(false)
  })

  test(`使用自定义 skipMetaName - 包含时返回 true`, () => {
    const customSkipName = 'myCustomSkip'
    setPageState({ skipMetaName: customSkipName })
    const htmlWithSkip = mockSkipMeta(html, customSkipName)
    expect(checkSkip(htmlWithSkip)).toBe(true)
  })

  test(`使用自定义 skipMetaName - 包含默认标签但不匹配自定义名称时返回 false`, () => {
    const customSkipName = 'myCustomSkip'
    setPageState({ skipMetaName: customSkipName })
    const htmlWithDefaultSkip = mockSkipMeta(html, defaultSkipMetaName)
    expect(checkSkip(htmlWithDefaultSkip)).toBe(false)
  })

  test(`使用自定义 skipMetaName - 特殊字符`, () => {
    const customSkipName = 'skip-version-1.0'
    setPageState({ skipMetaName: customSkipName })
    const htmlWithSkip = mockSkipMeta(html, customSkipName)
    expect(checkSkip(htmlWithSkip)).toBe(true)
  })

  test(`使用自定义 skipMetaName - 数字`, () => {
    const customSkipName = 'skip123'
    setPageState({ skipMetaName: customSkipName })
    const htmlWithSkip = mockSkipMeta(html, customSkipName)
    expect(checkSkip(htmlWithSkip)).toBe(true)
  })
})

describe(`边界情况`, () => {
  afterEach(() => void cleanPageState())

  test(`空 HTML 字符串`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    expect(checkSkip('')).toBe(false)
  })

  test(`没有设置 skipMetaName 时使用 undefined`, () => {
    setPageState({})
    const html = '<html><head><meta name="useUpgradeSkip" /></head></html>'
    expect(checkSkip(html)).toBe(false)
  })

  test(`HTML 中包含多个 meta 标签`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width" />
          <meta name="${defaultSkipMetaName}" />
          <meta name="description" content="test" />
        </head>
      </html>
    `
    expect(checkSkip(html)).toBe(true)
  })

  test(`meta 标签在 body 中`, () => {
    setPageState({ skipMetaName: defaultSkipMetaName })
    const html = `
      <html>
        <head></head>
        <body>
          <meta name="${defaultSkipMetaName}" />
        </body>
      </html>
    `
    expect(checkSkip(html)).toBe(true)
  })
})
