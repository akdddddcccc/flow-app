import { useState } from "react";
import { FileStack } from "lucide-react";
import { useFlowStore, selectNodesOfFlow } from "../../data/store";
import { useNav } from "../../nav";
import { TopBar } from "../TopBar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { RoleChip } from "../chips/Chips";
import { ProjectCard, FragmentCard } from "../ContentCard";
import { EmptyState } from "../states/States";

const TABS = ["发起的源", "参与的流", "灵感碎片", "收藏"] as const;

export function ProfileScreen() {
  const { state } = useFlowStore();
  const nav = useNav();
  const me = state.users[state.currentUserId];
  const [tab, setTab] = useState<(typeof TABS)[number]>("发起的源");

  const myProjects = Object.values(state.projects).filter((p) => p.ownerId === me.id);
  const myNodes = Object.values(state.nodes).filter((n) => n.authorId === me.id);
  const participatedFlowIds = [...new Set(myNodes.map((n) => n.flowId))].filter(
    (fid) => state.projects[fid] && state.projects[fid].ownerId !== me.id,
  );
  const myFragments = Object.values(state.fragments).filter((f) => f.authorId === me.id);
  const saved = Object.entries(state.engagement).filter(([, e]) => e.saved).map(([id]) => state.projects[id]).filter(Boolean);

  // 贡献统计
  const completedByMe = myNodes.filter((n) => n.completed).length;
  const continuedTimes = Object.values(state.nodes).filter(
    (n) => n.parentId && state.nodes[n.parentId]?.authorId === me.id && n.authorId !== me.id,
  ).length;

  return (
    <div className="flex h-full flex-col">
      <TopBar
        title="我的"
        right={
          <button type="button" onClick={() => nav.push({ name: "drafts" })} aria-label="草稿箱" className="grid size-10 place-items-center rounded-full" style={{ background: "var(--flow-warm)" }}>
            <FileStack size={18} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-5 pt-4">
          <div className="flex items-center gap-3">
            <ImageWithFallback src={me.avatar} alt={me.name} className="size-16 rounded-2xl object-cover" />
            <div>
              <h1 className="text-[20px] font-bold">{me.name}</h1>
              <p className="text-[12px]" style={{ color: "var(--flow-muted)" }}>{me.handle}</p>
            </div>
          </div>
          <p className="mt-2 text-[13px]">{me.bio}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{me.roles.map((r) => <RoleChip key={r} role={r} size="sm" />)}</div>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl py-3 text-center" style={{ background: "var(--flow-warm)" }}>
            <Stat n={String(participatedFlowIds.length + myProjects.length)} label="参与项目" />
            <Stat n={String(continuedTimes)} label="被续作" />
            <Stat n={String(completedByMe)} label="完成版本" />
          </div>
        </div>

        <div className="mt-4 flex gap-5 overflow-x-auto border-b border-black/5 px-5">
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className="relative whitespace-nowrap pb-2 text-[14px]" style={{ color: tab === t ? "black" : "var(--flow-muted)", fontWeight: tab === t ? 600 : 400 }}>
              {t}
              {tab === t && <span className="absolute -bottom-px left-0 h-0.5 w-full rounded-full" style={{ background: "var(--flow-blue)" }} />}
            </button>
          ))}
        </div>

        <div className="space-y-4 p-5">
          {tab === "发起的源" && (myProjects.length ? myProjects.map((p) => <ProjectCard key={p.id} project={p} nodeCount={selectNodesOfFlow(state, p.id).length} />) : <EmptyState title="还没有发起的源" hint="去发布一个源，开启一棵创作树" />)}
          {tab === "参与的流" && (participatedFlowIds.length ? participatedFlowIds.map((fid) => <ProjectCard key={fid} project={state.projects[fid]} nodeCount={selectNodesOfFlow(state, fid).length} />) : <EmptyState title="还没有参与的流" />)}
          {tab === "灵感碎片" && (myFragments.length ? myFragments.map((f) => <FragmentCard key={f.id} fragment={f} />) : <EmptyState title="还没有灵感碎片" />)}
          {tab === "收藏" && (saved.length ? saved.map((p) => <ProjectCard key={p.id} project={p} nodeCount={selectNodesOfFlow(state, p.id).length} />) : <EmptyState title="还没有收藏" />)}
        </div>
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
