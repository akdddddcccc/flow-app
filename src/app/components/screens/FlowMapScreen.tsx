import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, Locate, List, GitBranch, Play } from "lucide-react";
import { useFlowStore, selectNodesOfFlow } from "../../data/store";
import { layoutFlow } from "../../data/layout";
import type { FlowNode } from "../../data/types";
import { TopBar } from "../TopBar";
import { FlowIcon } from "../icons/FlowIcon";
import { NodeDetailSheet } from "../flowmap/NodeDetailSheet";
import { EmptyState } from "../states/States";
import { usePlayer } from "../../player";

const NODE_W = 132;
const NODE_H = 62;
const PAD = 80;

export function FlowMapScreen({ flowId, focusNodeId }: { flowId: string; focusNodeId?: string }) {
  const { state } = useFlowStore();
  const project = state.projects[flowId];
  const nodes = useMemo(() => selectNodesOfFlow(state, flowId), [state, flowId]);
  const layout = useMemo(() => layoutFlow(nodes, { hGap: 160, vGap: 150 }), [nodes]);

  const [selected, setSelected] = useState<FlowNode | null>(null);
  const [listView, setListView] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  // pan / zoom，初始值 null 表示「尚未根据容器尺寸初始化」
  const [tf, setTf] = useState<{ x: number; y: number; k: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const isDragging = useRef(false);

  const canvasW = layout.width + PAD * 2;
  const canvasH = layout.height + PAD * 2;

  /** 使用真实容器尺寸将指定节点（或根节点）居中，并自动缩放使树可见 */
  const centerOn = useCallback(
    (nodeId?: string, animated = true) => {
      const container = containerRef.current;
      if (!container) return;
      const { width: cw, height: ch } = container.getBoundingClientRect();
      if (cw === 0 || ch === 0) return;

      // 目标节点位置（优先指定 id，其次根节点）
      const targetId = nodeId ?? layout.rootId ?? undefined;
      const pos = targetId ? layout.positions[targetId] : null;

      // 自动缩放：让整棵树宽度适配容器（同时不超过 1x）
      const autoK = Math.min(1, Math.max(0.38, cw / (canvasW || cw)));

      if (pos) {
        const nodeCx = (pos.x + PAD) * autoK;
        const nodeCy = (pos.y + PAD) * autoK;
        setTf({ x: cw / 2 - nodeCx, y: ch / 3 - nodeCy, k: autoK });
      } else {
        setTf({ x: (cw - canvasW * autoK) / 2, y: 20, k: autoK });
      }
    },
    [layout, canvasW],
  );

  // 初始化：layout 或容器尺寸就绪后居中
  useEffect(() => {
    if (tf === null) centerOn(focusNodeId ?? layout.rootId ?? undefined, false);
  }, [tf, centerOn, focusNodeId, layout.rootId]);

  // 有新 focusNodeId 时重新居中
  useEffect(() => {
    if (focusNodeId) centerOn(focusNodeId);
  }, [focusNodeId, centerOn]);

  if (!project || nodes.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <TopBar title="创作流" />
        <EmptyState title="还没有内容" hint="从这里开始第一个分支" />
      </div>
    );
  }

  const cur = tf ?? { x: 20, y: 20, k: 0.6 };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, tx: cur.x, ty: cur.y };
    isDragging.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) isDragging.current = true;
    setTf({ x: drag.current.tx + dx, y: drag.current.ty + dy, k: cur.k });
  };
  const onPointerUp = () => { drag.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0012;
    setTf((t) => t ? { ...t, k: clamp(t.k + delta, 0.3, 2.2) } : t);
  };
  const zoom = (dir: 1 | -1) => setTf((t) => t ? { ...t, k: clamp(t.k + dir * 0.2, 0.3, 2.2) } : t);

  return (
    <div className="flex h-full flex-col">
      <TopBar
        title={project.title}
        right={
          <button
            type="button"
            onClick={() => setListView((v) => !v)}
            aria-label={listView ? "切换到图视图" : "切换到列表视图"}
            className="grid size-10 place-items-center rounded-full"
            style={{ background: listView ? "var(--flow-blue)" : "var(--flow-warm)" }}
          >
            {listView ? <GitBranch size={18} color="white" /> : <List size={18} />}
          </button>
        }
      />

      {listView ? (
        <ListView flowId={flowId} onSelect={setSelected} />
      ) : (
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden"
          style={{ background: "var(--flow-warm)" }}
          onWheel={onWheel}
        >
          <div
            className="absolute inset-0 touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: canvasW,
                height: canvasH,
                transform: `translate(${cur.x}px, ${cur.y}px) scale(${cur.k})`,
                transition: drag.current || tf === null ? "none" : reduceMotion ? "none" : "transform 0.22s ease-out",
              }}
            >
              <Edges nodes={nodes} layout={layout} />
              {nodes.map((n) => {
                const p = layout.positions[n.id];
                if (!p) return null;
                const isFocus = n.id === focusNodeId;
                return (
                  <NodeBox
                    key={n.id}
                    node={n}
                    left={p.x + PAD - NODE_W / 2}
                    top={p.y + PAD - NODE_H / 2}
                    focus={isFocus}
                    onClick={() => { if (!isDragging.current) setSelected(n); }}
                  />
                );
              })}
            </div>
          </div>

          {/* 图例 */}
          <div className="pointer-events-none absolute left-3 top-3 rounded-2xl bg-white/90 p-2.5 text-[11px] shadow backdrop-blur" style={{ color: "var(--flow-muted)" }}>
            <div className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5" style={{ background: "black" }} /> 版本派生（父子）</div>
            <div className="mt-1 flex items-center gap-1.5"><span className="inline-block h-0 w-5 border-t-2 border-dashed" style={{ borderColor: "var(--flow-blue)" }} /> 引用灵感碎片</div>
          </div>

          {/* 工具条 */}
          <div className="absolute bottom-4 right-3 flex flex-col gap-2">
            <ToolBtn label="放大" onClick={() => zoom(1)}><ZoomIn size={18} /></ToolBtn>
            <ToolBtn label="缩小" onClick={() => zoom(-1)}><ZoomOut size={18} /></ToolBtn>
            <ToolBtn label="回到源节点" onClick={() => centerOn(layout.rootId ?? undefined)}><Locate size={18} /></ToolBtn>
          </div>
        </div>
      )}

      {selected && <NodeDetailSheet node={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ToolBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid size-11 place-items-center rounded-full bg-white shadow active:scale-90">
      {children}
    </button>
  );
}

