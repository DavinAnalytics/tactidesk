import { useMemo, useState } from "react";
import type { Item } from "../data/types";
import { setData } from "../data/catalog";
import { combineItems, completedOf, componentsOf } from "../lib/items";
import { matchesQuery } from "../lib/text";
import { Icon } from "./Icon";
import { SearchBox } from "./SearchBox";

type Props = {
  onPickItem?: (itemId: string) => void;
};

export function ItemForge({ onPickItem }: Props) {
  const components = useMemo(() => componentsOf(setData.items), []);
  const completed = useMemo(() => completedOf(setData.items), []);
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);
  const crafted = left && right ? combineItems(setData.items, left, right) : undefined;

  const visible = useMemo(() => {
    return completed.filter((item) => matchesQuery(query, item.name, item.text, item.kind));
  }, [query, completed]);

  function pickComponent(id: string) {
    if (!left || (left && right)) {
      setLeft(id);
      setRight(null);
      return;
    }
    setRight(id);
    const item = combineItems(setData.items, left, id);
    if (item) setSelected(item);
  }

  return (
    <div className="stack">
      <section>
        <h3>Forge</h3>
        <p className="muted">Tap two components. Same component twice is a duplicate recipe.</p>
        <div className="forge-row">
          {components.map((item) => {
            const active = item.id === left || item.id === right;
            return (
              <button
                type="button"
                key={item.id}
                className={active ? "forge-part on" : "forge-part"}
                onClick={() => pickComponent(item.id)}
                title={item.name}
              >
                <Icon src={item.icon} alt={item.name} size={40} />
              </button>
            );
          })}
        </div>
        <div className="forge-result">
          {crafted ? (
            <button type="button" className="result-card" onClick={() => onPickItem?.(crafted.id)}>
              <Icon src={crafted.icon} alt={crafted.name} size={48} />
              <div>
                <strong>{crafted.name}</strong>
                <p>{crafted.text || crafted.kind}</p>
              </div>
            </button>
          ) : (
            <p className="muted">{left ? "Pick a second component." : "Pick a first component."}</p>
          )}
        </div>
      </section>

      <section>
        <div className="toolbar">
          <SearchBox value={query} onChange={setQuery} placeholder="Search completed items and emblems" />
        </div>
        <div className="item-list">
          {visible.map((item) => (
            <button
              type="button"
              key={item.id}
              className={selected?.id === item.id ? "item-row on" : "item-row"}
              onClick={() => setSelected(item)}
              onDoubleClick={() => onPickItem?.(item.id)}
            >
              <Icon src={item.icon} alt={item.name} size={32} />
              <span>{item.name}</span>
              <em>{item.kind}</em>
            </button>
          ))}
        </div>
        {selected ? (
          <div className="detail compact-detail">
            <h4>{selected.name}</h4>
            <p>{selected.text || "No extra text in the data dump."}</p>
            {onPickItem ? (
              <button type="button" className="primary" onClick={() => onPickItem(selected.id)}>
                Add to selected unit
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
