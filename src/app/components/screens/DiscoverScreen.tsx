import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FileText, Music2, Palette, Pause, Play, Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useFlowStore } from "../../data/store";
import type { Fragment, MediaKind } from "../../data/types";
import { useNav } from "../../nav";
import { fmtTime, usePlayer } from "../../player";
import { flowMotion } from "../../motion";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { EmptyState } from "../states/States";
import waveformAsset from "../../../assets/content/fragments/xd-audio-waveform.png";

type InspirationFilter = "all" | MediaKind;

const FILTERS: Array<{ id: InspirationFilter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "sound", label: "声音" },
  { id: "pic", label: "图像" },
  { id: "text", label: "文字" },
];

export function DiscoverScreen() {
  const { state } = useFlowStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InspirationFilter>("all");
  const reduceMotion = useReducedMotion();

  const fragments = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return Object.values(state.fragments)
      .filter((fragment) => filter === "all" || fragment.media.kind === filter)
      .filter((fragment) => {
        if (!keyword) return true;
        const author = state.users[fragment.authorId];
        return `${fragment.title} ${fragment.media.text ?? ""} ${author?.name ?? ""}`
          .toLowerCase()
          .includes(keyword);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [filter, query, state.fragments, state.users]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 px-5 pb-3 pt-4">
        <div>
          <h1 className="text-[22px] font-bold">找灵感</h1>
          <p className="mt-1 text-[12px]" style={{ color: "var(--flow-muted)" }}>
            收集一段声音、一幅画或一句还没写完的话
          </p>
        </div>

        <label className="mt-4 flex items-center gap-2 rounded-2xl px-3.5" style={{ background: "var(--flow-warm)" }}>
          <Search size={18} color="var(--flow-muted)" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索灵感碎片……"
            className="min-w-0 flex-1 bg-transparent py-3 text-[14px] outline-none placeholder:text-[var(--flow-muted)]"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="清空搜索" className="grid size-7 place-items-center rounded-full bg-white">
              <X size={14} color="var(--flow-muted)" />
            </button>
          )}
        </label>

        <div className="mt-3 flex gap-2 overflow-x-auto" aria-label="灵感类型">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className="shrink-0 rounded-full px-4 py-2 text-[12px] font-medium transition-colors"
              style={{
                background: filter === item.id ? "black" : "var(--flow-warm)",
                color: filter === item.id ? "white" : "var(--flow-muted)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-32 pt-1">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-semibold">{FILTERS.find((item) => item.id === filter)?.label}灵感</p>
          <p className="text-[11px]" style={{ color: "var(--flow-muted)" }}>{fragments.length} 条</p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${filter}-${query}`}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={flowMotion.fade}
          >
            {fragments.length ? (
              <div className="space-y-3">
                {fragments.map((fragment) => <InspirationCard key={fragment.id} fragment={fragment} />)}
              </div>
            ) : (
              <EmptyState title="没有找到相关灵感" hint="换一个关键词或类型试试" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function InspirationCard({ fragment }: { fragment: Fragment }) {
  const { state } = useFlowStore();
  const nav = useNav();
  const { toggle, isCurrent } = usePlayer();
  const author = state.users[fragment.authorId];
  const playing = isCurrent(fragment.id);

  if (fragment.media.kind === "pic") {
    return (
      <button
        type="button"
        onClick={() => nav.push({ name: "detail", targetId: fragment.id })}
        className="flex w-full gap-3 rounded-[22px] bg-[var(--flow-warm)] p-3 text-left active:opacity-80"
      >
        <ImageWithFallback src={fragment.media.src ?? ""} alt={fragment.title} className="size-[88px] shrink-0 rounded-[16px] object-cover" />
        <CardCopy fragment={fragment} author={author?.name} icon={<Palette size={15} />} />
      </button>
    );
  }

  if (fragment.media.kind === "sound") {
    const duration = fragment.media.duration ?? 12;
    return (
      <div className="relative flex min-h-[92px] overflow-hidden rounded-[22px] bg-[var(--flow-warm)] p-3">
        <ImageWithFallback src={waveformAsset} alt="" className="pointer-events-none absolute inset-x-16 bottom-0 h-12 w-[calc(100%_-_76px)] object-fill opacity-[0.12]" />
        <button
          type="button"
          aria-label={playing ? "暂停" : "播放"}
          onClick={() => toggle({ id: fragment.id, title: fragment.title, subtitle: author?.name, duration })}
          className="relative z-10 mr-3 grid size-11 shrink-0 place-items-center self-center rounded-full bg-white"
        >
          {playing ? <Pause size={17} fill="var(--flow-blue)" color="var(--flow-blue)" /> : <Play size={17} fill="var(--flow-blue)" color="var(--flow-blue)" />}
        </button>
        <button type="button" onClick={() => nav.push({ name: "detail", targetId: fragment.id })} className="relative z-10 min-w-0 flex-1 text-left">
          <CardCopy fragment={fragment} author={`${author?.name ?? ""} · ${fmtTime(duration)}`} icon={<Music2 size={15} />} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => nav.push({ name: "detail", targetId: fragment.id })}
      className="w-full rounded-[22px] border border-black/[0.06] bg-white p-4 text-left active:bg-black/[0.02]"
    >
      <p className="line-clamp-4 text-[15px] leading-7">{fragment.media.text}</p>
      <div className="mt-4"><CardCopy fragment={fragment} author={author?.name} icon={<FileText size={15} />} compact /></div>
    </button>
  );
}

function CardCopy({ fragment, author, icon, compact = false }: { fragment: Fragment; author?: string; icon: ReactNode; compact?: boolean }) {
  return (
    <span className="block min-w-0 flex-1">
      {!compact && <span className="block truncate text-[14px] font-semibold">{fragment.title}</span>}
      <span className={`${compact ? "mt-0" : "mt-2"} flex items-center gap-1.5 text-[11px]`} style={{ color: "var(--flow-muted)" }}>
        {icon}<span className="truncate">{compact ? fragment.title : author}</span>
      </span>
      {compact && <span className="mt-1 block text-[10px]" style={{ color: "var(--flow-muted)" }}>{author}</span>}
    </span>
  );
}
