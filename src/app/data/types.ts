// ── Flow / 流 · 领域类型 ────────────────────────────────────────────────
// 协作式音乐创作 App 的核心数据模型。一段音乐从「灵感碎片 → 源 → 多人续作
// → 多个完成版本」的过程，被保存成一棵可追溯、可分支、绝不覆盖原作的版本树。

export type Role = "编曲" | "作词" | "演唱" | "混音" | "乐器" | "视觉";
export const ROLE_LIST: Role[] = ["编曲", "作词", "演唱", "混音", "乐器", "视觉"];

export type MediaKind = "sound" | "pic" | "text";

/**
 * 首页流卡片的视觉语气。它不是任意品牌色，而是把封面主色收敛到
 * 蓝 / 冷灰 / 石墨黑三档，保证内容相关又不破坏整体识别。
 */
export type FlowCardTone = "blue" | "mist" | "graphite";

/** 授权：源发布时必选，决定他人能否续作。 */
export type License = "display-only" | "attribution" | "noncommercial" | "custom";

export const LICENSE_LABEL: Record<License, string> = {
  "display-only": "仅展示 · 不允许续作",
  attribution: "允许续作 · 必须署名",
  noncommercial: "允许非商业续作 · 必须署名",
  custom: "自定义授权",
};

export interface Media {
  kind: MediaKind;
  src?: string; // 图片 / 音频（演示中音频为占位，用时长模拟）
  text?: string; // 文字型内容
  duration?: number; // 音频秒数（模拟播放进度用）
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  roles: Role[];
  followingIds: string[];
}

/** 灵感碎片：尚未形成完整音乐性的文字 / 图片 / 旋律 / 鼓点。 */
export interface Fragment {
  id: string;
  authorId: string;
  title: string;
  media: Media; // 碎片是单一媒介
  createdAt: number;
}

/**
 * 流节点：一次续作产生的新版本。
 * - parentId === null 表示这是「源」，即版本树根节点。
 * - 父子关系（parentId）在视觉上用**实线**表示。
 * - fragmentRefs 指向引用的灵感碎片，在视觉上用**虚线**表示。
 * 续流永远只新增子节点，绝不覆盖父节点。
 */
export interface FlowNode {
  id: string;
  flowId: string;
  parentId: string | null;
  kind: "source" | "flow";
  authorId: string;
  roles: Role[];
  title: string;
  changeNote: string; // 「这次做了什么改变」
  media: Media[];
  fragmentRefs: string[]; // 虚线引用
  completed?: boolean;
  completedLabel?: string; // 轻柔版 / 热烈版 / 实验版 / 游戏化版本
  createdAt: number;
}

/** 流项目：围绕一个源形成的完整创作版本树的元信息。 */
export interface FlowProject {
  id: string;
  title: string;
  cover: string;
  visualTone?: FlowCardTone;
  description: string;
  license: License;
  licenseNote?: string;
  ownerId: string;
  sourceNodeId: string;
  tags: string[];
  likes: number;
  saves: number;
  createdAt: number;
}

export interface Comment {
  id: string;
  targetId: string; // flowId 或 fragmentId
  authorId: string;
  text: string;
  createdAt: number;
}

/** 草稿：自动保存的未发布续作 / 灵感 / 源。 */
export interface Draft {
  id: string;
  kind: "fragment" | "source" | "continue";
  // continue 类型：目标流与父节点
  flowId?: string;
  parentNodeId?: string;
  authorId: string;
  title: string;
  roles: Role[];
  changeNote: string;
  media: Media[];
  fragmentRefs: string[];
  completedLabel?: string;
  updatedAt: number;
}

/** 每个内容对象的本地互动状态（点赞 / 收藏）。 */
export interface Engagement {
  liked: boolean;
  saved: boolean;
}

export interface AppState {
  version: 1;
  currentUserId: string;
  users: Record<string, User>;
  fragments: Record<string, Fragment>;
  projects: Record<string, FlowProject>;
  nodes: Record<string, FlowNode>;
  comments: Comment[];
  drafts: Record<string, Draft>;
  engagement: Record<string, Engagement>; // key = flowId | fragmentId
}
