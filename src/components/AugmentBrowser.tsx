import { useMemo, useState } from "react";
import { setData } from "../data/catalog";
import { matchesQuery } from "../lib/text";
import { Icon } from "./Icon";
import { SearchBox } from "./SearchBox";

const TIER_LABEL = ["", "Silver", "Gold", "Prismatic"] as const;

type Props = {
  notes: Record<string, string>;
  onNote: (id: string, note: string) => void;
};

export function AugmentBrowser({ notes, onNote }: Props) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<number | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return setData.augments.filter((aug) => {
      if (tier !== "all" && aug.tier !== tier) return false;
      return matchesQuery(query, aug.name, aug.text, notes[aug.id]);
    });
  }, [query, tier, notes]);

  const selected = setData.augments.find((aug) => aug.id === selectedId) || null;

  return (
    <div className="split">
      <div>
        <div className="toolbar">
          <SearchBox value={query} onChange={setQuery} placeholder="Search augments or your notes" />
        </div>
        <div className="chips">
          <button type="button" className={tier === "all" ? "chip on" : "chip"} onClick={() => setTier("all")}>
            All
          </button>
          {[1, 2, 3].map((value) => (
            <button
              type="button"
              key={value}
              className={tier === value ? "chip on" : "chip"}
              onClick={() => setTier(value)}
            >
              {TIER_LABEL[value]}
            </button>
          ))}
        </div>
        <div className="aug-list">
          {rows.map((aug) => (
            <button
              type="button"
              key={aug.id}
              className={selectedId === aug.id ? "aug-row on" : "aug-row"}
              onClick={() => setSelectedId(aug.id)}
            >
              <Icon src={aug.icon} alt={aug.name} size={32} />
              <span>
                {aug.name}
                {notes[aug.id] ? <i className="note-dot" title="Has a personal note" /> : null}
              </span>
              <em>{TIER_LABEL[aug.tier] || aug.tier}</em>
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
                <p className="muted">{TIER_LABEL[selected.tier] || "Augment"}</p>
              </div>
            </div>
            <p>{selected.text}</p>
            <label className="note-field">
              Personal note
              <textarea
                value={notes[selected.id] || ""}
                onChange={(event) => onNote(selected.id, event.target.value)}
                placeholder="Take or leave — your reminder, not a live recommendation."
                rows={4}
              />
            </label>
          </>
        ) : (
          <p className="muted">Augment text is static set data. Star what you personally like in the note field.</p>
        )}
      </aside>
    </div>
  );
}
