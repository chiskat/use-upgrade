# Agent Skills

`use-upgrade` 提供配套的 [Agent Skills](https://agentskills.io)。<br />
它可以让 AI 编程助手感知到各 API 的存在，理解此工具的用法，理解参数定义，从而更好的利用 `use-upgrade` 带来的能力。

## 安装

::: tip 关于插件
下文中安装的 Agent Skills 也带有 Vite 插件、Webpack 插件的用法。
:::

可从以下两种方式中**任选一种**安装。

### 使用 `npx skills` 安装

这是最常见的 Agent Skills 安装方式。

```bash
npx skills add chiskat/use-upgrade
```

这会使用 Vercel 的 [`skills` CLI](https://skills.sh/docs) 安装，在终端中的交互式菜单中完成配置即可。

### 使用 `skills-npm` 安装

`use-upgrade` 的 npm 包捆绑了 Skills，因此可使用 `skills-npm` 直接提取，这样可以使得 Skills 在项目中持久化，方便其它团队成员共享。

```bash
npm add -D skills-npm
```

然后，修改你的 `package.json`：

```json
{
  "scripts": {
    "prepare": "skills-npm"
  }
}
```

此后，每次安装依赖项后，`skills-npm` 便会自动运行，从 `use-upgrade` 的包中拷贝 Skills 文件。

因此，可以让 Git 忽略掉能自动安装的 Skills，在 `.gitignore` 中添加一行：

```
skills/npm-*
```

具体用法，请参考 [`skills-npm` 文档](https://www.npmjs.com/package/skills-npm)。
