// ── 持久化仓库（后端接缝）───────────────────────────────────────────────
// 当前实现 = Local Storage。未来切换到 Supabase / Firebase / 自建 API 时，
// 只需替换本文件的 loadState / saveState 实现，上层 store 无需改动。
// TODO: swap for Supabase/API — 保持相同的 AppState 形状即可。

import type { AppState } from "./types";
import { createSeedState } from "./seed";

// 独立命名空间，避免作为 iframe 嵌入作品集时与宿主站点的数据冲突。
const STORAGE_KEY = "flow.app.store.v1";

function refreshBundledAssets(state: AppState): AppState {
  const seed = createSeedState();
  const users = { ...seed.users, ...state.users };
  const projects = { ...seed.projects, ...state.projects };
  const fragments = { ...seed.fragments, ...state.fragments };
  const nodes = { ...seed.nodes, ...state.nodes };

  // 内置演示内容跟随版本更新；用户自己发布的项目、节点和草稿继续保留。
  for (const id of Object.keys(seed.users)) {
    users[id] = { ...(state.users[id] ?? {}), ...seed.users[id] };
  }
  for (const id of Object.keys(seed.projects)) {
    projects[id] = { ...(state.projects[id] ?? {}), ...seed.projects[id] };
  }
  for (const id of Object.keys(seed.fragments)) {
    fragments[id] = { ...(state.fragments[id] ?? {}), ...seed.fragments[id] };
  }
  for (const id of Object.keys(seed.nodes)) {
    nodes[id] = { ...(state.nodes[id] ?? {}), ...seed.nodes[id] };
  }

  const knownCommentIds = new Set(state.comments.map((comment) => comment.id));
  const comments = [
    ...state.comments,
    ...seed.comments.filter((comment) => !knownCommentIds.has(comment.id)),
  ];

  return { ...state, users, projects, fragments, nodes, comments };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSeedState();
      saveState(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1) {
      const seeded = createSeedState();
      saveState(seeded);
      return seeded;
    }
    const refreshed = refreshBundledAssets(parsed);
    saveState(refreshed);
    return refreshed;
  } catch {
    return createSeedState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 忽略配额 / 隐私模式错误
  }
}

export function resetState(): AppState {
  const seeded = createSeedState();
  saveState(seeded);
  return seeded;
}
