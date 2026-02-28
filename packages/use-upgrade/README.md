# `use-upgrade` [![npm](https://img.shields.io/npm/v/use-upgrade)](https://www.npmjs.com/package/use-upgrade)

自动检测网站是否已发布了新版本，调用你的回调，以提醒用户刷新。

```bash
npm add use-upgrade
```

# 简介

只需要在项目入口处添加一行 `startCheckUpgrade(callback)` 即可自动开始检测新版本，一旦有新版本发布，便会调用回调 `callback`。

`use-upgrade` 的亮点：

- 兼容 `Vite`、`Next.js`、`Nuxt.js`、`Svelte`、`Angular`、`Umi`、`Create-React-App`、`Taro` 等项目，如有需求还可以自行拓展；
- 无需改动后端或服务器，大多数情况都能零配置使用；
- 低网络开销，网页处在后台或是多标签页等场景也不会浪费网络资源；
- 配置项丰富，几乎所有行为都能定制；
- 对于 React、Vue 项目，提供 hooks 以获得响应式能力。

每次版本更新都要提醒用户，不太灵活，想自由控制？—— 推荐使用配套的 Vite 或 Webpack 插件，它可以：

- 可按需跳过 `use-upgrade` 的检测，这样微型版本发布时，可不必打扰用户；
- 可根据打包命令参数、Git 提交 message、环境变量等多种方式判断是否需跳过检测，CI/CD 集成更方便；
- Vite 插件：[`@use-upgrade/vite-plugin`](https://www.npmjs.com/package/@use-upgrade/vite-plugin) [![npm](https://img.shields.io/npm/v/@use-upgrade/vite-plugin)](https://www.npmjs.com/package/@use-upgrade/vite-plugin)
- Webpack 插件： [`@use-upgrade/webpack-plugin`](https://www.npmjs.com/package/@use-upgrade/webpack-plugin) [![npm](https://img.shields.io/npm/v/@use-upgrade/webpack-plugin)](https://www.npmjs.com/package/@use-upgrade/webpack-plugin)

# 使用示例

只需要在项目启动入口处调用方法即可：

```jsx
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

这样就完成了。只要网站发布了新版本，工具检测到后，就会调用回调弹窗提醒。

开发环境下，网站内容一直在更改，会导致频繁触发回调，因此上述示例中添加了 `process.env.NODE_ENV` 判断条件。

## 网站部署在子目录

如果网站部署在子目录上，需要把子目录名通过 `basename` 提供给本工具：

```jsx
startCheckUpgrade(
  () => {
    // ... 省略
  },

  // ↓ 此参数，这里以 vite 项目为例
  { basename: import.meta.env.BASE_URL }
)
```

一般来说，打包工具会提供一个环境变量表示子目录，所以 `basename` 不需要写死成字符串

- 对于 Vite 项目，通过 `import.meta.env.BASE_URL` 取得；
- 对于 Create-React-App 项目，通过 `process.env.PUBLIC_URL` 取得。

## 在 React 项目中使用

通过 `use-upgrade/react` 提供一个 `useUpgrade()`，它接受一个函数作为检测到新版本后的回调，且返回一个布尔值表示是否有新版本。

**注意，必须调用过 `startCheckUpgrade()`，此 hook 才能生效。**

使用示例：

```jsx
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

## 在 Vue 项目中使用

通过 `use-upgrade/vue` 提供一个 `useUpgrade()`，它接受一个函数作为检测到新版本后的回调，且返回一个 `Ref<boolean>` 表示是否有新版本。

**注意，必须调用过 `startCheckUpgrade()`，此 hook 才能生效。**

使用示例：

```vue
<script setup>
import { useUpgrade } from 'use-upgrade/vue'

// 用法一： 注册一个发现新版本时会触发的回调
useUpgrade(() => {
  console.log('发现新版本')
})

// 用法二： 使用返回值，表示当前是否检测到存在新版本
const hasNewVersion = useUpgrade()
</script>

<template>
  <div>是否有新版本：{{ hasNewVersion ? '是' : '否' }}</div>
</template>
```

# 进阶使用

`startCheckUpgrade()` 有多种重载：

直接调用，以默认配置运行：

```jsx
startCheckUpgrade()
```

提供一个回调，会在检测到新版本时执行它：

```jsx
startCheckUpgrade(() => {
  Modal.info({ title: '系统已更新' })
})
```

提供一个配置对象：

```jsx
startCheckUpgrade({
  // 在 localStorage 中存储的 KEY 名
  storageKey: 'myapp.update-check',

  // 网站如果部署在子目录上，请提供子目录路径
  basename: process.env.PUBLIC_URL,

  // ...
  // 更多参数请见下方 API 文档
})
```

既提供回调，又提供配置项：

```jsx
// 两个参数顺序不能错
startCheckUpgrade(
  () => {
    Modal.info({ title: '系统已更新' })
  },
  {
    storageKey: 'myapp.update-check',
    basename: process.env.PUBLIC_URL,
    // ...
  }
)
```

# 原理与解释

## 旧版工作原理 (v0.x)

SPA 项目只要是使用打包器，就一定会存在一个 “主 chunk” 并插入到 `index.html` 中，格式形如 `<script defer="defer" src="/static/js/main.b5dd354f.js"></script>`。

注意这里的文件名 `main.b5dd354f.js`，其中 `main` 是 chunk 名，后面的 `b5dd354f` 为文件哈希；我们需要的是主 chunk，因为只要项目中任一文件发生变动，主 chunk 的哈希值一定会发生变化；不同的打包器输出的主 chunk 名各不相同，例如有的叫 `main`，有的叫 `app`，有的叫 `main-app`；本工具内置了大多数打包器的主 chunk 名，因此零配置适配大部分网站。

只要定期拉取最新的 `index.html`，使用正则表达式等方式提取出最新的主 chunk 的哈希，并与当前页面中的主 chunk 哈希进行比对，即可判断站点是否有新版本发布。

## 新版工作原理 (v1)

考虑到构建工具会持续更新，本工具不可能覆盖到所有新出的工具；而且 Next.js 新版使用 Turbo 构建时，已经没有 “主 chunk” 这一概念了，上述方法已经无法检测到 Next.js 项目的子页面更新。

因此，新版采用以下策略：不再尝试寻找 “主 chunk”，而是直接解析整个 `index.html` 并根据全文计算出哈希，这样兼容性更好。

## 如何避免 `index.html` 被缓存

推荐网站配置 Nginx，避免 `index.html` 这个文件被缓存。

配置方式示例：

```nginx
location / {
  alias /path/to/your/website;
  try_files $uri @my-website;
  index index.html;
}

location @my-website {
  root /path/to/your/website;
  try_files /index.html =404;
  add_header Cache-Control "private, no-cache, max-age=0";
}
```

注：本工具在请求 `index.html` 时会加上时间戳作为查询参数，避免拉取到旧的文件；你可以通过 `disableTimestamp` 配置项来禁用此行为。

# API 文档

## `startCheckUpgrade()`

```typescript
import { startCheckUpgrade } from 'use-upgrade'
```

启动站点新版本检测。建议在项目入口处就直接调用，开启主功能。

使用说明：

- 参数支持回调函数 和/或 一个配置对象；
- 全局仅会运行一个实例，重复调用会取消前一次的实例。

此函数的重载：

```typescript
async function startCheckUpgrade(): Promise<void>
async function startCheckUpgrade(options: CheckUpgradeOptions): Promise<void>
async function startCheckUpgrade(callback: UseUpgradeCallback): Promise<void>
async function startCheckUpgrade(callback: UseUpgradeCallback, options: CheckUpgradeOptions): Promise<void>
```

---

参数 `callback` 是回调函数，检测到网站有新版本发布后，会调用此函数。

回调函数签名：

```typescript
function UseUpgradeCallback({ currentVersionHash, newVersionHash, visible }): void
```

回调参数字段解释：

| 属性                 | 说明                       | 类型      |
| -------------------- | -------------------------- | --------- |
| `currentVersionHash` | 当前（旧）版本 hash        | `string`  |
| `newVersionHash`     | 远程（新）版本 hash        | `string`  |
| `visible`            | 触发回调时当前页面是否可见 | `boolean` |

---

参数 `options` 是可选的配置项，支持的字段：

| 属性                         | 类型                                          | 默认值                              | 说明                                                                                               |
| ---------------------------- | --------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `storageKey`                 | `string`                                      | `"useUpgrade"`                      | 本地 localStorage 使用的 Key                                                                       |
| `basename`                   | `string`                                      | -                                   | 如果网站部署在子目录（subpath）上，传入此参数表示子目录                                            |
| `checkInterval`              | `number`                                      | `0.5 * 60 * 1000`                   | 本地新版本检查的间隔时间（毫秒），若为 `0` 则停止本地检查                                          |
| `fetchInterval`              | `number`                                      | `5 * 60 * 1000`                     | 请求 `index.html` 的间隔时间（毫秒），若为 `0` 则停止请求                                          |
| `skipMetaName`               | `string \| null`                              | `"useUpgradeSkip"`                  | 新的 html 中如果存在带有此 name 属性的 `<meta>` 标签，则跳过本次版本更新，设为 `null` 可关闭此功能 |
| `disableTimestamp`           | `boolean`                                     | `false`                             | 是否在请求 index.html 时禁用添加时间戳                                                             |
| `disablePageVisibleEmitter`  | `boolean`                                     | `false`                             | 是否禁用网站切换到前台时自动检查                                                                   |
| `disablePageReonlineEmitter` | `boolean`                                     | `false`                             | 是否禁用网站从离线切换到在线时自动检查                                                             |
| `disablePageRouteEmitter`    | `boolean`                                     | `false`                             | 是否禁用网站路由导航时自动检查                                                                     |
| `overrideHtmlUrl`            | `string \| (() => string \| Promise<string>)` | `window.location.origin + basename` | 覆写请求 index.html 的 url，配置此项会使 `basename`、`disableTimestamp` 配置项失效                 |
| `overrideFetchVersionHash`   | `(fetchURL: string) => Promise<string>`       | -                                   | 覆写拉取 index.html 并计算 hash 的方法                                                             |

## React hook `useUpgrade`

```typescript
import { useUpgrade } from 'use-upgrade/react'
```

用于 React 的 hook 函数，既可以获知当前是否有新版本，也可以用于注册收到新版本时的副作用。

函数签名：

```typescript
function useUpgrade(callback?: () => void): boolean
```

- 返回 `boolean` 表示当前是否检测到了新版本；
- 可选参数 `upgradeEffect` 是一个可选的回调函数，如果检测到新版本，会调用此回调；
- **必须先调用过 `startCheckUpgrade()`，此 hook 才起作用。**

## Vue hook `useUpgrade`

```typescript
import { useUpgrade } from 'use-upgrade/vue'
```

用于 Vue 的 hook 函数，既可以获知当前是否有新版本，也可以用于注册收到新版本时的副作用。

函数签名：

```typescript
function useUpgrade(callback?: () => void): Ref<boolean>
```

- 返回 `Ref<boolean>` 表示当前是否检测到了新版本；
- 可选参数 `upgradeEffect` 是一个可选的回调函数，如果检测到新版本，会调用此回调；
- **必须先调用过 `startCheckUpgrade()`，此 hook 才起作用。**

## `triggerCheckUpgrade`

```typescript
import { triggerCheckUpgrade } from 'use-upgrade'
```

立即触发新版本的检测。可通过参数强制本次检查发出请求，或在已触发过回调的情况下重复提示。

函数签名：

```typescript
function triggerCheckUpgrade(options?: TriggerCheckUpgradeOptions): void

interface TriggerCheckUpgradeOptions {
  fetch?: boolean
  duplicate?: boolean
}
```

可选参数 `options` 的字段：

| 属性        | 类型      | 默认值  | 说明                                         |
| ----------- | --------- | ------- | -------------------------------------------- |
| `fetch`     | `boolean` | `false` | 本次检查是否请求 `index.html`                |
| `duplicate` | `boolean` | `false` | 检查到的新版本如果已触发过回调，是否重复触发 |

## `cancelCheckUpgrade`

```typescript
import { cancelCheckUpgrade } from 'use-upgrade'
```

调用后，停止**当前页面**的 `use-upgrade` 实例。后续可通过调用 `startCheckUpgrade()` 重新开启。