function NodeBox({ node, left, top, focus, onClick }: { node: FlowNode; left: number; top: number; focus: boolean; onClick: () => void }) {
  const { state } = useFlowStore();
  const author = state.users[node.authorId];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="absolute flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-2.5 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-95"
      style={{
        left, top, width: NODE_W, height: NODE_H,
        outline: focus ? "3px solid var(--flow-blue)" : "1px solid rgba(0,0,0,0.05)",
        outlineOffset: focus ? "2px" : undefined,
      }}
    >
      <FlowIcon kind={node.parentId === null ? "source" : "flow"} size={34} completed={node.completed} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold leading-tight">{node.completedLabel ? `完成·${node.completedLabel}` : node.title}</p>
        <p className="truncate text-[10px]" style={{ color: "var(--flow-muted)" }}>{author?.name}</p>
      </div>
    </div>
  );
}

function Edges({ nodes, layout }: { nodes: FlowNode[]; layout: ReturnType<typeof layoutFlow> }) {
  const w = layout.width + PAD * 2;
  const h = layout.height + PAD * 2;
  const solid: string[] = [];
  const dashed: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];

  for (const n of nodes) {
    const p = layout.positions[n.id];
    if (!p) continue;
    const cx = p.x + PAD, cy = p.y + PAD;
    if (n.parentId) {
      const pp = layout.positions[n.parentId];
      if (pp) {
        const px = pp.x + PAD, py = pp.y + PAD;
        const midY = (py + cy) / 2;
        solid.push(`M ${px} ${py + NODE_H / 2 - 4} C ${px} ${midY}, ${cx} ${midY}, ${cx} ${cy - NODE_H / 2 + 4}`);
      }
    }
    n.fragmentRefs.forEach((fid, i) => {
      dashed.push({ x1: cx - NODE_W / 2, y1: cy, x2: cx - NODE_W / 2 - 46, y2: cy - 20 + i * 22, key: `${n.id}-${fid}` });
    });
  }

  return (
    <svg width={w} height={h} className="absolute left-0 top-0" style={{ pointerEvents: "none" }} aria-hidden="true">
      {solid.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="black" strokeWidth={2} strokeLinecap="round" />
      ))}
      {dashed.map((e) => (
        <g key={e.key}>
          <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="var(--flow-blue)" strokeWidth={1.5} strokeDasharray="4 4" />
          <circle cx={e.x2} cy={e.y2} r={9} fill="var(--flow-blue)" />
        </g>
      ))}
    </svg>
  );
}

/** 无障碍替代：可键盘聚焦的树形缩进列表。 */
function ListView({ flowId, onSelect }: { flowId: string; onSelect: (n: FlowNode) => void }) {
  const { state } = useFlowStore();
  const { play } = usePlayer();
  const nodes = selectNodesOfFlow(state, flowId);
  const byParent = new Map<string | null, FlowNode[]>();
  for (const n of [...nodes].sort((a, b) => a.createdAt - b.createdAt)) {
    const arr = byParent.get(n.parentId) ?? [];
    arr.push(n);
    byParent.set(n.parentId, arr);
  }
  const rows: { node: FlowNode; depth: number }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const n of byParent.get(parentId) ?? []) {
      rows.push({ node: n, depth });
      walk(n.id, depth + 1);
    }
  };
  walk(null, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-8">
      <ul className="space-y-2">
        {rows.map(({ node, depth }) => {
          const author = state.users[node.authorId];
          const sound = node.media.find((m) => m.kind === "sound");
          return (
            <li key={node.id} style={{ marginLeft: depth * 18 }}>
              <div className="flex items-center gap-2 rounded-2xl bg-white p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <FlowIcon kind={node.parentId === null ? "source" : "flow"} size={32} completed={node.completed} />
                <button type="button" onClick={() => onSelect(node)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[13px] font-medium">{node.completedLabel ? `完成·${node.completedLabel}` : node.title}</p>
                  <p className="truncate text-[11px]" style={{ color: "var(--flow-muted)" }}>{author?.name} · {node.roles.join("/")}</p>
                </button>
                {sound && (
                  <button type="button" aria-label="播放" onClick={() => play({ id: node.id, title: node.title, subtitle: author?.name, duration: sound.duration ?? 60 })} className="grid size-8 place-items-center rounded-full" style={{ background: "var(--flow-warm)" }}>
                    <Play size={14} color="var(--flow-blue)" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduce;
}
