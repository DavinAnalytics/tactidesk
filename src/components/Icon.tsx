import { COST_COLORS } from "../data/catalog";

type Props = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  cost?: number;
  title?: string;
  stars?: 1 | 2 | 3;
};

export function Icon({ src, alt, size = 36, className = "", cost, title, stars }: Props) {
  const label = stars === 3 ? `${alt} 3-star` : title || alt;
  return (
    <span className={stars === 3 ? "star-wrap" : undefined}>
      <span
        className={`icon ${className}`}
        title={label}
        style={{
          width: size,
          height: size,
          ["--cost" as string]: cost ? COST_COLORS[cost] || "#888" : "transparent",
        }}
      >
        {src ? <img src={src} alt={label} draggable={false} /> : <span className="icon-fallback">{alt.slice(0, 1)}</span>}
      </span>
      {stars === 3 ? (
        <span className="star-badge" aria-hidden="true">
          ★★★
        </span>
      ) : null}
    </span>
  );
}
