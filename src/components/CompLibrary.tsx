import type { Comp } from "../data/types";
import { championById, itemById } from "../data/catalog";
import { Icon } from "./Icon";

type Props = {
  comps: Comp[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (comp: Comp) => void;
  onExport: () => void;
  onImport: (file: File) => void;
};

export function CompLibrary({
  comps,
  activeId,
  onSelect,
  onCreate,
  onPin,
  onDelete,
  onChange,
  onExport,
  onImport,
}: Props) {
  const active = comps.find((comp) => comp.id === activeId) || null;

  return (
    <div className="split">
      <div>
        <div className="toolbar gap">
          <button type="button" className="primary" onClick={onCreate}>
            New board
          </button>
          <button type="button" onClick={onExport}>
            Export
          </button>
          <label className="file-btn">
            Import
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImport(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        <div className="comp-list">
          {comps.length === 0 ? <p className="muted pad">No boards yet. Build one from Units.</p> : null}
          {comps.map((comp) => (
            <button
              type="button"
              key={comp.id}
              className={comp.id === activeId ? "comp-row on" : "comp-row"}
              onClick={() => onSelect(comp.id)}
            >
              <span>
                {comp.pinned ? "📌 " : ""}
                {comp.name}
              </span>
              <em>{comp.units.length}</em>
            </button>
          ))}
        </div>
      </div>
      <aside className="detail">
        {active ? (
          <CompEditor comp={active} onChange={onChange} onPin={() => onPin(active.id)} onDelete={() => onDelete(active.id)} />
        ) : (
          <p className="muted">Select a board to edit units, items, and notes.</p>
        )}
      </aside>
    </div>
  );
}

function CompEditor({
  comp,
  onChange,
  onPin,
  onDelete,
}: {
  comp: Comp;
  onChange: (comp: Comp) => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="stack">
      <label className="note-field">
        Board name
        <input
          className="title-input"
          type="text"
          value={comp.name}
          onChange={(event) => onChange({ ...comp, name: event.target.value })}
          onKeyDown={(event) => event.stopPropagation()}
        />
      </label>
      <div className="toolbar gap">
        <button type="button" onClick={onPin}>
          {comp.pinned ? "Unpin from overlay" : "Pin to overlay"}
        </button>
        <button type="button" className="danger" onClick={onDelete}>
          Delete
        </button>
      </div>
      <div className="board-units">
        {comp.units.map((unit, index) => {
          const champ = championById.get(unit.championId);
          if (!champ) return null;
          return (
            <div key={unit.championId} className="board-unit">
              <Icon src={champ.icon} alt={champ.name} cost={champ.cost} size={48} />
              <div>
                <strong>{champ.name}</strong>
                <div className="pin-items">
                  {unit.items.map((itemId, itemIndex) => {
                    const found = itemById.get(itemId);
                    if (!found) return null;
                    return (
                      <button
                        type="button"
                        key={`${itemId}-${itemIndex}`}
                        className="ghost-icon"
                        title={`Remove ${found.name}`}
                        onClick={() => {
                          const items = unit.items.filter((_, i) => i !== itemIndex);
                          const units = comp.units.map((entry, i) => (i === index ? { ...entry, items } : entry));
                          onChange({ ...comp, units });
                        }}
                      >
                        <Icon src={found.icon} alt={found.name} size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                className="tiny"
                onClick={() => onChange({ ...comp, units: comp.units.filter((entry) => entry.championId !== unit.championId) })}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <label className="note-field">
        Notes
        <textarea
          rows={5}
          value={comp.notes}
          onChange={(event) => onChange({ ...comp, notes: event.target.value })}
          placeholder="Leveling plan, item holders, when you want to roll — written before the game."
        />
      </label>
    </div>
  );
}
