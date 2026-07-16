import { Play, Pause, Heart, GitBranch } from "lucide-react";
import { motion } from "motion/react";
import type { FlowProject, Fragment } from "../data/types";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { FlowGlyph, FlowIcon } from "./icons/FlowIcon";
import { usePlayer } from "../player";
import { useFlowStore } from "../data/store";
import { useNav } from "../nav";
import { fmtCount } from "../util";

/**
 * ProjectCard — blue-immersive card: cover photo inset on top,
 * saturated blue title bar below, stacking layers behind based on nodeCount.
 */
export function ProjectCard({ project, nodeCount }: { project: FlowProject; nodeCount: number }) {
  const { state, dispatch } = useFlowStore();
  const { play, isCurrent } = usePlayer();
  const nav = useNav();
  const source = state.nodes[project.sourceNodeId];
  const owner = state.users[project.ownerId];
  const eng = state.engagement[project.id];
  const playingThis = isCurrent(project.sourceNodeId);
  const dur = source?.media.find((m) => m.kind === "sound")?.duration ?? 60;

  // 0 = solo; 1–3 = stacking tiers
  const tiers = nodeCount >= 9 ? 3 : nodeCount >= 5 ? 2 : nodeCount >= 2 ? 1 : 0;
  // paddingBottom exposes the layer edges below the main card
  const pb = tiers === 3 ? 16 : tiers === 2 ? 11 : tiers === 1 ? 7 : 0;

  return (
    <motion.div
      className="relative"
      style={{ paddingBottom: pb }}
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >

      {/* Layer 3 — furthest back */}
      {tiers >= 3 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-3xl"
          style={{
            top: 12, bottom: 0,
            background: "var(--flow-blue)",
            opacity: 0.38,
            transform: "rotate(3deg) translateX(3px) scaleX(0.952)",
          }}
        />
      )}
      {/* Layer 2 — middle */}
      {tiers >= 2 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-3xl"
          style={{
            top: 7, bottom: 0,
            background: "var(--flow-blue)",
            opacity: 0.56,
            transform: "rotate(-2.5deg) translateX(-3px) scaleX(0.966)",
          }}
        />
      )}
      {/* Layer 1 — nearest */}
      {tiers >= 1 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-3xl"
          style={{
            top: 3, bottom: 0,
            background: "var(--flow-blue)",
            opacity: 0.74,
            transform: "rotate(1.8deg) translateX(2px) scaleX(0.978)",
          }}
        />
      )}

      {/* Main card */}
      <motion.article
        className="relative z-10 cursor-pointer overflow-hidden rounded-3xl"
        style={{ background: "var(--flow-blue)" }}
        role="button"
        tabIndex={0}
        aria-label={`查看 ${project.title}`}
        onClick={() => nav.push({ name: "detail", targetId: project.id })}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            nav.push({ name: "detail", targetId: project.id });
          }
        }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 430, damping: 34 }}
      >
        {/* Cover photo: inset with own rounded corners */}
        <div className="relative mx-2.5 mt-2.5 overflow-hidden rounded-[18px]">
          <ImageWithFallback
            src={project.cover}
            alt={project.title}
            className="h-[126px] w-full object-cover"
          />
          {/* Flow-type badge */}
          <span
            className="pointer-events-none absolute left-2.5 top-2.5 grid size-8 place-items-center rounded-xl"
            style={{ background: "var(--flow-blue)" }}
          >
            <FlowGlyph kind="flow" size={18} />
          </span>
          {/* Play button */}
          <button
            type="button"
            aria-label={playingThis ? "暂停" : "播放"}
            onClick={(e) => {
              e.stopPropagation();
              play({
                id: project.sourceNodeId,
                title: project.title,
                subtitle: owner?.name,
                cover: project.cover,
                duration: dur,
              });
            }}
            className="absolute bottom-2.5 right-2.5 grid size-10 place-items-center rounded-full active:scale-90"
            style={{ background: "rgba(255,255,255,0.92)" }}
          >
            {playingThis ? (
              <Pause size={16} color="var(--flow-blue)" fill="var(--flow-blue)" />
            ) : (
              <Play size={16} color="var(--flow-blue)" fill="var(--flow-blue)" />
            )}
          </button>
        </div>

        {/* Blue title + meta strip */}
        <div className="px-4 pb-3.5 pt-2.5">
          <h3 className="text-[17px] font-bold leading-snug text-white">{project.title}</h3>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div
              className="flex min-w-0 items-center gap-1.5 text-[12px]"
              style={{ color: "rgba(255,255,255,0.62)" }}
            >
              {owner && (
                <ImageWithFallback
                  src={owner.avatar}
                  alt={owner.name}
                  className="size-4 shrink-0 rounded-full object-cover"
                />
              )}
              <span className="truncate">{owner?.name}</span>
              {nodeCount > 1 && (
                <>
                  <span className="shrink-0">·</span>
                  <span className="shrink-0 whitespace-nowrap">{nodeCount} 个版本</span>
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                aria-label="查看创作流"
                onClick={(e) => {
                  e.stopPropagation();
                  nav.push({ name: "flowMap", flowId: project.id });
                }}
                className="flex items-center gap-1 text-[12px] font-medium"
                style={{ color: "rgba(255,255,255,0.80)" }}
              >
                <GitBranch size={13} />
                {nodeCount}
              </button>
              <button
                type="button"
                aria-pressed={!!eng?.liked}
                aria-label="点赞"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "toggleLike", id: project.id });
                }}
                className="flex items-center gap-1 text-[12px]"
                style={{ color: eng?.liked ? "var(--flow-yellow)" : "rgba(255,255,255,0.62)" }}
              >
                <Heart
                  size={13}
                  fill={eng?.liked ? "var(--flow-yellow)" : "none"}
                  stroke={eng?.liked ? "var(--flow-yellow)" : "currentColor"}
                />
                {fmtCount(project.likes + (eng?.liked ? 1 : 0))}
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

