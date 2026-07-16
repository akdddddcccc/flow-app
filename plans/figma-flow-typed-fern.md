# Flow / 流 — 第一轮体验修复计划（7 项）

## Context

完整重构已完成（数据层、版本树、续流编辑器、所有页面）。本轮聚焦 7 项真实体验问题的定向修复，**不改变未涉及的页面和功能**。

用户要的是一个协作式音乐创作 App 的**核心机制**：一段音乐从「灵感碎片 → 源 → 多人续作 → 多个完成版本」的过程，保存成**可追溯、可分支、绝不覆盖原作的版本树**。用户已明确：**第一版只把「创作流版本树 Flow Map + 续流编辑器 Continue Flow」这一核心体验做到精，其他页面做到最简即可跑通主路径。**

预期成果：可真实交互、可继续开发、移动端优先（基准 390px、桌面居中不铺满）的原型；数据走独立数据层 + Local Storage，预留后端接口；主路径可端到端验证：首页 → 详情 → 创作流 → 选节点 → 续流 → 发布 → 新节点出现在正确父节点下且父节点数据不变。

现有实现将被**大幅重构替换**：保留 `components/figma/ImageWithFallback.tsx` 与 `components/ui/*`；重写 `data.ts`、`FlowGraph.tsx`、`App.tsx` 及各 screen。

## 视觉与图标硬约束

品牌色写成 CSS token（在 `src/styles/theme.css` 追加 `:root` 变量，不动既有 token）：
`--flow-blue:#2748EE; --flow-yellow:#FFEC00; --flow-red:#FE5151; --flow-gray:#E5E5E5; --flow-warm:#F8F8F5;` 次级文字用 `rgba(0,0,0,0.64)`。大面积白、克制黑字、圆角卡片、圆润胶囊按钮；内容封面可多彩，UI 框架保持简洁。

**图标复用真实 Figma 字形**（禁止 emoji / 通用 lucide 冒充节点图标）。从 `@/imports/流2/svg-6fnpztong6` 复用路径，白色图形置于蓝色圆角容器、24px 基准：
- 源 Source → 圆盘：`p8c21e00`（实心圆，viewBox 17×17）
- 流 Flow → 分支连接字形：`pff0f680`（viewBox ≈ 21×27）
- 灵感碎片 Fragment → 互扣/拼块字形：`pf9ca500`（viewBox ≈ 24×23）
- Completed → 蓝→品红渐变容器 + 上述字形 + 黄色对勾角标
品牌 Logo 组件（TopBar 用）复用 `@/imports/流7` 的三色城市剪影 + 底部流动曲线（`svg-3sn9twt0dz`），作 compact mark。

## 架构

### 数据层（独立，预留后端）— `src/app/data/`
- `types.ts` — 全部领域类型。
- `seed.ts` — 演示数据（见下）。
- `store.tsx` — `FlowStore` React Context + reducer；启动时从 Local Storage（key `flow.store.v1`）读取，为空则写入 seed；每次 dispatch 后 `saveToStorage`。导出 `useFlowStore()`。**所有页面通过 store 读写，不硬编码数据。**
- `repository.ts` — 薄封装接口 `loadState()/saveState()`（当前 = localStorage 实现）。留 `// TODO: swap for Supabase/API` 注释，未来替换此文件即可。
- `layout.ts` — 纯函数 tidy-tree 布局：输入某 flow 的节点（含 `parentId`），输出 `{id -> {x,y}}`。按 depth 分层、子树宽度排布；≤ ~12 节点用简单递归即可。Flow Map 与卡片 mini 预览共用。

核心类型（`types.ts`）：
```
type Role = '编曲'|'作词'|'演唱'|'混音'|'乐器'|'视觉';
type MediaKind = 'sound'|'pic'|'text';
type License = 'display-only'|'attribution'|'noncommercial'|'custom';
interface Media { kind: MediaKind; src?: string; text?: string; duration?: number }
interface Fragment { id; kind: MediaKind; authorId; title; media: Media }
interface FlowNode {
  id; flowId; parentId: string|null;      // null = 源/根，实线父子由此派生
  kind: 'source'|'flow';
  authorId; roles: Role[];
  title; changeNote;                        // 「这次做了什么改变」
  media: Media[];
  fragmentRefs: string[];                   // 虚线：引用的灵感碎片
  completed?: boolean; completedLabel?: string;
  allowContinue: boolean;                    // 由 project.license + 节点决定
  createdAt: number;
}
interface FlowProject { id; title; cover; description; license; licenseNote?; ownerId; sourceNodeId; likes; saves; comments; ... }
```
边：父子=实线（由 `parentId` 派生）；`fragmentRefs`=虚线。**续流只新增子节点，绝不修改父/他人节点**（reducer 层保证）。

