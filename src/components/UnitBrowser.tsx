import { useMemo, useState } from "react";
import type { Champion } from "../data/types";
import { setData } from "../data/catalog";
import { formatRole, matchesQuery } from "../lib/text";
import { Icon } from "./Icon";
import { SearchBox } from "./SearchBox";

type Props = {
  onAddToBoard?: (championId: string) => void;
};

export function UnitBrowser({ onAddToBoard }: Props) {
  const [query, setQuery] = useState("");
  const [cost, setCost] = useState<number | "all">("all");
  const [selected, setSelected] = useState<Champion | null>(null);

  const units = useMemo(() => {
    return setData.champions.filter((champ) => {
      if (cost !== "all" && champ.cost !== cost) return false;
      return matchesQuery(query, champ.name, champ.role, ...champ.traits);
    });
  }, [query, cost]);

  return (
    <div className="split">
      <div>
        <div className="toolbar">
          <SearchBox value={query} onChange={setQuery} placeholder="Search units or traits" />
        </div>
        <div className="chips">
          <button type="button" className={cost === "all" ? "chip on" : "chip"} onClick={() => setCost("all")}>
            All
          </button>
          {[1, 2, 3, 4, 5].map((tier) => (
            <button
              type="button"
              key={tier}
              className={cost === tier ? "chip on" : "chip"}
              onClick={() => setCost(tier)}
            >
              {tier}¢
            </button>
          ))}
        </div>
        <div className="unit-grid">
          {units.map((champ) => (
            <button
              type="button"
              key={champ.id}
              className={selected?.id === champ.id ? "unit on" : "unit"}
              onClick={() => setSelected(champ)}
              onDoubleClick={() => onAddToBoard?.(champ.id)}
            >
              <Icon src={champ.icon} alt={champ.name} cost={champ.cost} size={48} />
              <span className="unit-name">{champ.name}</span>
            </button>
          ))}
        </div>
      </div>
      <aside className="detail">
        {selected ? (
          <>
            <div className="detail-head">
              <Icon src={selected.splash} alt={selected.name} cost={selected.cost} size={72} />
              <div>
                <h3>{selected.name}</h3>
                <p className="muted">
                  {selected.cost}-cost · {formatRole(selected.role)}
                </p>
                <div className="trait-row">
                  {selected.traits.map((name) => (
                    <span key={name} className="pill">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {selected.ability.name ? (
              <section>
                <h4>{selected.ability.name}</h4>
                <p>{selected.ability.text}</p>
              </section>
            ) : null}
            {onAddToBoard ? (
              <button type="button" className="primary" onClick={() => onAddToBoard(selected.id)}>
                Add to open board
              </button>
            ) : null}
          </>
        ) : (
          <p className="muted">Select a unit. Double-click to drop it on the open board.</p>
        )}
      </aside>
    </div>
  );
}
