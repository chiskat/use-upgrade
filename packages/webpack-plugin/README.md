# `@use-upgrade/webpack-plugin`

与 [`use-upgrade`](https://www.npmjs.com/package/use-upgrade) 配套使用的 Webpack 插件；网站每次更新版本都会触发 `use-upgrade` 的回调，此插件让开发者可通过 Git 提交信息、`webpack` 打包命令行参数、环境变量等方式，手动控制 `use-upgrade` 的触发与否，避免过度打扰用户。

# 文档

[在线文档](https://use-upgrade.paperplane.cc/guide/webpack-plugin/introduction)

# 使用示例

在 `webpack.config.js` 中引入插件即可：

```typescript
const UseUpgradePlugin = require('@use-upgrade/webpack-plugin')

module.exports = {
  plugins: [new UseUpgradePlugin()],
}
```

插件安装后，默认是不启用的，此时发布新版本时 `use-upgrade` 仍然会正常生效。

如果某次版本发布不想触发 `use-upgrade`，则在 Git 提交的 message 中包含 `[use-upgrade-skip]`，例如：

```bash
git commit -m "fix: 修复样式问题 [use-upgrade-skip]"
```

那么本次发布便不会触发用户网站端的 `use-upgrade`，避免打扰用户。

除了 Git 提交 message 之外，还支持环境变量、命令行参数等方式，具体可参考 [在线文档](https://use-upgrade.paperplane.cc/guide/webpack-plugin/usage)。
