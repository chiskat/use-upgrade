# 快速上手

## 安装

::: code-group

```sh [npm]
npm add -D @use-upgrade/webpack-plugin
```

```sh [pnpm]
pnpm add -D @use-upgrade/webpack-plugin
```

```sh [yarn]
yarn add -D @use-upgrade/webpack-plugin
```

```sh [bun]
bun add -D @use-upgrade/webpack-plugin
```

:::

## 常规用法

在 `webpack.config.js` 中引入插件即可：

```typescript
const UseUpgradePlugin = require('@use-upgrade/webpack-plugin')

module.exports = {
  plugins: [new UseUpgradePlugin()],
}
```

默认情况下，插件是**不生效**的，也就是说 `use-upgrade` 在每次网站更新时都会触发。<br />
满足以下任一条件，才会**生效**，跳过某次版本提醒：

### 通过 Git 提交信息

在**最后一次** Git 提交的 message 中包含 `[use-upgrade-skip]`，例如：

```bash
git commit -m "fix: 修复样式问题 [use-upgrade-skip]"
```

### 环境变量

设置环境变量：

```bash
USE_UPGRADE_SKIP = true
```

::: tip 关于 `.env` 文件
通常需要其它工具或插件，才能让 Webpack 读取 `.env` 文件。
:::

## Webpack 命令行参数

在 `webpack build` 时添加 `--use-upgrade-skip` 参数：

```bash
webpack build -- --use-upgrade-skip
```

### 手动开启

```typescript
useUpgradePlugin({ skip: true })
```

## 原理

当上述任一条件满足时，插件会在构建产物的 `index.html` 的 `<head>` 中注入一个 `<meta>` 标签：

```html
<meta name="useUpgradeSkip" />
```

`use-upgrade` 在请求 `index.html` 时，如果发现该标签，就会跳过本次版本更新的回调提醒。

标签的 `name` 可通过 `skipMetaName` 配置项来自定义；修改后，请同时修改 `use-upgrade` 初始化函数中同字段配置项，两边需要保持一致，否则无法正确应用。
