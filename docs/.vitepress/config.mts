import { defineConfig } from 'vitepress'

import pkg from '../../lerna.json'

export default defineConfig({
  transformPageData(pageData) {
    pageData.frontmatter.pkgVersion = pkg.version
  },
  markdown: {
    config(md) {
      const fence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        tokens[idx].content = tokens[idx].content.replaceAll('__PKG_VERSION__', pkg.version)

        return fence!(tokens, idx, options, env, self)
      }
    },
  },
  title: 'use-upgrade',
  description: 'use-upgrade 是一个 npm 包，可以让你的网站保持最新；它兼容几乎所有 Web 框架，包括 React 和 Vue 生态。',
  lang: 'zh-CN',
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],
  lastUpdated: true,
  appearance: false,
  metaChunk: true,
  cleanUrls: true,
  themeConfig: {
    logo: '/logo.svg',

    nav: [{ text: '文档', link: '/guide/bootstrap/introduction', activeMatch: '/guide' }],

    sidebar: {
      '/guide/': [
        {
          text: '起步',
          items: [
            { text: '介绍', link: '/guide/bootstrap/introduction' },
            { text: '快速上手', link: '/guide/bootstrap/usage' },
            { text: 'Agent Skills', link: '/guide/bootstrap/agent-skills' },
          ],
        },

        {
          text: 'use-upgrade',
          items: [
            { text: '基础用法', link: '/guide/use-upgrade/basic' },
            { text: '进阶用法', link: '/guide/use-upgrade/advanced' },
            { text: 'React Hook', link: '/guide/use-upgrade/react-hook' },
            { text: 'Vue Hook', link: '/guide/use-upgrade/vue-hook' },
            { text: '原理', link: '/guide/use-upgrade/principle' },
            { text: 'API 参考', link: '/guide/use-upgrade/api' },
            { text: 'FAQ', link: '/guide/use-upgrade/faq' },
          ],
        },

        {
          text: 'Vite 插件',
          items: [
            { text: '介绍', link: '/guide/vite-plugin/introduction' },
            { text: '快速上手', link: '/guide/vite-plugin/usage' },
            { text: 'API 参考', link: '/guide/vite-plugin/api' },
          ],
        },

        {
          text: 'Webpack 插件',
          items: [
            { text: '介绍', link: '/guide/webpack-plugin/introduction' },
            { text: '快速上手', link: '/guide/webpack-plugin/usage' },
            { text: 'API 参考', link: '/guide/webpack-plugin/api' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/chiskat/use-upgrade' }],

    editLink: {
      pattern: 'https://github.com/chiskat/use-upgrade/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
          },
          modal: {
            displayDetails: '切换详情/仅标题',
            resetButtonTitle: '清空输入框',
            backButtonTitle: '返回',
            noResultsText: '没有找到结果',
            footer: {
              selectText: '前往',
              navigateText: '导航',
              closeText: '关闭搜索',
            },
          },
        },
      },
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    outline: {
      label: '页面导航',
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳转到内容',
  },

  sitemap: {
    hostname: 'https://use-upgrade.paperplane.cc',
  },
})
