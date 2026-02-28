# use-upgrade

> 这是一个 monorepo 仓库，包含了 `use-upgrade` 和与它相关的包。

## [`use-upgrade`](https://www.npmjs.com/package/use-upgrade) [![npm](https://img.shields.io/npm/v/use-upgrade)](https://www.npmjs.com/package/use-upgrade)

自动检测网站是否已发布了新版本，调用你的回调，以提醒用户刷新。

它兼容 `React`（`Next.js`、`Vite`、`Umi.js`、`CRA`）、`Vue`（`Vite`、`Vue CLI`、`Nuxt.js`）、`Angular`、`Svelte`、`Taro` 等开发框架和库，使用简单，功能完善。

## [`@use-upgrade/vite-plugin`](https://www.npmjs.com/package/@use-upgrade/vite-plugin) [![npm](https://img.shields.io/npm/v/@use-upgrade/vite-plugin)](https://www.npmjs.com/package/@use-upgrade/vite-plugin)

同 `use-upgrade` 配套使用的 Vite 插件，可通过传参、环境变量、命令行参数、Git 提交信息等方式，控制此工具的启用与否，让你的某次版本发布不会触发 `use-upgrade` 的回调，避免过度打扰用户。

## [`@use-upgrade/webpack-plugin`](https://www.npmjs.com/package/@use-upgrade/webpack-plugin) [![npm](https://img.shields.io/npm/v/@use-upgrade/webpack-plugin)](https://www.npmjs.com/package/@use-upgrade/webpack-plugin)

同 `use-upgrade` 配套使用的 Webpack 插件，可通过传参、环境变量、命令行参数、Git 提交信息等方式，控制此工具的启用与否，让你的某次版本发布不会触发 `use-upgrade` 的回调，避免过度打扰用户。
