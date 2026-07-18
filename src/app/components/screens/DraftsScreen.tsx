import { FolderOpen } from "@phosphor-icons/react";
import { useFlowStore } from "../../data/store";
import { TopBar } from "../TopBar";
import { DraftCard } from "../DraftCard";
import { EmptyState } from "../states/States";

export function DraftsScreen() {
  const { state } = useFlowStore();
  const drafts = Object.values(state.drafts).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-full flex-col">
      <TopBar title="草稿箱" />
      <div className="flex-1 space-y-3 overflow-y-auto p-5 pb-32">
        {drafts.length ? (
          drafts.map((d) => <DraftCard key={d.id} draft={d} />)
        ) : (
          <EmptyState icon={<FolderOpen size={34} weight="regular" aria-hidden="true" />} title="草稿箱是空的" hint="创作时会自动保存草稿" />
        )}
      </div>
    </div>
  );
}
