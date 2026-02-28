# [`@use-upgrade/vite-plugin`](https://www.npmjs.com/package/@use-upgrade/vite-plugin) [![npm](https://img.shields.io/npm/v/@use-upgrade/vite-plugin)](https://www.npmjs.com/package/@use-upgrade/vite-plugin)

与 [`use-upgrade`](https://www.npmjs.com/package/use-upgrade) 配套使用的 Vite 插件；网站每次更新版本都会触发 `use-upgrade` 的回调，此插件让开发者可通过 Git 提交信息、`vite` 打包命令行参数、环境变量等方式，手动控制 `use-upgrade` 的触发与否，避免过度打扰用户。

```bash
npm add -D @use-upgrade/vite-plugin
```

# 使用示例

在 `vite.config.ts` 中引入插件即可：

```typescript
import useUpgradePlugin from '@use-upgrade/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [useUpgradePlugin()],
})
```

默认情况下，插件是**不生效**的，也就是说 `use-upgrade` 在每次网站更新时都会触发。

开发者需要通过以下任一方式启用：

## 【推荐】通过 Git 提交信息

在最近一次 Git 提交的 message 中包含 `[use-upgrade-skip]`，例如：

```bash
git commit -m "fix: 修复样式问题 [use-upgrade-skip]"
```

## 传参开启

```typescript
useUpgradePlugin({ skip: true })
```

## 环境变量

设置环境变量：

```bash
USE_UPGRADE_SKIP = true
```

注意：Vite 在启动阶段（也包括加载此插件时）是不读取 `.env` 的，如果这个环境变量写在 `.env` 里，那么需要用 [`loadEnv()`](https://cn.vite.dev/config/#using-environment-variables-in-config) 才能读取到。

## Vite 命令行参数

在 `vite build` 时添加 `--use-upgrade-skip` 参数：

```bash
vite build -- --use-upgrade-skip
```

# 原理

当任一跳过条件满足时，插件会在构建产物的 `index.html` 的 `<head>` 中注入一个 `<meta>` 标签：

```html
<meta name="useUpgradeSkip" />
```

`use-upgrade` 在请求 `index.html` 时，如果发现该标签存在，就会跳过本次版本更新的回调提醒。

# API

```typescript
import useUpgradePlugin from '@use-upgrade/vite-plugin'
```

## `useUpgradePlugin(options?)`

| 属性           | 类型      | 默认值             | 说明                                                       |
| -------------- | --------- | ------------------ | ---------------------------------------------------------- |
| `skip`         | `boolean` | `false`            | 是否跳过本次版本更新回调                                   |
| `skipMetaName` | `string`  | `"useUpgradeSkip"` | 如果 `use-upgrade` 配置了此项，需和 `use-upgrade` 保持一致 |
| `htmlFileName` | `string`  | `"/index.html"`    | 需要注入的 HTML 文件名                                     |
