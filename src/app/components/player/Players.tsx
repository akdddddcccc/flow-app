import { useState } from "react";
import { Play, Pause, X, SkipBack, SkipForward } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePlayer, fmtTime } from "../../player";
import { ImageWithFallback } from "../figma/ImageWithFallback";

/** 固定在 BottomNav 之上的迷你播放器，切页不中断。 */
export function MiniPlayer() {
  const { track, playing, progress, toggle } = usePlayer();
  const [open, setOpen] = useState(false);
  const pct = track?.duration ? (progress / track.duration) * 100 : 0;

  return (
    <>
      <AnimatePresence initial={false}>
        {track && (
          <motion.div
            className="border-t border-black/5 bg-white/95 px-3 backdrop-blur"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-0.5 w-full overflow-hidden rounded-full" style={{ background: "var(--flow-gray)" }}>
              <motion.div
                className="absolute inset-y-0 left-0"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.24, ease: "linear" }}
                style={{ background: "var(--flow-blue)" }}
              />
            </div>
            <div className="flex items-center gap-3 py-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-label="打开播放器"
              >
                <div className="size-9 shrink-0 overflow-hidden rounded-lg" style={{ background: "var(--flow-gray)" }}>
                  {track.cover && <ImageWithFallback src={track.cover} alt={track.title} className="size-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{track.title}</p>
                  {track.subtitle && <p className="truncate text-[11px]" style={{ color: "var(--flow-muted)" }}>{track.subtitle}</p>}
                </div>
              </button>
              <motion.button
                type="button"
                onClick={() => toggle()}
                aria-label={playing ? "暂停" : "播放"}
                className="grid size-9 place-items-center rounded-full text-white"
                style={{ background: "var(--flow-blue)" }}
                whileTap={{ scale: 0.88 }}
              >
                {playing ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && track && <FullPlayer onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function FullPlayer({ onClose }: { onClose: () => void }) {
  const { track, playing, progress, toggle, seek } = usePlayer();
  if (!track) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full max-w-[440px] rounded-t-3xl bg-white p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.9 }}
      >
        <div className="flex justify-end">
          <button type="button" onClick={onClose} aria-label="关闭" className="grid size-9 place-items-center rounded-full" style={{ background: "var(--flow-warm)" }}>
            <X size={18} />
          </button>
        </div>
        <div className="mx-auto mt-2 aspect-square w-56 overflow-hidden rounded-3xl" style={{ background: "var(--flow-gray)" }}>
          {track.cover && <ImageWithFallback src={track.cover} alt={track.title} className="size-full object-cover" />}
        </div>
        <div className="mt-5 text-center">
          <h3 className="text-[18px] font-semibold">{track.title}</h3>
          {track.subtitle && <p className="mt-0.5 text-[13px]" style={{ color: "var(--flow-muted)" }}>{track.subtitle}</p>}
        </div>
        <input
          type="range"
          min={0}
          max={track.duration}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          className="mt-5 w-full accent-[var(--flow-blue)]"
          aria-label="播放进度"
        />
        <div className="flex justify-between text-[11px]" style={{ color: "var(--flow-muted)" }}>
          <span>{fmtTime(progress)}</span>
          <span>{fmtTime(track.duration)}</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-8">
          <button type="button" onClick={() => seek(Math.max(0, progress - 10))} aria-label="后退 10 秒"><SkipBack size={26} /></button>
          <button
            type="button"
            onClick={() => toggle()}
            aria-label={playing ? "暂停" : "播放"}
            className="grid size-16 place-items-center rounded-full text-white"
            style={{ background: "var(--flow-blue)" }}
          >
            {playing ? <Pause size={26} fill="white" /> : <Play size={26} fill="white" />}
          </button>
          <button type="button" onClick={() => seek(Math.min(track.duration, progress + 10))} aria-label="前进 10 秒"><SkipForward size={26} /></button>
        </div>
      </motion.div>
    </motion.div>
  );
}
