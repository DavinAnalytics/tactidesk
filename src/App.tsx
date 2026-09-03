import { useEffect, useMemo, useState } from "react";
import { setData } from "./data/catalog";
import type { Comp, OverlayTab } from "./data/types";
import {
  addUnit,
  createComp,
  exportComps,
  importComps,
  loadAugmentNotes,
  loadComps,
  loadSettings,
  saveAugmentNotes,
  saveComps,
  saveSettings,
  upsertComp,
} from "./lib/storage";
import { AugmentBrowser } from "./components/AugmentBrowser";
import { CompLibrary } from "./components/CompLibrary";
import { ItemForge } from "./components/ItemForge";
import { OddsTable } from "./components/OddsTable";
import { PinStrip } from "./components/PinStrip";
import { TraitBrowser } from "./components/TraitBrowser";
import { UnitBrowser } from "./components/UnitBrowser";

const TABS: Array<{ id: OverlayTab; label: string }> = [
  { id: "board", label: "Board" },
  { id: "comps", label: "Comps" },
  { id: "units", label: "Units" },
  { id: "items", label: "Items" },
  { id: "augments", label: "Augments" },
  { id: "traits", label: "Traits" },
];

export function App() {
  const [tab, setTab] = useState<OverlayTab>("board");
  const [comps, setComps] = useState<Comp[]>(() => loadComps());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState(() => loadAugmentNotes());
  const [settings, setSettings] = useState(() => loadSettings());
  const [hidden, setHidden] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => saveComps(comps), [comps]);
  useEffect(() => saveAugmentNotes(notes), [notes]);
  useEffect(() => saveSettings(settings), [settings]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.code === "KeyT") {
        event.preventDefault();
        setHidden((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    const off = window.tactidesk?.onToggleOverlay(() => setHidden((value) => !value));
    return () => {
      window.removeEventListener("keydown", onKey);
      off?.();
    };
  }, []);

  const active = useMemo(() => comps.find((comp) => comp.id === activeId) || null, [comps, activeId]);

  function updateComp(next: Comp) {
    setComps((current) => upsertComp(current, next));
  }

  function addChampion(championId: string) {
    const target = active ?? createAndSelect();
    updateComp(addUnit(target, championId));
    setTab("comps");
    flash("Added to board");
  }

  function addItem(itemId: string) {
    if (!active || !active.units.length) {
      flash("Open a board and add a unit first");
      return;
    }
    const units = active.units.map((unit, index) => {
      if (index !== active.units.length - 1) return unit;
      if (unit.items.length >= 3) return unit;
      return { ...unit, items: [...unit.items, itemId] };
    });
    updateComp({ ...active, units });
    flash("Item added to last unit");
  }

  function createAndSelect(): Comp {
    const created = createComp();
    setComps((current) => [created, ...current]);
    setActiveId(created.id);
    return created;
  }

  function flash(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 1800);
  }

  if (hidden) {
    return (
      <button type="button" className="peek" onClick={() => setHidden(false)} title="Show TactiDesk">
        TD
      </button>
    );
  }

  return (
    <div className="shell" style={{ ["--panel-alpha" as string]: String(settings.opacity) }}>
      <header className="titlebar">
        <div className="drag">
          <span className="mark">TD</span>
          <div>
            <strong>TactiDesk</strong>
            <small>
              Set {setData.set} · {setData.name}
            </small>
          </div>
        </div>
        <div className="title-actions">
          <button type="button" onClick={() => setSettings((s) => ({ ...s, compact: !s.compact }))}>
            {settings.compact ? "Expand" : "Compact"}
          </button>
          <button type="button" onClick={() => setHidden(true)} title="Hide (Ctrl+Shift+T)">
            Hide
          </button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((entry) => (
          <button
            type="button"
            key={entry.id}
            className={tab === entry.id ? "tab on" : "tab"}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      {status ? <div className="toast">{status}</div> : null}

      <main className={settings.compact ? "main compact" : "main"}>
        {tab === "board" ? (
          <div className="stack">
            <PinStrip
              comps={comps}
              onOpen={(id) => {
                setActiveId(id);
                setTab("comps");
              }}
            />
            {!settings.compact ? <OddsTable /> : null}
          </div>
        ) : null}
        {tab === "comps" ? (
          <CompLibrary
            comps={comps}
            activeId={activeId}
            onSelect={setActiveId}
            onCreate={() => {
              createAndSelect();
            }}
            onPin={(id) => {
              const found = comps.find((comp) => comp.id === id);
              if (found) updateComp({ ...found, pinned: !found.pinned });
            }}
            onDelete={(id) => {
              setComps((current) => current.filter((comp) => comp.id !== id));
              if (activeId === id) setActiveId(null);
            }}
            onChange={updateComp}
            onExport={() => {
              const blob = new Blob([exportComps(comps)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "tactidesk-comps.json";
              link.click();
              URL.revokeObjectURL(url);
            }}
            onImport={async (file) => {
              try {
                const incoming = importComps(await file.text());
                setComps((current) => {
                  const seen = new Set(current.map((comp) => comp.id));
                  return [...incoming.filter((comp) => !seen.has(comp.id)), ...current];
                });
                flash(`Imported ${incoming.length} boards`);
              } catch (error) {
                flash(error instanceof Error ? error.message : "Import failed");
              }
            }}
          />
        ) : null}
        {tab === "units" ? <UnitBrowser onAddToBoard={addChampion} /> : null}
        {tab === "items" ? <ItemForge onPickItem={addItem} /> : null}
        {tab === "augments" ? (
          <AugmentBrowser
            notes={notes}
            onNote={(id, note) => setNotes((current) => ({ ...current, [id]: note }))}
          />
        ) : null}
        {tab === "traits" ? <TraitBrowser /> : null}
      </main>

      <footer>
        Personal static overlay. No lobby scouting, no live win odds, no ads. Ctrl+Shift+T hides it.
        TactiDesk isn’t endorsed by Riot Games.
      </footer>
    </div>
  );
}
