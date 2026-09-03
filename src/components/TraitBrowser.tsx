import { useMemo, useState } from "react";
import { setData } from "../data/catalog";
import { matchesQuery } from "../lib/text";
import { Icon } from "./Icon";
import { SearchBox } from "./SearchBox";

export function TraitBrowser() {
  const [query, setQuery] = useState("");
  const rows = useMemo(
    () => setData.traits.filter((trait) => matchesQuery(query, trait.name, trait.text)),
    [query],
  );
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? "");
  const selected = setData.traits.find((trait) => trait.id === selectedId) || rows[0];
  const members = selected
    ? setData.champions.filter((champ) => champ.traits.includes(selected.name)).sort((a, b) => a.cost - b.cost)
    : [];

  return (
    <div className="split">
      <div>
        <div className="toolbar">
          <SearchBox value={query} onChange={setQuery} placeholder="Search traits" />
        </div>
        <div className="trait-list">
          {rows.map((trait) => (
            <button
              type="button"
              key={trait.id}
              className={selected?.id === trait.id ? "trait-row on" : "trait-row"}
              onClick={() => setSelectedId(trait.id)}
            >
              <Icon src={trait.icon} alt={trait.name} size={28} />
              <span>{trait.name}</span>
              <em>{trait.breakpoints.map((point) => point.min).join(" / ")}</em>
            </button>
          ))}
        </div>
      </div>
      <aside className="detail">
        {selected ? (
          <>
            <div className="detail-head">
              <Icon src={selected.icon} alt={selected.name} size={48} />
              <div>
                <h3>{selected.name}</h3>
                <p className="muted">{selected.breakpoints.map((point) => point.min).join(" · ")}</p>
              </div>
            </div>
            <p className="pre">{selected.text}</p>
            <div className="trait-members">
              {members.map((champ) => (
                <Icon key={champ.id} src={champ.icon} alt={champ.name} cost={champ.cost} size={36} title={champ.name} />
              ))}
            </div>
          </>
        ) : (
          <p className="muted">No trait selected.</p>
        )}
      </aside>
    </div>
  );
}
