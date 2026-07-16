# Flow App 底部导航与动效校准 QA

- source visual truth: Figma `test_function`, node `582:168`
- source screenshot path: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/figma-bottom-nav-node.png`
- implementation screenshot path: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/figma-nav-implementation-430.png`
- focused comparison path: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/figma-nav-direct-comparison.png`
- viewport: 430 × 900 exact-source check; 390 × 844 responsive check
- state: 首页、推荐、无播放器；另测试创建入口、播放器与创作树抽屉

## Full-view comparison evidence

Figma 节点截图与实现截图均已打开检查。本轮视觉真值范围限定为节点 `582:168` 的底部导航：位置关系、发布入口原始矢量、图标、文字基线、阴影与移动端安全宽度。

## Focused region comparison evidence

已将 Figma 节点截图与 430px 实现放入同一张对比图。原稿不是标准四等分：四个视觉中心为 61.75、169.25、268.75、368.25px；普通 Tab 有 8px 光学校正，发布入口固定在 62.5%。实现的 430px 边界框与原稿元数据逐项一致；390px 响应式中心为 56、153.5、243.75、333.98px。

## Findings

- [P1] 第一轮把原稿误解为标准四等分，虽然整齐，但失去了原稿的光学校正和非对称张力。
  - Fix: 直接读取 Figma `582:168` 的位置数据，按 430px 原始中心点和百分比关系重建。
- [P1] 发布入口使用近似绘制的水滴，缺少原稿的长竖体、凹曲线、双层阴影和准确比例。
  - Fix: 删除近似路径，改用 Figma 导出的 141×123 原始 SVG 资产。
- [P1] 页面与面板采用瞬时替换，缺少连续的空间关系，体验像幻灯片。
  - Fix: 增加前进、返回、Tab 切换、创建模式切换、播放器和节点抽屉的统一过渡；卡片与按钮增加克制的按压反馈。
- [P2] 普通图标使用通用图标库，线条细节与原稿略有差异。
  - Fix: 改用节点导出的首页、发现、我的三个原始 SVG。

## Required fidelity surfaces

- Fonts and typography: 延续现有离线系统字体；底栏标签保持 10px，字重和行高一致，无截断。
- Spacing and layout rhythm: 保留原稿非等距光学校正；底栏高 63px；430px 边界框完全一致；390px 下无横向溢出。
- Colors and visual tokens: 延续 `--flow-blue`、白色背景和既有灰色文字，不引入新色。
- Image quality and asset fidelity: 发布按钮和三个普通图标均为 Figma 节点导出的原始 SVG，不再使用代码近似绘制。
- Copy and content: 保留“首页 / 发现 / 我的”与无标签发布入口。

## Interaction verification

- Tab 切换：过渡期间存在旧、新两个画面；完成后只保留目标画面。
- 创建入口：可进入“发布一个源”，内部模式有连续过渡，表单可见。
- 播放器：迷你播放器与全屏播放器均可打开、关闭。
- 创作树：节点详情抽屉可打开并带遮罩、上移动画。
- Reduced motion: 系统开启减少动态效果时，页面切换不保留双画面动画。
- Console errors: 0。
- Horizontal overflow: 0px。

## Comparison history

1. 初始实现：发布入口中心为 195px，其他入口中心为 36.75、110.25、316.5px；底栏关系与参考图明显不符，并且主导航没有动画。
2. 第一次修复：改为标准四等分，但用户指出仍然“没感觉”；重新读取 Figma 后确认四等分假设本身错误。
3. 第二次修复：读取节点 `582:168` 的代码、截图与元数据；换入四个原始 SVG，并恢复 61.75 / 169.25 / 268.75 / 368.25px 的光学位置。
4. 最终复核：430px 边界框逐项一致，390px 无横向溢出，构建和控制台检查通过。

## Follow-up polish

- [P3] 参考图外层手机框有圆角，真实手机全屏版本不应复制该装饰框；作品集嵌入时再由作品集容器提供设备圆角。

final result: passed

---

# 真实内容素材填充 QA

- visual-direction reference: 用户提供的原始首页参考图；Behance / Pinterest 仅用于审美取样
- implementation screenshot: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/content-assets-home-390-playwright.png`
- profile screenshot: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/content-assets-profile-390.png`
- detail screenshot: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/content-assets-detail-390.png`
- side-by-side comparison: `/Users/eeo/Documents/流 app 的落地/flow-app/qa/content-assets-reference-comparison.png`
- viewport: 390 × 844

## Art direction

- 项目封面：冷黑、深蓝、电光蓝为主，允许局部黄绿作为情绪焦点；内容是流体、气泡、光场、波形等与声音相关的抽象质感。
- 灵感图片：保持更细密的纹理与实验感，在详情和碎片卡中能够成立，不与主封面完全重复。
- 人物头像：编辑人像、背景克制、面部在方形和圆形裁切下都可辨识；四位用户保持明显区分。
- 版权与稳定性：素材使用 Unsplash 免费授权图片并下载到项目内；不热链 Pinterest / Behance 作品。

## Findings

- [P1] 纯色占位让层叠卡片只有形状，没有“作品”感，也无法验证图片裁切。
  - Fix: 替换为 4 张本地抽象图像和 4 张本地编辑人像，并让种子数据在读取旧 Local Storage 时刷新内置素材。
- [P1] 新发布的源仍会调用 Picsum 随机外链，与作品集稳定展示要求冲突。
  - Fix: 新源默认封面改为本地抽象封面，运行时不再依赖随机图片服务。
- [P2] 第一轮人物候选缺少角色区分，小头像下容易混淆。
  - Fix: 最终保留 2 位冷调男性人像与 2 位自然光女性人像，当前用户使用蓝紫光近景，在首页、详情和个人页形成一致身份。

## Verification

- 首页两张主卡封面均能稳定加载，图片在 390px 宽度下无拉伸、无横向溢出。
- 个人页头像、详情页作者头像和评论头像均为真实图片，无破图。
- 首页 / 个人页 / 详情页控制台错误：0。
- `documentElement.clientWidth` 与 `scrollWidth` 均为 390px。
- Production build: passed。

final result: passed
