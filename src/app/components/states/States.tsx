import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center px-8 py-16 text-center">
      {icon && <div className="mb-3 opacity-60">{icon}</div>}
      <p className="text-[15px] font-medium">{title}</p>
      {hint && <p className="mt-1 text-[13px]" style={{ color: "var(--flow-muted)" }}>{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="grid place-items-center px-8 py-16 text-center">
      <p className="text-[15px] font-medium" style={{ color: "var(--flow-red)" }}>出了点问题</p>
      <p className="mt-1 text-[13px]" style={{ color: "var(--flow-muted)" }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full px-4 py-2 text-[13px] font-medium text-white"
          style={{ background: "var(--flow-blue)" }}
        >
          重试
        </button>
      )}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
      <div className="h-40 w-full animate-pulse" style={{ background: "var(--flow-gray)" }} />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded-full" style={{ background: "var(--flow-gray)" }} />
        <div className="h-3 w-1/3 animate-pulse rounded-full" style={{ background: "var(--flow-gray)" }} />
      </div>
    </div>
  );
}
