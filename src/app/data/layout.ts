// ── Tidy-tree 自动布局（纯函数）─────────────────────────────────────────
// 输入某个 flow 的节点（含 parentId），输出每个节点的 {x, y} 坐标。
// 用经典「叶子顺序分配 x，父节点取子节点均值」的递归算法。
// Flow Map 画布与卡片 mini 预览共用同一套坐标。

import type { FlowNode } from "./types";

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  depth: number;
}

export interface LayoutResult {
  positions: Record<string, LayoutNode>;
  width: number;
  height: number;
  rootId: string | null;
}

export interface LayoutOptions {
  hGap?: number; // 相邻叶子横向间距
  vGap?: number; // 层间纵向间距
}

export function layoutFlow(
  nodes: FlowNode[],
  opts: LayoutOptions = {},
): LayoutResult {
  const hGap = opts.hGap ?? 150;
  const vGap = opts.vGap ?? 150;

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map<string, string[]>();
  let rootId: string | null = null;

  // 按创建时间排序，保证分支左右顺序稳定
  const sorted = [...nodes].sort((a, b) => a.createdAt - b.createdAt);
  for (const n of sorted) {
    if (n.parentId === null || !byId.has(n.parentId)) {
      if (rootId === null) rootId = n.id;
      continue;
    }
    const arr = children.get(n.parentId) ?? [];
    arr.push(n.id);
    children.set(n.parentId, arr);
  }

  const positions: Record<string, LayoutNode> = {};
  let leafCursor = 0;
  let maxDepth = 0;

  const assign = (id: string, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    const kids = children.get(id) ?? [];
    let x: number;
    if (kids.length === 0) {
      x = leafCursor * hGap;
      leafCursor += 1;
    } else {
      const xs = kids.map((k) => assign(k, depth + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    positions[id] = { id, x, y: depth * vGap, depth };
    return x;
  };

  if (rootId) assign(rootId, 0);

  // 处理不在主树上的孤立根（理论上不出现，但稳妥起见）
  for (const n of sorted) {
    if (!positions[n.id]) {
      positions[n.id] = { id: n.id, x: leafCursor * hGap, y: 0, depth: 0 };
      leafCursor += 1;
    }
  }

  const xsAll = Object.values(positions).map((p) => p.x);
  const minX = xsAll.length ? Math.min(...xsAll) : 0;
  // 归一化，让最左节点从 0 开始
  for (const p of Object.values(positions)) p.x -= minX;

  const maxX = xsAll.length ? Math.max(...xsAll) - minX : 0;

  return {
    positions,
    width: maxX + hGap,
    height: (maxDepth + 1) * vGap,
    rootId,
  };
}
