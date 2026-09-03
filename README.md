# TactiDesk

A personal Teamfight Tactics overlay. Same job as the MetaTFT Overwolf app — comps, items, units, augments on a second layer — without ads, account gates, or live-game coaching.

It is a **static reference**. You write your own boards before a match and pin them. It does not scout the lobby, read the live client, estimate win chance, or tell you what to pick.

## What it is

- Overlay or browser panel for **Set 18: Enchanted Wilds**
- Your pinned comps, with unit portraits and item slots
- Item forge (component + component)
- Unit / trait / augment encyclopedia from [Community Dragon](https://www.communitydragon.org/)
- Personal augment notes stored only on this machine
- Shop-odds table (pre-game reference)
- Hide / show with `Ctrl+Shift+T`
- No ads, no telemetry, no Overwolf

## What it is not

Riot’s TFT policy allows overlays that show **data available before the game**. It does not allow:

- Lobby scouting or opponent board tracking
- Live win-chance or “pick this augment now”
- Recommendations that change from the current game state

Those MetaTFT-style features are omitted on purpose. If you want post-game review of *your* matches, use the official Riot TFT API with a personal key — that belongs in a separate tool, not in the overlay.

Play TFT in **borderless windowed**. A normal always-on-top window sits on top; it does not inject into the game.

## Run it

```bash
npm install
npm test
npm run dev
```

Open `http://127.0.0.1:5173` in a browser (second monitor) or run the overlay shell:

```bash
npm run dev:electron
```

Refresh set data after a patch:

```bash
npm run extract
```

Boards export/import as JSON from the Comps tab.

## Policy note

Register a personal app on the [Riot Developer Portal](https://developer.riotgames.com/) if you ship this beyond your own machine.

TactiDesk isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends / Teamfight Tactics.
