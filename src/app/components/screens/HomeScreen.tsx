import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useFlowStore, selectNodesOfFlow } from "../../data/store";
import { FlowLogo } from "../FlowLogo";
import { FilterChip } from "../chips/Chips";
import { ProjectCard, FragmentCard } from "../ContentCard";
import { CardSkeleton } from "../states/States";

const FILTERS = ["推荐", "关注", "可续作", "灵感碎片"] as const;

export function HomeScreen() {
  const { state } = useFlowStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("推荐");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(t);
  }, []);

  const me = state.users[state.currentUserId];
  const projects = Object.values(state.projects).sort((a, b) => {
    // 推荐流优先展示已长出更多分支的项目，让层叠卡片成为首页主视觉。
    const activity = selectNodesOfFlow(state, b.id).length - selectNodesOfFlow(state, a.id).length;
    return activity || b.createdAt - a.createdAt;
  });
  const fragments = Object.values(state.fragments).sort((a, b) => b.createdAt - a.createdAt);

  const shownProjects = projects.filter((p) => {
    if (filter === "关注") return me?.followingIds.includes(p.ownerId);
    if (filter === "可续作") return p.license !== "display-only";
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-5 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <FlowLogo />
          <button type="button" aria-label="通知" className="grid size-10 place-items-center rounded-full" style={{ background: "var(--flow-warm)" }}>
            <Bell size={18} />
          </button>
        </div>
        <p className="mt-1 text-[12px]" style={{ color: "var(--flow-muted)" }}>让灵感自由流淌，一起把一首歌续成一棵树</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <FilterChip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-32 pt-2">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : filter === "灵感碎片" ? (
          fragments.map((f) => <FragmentCard key={f.id} fragment={f} />)
        ) : (
          shownProjects.map((p) => (
            <ProjectCard key={p.id} project={p} nodeCount={selectNodesOfFlow(state, p.id).length} />
          ))
        )}
        {!loading && filter !== "灵感碎片" && shownProjects.length === 0 && (
          <p className="pt-10 text-center text-[13px]" style={{ color: "var(--flow-muted)" }}>暂无内容</p>
        )}
      </div>
    </div>
  );
}
