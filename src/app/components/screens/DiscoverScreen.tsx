import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  FileText,
  GitBranch,
  Music2,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useFlowStore, selectNodesOfFlow } from "../../data/store";
import { ROLE_LIST, type Fragment, type MediaKind, type Role } from "../../data/types";
import { ProjectCard, FragmentCard } from "../ContentCard";
import { EmptyState } from "../states/States";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useNav } from "../../nav";
import { fmtTime, usePlayer } from "../../player";
import waveformAsset from "../../../assets/content/fragments/xd-audio-waveform.png";
import { flowMotion, staggerDelay } from "../../motion";

type ResultType = "全部" | "创作流" | "灵感碎片";
type PresetId = "sound" | "visual" | "text" | "cross" | "color" | "mood" | "open";
type FragmentLayout = "list" | "gallery" | "sound";

type BrowsePreset = {
  id: PresetId;
  label: string;
  description: string;
  Icon: LucideIcon;
  media?: MediaKind;
  subcategories: string[];
};

const MEDIA_PRESETS: BrowsePreset[] = [
  { id: "sound", label: "音乐与声音", description: "旋律、节奏、人声与采样", Icon: Music2, media: "sound", subcategories: ["全部", "旋律", "节奏", "人声", "采样"] },
  { id: "visual", label: "视觉与绘画", description: "色彩、构图、纹理与图像", Icon: Palette, media: "pic", subcategories: ["全部", "色彩", "构图", "纹理", "摄影"] },
  { id: "text", label: "文字与叙事", description: "歌词、诗歌、故事与概念", Icon: FileText, media: "text", subcategories: ["全部", "歌词", "诗歌", "故事", "概念"] },
  { id: "cross", label: "跨媒介", description: "让图像、声音和文字彼此续作", Icon: Sparkles, subcategories: ["全部", "图像到声音", "文字到音乐", "声音到视觉"] },
];

const INSPIRATION_PRESETS: BrowsePreset[] = [
  { id: "color", label: "按色彩与纹理", description: "沿用 XD 中按色调寻找视觉灵感的思路", Icon: Palette, media: "pic", subcategories: ["全部", "冷色", "暖色", "高对比", "低饱和"] },
  { id: "mood", label: "按情绪与氛围", description: "从感受出发，跨媒介寻找作品", Icon: Sparkles, subcategories: ["全部", "浪漫", "梦境", "孤独", "能量"] },
  { id: "open", label: "只看可续作", description: "直接找到允许 remix 的源和分支", Icon: GitBranch, subcategories: ["全部", "刚刚开始", "正在生长", "已有完成版"] },
];

const ALL_PRESETS = [...MEDIA_PRESETS, ...INSPIRATION_PRESETS];
const HOT_TAGS = ["lo-fi", "实验", "视觉", "电子", "情歌", "synthwave"];

