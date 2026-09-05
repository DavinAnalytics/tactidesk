# TactiDesk

A personal Teamfight Tactics overlay. Same job as the MetaTFT Overwolf app — comps, items, units, augments on a second layer — without ads, account gates, or live-game coaching.

It is a **static reference**. You write your own boards before a match and pin them. It does not scout the lobby, read the live client, estimate win chance, or tell you what to pick.

**Current release: [0.1.4](https://github.com/DavinAnalytics/tactidesk/releases/tag/v0.1.4)** (2026-09-05). Header shows Set 18 · Enchanted Wilds · Patch 18.1d · NA 271 games. Session handoff for the next agent: [AGENTS.md](./AGENTS.md).

## Install on Windows

You do not need Node.js, Git, or Overwolf.

1. Download **TactiDesk-Setup.exe** from the [latest release](https://github.com/DavinAnalytics/tactidesk/releases/latest).
2. Double-click it. If SmartScreen appears, click **More info** → **Run anyway**.
3. TactiDesk installs for your user account, adds Start Menu and Desktop shortcuts, and opens itself.
4. In League/TFT, set the game to **borderless windowed**.
5. Hide or show the overlay with **Ctrl+Shift+T**.

Uninstall from Windows Settings → Apps, or from the Start Menu shortcut folder.

If a release is not up yet, open the [Windows installer workflow](https://github.com/DavinAnalytics/tactidesk/actions/workflows/windows-installer.yml), pick the latest successful run, and download the **TactiDesk-Windows-Setup** artifact.

## Updates

Installed copies check GitHub Releases on launch and every few hours. When a newer version is published, TactiDesk downloads it in the background. Click **Restart** when the banner says the update is ready, or just quit the app — it installs on exit. It will not force a restart during a match.

The first setup file (0.1.0) did not include this updater. Anyone still on that build should install **0.1.1 or newer** once. After that, do not run a setup `.exe` again — 0.1.4 is an in-app update.

The repository is public, so updates do not need a GitHub token.

To ship a change to an already-installed copy: bump `version` in `package.json`, merge to `main`, and the Windows workflow publishes `v<version>`. Electron only updates when that version number goes up.

## What it is

- Overlay or browser panel for **Set 18: Enchanted Wilds**
- Meta comps tier list (S–C) you can pin, plus your own boards
- Items page with holders from your curated boards, plus NA ladder placement when `src/data/stats.json` has been refreshed from the Riot TFT Match API
- Item forge (component + component)
- Unit / trait / augment encyclopedia from [Community Dragon](https://www.communitydragon.org/)
- Personal augment notes stored only on this machine
- Hide / show with `Ctrl+Shift+T`
- No ads, no telemetry, no Overwolf

## What it is not

Riot’s TFT policy allows overlays that show **data available before the game**. It does not allow:

- Lobby scouting or opponent board tracking
- Live win-chance or “pick this augment now”
- Recommendations that change from the current game state

The Comps tab opens on a **patch 18.1d snapshot** of common ladder lines (Primal Malphite, Flora Malphite, Solar Kayle, and so on). It is a curated static list, not MetaTFT’s live table and not a scraped copy of their stats. Pin a board before the game; it does not update from the live match.

The Items tab lists completed items with the units that take them on those boards. After you refresh ladder stats, it shows who actually held the item in recent ranked games (`n`, average place, delta vs that unit’s baseline). It does not guess artifacts from item text.

Play TFT in **borderless windowed**. A normal always-on-top window sits on top; it does not inject into the game.

## Run from source

```bash
npm install
npm test
npm run dev
```

Open `http://127.0.0.1:5173` in a browser (second monitor) or run the overlay shell:

```bash
npm run dev:electron
```

Build the Windows installer (on Windows, or in GitHub Actions):

```bash
npm run dist:win
```

The setup file lands in `release/TactiDesk-Setup-<version>.exe`.

Refresh set data after a patch:

```bash
npm run extract
```

Boards export/import as JSON from the Comps tab.

## Refresh NA ladder stats

The overlay never calls Riot. A local script writes `src/data/stats.json`; the app just reads that file.

Development keys last **24 hours**. Open [developer.riotgames.com](https://developer.riotgames.com/), regenerate the key on Getting Started (do not Register Product for this), then:

```bash
RIOT_API_KEY=RGAPI-... RIOT_PLATFORM=na1 npm run stats
```

Or copy `.env.example` to `.env` and put the key there. `.env` is gitignored.

Defaults take Challenger + Grandmaster + Master, keep the top 35 by LP, and pull 12 recent match ids each. The script stays under the development-key budget (20 requests/s, 100 / 2 minutes) and honors `429 Retry-After`. A first useful NA pass is tens of minutes.

**0.1.4 already includes a snapshot:** 271 ranked NA games (fetched 2026-09-05). Units and Board show ladder pairs when `n ≥ 20`, otherwise items from the curated boards only — no guessed artifacts. Example line: `n=181 · 4.39 · −0.22` (games, average place, delta vs that unit’s baseline). Negative delta is better. Artifacts rarely clear `n = 20` at this sample size; empty artifact recs are correct.

Do not put the key in the Electron app, GitHub Actions, or a commit. A production key + nightly Action can wait until you have one.

## Policy note

A development key is enough to refresh `stats.json` on your machine. Register a personal app on the [Riot Developer Portal](https://developer.riotgames.com/) if you want a production key for unattended jobs.

TactiDesk isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends / Teamfight Tactics.
