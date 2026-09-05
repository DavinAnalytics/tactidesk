/**
 * Map Riot TFT match payloads onto the Community Dragon catalog and
 * aggregate unit+item placement. Used by fetch-stats.mjs and unit tests.
 */

export const RANKED_TFT_QUEUE = 1100;
export const DEFAULT_SET = 18;
export const DEFAULT_MIN_SAMPLE = 20;

export const PLATFORM_REGIONS = {
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
  kr: "asia",
  jp1: "asia",
  oc1: "sea",
  ph2: "sea",
  sg2: "sea",
  th2: "sea",
  tw2: "sea",
  vn2: "sea",
};

export function keyName(value) {
  return String(value)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function regionForPlatform(platform) {
  return PLATFORM_REGIONS[String(platform || "").toLowerCase()] || null;
}

export function emptySnapshot(opts = {}) {
  const platform = opts.platform || "na1";
  return {
    version: 1,
    platform,
    region: opts.region || regionForPlatform(platform) || "americas",
    queueId: opts.queueId ?? RANKED_TFT_QUEUE,
    setNumber: opts.setNumber ?? DEFAULT_SET,
    minSample: opts.minSample ?? DEFAULT_MIN_SAMPLE,
    fetchedAt: opts.fetchedAt ?? null,
    matches: 0,
    players: 0,
    units: [],
  };
}

export function buildCatalogMaps(setData) {
  const champExact = new Map();
  const champKeys = new Map();
  const itemExact = new Map();
  const itemKeys = new Map();
  const preferredByName = new Map();

  for (const champ of setData.champions || []) {
    champExact.set(champ.id, champ);
    for (const key of championKeys(champ.id, champ.name)) addUnique(champKeys, key, champ);
  }

  for (const item of setData.items || []) {
    const nameKey = keyName(item.name);
    const prev = preferredByName.get(nameKey);
    if (!prev || (item.id.startsWith("DA_") && !prev.id.startsWith("DA_"))) {
      preferredByName.set(nameKey, item);
    }
  }

  for (const item of setData.items || []) {
    const preferred = preferredByName.get(keyName(item.name)) || item;
    itemExact.set(item.id, preferred);
    for (const key of itemKeysFor(item.id, item.name)) addUnique(itemKeys, key, preferred);
  }

  return { champExact, champKeys, itemExact, itemKeys };
}

export function mapChampion(characterId, maps) {
  if (!characterId || !maps) return null;
  const exact = maps.champExact.get(characterId);
  if (exact) return exact;
  for (const key of championKeys(characterId)) {
    const found = maps.champKeys.get(key);
    if (found) return found;
  }
  return null;
}

export function mapItem(itemName, maps) {
  if (!itemName || !maps) return null;
  const exact = maps.itemExact.get(itemName);
  if (exact) return exact;
  for (const key of itemKeysFor(itemName)) {
    const found = maps.itemKeys.get(key);
    if (found) return found;
  }
  return null;
}

export function matchInfo(match) {
  return match?.info || match || {};
}

export function isEligibleMatch(match, opts = {}) {
  const info = matchInfo(match);
  const queueId = info.queue_id ?? info.queueId;
  const setNumber = info.tft_set_number ?? info.tftSetNumber;
  const wantedQueue = opts.queueId ?? RANKED_TFT_QUEUE;
  const wantedSet = opts.setNumber ?? DEFAULT_SET;
  return queueId === wantedQueue && setNumber === wantedSet;
}

export function createAccumulator() {
  return {
    matches: 0,
    units: new Map(),
  };
}

export function addMatch(acc, match, maps, opts = {}) {
  if (!isEligibleMatch(match, opts)) return false;
  const info = matchInfo(match);
  const participants = info.participants || [];
  let used = false;
  for (const participant of participants) {
    const placement = Number(participant.placement);
    if (!Number.isFinite(placement) || placement < 1) continue;
    const seenUnits = new Set();
    for (const unit of participant.units || []) {
      const champ = mapChampion(unit.character_id || unit.characterId, maps);
      if (!champ) continue;
      used = true;
      if (!seenUnits.has(champ.id)) {
        seenUnits.add(champ.id);
        const row = unitRow(acc, champ.id);
        row.n += 1;
        row.placeSum += placement;
      }
      const seenItems = new Set();
      for (const raw of unit.itemNames || unit.items || []) {
        const itemName = typeof raw === "string" ? raw : "";
        if (!itemName) continue;
        const item = mapItem(itemName, maps);
        if (!item || item.kind === "component") continue;
        if (seenItems.has(item.id)) continue;
        seenItems.add(item.id);
        const pair = pairRow(unitRow(acc, champ.id), item);
        pair.n += 1;
        pair.placeSum += placement;
      }
    }
  }
  if (used) acc.matches += 1;
  return used;
}

export function finalizeSnapshot(acc, opts = {}) {
  const snapshot = emptySnapshot(opts);
  snapshot.fetchedAt = opts.fetchedAt ?? new Date().toISOString();
  snapshot.matches = acc.matches;
  snapshot.players = opts.players ?? 0;
  const units = [];
  for (const [championId, row] of acc.units) {
    const avgPlace = round2(row.placeSum / row.n);
    const items = [];
    for (const [itemId, pair] of row.items) {
      items.push({
        itemId,
        kind: pair.kind,
        n: pair.n,
        avgPlace: round2(pair.placeSum / pair.n),
        delta: round2(pair.placeSum / pair.n - avgPlace),
      });
    }
    items.sort(compareItemStat);
    units.push({
      championId,
      n: row.n,
      avgPlace,
      items,
    });
  }
  units.sort((a, b) => b.n - a.n || a.championId.localeCompare(b.championId));
  snapshot.units = units;
  return snapshot;
}

export function itemsForChampion(snapshot, championId, kind, limit = 6) {
  if (!snapshot) return [];
  const minSample = snapshot.minSample ?? DEFAULT_MIN_SAMPLE;
  const unit = (snapshot.units || []).find((row) => row.championId === championId);
  if (!unit) return [];
  return unit.items
    .filter((item) => item.kind === kind && item.n >= minSample)
    .sort(compareItemStat)
    .slice(0, limit);
}

export function holdersForItem(snapshot, itemId) {
  if (!snapshot) return [];
  const minSample = snapshot.minSample ?? DEFAULT_MIN_SAMPLE;
  const holders = [];
  for (const unit of snapshot.units || []) {
    const item = unit.items.find((entry) => entry.itemId === itemId);
    if (!item || item.n < minSample) continue;
    holders.push({
      championId: unit.championId,
      n: item.n,
      avgPlace: item.avgPlace,
      delta: item.delta,
    });
  }
  holders.sort((a, b) => a.delta - b.delta || b.n - a.n);
  return holders;
}

export function formatItemStat(row) {
  if (!row || row.n == null || row.avgPlace == null || row.delta == null) return "";
  const place = Number(row.avgPlace).toFixed(2);
  const delta = formatDelta(row.delta);
  return `n=${row.n} · ${place} · ${delta}`;
}

export function formatDelta(delta) {
  const value = Number(delta);
  const body = Math.abs(value).toFixed(2);
  if (value > 0) return `+${body}`;
  if (value < 0) return `−${body}`;
  return "0.00";
}

export function compareItemStat(a, b) {
  return a.delta - b.delta || b.n - a.n || a.itemId.localeCompare(b.itemId);
}

function unitRow(acc, championId) {
  let row = acc.units.get(championId);
  if (!row) {
    row = { n: 0, placeSum: 0, items: new Map() };
    acc.units.set(championId, row);
  }
  return row;
}

function pairRow(unit, item) {
  let pair = unit.items.get(item.id);
  if (!pair) {
    pair = { n: 0, placeSum: 0, kind: item.kind };
    unit.items.set(item.id, pair);
  }
  return pair;
}

function addUnique(map, key, value) {
  if (!key) return;
  if (map.has(key) && map.get(key) !== value) {
    map.set(key, null);
    return;
  }
  if (!map.has(key)) map.set(key, value);
}

function championKeys(id, name) {
  const keys = new Set();
  if (name) keys.add(keyName(name));
  if (!id) return [...keys].filter(Boolean);
  keys.add(keyName(id));
  const stripped = String(id).replace(/^(DA|TFT)_?\d*_/i, "");
  keys.add(keyName(stripped));
  keys.add(keyName(stripped.replace(/18/g, "")));
  keys.add(keyName(stripped.replace(/_(AD|AP|Base)$/i, "")));
  keys.add(keyName(stripped.replace(/18/g, "").replace(/_(AD|AP|Base)$/i, "")));
  return [...keys].filter(Boolean);
}

function itemKeysFor(id, name) {
  const keys = new Set();
  if (name) keys.add(keyName(name));
  if (!id) return [...keys].filter(Boolean);
  keys.add(keyName(id));
  const stripped = String(id)
    .replace(/^TFT\d*_Item_Artifact_/i, "")
    .replace(/^TFT_Item_Artifact_/i, "")
    .replace(/^DA_Artifact_/i, "")
    .replace(/^TFT\d*_Item_/i, "")
    .replace(/^TFT_Item_/i, "")
    .replace(/^DA_18_Emblem/i, "Emblem")
    .replace(/^DA_18_/i, "")
    .replace(/^DA_/i, "")
    .replace(/^TFT\d*_/i, "");
  keys.add(keyName(stripped));
  return [...keys].filter(Boolean);
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}
