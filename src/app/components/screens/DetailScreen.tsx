import { useState } from "react";
import { Play, Pause, Heart, Bookmark, GitBranch, Send, Puzzle } from "lucide-react";
import { useFlowStore, selectNodesOfFlow, canContinue } from "../../data/store";
import { LICENSE_LABEL } from "../../data/types";
import { useNav } from "../../nav";
import { usePlayer } from "../../player";
import { TopBar } from "../TopBar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { FlowIcon } from "../icons/FlowIcon";
import { RoleChip } from "../chips/Chips";
import { CommentItem } from "../CommentItem";
import { fmtCount } from "../../util";

export function DetailScreen({ targetId }: { targetId: string }) {
  const { state } = useFlowStore();
  const project = state.projects[targetId];
  if (project) return <ProjectDetail flowId={targetId} />;
  const fragment = state.fragments[targetId];
  if (fragment) return <FragmentDetail fragmentId={targetId} />;
  return (
    <div className="flex h-full flex-col">
      <TopBar title="详情" />
      <p className="p-8 text-center text-[13px]" style={{ color: "var(--flow-muted)" }}>内容不存在</p>
    </div>
  );
}

function ProjectDetail({ flowId }: { flowId: string }) {
  const { state, dispatch } = useFlowStore();
  const nav = useNav();
  const { play, isCurrent } = usePlayer();
  const project = state.projects[flowId];
  const source = state.nodes[project.sourceNodeId];
  const owner = state.users[project.ownerId];
  const nodes = selectNodesOfFlow(state, flowId);
  const completedCount = nodes.filter((n) => n.completed).length;
  const eng = state.engagement[flowId];
  const gate = canContinue(state, flowId);
  const comments = state.comments.filter((c) => c.targetId === flowId);
  const [text, setText] = useState("");
  const dur = source?.media.find((m) => m.kind === "sound")?.duration ?? 60;

  const send = () => {
    if (!text.trim()) return;
    dispatch({ type: "addComment", targetId: flowId, text: text.trim() });
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <TopBar title="源详情" />
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="relative">
          <ImageWithFallback src={project.cover} alt={project.title} className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={() => play({ id: source.id, title: project.title, subtitle: owner?.name, cover: project.cover, duration: dur })}
            aria-label="播放"
            className="absolute bottom-4 right-4 grid size-14 place-items-center rounded-full bg-white shadow-lg"
          >
            {isCurrent(source.id) ? <Pause size={22} color="var(--flow-blue)" fill="var(--flow-blue)" /> : <Play size={22} color="var(--flow-blue)" fill="var(--flow-blue)" />}
          </button>
        </div>

        <div className="px-5 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--flow-warm)" }}>
            <FlowIcon kind="source" size={16} /> 源
          </span>
          <h1 className="mt-2 text-[22px] font-bold leading-tight">{project.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            {owner && <ImageWithFallback src={owner.avatar} alt={owner.name} className="size-7 rounded-full object-cover" />}
            <div>
              <p className="text-[13px] font-medium">{owner?.name}</p>
              <p className="text-[11px]" style={{ color: "var(--flow-muted)" }}>{LICENSE_LABEL[project.license]}</p>
            </div>
          </div>
          <p className="mt-3 text-[14px]">{project.description}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((t) => <RoleChip key={t} role={t as never} size="sm" />)}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl py-3 text-center" style={{ background: "var(--flow-warm)" }}>
            <Stat n={String(nodes.length)} label="版本节点" />
            <Stat n={String(completedCount)} label="完成版本" />
            <Stat n={fmtCount(project.saves)} label="收藏" />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => nav.push({ name: "flowMap", flowId })}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-[14px] font-semibold text-white"
              style={{ background: "var(--flow-blue)" }}
            >
              <GitBranch size={16} /> 查看创作流
            </button>
            {gate.allowed && (
              <button
                type="button"
                onClick={() => nav.push({ name: "continueFlow", flowId, parentNodeId: source.id })}
                className="rounded-full border px-5 py-3 text-[14px] font-semibold"
                style={{ borderColor: "var(--flow-blue)", color: "var(--flow-blue)" }}
              >
                续流
              </button>
            )}
          </div>
          {!gate.allowed && (
            <p className="mt-2 text-center text-[12px]" style={{ color: "var(--flow-muted)" }}>{gate.reason}</p>
          )}

          <div className="mt-5 flex items-center gap-5 border-y border-black/5 py-3">
            <IconStat active={!!eng?.liked} color="var(--flow-red)" onClick={() => dispatch({ type: "toggleLike", id: flowId })} icon={<Heart size={18} fill={eng?.liked ? "var(--flow-red)" : "none"} />} label={fmtCount(project.likes + (eng?.liked ? 1 : 0))} />
            <IconStat active={!!eng?.saved} color="var(--flow-blue)" onClick={() => dispatch({ type: "toggleSave", id: flowId })} icon={<Bookmark size={18} fill={eng?.saved ? "var(--flow-blue)" : "none"} />} label="收藏" />
          </div>

          <h3 className="mt-5 text-[15px] font-semibold">评论 · {comments.length}</h3>
          <div className="mt-3 space-y-4">
            {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-black/5 bg-white p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="说点什么……"
          className="flex-1 rounded-full px-4 py-2.5 text-[14px] outline-none"
          style={{ background: "var(--flow-warm)" }}
        />
        <button type="button" onClick={send} aria-label="发送" className="grid size-10 place-items-center rounded-full text-white" style={{ background: "var(--flow-blue)" }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

function FragmentDetail({ fragmentId }: { fragmentId: string }) {
  const { state } = useFlowStore();
  const { play, isCurrent } = usePlayer();
  const frag = state.fragments[fragmentId];
  const author = state.users[frag.authorId];
  const comments = state.comments.filter((c) => c.targetId === fragmentId);

  return (
    <div className="flex h-full flex-col">
      <TopBar title="灵感碎片" />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid place-items-center rounded-3xl p-8" style={{ background: "var(--flow-warm)" }}>
          {frag.media.kind === "pic" && frag.media.src ? (
            <ImageWithFallback src={frag.media.src} alt={frag.title} className="max-h-60 w-full rounded-2xl object-cover" />
          ) : frag.media.kind === "text" ? (
            <p className="text-center text-[18px] font-medium">{frag.media.text}</p>
          ) : (
            <button
              type="button"
              onClick={() => play({ id: frag.id, title: frag.title, subtitle: author?.name, duration: frag.media.duration ?? 10 })}
              className="grid size-20 place-items-center rounded-full text-white"
              style={{ background: "var(--flow-blue)" }}
            >
              {isCurrent(frag.id) ? <Pause size={30} fill="white" /> : <Play size={30} fill="white" />}
            </button>
          )}
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--flow-warm)" }}>
          <FlowIcon kind="fragment" size={16} /> 灵感碎片
        </span>
        <h1 className="mt-2 text-[20px] font-bold">{frag.title}</h1>
        <div className="mt-2 flex items-center gap-2 text-[13px]" style={{ color: "var(--flow-muted)" }}>
          {author && <ImageWithFallback src={author.avatar} alt={author.name} className="size-6 rounded-full object-cover" />}
          {author?.name}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-2xl p-3 text-[12px]" style={{ background: "var(--flow-warm)", color: "var(--flow-muted)" }}>
          <Puzzle size={16} className="mt-0.5 shrink-0" color="var(--flow-blue)" />
          灵感碎片可在续流编辑器中被「引用」，以虚线连接到你的版本节点，成为创作的素材来源。
        </div>

        {comments.length > 0 && (
          <>
            <h3 className="mt-5 text-[15px] font-semibold">评论 · {comments.length}</h3>
            <div className="mt-3 space-y-4">
              {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-[18px] font-bold">{n}</div>
      <div className="text-[11px]" style={{ color: "var(--flow-muted)" }}>{label}</div>
    </div>
  );
}

function IconStat({ active, color, onClick, icon, label }: { active: boolean; color: string; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 text-[13px]" style={{ color: active ? color : "var(--flow-muted)" }}>
      {icon}{label}
    </button>
  );
}
