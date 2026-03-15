# 介绍

<p style="display: flex; gap: 10px;">
  <a href="https://www.npmjs.com/package/@use-upgrade/webpack-plugin"><img src="https://img.shields.io/npm/v/@use-upgrade/webpack-plugin" alt="npm" /></a>
  <a href="https://npmcharts.com/compare/@use-upgrade/webpack-plugin?minimal=true"><img src="https://img.shields.io/npm/dm/@use-upgrade/webpack-plugin.svg?style=flat" alt="npm downloads" /></a>
  <a href="https://bundlejs.com/?q=@use-upgrade/webpack-plugin"><img src="https://deno.bundlejs.com/badge?q=@use-upgrade/webpack-plugin" alt="package size" /></a>
</p>

[`@use-upgrade/webpack-plugin`](https://www.npmjs.com/package/@use-upgrade/webpack-plugin) 是与 `use-upgrade` 配套的 Webpack 插件，让开发者可通过 Git 提交消息、构建命令行参数、环境变量等非侵入式的方式，在网站版本发布时控制 `use-upgrade` 的触发与否。

默认情况下，网站每次发布版本，`use-upgrade` 都会触发回调，提醒用户；<br />
但如果是小型补丁发布，不需要打扰用户，则只能通过注释代码的方式来跳过，非常不方便；此插件提供了更简单、无侵入性的方式，开发者可通过 Git 提交消息、CI/CD 环境变量、构建命令行参数等方式，让这次的版本发布不触发 `use-upgrade`。
