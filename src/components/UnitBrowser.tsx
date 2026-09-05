import { useMemo, useState } from "react";
import type { Champion } from "../data/types";
import { setData } from "../data/catalog";
import { guideForChampion } from "../lib/meta";
import { formatRole, matchesQuery } from "../lib/text";
import { Icon } from "./Icon";
import { RecRow } from "./RecRow";
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

  const guide = selected ? guideForChampion(selected.id) : null;

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
            >
              <Icon src={champ.icon} alt={champ.name} cost={champ.cost} size={48} />
              <span className="unit-name">{champ.name}</span>
            </button>
          ))}
        </div>
      </div>
      <aside className="detail">
        {selected && guide ? (
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
            <RecRow title="Best items" items={guide.items} />
            <RecRow title="Best emblems" items={guide.emblems} />
            <RecRow title="Best artifacts" items={guide.artifacts} />
            <section className="rec-block">
              <h4>Best comps</h4>
              {guide.comps.length ? (
                <div className="comp-pills">
                  {guide.comps.map((comp) => (
                    <span key={comp.id} className="pill">
                      {comp.tier} · {comp.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted">Not on a pinned meta board</p>
              )}
            </section>
            {onAddToBoard ? (
              <button type="button" className="primary" onClick={() => onAddToBoard(selected.id)}>
                Add to open board
              </button>
            ) : null}
          </>
        ) : (
          <p className="muted">Select a unit to see items, emblems, artifacts, and comps.</p>
        )}
      </aside>
    </div>
  );
}
