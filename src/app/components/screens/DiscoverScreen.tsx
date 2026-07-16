import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useFlowStore, selectNodesOfFlow } from "../../data/store";
import { ROLE_LIST, type Role } from "../../data/types";
import { ProjectCard, FragmentCard } from "../ContentCard";
import { FilterChip } from "../chips/Chips";
import { EmptyState } from "../states/States";

type ContentType = "全部" | "源" | "续流" | "灵感碎片";
type MediaFilter = "全部" | "音频" | "图片" | "文字";
type ContinuableFilter = "全部" | "允许续作";

const CONTENT_TYPES: ContentType[] = ["全部", "源", "续流", "灵感碎片"];
const MEDIA_TYPES: MediaFilter[] = ["全部", "音频", "图片", "文字"];
const CONTINUABLE_OPTS: ContinuableFilter[] = ["全部", "允许续作"];

export function DiscoverScreen() {
  const { state } = useFlowStore();

  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState<ContentType>("全部");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("全部");
  const [roleFilter, setRoleFilter] = useState<Role | "全部">("全部");
  const [continuable, setContinuable] = useState<ContinuableFilter>("全部");

  const q = query.trim().toLowerCase();

  const projects = useMemo(() => {
    return Object.values(state.projects).filter((p) => {
      // 搜索词
      if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.tags.join(" ").toLowerCase().includes(q)) return false;
      // 内容类型
      if (contentType === "灵感碎片") return false;
      if (contentType === "续流") {
        const nodes = selectNodesOfFlow(state, p.id);
        if (!nodes.some((n) => n.kind === "flow")) return false;
      }
      // 可续作
      if (continuable === "允许续作" && p.license === "display-only") return false;
      // 媒介：按源节点的媒体类型过滤
      if (mediaFilter !== "全部") {
        const source = state.nodes[p.sourceNodeId];
        const kindMap: Record<MediaFilter, string> = { 全部: "", 音频: "sound", 图片: "pic", 文字: "text" };
        if (!source?.media.some((m) => m.kind === kindMap[mediaFilter])) return false;
      }
      // 角色：按流内节点作者的角色过滤
      if (roleFilter !== "全部") {
        const nodes = selectNodesOfFlow(state, p.id);
        if (!nodes.some((n) => n.roles.includes(roleFilter as Role))) return false;
      }
      return true;
    });
  }, [state, q, contentType, mediaFilter, roleFilter, continuable]);

  const fragments = useMemo(() => {
    if (contentType !== "全部" && contentType !== "灵感碎片") return [];
    return Object.values(state.fragments).filter((f) => {
      if (q && !f.title.toLowerCase().includes(q)) return false;
      if (mediaFilter !== "全部") {
        const kindMap: Record<MediaFilter, string> = { 全部: "", 音频: "sound", 图片: "pic", 文字: "text" };
        if (f.media.kind !== kindMap[mediaFilter]) return false;
      }
      return true;
    });
  }, [state, q, contentType, mediaFilter]);

  const hasResults = projects.length > 0 || fragments.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header + Filters */}
      <header className="shrink-0 space-y-3 px-5 pb-2 pt-4">
        <h1 className="text-[22px] font-bold">发现</h1>

        {/* 搜索框 */}
        <div className="flex items-center gap-2 rounded-2xl px-3.5" style={{ background: "var(--flow-warm)" }}>
          <Search size={18} color="var(--flow-muted)" className="shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题、简介、标签……"
            className="flex-1 bg-transparent py-2.5 text-[14px] outline-none placeholder:text-[var(--flow-muted)]"
            aria-label="搜索"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="清空搜索" className="shrink-0">
              <X size={16} color="var(--flow-muted)" />
            </button>
          )}
        </div>

        {/* 内容类型 + 可续作 */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {CONTENT_TYPES.map((t) => (
            <FilterChip key={t} label={t} selected={contentType === t} onClick={() => setContentType(t)} />
          ))}
          <span className="mx-1 self-center text-[var(--flow-gray)]">·</span>
          {CONTINUABLE_OPTS.map((t) => (
            <FilterChip key={t} label={t} selected={continuable === t} onClick={() => setContinuable(t)} />
          ))}
        </div>

        {/* 媒介 */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <span className="shrink-0 self-center text-[12px]" style={{ color: "var(--flow-muted)" }}>媒介</span>
          {MEDIA_TYPES.map((t) => (
            <FilterChip key={t} label={t} selected={mediaFilter === t} onClick={() => setMediaFilter(t)} />
          ))}
        </div>

        {/* 角色 */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <span className="shrink-0 self-center text-[12px]" style={{ color: "var(--flow-muted)" }}>角色</span>
          <FilterChip label="全部" selected={roleFilter === "全部"} onClick={() => setRoleFilter("全部")} />
          {ROLE_LIST.map((r) => (
            <FilterChip key={r} label={r} selected={roleFilter === r} onClick={() => setRoleFilter(r)} />
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-32 pt-2">
        {!hasResults ? (
          <EmptyState title="没有找到相关内容" hint="换个关键词或调整筛选条件试试" />
        ) : (
          <>
            {fragments.length > 0 && (
              <section>
                <h2 className="mb-2 text-[13px] font-semibold" style={{ color: "var(--flow-muted)" }}>灵感碎片</h2>
                <div className="space-y-2">
                  {fragments.map((f) => <FragmentCard key={f.id} fragment={f} />)}
                </div>
              </section>
            )}
            {projects.length > 0 && (
              <section>
                <h2 className="mb-2 text-[13px] font-semibold" style={{ color: "var(--flow-muted)" }}>
                  {contentType === "灵感碎片" ? "" : "创作流"}
                </h2>
                <div className="space-y-4">
                  {projects.map((p) => (
                    <ProjectCard key={p.id} project={p} nodeCount={selectNodesOfFlow(state, p.id).length} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
