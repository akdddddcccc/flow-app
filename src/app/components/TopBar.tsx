import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNav } from "../nav";
import { FlowLogo } from "./FlowLogo";

export function TopBar({
  title,
  right,
  logo = false,
}: {
  title?: string;
  right?: ReactNode;
  logo?: boolean;
}) {
  const nav = useNav();
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-black/5 bg-white/95 px-3 backdrop-blur">
      {nav.canBack ? (
        <button type="button" onClick={nav.back} aria-label="返回" className="grid size-10 place-items-center rounded-full">
          <ChevronLeft size={24} />
        </button>
      ) : (
        <div className="w-2" />
      )}
      <div className="min-w-0 flex-1">
        {logo ? <FlowLogo /> : <h1 className="truncate text-[16px] font-semibold">{title}</h1>}
      </div>
      {right}
    </header>
  );
}
