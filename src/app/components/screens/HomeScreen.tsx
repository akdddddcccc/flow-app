import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useFlowStore, selectNodesOfFlow } from "../../data/store";
import { FlowLogo } from "../FlowLogo";
import { ProjectCard } from "../ContentCard";
import { CardSkeleton } from "../states/States";

export function HomeScreen() {
  const { state } = useFlowStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(t);
  }, []);

  const shownProjects = Object.values(state.projects).sort((a, b) => {
    const activity = selectNodesOfFlow(state, b.id).length - selectNodesOfFlow(state, a.id).length;
    return activity || b.createdAt - a.createdAt;
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
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-32 pt-2">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          shownProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              nodeCount={selectNodesOfFlow(state, project.id).length}
            />
          ))
        )}
      </div>
    </div>
  );
}
