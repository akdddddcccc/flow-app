import { Play, Pause, GitBranch, Lock, X, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { FlowNode } from "../../data/types";
import { useFlowStore, canContinue } from "../../data/store";
import { useNav } from "../../nav";
import { usePlayer } from "../../player";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { FlowIcon } from "../icons/FlowIcon";
import { RoleChip } from "../chips/Chips";

export function NodeDetailSheet({ node, onClose }: { node: FlowNode; onClose: () => void }) {
  const { state } = useFlowStore();
  const nav = useNav();
  const { play, isCurrent } = usePlayer();
  const author = state.users[node.authorId];
  const project = state.projects[node.flowId];
  const gate = canContinue(state, node.flowId);
  const sound = node.media.find((m) => m.kind === "sound");
  const refFrags = node.fragmentRefs.map((id) => state.fragments[id]).filter(Boolean);

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-end bg-black/30"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full rounded-t-3xl bg-white p-5 pb-7"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36, mass: 0.88 }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: "var(--flow-gray)" }} />
        <div className="flex items-start gap-3">
          <FlowIcon kind={node.kind === "source" ? "source" : "flow"} size={44} completed={node.completed} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {node.completed && node.completedLabel && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "var(--flow-yellow)" }}>完成 · {node.completedLabel}</span>
              )}
              {node.parentId === null && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ background: "var(--flow-blue)" }}>源</span>
              )}
            </div>
            <h3 className="mt-1 text-[16px] font-semibold leading-snug">{node.title}</h3>
            <div className="mt-1 flex items-center gap-2 text-[12px]" style={{ color: "var(--flow-muted)" }}>
              {author && <ImageWithFallback src={author.avatar} alt={author.name} className="size-4 rounded-full object-cover" />}
              {author?.name}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭" className="grid size-8 place-items-center rounded-full" style={{ background: "var(--flow-warm)" }}>
            <X size={16} />
          </button>
        </div>

        {node.roles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {node.roles.map((r) => <RoleChip key={r} role={r} size="sm" />)}
          </div>
        )}

        <p className="mt-3 text-[13px]">{node.changeNote}</p>

        {refFrags.length > 0 && (
          <p className="mt-2 text-[12px]" style={{ color: "var(--flow-muted)" }}>
            虚线引用碎片：{refFrags.map((f) => f!.title).join("、")}
          </p>
        )}

        {sound && (
          <button
            type="button"
            onClick={() => play({ id: node.id, title: node.title, subtitle: author?.name, cover: project?.cover, duration: sound.duration ?? 60 })}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl p-3"
            style={{ background: "var(--flow-warm)" }}
          >
            <span className="grid size-9 place-items-center rounded-full text-white" style={{ background: "var(--flow-blue)" }}>
              {isCurrent(node.id) ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
            </span>
            <span className="text-[13px] font-medium">试听这个版本</span>
          </button>
        )}

        <div className="mt-4 flex gap-2">
          {gate.allowed ? (
            <button
              type="button"
              onClick={() => nav.push({ name: "continueFlow", flowId: node.flowId, parentNodeId: node.id })}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-[14px] font-semibold text-white"
              style={{ background: "var(--flow-blue)" }}
            >
              <GitBranch size={16} /> 从这里续流
            </button>
          ) : (
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-[13px]" style={{ background: "var(--flow-warm)", color: "var(--flow-muted)" }}>
              <Lock size={14} /> {gate.reason}
            </div>
          )}
          <button
            type="button"
            onClick={() => nav.push({ name: "detail", targetId: node.flowId })}
            aria-label="查看流详情"
            className="grid size-12 shrink-0 place-items-center rounded-full"
            style={{ background: "var(--flow-warm)" }}
          >
            <ArrowUpRight size={20} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