### 导航 — 轻量内部栈（避免 iframe URL 冲突）
`src/app/nav.tsx`：`NavContext` 维护 `stack: Screen[]`，`push/replace/back`。`Screen` 判别联合：`{home} | {discover} | {detail,id} | {createEntry} | {continueFlow, flowId, parentNodeId} | {flowMap, flowId, focusNodeId?} | {profile} | {drafts}`。`App.tsx` 渲染栈顶 + `BottomNav` + 常驻 `MiniPlayer` + `<Toaster>`。

### 播放器 — 常驻
`src/app/player.tsx`：`PlayerContext`（当前曲目、playing、模拟进度用 `setInterval`）。`MiniPlayer` 固定在 BottomNav 之上，切页不中断；点开为 `FullPlayer`（sheet）。音频为模拟进度（无真实文件）。

## 组件清单 — `src/app/components/`
可复用、含 默认/按下/选中/禁用/加载/错误 态；图标按钮最小触控 44×44、带 `aria-label`：
- `AppShell.tsx` / `BottomNav.tsx`（首页·发现·中央创作·我的；通知入口放首页 TopBar）/ `TopBar.tsx`（含 `FlowLogo`）
- `FlowLogo.tsx`（复用 流7 城市剪影+流动曲线）
- `icons/FlowIcon.tsx`（source/flow/fragment/completed × selected/size；复用 流2 字形）
- `ContentCard.tsx`（Fragment/Source/Flow 三变体，带类型标签、播放/暂停、作者、进详情、进创作流）
- `player/MiniPlayer.tsx` `player/FullPlayer.tsx`
- `MediaPicker.tsx`（pic/text/sound 多选 + 预览）
- `chips/RoleChip.tsx` `chips/FilterChip.tsx`
- `flowmap/FlowNode.tsx`（canvas 节点，含 selected 高亮外圈、completed 角标、disabled）
- `flowmap/FlowEdge.tsx`（solid=父子 / dashed=碎片引用，样式与数据严格区分）
- `flowmap/NodeDetailSheet.tsx`（点节点弹底部摘要；上拉/再点进详情）
- `CommentItem.tsx` `DraftCard.tsx`
- `states/EmptyState.tsx` `states/ErrorState.tsx` `states/LoadingSkeleton.tsx`

## 页面

### ★ 创作流 Flow Map — `screens/FlowMapScreen.tsx`（核心，做精）
- 用 `layout.ts` 自动布局；`<svg>` 画边（实线父子、虚线碎片引用），节点用绝对定位 `FlowNode`。
- **可平移/缩放/拖动**：外层 `transform: translate+scale`，pointer 事件实现拖拽平移 + 滚轮/双指缩放（自实现，无需额外库）；工具条按钮：回到根源、回到当前节点、缩放 +/−。
- 当前/聚焦节点高亮外圈；节点多时只展开当前路径 + 相邻分支（其余折叠为「+n」）。
- 点节点 → `NodeDetailSheet`（作者/角色/改动说明/试听/「续流」按钮）；被禁止续作的节点隐藏主按钮并给出原因（授权/非本人），但节点在树上**保留占位**不断链。
- **无障碍替代**：右上「列表视图」切换 → 可键盘聚焦的树形缩进列表（同一数据），满足键盘可达与 reduce-motion。
- 空树（仅根）显示 EmptyState「从这里开始第一个分支」。

### ★ 续流编辑器 Continue Flow — `screens/ContinueFlowScreen.tsx`（核心，做精）
- 顶部显示父节点并可试听（复用 player）。
- 选择贡献角色（RoleChip 多选）。
- `MediaPicker`：上传新音频（必填，模拟）＋ 可附 pic/text ＋ 可引用灵感碎片（生成 `fragmentRefs` 虚线）。
- 「这次做了什么改变」`changeNote` 文本。
- **自动保存草稿**（防抖写 store/localStorage）；「保存草稿」/「发布」。发布失败（模拟校验）**不清空内容**。
- 发布 → reducer 以父节点 `parentId` 新增子 `FlowNode`（父节点不变），`push({flowMap, flowId, focusNodeId:new})`，toast 成功，新节点高亮。
- 可标记为完成版本（completed + label），完成**不关闭整棵树**，仍可继续续流。

