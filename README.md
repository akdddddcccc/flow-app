# 流 · 协作式音乐创作 App

这是从 Figma Make 导出后继续整理的可运行前端。当前包含首页推荐流、筛选、发现、个人页、播放器、创作流版本树、节点详情、续流编辑、草稿与发布反馈。

## 本地运行

```bash
pnpm install
pnpm dev
```

构建静态发布版本：

```bash
pnpm build
```

构建结果在 `dist/`。Vite 使用相对资源路径，可部署在 GitHub Pages 子目录，也可以由作品集网站通过 iframe 引入。

## 作品集嵌入模式

在 App 地址后增加：

```text
?embed=portfolio
```

该模式会移除外层灰色画布、圆角与阴影，让 App 填满作品集提供的容器。手机端始终使用 `100dvh` 真全屏，不显示模拟手机外框。

桌面作品集可使用：

```html
<iframe
  src="https://你的-flow-app-地址/?embed=portfolio"
  title="流 App 交互体验"
  allow="fullscreen"
  loading="lazy"
></iframe>
```

建议由作品集控制 iframe 的桌面尺寸（约 430 × 900），在窄屏下将其切换为固定全屏层。App 加载完成后会向父页面发送：

```js
{ type: "flow-app:ready", version: 1 }
```

## 展示素材

目前缺少正式封面时使用固定纯色色块，不依赖随机网络图片。之后替换项目 `cover` 或用户 `avatar` 即可，不会影响卡片与交互结构。
