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

## 音频声纹、Apple 式动效与 Flow 品牌图标

- source visual truth: `/var/folders/37/zml8vmpx4fd234rbxq8nr4sr0000gn/T/codex-clipboard-b5fff2c2-7363-42cb-8324-00ac44dc539e.png`
- source waveform: `/tmp/flow-xd-extract/artwork/artboard-022e0422-d079-4207-8a41-aa23225eb9e5/graphics/graphicContent.agc` 中的 `声波2`
- source app icon: `/var/folders/37/zml8vmpx4fd234rbxq8nr4sr0000gn/T/codex-clipboard-4e8febb2-3e6f-4f5e-a0fb-4f850a911104.png`
- implementation screenshots: `qa/apple-motion-sound-waveform-390x844.png`, `qa/apple-motion-filter-sheet-390x844.png`, `qa/apple-motion-home-brand-390x844.png`
- comparison images: `qa/apple-motion-waveform-comparison.png`, `qa/flow-brand-icon-comparison.png`
- viewport: 390 × 844 CSS px

### Full-view and focused comparison evidence

- 音频卡片取消右侧声音图标，改为直接从 XD `声波2` 还原的 23 段透明声纹；它贴近卡片底部、低对比显示，不与标题和作者信息争夺注意力。
- Flow 官方图标保持原图不变，作为 32px 品牌标记放在首页“流.”标题前；同一资源也用于 favicon、Apple Touch Icon 和 PWA manifest。
- 首页卡片、标题区和底部导航保持原有布局，没有因为品牌标记产生横向挤压。

### Motion and interaction

- motion guidance: Emil Kowalski `apple-design` skill（Apple WWDC 原则：即时按压反馈、可中断弹簧、空间连续性、手势抽屉和 reduced-motion 回退）。
- 页面 push/pop 改用无缩放的短距离弹簧；局部切换使用更短弹簧，避免 PPT 式整页缩放。
- 二级分类选中态通过 shared layout 胶囊连续移动；“音乐与声音”由 11 个结果切换到“节奏”后为 5 个结果。
- 筛选面板支持向下拖动关闭；390 × 844 实测拖动超过阈值后 dialog 数量从 1 变为 0。
- 播放、卡片和底部 Tab 均提供轻量 press feedback；系统启用 reduced motion 时关闭位移、缩放和声纹呼吸动画。

### Verification

- production build: passed
- console errors: none
- broken images: 0 / 9
- horizontal overflow: none（`innerWidth = 390`, `scrollWidth = 390`）
- 未发现 P0 / P1 / P2 视觉或交互问题。

final result: passed

## 紧凑层叠卡片与草稿入口图标

- source visual truth: `/var/folders/37/zml8vmpx4fd234rbxq8nr4sr0000gn/T/codex-clipboard-5531e005-5e5a-41cb-aef3-6ba79395b293.png`
- implementation screenshots: `qa/card-compact-home.png`, `qa/profile-draft-icon.png`
- viewport: 首页 390 × 844 CSS px；个人页 App Frame 430 × 688 CSS px
- states: 热流首页首屏；个人页顶部草稿入口

### Full-view comparison evidence

参考截图与 390 × 844 实现截图已在同一次视觉对比中检查。实现保留了四层单色半透明洋葱皮，但把层与层之间的大幅横向摆动和纵向占位收紧；首屏现在能够同时看到两张完整卡片与第三张卡片入口。

### Focused region comparison evidence

- 卡片封面区由 126px 压缩到 108px，标题区上下留白同步收紧，单卡可见主体高度约 184px。
- 每层纵向露出由约 10px 收到 5px，最大动态位移低于 1px，最大静态旋转从 7° 收到 2.2°。
- 多层仍能独立辨认，没有退化成普通投影或真实封面残影。
- 个人页草稿入口最终改为清晰的“打开文件夹”语义；按钮仍保留 `草稿箱` 无障碍名称，并已验证可进入草稿列表。

### Required fidelity surfaces