### 其余页面（最简，够跑主路径）
- `HomeScreen`：推荐/关注/可续作三 Tab（FilterChip）；`ContentCard` 列表（碎片/源/流带类型标签）；卡片可播放、进详情、进创作流。骨架屏。
- `DetailScreen`：封面/标题/作者/说明/授权/播放器/点赞·收藏·评论·分享（本地状态）；源/流→「查看创作流」「续流」；碎片→「引用到续流」。评论用 seed 的 6 条 + `CommentItem`。
- `CreateEntryScreen`：仅三入口——发布灵感 / 发布源 / 继续草稿（进入编辑再选 pic/text/sound）。发布源需选**授权**（display-only / attribution / noncommercial / custom）。
- `ProfileScreen`：简介+角色标签；发布的源/参与的流/碎片/收藏/草稿分区；贡献统计优先「参与项目数·被续作次数·完成版本数」。
- `DraftsScreen`：`DraftCard`（对象类型、最后编辑时间、缺失项、完成进度；续写/复制/删除）。

## 演示数据（`seed.ts`）
- 4 用户：Chen、Ayon、SHENG、Aqueen（含角色标签、关注关系）。
- 3 灵感碎片：图片型、文字型、鼓点(声音)型。
- 2 个源项目；主项目 **Romantic little yellow song**。
- 主流程树 **8–10 节点 / 3 分支 / 2 完成版本**，角色含编曲·作词·混音（可重叠），完成版本：轻柔版、热烈版、实验版、游戏化版本。用 `parentId` 串成树，含 ≥1 条指向碎片的虚线引用。
- 6 条评论；4 个不同完成度草稿。
- 封面用 Unsplash（`ImageWithFallback`），头像同理。

## 权限与授权
- 发布源必选授权；`allowContinue` 由 license + 是否本人节点派生。
- 用户只能编辑自己节点（reducer 校验 `authorId===currentUser`）；禁止续作时隐藏主按钮 + 原因文案；被隐藏父节点在树上保留占位。

## 状态与可访问性
- Feed/详情骨架屏；上传/发布失败保内容；颜色非唯一状态提示（配文字/图标）；图标按钮 `aria-label`；Flow Map 提供键盘可聚焦列表替代；支持系统字体放大与 `prefers-reduced-motion`；正文对比度 ≥ WCAG AA。

## 关键文件
- 新增：`src/app/data/{types,seed,store,repository,layout}.tsx`、`src/app/nav.tsx`、`src/app/player.tsx`、`components/**`（见清单）、`screens/{FlowMapScreen,ContinueFlowScreen,HomeScreen,DetailScreen,CreateEntryScreen,ProfileScreen,DraftsScreen}.tsx`。
- 重写：`src/app/App.tsx`、`src/app/data.ts`（拆入 data/ 后移除）、删除旧 `FlowGraph.tsx`/`FlowCard.tsx`/旧 screen 或替换。
- 复用：`components/figma/ImageWithFallback.tsx`、`components/ui/*`、`@/imports/流2/svg-6fnpztong6`、`@/imports/流7/*`、`sonner`。
- 追加品牌 token：`src/styles/theme.css`。

## 验证（主路径，逐项）
1. 预览加载 → 首页出现「Romantic little yellow song」流卡（带类型标签），骨架屏先于内容。
2. 卡片播放/暂停生效；切到「发现」MiniPlayer 仍在播。
3. 进详情 → 「查看创作流」进 Flow Map：可平移/缩放/回根/回当前；实线父子、虚线碎片引用清晰区分；完成版本有角标。
4. 点某可续作节点 → NodeDetailSheet → 「续流」进编辑器；顶部父节点可试听。
5. 选角色 + 传音频 + 填改动说明；中途切走再回，草稿自动保留；模拟发布失败一次内容不丢。
6. 发布 → 回到 Flow Map，新节点出现在**正确父节点**下并高亮；刷新预览（localStorage）后仍在。
7. 校验父节点 title/media/changeNote **未被改动**；对非本人节点续流按钮隐藏并显示原因。
8. 列表视图可用键盘 Tab 聚焦；开启系统 reduce-motion 时无强动效。

