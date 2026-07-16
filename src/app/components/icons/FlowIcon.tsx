// 复用真实 Figma 字形（src/imports/流2）渲染 Flow 的核心对象图标。
// 白色图形置于蓝色圆角容器；completed 用蓝→品红渐变 + 黄色对勾角标。
import svgPaths from "@/imports/流2/svg-6fnpztong6";
import { Check } from "lucide-react";

export type FlowIconKind = "source" | "flow" | "fragment";

const GLYPH: Record<FlowIconKind, { path: string; vb: string }> = {
  // 源：实心圆（viewBox 17×17）
  source: { path: svgPaths.p8c21e00, vb: "0 0 17 17" },
  // 流：分支连接字形（viewBox ≈ 21×27）
  flow: { path: svgPaths.pff0f680, vb: "0 0 21 27" },
  // 灵感碎片：互扣拼块字形（viewBox ≈ 24×23）
  fragment: { path: svgPaths.pf9ca500, vb: "0 0 24 23" },
};

export function FlowGlyph({
  kind,
  size = 16,
  color = "white",
}: {
  kind: FlowIconKind;
  size?: number;
  color?: string;
}) {
  const g = GLYPH[kind];
  return (
    <svg
      width={size}
      height={size}
      viewBox={g.vb}
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path d={g.path} fill={color} />
    </svg>
  );
}

/** 带蓝色圆角容器的图标徽章，用于卡片 / 节点 / 列表。 */
export function FlowIcon({
  kind,
  size = 40,
  completed = false,
  selected = false,
}: {
  kind: FlowIconKind;
  size?: number;
  completed?: boolean;
  selected?: boolean;
}) {
  const radius = Math.round(size * 0.32);
  const glyphSize = Math.round(size * 0.5);
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: completed
          ? "linear-gradient(135deg, var(--flow-blue), #e21b9f)"
          : "var(--flow-blue)",
        boxShadow: selected ? "0 0 0 3px rgba(39,72,238,0.25)" : undefined,
      }}
    >
      <FlowGlyph kind={kind} size={glyphSize} />
      {completed && (
        <span
          className="absolute -bottom-1 -right-1 grid place-items-center rounded-full"
          style={{
            width: size * 0.42,
            height: size * 0.42,
            background: "var(--flow-yellow)",
          }}
        >
          <Check size={size * 0.26} color="#000" strokeWidth={3} />
        </span>
      )}
    </span>
  );
}

export const KIND_LABEL: Record<FlowIconKind, string> = {
  source: "源",
  flow: "流",
  fragment: "灵感碎片",
};
