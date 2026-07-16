import type { Role } from "../../data/types";

export function RoleChip({
  role,
  selected,
  onClick,
  size = "md",
}: {
  role: Role;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[13px]";
  const base = `inline-flex items-center rounded-full border transition-colors ${cls}`;
  if (!onClick) {
    return (
      <span
        className={`${base} border-transparent`}
        style={{ background: "var(--flow-warm)", color: "var(--flow-muted)" }}
      >
        {role}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={base}
      style={
        selected
          ? { background: "var(--flow-blue)", color: "white", borderColor: "var(--flow-blue)" }
          : { background: "white", color: "black", borderColor: "var(--flow-gray)" }
      }
    >
      {role}
    </button>
  );
}

export function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] transition-colors"
      style={
        selected
          ? { background: "black", color: "white" }
          : { background: "var(--flow-warm)", color: "var(--flow-muted)" }
      }
    >
      {label}
    </button>
  );
}
