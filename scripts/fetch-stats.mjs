#!/usr/bin/env node
/**
 * Pull recent NA (or other platform) ranked TFT matches from the Riot API
 * and write src/data/stats.json. The overlay reads that file; the key never
 * ships in the Electron build.
 *
 *   RIOT_API_KEY=RGAPI-... npm run stats
 *
 * Development keys expire every 24 hours. Do not commit the key.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_MIN_SAMPLE,
  DEFAULT_SET,
  RANKED_TFT_QUEUE,
  addMatch,
  buildCatalogMaps,
  createAccumulator,
  emptySnapshot,
  finalizeSnapshot,
  regionForPlatform,
} from "./lib/tft-stats.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SET_PATH = join(ROOT, "src", "data", "set.json");

function loadDotEnv() {
  const path = join(ROOT, ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function flag(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  if (!next || next.startsWith("--")) return true;
  return next;
}

function printHelp() {
  console.log(`Usage: RIOT_API_KEY=RGAPI-... npm run stats -- [options]

Pull Challenger / Grandmaster / Master ranked TFT matches and write a
unit+item placement snapshot for the overlay.

Options
  --platform <id>           Platform routing value (default: na1)
  --region <id>             Override regional host (americas / europe / asia / sea)
  --max-players <n>         Ladder entries to take, LP descending (default: 35)
  --matches-per-player <n>  Recent match ids per player (default: 12)
  --min-sample <n>          Overlay hides pairs below this n (default: 20)
  --set <n>                 TFT set number (default: 18)
  --queue <n>               Queue id (default: 1100 ranked)
  --out <path>              Output JSON (default: src/data/stats.json)
  --help                    Show this text

Environment
  RIOT_API_KEY              Required. Development keys last 24 hours.
  RIOT_PLATFORM             Same as --platform
  RIOT_REGION               Same as --region

The script stays under the development-key budget (20 req/s, 100 / 2 min)
and honors 429 Retry-After. A first NA pass at the defaults is tens of
minutes, not hours.

Do not commit the key. A .env file in the repo root is read if present
and is gitignored.
`);
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

class RiotLimiter {
  constructor() {
    this.last = 0;
    this.window = [];
    this.minGap = 1200;
    this.maxPerWindow = 90;
    this.windowMs = 120_000;
  }

  async take() {
    for (;;) {
      const now = Date.now();
      this.window = this.window.filter((t) => now - t < this.windowMs);
      const gapWait = Math.max(0, this.minGap - (now - this.last));
      const windowWait =
        this.window.length >= this.maxPerWindow ? this.windowMs - (now - this.window[0]) + 25 : 0;
      const wait = Math.max(gapWait, windowWait);
      if (wait <= 0) {
        this.last = now;
        this.window.push(now);
        return;
      }
      await sleep(wait);
    }
  }
}

async function riotGet(url, apiKey, limiter) {
  let lastError = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    await limiter.take();
    const res = await fetch(url, { headers: { "X-Riot-Token": apiKey } });
    if (res.status === 429) {
      const retry = Number(res.headers.get("Retry-After") || 2);
      console.warn(`Rate limited (429). Waiting ${retry + 1}s…`);
      await sleep((retry + 1) * 1000);
      continue;
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "Riot rejected the key (401/403). Development keys expire every 24 hours — regenerate one at https://developer.riotgames.com/ and run again.",
      );
    }
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.text();
      lastError = new Error(`Riot ${res.status} ${url}: ${body.slice(0, 200)}`);
      if (res.status >= 500) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw lastError;
    }
    return res.json();
  }
  throw lastError || new Error(`Gave up on ${url}`);
}

function uniquePlayers(entries) {
  const seen = new Set();
  const players = [];
  for (const entry of entries) {
    const puuid = entry.puuid;
    if (!puuid || seen.has(puuid)) continue;
    seen.add(puuid);
    players.push({
      puuid,
      leaguePoints: Number(entry.leaguePoints) || 0,
      rank: entry.rank || "",
    });
  }
  players.sort((a, b) => b.leaguePoints - a.leaguePoints);
  return players;
}

async function main() {
  loadDotEnv();
  if (flag("--help", false) === true) {
    printHelp();
    process.exit(0);
  }

  const apiKey = (process.env.RIOT_API_KEY || "").trim();
  if (!apiKey) {
    console.error(`Missing RIOT_API_KEY.

1. Open https://developer.riotgames.com/
2. Open your app → Getting Started → Regenerate API Key
   (development keys expire every 24 hours; do not use Register Product for this)
3. Run:

   RIOT_API_KEY=RGAPI-... RIOT_PLATFORM=na1 npm run stats

Put the key in a local .env if you prefer. Never commit it.
`);
    process.exit(2);
  }

  const platform = String(flag("--platform", process.env.RIOT_PLATFORM || "na1")).toLowerCase();
  const region = String(flag("--region", process.env.RIOT_REGION || regionForPlatform(platform) || "")).toLowerCase();
  if (!region) {
    console.error(`Unknown platform "${platform}". Use na1, euw1, kr, … or pass --region americas.`);
    process.exit(2);
  }

  const maxPlayers = Math.max(1, Number(flag("--max-players", 35)) || 35);
  const matchesPerPlayer = Math.max(1, Number(flag("--matches-per-player", 12)) || 12);
  const minSample = Math.max(1, Number(flag("--min-sample", DEFAULT_MIN_SAMPLE)) || DEFAULT_MIN_SAMPLE);
  const setNumber = Math.max(1, Number(flag("--set", DEFAULT_SET)) || DEFAULT_SET);
  const queueId = Math.max(1, Number(flag("--queue", RANKED_TFT_QUEUE)) || RANKED_TFT_QUEUE);
  const outPath = resolve(String(flag("--out", join(ROOT, "src", "data", "stats.json"))));

  const setData = JSON.parse(readFileSync(SET_PATH, "utf8"));
  const maps = buildCatalogMaps(setData);
  const limiter = new RiotLimiter();
  const platformHost = `https://${platform}.api.riotgames.com`;
  const regionalHost = `https://${region}.api.riotgames.com`;

  console.log(`Platform ${platform} → ${region}. Cap ${maxPlayers} players × ${matchesPerPlayer} ids.`);

  const tiers = ["challenger", "grandmaster", "master"];
  const ladder = [];
  for (const tier of tiers) {
    const data = await riotGet(`${platformHost}/tft/league/v1/${tier}`, apiKey, limiter);
    const entries = data?.entries || [];
    console.log(`  ${tier}: ${entries.length} entries`);
    ladder.push(...entries);
  }

  const players = uniquePlayers(ladder).slice(0, maxPlayers);
  if (!players.length) {
    console.error("No ladder entries had a puuid. The league payload may have changed.");
    process.exit(1);
  }
  console.log(`Using ${players.length} players (highest LP).`);

  const matchIds = [];
  const seenIds = new Set();
  for (let i = 0; i < players.length; i++) {
    const puuid = players[i].puuid;
    const ids = await riotGet(
      `${regionalHost}/tft/match/v1/matches/by-puuid/${puuid}/ids?start=0&count=${matchesPerPlayer}`,
      apiKey,
      limiter,
    );
    for (const id of ids || []) {
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      matchIds.push(id);
    }
    if ((i + 1) % 10 === 0 || i + 1 === players.length) {
      console.log(`  match ids ${i + 1}/${players.length} → ${matchIds.length} unique`);
    }
  }

  const acc = createAccumulator();
  const filter = { queueId, setNumber };
  let skipped = 0;
  for (let i = 0; i < matchIds.length; i++) {
    const match = await riotGet(`${regionalHost}/tft/match/v1/matches/${matchIds[i]}`, apiKey, limiter);
    if (!match || !addMatch(acc, match, maps, filter)) skipped += 1;
    if ((i + 1) % 10 === 0 || i + 1 === matchIds.length) {
      console.log(`  matches ${i + 1}/${matchIds.length} (kept ${acc.matches}, skipped ${skipped})`);
    }
  }

  const snapshot = acc.matches
    ? finalizeSnapshot(acc, {
        platform,
        region,
        queueId,
        setNumber,
        minSample,
        players: players.length,
        fetchedAt: new Date().toISOString(),
      })
    : emptySnapshot({ platform, region, queueId, setNumber, minSample, fetchedAt: new Date().toISOString() });

  if (!acc.matches) snapshot.players = players.length;

  writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  const pairs = snapshot.units.reduce((sum, unit) => sum + unit.items.length, 0);
  console.log(
    `Wrote ${outPath}\n  ${snapshot.matches} ranked set-${setNumber} games, ${snapshot.units.length} units, ${pairs} item pairs.\n  Overlay hides pairs with n < ${minSample}.`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