/** FragmentCard — compact row card for inspiration fragments. */
export function FragmentCard({ fragment }: { fragment: Fragment }) {
  const { state } = useFlowStore();
  const { play, isCurrent } = usePlayer();
  const nav = useNav();
  const author = state.users[fragment.authorId];
  const m = fragment.media;

  const goDetail = () => nav.push({ name: "detail", targetId: fragment.id });

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`查看${fragment.title}详情`}
      onClick={goDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goDetail();
        }
      }}
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative size-16 shrink-0 overflow-hidden rounded-xl"
        style={{ background: "var(--flow-warm)" }}
      >
        {m.kind === "pic" && m.src ? (
          <ImageWithFallback src={m.src} alt={fragment.title} className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center">
            <FlowIcon kind="fragment" size={30} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "var(--flow-warm)", color: "var(--flow-muted)" }}
        >
          灵感碎片
        </span>
        <h4 className="mt-1 truncate text-[14px] font-medium">{fragment.title}</h4>
        <p className="truncate text-[12px]" style={{ color: "var(--flow-muted)" }}>
          {author?.name}
          {m.kind === "text" && m.text ? ` · ${m.text}` : ""}
        </p>
      </div>
      {m.kind === "sound" && (
        <button
          type="button"
          aria-label={isCurrent(fragment.id) ? "暂停" : "播放"}
          onClick={(e) => {
            e.stopPropagation();
            play({
              id: fragment.id,
              title: fragment.title,
              subtitle: author?.name,
              duration: m.duration ?? 10,
            });
          }}
          className="grid size-9 shrink-0 place-items-center rounded-full active:scale-90"
          style={{ background: "var(--flow-warm)" }}
        >
          {isCurrent(fragment.id) ? (
            <Pause size={16} color="var(--flow-blue)" />
          ) : (
            <Play size={16} color="var(--flow-blue)" />
          )}
        </button>
      )}
    </motion.div>
  );
}
