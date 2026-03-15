---
name: use-upgrade
description: use-upgrade 是适用于 Web 的 npm 包，可智能检测网站是否有新版本发布，避免用户在过时的页面停留；它还有配套的 Vite 和 Webpack 插件，允许开发者让某次版本发布避免触发 use-upgrade。
license: MIT
---

# 简介

`use-upgrade` 可以自动检测当前网站是否发布了新版本，并在检测到新版本时触发开发者提供的回调，以此来通知用户或是刷新网页；它还提供了 React 和 Vue 的 hook 便于集成；在重要场景，开发者还可以通过 API 手动触发新版本的检测。

`use-upgrade` 开箱即用，与 Vite、Webpack 等大多数构建系统兼容，无需额外配置

如果某次发布不希望触发回调打扰用户，可使用配套的 Vite 插件 `@use-upgrade/vite-plugin` 或者 Webpack 插件 `@use-upgrade/webpack-plugin`；这些插件会在构建时，通过 Git 提交 message、环境变量、命令行参数等多种来源，判断开发者是否需要跳过本次版本发布时触发 `use-upgrade` 的行为。

---

# `use-upgrade`

## 安装

```bash
npm add use-upgrade
```

## 基本用法

[基本用法](./references/use-upgrade/basic.md)

## 进阶用法

[进阶用法](./references/use-upgrade/advanced.md)

## React Hook 用法

[React Hook 用法](./references/use-upgrade/react-hook.md)

## Vue Hook 用法

[Vue Hook 用法](./references/use-upgrade/vue-hook.md)

## 原理

[原理](./references/use-upgrade/principle.md)

## API 参考

[API 参考](./references/use-upgrade/api.md)

---

# `@use-upgrade/vite-plugin`

## 使用说明

[使用说明](./references/vite-plugin/usage.md)

## API 参考

[API 参考](./references/vite-plugin/api.md)

---

# `@use-upgrade/webpack-plugin`

## 使用说明

[使用说明](./references/webpack-plugin/usage.md)

## API 参考

[API 参考](./references/webpack-plugin/api.md)
