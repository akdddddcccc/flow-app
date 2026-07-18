import { useEffect } from "react";
import { Toaster } from "sonner";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { FlowStoreProvider } from "./data/store";
import { NavProvider, useNav, type Screen } from "./nav";
import { PlayerProvider } from "./player";
import { BottomNav } from "./components/BottomNav";
import { MiniPlayer } from "./components/player/Players";
import { HomeScreen } from "./components/screens/HomeScreen";
import { DiscoverScreen } from "./components/screens/DiscoverScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { DraftsScreen } from "./components/screens/DraftsScreen";
import { CreateEntryScreen } from "./components/screens/CreateEntryScreen";
import { DetailScreen } from "./components/screens/DetailScreen";
import { FlowMapScreen } from "./components/screens/FlowMapScreen";
import { ContinueFlowScreen } from "./components/screens/ContinueFlowScreen";
import { flowMotion } from "./motion";

function CurrentScreen({ screen }: { screen: Screen }) {
  switch (screen.name) {
    case "home": return <HomeScreen />;
    case "discover": return <DiscoverScreen />;
    case "profile": return <ProfileScreen />;
    case "drafts": return <DraftsScreen />;
    case "createEntry": return <CreateEntryScreen />;
    case "detail": return <DetailScreen targetId={screen.targetId} />;
    case "flowMap": return <FlowMapScreen flowId={screen.flowId} focusNodeId={screen.focusNodeId} />;
    case "continueFlow": return <ContinueFlowScreen flowId={screen.flowId} parentNodeId={screen.parentNodeId} draftId={screen.draftId} />;
    default: return <HomeScreen />;
  }
}

function screenIdentity(screen: Screen) {
  switch (screen.name) {
    case "detail": return `detail-${screen.targetId}`;
    case "flowMap": return `flow-${screen.flowId}-${screen.focusNodeId ?? "root"}`;
    case "continueFlow": return `continue-${screen.flowId}-${screen.parentNodeId}-${screen.draftId ?? "new"}`;
    default: return screen.name;
  }
}

const screenVariants = {
  enter: ({ direction, kind }: { direction: number; kind: string }) => ({
    opacity: 0,
    x: kind === "tab" ? direction * 8 : direction * 20,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: ({ direction, kind }: { direction: number; kind: string }) => ({
    opacity: 0,
    x: kind === "tab" ? direction * -6 : direction * -18,
  }),
};

function Shell() {
  const { current, motion: navMotion } = useNav();
  const reduceMotion = useReducedMotion();
  // 全屏沉浸式屏幕（自带顶部返回栏）隐藏底部 Tab
  const immersive = current.name === "continueFlow" || current.name === "flowMap" || current.name === "detail";

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} mode="sync" custom={navMotion}>
          <motion.div
            key={`${screenIdentity(current)}-${navMotion.sequence}`}
            className="absolute inset-0"
            data-screen-transition={screenIdentity(current)}
            custom={navMotion}
            variants={reduceMotion ? undefined : screenVariants}
            initial={reduceMotion ? false : "enter"}
            animate={reduceMotion ? undefined : "center"}
            exit={reduceMotion ? undefined : "exit"}
            transition={navMotion.kind === "tab" ? flowMotion.local : flowMotion.screen}
          >
            <CurrentScreen screen={current} />
          </motion.div>
        </AnimatePresence>
      </div>
      <MiniPlayer />
      {!immersive && <BottomNav />}
    </div>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isPortfolioEmbed =
    params.get("embed") === "portfolio" || params.get("mode") === "portfolio";

  useEffect(() => {
    if (!isPortfolioEmbed || window.parent === window) return;
    window.parent.postMessage({ type: "flow-app:ready", version: 1 }, "*");
  }, [isPortfolioEmbed]);

  return (
    <FlowStoreProvider>
      <MotionConfig reducedMotion="user">
        <PlayerProvider>
          <NavProvider>
            <div
              className="flow-stage flex w-full items-center justify-center"
              data-embed={isPortfolioEmbed ? "portfolio" : "standalone"}
            >
              <div
                className="flow-app-shell relative flex w-full max-w-[430px] flex-col overflow-hidden bg-white font-sans text-black"
              >
                <Shell />
              </div>
              <Toaster position="top-center" richColors />
            </div>
          </NavProvider>
        </PlayerProvider>
      </MotionConfig>
    </FlowStoreProvider>
  );
}