- Fonts and typography: 复用现有字体系统；标题缩到 16px，无裁切和异常换行。
- Spacing and layout rhythm: 层叠仍占用正常文档流空间，卡片之间不碰撞；底部导航不遮挡内容。
- Colors and visual tokens: 继续根据封面使用蓝、冷灰和石墨黑表面色；后层只做同色半透明与轻微模糊。
- Image quality and asset fidelity: 继续使用项目内真实封面与头像。
- Copy and content: 标题、作者、版本数、点赞数和草稿文案保持不变。

### Findings and comparison history

1. Earlier finding [P2]: 静态旋转与动画漂移叠加后，片层左右抖动明显，四层卡片纵向占位过大。
   - Fix: 收紧四层的旋转、横移、纵向露出和动态漂移，并压缩封面与标题区高度。
2. Earlier finding [P2]: `FileStack` 容易被理解成文件夹或附件，不像未发布作品。
   - Superseded: 后续在线核对抖音/TikTok 的草稿入口后，确认草稿以个人作品区内的文件夹/缩略块呈现，`VideoLibraryOutlined` 仍偏向“视频库”。最终改用 Phosphor `FolderOpen`。
3. Post-fix evidence: production build passed；390px 视口无横向溢出；草稿入口点击后能进入包含四条草稿的列表。

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

## 榜单说明降噪与草稿文件夹图标

- source visual truth: `/var/folders/37/zml8vmpx4fd234rbxq8nr4sr0000gn/T/codex-clipboard-9fc6ab57-d011-443b-8166-942ed0f6b008.png`
- online icon grounding: 抖音/TikTok 个人作品区的草稿文件夹截图；Phosphor `folder-open` 图标库
- implementation screenshots: `qa/home-rank-tooltip-hidden.png`, `qa/home-rank-tooltip-visible.png`, `qa/profile-draft-folder-icon.png`
- viewport: desktop canvas 1280 × 720；App Frame 430 × 688
- states: 热流榜默认；排名提示显示；个人页顶部

### Full-view comparison evidence

参考截图中“近期分支 / 创作者”作为常驻文字占用了卡片上方视觉空间。修订后的默认状态只保留排名圆点，三张卡片的起始位置更整齐，说明信息不再与卡片标题、作者和互动数据争夺注意力。

### Focused region comparison evidence

- 鼠标悬停、键盘聚焦或手机点击排名圆点时，黑色紧凑提示显示原有榜单理由；默认状态完全隐藏。
- 提示层绝对定位，不改变卡片高度和列表间距。
- 个人页草稿入口换成 Phosphor `FolderOpen`；相较播放库图标，它直接表达“打开草稿文件夹”，并与网上可见的抖音/TikTok 草稿文件夹入口保持同类心智模型。
- 草稿按钮仍保留 `aria-label="草稿箱"`，点击后能进入四条真实草稿列表。

### Required fidelity surfaces

- Fonts and typography: 删除常驻 11px 灰色说明；提示使用 10px 白字，只有请求时出现。
- Spacing and layout rhythm: 排名行由文字行收敛为 24px 圆点行；卡片间距无跳动。
- Colors and visual tokens: 排名继续使用品牌蓝；提示使用黑底白字；草稿按钮继续使用暖灰圆形底。
- Image quality and asset fidelity: 封面和头像未改动；草稿图标来自正式开源图标库，不使用自绘近似图形。
- Copy and content: 榜单理由没有删除数据，只从常驻内容转为按需提示。

### Findings and comparison history

1. Earlier finding [P2]: “近期分支 / 创作者”常驻在每张卡片上方，重复且削弱作品卡片主体。
   - Fix: 默认只显示排名；理由进入悬停、聚焦和触屏点击提示。
2. Earlier finding [P2]: `VideoLibraryOutlined` 被理解为播放库，与“未发布草稿”不符。
   - Fix: 在线核对真实产品后，替换为 Phosphor `FolderOpen`，并同步到个人页、草稿空状态和继续草稿入口。
