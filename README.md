# use-upgrade [![Build Status](https://drone.paperplane.cc/api/badges/chiskat/use-upgrade/status.svg)](https://drone.paperplane.cc/chiskat/use-upgrade)

> 这是一个 monorepo 仓库，包含了 `use-upgrade` 和与它相关的包。

## `use-upgrade` [![npm](https://img.shields.io/npm/v/use-upgrade)](https://www.npmjs.com/package/use-upgrade)

自动检测网站是否已发布了新版本，调用你的回调，以提醒用户刷新。  
它兼容 `React`（`Next.js`、`Umi.js`、`Vite`、`CRA`）、`Vue`（`Vite`、`Vue CLI`、`Nuxt.js`）、`Taro`、`Angular` 等开发框架和库，使用简单，功能完善。

[查看文档](./packages/use-upgrade/README.md)

## `use-upgrade-webpack-plugin` [![npm](https://img.shields.io/npm/v/use-upgrade-webpack-plugin)](https://www.npmjs.com/package/use-upgrade-webpack-plugin)

配合 `use-upgrade` 使用的 Webpack 插件，令开发者可以手动跳过某次版本更新的提示。

[查看文档](./packages/use-upgrade-webpack-plugin/README.md)

## `vite-plugin-use-upgrade` [![npm](https://img.shields.io/npm/v/vite-plugin-use-upgrade)](https://www.npmjs.com/package/vite-plugin-use-upgrade)

配合 `use-upgrade` 使用的 Vite 插件，令开发者可以手动跳过某次版本更新的提示。

[查看文档](./packages/vite-plugin-use-upgrade/README.md)
