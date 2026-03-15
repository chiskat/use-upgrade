# 基础用法

导入核心函数 `startCheckUpgrade()` 即可实现完整功能。

```typescript
import { startCheckUpgrade } from 'use-upgrade'
```

## 最简用例

建议将这段代码放置于项目入口，确保一定被执行到：

```typescript
import { startCheckUpgrade } from 'use-upgrade'

if (process.env.NODE_ENV === 'production') {
  startCheckUpgrade(() => {
    console.log('检测到新版本！')
  })
}
```

只要检测到网站有新版本，就会触发回调，在控制台打印内容。

::: tip 环境区分
开发模式中 HTML 可能会频繁被修改，因此通过 `process.env.NODE_ENV` 判断仅在生产环境生效。<br />
这样可以避免开发时频繁触发回调，影响开发者。

为保持文档简洁，后续示例中，这个判断逻辑均省略。
:::

## 网站部署在子路径

如果网站部署在子路径上，需要把子路径名通过 `basename` 提供给本工具：

::: code-group

```typescript [Vite]
import { startCheckUpgrade } from 'use-upgrade'

startCheckUpgrade(callback, {
  basename: import.meta.env.BASE_URL, // [!code highlight]
})
```

```typescript [Create-React-App]
import { startCheckUpgrade } from 'use-upgrade'

startCheckUpgrade(callback, {
  basename: process.env.PUBLIC_URL, // [!code highlight]
})
```

```typescript [Vue CLI]
import { startCheckUpgrade } from 'use-upgrade'

startCheckUpgrade(callback, {
  basename: process.env.BASE_URL, // [!code highlight]
})
```

```typescript [字符串]
import { startCheckUpgrade } from 'use-upgrade'

startCheckUpgrade(callback, {
  basename: '/path', // [!code highlight]
})
```

:::

如上述例子一样，大部分构建工具会把子目录作为环境变量注入，无需开发者自行拼写。

## 跳过新版本提示

推荐配合 [Vite 插件](/guide/vite-plugin/introduction) 或者 [Webpack 插件](/guide/webpack-plugin/introduction)，可通过 Git 提交消息等方式无侵入式管理 `use-upgrade` 新版本提醒。

如果不使用插件，则可暂时注释掉 `startCheckUpgrade()`，后续再还原。

## 手动触发检查

`use-upgrade` 提供了手动触发检查的 API，可以让开发者在特定时机主动检查是否存在新版本，避免重要页面出现过时问题。

::: code-group

```typescript [本地检查]
import { triggerCheckUpgrade } from 'use-upgrade'

triggerCheckUpgrade()
```

```typescript [本地+远程检查]
import { triggerCheckUpgrade } from 'use-upgrade'

triggerCheckUpgrade({
  fetch: true, // [!code highlight]
})
```

```typescript [重复触发]
import { triggerCheckUpgrade } from 'use-upgrade'

triggerCheckUpgrade({
  duplicate: true, // 即使当前版本过时，已触发过回调，也要重复触发 [!code highlight]
})
```

:::

为了确保版本检查始终能拉取最新 `index.html`，建议手动触发检查时加上 `fetch: true` 参数。

## 取消实例

```typescript
import { cancelCheckUpgrade } from 'use-upgrade'

cancelCheckUpgrade()
```

这将终止**当前页面**的实例，如果有多个浏览器 Tab 页，则开发者需手动处理其它 Tab 页的实例。
