import { Home, Compass, Plus, User } from "lucide-react";
import { useNav, type Screen } from "../nav";

type TabDef = { name: "home" | "discover" | "profile"; label: string; icon: typeof Home };

const TABS_LEFT: TabDef[] = [
  { name: "home", label: "首页", icon: Home },
  { name: "discover", label: "发现", icon: Compass },
];

/**
 * 原稿中的液态发布按钮：上方是圆角水滴头，下方通过两侧凹曲线
 * 与导航栏底边连成一个整体。
 */
const DROP_PATH =
  "M 28 0 H 68 C 76 0 82 6 82 14 V 39 C 82 57 88 68 96 72 H 0 C 8 68 14 57 14 39 V 14 C 14 6 20 0 28 0 Z";

export function BottomNav() {
  const nav = useNav();
  const rootName = nav.stack[0]?.name;

  return (
    <nav
      className="border-t border-black/5 bg-white/95 backdrop-blur"
      style={{ height: 72 }}
    >
      {/* Three-column grid: [left tabs | 96px center | right tab] */}
      <div className="grid h-full" style={{ gridTemplateColumns: "1fr 96px 1fr" }}>

        {/* Left: home + discover */}
        <div className="flex items-center justify-around">
          {TABS_LEFT.map((t) => (
            <TabBtn key={t.name} tab={t} active={rootName === t.name} />
          ))}
        </div>

        {/* Center: water-drop publish button fills full column height */}
        <div className="relative flex items-stretch">
          <button
            type="button"
            onClick={() => nav.push({ name: "createEntry" })}
            aria-label="创作"
            className="relative flex w-full flex-col items-center justify-center pb-1 text-white active:scale-95"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <svg
              viewBox="0 0 96 72"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d={DROP_PATH} fill="var(--flow-blue)" />
            </svg>
            <Plus size={27} strokeWidth={1.8} className="relative z-10" />
          </button>
        </div>

        {/* Right: profile */}
        <div className="flex items-center justify-center">
          <TabBtn
            tab={{ name: "profile", label: "我的", icon: User }}
            active={rootName === "profile"}
          />
        </div>
      </div>
    </nav>
  );
}

function TabBtn({ tab, active }: { tab: TabDef; active: boolean }) {
  const nav = useNav();
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={() => nav.resetTo({ name: tab.name } as Screen)}
      aria-current={active ? "page" : undefined}
      className="flex flex-col items-center gap-0.5 px-4 py-2 text-[10px]"
      style={{ color: active ? "var(--flow-blue)" : "var(--flow-muted)" }}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
      {tab.label}
    </button>
  );
}
