import type { AppState, FlowNode, FlowProject, Fragment, MediaKind, Role } from "./types";
import chenAvatar from "../../assets/content/avatars/chen.jpg";
import ayonAvatar from "../../assets/content/avatars/ayon.jpg";
import shengAvatar from "../../assets/content/avatars/sheng.jpg";
import aqueenAvatar from "../../assets/content/avatars/aqueen.jpg";
import yellowSongCover from "../../assets/content/covers/yellow-song-cover.jpg";
import cityLightsCover from "../../assets/content/covers/city-lights-cover.jpg";
import romanticBlueSource from "../../assets/content/covers/romantic-blue-source.jpg";
import mixedColorSource from "../../assets/content/covers/mixed-color-source.jpg";
import mondrianGroove from "../../assets/content/fragments/mondrian-groove.jpg";
import mondrianFragment from "../../assets/content/fragments/mondrian-fragment.jpg";
import romanticSketch from "../../assets/content/fragments/romantic-sketch.jpg";
import xdRedTemple from "../../assets/content/fragments/xd-red-temple.jpg";
import xdNeonProfile from "../../assets/content/fragments/xd-neon-profile.jpg";
import xdNeonGlasses from "../../assets/content/fragments/xd-neon-glasses.jpg";
import xdColorBird from "../../assets/content/fragments/xd-color-bird.jpg";
import xdMotionBasketball from "../../assets/content/fragments/xd-motion-basketball.jpg";
import xdPastelDunesSquare from "../../assets/content/fragments/xd-pastel-dunes-square.jpg";
import xdPastelDunesWide from "../../assets/content/fragments/xd-pastel-dunes-wide.jpg";
import xdCatsPoster from "../../assets/content/fragments/xd-cats-poster.jpg";
import thinkerAvatar from "../../assets/content/avatars/thinker.jpg";

// 所有展示素材都打包进项目，避免作品集上线后依赖第三方图片外链。
const IMAGE_ASSETS: Record<string, string> = {
  "chen-avatar": chenAvatar,
  "ayon-avatar": ayonAvatar,
  "sheng-avatar": shengAvatar,
  "aqueen-avatar": aqueenAvatar,
  "mondrian-groove": mondrianGroove,
  "mondrian-fragment": mondrianFragment,
  "yellow-song-cover": yellowSongCover,
  "city-lights-cover": cityLightsCover,
  "romantic-blue-source": romanticBlueSource,
  "mixed-color-source": mixedColorSource,
  "romantic-sketch": romanticSketch,
  "xd-red-temple": xdRedTemple,
  "xd-neon-profile": xdNeonProfile,
  "xd-neon-glasses": xdNeonGlasses,
  "xd-color-bird": xdColorBird,
  "xd-motion-basketball": xdMotionBasketball,
  "xd-pastel-dunes-square": xdPastelDunesSquare,
  "xd-pastel-dunes-wide": xdPastelDunesWide,
  "xd-cats-poster": xdCatsPoster,
  "thinker-avatar": thinkerAvatar,
};
const IMG = (slug: string, _w = 900, _h?: number) => IMAGE_ASSETS[slug] ?? yellowSongCover;

const DAY = 86400000;
const now = Date.now();

