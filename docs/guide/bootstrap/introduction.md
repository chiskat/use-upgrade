# 介绍

## 什么是 `use-upgrade`

<p style="display: flex; gap: 10px;">
  <a href="https://www.npmjs.com/package/use-upgrade"><img src="https://img.shields.io/npm/v/use-upgrade" alt="npm" /></a>
  <a href="https://npmcharts.com/compare/use-upgrade?minimal=true"><img src="https://img.shields.io/npm/dm/use-upgrade.svg?style=flat" alt="npm downloads" /></a>
  <a href="https://bundlejs.com/?q=use-upgrade"><img src="https://deno.bundlejs.com/badge?q=use-upgrade" alt="package size" /></a>
</p>

[`use-upgrade`](https://www.npmjs.com/package/use-upgrade) 是适用于 Web 的 npm 包，它会自动检测网站是否有新版本发布，以提醒用户或是刷新网页。

使用示例：<br />
只需在项目入口处添加一行 `startCheckUpgrade(callback)` 即可自动开始检测新版本，一旦检测到有新版本发布，便会调用回调 `callback`。除此之外，开发者无需任何配置。

## 特色

- 零配置兼容 `Vite`、`Webpack`、`Next.js` 等构建系统的各类项目（React、Vue、Angular、Svelte 等），无需改动后端或服务器；
- 虽然能零配置启用，但也提供了丰富的配置项，几乎所有行为都能定制；
- 低网络开销，网页处在后台或是多标签页等场景也不会浪费网络资源；
- 对于 React、Vue 项目，提供 hooks 以获得响应式能力；
- 完善的 TypeScript 支持和 JSDoc 文档，原生 ESModule 支持，代码包体积小；
- 有配套的 Agent Skills，和 AI 协同更方便。

## 生态

- [Agent Skills](/guide/bootstrap/agent-skills)，让智能编程助手可以感知、学会使用 `use-upgrade`；
- [`@use-upgrade/vite-plugin`](https://www.npmjs.com/package/@use-upgrade/vite-plugin) 与 Vite 集成，通过多种方式来控制 `use-upgrade` 的触发行为；
- [`@use-upgrade/webpack-plugin`](https://www.npmjs.com/package/@use-upgrade/webpack-plugin) 与 Webpack 集成，通过多种方式来控制 `use-upgrade` 的触发行为。
