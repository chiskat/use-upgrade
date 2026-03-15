# API

## `startCheckUpgrade()`

```typescript
import { startCheckUpgrade } from 'use-upgrade'
```

启动实例，开始检测是否有新版本发布。

说明：

- 支持的参数中，回调、配置项均为可选，可以一同提供，一同提供时顺序必须正确；
- 只能单例运行，重复调用时会自动取消旧的实例；
- 可使用 `cancelCheckUpgrade()` 取消实例。

### 函数签名

```typescript
async function startCheckUpgrade(): Promise<void>
async function startCheckUpgrade(options: CheckUpgradeOptions): Promise<void>
async function startCheckUpgrade(callback: UseUpgradeCallback): Promise<void>
async function startCheckUpgrade(callback: UseUpgradeCallback, options: CheckUpgradeOptions): Promise<void>
```

说明：

- `callback` 是回调函数，检测到新版本时，会调用它，并把一些信息作为参数；
- `options` 是配置项对象，可以定制各种行为；
- 无返回值，但可以 `await` 等待初始化完成。

#### `UseUpgradeCallback`

```typescript
function UseUpgradeCallback({ currentVersionHash, newVersionHash, visible }): void
```

回调参数字段解释：

| 属性                 | 说明                       | 类型      |
| -------------------- | -------------------------- | --------- |
| `currentVersionHash` | 当前（旧）版本 hash        | `string`  |
| `newVersionHash`     | 远程（新）版本 hash        | `string`  |
| `visible`            | 触发回调时当前页面是否可见 | `boolean` |

#### `CheckUpgradeOptions`

配置项参数 `CheckUpgradeOptions` 字段：

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
| `overrideFetchHTML`          | `(fetchURL: string) => Promise<string>`       | -                                   | 覆写拉取 HTML 的方法，接收原本将要请求的 URL，返回 HTML 全文                                       |
| `overrideCalcVersionHash`    | `(html: string) => Promise<string> \| string` | -                                   | 覆写计算版本 hash 的方法，接收 HTML 全文，返回自定义的 hash 值                                     |

## React Hook `useUpgrade()`

```typescript
import { useUpgrade } from 'use-upgrade/react'
```

在 React 中订阅新版本检测，还能响应式的获取新版本状态。

::: tip 重要提醒
项目入口处必须先调用过 `startCheckUpgrade()`，此 hook 才能生效。
:::

### 函数签名

```typescript
function useUpgrade(callback?: () => void): boolean
```

说明：

- `callback` 是回调函数，检测到新版本时，会调用此回调；
- 返回值表示是否存在新版本。

## Vue Hook `useUpgrade()`

```typescript
import { useUpgrade } from 'use-upgrade/vue'
```

在 Vue 中订阅新版本检测，还能响应式的获取新版本状态。

::: tip 重要提醒
项目入口处必须先调用过 `startCheckUpgrade()`，此 hook 才能生效。
:::

### 函数签名

```typescript
function useUpgrade(callback?: () => void): Ref<boolean>
```

说明：

- `callback` 是回调函数，检测到新版本时，会调用此回调；
- 返回值是一个包装过的布尔 Ref，表示是否存在新版本。

## `triggerCheckUpgrade()`

```typescript
import { triggerCheckUpgrade } from 'use-upgrade'
```

手动触发新版本检测。

可通过参数控制是否必须发出请求，以及是否在新版本已经触发过回调的情况下强行重复触发。

### 函数签名

```typescript
function triggerCheckUpgrade(options?: TriggerCheckUpgradeOptions): void
```

说明：

- `options` 是可选的配置项；
- 无返回值。

#### `TriggerCheckUpgradeOptions`

配置项参数 `TriggerCheckUpgradeOptions` 字段：

| 属性        | 类型      | 默认值  | 说明                                         |
| ----------- | --------- | ------- | -------------------------------------------- |
| `fetch`     | `boolean` | `false` | 本次检查是否请求 `index.html`                |
| `duplicate` | `boolean` | `false` | 检查到的新版本如果已触发过回调，是否重复触发 |

## `cancelCheckUpgrade()`

```typescript
import { cancelCheckUpgrade } from 'use-upgrade'
```

取消当前页面的示例。

### 函数签名

```typescript
function cancelCheckUpgrade(): void
```