// 主流程树节点（Romantic little yellow song）：10 节点 / 3 顶层分支 / 4 完成版本
const mainNodes: FlowNode[] = [
  {
    id: "n1",
    flowId: "p1",
    parentId: null,
    kind: "source",
    authorId: "chen",
    roles: ["编曲"],
    title: "源 · little yellow beat",
    changeNote: "一段 lo-fi 四拍节奏，想做成一首温暖的小情歌。",
    media: [
      { kind: "sound", duration: 48 },
      { kind: "pic", src: IMG("romantic-sketch", 900, 675) },
    ],
    fragmentRefs: ["frag-drum"], // 虚线：引用鼓点碎片
    createdAt: now - 20 * DAY,
  },
  // 分支 A
  {
    id: "n2",
    flowId: "p1",
    parentId: "n1",
    kind: "flow",
    authorId: "ayon",
    roles: ["编曲"],
    title: "加入钢琴与弦乐",
    changeNote: "铺了一层钢琴分解和弦，加了弦乐垫底，情绪更饱满。",
    media: [{ kind: "sound", duration: 62 }],
    fragmentRefs: [],
    createdAt: now - 18 * DAY,
  },
  {
    id: "n4",
    flowId: "p1",
    parentId: "n2",
    kind: "flow",
    authorId: "sheng",
    roles: ["作词"],
    title: "主歌 + 副歌词",
    changeNote: "写了主歌和副歌，主题是「像小黄花一样想你」。",
    media: [
      { kind: "sound", duration: 66 },
      { kind: "text", text: "在人潮中缓慢地换气，缓慢地遇见，缓慢又热烈地爱上对方。" },
    ],
    fragmentRefs: ["frag-text"],
    createdAt: now - 15 * DAY,
  },
  {
    id: "n6",
    flowId: "p1",
    parentId: "n4",
    kind: "flow",
    authorId: "aqueen",
    roles: ["演唱", "混音"],
    title: "完成 · 轻柔版",
    changeNote: "气声主唱 + 干净混音，走温柔治愈路线。",
    media: [{ kind: "sound", duration: 191 }],
    fragmentRefs: [],
    completed: true,
    completedLabel: "轻柔版",
    createdAt: now - 12 * DAY,
  },
  {
    id: "n5",
    flowId: "p1",
    parentId: "n2",
    kind: "flow",
    authorId: "aqueen",
    roles: ["混音"],
    title: "鼓组加重 · 副歌抬升",
    changeNote: "把鼓做厚，副歌整体抬 3dB，更有冲击力。",
    media: [{ kind: "sound", duration: 70 }],
    fragmentRefs: [],
    createdAt: now - 11 * DAY,
  },
  {
    id: "n7",
    flowId: "p1",
    parentId: "n5",
    kind: "flow",
    authorId: "ayon",
    roles: ["编曲", "混音"],
    title: "完成 · 热烈版",
    changeNote: "加入合成器 lead 与掌声采样，做成派对热烈版。",
    media: [{ kind: "sound", duration: 178 }],
    fragmentRefs: [],
    completed: true,
    completedLabel: "热烈版",
    createdAt: now - 9 * DAY,
  },
  // 分支 B
  {
    id: "n3",
    flowId: "p1",
    parentId: "n1",
    kind: "flow",
    authorId: "sheng",
    roles: ["编曲", "视觉"],
    title: "实验编曲 · 色块 groove",
    changeNote: "受蒙德里安色块启发，用切片采样做了实验性 groove。",
    media: [
      { kind: "sound", duration: 55 },
      { kind: "pic", src: IMG("mondrian-groove", 600, 480) },
    ],
    fragmentRefs: ["frag-pic"], // 虚线：引用图片碎片
    createdAt: now - 14 * DAY,
  },
  {
    id: "n8",
    flowId: "p1",
    parentId: "n3",
    kind: "flow",
    authorId: "sheng",
    roles: ["编曲", "混音"],
    title: "完成 · 实验版",
    changeNote: "保留 glitch 质感，做成 art-pop 实验版。",
    media: [{ kind: "sound", duration: 166 }],
    fragmentRefs: [],
    completed: true,
    completedLabel: "实验版",
    createdAt: now - 7 * DAY,
  },
  // 分支 C
  {
    id: "n9",
    flowId: "p1",
    parentId: "n1",
    kind: "flow",
    authorId: "chen",
    roles: ["编曲"],
    title: "8-bit 改编",
    changeNote: "把主旋律改成芯片音乐音色，准备做游戏化版本。",
    media: [{ kind: "sound", duration: 58 }],
    fragmentRefs: [],
    createdAt: now - 6 * DAY,
  },
  {
    id: "n10",
    flowId: "p1",
    parentId: "n9",
    kind: "flow",
    authorId: "chen",
    roles: ["编曲", "混音"],
    title: "完成 · 游戏化版本",
    changeNote: "加入 8-bit 打击与过关音效，做成节奏游戏 BGM。",
    media: [{ kind: "sound", duration: 149 }],
    fragmentRefs: [],
    completed: true,
    completedLabel: "游戏化版本",
    createdAt: now - 4 * DAY,
  },
];

