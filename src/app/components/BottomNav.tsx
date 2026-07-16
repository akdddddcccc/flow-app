import { motion } from "motion/react";
import { TrendingUp, type LucideIcon } from "lucide-react";
import { useNav, type Screen } from "../nav";
import discoverIcon from "../../assets/figma-bottom-nav/discover-icon.svg";
import createButton from "../../assets/figma-bottom-nav/create-button.svg";
import profileIcon from "../../assets/figma-bottom-nav/profile-icon.svg";

type TabDef = {
  name: "home" | "discover" | "profile";
  label: string;
  icon?: string;
  Icon?: LucideIcon;
  center: string;
  nodeId: string;
};

/**
 * 直接对应 Figma `test_function` 节点 582:168。
 * 这里刻意不是四等分居中：原稿对三个普通 Tab 做了 8px 的光学校正，
 * 发布按钮固定在 62.5% 位置，并使用原始 141×123 矢量资产。
 */
const TABS: TabDef[] = [
  { name: "home", label: "热流", Icon: TrendingUp, center: "14.360465%", nodeId: "582:169" },
  { name: "discover", label: "发现", icon: discoverIcon, center: "39.360465%", nodeId: "582:175" },
  { name: "profile", label: "我的", icon: profileIcon, center: "85.639535%", nodeId: "582:185" },
];

export function BottomNav() {
  const nav = useNav();
  const rootName = nav.stack[0]?.name;

  return (
    <nav
      className="relative z-20 shrink-0 overflow-visible border-t border-black/5 bg-white/95 backdrop-blur"
      style={{ height: 63 }}
      data-node-id="582:168"
    >
      <TabBtn tab={TABS[0]} active={rootName === "home"} />
      <TabBtn tab={TABS[1]} active={rootName === "discover"} />

      <motion.button
        type="button"
        onClick={() => nav.push({ name: "createEntry" })}
        aria-label="创作"
        className="absolute top-[-1px] h-16 w-[117px] -translate-x-1/2 overflow-visible"
        style={{ left: "62.5%" }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        data-node-id="582:181"
      >
        <img
          src={createButton}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-5px] h-[123px] w-[141px] max-w-none -translate-x-1/2"
        />
      </motion.button>

      <TabBtn tab={TABS[2]} active={rootName === "profile"} />
    </nav>
  );
}

function TabBtn({ tab, active }: { tab: TabDef; active: boolean }) {
  const nav = useNav();

  return (
    <motion.button
      type="button"
      onClick={() => nav.resetTo({ name: tab.name } as Screen)}
      aria-current={active ? "page" : undefined}
      className="absolute top-[6.5px] flex h-[47px] w-16 -translate-x-1/2 flex-col items-center gap-0.5 py-1 text-[10px]"
      style={{
        left: tab.center,
        color: active ? "var(--flow-blue)" : "var(--flow-muted)",
      }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 520, damping: 32 }}
      data-node-id={tab.nodeId}
    >
      {tab.Icon ? (
        <tab.Icon size={22} strokeWidth={2.35} aria-hidden="true" />
      ) : (
        <img
          src={tab.icon}
          alt=""
          aria-hidden="true"
          className="size-[22px] shrink-0"
          style={{
            filter: active
              ? "brightness(0) saturate(100%) invert(30%) sepia(99%) saturate(4100%) hue-rotate(229deg) brightness(91%) contrast(107%)"
              : "none",
          }}
        />
      )}
      <span className="font-medium leading-[15px]">{tab.label}</span>
    </motion.button>
  );
}
