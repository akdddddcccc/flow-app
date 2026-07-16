// 轻量内部导航栈（避免 Figma 预览 iframe 的 URL 冲突，不用 react-router）。
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Screen =
  | { name: "home" }
  | { name: "discover" }
  | { name: "profile" }
  | { name: "drafts" }
  | { name: "createEntry" }
  | { name: "detail"; targetId: string } // flowId 或 fragmentId
  | { name: "flowMap"; flowId: string; focusNodeId?: string }
  | { name: "continueFlow"; flowId: string; parentNodeId: string; draftId?: string };

export type TabName = "home" | "discover" | "profile";

interface NavValue {
  stack: Screen[];
  current: Screen;
  push: (s: Screen) => void;
  replace: (s: Screen) => void;
  back: () => void;
  resetTo: (s: Screen) => void;
  canBack: boolean;
}

const NavContext = createContext<NavValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Screen[]>([{ name: "home" }]);

  const push = useCallback((s: Screen) => setStack((st) => [...st, s]), []);
  const replace = useCallback(
    (s: Screen) => setStack((st) => [...st.slice(0, -1), s]),
    [],
  );
  const back = useCallback(
    () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    [],
  );
  // 切底部 Tab：重置栈到该根屏
  const resetTo = useCallback((s: Screen) => setStack([s]), []);

  const value = useMemo<NavValue>(
    () => ({
      stack,
      current: stack[stack.length - 1],
      push,
      replace,
      back,
      resetTo,
      canBack: stack.length > 1,
    }),
    [stack, push, replace, back, resetTo],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