// 第二个源项目（display-only，用于演示禁止续作的门禁）
const proj2Nodes: FlowNode[] = [
  {
    id: "m1",
    flowId: "p2",
    parentId: null,
    kind: "source",
    authorId: "ayon",
    roles: ["编曲"],
    title: "源 · City Lights, Fading",
    changeNote: "夜跑时想到的 synthwave 主线，先占个坑。",
    media: [{ kind: "sound", duration: 40 }],
    fragmentRefs: [],
    createdAt: now - 8 * DAY,
  },
  {
    id: "m2",
    flowId: "p2",
    parentId: "m1",
    kind: "flow",
    authorId: "ayon",
    roles: ["编曲", "混音"],
    title: "完整编曲 demo",
    changeNote: "补齐了 bassline 和 pad。",
    media: [{ kind: "sound", duration: 132 }],
    fragmentRefs: [],
    createdAt: now - 5 * DAY,
  },
];

// 旧稿中「mixed color」图片与文字的关联仍然成立：它从视觉碎片长成节奏与影像。
const mixedColorNodes: FlowNode[] = [
  {
    id: "x1",
    flowId: "p3",
    parentId: null,
    kind: "source",
    authorId: "thinker",
    roles: ["视觉"],
    title: "源 · mixed color",
    changeNote: "黑、黄、红的碰撞，把复杂情绪压缩成直接的色感。",
    media: [{ kind: "pic", src: IMG("mixed-color-source", 900, 1200) }],
    fragmentRefs: ["frag-pic"],
    createdAt: now - 13 * DAY,
  },
  {
    id: "x2",
    flowId: "p3",
    parentId: "x1",
    kind: "flow",
    authorId: "sheng",
    roles: ["编曲"],
    title: "把色块切成节奏",
    changeNote: "用三个主色对应三组鼓点，让画面的冲突变成 beat。",
    media: [{ kind: "sound", duration: 54 }],
    fragmentRefs: [],
    createdAt: now - 11 * DAY,
  },
  {
    id: "x3",
    flowId: "p3",
    parentId: "x1",
    kind: "flow",
    authorId: "ayon",
    roles: ["视觉", "混音"],
    title: "低饱和影像版",
    changeNote: "保留原图的流动方向，把颜色压暗，声音换成更克制的 texture。",
    media: [{ kind: "sound", duration: 67 }],
    fragmentRefs: [],
    createdAt: now - 9 * DAY,
  },
  {
    id: "x4",
    flowId: "p3",
    parentId: "x2",
    kind: "flow",
    authorId: "aqueen",
    roles: ["演唱", "混音"],
    title: "完成 · Color rhythm",
    changeNote: "加入切片人声，让色彩变化与呼吸节奏对齐。",
    media: [{ kind: "sound", duration: 142 }],
    fragmentRefs: [],
    completed: true,
    completedLabel: "Color rhythm",
    createdAt: now - 6 * DAY,
  },
  {
    id: "x5",
    flowId: "p3",
    parentId: "x3",
    kind: "flow",
    authorId: "thinker",
    roles: ["视觉"],
    title: "完成 · Afterimage",
    changeNote: "用残影和慢速位移做成可循环的封面动画。",
    media: [{ kind: "pic", src: IMG("mixed-color-source", 900, 1200) }],
    fragmentRefs: [],
    completed: true,
    completedLabel: "Afterimage",
    createdAt: now - 3 * DAY,
  },
];

type FlowSeed = {
  title: string;
  description: string;
  cover: string;
  tags: string[];
  ownerId: string;
  sourceKind: MediaKind;
  roles: Role[];
};