3. Post-fix evidence: 默认截图无冗余理由文字；提示截图保持信息可达；个人页截图显示清晰文件夹图标；草稿跳转与四条数据均正常。

final result: passed

## 发现页灵感碎片内容与布局

- source visual truth: `/var/folders/37/zml8vmpx4fd234rbxq8nr4sr0000gn/T/codex-clipboard-b5fff2c2-7363-42cb-8324-00ac44dc539e.png`
- source content: `/Users/eeo/Desktop/flow app.xd`
- implementation screenshots: `qa/discover-visual-390x844.png`, `qa/discover-sound-390x844.png`
- comparison image: `qa/design-comparison.png`
- viewport: 390 × 844 CSS px
- states: 发现 / 视觉与绘画；发现 / 音乐与声音

### Full-view comparison evidence

参考稿的两种核心节奏已分别映射到新版界面：视觉结果使用高密度双列图片网格；声音结果使用紧凑的单列播放卡片。实现保留新版 Flow 的浅色设计系统、底部导航和筛选层级，没有照搬旧稿的黑色外壳。

### Required fidelity surfaces

- Fonts and typography: 标题、元数据、结果数量和筛选器层级清晰，在目标视口无裁切。
- Spacing and layout rhythm: 双列网格与单列音频卡片都使用稳定间距；390px 视口无横向溢出，纵向内容通过移动端滚动继续浏览。
- Colors and visual tokens: 新增图片保持 XD 原始色彩；音频卡片使用低饱和分类色，继续服从当前 Flow 视觉语言。
- Image quality and asset fidelity: 从 XD 提取并加入 8 张真实图片素材，没有用占位图或代码绘图替代。
- Copy and content: 新增 8 个视觉碎片和 8 个声音碎片，标题与旧稿中的作品概念保持关联。

### Interaction and verification

- 分类入口、返回、二级分类、筛选、碎片详情入口与音频加载控制可用。
- production build: passed
- console errors: none
- horizontal overflow: none
- 未发现 P0 / P1 / P2 视觉问题。

final result: passed

## 首页信息减负

- source visual truth: `/var/folders/37/zml8vmpx4fd234rbxq8nr4sr0000gn/T/codex-clipboard-9917e927-a4c1-40e4-962e-b27a0f19966b.png`
- implementation screenshot: `qa/home-minimal-390x844.png`
- comparison image: `qa/home-minimal-comparison.png`
- viewport: 390 × 844 CSS px
- state: 首页加载完成

### Full-view and focused comparison evidence

- 原分类胶囊、“热流榜”“持续更新”和项目排名圆点均已删除，首页从品牌标题直接进入内容卡片。
- 用户提供的软件图标不再出现在界面中；仍作为 favicon、Apple Touch Icon 与 PWA 安装图标保留。
- 聚焦检查首页顶部与第一张卡片：品牌文字、通知入口、卡片封面、标题和互动数据层级完整，没有因删减产生空洞或错位。

### Required fidelity surfaces

- Fonts and typography: 首页只保留“流.”品牌字样与作品自身文字；无冗余说明和分类标签。
- Spacing and layout rhythm: 第一张卡片直接承接顶部栏；390px 视口无横向溢出，首屏可完整看到两张项目卡片与第三张入口。
- Colors and visual tokens: 未改变品牌蓝、石墨黑与冷灰卡片色阶。
- Image quality and asset fidelity: 卡片封面、头像与洋葱皮层叠素材均未改变；界面中的 Flow 应用图标已移除。
- Copy and content: `正在生长 / 本周热门 / 最新源作 / 热流榜 / 持续更新` 均不存在；项目标题、作者、版本与互动数据保留。

### Interaction and verification

- 点击第一张项目卡片可进入详情，返回后首页状态正常。
- production build: passed
- broken images: 0
- horizontal overflow: none（`innerWidth = 390`, `scrollWidth = 390`）
- 未发现 P0 / P1 / P2 视觉或交互问题。

final result: passed
