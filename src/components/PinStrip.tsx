import type { Comp } from "../data/types";
import { championById, itemById } from "../data/catalog";
import { Icon } from "./Icon";

type Props = {
  comps: Comp[];
  onOpen: (id: string) => void;
};

export function PinStrip({ comps, onOpen }: Props) {
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
        <button type="button" key={comp.id} className="pin-card" onClick={() => onOpen(comp.id)}>
          <header>
            <strong>{comp.name}</strong>
            <span>{comp.units.length} units</span>
          </header>
          <div className="pin-units">
            {comp.units.map((unit) => {
              const champ = championById.get(unit.championId);
              if (!champ) return null;
              return (
                <div key={unit.championId} className="pin-unit">
                  <Icon src={champ.icon} alt={champ.name} cost={champ.cost} size={42} />
                  <div className="pin-items">
                    {unit.items.map((itemId) => {
                      const found = itemById.get(itemId);
                      return found ? <Icon key={itemId} src={found.icon} alt={found.name} size={16} /> : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {comp.notes ? <p className="pin-notes">{comp.notes}</p> : null}
        </button>
      ))}
    </div>
  );
}
