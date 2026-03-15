# use-upgrade

[![npm](https://img.shields.io/npm/v/use-upgrade)](https://www.npmjs.com/package/use-upgrade)
[![npm downloads](https://img.shields.io/npm/dm/use-upgrade.svg?style=flat)](https://npmcharts.com/compare/use-upgrade?minimal=true)
[![package size](https://deno.bundlejs.com/badge?q=use-upgrade)](https://bundlejs.com/?q=use-upgrade)

适用于几乎任何 Web 框架，只需一行代码便可开启网站的版本检测，并在发现新版本时触发开发者提供的回调。

# 文档

[在线文档](https://use-upgrade.paperplane.cc)

# Agent Skills

`use-upgrade` 现在提供 [配套的 Agent Skills](https://use-upgrade.paperplane.cc/guide/bootstrap/agent-skills)，安装后，你的 AI 编程助手可以正确理解并学会使用。

# 简介

`use-upgrade` 的亮点：

- 兼容 `Vite`、`Next.js`、`Webpack` 等构建系统的各类项目（React、Vue、Angular、Svelte 等），如有需求还可以自行拓展；
- 无需改动后端或服务器，大多数情况都能零配置使用；
- 低网络开销，网页处在后台或是多标签页等场景也不会浪费网络资源；
- 配置项丰富，几乎所有行为都能定制；
- 对于 React、Vue 项目，提供 hook 以获得响应式能力。

每次版本更新都要提醒用户，不太灵活，想自由控制？—— 推荐使用配套的 [Vite 插件](https://www.npmjs.com/package/@use-upgrade/vite-plugin) [![npm](https://img.shields.io/npm/v/@use-upgrade/vite-plugin)](https://www.npmjs.com/package/@use-upgrade/vite-plugin) 或 [Webpack 插件](https://www.npmjs.com/package/@use-upgrade/webpack-plugin) [![npm](https://img.shields.io/npm/v/@use-upgrade/webpack-plugin)](https://www.npmjs.com/package/@use-upgrade/webpack-plugin)，它可以：

- 可按需跳过 `use-upgrade` 的检测，这样微型版本发布时，可不必打扰用户；
- 可根据打包命令参数、Git 提交 message、环境变量等多种方式判断是否需跳过检测，CI/CD 集成更方便。

# 使用示例

只需要在项目启动入口处调用方法即可：

```jsx
import { Modal } from 'antd'
import { startCheckUpgrade } from 'use-upgrade'

if (process.env.NODE_ENV === 'production') {
  startCheckUpgrade(() => {
    Modal.info({
      title: '系统已更新',
      content: '请点击刷新按钮，加载新版本页面',
      okText: '刷新',
      onOk() {
        window.location.reload()
      },
    })
  })
}
```

这样就完成了。只要网站发布了新版本，工具检测到后，就会调用回调弹窗提醒。

开发环境下，网站内容一直在更改，会导致频繁触发回调，因此上述示例中添加了 `process.env.NODE_ENV` 判断条件。

# 在 React/Vue 项目中使用

通过 `use-upgrade/react`（或 `/vue`） 提供一个 `useUpgrade()`，它接受一个函数作为检测到新版本后的回调，且返回一个布尔值表示是否有新版本。

**注意，必须调用过 `startCheckUpgrade()`，此 hook 才能生效。**

React 使用示例：

```jsx
import { useUpgrade } from 'use-upgrade/react'

export default function HomePage() {
  // 用法一： 注册一个发现新版本时会触发的回调
  useUpgrade(() => {
    console.log('发现新版本')
  })

  // 用法二： 使用返回值，表示当前是否检测到存在新版本
  const hasNewVersion = useUpgrade()

  return <div>是否有新版本：{hasNewVersion ? '是' : '否'}</div>
}
```

Vue 使用示例类似，具体可参考 [在线文档](https://use-upgrade.paperplane.cc)。
