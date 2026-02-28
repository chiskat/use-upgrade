# AGENTS.md

> `use-upgrade` 项目的开发指南 - 为 AI 编程助手提供项目上下文和开发规范。

# 项目概述

这是一个 monorepo 项目，使用 Lerna + pnpm 管理多个 npm 包，提供自动检测网站新版本的功能。

各个包位于 `/packages/*` 中：：

- **use-upgrade**: 核心包，用于自动检测 SPA 网站是否发布了新版本，支持 React、Vue、Svelte、Angular 等框架
- **@use-upgrade/vite-plugin**: 配套的 Vite 插件，注入 HTML 标签从而提供跳过版本号检测的功能
- **@use-upgrade/webpack-plugin**: 配套的 Webpack 插件，注入 HTML 标签从而提供跳过版本号检测的功能

# 常用命令

```bash

pnpm -F <包名> format        # 使用 Prettier 检查某个包
pnpm -F <包名> lint          # 使用 ESLint 检查某个包
pnpm -F <包名> check-types   # 使用 tsc 检查某个包
pnpm -F <包名> test          # 适应 Vitest 运行某个包的测试用例
pnpm -F <包名> test <文件名>  # 使用 Vitest 运行某个包中特定文件名的测试用例
```

# 开发规范

- 使用 TypeScript 开发，使用 Rollup 打包编译，使用 Vitest 运行测试
- 所有对外暴露的函数、参数（包括回调函数中的参数）、类型，都必须提供完整的 JSDoc 注释
- 所有对外暴露的函数，都必须有测试用例，测试用例要尽可能覆盖每种配置项
- 子包目录 `./test` 下的测试用例文件，目录结构和 `./src` 下的源码需保持相同，文件名也相同，但测试文件额外添加 `.test` 后缀，测试需要用到模拟文件放置在 `./fixture` 目录
- 所有 `.ts` 代码都需要通过 Prettier、ESLint、tsc 的检查

# `use-upgrade` 工作原理

- 状态存储分为页面状态（`pageState.ts`）和持久存储（`storageState.ts`），持久存储是通过 `localStorage` 存储的，可以跨页面访问
- 定期请求 `index.html` 解析全文并计算哈希值，存储在持久存储的 `remoteHash` 中
- 网页运行期间，会通过各种触发器频繁触发 Check，检查页面状态中的哈希和持久存储中的哈希值，只要两者不同，则表示网站版本有更新，触发用户提供的回调函数
- 虽然会频繁触发 Check，但不会频繁触发请求，每两次请求都需要等待一定间隔时间（`fetchInterval`）
- 请求期间，会通过持久存储的 `pending` 来作为锁，避免多个页面同时触发请求
- 某页面触发回调后，会设置 `triggered` 记住触发过的版本哈希，避免在相同版本哈希下重复触发回调
- 允许用户通过 `triggerCheckUpgrade()` 手动触发比较，还可以通过参数强制要求发出请求
- 支持跳过特定版本的检测，只要在请求得到的 HTML 全文中发现 `<meta name="useUpgradeSkip">` 标签，便会跳过这次的更新回调提醒

# `@use-upgrade/vite-plugin` 和 `@use-upgrade/webpack-plugin` 的工作原理

- 只要用户提供参数，便会在输出的 `index.html` 中插入 `<meta name="useUpgradeSkip">` 标签
- 为了方便在 CI/CD 中集成，还可以通过环境变量、打包时的命令行参数、Git 提交信息来开启