完成后先展示可运行预览，并说明：全部为本地 Mock + Local Storage；`data/repository.ts` 为后续 Supabase/Firebase/自建 API 预留；第一版不含支付、IM、实时协同、版权交易。

---

## 第一轮体验修复（7 项）

### 修复 1 — 图片/头像加载失败
**根因**：`seed.ts` 的 `IMG()` 使用 Unsplash photo ID 直链，部分 ID 在沙盒环境不可达，`ImageWithFallback` 回退为灰色碎图占位。

**方案**：
- `seed.ts` 中把所有 `IMG()` 调用换成**可靠的占位图服务 URL**（`https://picsum.photos/seed/{slug}/{w}/{h}`），按语义命名 slug（如 `yellowsong`、`citylights`、`chen`…），保证网络可达且图片风格一致。
- `ImageWithFallback.tsx` 的 `onError` 回退换为品牌色渐变 `<div>`（而非灰色 SVG），加上内容首字母或图标作占位，视觉更友好。

**文件**：`src/app/data/seed.ts`、`src/app/components/figma/ImageWithFallback.tsx`

---

### 修复 2 — 390px 下版本树被裁切 + 初始定位
**根因**：
- 初始 `tf = { x:40, y:20, k:1 }` 是硬编码偏移，没有根据容器宽度居中根节点。
- 10 节点树横向宽约 `9 * 160 = 1440px`，在 390px 视口内大部分不可见。
- `focusNodeId` 居中的 `170` 是硬编码宽度的一半，在移动端不准确。

**方案**：
- 给画布容器加 `ref`，在 layout 完成后用 `useEffect` 读取真实容器尺寸（`containerRef.current.getBoundingClientRect()`）。
- 初始化时将**根节点**居中到容器中心，同时缩放到适合整棵树宽度的 `k`（`k = min(containerW / treeWidth, 1)`，至少 0.45，不超过 1）。
- 有 `focusNodeId` 时，将该节点居中；无时居中根节点。这两处都使用真实容器尺寸计算。
- 节点盒子用 `overflow: visible` 的绝对定位，SVG 画布尺寸 `width=canvasW height=canvasH`，确保路径不被裁。

**文件**：`src/app/components/screens/FlowMapScreen.tsx`

---

### 修复 3 — BottomNav 遮挡页面内容
**根因**：BottomNav 高度约 56–68px（含系统安全区），各滚动区域只有 `pb-6`（24px）的底部内边距，内容末尾被遮挡。

**方案**：
- 在 `App.tsx` 的 Shell 组件里，向 `NavContext`（或通过简单布局 prop）传递 "是否显示 BottomNav" 信息。
- 更简单：在 `Shell` 中，当非 immersive 屏时，给内容区域加 `pb-[72px]`（覆盖 BottomNav + MiniPlayer 的叠加高度约 120px 时改为 `pb-[120px]`）。
- 具体：`HomeScreen`、`DiscoverScreen`、`ProfileScreen`、`DraftsScreen` 的最外层滚动容器 padding-bottom 改为 `pb-[80px]`（BottomNav ~56px + 余量）；有 MiniPlayer 时再加 ~56px，可设为 `pb-32`。
- 最干净方案：`MiniPlayer` + `BottomNav` 叠放时总高度约 112px，所有非 immersive 页面滚动区改为 `pb-28`（112px）。

**文件**：`src/app/components/screens/HomeScreen.tsx`、`DiscoverScreen.tsx`、`ProfileScreen.tsx`、`DraftsScreen.tsx`

---

### 修复 4 — 发布续流后仍显示完整树且新节点高亮
**根因**：`nav.replace({ name:"flowMap", flowId, focusNodeId:newId })` 是正确的，但 `FlowMapScreen` 的自动居中逻辑用硬编码 `170`（半宽），导致在移动端新节点偏出视口、树的其他部分消失。修复 2 中的动态居中会同步修复此问题。

