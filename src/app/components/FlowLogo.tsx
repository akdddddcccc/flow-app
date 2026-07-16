export function FlowLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="font-bold leading-none tracking-tight"
      style={{ color: "black", fontSize: compact ? 22 : 32 }}
    >
      流<span style={{ color: "var(--flow-blue)" }}>.</span>
    </span>
  );
}
