import { execSync } from 'node:child_process'
import type { Compiler, sources as webpackSources } from 'webpack'

export interface UseUpgradePluginOptions {
  /** 默认只有通过 Git 提交信息、环境变量、构建参数才会启用，传入 `true` 直接启用 */
  skip?: boolean

  /** 注入的 `<meta>` 标签的 name 值，默认 `"useUpgradeSkip"` */
  skipMetaName?: string

  /** 需要注入 meta 标签的 HTML 文件名，可以带路径以精确匹配，默认 `"index.html"` */
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

    const hasArgvSkip = process.argv.includes('--use-upgrade-skip')
    const hasEnvSkip = ['true', '1', 'on', 'yes'].includes(process.env.USE_UPGRADE_SKIP?.toLowerCase() ?? '')
    let hasGitSkipMessage = false
    try {
      const gitMessage = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim()
      hasGitSkipMessage = gitMessage.includes('[use-upgrade-skip]')
    } catch {
      // 非 git 仓库或 git 不可用时忽略
    }

    compiler.hooks.compilation.tap('UseUpgradeWebpackPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'UseUpgradeWebpackPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        assets => {
          const shouldSkip = this.skip || hasArgvSkip || hasGitSkipMessage || hasEnvSkip
          if (!shouldSkip) {
            return
          }

          const metaTag = `<meta name="${this.skipMetaName}" />`
          for (const name of Object.keys(assets)) {
            // 统一路径分隔符为正斜杠（兼容 Windows）
            const normalizedAssetName = name.replace(/\\/g, '/')
            if (!normalizedAssetName.endsWith(this.htmlFileName)) {
              continue
            }

            const source = compilation.getAsset(name)
            if (!source) {
              continue
            }

            const html = source.source.source().toString()
            const injected = html.replace('</head>', `${metaTag}</head>`)
            compilation.updateAsset(name, new RawSource(injected))
          }
        }
      )
    })
  }
}
