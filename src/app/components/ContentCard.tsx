import { useEffect, useState } from "react";
import { Play, Pause, Heart, GitBranch } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { FlowCardTone, FlowProject, Fragment } from "../data/types";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { FlowGlyph, FlowIcon } from "./icons/FlowIcon";
import { usePlayer } from "../player";
import { useFlowStore } from "../data/store";
import { useNav } from "../nav";
import { fmtCount } from "../util";

const CARD_TONES: Record<FlowCardTone, {
  surface: string;
  ink: string;
  meta: string;
  badge: string;
  badgeGlyph: string;
  button: string;
  buttonInk: string;
  border: string;
  shadow: string;
}> = {
  blue: {
    surface: "#2948ee",
    ink: "#ffffff",
    meta: "rgba(255,255,255,0.66)",
    badge: "rgba(35,62,211,0.92)",
    badgeGlyph: "#ffffff",
    button: "rgba(255,255,255,0.94)",
    buttonInk: "#2948ee",
    border: "rgba(255,255,255,0.08)",
    shadow: "0 4px 12px rgba(41,72,238,0.1)",
  },
  mist: {
    surface: "#dfe2e7",
    ink: "#111318",
    meta: "rgba(17,19,24,0.56)",
    badge: "rgba(17,19,24,0.82)",
    badgeGlyph: "#ffffff",
    button: "rgba(17,19,24,0.88)",
    buttonInk: "#ffffff",
    border: "rgba(17,19,24,0.08)",
    shadow: "0 4px 12px rgba(47,54,67,0.08)",
  },
  graphite: {
    surface: "#17191e",
    ink: "#ffffff",
    meta: "rgba(255,255,255,0.58)",
    badge: "rgba(7,8,10,0.76)",
    badgeGlyph: "#ffffff",
    button: "rgba(255,255,255,0.92)",
    buttonInk: "#17191e",
    border: "rgba(255,255,255,0.08)",
    shadow: "0 4px 12px rgba(8,10,14,0.11)",
  },
};

const STACK_LAYERS = [
  {
    top: -16,
    inset: 10,
    rotate: 7,
    x: 14,
    scaleX: 0.97,
    opacity: 0.2,
    blur: 3.5,
    duration: 9.6,
    driftX: 3,
    driftY: 3,
  },
  {
    top: -10,
    inset: 6,
    rotate: -5.5,
    x: -12,
    scaleX: 0.978,
    opacity: 0.32,
    blur: 2.3,
    duration: 8.4,
    driftX: -3,
    driftY: 2,
  },
  {
    top: -5,
    inset: 3,
    rotate: 4,
    x: 8,
    scaleX: 0.986,
    opacity: 0.46,
    blur: 1.4,
    duration: 7.4,
    driftX: 2,
    driftY: 1.5,
  },
  {
    top: 0,
    inset: 1,
    rotate: -2.8,
    x: -4,
    scaleX: 0.995,
    opacity: 0.64,
    blur: 0.6,
    duration: 6.4,
    driftX: -1.5,
    driftY: 1,
  },
] as const;

function useImageTone(src: string, preferred?: FlowCardTone) {
  const [tone, setTone] = useState<FlowCardTone>(preferred ?? "graphite");

  useEffect(() => {
    if (preferred) {
      setTone(preferred);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 20;
      canvas.height = 20;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0, 20, 20);

      try {
        const pixels = context.getImageData(0, 0, 20, 20).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        let count = 0;
        for (let index = 0; index < pixels.length; index += 16) {
          if (pixels[index + 3] < 96) continue;
          red += pixels[index];
          green += pixels[index + 1];
          blue += pixels[index + 2];
          count += 1;
        }
        if (!count) return;
        red /= count;
        green /= count;
        blue /= count;
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;

        if (blue > red + 12 && blue > green + 5 && saturation > 0.2) setTone("blue");
        else if (luminance > 168 && saturation < 0.32) setTone("mist");
        else setTone("graphite");
      } catch {
        setTone("graphite");
      }
    };
    image.src = src;
    return () => {
      image.onload = null;
    };
  }, [preferred, src]);

  return CARD_TONES[tone];
}

/**
 * ProjectCard — 节点越多，卡片越像一组正在生长的半透明内容切片。
 * 层叠层只使用选定的单色，不复制封面；主表面收敛到蓝 / 冷灰 / 石墨黑三档。
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
  const reduceMotion = useReducedMotion();
  const tone = useImageTone(project.cover, project.visualTone);

  // 子节点越多，露出的洋葱皮片层越多：2 / 3 / 4 层。
  const layerCount = nodeCount >= 9 ? 4 : nodeCount >= 5 ? 3 : nodeCount >= 2 ? 2 : 0;
  const visibleLayers = STACK_LAYERS.slice(STACK_LAYERS.length - layerCount);
  const pb = layerCount * 10;

  return (
    <motion.div
      className="relative"
      style={{ paddingBottom: pb }}
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      {visibleLayers.map((layer, index) => (
        <motion.div
          key={`${project.id}-onion-${index}`}
          aria-hidden
          className="pointer-events-none absolute rounded-[28px]"
          style={{
            top: layer.top,
            bottom: index * 10,
            left: layer.inset,
            right: layer.inset,
            backgroundColor: tone.surface,
            filter: `blur(${layer.blur}px)`,
            opacity: layer.opacity,
            transformOrigin: "center center",
          }}
          initial={{ rotate: layer.rotate, x: layer.x, scaleX: layer.scaleX }}
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: [layer.rotate, layer.rotate * 0.72, layer.rotate],
                  x: [layer.x, layer.x + layer.driftX, layer.x],
                  y: [0, layer.driftY, 0],
                }
          }
          transition={{ duration: layer.duration, ease: "easeInOut", repeat: Infinity }}
        />
      ))}

      {/* Main card */}
      <motion.article
        className="relative z-10 cursor-pointer overflow-hidden rounded-3xl"
        style={{
          background: tone.surface,
          color: tone.ink,
          border: `1px solid ${tone.border}`,
          boxShadow: tone.shadow,
        }}
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
            style={{ background: tone.badge }}
          >
            <FlowGlyph kind="flow" size={18} color={tone.badgeGlyph} />
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
            style={{ background: tone.button }}
          >
            {playingThis ? (
              <Pause size={16} color={tone.buttonInk} fill={tone.buttonInk} />
            ) : (
              <Play size={16} color={tone.buttonInk} fill={tone.buttonInk} />
            )}
          </button>
        </div>

        {/* Blue title + meta strip */}
        <div className="px-4 pb-3.5 pt-2.5">
          <h3 className="text-[17px] font-bold leading-snug" style={{ color: tone.ink }}>{project.title}</h3>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div
              className="flex min-w-0 items-center gap-1.5 text-[12px]"
              style={{ color: tone.meta }}
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
                style={{ color: tone.ink, opacity: 0.78 }}
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
                style={{ color: eng?.liked ? "var(--flow-yellow)" : tone.meta }}
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
