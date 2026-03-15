# 快速上手

## 安装

::: code-group

```sh [npm]
npm add use-upgrade
```

```sh [pnpm]
pnpm add use-upgrade
```

```sh [yarn]
yarn add use-upgrade
```

```sh [bun]
bun add use-upgrade
```

:::

## 常规用法

以 React + AntD 项目举例，在项目入口处例如 `main.tsx` 中添加代码：

```typescript
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

即可完成配置。

以上代码**仅在生产环境**开启 `use-upgrade` 的新版本检测功能，无需任何额外的配置。<br />
检测到网站存在新版本，便会触发回调，展示弹窗提醒用户。

## React Hook 用法

**首先，请确保项目入口处使用过 `startCheckUpgrade()`，否则 Hook 不工作。**

```tsx
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

`use-upgrade` 同样提供 [Vue Hook](/guide/use-upgrade/vue-hook)，用法类似，此处不再赘述。

## 通过 CDN 引入

如果你的项目没有使用 npm 管理依赖，那么可以在 HTML 中引入 UMD 包。

::: code-group

```html [unpkg]
<script src="https://unpkg.com/use-upgrade@__PKG_VERSION__"></script>
```

```html [jsdelivr]
<script src="https://cdn.jsdelivr.net/npm/use-upgrade@__PKG_VERSION__"></script>
```

:::

导入后，通过全局变量 `useUpgrade` 来访问。

::: tip 版本兼容性

通过 `<script>` 标签引入时，建议加上 `@版本号`，通常建议精确到第二位。

`use-upgrade` 在相同 Major 版本号下保持 API 兼容性；在相同 Minor 版本号下不会新增功能；Patch 版本号的变更只包含 bug 修复和文档更新。

:::