**额外保证**：发布后的 `replace` 跳回 FlowMap，layout 包含全部节点（包含父节点），视觉上父节点不会丢失。需要确认 `selectNodesOfFlow` 在 dispatch 后能立即返回最新节点列表（store 是同步 reducer，LocalStorage 同步写入，无需额外处理）。

**文件**：`src/app/components/screens/FlowMapScreen.tsx`（修复 2 覆盖）

---

### 修复 5 — 表单验证：成功/错误不同时出现，修正后旧错误消失
**根因**：
- `failedOnce` 只在首次发布失败时置 `true`，之后即使用户修正内容，内联错误标记仍显示。
- 成功路径没有重置 `failedOnce`（虽然成功后跳页，但视觉上两个 toast 可能共存）。

**方案**：
- 改为**字段级实时验证**：把 `failedOnce` 换成一个 `touched` 布尔和一个 `errors` 对象 `{ roles, sound, changeNote }`。
- 每次 `publish()` 被调用时计算 `errors`；若有错误，`setErrors(errors)` 并 toast.error 一次，直接 return。
- `roles`、`media`、`changeNote` 的 onChange 回调中，若对应字段已在 errors 里，则 `setErrors(prev => ({ ...prev, roles: false }))` 实时清除。
- 成功发布时先 `setErrors({})` 再 dispatch，确保内联错误已清空，然后 toast.success。
- toast.error 和 toast.success 靠 sonner 的 `id` deduplication：给 error toast 固定 id `"continue-error"` — 成功后通过 `toast.dismiss("continue-error")` 清除它，再调 `toast.success`。

**文件**：`src/app/components/screens/ContinueFlowScreen.tsx`

---

### 修复 6 — 发现页搜索框可输入 + 筛选条件
**根因**：`DiscoverScreen.tsx` 的搜索框是一个静态 `<div>` + `<span>`，没有实际输入能力。

**方案**：
- 把 `<div>…<span>搜索…</span></div>` 替换为真正的 `<input type="search" …>` 配合受控 state `query`。
- 增加 4 组 `FilterChip`（复用已有组件）：**内容类型**（全部/源/续流/碎片）、**媒介**（全部/音频/图片/文字）、**角色**（全部/编曲/作词/演唱/混音/乐器/视觉）、**可续作**（全部/允许续作）。
- 搜索和筛选逻辑：对 `projects` 按 title/description/tags 做 `toLowerCase().includes(query)` 过滤；按类型/媒介/角色/license 做交叉过滤。过滤逻辑放在组件内（不加新 store action）。
- 显示：搜索框 + 4 行水平滚动 chip 组（内容类型和可续作放同一行，媒介和角色各一行），使用 `overflow-x-auto` 横滚，避免换行占太多竖向空间。

**文件**：`src/app/components/screens/DiscoverScreen.tsx`

---

### 修复 7 — 内容卡片点击语义分离
**根因**：`ProjectCard` 把封面图套在一个 `<button onClick={→detail}>` 里，播放按钮用 `<span role=button onClick={e.stopPropagation(); play()}>` 阻止冒泡。这在语义上正确但 `<span>` 无法被键盘聚焦，且整个封面区域（含播放按钮）都触发详情导航。

**方案**：
- 把 `ProjectCard` 的封面区域改为普通 `<div>`（非按钮），通过 `onClick` 绑到 `→detail`，保留 `cursor-pointer`。
- 播放按钮改为真正的 `<button type="button">`，`onClick={e => { e.stopPropagation(); play(…); }}`，加 `aria-label`。
- 卡片底部的「查看创作流」按钮和「点赞」按钮已经是独立 `<button>`，无需改动。
- `FragmentCard` 同理：外层改为 `<div role="button" tabIndex={0}>`（无 `<button>` 嵌套），播放按钮保持 `<button>`。
- 注意：移除外层 `<button>` 后需要为 div 加 `onKeyDown` 支持 Enter/Space 键盘导航。

**文件**：`src/app/components/ContentCard.tsx`

---

## 各修复文件汇总

| 修复 | 文件 |
|------|------|
| 1 图片/头像 | `src/app/data/seed.ts`、`src/app/components/figma/ImageWithFallback.tsx` |
| 2 版本树定位 | `src/app/components/screens/FlowMapScreen.tsx` |
| 3 底部遮挡 | `HomeScreen.tsx`、`DiscoverScreen.tsx`、`ProfileScreen.tsx`、`DraftsScreen.tsx` |
| 4 发布后树保留 | 修复 2 覆盖 |
| 5 表单验证 | `src/app/components/screens/ContinueFlowScreen.tsx` |
| 6 发现页搜索 | `src/app/components/screens/DiscoverScreen.tsx` |
| 7 点击语义 | `src/app/components/ContentCard.tsx` |

