import { formatItemStat } from "../lib/riot-stats";
import { Icon } from "./Icon";

export type RecItem = {
  itemId: string;
  name: string;
  icon: string;
  n?: number;
  avgPlace?: number;
  delta?: number;
};

type Props = {
  title: string;
  items: RecItem[];
  empty?: string;
};

export function RecRow({ title, items, empty = "None on the snapshot" }: Props) {
  return (
    <section className="rec-block">
      <h4>{title}</h4>
      {items.length ? (
        <div className="rec-row">
          {items.map((item) => {
            const stat = formatItemStat(item);
            return (
              <div key={item.itemId} className="rec-item" title={stat ? `${item.name} · ${stat}` : item.name}>
                <Icon src={item.icon} alt={item.name} size={32} />
                <span>{item.name}</span>
                {stat ? <span className="rec-stat">{stat}</span> : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="muted">{empty}</p>
      )}
    </section>
  );
}
