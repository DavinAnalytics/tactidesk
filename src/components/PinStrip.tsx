import { useState } from "react";
import type { Comp } from "../data/types";
import { championById, itemById } from "../data/catalog";
import { guideForChampion } from "../lib/meta";
import { Icon } from "./Icon";
import { RecRow } from "./RecRow";

type Props = {
  comps: Comp[];
  onRemoveUnit: (compId: string, championId: string) => void;
};

export function PinStrip({ comps, onRemoveUnit }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const pinned = comps.filter((comp) => comp.pinned);
  if (!pinned.length) {
    return (
      <div className="empty">
        <p>Pin a meta board from Comps to keep it on this strip while you play.</p>
        <p className="muted">Static reference only — your notes, not live advice.</p>
      </div>
    );
  }

  return (
    <div className="pin-list">
      {pinned.map((comp) => (
        <article key={comp.id} className="pin-card">
          <header>
            <strong>{comp.name}</strong>
            <span>{comp.units.length} units</span>
          </header>
          <div className="pin-units">
            {comp.units.map((unit) => {
              const champ = championById.get(unit.championId);
              if (!champ) return null;
              const key = `${comp.id}:${unit.championId}`;
              const open = openKey === key;
              return (
                <div key={unit.championId} className={unit.stars === 3 ? "pin-unit star3" : "pin-unit"}>
                  <button
                    type="button"
                    className={open ? "pin-unit-btn on" : "pin-unit-btn"}
                    onClick={() => setOpenKey(open ? null : key)}
                    title={champ.name}
                  >
                    <Icon src={champ.icon} alt={champ.name} cost={champ.cost} size={42} stars={unit.stars} />
                    <div className="pin-items">
                      {unit.items.map((itemId) => {
                        const found = itemById.get(itemId);
                        return found ? <Icon key={itemId} src={found.icon} alt={found.name} size={16} /> : null;
                      })}
                    </div>
                  </button>
                  <button
                    type="button"
                    className="tiny pin-remove"
                    title={`Remove ${champ.name}`}
                    onClick={() => {
                      if (openKey === key) setOpenKey(null);
                      onRemoveUnit(comp.id, unit.championId);
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          {openKey?.startsWith(`${comp.id}:`)
            ? renderGuide(openKey.slice(comp.id.length + 1))
            : null}
          {comp.notes ? <p className="pin-notes">{comp.notes}</p> : null}
        </article>
      ))}
    </div>
  );
}

function renderGuide(championId: string) {
  const champ = championById.get(championId);
  const guide = guideForChampion(championId);
  return (
    <div className="pin-expand">
      <strong>{champ?.name || "Unit"}</strong>
      <RecRow title="Items on our boards" items={guide.items} />
      <RecRow title="Usual artifacts" items={guide.artifacts} empty="No static artifact note for this unit" />
    </div>
  );
}