## 验证步骤

1. 首页封面和头像均显示真实图片（或品牌色渐变占位），无灰色碎图。
2. 进入 Flow Map，390px 宽下根节点居中可见，可向两侧平移看到分支；发布续流后跳回树图，父节点和新节点均可见，新节点有高亮外框。
3. 各页面下滑到底部最后一项不被 BottomNav 遮挡。
4. 续流编辑器：不填角色点「发布续流」→ 角色区域出现错误提示 → 选了角色后错误消失，且之前的 error toast 不再显示；填完所有必填项后点发布 → 只出现成功提示。
5. 发现页搜索框可输入中英文，内容类型/媒介/角色/可续作 chip 可交叉筛选，结果实时更新。
6. 首页卡片点封面区域→进详情，点播放按钮→播放（不跳转详情）。

---

## 第二轮视觉恢复（2 项）

### 背景

原始设计稿（`src/imports/image.png`）呈现两个当前实现缺失的视觉特征：
1. 首页流卡片带有蓝色有机叠层背景，体现"内容正在生长"的意象。
2. 底部导航中央发布按钮是有机水滴形态，从导航栏向上隆起，而非普通圆角矩形。

**约束**：只改 `ContentCard.tsx` 和 `BottomNav.tsx`；不改变已实现的交互逻辑；不引入新色。

---

### A — 流卡片叠层（`src/app/components/ContentCard.tsx`）

根据已有 `nodeCount` prop 决定叠层数：

| nodeCount | 叠层数 |
|-----------|--------|
| 1（仅源节点）| 0 — 单张，保持简洁 |
| 2–4 | 1 层 — 流已开始生长 |
| ≥ 5 | 2 层 — 流丰富充满活力 |

用 `<div className="relative pb-2 px-0.5">` 包裹现有 `<article>`，叠层 div 绝对定位在主卡片后方（z-0），主卡片 `relative z-10`：

```tsx
// 叠层 2（最远，nodeCount >= 5）
<div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 rounded-3xl"
  style={{ top:"6px", background:"var(--flow-blue)", opacity:0.14, transform:"rotate(2.8deg) scaleX(0.98)" }} />

// 叠层 1（较近，nodeCount >= 2）
<div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 rounded-3xl"
  style={{ top:"3px", background:"var(--flow-blue)", opacity:0.22, transform:"rotate(1.4deg) scaleX(0.99)" }} />

// 主卡片
<article className="relative z-10 overflow-hidden rounded-3xl ...">
```

- `pointer-events-none` — 叠层不响应点击，主卡片触控区域不受影响。
- 旋转角度和不透明度差异产生自然有机感而非整齐阴影。
- wrapper 不加 `overflow-hidden`，叠层可轻微溢出显示。

---

### B — 水滴形发布按钮（`src/app/components/BottomNav.tsx`）

将中央按钮从 `rounded-2xl size-12 -translate-y-2 shadow-lg` 改为：

```tsx
<button
  type="button"
  onClick={() => nav.push({ name: "createEntry" })}
  aria-label="创作"
  className="relative flex items-center justify-center text-white active:scale-95"
  style={{
    width: 58,
    height: 66,
    // 顶部圆顶62%，底部较平38%，水平对称 — 液体上涌水滴轮廓
    borderRadius: "50% 50% 38% 38% / 62% 62% 38% 38%",
    // 底部约14px沉入导航栏，产生"从导航栏隆起融合"视觉
    transform: "translateY(-14px)",
    background: "var(--flow-blue)",
    boxShadow: "0 4px 20px rgba(39,72,238,0.35)",
  }}
>
  <Plus size={22} />
</button>
```

- 触控区域 58×66px，满足 ≥ 48×48px 要求。
- 蓝色阴影与主色联动，强化"从导航栏浮起"的深度感。
- `translateY(-14px)` 让底部曲线视觉上与白色导航栏平滑过渡。
- 按下时 `active:scale-95` 提供轻微缩放反馈。
