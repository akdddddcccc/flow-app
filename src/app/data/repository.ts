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
  const users = { ...state.users };
  for (const id of ["chen", "ayon", "sheng", "aqueen"]) {
    if (users[id] && seed.users[id]) {
      users[id] = { ...users[id], avatar: seed.users[id].avatar };
    }
  }

  const projects = { ...state.projects };
  for (const id of ["p1", "p2"]) {
    if (projects[id] && seed.projects[id]) {
      projects[id] = { ...projects[id], cover: seed.projects[id].cover };
    }
  }

  const fragments = { ...state.fragments };
  if (fragments["frag-pic"] && seed.fragments["frag-pic"]) {
    fragments["frag-pic"] = {
      ...fragments["frag-pic"],
      media: seed.fragments["frag-pic"].media,
    };
  }

  const nodes = { ...state.nodes };
  if (nodes.n3 && seed.nodes.n3) {
    nodes.n3 = { ...nodes.n3, media: seed.nodes.n3.media };
  }

  return { ...state, users, projects, fragments, nodes };
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