const EXTRA_FLOW_SEEDS: FlowSeed[] = [
  { title: "凌晨四点的便利店", description: "冰柜低鸣、雨声和一小段没唱完的旋律。", cover: "xd-neon-profile", tags: ["城市", "氛围", "lo-fi"], ownerId: "sheng", sourceKind: "sound", roles: ["作词", "编曲"] },
  { title: "蓝色回声", description: "从冷色人像出发，把轮廓续成缓慢扩散的合成器。", cover: "xd-neon-glasses", tags: ["冷色", "电子", "视觉"], ownerId: "thinker", sourceKind: "pic", roles: ["视觉", "编曲"] },
  { title: "风经过旧操场", description: "一段木吉他和夏末风声，等待新的主唱。", cover: "xd-pastel-dunes-wide", tags: ["民谣", "夏天", "人声"], ownerId: "ayon", sourceKind: "sound", roles: ["乐器", "演唱"] },
  { title: "红墙以外", description: "水墨与低频鼓点之间的跨媒介续作。", cover: "xd-red-temple", tags: ["实验", "东方", "视觉"], ownerId: "sheng", sourceKind: "pic", roles: ["视觉", "混音"] },
  { title: "候鸟电台", description: "把鸟鸣、短波噪声和手写歌词放进同一条流。", cover: "xd-color-bird", tags: ["采样", "自然", "叙事"], ownerId: "aqueen", sourceKind: "sound", roles: ["演唱", "作词"] },
  { title: "失重练习", description: "从运动残影里提取节奏，让画面和鼓点一起加速。", cover: "xd-motion-basketball", tags: ["节奏", "能量", "影像"], ownerId: "chen", sourceKind: "pic", roles: ["编曲", "视觉"] },
  { title: "柔软地形", description: "低饱和沙丘、气声与颗粒合成器的缓慢生长。", cover: "xd-pastel-dunes-square", tags: ["梦境", "氛围", "低饱和"], ownerId: "thinker", sourceKind: "pic", roles: ["视觉", "混音"] },
  { title: "猫在黄色屋顶", description: "轻快切片、猫叫采样和可以继续写下去的副歌。", cover: "xd-cats-poster", tags: ["轻快", "采样", "流行"], ownerId: "ayon", sourceKind: "sound", roles: ["编曲", "作词"] },
  { title: "无人接听", description: "从一句留言开始，逐渐长成克制的都市情歌。", cover: "city-lights-cover", tags: ["文字", "情歌", "城市"], ownerId: "aqueen", sourceKind: "text", roles: ["作词", "演唱"] },
];

const generatedProjects: FlowProject[] = EXTRA_FLOW_SEEDS.map((seed, index) => {
  const flowId = `demo-flow-${index + 1}`;
  return {
    id: flowId,
    title: seed.title,
    cover: IMG(seed.cover),
    visualTone: index % 3 === 0 ? "blue" : index % 3 === 1 ? "mist" : "graphite",
    description: seed.description,
    license: index === 7 ? "noncommercial" : "attribution",
    ownerId: seed.ownerId,
    sourceNodeId: `${flowId}-source`,
    tags: seed.tags,
    likes: 86 + index * 31,
    saves: 18 + index * 9,
    createdAt: now - (index + 2) * DAY,
  };
});

