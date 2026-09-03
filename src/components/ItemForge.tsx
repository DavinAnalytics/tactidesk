import { useMemo, useState } from "react";
import { ITEM_GUIDE, META_PATCH } from "../lib/meta";
import { itemById } from "../data/catalog";
import { combineItems, componentsOf } from "../lib/items";
import { setData } from "../data/catalog";
import { matchesQuery } from "../lib/text";
import type { Item } from "../data/types";
import { Icon } from "./Icon";
import { SearchBox } from "./SearchBox";

type Props = {
  onPickItem?: (itemId: string) => void;
};

export function ItemForge({ onPickItem }: Props) {
  const [mode, setMode] = useState<"holders" | "forge">("holders");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(ITEM_GUIDE[0]?.itemId ?? "");
  const components = useMemo(() => componentsOf(setData.items), []);
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);

  const rows = useMemo(() => {
    return ITEM_GUIDE.filter((row) =>
      matchesQuery(query, row.name, row.kind, ...row.holders.map((holder) => holder.name)),
    );
  }, [query]);

  const selected = ITEM_GUIDE.find((row) => row.itemId === selectedId) || rows[0];
  const selectedItem = selected ? itemById.get(selected.itemId) : undefined;
  const crafted = left && right ? combineItems(setData.items, left, right) : undefined;

  function pickComponent(id: string) {
    if (!left || (left && right)) {
      setLeft(id);
      setRight(null);
      return;
    }
    setRight(id);
  }

  return (
    <div className="stack">
      <div className="chips">
        <button type="button" className={mode === "holders" ? "chip on" : "chip"} onClick={() => setMode("holders")}>
          Holders
        </button>
        <button type="button" className={mode === "forge" ? "chip on" : "chip"} onClick={() => setMode("forge")}>
          Forge
        </button>
      </div>

      {mode === "holders" ? (
        <>
          <p className="muted">
            Patch {META_PATCH}. Units that take this item on the pinned meta boards — not live win rates.
          </p>
          <div className="toolbar">
            <SearchBox value={query} onChange={setQuery} placeholder="Search items or holders" />
          </div>
          <div className="item-guide">
            {rows.map((row) => (
              <button
                type="button"
                key={row.itemId}
                className={selected?.itemId === row.itemId ? "guide-row on" : "guide-row"}
                onClick={() => setSelectedId(row.itemId)}
                onDoubleClick={() => onPickItem?.(row.itemId)}
              >
                <Icon src={row.icon} alt={row.name} size={32} />
                <span className="guide-name">
                  {row.name}
                  <em>{row.kind}</em>
                </span>
                <span className="guide-holders">
                  {row.holders.slice(0, 5).map((holder) => (
                    <Icon key={holder.championId} src={holder.icon} alt={holder.name} cost={holder.cost} size={26} />
                  ))}
                </span>
              </button>
            ))}
          </div>
          {selected ? (
            <div className="detail compact-detail">
              <div className="detail-head">
                <Icon src={selected.icon} alt={selected.name} size={44} />
                <div>
                  <h4>{selected.name}</h4>
                  <p className="muted">{selected.kind}</p>
                </div>
              </div>
              {selectedItem?.text ? <p>{selectedItem.text}</p> : null}
              {selectedItem?.composition?.length === 2 ? (
                <p className="muted">
                  Recipe: {itemById.get(selectedItem.composition[0])?.name} + {itemById.get(selectedItem.composition[1])?.name}
                </p>
              ) : null}
              <h4>Best on</h4>
              <div className="holder-list">
                {selected.holders.map((holder) => (
                  <div key={holder.championId} className="holder-row">
                    <Icon src={holder.icon} alt={holder.name} cost={holder.cost} size={36} />
                    <span>
                      <strong>{holder.name}</strong>
                      <em>{holder.comps.join(" · ")}</em>
                    </span>
                  </div>
                ))}
              </div>
              {onPickItem ? (
                <button type="button" className="primary" onClick={() => onPickItem(selected.itemId)}>
                  Add to selected unit
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <section>
          <h3>Forge</h3>
          <p className="muted">
            Tap two components
            {left ? ` · ${components.find((item) => item.id === left)?.name || "component"}` : ""}
            {right ? ` + ${components.find((item) => item.id === right)?.name || "component"}` : ""}
            .
          </p>
          <div className="forge-row">
            {components.map((item: Item) => {
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
              <button
                type="button"
                className="result-card"
                onClick={() => {
                  setSelectedId(crafted.id);
                  setMode("holders");
                  onPickItem?.(crafted.id);
                }}
              >
                <Icon src={crafted.icon} alt={crafted.name} size={48} />
                <div>
                  <strong>{crafted.name}</strong>
                  <p>{ITEM_GUIDE.find((row) => row.itemId === crafted.id)?.holders.map((h) => h.name).join(", ") || crafted.kind}</p>
                </div>
              </button>
            ) : (
              <p className="muted">{left ? "Pick a second component." : "Pick a first component."}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
