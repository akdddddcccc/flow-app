import { useEffect, useState } from "react";
import { Bell, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useFlowStore, selectNodesOfFlow } from "../../data/store";
import { FlowLogo } from "../FlowLogo";
import { ProjectCard } from "../ContentCard";
import { CardSkeleton } from "../states/States";
import type { FlowProject } from "../../data/types";

const RANKINGS = ["正在生长", "本周热门", "最新源作"] as const;
type Ranking = (typeof RANKINGS)[number];

export function HomeScreen() {
  const { state } = useFlowStore();
  const [ranking, setRanking] = useState<Ranking>("正在生长");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(t);
  }, []);

  const shownProjects = Object.values(state.projects).sort((a, b) => {
    if (ranking === "正在生长") {
      const activity = selectNodesOfFlow(state, b.id).length - selectNodesOfFlow(state, a.id).length;
      return activity || b.createdAt - a.createdAt;
    }
    if (ranking === "本周热门") {
      return (b.likes + b.saves * 2) - (a.likes + a.saves * 2);
    }
    return b.createdAt - a.createdAt;
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
        <p className="mt-1 text-[12px]" style={{ color: "var(--flow-muted)" }}>看看此刻正在生长的作品与新分支</p>
        <div className="relative mt-3 grid grid-cols-3 rounded-2xl p-1" style={{ background: "var(--flow-warm)" }}>
          {RANKINGS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRanking(item)}
              className="relative z-10 h-9 rounded-xl text-[12px] font-semibold"
              style={{ color: ranking === item ? "white" : "var(--flow-muted)" }}
            >
              {ranking === item && (
                <motion.span
                  layoutId="home-ranking-active"
                  className="absolute inset-0 -z-10 rounded-xl"
                  style={{ background: "black" }}
                  transition={{ type: "spring", stiffness: 430, damping: 34 }}
                />
              )}
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-32 pt-2">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <TrendingUp size={16} color="var(--flow-blue)" />
            <span>热流榜</span>
          </div>
          <span className="text-[11px]" style={{ color: "var(--flow-muted)" }}>持续更新</span>
        </div>
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          shownProjects.map((project, index) => (
            <RankedProject
              key={`${ranking}-${project.id}`}
              project={project}
              rank={index + 1}
              ranking={ranking}
              nodeCount={selectNodesOfFlow(state, project.id).length}
            />
          ))
        )}
      </div>
    </div>
  );
}

function RankedProject({
  project,
  rank,
  ranking,
  nodeCount,
}: {
  project: FlowProject;
  rank: number;
  ranking: Ranking;
  nodeCount: number;
}) {
  const { state } = useFlowStore();
  const [showReason, setShowReason] = useState(false);
  const contributors = new Set(selectNodesOfFlow(state, project.id).map((node) => node.authorId)).size;
  const ageDays = Math.max(1, Math.round((Date.now() - project.createdAt) / 86400000));
  const reason = ranking === "正在生长"
    ? `${Math.max(1, Math.round(nodeCount / 3))} 个近期分支 · ${contributors} 位创作者`
    : ranking === "本周热门"
      ? `${project.likes} 次回应 · ${project.saves} 人收藏`
      : `${ageDays} 天前发布 · ${project.license === "display-only" ? "仅展示" : "开放续作"}`;

  return (
    <section>
      <div className="group relative mb-1 flex h-6 items-center px-1">
        <button
          type="button"
          aria-label={`第 ${rank} 名，${reason}`}
          aria-expanded={showReason}
          aria-describedby={showReason ? `rank-reason-${project.id}` : undefined}
          onClick={() => setShowReason((visible) => !visible)}
          onBlur={() => setShowReason(false)}
          className="grid size-6 place-items-center rounded-full text-[11px] font-bold outline-none ring-offset-2 focus-visible:ring-2"
          style={{ background: rank <= 3 ? "var(--flow-blue)" : "var(--flow-warm)", color: rank <= 3 ? "white" : "black" }}
        >
          {rank}
        </button>
        <p
          id={`rank-reason-${project.id}`}
          role="tooltip"
          aria-hidden={!showReason}
          className={`pointer-events-none absolute left-9 top-0 z-20 h-6 items-center whitespace-nowrap rounded-full bg-black px-2.5 text-[10px] text-white shadow-lg ${showReason ? "flex" : "hidden group-focus-within:flex group-hover:flex"}`}
        >
          {reason}
        </p>
      </div>
      <ProjectCard project={project} nodeCount={nodeCount} />
    </section>
  );
}
