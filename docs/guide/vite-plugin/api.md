# API

## `useUpgradePlugin()`

```typescript
import useUpgradePlugin from '@use-upgrade/vite-plugin'
```

插件工厂函数。

### 函数签名

```typescript
function useUpgradePlugin(options?: UseUpgradePluginOptions): any
```

说明：

- `options` 是可选的配置对象；
- 返回值是插件，提供给 Vite 配置 `plugins` 中。

#### `UseUpgradePluginOptions`

配置项参数 `UseUpgradePluginOptions` 字段：

| 属性                                                     | 类型      | 默认值             | 说明                                                       |
| -------------------------------------------------------- | --------- | ------------------ | ---------------------------------------------------------- |
| `skip`                                                   | `boolean` | `false`            | 工具默认会从 Git 提交信息、环境变量                        |
| 命令行参数等条件判断是否跳过，传入 `true` 则直接启用功能 |
| `skipMetaName`                                           | `string`  | `"useUpgradeSkip"` | 如果 `use-upgrade` 配置了此项，需和 `use-upgrade` 保持一致 |
| `htmlFileName`                                           | `string`  | `"/index.html"`    | 需要注入的 HTML 文件名                                     |
