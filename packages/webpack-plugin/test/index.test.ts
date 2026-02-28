import { createFsFromVolume, Volume } from 'memfs'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import webpack from 'webpack'

import UseUpgradePlugin from '../src/index'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => ''),
}))

const outDir = resolve(__dirname, '../fixture/dist')
const templatePath = resolve(__dirname, '../fixture/index.html')

/** 将 fixture HTML 作为资源注入 webpack 输出的简单插件 */
class HtmlEmitPlugin {
  private fileName: string

  constructor(fileName = 'index.html') {
    this.fileName = fileName
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap('HtmlEmitPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        { name: 'HtmlEmitPlugin', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        () => {
          const html = readFileSync(templatePath, 'utf-8')
          compilation.emitAsset(this.fileName, new compiler.webpack.sources.RawSource(html))
        }
      )
    })
  }
}

function buildHtml(plugins: webpack.WebpackPluginInstance[], htmlFileName = 'index.html'): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const vol = new Volume()
    const compiler = webpack({
      mode: 'production',
      entry: resolve(__dirname, '../fixture/entry.js'),
      output: { path: outDir, filename: '[name].js' },
      plugins: [new HtmlEmitPlugin(htmlFileName), ...plugins],
      cache: false,
    })
    compiler.outputFileSystem = createFsFromVolume(vol) as any
    compiler.run((err, stats) => {
      if (err) return reject(err)
      if (stats?.hasErrors()) return reject(stats.compilation.errors[0])
      try {
        resolvePromise(vol.readFileSync(resolve(outDir, htmlFileName), 'utf-8') as string)
      } catch (e) {
        reject(e)
      }
    })
  })
}

describe('UseUpgradePlugin', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.USE_UPGRADE_SKIP
  })

  it('skip 为 false 时不注入 meta 标签', async () => {
    const html = await buildHtml([new UseUpgradePlugin()])
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('skip 为 true 时注入默认 meta 标签', async () => {
    const html = await buildHtml([new UseUpgradePlugin({ skip: true })])
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('支持自定义 skipMetaName', async () => {
    const html = await buildHtml([new UseUpgradePlugin({ skip: true, skipMetaName: 'customSkip' })])
    expect(html).toContain('<meta name="customSkip">')
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('通过命令行参数 --use-upgrade-skip 开启 skip', async () => {
    const originalArgv = [...process.argv]
    vi.spyOn(process, 'argv', 'get').mockReturnValue([...originalArgv, '--use-upgrade-skip'])
    const html = await buildHtml([new UseUpgradePlugin()])
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('通过环境变量 USE_UPGRADE_SKIP=true 开启 skip', async () => {
    process.env.USE_UPGRADE_SKIP = 'true'
    const html = await buildHtml([new UseUpgradePlugin()])
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('环境变量不为 true 时不开启 skip', async () => {
    process.env.USE_UPGRADE_SKIP = 'false'
    const html = await buildHtml([new UseUpgradePlugin()])
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('git commit message 包含 [use-upgrade-skip] 时开启 skip', async () => {
    vi.mocked(execSync).mockReturnValue('feat: some feature [use-upgrade-skip]')
    const html = await buildHtml([new UseUpgradePlugin()])
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('git commit message 不包含 [use-upgrade-skip] 时不开启 skip', async () => {
    vi.mocked(execSync).mockReturnValue('feat: normal commit')
    const html = await buildHtml([new UseUpgradePlugin()])
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('git 不可用时不影响正常运行', async () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('git not found')
    })
    const html = await buildHtml([new UseUpgradePlugin()])
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('默认只注入 index.html', async () => {
    const html = await buildHtml([new UseUpgradePlugin({ skip: true })], 'other.html')
    expect(html).not.toContain('useUpgradeSkip')
  })

  it('支持自定义 htmlFileName', async () => {
    const html = await buildHtml([new UseUpgradePlugin({ skip: true, htmlFileName: 'app.html' })], 'app.html')
    expect(html).toContain('<meta name="useUpgradeSkip">')
  })

  it('htmlFileName 不匹配时不注入', async () => {
    const html = await buildHtml([new UseUpgradePlugin({ skip: true, htmlFileName: 'app.html' })], 'other.html')
    expect(html).not.toContain('useUpgradeSkip')
  })
})
