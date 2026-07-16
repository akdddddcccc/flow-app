# Design QA — 首页洋葱皮层叠卡片

- source visual truth path: `/tmp/codex-remote-attachments/019f6904-1751-7f93-8e20-f3b66871b4d3/09ecaa58-87bd-4483-8a07-fd260f26acff/1-Photo-1.jpg`
- implementation screenshot path: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/xd-refresh-home-top.png`
- comparison image path: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/onion-stack-comparison.png`
- viewport: 390 × 844 CSS px, device scale factor 2
- state: 首页 / 推荐 / 首屏 / 慢速循环层叠动画的静态一帧

## Full-view comparison evidence

参考图与实现截图已放入同一张对比图。两者都使用前景内容卡＋后方同色半透明片层；实现根据封面把表面色收敛为蓝、冷灰或石墨黑，这是已确认的新版产品规则。

## Focused region comparison evidence

聚焦比较前两张卡片。参考图第一张卡片在顶部、左右和底部可辨认多个独立蓝色轮廓；修订后的实现同样能辨认四层蓝色轮廓。第二张实现卡片能辨认三层石墨黑轮廓，层数随节点数量变化。

## Required fidelity surfaces

- Fonts and typography: 本轮未更换新版字体系统；标题、作者和节点数均无裁切或错误换行。
- Spacing and layout rhythm: 每层约露出 10px，最多四层；卡片间距包含层叠占位，不与下一张卡片重叠。
- Colors and visual tokens: 层叠层只使用选定的单色表面色，通过 0.20 / 0.32 / 0.46 / 0.64 透明度形成洋葱皮深浅；不包含封面残影。
- Image quality and asset fidelity: 封面继续使用项目内真实图片素材，未使用占位图或代码绘图代替。
- Copy and content: 标题、作者、版本数和互动数据保持真实演示内容。

## Findings

- 无 P0 / P1 / P2 未解决问题。
- [P3] 参考图的最远片层边缘更有手工抖动感；当前实现保持规则圆角，以避免新版 UI 退回旧稿的粗糙边缘。

## Comparison history

1. Earlier finding [P1]: 后层只有一个可见轮廓，主卡片投影被误读为层叠。
   - Fix: 按节点数量渲染 2–4 个独立单色片层，并削弱主卡片投影。
2. Earlier finding [P2]: 多层之间只露出约 4px，视觉上重新合并成一个模糊块。
   - Fix: 将每层可见边缘扩展到约 10px；增加交替旋转、横向错位、独立透明度和轻微模糊。
3. Post-fix evidence: `qa/onion-stack-comparison.png` 中蓝色卡片可辨认四层、石墨黑卡片可辨认三层；390px 视口无横向溢出，控制台无错误。

## Implementation checklist

- [x] 2 / 3 / 4 层随节点数量递增
- [x] 单色半透明，不复制封面
- [x] 每层独立旋转、错位、透明度和模糊
- [x] 减弱普通阴影，避免阴影冒充片层
- [x] 支持减少动态效果设置
- [x] 390 × 844 截图验证

## PC Frame 横竖屏交互验证

- portrait screenshot: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/pc-flow-frame-portrait.png`
- landscape screenshot: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/pc-flow-frame-landscape.png`
- desktop viewport: 1280 × 900
- before: 430 × 868，竖版 Frame 居中
- action: 点击“切换横屏阅读”
- after: 844 × 390，横版 Frame 居中；导图重新排版为从左向右生长，源节点位于左侧，各级派生沿 X 轴展开
- landscape fit: 横屏使用独立层级间距和画布留白，节点不再沿用竖屏缩放，默认状态可读且完整落在 Frame 内
- parent contract: 嵌入模式发送 `flow-app:frame-mode`，包含 `portrait / landscape`、目标宽高和动画标记；退出创作流时自动恢复竖版请求
- console errors: none
- horizontal overflow: none

final result: passed

## 热流 / 发现 分层导航验证

- 热流首页：`qa/01-hot-flow-home.png`
- 发现分类入口：`qa/02-discover-categories.png`
- 声音分类结果：`qa/03-discover-sound-results.png`
- “节奏”二级分类：`qa/03b-discover-sound-rhythm.png`
- 移动端底部筛选：`qa/04-discover-filter-sheet.png`
- viewport: 390 × 844 CSS px，device scale factor 2

### 信息架构

- 底部“首页”改为“热流”，趋势图标与“发现”的指南针图标不再表达相同动作。
- 热流首页只承担正在生长 / 本周热门 / 最新源作的榜单职责，并显示上榜原因。
- 发现首屏只提供搜索、媒介入口、灵感入口和热门标签，不直接堆叠所有过滤器。
- 分类页使用返回层级、二级标签和结果列表；高级条件进入底部筛选面板。

### 移动端行为

- 所有二级分类使用自动换行，不出现横向网页滚动条。
- 纵向内容保留触控、触控板和鼠标滚轮滚动，但隐藏浏览器式拖动条。
- 底部筛选通过 portal 覆盖完整 App Frame 与底部导航，避免筛选期间误触 Tab。
- 二级分类会真实更新结果：“音乐与声音”共 3 个结果，选择“节奏”后收敛为 2 个结果。
- 页面层级切换使用短距离滑移与淡入；筛选面板使用弹簧上滑。

### 验证

- production build: passed
- console errors: none
- visible scrollbar containers: 0
- horizontal overflow: none

final result: passed
