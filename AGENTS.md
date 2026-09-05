# TactiDesk — session notes

Last updated **2026-09-05**. Read this before changing the overlay, installer, or stats pipeline.

Repo: https://github.com/DavinAnalytics/tactidesk (public)  
Live install: https://github.com/DavinAnalytics/tactidesk/releases/latest  
Current ship: **0.1.4** (`v0.1.4`, merged as #5)

## What it is

Personal Teamfight Tactics overlay for **Set 18: Enchanted Wilds**. Vite + React + Electron. One-click NSIS installer. Auto-update from GitHub Releases.

It is a **static reference**: curated meta boards you pin, Community Dragon encyclopedia, and a committed NA ladder snapshot. It is **not** a live coach.

## What it is not

Riot allows overlays that show **data available before the game**. Do not add:

- Lobby scouting or opponent board tracking
- Live win odds or “pick this now”
- Recs that change from the current match state
- Scraping MetaTFT / lolchess (not a copy of their tables)

Play in **borderless windowed**. Toggle `Ctrl+Shift+T`. Always-on-top window; no injection.

## Current ship (0.1.4)

| Surface | Behavior |
|---|---|
| Header | `TactiDesk v{package.json version}` · `Set 18 · Enchanted Wilds · Patch 18.1d` · `NA 271 games` when `stats.json` has matches |
| Board | Pin a meta/user board. Click a unit to expand recs. **×** removes the unit. No shop odds. |
| Units | Single click shows items / emblems / artifacts / comps. Double-click does not add to the board. |
| Items | Accordion. Holders from the ladder when `n ≥ 20`, else holders on our boards. Artifacts are in the list. |
| Recs | `n=181 · 4.39 · −0.22` when ladder data exists. Negative delta is better. |

First real install was **0.1.1** (updater). **0.1.0** needed one extra install. Do **not** tell the user to reinstall unless the updater is missing.

The user confirmed in-app update works. They play live; do not force a restart mid-match.

## How to ship an update

1. Bump `version` in `package.json` (Electron only updates when the number goes up).
2. Merge to `main`.
3. `.github/workflows/windows-installer.yml` builds the NSIS exe and `scripts/publish-win-release.sh` publishes `v<version>` if that tag is new.
4. Installed copies check GitHub on launch and every few hours. Banner → **Restart**, or it installs on quit.

Docs-only changes do **not** need a version bump.

## Data honesty

| Overlay line | Source | Reality |
|---|---|---|
| Items on a pinned board | `RAW_META_COMPS` in `src/data/meta.ts` | Curated “this line’s slams”, patch **18.1d** |
| Ladder items / holders | `src/data/stats.json` via `guideForChampion` / `ITEM_GUIDE` | Ranked NA Match API aggregate |
| “Usual artifacts” guesses | `ARTIFACT_HOLDERS` / `EMBLEM_HOLDERS` | **Not shown.** Historical notes only. Horizon Focus is a stun item — never invent it on Zyra. |
| Names / recipes / text | Community Dragon (`npm run extract` → `src/data/set.json`) | No “best on” |

If ladder `n` for a kind is below `minSample` (20), fall back to **board-assigned items only**. Empty artifacts is correct. Do not fill gaps with guesses.

## Riot stats pipeline

The Electron app **never** calls Riot. A local script writes `src/data/stats.json`.

```bash
# .env is gitignored. Copy .env.example. Never commit RIOT_API_KEY.
npm run stats
```

- Platform default **`na1`** → regional host **`americas`**
- Queue **1100** (ranked), set **18**
- Ladder: Challenger + Grandmaster + Master, top **35** LP, **12** match ids each
- Rate limit: stay under **20 req/s** and **100 / 2 min**; honor `429 Retry-After`
- Dev keys expire every **24 hours**. Regenerate on [developer.riotgames.com](https://developer.riotgames.com/) Getting Started. Do **not** Register Product for this.
- Map `character_id` / `itemNames` onto catalog ids (`DA_18_*`, `DA_Artifact_*`). Skip components.
- Aggregate unit+item: `n`, `avgPlace`, `delta` vs that unit’s baseline.

**Current snapshot** (committed in 0.1.4): `fetchedAt` 2026-09-05T19:13:25Z, **271** ranked games, **35** players, **65** units. Artifacts rarely hit `n = 20` at this size — that is expected, not a bug.

No GitHub Action for stats yet. That needs a **production** key. Do not put the key in Actions, the exe, or a commit.

## Important files

| Path | Role |
|---|---|
| `src/data/meta.ts` | Curated comps, unused holder notes, `META_PATCH` |
| `src/data/stats.json` | NA ladder snapshot the overlay reads |
| `src/data/set.json` | CDragon extract |
| `src/lib/meta.ts` | `guideForChampion`, `ITEM_GUIDE` (Riot first, else boards) |
| `src/lib/riot-stats.ts` | Snapshot types, captions, formatting |
| `scripts/fetch-stats.mjs` | Riot ingest |
| `scripts/lib/tft-stats.mjs` | Map + aggregate (unit-tested) |
| `scripts/extract-set.mjs` | CDragon → `set.json` (includes `DA_Artifact_*`) |
| `src/components/PinStrip.tsx` | Board strip + rec expand / remove |
| `src/components/UnitBrowser.tsx` | Units recs |
| `src/components/ItemForge.tsx` | Items accordion + forge |
| `src/components/RecRow.tsx` | Item row + optional stat line |
| `electron/main.cjs`, `electron/updater.cjs` | Overlay shell + electron-updater |
| `electron-builder.yml` | One-click NSIS, public GitHub provider |
| `.env` / `.env.example` | Local key only |

## Agent / PR conventions

- Feature branches: `cursor/<descriptive-name>-14b0`, lowercase
- Default base: `main`
- Draft PRs unless asked otherwise. User often merges quickly so they can test auto-update.
- Do not estimate calendar time. Do not scrape community stat sites.
- Do not print or commit `RGAPI-` keys. `.env` must stay gitignored.

## Open follow-ups

- Larger / fresher `stats.json` (re-run `npm run stats` when the 24h key is valid). Artifacts need more games to clear `n = 20`.
- Production Riot key + optional nightly Action — only after they have a production key.
- Patch 18.1d curated comps will go stale; refresh `RAW_META_COMPS` from public guides, not scraped MetaTFT HTML.
- New set: `npm run extract`, bump set number in the stats script, new curated comps.

TactiDesk isn’t endorsed by Riot Games.
