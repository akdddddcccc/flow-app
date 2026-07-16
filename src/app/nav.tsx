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

export type NavMotion = {
  direction: -1 | 0 | 1;
  kind: "push" | "back" | "replace" | "tab";
  sequence: number;
};

interface NavValue {
  stack: Screen[];
  current: Screen;
  push: (s: Screen) => void;
  replace: (s: Screen) => void;
  back: () => void;
  resetTo: (s: Screen) => void;
  canBack: boolean;
  motion: NavMotion;
}

const NavContext = createContext<NavValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Screen[]>([{ name: "home" }]);
  const [motion, setMotion] = useState<NavMotion>({
    direction: 0,
    kind: "tab",
    sequence: 0,
  });

  const announceMotion = useCallback(
    (direction: NavMotion["direction"], kind: NavMotion["kind"]) => {
      setMotion((current) => ({
        direction,
        kind,
        sequence: current.sequence + 1,
      }));
    },
    [],
  );

  const push = useCallback((s: Screen) => {
    announceMotion(1, "push");
    setStack((st) => [...st, s]);
  }, [announceMotion]);
  const replace = useCallback(
    (s: Screen) => {
      announceMotion(1, "replace");
      setStack((st) => [...st.slice(0, -1), s]);
    },
    [announceMotion],
  );
  const back = useCallback(
    () => {
      announceMotion(-1, "back");
      setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));
    },
    [announceMotion],
  );
  // 切底部 Tab：重置栈到该根屏
  const resetTo = useCallback((s: Screen) => {
    const tabOrder: Record<string, number> = { home: 0, discover: 1, profile: 3 };
    const from = tabOrder[stack[0]?.name] ?? 0;
    const to = tabOrder[s.name] ?? from;
    const direction: NavMotion["direction"] = to === from ? 0 : to > from ? 1 : -1;
    announceMotion(direction, "tab");
    setStack([s]);
  }, [announceMotion, stack]);

  const value = useMemo<NavValue>(
    () => ({
      stack,
      current: stack[stack.length - 1],
      push,
      replace,
      back,
      resetTo,
      canBack: stack.length > 1,
      motion,
    }),
    [stack, push, replace, back, resetTo, motion],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
