// ── FlowStore：全局状态（Context + reducer）──────────────────────────────
// 启动时从 Local Storage 读取（为空写入 seed）；每次 dispatch 后持久化。
// 所有页面通过 useFlowStore() 读写，绝不硬编码数据。
// 关键不变量：续流只新增子节点，reducer 绝不修改父节点 / 他人节点。

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AppState,
  Draft,
  FlowNode,
  Media,
  Role,
  License,
  Engagement,
} from "./types";
import { loadState, saveState, resetState } from "./repository";

let idCounter = 0;
const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

// ── Actions ──────────────────────────────────────────────────────────────
export type Action =
  | {
      type: "publishContinue";
      id?: string; // 预生成节点 id，便于发布后高亮聚焦
      flowId: string;
      parentNodeId: string;
      roles: Role[];
      title: string;
      changeNote: string;
      media: Media[];
      fragmentRefs: string[];
      completedLabel?: string;
      draftId?: string; // 发布来源草稿，发布后删除
    }
  | {
      type: "publishSource";
      title: string;
      description: string;
      cover: string;
      license: License;
      roles: Role[];
      changeNote: string;
      media: Media[];
      fragmentRefs: string[];
      draftId?: string;
    }
  | {
      type: "publishFragment";
      title: string;
      media: Media;
      draftId?: string;
    }
  | { type: "saveDraft"; draft: Draft }
  | { type: "deleteDraft"; id: string }
  | { type: "toggleLike"; id: string }
  | { type: "toggleSave"; id: string }
  | { type: "addComment"; targetId: string; text: string }
  | { type: "reset" };

function reducer(state: AppState, action: Action): AppState {
  const me = state.currentUserId;

  switch (action.type) {
    case "publishContinue": {
      const parent = state.nodes[action.parentNodeId];
      if (!parent) return state; // 父节点不存在则忽略
      const node: FlowNode = {
        id: action.id ?? uid("n"),
        flowId: action.flowId,
        parentId: action.parentNodeId, // 实线父子
        kind: "flow",
        authorId: me,
        roles: action.roles,
        title: action.title || "未命名续流",
        changeNote: action.changeNote,
        media: action.media,
        fragmentRefs: action.fragmentRefs,
        completed: !!action.completedLabel,
        completedLabel: action.completedLabel,
        createdAt: Date.now(),
      };
      // 只新增，绝不改动父节点
      const drafts = { ...state.drafts };
      if (action.draftId) delete drafts[action.draftId];
      return { ...state, nodes: { ...state.nodes, [node.id]: node }, drafts };
    }

    case "publishSource": {
      const flowId = uid("p");
      const source: FlowNode = {
        id: uid("n"),
        flowId,
        parentId: null, // 根 = 源
        kind: "source",
        authorId: me,
        roles: action.roles,
        title: action.title || "未命名源",
        changeNote: action.changeNote,
        media: action.media,
        fragmentRefs: action.fragmentRefs,
        createdAt: Date.now(),
      };
      const project = {
        id: flowId,
        title: action.title || "未命名源",
        cover: action.cover,
        description: action.description,
        license: action.license,
        ownerId: me,
        sourceNodeId: source.id,
        tags: [] as string[],
        likes: 0,
        saves: 0,
        createdAt: Date.now(),
      };
      const drafts = { ...state.drafts };
      if (action.draftId) delete drafts[action.draftId];
      return {
        ...state,
        projects: { ...state.projects, [project.id]: project },
        nodes: { ...state.nodes, [source.id]: source },
        drafts,
      };
    }

    case "publishFragment": {
      const frag = {
        id: uid("frag"),
        authorId: me,
        title: action.title || "未命名灵感",
        media: action.media,
        createdAt: Date.now(),
      };
      const drafts = { ...state.drafts };
      if (action.draftId) delete drafts[action.draftId];
      return {
        ...state,
        fragments: { ...state.fragments, [frag.id]: frag },
        drafts,
      };
    }

    case "saveDraft":
      return {
        ...state,
        drafts: { ...state.drafts, [action.draft.id]: action.draft },
      };

    case "deleteDraft": {
      const drafts = { ...state.drafts };
      delete drafts[action.id];
      return { ...state, drafts };
    }

    case "toggleLike": {
      const cur: Engagement =
        state.engagement[action.id] ?? { liked: false, saved: false };
      return {
        ...state,
        engagement: {
          ...state.engagement,
          [action.id]: { ...cur, liked: !cur.liked },
        },
      };
    }

    case "toggleSave": {
      const cur: Engagement =
        state.engagement[action.id] ?? { liked: false, saved: false };
      return {
        ...state,
        engagement: {
          ...state.engagement,
          [action.id]: { ...cur, saved: !cur.saved },
        },
      };
    }

    case "addComment":
      return {
        ...state,
        comments: [
          ...state.comments,
          {
            id: uid("c"),
            targetId: action.targetId,
            authorId: me,
            text: action.text,
            createdAt: Date.now(),
          },
        ],
      };

    case "reset":
      return resetState();

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
interface StoreValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  newDraftId: () => string;
}

const FlowStoreContext = createContext<StoreValue | null>(null);

export function FlowStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo<StoreValue>(
    () => ({ state, dispatch, newDraftId: () => uid("d") }),
    [state],
  );

  return (
    <FlowStoreContext.Provider value={value}>
      {children}
    </FlowStoreContext.Provider>
  );
}

export function useFlowStore(): StoreValue {
  const ctx = useContext(FlowStoreContext);
  if (!ctx) throw new Error("useFlowStore must be used within FlowStoreProvider");
  return ctx;
}

// ── 选择器（派生数据）──────────────────────────────────────────────────────
export function selectNodesOfFlow(state: AppState, flowId: string): FlowNode[] {
  return Object.values(state.nodes).filter((n) => n.flowId === flowId);
}

/** 续作门禁：display-only 仅所有者可续；其余授权任何人可续。 */
export function canContinue(state: AppState, flowId: string): {
  allowed: boolean;
  reason?: string;
} {
  const project = state.projects[flowId];
  if (!project) return { allowed: false, reason: "找不到该流" };
  if (project.license === "display-only" && project.ownerId !== state.currentUserId) {
    return { allowed: false, reason: "作者设置为「仅展示」，暂不开放续作" };
  }
  return { allowed: true };
}
