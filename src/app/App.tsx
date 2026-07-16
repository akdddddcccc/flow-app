import { useEffect } from "react";
import { Toaster } from "sonner";
import { FlowStoreProvider } from "./data/store";
import { NavProvider, useNav } from "./nav";
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

function CurrentScreen() {
  const { current } = useNav();
  switch (current.name) {
    case "home": return <HomeScreen />;
    case "discover": return <DiscoverScreen />;
    case "profile": return <ProfileScreen />;
    case "drafts": return <DraftsScreen />;
    case "createEntry": return <CreateEntryScreen />;
    case "detail": return <DetailScreen targetId={current.targetId} />;
    case "flowMap": return <FlowMapScreen flowId={current.flowId} focusNodeId={current.focusNodeId} />;
    case "continueFlow": return <ContinueFlowScreen flowId={current.flowId} parentNodeId={current.parentNodeId} draftId={current.draftId} />;
    default: return <HomeScreen />;
  }
}

function Shell() {
  const { current } = useNav();
  // 全屏沉浸式屏幕（自带顶部返回栏）隐藏底部 Tab
  const immersive = current.name === "continueFlow" || current.name === "flowMap" || current.name === "detail";

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <CurrentScreen />
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
    </FlowStoreProvider>
  );
}
