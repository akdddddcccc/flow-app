import React, { useMemo, useState } from "react";

const FALLBACK_COLORS = ["#18243f", "#b69c34", "#667084", "#7f6c9e", "#4f7a74"];

function fallbackColor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

/**
 * Supports deliberate `solid:#RRGGBB` sources for the portfolio prototype.
 * Network/image errors fall back to a stable color instead of a broken-image icon.
 */
export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;

  const solidColor = useMemo(() => {
    if (typeof src === "string" && src.startsWith("solid:")) return src.slice(6);
    if (didError) return fallbackColor(String(src ?? alt ?? "flow"));
    return null;
  }, [src, alt, didError]);

  if (solidColor) {
    return (
      <div
        role="img"
        aria-label={alt ?? ""}
        className={`inline-block align-middle ${className ?? ""}`}
        style={{ ...style, backgroundColor: solidColor }}
        data-original-url={src}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}
