import { execSync } from 'node:child_process'
import type { HtmlTagDescriptor, Plugin } from 'vite'

export interface UseUpgradePluginOptions {
  /** 默认只有通过 Git 提交信息、环境变量、构建参数才会启用，传入 `true` 直接启用 */
  skip?: boolean

  /** 注入的 `<meta>` 标签的 name 值，默认 `"useUpgradeSkip"` */
  skipMetaName?: string

  /** 需要注入 meta 标签的 HTML 文件名，可以带路径以精确匹配，默认 `"/index.html"` */
  htmlFileName?: string
}

export default function useUpgradePlugin(options: UseUpgradePluginOptions = {}): Plugin {
  const { skip = false, skipMetaName = 'useUpgradeSkip', htmlFileName = '/index.html' } = options

  const hasArgvSkip = process.argv.includes('--use-upgrade-skip')
  const hasEnvSkip = ['true', '1', 'on', 'yes'].includes(process.env.USE_UPGRADE_SKIP?.toLowerCase() ?? '')
  let hasGitSkipMessage = false
  try {
    const gitMessage = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim()
    hasGitSkipMessage = gitMessage.includes('[use-upgrade-skip]')
  } catch {
    // 非 git 仓库或 git 不可用时忽略
  }

  return {
    name: 'vite-plugin-use-upgrade',

    transformIndexHtml(_html: string, ctx: { filename: string }) {
      const shouldSkip = skip || hasArgvSkip || hasGitSkipMessage || hasEnvSkip
      if (!shouldSkip) {
        return []
      }

      // 统一路径分隔符为正斜杠（兼容 Windows）
      const normalizedFilename = ctx.filename.replace(/\\/g, '/')
      if (!normalizedFilename.endsWith(htmlFileName)) {
        return []
      }

      return [{ tag: 'meta', attrs: { name: skipMetaName }, injectTo: 'head' }] satisfies HtmlTagDescriptor[]
    },
  }
}