const generatedNodes: FlowNode[] = EXTRA_FLOW_SEEDS.flatMap((seed, index) => {
  const flowId = `demo-flow-${index + 1}`;
  const sourceId = `${flowId}-source`;
  const sourceMedia = seed.sourceKind === "pic"
    ? [{ kind: "pic" as const, src: IMG(seed.cover) }]
    : seed.sourceKind === "text"
      ? [{ kind: "text" as const, text: "有些声音没有被接起，却在夜里慢慢长成一首歌。" }]
      : [{ kind: "sound" as const, duration: 36 + index * 3 }];
  return [
    {
      id: sourceId,
      flowId,
      parentId: null,
      kind: "source" as const,
      authorId: seed.ownerId,
      roles: [seed.roles[0]],
      title: `源 · ${seed.title}`,
      changeNote: seed.description,
      media: sourceMedia,
      fragmentRefs: [],
      createdAt: now - (index + 12) * DAY,
    },
    {
      id: `${flowId}-branch-a`,
      flowId,
      parentId: sourceId,
      kind: "flow" as const,
      authorId: index % 2 ? "chen" : "ayon",
      roles: [seed.roles[1] ?? seed.roles[0]],
      title: "第一条续作 · 重新组织结构",
      changeNote: "保留源的情绪，把节奏、段落和留白重新组织了一遍。",
      media: [{ kind: "sound" as const, duration: 58 + index * 4 }],
      fragmentRefs: [],
      createdAt: now - (index + 7) * DAY,
    },
    {
      id: `${flowId}-branch-b`,
      flowId,
      parentId: sourceId,
      kind: "flow" as const,
      authorId: index % 2 ? "thinker" : "sheng",
      roles: index % 2 ? ["视觉" as const] : ["作词" as const],
      title: index % 2 ? "另一种画面方向" : "补写一段叙事",
      changeNote: index % 2 ? "从源的色彩关系延伸出更克制的画面。" : "沿着源里的情绪补写了新的叙事线索。",
      media: index % 2 ? [{ kind: "pic" as const, src: IMG(seed.cover) }] : [{ kind: "text" as const, text: "让没有说完的部分留在风里，等下一个人继续。" }],
      fragmentRefs: [],
      createdAt: now - (index + 4) * DAY,
    },
  ];
});

const TEXT_INSPIRATIONS = [
  "天快亮的时候，城市像一台刚刚停下来的机器。",
  "我们没有告别，只是把最后一句话留在了雨里。",
  "风从旧操场穿过去，带走一小段没有写完的副歌。",
  "如果月亮也有背面，那里会不会存着所有没寄出的信。",
  "人群散开以后，我才听见鞋底和地面交换秘密。",
  "把沉默切成四拍，第二拍留给呼吸。",
  "凌晨的便利店里，冰柜替每个人保守秘密。",
  "有一只鸟停在电线上，像乐谱里迟迟不肯落下的音。",
  "蓝色不是一种颜色，是记忆降温后的声音。",
  "我们沿着同一条河走，却在不同的梦里到达海边。",
  "旧磁带转到空白处，仍然能听见房间里的风。",
  "请把我的名字唱得轻一点，不要惊醒昨天。",
  "所有错过的车站，最后都变成了故事的转调。",
  "雨滴落在铁皮屋顶上，像一支没有指挥的鼓队。",
  "我想写一首没有结尾的歌，让每个人都能续上一句。",
  "晚霞退场以后，楼群开始练习另一种呼吸。",
  "那天的风很慢，慢到足够我们重新认识彼此。",
  "把白噪声开大一点，我想听清楚孤独的轮廓。",
  "灯熄灭之前，影子先替我们拥抱了一次。",
  "如果重逢有声音，它应该像唱针落下的第一秒。",
];

const SOUND_INSPIRATIONS = ["玻璃杯边缘的高频", "雨棚下的四拍", "旧电梯低频循环", "口袋里的节拍器", "短波电台残响", "楼道脚步采样", "木吉他未完成和弦", "清晨鸟鸣切片", "地铁进站的低鸣", "呼吸与磁带底噪"];
const PIC_INSPIRATIONS = ["冷色夜行肖像", "玻璃房间的反光", "春日鸟鸣配色", "运动残影构图", "青绿沙丘纹理", "清晨地平线", "红黑山寺", "黄色猫群轨迹", "蒙德里安节奏", "陌生城市速写"];
const PIC_ASSETS = ["xd-neon-profile", "xd-neon-glasses", "xd-color-bird", "xd-motion-basketball", "xd-pastel-dunes-square", "xd-pastel-dunes-wide", "xd-red-temple", "xd-cats-poster", "mondrian-fragment", "romantic-sketch"];