export function DiscoverScreen() {
  const { state } = useFlowStore();
  const [query, setQuery] = useState("");
  const [presetId, setPresetId] = useState<PresetId | null>(null);
  const [subcategory, setSubcategory] = useState("全部");
  const [showFilters, setShowFilters] = useState(false);
  const [resultType, setResultType] = useState<ResultType>("全部");
  const [roleFilter, setRoleFilter] = useState<Role | "全部">("全部");
  const [continuableOnly, setContinuableOnly] = useState(false);

  const preset = ALL_PRESETS.find((item) => item.id === presetId) ?? null;
  const q = query.trim().toLowerCase();
  const inResults = Boolean(q || preset);
  const fragmentLayout: FragmentLayout = preset?.media === "pic" ? "gallery" : preset?.media === "sound" ? "sound" : "list";

  const projects = useMemo(() => {
    if (resultType === "灵感碎片") return [];
    return Object.values(state.projects).filter((project) => {
      const searchable = `${project.title} ${project.description} ${project.tags.join(" ")}`.toLowerCase();
      if (q && !searchable.includes(q)) return false;
      const nodes = selectNodesOfFlow(state, project.id);
      const source = state.nodes[project.sourceNodeId];
      if (preset?.id === "cross") {
        const kinds = new Set(nodes.flatMap((node) => node.media.map((media) => media.kind)));
        if (kinds.size < 2) return false;
      } else if (preset?.media && !source?.media.some((media) => media.kind === preset.media)) {
        return false;
      }
      if ((preset?.id === "open" || continuableOnly) && project.license === "display-only") return false;
      if (roleFilter !== "全部" && !nodes.some((node) => node.roles.includes(roleFilter))) return false;
      if (!matchesProjectSubcategory(project, nodes, preset?.id, subcategory)) return false;
      return true;
    });
  }, [state, q, preset, subcategory, resultType, roleFilter, continuableOnly]);

  const fragments = useMemo(() => {
    if (resultType === "创作流" || preset?.id === "open" || preset?.id === "cross") return [];
    return Object.values(state.fragments).filter((fragment) => {
      const searchable = `${fragment.title} ${fragment.media.text ?? ""}`.toLowerCase();
      if (q && !searchable.includes(q)) return false;
      if (preset?.media && fragment.media.kind !== preset.media) return false;
      if (!matchesFragmentSubcategory(fragment.title, fragment.media.text ?? "", preset?.id, subcategory)) return false;
      return true;
    });
  }, [state.fragments, q, preset, subcategory, resultType]);

  const resetFilters = () => {
    setResultType("全部");
    setRoleFilter("全部");
    setContinuableOnly(false);
  };

  const openPreset = (id: PresetId) => {
    setPresetId(id);
    setSubcategory("全部");
    setContinuableOnly(id === "open");
  };

  const leaveResults = () => {
    setQuery("");
    setPresetId(null);
    setSubcategory("全部");
    resetFilters();
  };
  const portalTarget = typeof document === "undefined" ? null : document.querySelector(".flow-app-shell");

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <header className="shrink-0 px-5 pb-3 pt-4">
        <div className="flex items-center gap-2">
          {inResults && (
            <button type="button" onClick={leaveResults} aria-label="返回发现分类" className="grid size-10 shrink-0 place-items-center rounded-full" style={{ background: "var(--flow-warm)" }}>
              <ArrowLeft size={19} />
            </button>
          )}
          <h1 className="text-[22px] font-bold">{inResults ? (q ? "搜索结果" : preset?.label) : "发现"}</h1>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl px-3.5" style={{ background: "var(--flow-warm)" }}>
          <Search size={18} color="var(--flow-muted)" className="shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索作品、标签或创作者……"
            className="min-w-0 flex-1 bg-transparent py-3 text-[14px] outline-none placeholder:text-[var(--flow-muted)]"
            aria-label="搜索"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="清空搜索" className="grid size-7 place-items-center rounded-full bg-white">
              <X size={14} color="var(--flow-muted)" />
            </button>
          )}
        </div>
      </header>

      <AnimatePresence initial={false} mode="wait">
        {!inResults ? (
          <motion.div
            key="discover-landing"
            className="flex-1 overflow-y-auto px-5 pb-32"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={flowMotion.local}
          >
            <section className="pt-2">
              <SectionHeading title="按媒介探索" hint="先选择作品形态" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {MEDIA_PRESETS.map((item) => <MediaEntry key={item.id} item={item} onClick={() => openPreset(item.id)} />)}
              </div>
            </section>

            <section className="mt-7">
              <SectionHeading title="换一种找法" hint="从灵感或参与方式出发" />
              <div className="mt-3 overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                {INSPIRATION_PRESETS.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openPreset(item.id)}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-black/[0.03]"
                    style={{ borderTop: index ? "1px solid rgba(0,0,0,0.05)" : undefined }}
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl" style={{ background: "var(--flow-warm)" }}>
                      <item.Icon size={20} color="var(--flow-blue)" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug" style={{ color: "var(--flow-muted)" }}>{item.description}</span>
                    </span>
                    <ChevronRight size={18} color="var(--flow-muted)" />
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-7">
              <SectionHeading title="近期热门标签" hint="快速进入结果" />
              <div className="mt-3 flex flex-wrap gap-2">
                {HOT_TAGS.map((tag) => (
                  <button key={tag} type="button" onClick={() => setQuery(tag)} className="rounded-full px-3.5 py-2 text-[12px] font-medium active:scale-95" style={{ background: "var(--flow-warm)" }}>
                    #{tag}
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key={`discover-results-${presetId ?? "search"}`}
            className="flex-1 overflow-y-auto px-5 pb-32"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={flowMotion.local}
          >
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[13px] font-semibold">{q ? `“${query.trim()}”` : preset?.description}</p>
                <p className="mt-0.5 text-[11px]" style={{ color: "var(--flow-muted)" }}>{projects.length + fragments.length} 个结果</p>
              </div>
              <button type="button" onClick={() => setShowFilters(true)} className="flex h-10 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold" style={{ background: "var(--flow-warm)" }}>
                <SlidersHorizontal size={15} />筛选
              </button>
            </div>

            {preset && (
              <div className="mt-4 flex flex-wrap gap-2" aria-label="二级分类">
                {preset.subcategories.map((item) => (
                  <motion.button
                    key={item}
                    type="button"
                    onClick={() => setSubcategory(item)}
                    className="relative overflow-hidden rounded-full px-3.5 py-2 text-[12px] font-medium"
                    style={{ background: "var(--flow-warm)", color: subcategory === item ? "white" : "var(--flow-muted)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={flowMotion.press}
                  >
                    {subcategory === item && (
                      <motion.span
                        layoutId="discover-subcategory-active"
                        className="absolute inset-0 rounded-full bg-black"
                        transition={flowMotion.settle}
                      />
                    )}
                    <span className="relative z-10">{item}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {projects.length === 0 && fragments.length === 0 ? (
              <EmptyState title="没有找到相关内容" hint="换个关键词或调整筛选条件试试" />
            ) : (
              <div className="mt-6 space-y-6">
                {fragments.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-[13px] font-bold">灵感碎片</h2>
                    <FragmentResultCollection fragments={fragments} layout={fragmentLayout} />
                  </section>
                )}
                {projects.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-[13px] font-bold">创作流</h2>
                    <div className="space-y-4">
                      {projects.map((project) => <ProjectCard key={project.id} project={project} nodeCount={selectNodesOfFlow(state, project.id).length} />)}
                    </div>
                  </section>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {portalTarget && createPortal(
        <AnimatePresence>
          {showFilters && (
          <div className="absolute inset-0 z-50">
            <motion.button
              type="button"
              aria-label="关闭筛选"
              className="absolute inset-0 bg-black/25"
              onClick={() => setShowFilters(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={flowMotion.fade}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="筛选结果"
              className="absolute inset-x-0 bottom-0 rounded-t-[30px] bg-white px-5 pb-7 pt-4 shadow-[0_-20px_60px_rgba(0,0,0,0.16)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={flowMotion.sheet}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.025, bottom: 0.26 }}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (info.offset.y > 72 || info.velocity.y > 650) setShowFilters(false);
              }}
            >
              <div className="mx-auto h-1 w-10 rounded-full bg-black/15" />
              <div className="mt-4 flex items-center justify-between">
                <h2 className="text-[18px] font-bold">筛选</h2>
                <button type="button" onClick={resetFilters} className="flex items-center gap-1 text-[12px]" style={{ color: "var(--flow-muted)" }}><RotateCcw size={14} />重置</button>
              </div>

              <FilterGroup title="内容类型">
                {(["全部", "创作流", "灵感碎片"] as ResultType[]).map((item) => <FilterPill key={item} label={item} active={resultType === item} onClick={() => setResultType(item)} />)}
              </FilterGroup>

              <FilterGroup title="参与角色">
                <FilterPill label="全部" active={roleFilter === "全部"} onClick={() => setRoleFilter("全部")} />
                {ROLE_LIST.map((role) => <FilterPill key={role} label={role} active={roleFilter === role} onClick={() => setRoleFilter(role)} />)}
              </FilterGroup>

              <button
                type="button"
                onClick={() => setContinuableOnly((value) => !value)}
                className="mt-5 flex w-full items-center justify-between rounded-2xl p-3.5 text-left"
                style={{ background: "var(--flow-warm)" }}
              >
                <span>
                  <span className="block text-[13px] font-semibold">只看允许续作</span>
                  <span className="mt-0.5 block text-[11px]" style={{ color: "var(--flow-muted)" }}>隐藏仅供展示的作品</span>
                </span>
                <span className="grid size-7 place-items-center rounded-full" style={{ background: continuableOnly ? "var(--flow-blue)" : "white" }}>
                  {continuableOnly && <Check size={15} color="white" strokeWidth={3} />}
                </span>
              </button>

              <button type="button" onClick={() => setShowFilters(false)} className="mt-5 h-12 w-full rounded-full text-[14px] font-semibold text-white active:scale-[0.98]" style={{ background: "var(--flow-blue)" }}>
                查看 {projects.length + fragments.length} 个结果
              </button>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        portalTarget,
      )}
    </div>
  );
}

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-[16px] font-bold">{title}</h2>
      <p className="text-[11px]" style={{ color: "var(--flow-muted)" }}>{hint}</p>
    </div>
  );
}

function MediaEntry({ item, onClick }: { item: BrowsePreset; onClick: () => void }) {
  return (
    <motion.button type="button" onClick={onClick} className="min-h-[130px] rounded-3xl p-4 text-left" style={{ background: "var(--flow-warm)" }} whileTap={{ scale: 0.97 }} transition={flowMotion.press}>
      <span className="grid size-11 place-items-center rounded-2xl bg-white"><item.Icon size={21} color="var(--flow-blue)" /></span>
      <span className="mt-4 block text-[14px] font-bold">{item.label}</span>
      <span className="mt-1 block text-[11px] leading-snug" style={{ color: "var(--flow-muted)" }}>{item.description}</span>
    </motion.button>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-[12px] font-semibold" style={{ color: "var(--flow-muted)" }}>{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full px-3.5 py-2 text-[12px] font-medium" style={{ background: active ? "black" : "var(--flow-warm)", color: active ? "white" : "var(--flow-muted)" }}>
      {label}
    </button>
  );
}

function FragmentResultCollection({ fragments, layout }: { fragments: Fragment[]; layout: FragmentLayout }) {
  if (layout === "gallery") {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {fragments.map((fragment, index) => <VisualFragmentTile key={fragment.id} fragment={fragment} index={index} />)}
      </div>
    );
  }

  if (layout === "sound") {
    return (
      <div className="space-y-2.5">
        {fragments.map((fragment, index) => <SoundFragmentRow key={fragment.id} fragment={fragment} index={index} />)}
      </div>
    );
  }

  return <div className="space-y-2">{fragments.map((fragment) => <FragmentCard key={fragment.id} fragment={fragment} />)}</div>;
}

function VisualFragmentTile({ fragment, index }: { fragment: Fragment; index: number }) {
  const { state } = useFlowStore();
  const nav = useNav();
  const author = state.users[fragment.authorId];

  return (
    <motion.button
      type="button"
      onClick={() => nav.push({ name: "detail", targetId: fragment.id })}
      aria-label={`查看${fragment.title}详情`}
      className="group relative aspect-square overflow-hidden rounded-[20px] bg-[var(--flow-warm)] text-left"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.975 }}
      transition={{ ...flowMotion.local, delay: staggerDelay(index) }}
    >
      {fragment.media.src && (
        <ImageWithFallback
          src={fragment.media.src}
          alt={fragment.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
      )}
      <span className="absolute inset-x-2 bottom-2 rounded-xl bg-black/60 px-2.5 py-2 text-white backdrop-blur-md">
        <span className="block truncate text-[11px] font-semibold">{fragment.title}</span>
        <span className="mt-0.5 block truncate text-[9px] text-white/68">{author?.name} · 图片碎片</span>
      </span>
    </motion.button>
  );
}

const SOUND_CARD_TONES = ["#e7e4d7", "#f0e0df", "#e1e4e9", "#dce7e4", "#e8e3ee"];

function SoundFragmentRow({ fragment, index }: { fragment: Fragment; index: number }) {
  const { state } = useFlowStore();
  const nav = useNav();
  const { toggle, isCurrent } = usePlayer();
  const author = state.users[fragment.authorId];
  const playing = isCurrent(fragment.id);
  const duration = fragment.media.duration ?? 12;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`查看${fragment.title}详情`}
      onClick={() => nav.push({ name: "detail", targetId: fragment.id })}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          nav.push({ name: "detail", targetId: fragment.id });
        }
      }}
      className="relative flex min-h-[86px] cursor-pointer items-center gap-3 overflow-hidden rounded-[20px] px-3.5 py-3 text-left"
      style={{ background: SOUND_CARD_TONES[index % SOUND_CARD_TONES.length] }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      transition={{ ...flowMotion.local, delay: staggerDelay(index) }}
    >
      <motion.img
        src={waveformAsset}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-4px] left-[68px] right-3 h-[44px] w-[calc(100%_-_80px)] object-fill"
        initial={false}
        animate={{
          opacity: playing ? 0.3 : 0.14,
          scaleY: !reduceMotion && playing ? 1.06 : 1,
        }}
        transition={flowMotion.settle}
      />
      <button
        type="button"
        aria-label={playing ? "暂停" : "播放"}
        onClick={(event) => {
          event.stopPropagation();
          toggle({ id: fragment.id, title: fragment.title, subtitle: author?.name, duration });
        }}
        className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-white/90 shadow-[0_3px_12px_rgba(0,0,0,0.08)] transition-transform duration-100 active:scale-[0.96]"
      >
        {playing ? <Pause size={16} fill="var(--flow-blue)" color="var(--flow-blue)" /> : <Play size={16} fill="var(--flow-blue)" color="var(--flow-blue)" />}
      </button>

      <div className="relative z-10 min-w-0 flex-1 self-start pt-1.5">
        <h3 className="truncate text-[13px] font-semibold">{fragment.title}</h3>
        <p className="mt-1 truncate text-[10px]" style={{ color: "var(--flow-muted)" }}>{author?.name} · {fmtTime(duration)}</p>
      </div>

    </motion.div>
  );
}

const SUBCATEGORY_TERMS: Record<string, string[]> = {
  旋律: ["旋律", "钢琴", "弦乐", "synth"],
  节奏: ["节奏", "鼓", "beat", "groove", "loop", "8-bit"],
  人声: ["人声", "演唱", "歌词", "气声"],
  采样: ["采样", "切片", "glitch"],
  色彩: ["色彩", "色块", "color", "蒙德里安"],
  构图: ["构图", "画面", "图像"],
  纹理: ["纹理", "texture", "残影"],
  摄影: ["城市", "人物", "摄影", "city"],
  歌词: ["歌词", "主歌", "副歌"],
  诗歌: ["诗", "浪漫"],
  故事: ["故事", "遇见", "灵魂"],
  概念: ["概念", "实验", "视觉"],
  冷色: ["冷色", "蓝", "宇宙", "夜"],
  暖色: ["暖色", "黄", "红", "温暖"],
  高对比: ["高对比", "黑", "红", "黄", "冲突"],
  低饱和: ["低饱和", "压暗", "克制"],
  浪漫: ["浪漫", "romantic", "情歌", "爱"],
  梦境: ["梦", "宇宙", "迷茫"],
  孤独: ["孤独", "陌生", "夜跑"],
  能量: ["能量", "热烈", "派对", "冲击"],
};

function matchesProjectSubcategory(
  project: { title: string; description: string; tags: string[] },
  nodes: ReturnType<typeof selectNodesOfFlow>,
  presetId: PresetId | undefined,
  subcategory: string,
) {
  if (subcategory === "全部") return true;
  if (presetId === "open") {
    if (subcategory === "刚刚开始") return nodes.length <= 2;
    if (subcategory === "正在生长") return nodes.length > 2;
    if (subcategory === "已有完成版") return nodes.some((node) => node.completed);
  }
  if (presetId === "cross") {
    const sourceKinds = new Set(nodes.filter((node) => node.parentId === null).flatMap((node) => node.media.map((media) => media.kind)));
    const childKinds = new Set(nodes.filter((node) => node.parentId !== null).flatMap((node) => node.media.map((media) => media.kind)));
    if (subcategory === "图像到声音") return sourceKinds.has("pic") && childKinds.has("sound");
    if (subcategory === "文字到音乐") return sourceKinds.has("text") && childKinds.has("sound");
    if (subcategory === "声音到视觉") return sourceKinds.has("sound") && childKinds.has("pic");
  }
  const terms = SUBCATEGORY_TERMS[subcategory] ?? [];
  if (!terms.length) return true;
  const blob = `${project.title} ${project.description} ${project.tags.join(" ")} ${nodes.map((node) => `${node.title} ${node.changeNote} ${node.roles.join(" ")}`).join(" ")}`.toLowerCase();
  return terms.some((term) => blob.includes(term.toLowerCase()));
}

function matchesFragmentSubcategory(title: string, text: string, presetId: PresetId | undefined, subcategory: string) {
  if (subcategory === "全部") return true;
  if (presetId === "open" || presetId === "cross") return false;
  const terms = SUBCATEGORY_TERMS[subcategory] ?? [];
  if (!terms.length) return true;
  const blob = `${title} ${text}`.toLowerCase();
  return terms.some((term) => blob.includes(term.toLowerCase()));
}
