# TactiDesk

A personal Teamfight Tactics overlay. Same job as the MetaTFT Overwolf app — comps, items, units, augments on a second layer — without ads, account gates, or live-game coaching.

It is a **static reference**. You write your own boards before a match and pin them. It does not scout the lobby, read the live client, estimate win chance, or tell you what to pick.

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

The first setup file you already installed does not include this updater. Install **0.1.1 or newer** once. After that, you should not need to run a setup `.exe` again.

The repository is public, so updates do not need a GitHub token.

To ship a change to an already-installed copy: bump `version` in `package.json`, merge to `main`, and the Windows workflow publishes `v<version>`. Electron only updates when that version number goes up.

## What it is

- Overlay or browser panel for **Set 18: Enchanted Wilds**
- Meta comps tier list (S–C) you can pin, plus your own boards
- Items page with usual holders for completed items, artifacts, and emblems
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

The Items tab lists completed items with the units that take them on those boards. Click an item to see holders and which comps use that pairing.

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

## Policy note

Register a personal app on the [Riot Developer Portal](https://developer.riotgames.com/) if you ship this beyond your own machine.

TactiDesk isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends / Teamfight Tactics.
