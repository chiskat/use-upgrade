# React Hook

```typescript
import { useUpgrade } from 'use-upgrade/react'
```

在 React 项目中使用 `use-upgrade` 时，可以使用 Hook API，获取响应式能力。

## 初始化

首先需要在项目入口处，先初始化 `use-upgrade` 实例：

```typescript
import { startCheckUpgrade } from 'use-upgrade'

if (process.env.NODE_ENV === 'production') {
  startCheckUpgrade()
}
```

::: tip 重要提示
必须做这一步，否则 Hook 不工作。
:::

## 注册副作用

在页面中注册副作用：

```typescript
import { useUpgrade } from 'use-upgrade/react'

export default function Page() {
  useUpgrade(() => {
    console.log('发现新版本')
  })
}
```

此后，只要检测到版本更新，便会触发回调。

## 获取版本状态

在页面中获取版本状态：

```tsx
import { useUpgrade } from 'use-upgrade/react'

export default function Page() {
  const hasNewVersion = useUpgrade()

  return <div>是否有新版本：{hasNewVersion ? '是' : '否'}</div>
}
```

此时便可在页面中显示例如 “更新提示” 等 UI。
