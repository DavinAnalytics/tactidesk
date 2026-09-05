import { Icon } from "./Icon";

export type RecItem = {
  itemId: string;
  name: string;
  icon: string;
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
          {items.map((item) => (
            <div key={item.itemId} className="rec-item" title={item.name}>
              <Icon src={item.icon} alt={item.name} size={32} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{empty}</p>
      )}
    </section>
  );
}
