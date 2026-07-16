import { useEffect, useRef, useState } from "react";
import { Play, Pause, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useFlowStore } from "../../data/store";
import { ROLE_LIST, type Media, type Role, type Draft } from "../../data/types";
import { useNav } from "../../nav";
import { usePlayer } from "../../player";
import { TopBar } from "../TopBar";
import { FlowIcon } from "../icons/FlowIcon";
import { RoleChip } from "../chips/Chips";
import { MediaPicker } from "../MediaPicker";

interface FormErrors {
  roles?: boolean;
  sound?: boolean;
  changeNote?: boolean;
  completedLabel?: boolean;
}

export function ContinueFlowScreen({
  flowId,
  parentNodeId,
  draftId,
}: {
  flowId: string;
  parentNodeId: string;
  draftId?: string;
}) {
  const { state, dispatch, newDraftId } = useFlowStore();
  const nav = useNav();
  const { play, isCurrent } = usePlayer();

  const parent = state.nodes[parentNodeId];
  const parentAuthor = parent ? state.users[parent.authorId] : undefined;
  const existingDraft = draftId ? state.drafts[draftId] : undefined;

  const [title, setTitle] = useState(existingDraft?.title ?? "");
  const [roles, setRoles] = useState<Role[]>(existingDraft?.roles ?? []);
  const [changeNote, setChangeNote] = useState(existingDraft?.changeNote ?? "");
  const [media, setMedia] = useState<Media[]>(existingDraft?.media ?? []);
  const [fragmentRefs, setFragmentRefs] = useState<string[]>(existingDraft?.fragmentRefs ?? []);
  const [markComplete, setMarkComplete] = useState(!!existingDraft?.completedLabel);
  const [completedLabel, setCompletedLabel] = useState(existingDraft?.completedLabel ?? "");

  // 字段级错误状态，用户修正后实时消除对应错误
  const [errors, setErrors] = useState<FormErrors>({});

  const draftIdRef = useRef(draftId ?? newDraftId());
  const parentSound = parent?.media.find((m) => m.kind === "sound");

  // 实时清除已修正的错误
  const clearError = (key: keyof FormErrors) => {
    setErrors((e) => (e[key] ? { ...e, [key]: false } : e));
  };

  const handleRoleToggle = (r: Role) => {
    setRoles((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]));
    clearError("roles");
  };

  const handleMediaChange = (m: Media[]) => {
    setMedia(m);
    if (m.some((x) => x.kind === "sound")) clearError("sound");
  };

  const handleChangeNote = (v: string) => {
    setChangeNote(v);
    if (v.trim()) clearError("changeNote");
  };

  const handleCompletedLabel = (v: string) => {
    setCompletedLabel(v);
    if (v.trim()) clearError("completedLabel");
  };

  // 自动保存草稿（防抖）
  useEffect(() => {
    const hasContent = title || roles.length || changeNote || media.length || fragmentRefs.length;
    if (!hasContent) return;
    const t = window.setTimeout(() => {
      const draft: Draft = {
        id: draftIdRef.current,
        kind: "continue",
        flowId,
        parentNodeId,
        authorId: state.currentUserId,
        title,
        roles,
        changeNote,
        media,
        fragmentRefs,
        completedLabel: markComplete ? completedLabel : undefined,
        updatedAt: Date.now(),
      };
      dispatch({ type: "saveDraft", draft });
    }, 800);
    return () => window.clearTimeout(t);
  }, [title, roles, changeNote, media, fragmentRefs, markComplete, completedLabel, flowId, parentNodeId, state.currentUserId, dispatch]);

  if (!parent) {
    return (
      <div className="flex h-full flex-col">
        <TopBar title="续流" />
        <p className="p-8 text-center text-[13px]" style={{ color: "var(--flow-muted)" }}>找不到父节点</p>
      </div>
    );
  }

  const publish = () => {
    const hasSound = media.some((m) => m.kind === "sound");
    const newErrors: FormErrors = {
      roles: roles.length === 0,
      sound: !hasSound,
      changeNote: !changeNote.trim(),
      completedLabel: markComplete && !completedLabel.trim(),
    };
    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      setErrors(newErrors);
      // 固定 id 确保不会叠加多个 error toast
      toast.error("请填写所有必填项后再发布", { id: "continue-error" });
      return;
    }

    // 成功：清空错误，关闭 error toast，发布
    setErrors({});
    toast.dismiss("continue-error");

    const newId = newDraftId().replace("d-", "n-");
    dispatch({
      type: "publishContinue",
      id: newId,
      flowId,
      parentNodeId,
      roles,
      title: title.trim() || (markComplete ? `完成 · ${completedLabel}` : "续流版本"),
      changeNote,
      media,
      fragmentRefs,
      completedLabel: markComplete ? completedLabel.trim() : undefined,
      draftId: draftIdRef.current,
    });
    toast.success("续流已发布，新版本已挂到父节点下");
    nav.replace({ name: "flowMap", flowId, focusNodeId: newId });
  };

  const saveDraft = () => {
    dispatch({
      type: "saveDraft",
      draft: {
        id: draftIdRef.current,
        kind: "continue",
        flowId,
        parentNodeId,
        authorId: state.currentUserId,
        title,
        roles,
        changeNote,
        media,
        fragmentRefs,
        completedLabel: markComplete ? completedLabel : undefined,
        updatedAt: Date.now(),
      },
    });
    toast.success("草稿已保存");
    nav.back();
  };

  return (
    <div className="flex h-full flex-col">
      <TopBar
        title="续流"
        right={
          <button type="button" onClick={saveDraft} className="rounded-full px-3 py-1.5 text-[13px] font-medium" style={{ background: "var(--flow-warm)" }}>
            存草稿
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-5">
        {/* 父节点 */}
        <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "var(--flow-warm)" }}>
          <FlowIcon kind={parent.parentId === null ? "source" : "flow"} size={40} completed={parent.completed} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px]" style={{ color: "var(--flow-muted)" }}>基于此节点续流</p>
            <p className="truncate text-[14px] font-medium">{parent.title}</p>
            <p className="truncate text-[11px]" style={{ color: "var(--flow-muted)" }}>{parentAuthor?.name}</p>
          </div>
          {parentSound && (
            <button
              type="button"
              onClick={() => play({ id: parent.id, title: parent.title, subtitle: parentAuthor?.name, duration: parentSound.duration ?? 60 })}
              aria-label="试听父节点"
              className="grid size-10 place-items-center rounded-full text-white"
              style={{ background: "var(--flow-blue)" }}
            >
              {isCurrent(parent.id) ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
            </button>
          )}
        </div>

        {/* 角色 */}
        <Section title="我的贡献角色" required error={errors.roles} hint={errors.roles ? "请至少选择一个角色" : undefined}>
          <div className="flex flex-wrap gap-2">
            {ROLE_LIST.map((r) => (
              <RoleChip key={r} role={r} selected={roles.includes(r)} onClick={() => handleRoleToggle(r)} />
            ))}
          </div>
        </Section>

        {/* 媒体 */}
        <Section title="添加你的创作" required error={errors.sound} hint={errors.sound ? "请至少添加一段音频（模拟）" : "至少一段音频；可附图片/文字，或引用灵感碎片"}>
          <MediaPicker
            media={media}
            onChange={handleMediaChange}
            fragmentRefs={fragmentRefs}
            onFragmentRefsChange={setFragmentRefs}
            fragments={Object.values(state.fragments)}
          />
        </Section>

        {/* 标题 */}
        <Section title="版本标题（可选）">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给这个版本起个名字"
            className="w-full rounded-2xl border px-4 py-3 text-[14px] outline-none"
            style={{ borderColor: "var(--flow-gray)" }}
          />
        </Section>

        {/* 改动说明 */}
        <Section title="这次做了什么改变" required error={errors.changeNote} hint={errors.changeNote ? "请描述你做了哪些改变" : undefined}>
          <textarea
            value={changeNote}
            onChange={(e) => handleChangeNote(e.target.value)}
            rows={3}
            placeholder="描述你在父版本基础上的改动……"
            className="w-full resize-none rounded-2xl border px-4 py-3 text-[14px] outline-none"
            style={{ borderColor: errors.changeNote ? "var(--flow-red)" : "var(--flow-gray)" }}
          />
        </Section>

        {/* 完成版本 */}
        <Section title="标记为完成版本" error={errors.completedLabel} hint={errors.completedLabel ? "请填写完成版本的名称" : undefined}>
          <button
            type="button"
            onClick={() => setMarkComplete((v) => !v)}
            aria-pressed={markComplete}
            className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left"
            style={{ borderColor: markComplete ? "var(--flow-blue)" : "var(--flow-gray)" }}
          >
            <CheckCircle2 size={20} color={markComplete ? "var(--flow-blue)" : "var(--flow-gray)"} fill={markComplete ? "var(--flow-blue)" : "none"} />
            <span className="flex-1 text-[13px]">标记后仍可被继续续流，不会关闭整棵树</span>
          </button>
          {markComplete && (
            <input
              value={completedLabel}
              onChange={(e) => handleCompletedLabel(e.target.value)}
              placeholder="完成版本名称，如「轻柔版」"
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-[14px] outline-none"
              style={{ borderColor: errors.completedLabel ? "var(--flow-red)" : "var(--flow-gray)" }}
            />
          )}
        </Section>
      </div>

      <div className="shrink-0 border-t border-black/5 bg-white p-4">
        <button
          type="button"
          onClick={publish}
          className="w-full rounded-full py-3.5 text-[15px] font-semibold text-white"
          style={{ background: "var(--flow-blue)" }}
        >
          发布续流
        </button>
      </div>
    </div>
  );
}

function Section({
  title, required, hint, error, children,
}: {
  title: string;
  required?: boolean;
  hint?: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-1">
        <h3 className="text-[14px] font-semibold">{title}</h3>
        {required && <span style={{ color: "var(--flow-red)" }}>*</span>}
      </div>
      {hint && (
        <p className="mb-2 text-[12px]" style={{ color: error ? "var(--flow-red)" : "var(--flow-muted)" }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}
