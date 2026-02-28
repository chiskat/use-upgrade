# [`@use-upgrade/webpack-plugin`](https://www.npmjs.com/package/@use-upgrade/webpack-plugin) [![npm](https://img.shields.io/npm/v/@use-upgrade/webpack-plugin)](https://www.npmjs.com/package/@use-upgrade/webpack-plugin)

与 [`use-upgrade`](https://www.npmjs.com/package/use-upgrade) 配套使用的 Webpack 插件；网站每次更新版本都会触发 `use-upgrade` 的回调，此插件让开发者可通过 Git 提交信息、`webpack` 打包命令行参数、环境变量等方式，手动控制 `use-upgrade` 的触发与否，避免过度打扰用户。

```bash
npm add -D @use-upgrade/webpack-plugin
```

# 使用示例

在 `webpack.config.js` 中引入插件即可：

```typescript
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UseUpgradePlugin = require('@use-upgrade/webpack-plugin')

module.exports = {
  plugins: [new HtmlWebpackPlugin(), new UseUpgradePlugin()],
}
```

> 注意：此插件依赖 [`html-webpack-plugin`](https://www.npmjs.com/package/html-webpack-plugin)（>= 5），请确保项目中已安装。

默认情况下，插件是**不生效**的，也就是说 `use-upgrade` 在每次网站更新时都会触发。

开发者需要通过以下任一方式启用：

## 【推荐】通过 Git 提交信息

在最近一次 Git 提交的 message 中包含 `[use-upgrade-skip]`，例如：

```bash
git commit -m "fix: 修复样式问题 [use-upgrade-skip]"
```

## 传参开启

```typescript
new UseUpgradePlugin({ skip: true })
```

## 环境变量

设置环境变量：

```bash
USE_UPGRADE_SKIP = true
```

## Webpack 命令行参数

在 `webpack build` 时添加 `--use-upgrade-skip` 参数：

```bash
webpack build -- --use-upgrade-skip
```

# 原理

当任一跳过条件满足时，插件会在构建产物的 `index.html` 的 `<head>` 中注入一个 `<meta>` 标签：

```html
<meta name="useUpgradeSkip" />
```

`use-upgrade` 在请求 `index.html` 时，如果发现该标签存在，就会跳过本次版本更新的回调提醒。

# API

```typescript
const UseUpgradePlugin = require('@use-upgrade/webpack-plugin')
```

## `new UseUpgradePlugin(options?)`

| 属性           | 类型      | 默认值             | 说明                                                       |
| -------------- | --------- | ------------------ | ---------------------------------------------------------- |
| `skip`         | `boolean` | `false`            | 是否跳过本次版本更新回调                                   |
| `skipMetaName` | `string`  | `"useUpgradeSkip"` | 如果 `use-upgrade` 配置了此项，需和 `use-upgrade` 保持一致 |
| `htmlFileName` | `string`  | `"index.html"`     | 需要注入的 HTML 文件名                                     |
