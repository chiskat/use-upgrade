import { execSync } from 'node:child_process'
import type { HtmlTagDescriptor, Plugin } from 'vite'

export interface UseUpgradePluginOptions {
  /** 是否跳过本次版本更新检查，开启后插件才会注入 meta 标签，默认 false */
  skip?: boolean

  /** 注入的 `<meta>` 标签的 name 值，默认 `"useUpgradeSkip"` */
  skipMetaName?: string

  /** 需要注入 meta 标签的 HTML 文件名，默认 `"/index.html"` */
  htmlFileName?: string
}

export default function useUpgradePlugin(options: UseUpgradePluginOptions = {}): Plugin {
  const { skip = false, skipMetaName = 'useUpgradeSkip', htmlFileName = '/index.html' } = options

  return {
    name: 'vite-plugin-use-upgrade',

    transformIndexHtml(_html: string, ctx: { filename: string }) {
      if (!ctx.filename.endsWith(htmlFileName)) {
        return []
      }

      let commitMessage = ''
      try {
        commitMessage = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim()
      } catch {
        // 非 git 仓库或 git 不可用时忽略
      }

      const shouldSkip =
        skip ||
        process.argv.includes('--use-upgrade-skip') ||
        ['true', '1', 'on', 'yes'].includes(process.env.USE_UPGRADE_SKIP?.toLowerCase() ?? '') ||
        commitMessage.includes('[use-upgrade-skip]')

      if (!shouldSkip) {
        return []
      }

      return [{ tag: 'meta', attrs: { name: skipMetaName }, injectTo: 'head' }] satisfies HtmlTagDescriptor[]
    },
  }
}
