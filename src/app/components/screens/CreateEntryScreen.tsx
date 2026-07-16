import { useState } from "react";
import { FileStack, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useFlowStore } from "../../data/store";
import { ROLE_LIST, LICENSE_LABEL, type Media, type Role, type License } from "../../data/types";
import { useNav } from "../../nav";
import { TopBar } from "../TopBar";
import { FlowIcon } from "../icons/FlowIcon";
import { RoleChip } from "../chips/Chips";
import { MediaPicker } from "../MediaPicker";

type Mode = "menu" | "fragment" | "source";

export function CreateEntryScreen() {
  const [mode, setMode] = useState<Mode>("menu");
  if (mode === "fragment") return <FragmentForm onBack={() => setMode("menu")} />;
  if (mode === "source") return <SourceForm onBack={() => setMode("menu")} />;
  return <Menu onPick={setMode} />;
}

function Menu({ onPick }: { onPick: (m: Mode) => void }) {
  const nav = useNav();
  const { state } = useFlowStore();
  const draftCount = Object.keys(state.drafts).length;
  return (
    <div className="flex h-full flex-col">
      <TopBar title="开始创作" />
      <div className="flex-1 space-y-3 p-5">
        <EntryBtn icon={<FlowIcon kind="fragment" size={44} />} title="发布灵感碎片" desc="一段旋律、一句词、一张图——尚未成形的想法" onClick={() => onPick("fragment")} />
        <EntryBtn icon={<FlowIcon kind="source" size={44} />} title="发布一个源" desc="有音乐性的起点，开放给他人续流成树" onClick={() => onPick("source")} />
        <EntryBtn icon={<span className="grid size-11 place-items-center rounded-xl" style={{ background: "var(--flow-warm)" }}><FileStack size={22} color="var(--flow-blue)" /></span>} title={`继续草稿${draftCount ? ` · ${draftCount}` : ""}`} desc="回到未完成的创作" onClick={() => nav.replace({ name: "drafts" })} />
      </div>
    </div>
  );
}

function EntryBtn({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="text-[12px]" style={{ color: "var(--flow-muted)" }}>{desc}</p>
      </div>
      <ChevronRight size={20} color="var(--flow-muted)" />
    </button>
  );
}

function FragmentForm({ onBack }: { onBack: () => void }) {
  const { dispatch } = useFlowStore();
  const nav = useNav();
  const [title, setTitle] = useState("");
  const [media, setMedia] = useState<Media[]>([]);

  const publish = () => {
    if (!title.trim() || media.length === 0) {
      toast.error("请填写标题并添加一段内容");
      return;
    }
    dispatch({ type: "publishFragment", title, media: media[0] });
    toast.success("灵感碎片已发布");
    nav.resetTo({ name: "home" });
  };

  return (
    <FormShell title="发布灵感碎片" onBack={onBack} onPublish={publish}>
      <Field label="标题">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="给灵感起个名字" className="w-full rounded-2xl border px-4 py-3 text-[14px] outline-none" style={{ borderColor: "var(--flow-gray)" }} />
      </Field>
      <Field label="内容" hint="选择一种媒介：音频 / 图片 / 文字">
        <MediaPicker media={media} onChange={setMedia} fragmentRefs={[]} onFragmentRefsChange={() => {}} fragments={[]} />
      </Field>
    </FormShell>
  );
}

function SourceForm({ onBack }: { onBack: () => void }) {
  const { dispatch, state } = useFlowStore();
  const nav = useNav();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [changeNote, setChangeNote] = useState("");
  const [license, setLicense] = useState<License>("attribution");
  const [fragmentRefs, setFragmentRefs] = useState<string[]>([]);

  const publish = () => {
    if (!title.trim() || !media.some((m) => m.kind === "sound")) {
      toast.error("请填写标题并至少添加一段音频（模拟）");
      return;
    }
    dispatch({
      type: "publishSource",
      title,
      description,
      cover: `https://picsum.photos/seed/${encodeURIComponent(title || "new-source")}/900/540`,
      license,
      roles,
      changeNote: changeNote || description,
      media,
      fragmentRefs,
    });
    toast.success("源已发布，快邀请大家来续流吧");
    nav.resetTo({ name: "home" });
  };

  const toggleRole = (r: Role) => setRoles((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]));

  return (
    <FormShell title="发布一个源" onBack={onBack} onPublish={publish}>
      <Field label="标题"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="源的名字" className="w-full rounded-2xl border px-4 py-3 text-[14px] outline-none" style={{ borderColor: "var(--flow-gray)" }} /></Field>
      <Field label="简介"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="介绍这个源，以及你希望它长成什么样" className="w-full resize-none rounded-2xl border px-4 py-3 text-[14px] outline-none" style={{ borderColor: "var(--flow-gray)" }} /></Field>
      <Field label="我的角色"><div className="flex flex-wrap gap-2">{ROLE_LIST.map((r) => <RoleChip key={r} role={r} selected={roles.includes(r)} onClick={() => toggleRole(r)} />)}</div></Field>
      <Field label="内容" hint="至少一段音频（模拟）"><MediaPicker media={media} onChange={setMedia} fragmentRefs={fragmentRefs} onFragmentRefsChange={setFragmentRefs} fragments={Object.values(state.fragments)} /></Field>
      <Field label="授权（必选）" hint="决定他人能否续作">
        <div className="space-y-2">
          {(Object.keys(LICENSE_LABEL) as License[]).map((l) => (
            <button key={l} type="button" onClick={() => setLicense(l)} aria-pressed={license === l} className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-[13px]" style={{ borderColor: license === l ? "var(--flow-blue)" : "var(--flow-gray)" }}>
              <span className="grid size-5 place-items-center rounded-full border-2" style={{ borderColor: license === l ? "var(--flow-blue)" : "var(--flow-gray)" }}>
                {license === l && <span className="size-2.5 rounded-full" style={{ background: "var(--flow-blue)" }} />}
              </span>
              {LICENSE_LABEL[l]}
            </button>
          ))}
        </div>
      </Field>
    </FormShell>
  );
}

function FormShell({ title, onBack, onPublish, children }: { title: string; onBack: () => void; onPublish: () => void; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title={title} right={<button type="button" onClick={onBack} className="rounded-full px-3 py-1.5 text-[13px]" style={{ background: "var(--flow-warm)" }}>返回</button>} />
      <div className="flex-1 space-y-5 overflow-y-auto p-5">{children}</div>
      <div className="shrink-0 border-t border-black/5 bg-white p-4">
        <button type="button" onClick={onPublish} className="w-full rounded-full py-3.5 text-[15px] font-semibold text-white" style={{ background: "var(--flow-blue)" }}>发布</button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-[14px] font-semibold">{label}</h3>
      {hint && <p className="mb-2 text-[12px]" style={{ color: "var(--flow-muted)" }}>{hint}</p>}
      {children}
    </div>
  );
}
