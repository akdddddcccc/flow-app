import { FileText, Copy, Trash2, PenLine } from "lucide-react";
import type { Draft } from "../data/types";
import { useFlowStore } from "../data/store";
import { useNav } from "../nav";
import { fmtRelative } from "../util";

const KIND_LABEL: Record<Draft["kind"], string> = {
  fragment: "灵感碎片",
  source: "源",
  continue: "续流",
};

/** 计算草稿完成度与缺失项（用于提示）。 */
function completeness(d: Draft): { pct: number; missing: string[] } {
  const missing: string[] = [];
  if (!d.title.trim()) missing.push("标题");
  if (d.media.length === 0) missing.push("媒体内容");
  if (d.kind !== "fragment" && !d.changeNote.trim()) missing.push("改动说明");
  const total = d.kind === "fragment" ? 2 : 3;
  return { pct: Math.round(((total - missing.length) / total) * 100), missing };
}

export function DraftCard({ draft }: { draft: Draft }) {
  const { state, dispatch, newDraftId } = useFlowStore();
  const nav = useNav();
  const { pct, missing } = completeness(draft);

  const resume = () => {
    if (draft.kind === "continue" && draft.flowId && draft.parentNodeId) {
      nav.push({ name: "continueFlow", flowId: draft.flowId, parentNodeId: draft.parentNodeId, draftId: draft.id });
    } else {
      nav.push({ name: "createEntry" });
    }
  };

  const duplicate = () =>
    dispatch({ type: "saveDraft", draft: { ...draft, id: newDraftId(), updatedAt: Date.now() } });

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--flow-warm)", color: "var(--flow-muted)" }}>
          <FileText size={12} /> {KIND_LABEL[draft.kind]}
        </span>
        <span className="text-[11px]" style={{ color: "var(--flow-muted)" }}>{fmtRelative(draft.updatedAt)}</span>
      </div>
      <h4 className="mt-2 text-[15px] font-medium">{draft.title || "未命名草稿"}</h4>
      {draft.changeNote && <p className="mt-0.5 line-clamp-1 text-[13px]" style={{ color: "var(--flow-muted)" }}>{draft.changeNote}</p>}

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--flow-gray)" }}>
          <div className="h-full" style={{ width: `${pct}%`, background: "var(--flow-blue)" }} />
        </div>
        <span className="text-[11px]" style={{ color: "var(--flow-muted)" }}>{pct}%</span>
      </div>
      {missing.length > 0 && (
        <p className="mt-1 text-[11px]" style={{ color: "var(--flow-red)" }}>待补充：{missing.join("、")}</p>
      )}

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={resume} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-medium text-white" style={{ background: "var(--flow-blue)" }}>
          <PenLine size={14} /> 续写
        </button>
        <button type="button" onClick={duplicate} aria-label="复制" className="grid size-9 place-items-center rounded-full" style={{ background: "var(--flow-warm)" }}>
          <Copy size={15} />
        </button>
        <button type="button" onClick={() => dispatch({ type: "deleteDraft", id: draft.id })} aria-label="删除" className="grid size-9 place-items-center rounded-full" style={{ background: "var(--flow-warm)" }}>
          <Trash2 size={15} color="var(--flow-red)" />
        </button>
      </div>
    </div>
  );
}