const generatedFragments: Fragment[] = [
  ...TEXT_INSPIRATIONS.map((text, index) => ({ id: `text-inspiration-${index + 1}`, authorId: ["sheng", "ayon", "chen", "aqueen", "thinker"][index % 5], title: `文字碎片 ${String(index + 1).padStart(2, "0")}`, media: { kind: "text" as const, text }, createdAt: now - index * 3_600_000 })),
  ...SOUND_INSPIRATIONS.map((title, index) => ({ id: `sound-inspiration-${index + 1}`, authorId: ["chen", "ayon", "aqueen", "sheng"][index % 4], title, media: { kind: "sound" as const, duration: 8 + index * 3 }, createdAt: now - (index + 24) * 3_600_000 })),
  ...PIC_INSPIRATIONS.map((title, index) => ({ id: `pic-inspiration-${index + 1}`, authorId: ["thinker", "sheng", "ayon"][index % 3], title, media: { kind: "pic" as const, src: IMG(PIC_ASSETS[index]) }, createdAt: now - (index + 36) * 3_600_000 })),
];

function keyBy<T extends { id: string }>(arr: T[]): Record<string, T> {
  return Object.fromEntries(arr.map((x) => [x.id, x]));
}

export function createSeedState(): AppState {
  return {
    version: 1,
    currentUserId: "chen",
    users: keyBy([
      {
        id: "chen",
        name: "Chen",
        handle: "@chen_beats",
        avatar: IMG("chen-avatar", 200, 200),
        bio: "beat maker · 喜欢温暖的 lo-fi",
        roles: ["编曲", "混音"],
        followingIds: ["ayon", "sheng"],
      },
      {
        id: "ayon",
        name: "Ayon",
        handle: "@ayon",
        avatar: IMG("ayon-avatar", 200, 200),
        bio: "编曲人 / synth 爱好者",
        roles: ["编曲", "混音"],
        followingIds: ["chen", "aqueen"],
      },
      {
        id: "sheng",
        name: "SHENG",
        handle: "@sheng.w",
        avatar: IMG("sheng-avatar", 200, 200),
        bio: "写词的人，也做实验声音",
        roles: ["作词", "视觉"],
        followingIds: ["chen"],
      },
      {
        id: "aqueen",
        name: "Aqueen",
        handle: "@aqueen",
        avatar: IMG("aqueen-avatar", 200, 200),
        bio: "混音师 & 主唱",
        roles: ["混音", "演唱"],
        followingIds: ["ayon", "chen"],
      },
      {
        id: "thinker",
        name: "Thinker",
        handle: "@thinker.visual",
        avatar: IMG("thinker-avatar", 200, 200),
        bio: "把颜色、图像与声音放进同一条流里",
        roles: ["视觉", "编曲"],
        followingIds: ["sheng", "chen"],
      },
    ]),
    fragments: keyBy([
      {
        id: "frag-drum",
        authorId: "chen",
        title: "四拍鼓点 loop",
        media: { kind: "sound", duration: 8 },
        createdAt: now - 22 * DAY,
      },
      {
        id: "frag-pic",
        authorId: "sheng",
        title: "蒙德里安色块",
        media: { kind: "pic", src: IMG("mondrian-fragment", 600, 480) },
        createdAt: now - 21 * DAY,
      },
      {
        id: "frag-text",
        authorId: "ayon",
        title: "一句歌词灵感",
        media: { kind: "text", text: "「在人潮中缓慢地换气，缓慢地遇见。」" },
        createdAt: now - 19 * DAY,
      },
      {
        id: "frag-sketch",
        authorId: "chen",
        title: "陌生城市里的两个人",
        media: { kind: "pic", src: IMG("romantic-sketch", 900, 675) },
        createdAt: now - 18 * DAY,
      },
      {
        id: "frag-visual-neon-profile",
        authorId: "thinker",
        title: "冷色霓虹 · 夜行肖像",
        media: { kind: "pic", src: IMG("xd-neon-profile") },
        createdAt: now - 17 * DAY,
      },
      {
        id: "frag-visual-neon-glasses",
        authorId: "sheng",
        title: "高对比色 · 玻璃房间",
        media: { kind: "pic", src: IMG("xd-neon-glasses") },
        createdAt: now - 16 * DAY,
      },
      {
        id: "frag-visual-color-bird",
        authorId: "ayon",
        title: "暖色鸟鸣 · 春日插画",
        media: { kind: "pic", src: IMG("xd-color-bird") },
        createdAt: now - 15 * DAY,
      },
      {
        id: "frag-visual-motion",
        authorId: "chen",
        title: "运动残影 · 人物构图",
        media: { kind: "pic", src: IMG("xd-motion-basketball") },
        createdAt: now - 14 * DAY,
      },
      {
        id: "frag-visual-dunes-square",
        authorId: "thinker",
        title: "低饱和梦境 · 青绿沙丘",
        media: { kind: "pic", src: IMG("xd-pastel-dunes-square") },
        createdAt: now - 13 * DAY,
      },
      {
        id: "frag-visual-dunes-wide",
        authorId: "aqueen",
        title: "冷色地平线 · 清晨纹理",
        media: { kind: "pic", src: IMG("xd-pastel-dunes-wide") },
        createdAt: now - 12 * DAY,
      },
      {
        id: "frag-visual-red-temple",
        authorId: "sheng",
        title: "红黑山寺 · 水墨构图",
        media: { kind: "pic", src: IMG("xd-red-temple") },
        createdAt: now - 11 * DAY,
      },
      {
        id: "frag-visual-cats",
        authorId: "ayon",
        title: "暖黄色 · 猫群轨迹",
        media: { kind: "pic", src: IMG("xd-cats-poster") },
        createdAt: now - 10 * DAY,
      },
      {
        id: "frag-sound-yellow-song",
        authorId: "chen",
        title: "浪漫主义小黄歌 · 主歌哼唱",
        media: { kind: "sound", duration: 18 },
        createdAt: now - 9 * DAY,
      },
      {
        id: "frag-sound-long-ago",
        authorId: "ayon",
        title: "很久很久 · 钢琴旋律动机",
        media: { kind: "sound", duration: 24 },
        createdAt: now - 8 * DAY,
      },
      {
        id: "frag-sound-qingcheng",
        authorId: "sheng",
        title: "青城山下 · 弦乐采样",
        media: { kind: "sound", duration: 13 },
        createdAt: now - 7 * DAY,
      },
      {
        id: "frag-sound-china-x",
        authorId: "thinker",
        title: "China X · 城市节拍 Loop",
        media: { kind: "sound", duration: 31 },
        createdAt: now - 6 * DAY,
      },
      {
        id: "frag-sound-blank",
        authorId: "aqueen",
        title: "空白 · 呼吸人声",
        media: { kind: "sound", duration: 11 },
        createdAt: now - 5 * DAY,
      },
      {
        id: "frag-sound-family",
        authorId: "chen",
        title: "FAMILY · 鼓组切片",
        media: { kind: "sound", duration: 16 },
        createdAt: now - 4 * DAY,
      },
      {
        id: "frag-sound-dry",
        authorId: "ayon",
        title: "天干物燥 · 低频节奏",
        media: { kind: "sound", duration: 27 },
        createdAt: now - 3 * DAY,
      },
      {
        id: "frag-sound-growing",
        authorId: "aqueen",
        title: "负重一万斤长大 · 气声片段",
        media: { kind: "sound", duration: 21 },
        createdAt: now - 2 * DAY,
      },
      ...generatedFragments,
    ]),
    projects: keyBy([
      {
        id: "p1",
        title: "Romantic little yellow song",
        cover: IMG("romantic-blue-source", 900, 1200),
        visualTone: "blue",
        description:
          "这个 beat 有很强的宇宙感和迷茫感。两个灵魂在人潮中缓慢遇见，再由不同音乐人续成长出新的版本。",
        license: "attribution",
        ownerId: "chen",
        sourceNodeId: "n1",
        tags: ["流行", "情歌", "lo-fi"],
        likes: 328,
        saves: 96,
        createdAt: now - 20 * DAY,
      },
      {
        id: "p2",
        title: "City Lights, Fading",
        cover: IMG("city-lights-cover", 900, 540),
        visualTone: "mist",
        description: "夜跑时的 synthwave 小样。仅展示，暂不开放续作。",
        license: "display-only",
        ownerId: "ayon",
        sourceNodeId: "m1",
        tags: ["电子", "synthwave"],
        likes: 140,
        saves: 33,
        createdAt: now - 8 * DAY,
      },
      {
        id: "p3",
        title: "mixed color",
        cover: IMG("mixed-color-source", 900, 1200),
        visualTone: "graphite",
        description: "黑、黄、红在同一张图里互相推挤。它从一块视觉碎片出发，被续成节奏、声音与循环影像。",
        license: "attribution",
        ownerId: "thinker",
        sourceNodeId: "x1",
        tags: ["视觉", "实验", "art-pop"],
        likes: 247,
        saves: 71,
        createdAt: now - 13 * DAY,
      },
      ...generatedProjects,
    ]),
    nodes: keyBy([...mainNodes, ...proj2Nodes, ...mixedColorNodes, ...generatedNodes]),
    comments: [
      { id: "c1", targetId: "p1", authorId: "ayon", text: "这个 beat 太上头了，我来加编曲！", createdAt: now - 17 * DAY },
      { id: "c2", targetId: "p1", authorId: "sheng", text: "副歌词我已经在写了 👀", createdAt: now - 15 * DAY },
      { id: "c3", targetId: "p1", authorId: "aqueen", text: "轻柔版真的好治愈，单曲循环。", createdAt: now - 11 * DAY },
      { id: "c4", targetId: "p1", authorId: "chen", text: "没想到还能长出游戏化版本，太有意思了。", createdAt: now - 4 * DAY },
      { id: "c5", targetId: "frag-pic", authorId: "chen", text: "这个色块可以做成 MV 视觉。", createdAt: now - 20 * DAY },
      { id: "c6", targetId: "p2", authorId: "sheng", text: "求开放续作，我想加人声！", createdAt: now - 6 * DAY },
      { id: "c7", targetId: "p3", authorId: "sheng", text: "这种色彩像一段有规律的鼓点。", createdAt: now - 10 * DAY },
      { id: "c8", targetId: "p3", authorId: "ayon", text: "我想把画面的流动方向做成声像移动。", createdAt: now - 8 * DAY },
    ],
    drafts: keyBy([
      {
        id: "d1",
        kind: "continue",
        flowId: "p1",
        parentNodeId: "n6",
        authorId: "chen",
        title: "",
        roles: ["混音"],
        changeNote: "想给轻柔版做一个更空灵的 reverb 尾奏……",
        media: [],
        fragmentRefs: [],
        updatedAt: now - 2 * DAY,
      },
      {
        id: "d2",
        kind: "source",
        authorId: "chen",
        title: "雨天钢琴即兴",
        roles: ["编曲"],
        changeNote: "",
        media: [{ kind: "sound", duration: 33 }],
        fragmentRefs: [],
        updatedAt: now - 1 * DAY,
      },
      {
        id: "d3",
        kind: "fragment",
        authorId: "chen",
        title: "地铁里的旋律哼唱",
        roles: [],
        changeNote: "",
        media: [{ kind: "sound", duration: 12 }],
        fragmentRefs: [],
        updatedAt: now - 3600000,
      },
      {
        id: "d4",
        kind: "continue",
        flowId: "p1",
        parentNodeId: "n8",
        authorId: "chen",
        title: "实验版 + 人声切片",
        roles: ["演唱", "编曲"],
        changeNote: "把人声切成 glitch 素材铺在实验版上。",
        media: [{ kind: "sound", duration: 90 }],
        fragmentRefs: ["frag-text"],
        updatedAt: now - 5 * 3600000,
      },
    ]),
    engagement: {
      p1: { liked: true, saved: false },
    },
  };
}
