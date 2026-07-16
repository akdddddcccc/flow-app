import type { Comment } from "../data/types";
import { useFlowStore } from "../data/store";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { fmtRelative } from "../util";

export function CommentItem({ comment }: { comment: Comment }) {
  const { state } = useFlowStore();
  const author = state.users[comment.authorId];
  return (
    <div className="flex gap-3">
      {author && <ImageWithFallback src={author.avatar} alt={author.name} className="size-8 shrink-0 rounded-full object-cover" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium">{author?.name}</span>
          <span className="text-[11px]" style={{ color: "var(--flow-muted)" }}>{fmtRelative(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 text-[13px]">{comment.text}</p>
      </div>
    </div>
  );
}
