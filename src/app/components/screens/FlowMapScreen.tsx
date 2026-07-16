import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, Locate, List, GitBranch, Play, RotateCw, Minimize2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useFlowStore, selectNodesOfFlow } from "../../data/store";
import { layoutFlow, type LayoutResult } from "../../data/layout";
import type { FlowNode } from "../../data/types";
import { TopBar } from "../TopBar";
import { FlowIcon } from "../icons/FlowIcon";
import { NodeDetailSheet } from "../flowmap/NodeDetailSheet";
import { EmptyState } from "../states/States";
import { usePlayer } from "../../player";

const NODE_W = 132;
const NODE_H = 62;
const PAD = 80;

function postFrameMode(mode: "portrait" | "landscape") {
  if (window.parent === window) return;
  window.parent.postMessage(
    {
      type: "flow-app:frame-mode",
      mode,
      width: mode === "landscape" ? 844 : 430,
      height: mode === "landscape" ? 390 : 900,
      animate: true,
    },
    "*",
  );
}

export function FlowMapScreen({ flowId, focusNodeId }: { flowId: string; focusNodeId?: string }) {
  const { state } = useFlowStore();
  const project = state.projects[flowId];
  const nodes = useMemo(() => selectNodesOfFlow(state, flowId), [state, flowId]);
  const portraitLayout = useMemo(() => layoutFlow(nodes, { hGap: 160, vGap: 150 }), [nodes]);
  // 横屏不是把竖屏画布机械旋转，而是重新排版：层级沿 X 轴生长，
  // 叶子之间使用更紧凑的纵向间距，让节点在矮屏里仍保持可读尺寸。
  const landscapeSourceLayout = useMemo(() => layoutFlow(nodes, { hGap: 82, vGap: 180 }), [nodes]);

  const [selected, setSelected] = useState<FlowNode | null>(null);
  const [listView, setListView] = useState(false);
  const [showPortraitGuide, setShowPortraitGuide] = useState(true);
  const [orientationHint, setOrientationHint] = useState("横屏能同时看到更多分支和版本关系");
  const physicalLandscape = useLandscapeOrientation();
  const phoneLike = usePhoneLikeDevice();
  const [frameLandscape, setFrameLandscape] = useState(false);
  const isLandscape = frameLandscape || (physicalLandscape && window.innerHeight <= 600);
  const layout = useMemo<LayoutResult>(() => {
    if (!isLandscape) return portraitLayout;
    return {
      ...landscapeSourceLayout,
      positions: Object.fromEntries(
        Object.entries(landscapeSourceLayout.positions).map(([id, position]) => [
          id,
          { ...position, x: position.y, y: position.x },
        ]),
      ),
      width: Math.max(0, ...Object.values(landscapeSourceLayout.positions).map((p) => p.y)) + NODE_W,
      height: Math.max(0, ...Object.values(landscapeSourceLayout.positions).map((p) => p.x)) + NODE_H,
    };
  }, [portraitLayout, landscapeSourceLayout, isLandscape]);
  const reduceMotion = usePrefersReducedMotion();

  // pan / zoom，初始值 null 表示「尚未根据容器尺寸初始化」
  const [tf, setTf] = useState<{ x: number; y: number; k: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const isDragging = useRef(false);

  const canvasPadX = isLandscape ? 60 : PAD;
  const canvasPadY = isLandscape ? 34 : PAD;
  const canvasW = layout.width + canvasPadX * 2;
  const canvasH = layout.height + canvasPadY * 2;

  useEffect(() => {
    const shell = document.querySelector(".flow-app-shell");
    shell?.classList.add("flow-map-shell-active");
    return () => {
      shell?.classList.remove("flow-map-shell-active", "flow-map-frame-landscape");
      postFrameMode("portrait");
    };
  }, []);

  useEffect(() => {
    const shell = document.querySelector(".flow-app-shell");
    shell?.classList.toggle("flow-map-frame-landscape", isLandscape);
    if (isLandscape) {
      setShowPortraitGuide(false);
      postFrameMode("landscape");
    }
  }, [isLandscape]);

  const requestLandscape = useCallback(async () => {
    setOrientationHint("正在请求横屏显示……");

    // PC / 鼠标设备：改变作品集中的手机 Frame，而不是让整个浏览器全屏。
    if (!phoneLike) {
      setFrameLandscape(true);
      setShowPortraitGuide(false);
      setOrientationHint("已切换横屏阅读");
      postFrameMode("landscape");
      return;
    }

    postFrameMode("landscape");
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
    } catch {
      // 嵌入作品集的 iframe 可能不允许全屏，仍继续尝试方向锁定。
    }

    try {
      const orientation = window.screen.orientation as ScreenOrientation & {
        lock?: (value: string) => Promise<void>;
      };
      if (orientation?.lock) {
        await orientation.lock("landscape");
        setOrientationHint("已切换横屏阅读");
      } else {
        setOrientationHint("请关闭手机方向锁定，然后将手机横过来");
      }
    } catch {
      setOrientationHint("请关闭手机方向锁定，然后将手机横过来");
    }
  }, [phoneLike]);

  const exitLandscape = useCallback(async () => {
    setFrameLandscape(false);
    postFrameMode("portrait");
    const orientation = window.screen.orientation as ScreenOrientation & { unlock?: () => void };
    orientation?.unlock?.();
    if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
  }, []);

  /** 使用真实容器尺寸将指定节点（或根节点）居中，并自动缩放使树可见 */
  const centerOn = useCallback(
    (nodeId?: string, animated = true) => {
      const container = containerRef.current;
      if (!container) return;
      const { width: cw, height: ch } = container.getBoundingClientRect();
      if (cw === 0 || ch === 0) return;

      const pos = nodeId ? layout.positions[nodeId] : null;

      // 自动缩放同时考虑宽和高：横屏优先一次看到更多分支，而不是只放大节点。
      const widthFit = cw / (canvasW || cw);
      const heightFit = ch / (canvasH || ch);
      const autoK = Math.min(1, Math.max(0.38, Math.min(widthFit, heightFit)));

      if (pos) {
        const nodeCx = (pos.x + canvasPadX) * autoK;
        const nodeCy = (pos.y + canvasPadY) * autoK;
        setTf({ x: cw / 2 - nodeCx, y: ch / 3 - nodeCy, k: autoK });
      } else {
        setTf({
          x: (cw - canvasW * autoK) / 2,
          y: Math.max(10, (ch - canvasH * autoK) / 2),
          k: autoK,
        });
      }
    },
    [layout, canvasW, canvasH, canvasPadX, canvasPadY],
  );

  // 初始化：layout 或容器尺寸就绪后居中
  useEffect(() => {
    if (tf === null) centerOn(focusNodeId, false);
  }, [tf, centerOn, focusNodeId]);

  // 有新 focusNodeId 时重新居中
  useEffect(() => {
    if (focusNodeId) centerOn(focusNodeId);
  }, [focusNodeId, centerOn]);

  // 横竖屏切换后使用新的可视宽高重新展开并居中整棵树。
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => centerOn(focusNodeId, false));
    });
    observer.observe(container);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [centerOn, focusNodeId, layout.rootId]);

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
    <div className="flow-map-screen flex h-full flex-col" data-orientation={isLandscape ? "landscape" : "portrait"}>
      <TopBar
        title={project.title}
        right={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={isLandscape ? exitLandscape : () => setShowPortraitGuide(true)}
              aria-label={isLandscape ? "退出横屏阅读" : "切换横屏阅读"}
              className="flex h-10 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold"
              style={{ background: isLandscape ? "var(--flow-blue)" : "var(--flow-warm)", color: isLandscape ? "white" : "black" }}
            >
              {isLandscape ? <Minimize2 size={16} /> : <RotateCw size={16} />}
              <span>{isLandscape ? "退出" : "横屏"}</span>
            </button>
            <button
              type="button"
              onClick={() => setListView((v) => !v)}
              aria-label={listView ? "切换到图视图" : "切换到列表视图"}
              className="grid size-10 place-items-center rounded-full"
              style={{ background: listView ? "var(--flow-blue)" : "var(--flow-warm)" }}
            >
              {listView ? <GitBranch size={18} color="white" /> : <List size={18} />}
            </button>
          </div>
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
              <Edges
                nodes={nodes}
                layout={layout}
                horizontal={isLandscape}
                padX={canvasPadX}
                padY={canvasPadY}
              />
              {nodes.map((n) => {
                const p = layout.positions[n.id];
                if (!p) return null;
                const isFocus = n.id === focusNodeId;
                return (
                  <NodeBox
                    key={n.id}
                    node={n}
                    left={p.x + canvasPadX - NODE_W / 2}
                    top={p.y + canvasPadY - NODE_H / 2}
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
            <ToolBtn label="显示完整创作流" onClick={() => centerOn(undefined)}><Locate size={18} /></ToolBtn>
          </div>

          <AnimatePresence>
            {!isLandscape && showPortraitGuide && (
              <motion.div
                className="absolute inset-0 z-30 grid place-items-center bg-white/88 px-7 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-full max-w-[310px] rounded-[28px] bg-white p-5 text-center shadow-[0_24px_70px_rgba(17,19,24,0.16)]"
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                >
                  <div className="mx-auto grid size-14 place-items-center rounded-[20px]" style={{ background: "var(--flow-blue)" }}>
                    <RotateCw size={25} color="white" strokeWidth={2.4} />
                  </div>
                  <h2 className="mt-4 text-[20px] font-bold">横过来，流会展开</h2>
                  <p className="mx-auto mt-2 max-w-[250px] text-[13px] leading-relaxed" style={{ color: "var(--flow-muted)" }}>
                    {orientationHint}
                  </p>
                  <button
                    type="button"
                    onClick={requestLandscape}
                    className="mt-5 h-12 w-full rounded-full text-[14px] font-semibold text-white active:scale-[0.98]"
                    style={{ background: "var(--flow-blue)" }}
                  >
                    切换横屏阅读
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPortraitGuide(false)}
                    className="mt-2 h-10 px-4 text-[12px]"
                    style={{ color: "var(--flow-muted)" }}
                  >
                    暂时竖屏查看
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selected && <NodeDetailSheet node={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
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
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="absolute flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-2.5 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-95"
      style={{
        width: NODE_W, height: NODE_H,
        outline: focus ? "3px solid var(--flow-blue)" : "1px solid rgba(0,0,0,0.05)",
        outlineOffset: focus ? "2px" : undefined,
      }}
      initial={false}
      animate={{ left, top }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 460, damping: 32 }}
    >
      <FlowIcon kind={node.parentId === null ? "source" : "flow"} size={34} completed={node.completed} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold leading-tight">{node.completedLabel ? `完成·${node.completedLabel}` : node.title}</p>
        <p className="truncate text-[10px]" style={{ color: "var(--flow-muted)" }}>{author?.name}</p>
      </div>
    </motion.div>
  );
}

function Edges({
  nodes,
  layout,
  horizontal,
  padX,
  padY,
}: {
  nodes: FlowNode[];
  layout: LayoutResult;
  horizontal: boolean;
  padX: number;
  padY: number;
}) {
  const w = layout.width + padX * 2;
  const h = layout.height + padY * 2;
  const solid: string[] = [];
  const dashed: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];

  for (const n of nodes) {
    const p = layout.positions[n.id];
    if (!p) continue;
    const cx = p.x + padX, cy = p.y + padY;
    if (n.parentId) {
      const pp = layout.positions[n.parentId];
      if (pp) {
        const px = pp.x + padX, py = pp.y + padY;
        if (horizontal) {
          const startX = px + NODE_W / 2 - 4;
          const endX = cx - NODE_W / 2 + 4;
          const midX = (startX + endX) / 2;
          solid.push(`M ${startX} ${py} C ${midX} ${py}, ${midX} ${cy}, ${endX} ${cy}`);
        } else {
          const startY = py + NODE_H / 2 - 4;
          const endY = cy - NODE_H / 2 + 4;
          const midY = (startY + endY) / 2;
          solid.push(`M ${px} ${startY} C ${px} ${midY}, ${cx} ${midY}, ${cx} ${endY}`);
        }
      }
    }
    n.fragmentRefs.forEach((fid, i) => {
      if (horizontal) {
        const placeBelow = cy - NODE_H / 2 - 32 < 10;
        const edgeY = cy + (placeBelow ? NODE_H / 2 : -NODE_H / 2);
        dashed.push({
          x1: cx,
          y1: edgeY,
          x2: cx - 18 + i * 24,
          y2: edgeY + (placeBelow ? 30 : -30),
          key: `${n.id}-${fid}`,
        });
      } else {
        dashed.push({ x1: cx - NODE_W / 2, y1: cy, x2: cx - NODE_W / 2 - 46, y2: cy - 20 + i * 22, key: `${n.id}-${fid}` });
      }
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

function useLandscapeOrientation() {
  const [landscape, setLandscape] = useState(() => window.matchMedia("(orientation: landscape)").matches);
  useEffect(() => {
    const query = window.matchMedia("(orientation: landscape)");
    const sync = () => setLandscape(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);
  return landscape;
}

function usePhoneLikeDevice() {
  const read = () =>
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches;
  const [phoneLike, setPhoneLike] = useState(read);
  useEffect(() => {
    const pointer = window.matchMedia("(pointer: coarse)");
    const hover = window.matchMedia("(hover: none)");
    const sync = () => setPhoneLike(read());
    pointer.addEventListener?.("change", sync);
    hover.addEventListener?.("change", sync);
    return () => {
      pointer.removeEventListener?.("change", sync);
      hover.removeEventListener?.("change", sync);
    };
  }, []);
  return phoneLike;
}
