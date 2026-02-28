import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { build, type Plugin } from 'vite'
import { afterEach, describe, expect, it, vi } from 'vitest'

import useUpgradePlugin from '../src/index'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => ''),
}))

async function buildHtml(plugins: Plugin[]) {
  const result = await build({
    root: resolve(__dirname, '../fixture'),
    plugins,
    build: { write: false },
    logLevel: 'silent',
  })

  if ('output' in result) {
    const html = result.output.find(chunk => chunk.fileName === 'index.html')

    return html && 'source' in html ? (html.source as string) : ''
  }

  return ''
}

describe('useUpgradePlugin', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.USE_UPGRADE_SKIP
  })

  it('skip 为 false 时不注入 meta 标签', async () => {
    const html = await buildHtml([useUpgradePlugin()])
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('skip 为 true 时注入默认 meta 标签', async () => {
    const html = await buildHtml([useUpgradePlugin({ skip: true })])
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('支持自定义 skipMetaName', async () => {
    const html = await buildHtml([useUpgradePlugin({ skip: true, skipMetaName: 'customSkip' })])
    expect(html).toContain('<meta name="customSkip">')
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('通过命令行参数 --use-upgrade-skip 开启 skip', async () => {
    const originalArgv = [...process.argv]
    vi.spyOn(process, 'argv', 'get').mockReturnValue([...originalArgv, '--use-upgrade-skip'])
    const html = await buildHtml([useUpgradePlugin()])
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('通过环境变量 USE_UPGRADE_SKIP=true 开启 skip', async () => {
    process.env.USE_UPGRADE_SKIP = 'true'
    const html = await buildHtml([useUpgradePlugin()])
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('环境变量不为 true 时不开启 skip', async () => {
    process.env.USE_UPGRADE_SKIP = 'false'
    const html = await buildHtml([useUpgradePlugin()])
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('git commit message 包含 [use-upgrade-skip] 时开启 skip', async () => {
    vi.mocked(execSync).mockReturnValue('feat: some feature [use-upgrade-skip]')
    const html = await buildHtml([useUpgradePlugin()])
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('git commit message 不包含 [use-upgrade-skip] 时不开启 skip', async () => {
    vi.mocked(execSync).mockReturnValue('feat: normal commit')
    const html = await buildHtml([useUpgradePlugin()])
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('htmlFileName 匹配时正常注入 meta 标签', async () => {
    const html = await buildHtml([useUpgradePlugin({ skip: true, htmlFileName: '/index.html' })])
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('htmlFileName 不匹配时不注入 meta 标签', async () => {
    const html = await buildHtml([useUpgradePlugin({ skip: true, htmlFileName: '/other.html' })])
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('git 不可用时不影响正常运行', async () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('git not found')
    })
    const html = await buildHtml([useUpgradePlugin()])
    expect(html).not.toContain('useUpgradeSkip')
  })
})
