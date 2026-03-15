# 进阶用法

## 参数重载

核心函数 `startCheckUpgrade` 有多种参数重载：

```typescript
function startCheckUpgrade()
function startCheckUpgrade(options: object)
function startCheckUpgrade(callback: Function)
function startCheckUpgrade(callback: Function, options: object)
```

配置项和回调函数都是可选的，可以都不提供，也可以都提供；<br />
但两项都提供时**参数顺序**必须正确。

## 获取新版本详细信息

`use-upgrade` 调用回调时，会提供一些额外信息作为回调参数。

```typescript
startCheckUpgrade(details => {
  console.log('当前版本哈希：', details.currentVersionHash)
  console.log('最新版本哈希：', details.newVersionHash)
  console.log('页面是否可见：', details.visible)
})
```

开发者可通过这些信息，设计对应的 UI 或处理逻辑。

## 调整触发频率

`use-upgrade` 会按照特定时间间隔触发版本检查。

::: code-group

```typescript [自定义间隔]
startCheckUpgrade({
  checkInterval: 0.5 * 60 * 1000, // 默认每 30 秒一次 [!code highlight]
})
```

```typescript [关闭定时触发]
startCheckUpgrade({
  checkInterval: 0, // 设为 0 会取消定时检查 [!code highlight]
})
```

:::

---

为了避免网络开销过大，请求 `index.html` 使用独立的时间间隔配置，默认间隔较长。

::: code-group

```typescript [请求时间间隔]
startCheckUpgrade({
  fetchInterval: 5 * 60 * 1000, // 默认每 5 分钟一次 [!code highlight]
})
```

```typescript [关闭自动请求]
startCheckUpgrade({
  fetchInterval: 0, // 设为 0 后，不再发出请求，需用户手动触发 [!code highlight]
})
```

:::

## 调整触发器

`use-upgrade` 会在特定的时机触发检查：

- 导航路由后；
- 页面可见度由 “不可见” 变为 “可见”；
- 页面网络状况由 “离线” 变为 “在线”。

这些触发可通过配置项关闭：

::: code-group

```typescript [关闭导航路由触发]
startCheckUpgrade({
  disablePageRouteEmitter: true, //  [!code highlight]
})
```

```typescript [关闭页面可见度触发]
startCheckUpgrade({
  disablePageVisibleEmitter: true, // [!code highlight]
})
```

```typescript [关闭网络状况变更触发]
startCheckUpgrade({
  disablePageReonlineEmitter: true, // [!code highlight]
})
```

:::

## 自定义行为

`use-upgrade` 的工作流程中，以下部分可以由开发者自定义：

- 计算 `index.html` 的 URL；
- 使用上一步的 URL，发起网络请求获取 HTML 全文；
- 使用上一步的 HTML 全文，计算版本哈希值。

通过以下配置项来定制：

::: code-group

```typescript [获取 URL]
// 支持字符串、函数、异步函数
// 配置此项后，"basename" / "disableTimestamp" 配置项不起作用
startCheckUpgrade({
  overrideHtmlUrl: 'https://example.com/index.html', //  [!code highlight]
  overrideHtmlUrl: () => 'https://example.com/index.html', //  [!code highlight]
  overrideHtmlUrl: async () => Promise.resolve('https://example.com/index.html'), //  [!code highlight]
})
```

```typescript [请求 HTML]
startCheckUpgrade({
  overrideFetchHTML: async url => Promise.resolve('<!doctype html>'), //  [!code highlight]
})
```

```typescript [计算哈希]
startCheckUpgrade({
  overrideCalcVersionHash: async html => Promise.resolve('b5dd354f'), //  [!code highlight]
})
```

:::
