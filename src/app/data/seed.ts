import type { AppState, FlowNode } from "./types";
import chenAvatar from "../../assets/content/avatars/chen.jpg";
import ayonAvatar from "../../assets/content/avatars/ayon.jpg";
import shengAvatar from "../../assets/content/avatars/sheng.jpg";
import aqueenAvatar from "../../assets/content/avatars/aqueen.jpg";
import yellowSongCover from "../../assets/content/covers/yellow-song-cover.jpg";
import cityLightsCover from "../../assets/content/covers/city-lights-cover.jpg";
import mondrianGroove from "../../assets/content/fragments/mondrian-groove.jpg";
import mondrianFragment from "../../assets/content/fragments/mondrian-fragment.jpg";

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
    media: [{ kind: "sound", duration: 48 }],
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
      { kind: "text", text: "像小黄花一样，在风里想你……" },
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
        media: { kind: "text", text: "「像小黄花一样，在风里想你」" },
        createdAt: now - 19 * DAY,
      },
    ]),
    projects: keyBy([
      {
        id: "p1",
        title: "Romantic little yellow song",
        cover: IMG("yellow-song-cover", 900, 540),
        description:
          "一段温暖的小情歌，从一个 lo-fi beat 开始，欢迎不同角色的音乐人续流，长出属于自己的版本。",
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
        description: "夜跑时的 synthwave 小样。仅展示，暂不开放续作。",
        license: "display-only",
        ownerId: "ayon",
        sourceNodeId: "m1",
        tags: ["电子", "synthwave"],
        likes: 140,
        saves: 33,
        createdAt: now - 8 * DAY,
      },
    ]),
    nodes: keyBy([...mainNodes, ...proj2Nodes]),
    comments: [
      { id: "c1", targetId: "p1", authorId: "ayon", text: "这个 beat 太上头了，我来加编曲！", createdAt: now - 17 * DAY },
      { id: "c2", targetId: "p1", authorId: "sheng", text: "副歌词我已经在写了 👀", createdAt: now - 15 * DAY },
      { id: "c3", targetId: "p1", authorId: "aqueen", text: "轻柔版真的好治愈，单曲循环。", createdAt: now - 11 * DAY },
      { id: "c4", targetId: "p1", authorId: "chen", text: "没想到还能长出游戏化版本，太有意思了。", createdAt: now - 4 * DAY },
      { id: "c5", targetId: "frag-pic", authorId: "chen", text: "这个色块可以做成 MV 视觉。", createdAt: now - 20 * DAY },
      { id: "c6", targetId: "p2", authorId: "sheng", text: "求开放续作，我想加人声！", createdAt: now - 6 * DAY },
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
