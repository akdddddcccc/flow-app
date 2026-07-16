import { Music, ImageIcon, Type, X, Puzzle } from "lucide-react";
import type { Media, Fragment } from "../data/types";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { fmtTime } from "../player";
import mondrianGroove from "../../assets/content/fragments/mondrian-groove.jpg";
import mondrianFragment from "../../assets/content/fragments/mondrian-fragment.jpg";
import yellowSongCover from "../../assets/content/covers/yellow-song-cover.jpg";
import cityLightsCover from "../../assets/content/covers/city-lights-cover.jpg";

const PIC_PRESETS = [
  mondrianGroove,
  mondrianFragment,
  yellowSongCover,
  cityLightsCover,
];

export function MediaPicker({
  media,
  onChange,
  fragmentRefs,
  onFragmentRefsChange,
  fragments,
}: {
  media: Media[];
  onChange: (m: Media[]) => void;
  fragmentRefs: string[];
  onFragmentRefsChange: (ids: string[]) => void;
  fragments: Fragment[];
}) {
  const addSound = () =>
    onChange([...media, { kind: "sound", duration: 60 + Math.floor(Math.random() * 120) }]);
  const addPic = () =>
    onChange([...media, { kind: "pic", src: PIC_PRESETS[media.filter((m) => m.kind === "pic").length % PIC_PRESETS.length] }]);
  const addText = () => onChange([...media, { kind: "text", text: "" }]);
  const removeAt = (i: number) => onChange(media.filter((_, idx) => idx !== i));
  const setText = (i: number, text: string) =>
    onChange(media.map((m, idx) => (idx === i ? { ...m, text } : m)));

  const toggleRef = (id: string) =>
    onFragmentRefsChange(
      fragmentRefs.includes(id) ? fragmentRefs.filter((x) => x !== id) : [...fragmentRefs, id],
    );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <PickBtn icon={<Music size={16} />} label="音频（模拟）" onClick={addSound} />
        <PickBtn icon={<ImageIcon size={16} />} label="图片" onClick={addPic} />
        <PickBtn icon={<Type size={16} />} label="文字" onClick={addText} />
      </div>

      {media.length > 0 && (
        <div className="space-y-2">
          {media.map((m, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl p-2.5" style={{ background: "var(--flow-warm)" }}>
              {m.kind === "pic" && m.src ? (
                <ImageWithFallback src={m.src} alt="附件图片" className="size-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="grid size-12 shrink-0 place-items-center rounded-lg text-white" style={{ background: "var(--flow-blue)" }}>
                  {m.kind === "sound" ? <Music size={18} /> : <Type size={18} />}
                </span>
              )}
              <div className="min-w-0 flex-1">
                {m.kind === "text" ? (
                  <textarea
                    value={m.text ?? ""}
                    onChange={(e) => setText(i, e.target.value)}
                    placeholder="写点什么……"
                    rows={2}
                    className="w-full resize-none rounded-lg bg-white p-2 text-[13px] outline-none"
                  />
                ) : m.kind === "sound" ? (
                  <p className="text-[13px] font-medium">音频片段 · {fmtTime(m.duration ?? 0)}</p>
                ) : (
                  <p className="text-[13px] font-medium">图片附件</p>
                )}
              </div>
              <button type="button" onClick={() => removeAt(i)} aria-label="移除" className="grid size-8 shrink-0 place-items-center rounded-full bg-white">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {fragments.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "var(--flow-muted)" }}>
            <Puzzle size={13} /> 引用灵感碎片（虚线连接）
          </p>
          <div className="flex flex-wrap gap-2">
            {fragments.map((f) => {
              const on = fragmentRefs.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleRef(f.id)}
                  aria-pressed={on}
                  className="rounded-full border px-3 py-1.5 text-[12px] transition-colors"
                  style={on
                    ? { borderColor: "var(--flow-blue)", color: "var(--flow-blue)", borderStyle: "dashed" }
                    : { borderColor: "var(--flow-gray)", color: "var(--flow-muted)", borderStyle: "dashed" }}
                >
                  {f.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PickBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-dashed py-3 text-[11px]"
      style={{ borderColor: "var(--flow-gray)", color: "var(--flow-muted)" }}
    >
      <span style={{ color: "var(--flow-blue)" }}>{icon}</span>
      {label}
    </button>
  );
}
