import { useMemo, useState } from "react";
import type { MetaTier, ResolvedMetaComp } from "../lib/meta";
import { META_COMPS, META_PATCH, activeTraits } from "../lib/meta";
import { itemById } from "../data/catalog";
import { Icon } from "./Icon";
import { SearchBox } from "./SearchBox";
import { matchesQuery } from "../lib/text";

type Props = {
  onPin: (comp: ResolvedMetaComp) => void;
  onOpen: (comp: ResolvedMetaComp) => void;
};

const TIERS: Array<MetaTier | "all"> = ["all", "S", "A", "B", "C"];

export function MetaComps({ onPin, onOpen }: Props) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<MetaTier | "all">("all");
  const [openId, setOpenId] = useState<string | null>(META_COMPS[0]?.id ?? null);

  const rows = useMemo(() => {
    return META_COMPS.filter((comp) => {
      if (tier !== "all" && comp.tier !== tier) return false;
      const names = comp.units.map((unit) => unit.champion.name);
      const traits = activeTraits(comp).map((trait) => trait.name);
      return matchesQuery(query, comp.name, comp.style, ...names, ...traits);
    });
  }, [query, tier]);

  return (
    <div className="stack">
      <p className="muted">
        Patch {META_PATCH} snapshot. Static boards you can pin — not live match stats.
      </p>
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search comps, units, traits" />
      </div>
      <div className="chips">
        {TIERS.map((value) => (
          <button
            type="button"
            key={value}
            className={tier === value ? "chip on" : "chip"}
            onClick={() => setTier(value)}
          >
            {value === "all" ? "All" : `${value} tier`}
          </button>
        ))}
      </div>
      <div className="meta-list">
        {rows.map((comp) => {
          const open = openId === comp.id;
          const traits = activeTraits(comp);
          return (
            <article key={comp.id} className={open ? "meta-card on" : "meta-card"}>
              <button type="button" className="meta-head" onClick={() => setOpenId(open ? null : comp.id)}>
                <span className={`tier tier-${comp.tier.toLowerCase()}`}>{comp.tier}</span>
                <span className="meta-title">
                  <strong>{comp.name}</strong>
                  <em>{comp.style}</em>
                </span>
              </button>
              <div className="meta-units">
                {comp.units.map((unit) => (
                  <div key={unit.championId} className="pin-unit" title={unit.champion.name}>
                    <Icon src={unit.champion.icon} alt={unit.champion.name} cost={unit.champion.cost} size={40} />
                    <div className="pin-items">
                      {unit.itemIds.map((itemId) => {
                        const item = itemById.get(itemId);
                        return item ? <Icon key={itemId} src={item.icon} alt={item.name} size={14} /> : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="trait-row">
                {traits.map((trait) => (
                  <span key={trait.name} className="pill">
                    {trait.name} {trait.count}
                  </span>
                ))}
              </div>
              {open ? (
                <div className="meta-body">
                  <p>{comp.notes}</p>
                  <div className="toolbar gap">
                    <button type="button" className="primary" onClick={() => onPin(comp)}>
                      Pin to overlay
                    </button>
                    <button type="button" onClick={() => onOpen(comp)}>
                      Save to my boards
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
