import { COST_COLORS } from "../data/catalog";

type Props = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  cost?: number;
  title?: string;
};

export function Icon({ src, alt, size = 36, className = "", cost, title }: Props) {
  return (
    <span
      className={`icon ${className}`}
      title={title || alt}
      style={{
        width: size,
        height: size,
        ["--cost" as string]: cost ? COST_COLORS[cost] || "#888" : "transparent",
      }}
    >
      {src ? <img src={src} alt={alt} draggable={false} /> : <span className="icon-fallback">{alt.slice(0, 1)}</span>}
    </span>
  );
}
