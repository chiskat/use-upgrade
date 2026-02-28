import { execSync } from 'node:child_process'
import type { Compiler, sources as webpackSources } from 'webpack'

export interface UseUpgradePluginOptions {
  /** 是否跳过本次版本更新检查，开启后插件才会注入 meta 标签，默认 false */
  skip?: boolean

  /** 注入的 `<meta>` 标签的 name 值，默认 `"useUpgradeSkip"` */
  skipMetaName?: string

  /** 需要注入 meta 标签的 HTML 文件名，默认 `"index.html"` */
  htmlFileName?: string
}

export default class UseUpgradePlugin {
  private skip: boolean
  private skipMetaName: string
  private htmlFileName: string

  constructor(options: UseUpgradePluginOptions = {}) {
    this.skip = options.skip ?? false
    this.skipMetaName = options.skipMetaName ?? 'useUpgradeSkip'
    this.htmlFileName = options.htmlFileName ?? 'index.html'
  }

  apply(compiler: Compiler) {
    const { RawSource } = compiler.webpack.sources as typeof webpackSources

    compiler.hooks.compilation.tap('UseUpgradeWebpackPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'UseUpgradeWebpackPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        assets => {
          let commitMessage = ''
          try {
            commitMessage = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim()
          } catch {
            // 非 git 仓库或 git 不可用时忽略
          }

          const shouldSkip =
            this.skip ||
            process.argv.includes('--use-upgrade-skip') ||
            ['true', '1', 'on', 'yes'].includes(process.env.USE_UPGRADE_SKIP?.toLowerCase() ?? '') ||
            commitMessage.includes('[use-upgrade-skip]')

          if (!shouldSkip) return

          const metaTag = `<meta name="${this.skipMetaName}">`

          for (const name of Object.keys(assets)) {
            if (name !== this.htmlFileName) continue

            const source = compilation.getAsset(name)
            if (!source) continue

            const html = source.source.source().toString()
            const injected = html.replace('</head>', `${metaTag}</head>`)
            compilation.updateAsset(name, new RawSource(injected))
          }
        }
      )
    })
  }
}
