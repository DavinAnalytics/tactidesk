#!/usr/bin/env node
/**
 * Download Community Dragon TFT data and write a slim current-set snapshot.
 * Source: https://raw.communitydragon.org/latest/cdragon/tft/en_us.json
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CDRAGON_URL = "https://raw.communitydragon.org/latest/cdragon/tft/en_us.json";
const SET_NUMBER = 18;
const MUTATOR = "TFTSet18";
const SET_NAME = "Enchanted Wilds";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "data", "set.json");

function iconUrl(path) {
  if (!path) return "";
  const normalized = String(path).toLowerCase().replace(/\.tex$/i, ".png");
  return `https://raw.communitydragon.org/latest/game/${normalized}`;
}

function stripTags(html) {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?row>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function substitute(desc, vars) {
  if (!desc) return "";
  let text = desc;
  for (const [key, value] of Object.entries(vars || {})) {
    if (key.startsWith("{")) continue;
    const pretty =
      typeof value === "number"
        ? Number.isInteger(value)
          ? String(value)
          : String(Math.round(value * 1000) / 1000)
        : String(value);
    text = text.replaceAll(`@${key}@`, pretty);
    text = text.replaceAll(`@${key}*100@`, String(Math.round(Number(value) * 100)));
  }
  text = text.replace(/@[^@]+@/g, "?");
  return stripTags(text);
}

function augmentTier(icon) {
  const file = (icon || "").toLowerCase().split("/").pop() || "";
  if (file.includes("missing-t3") || /(?:^|_|-)iii\.tex$/.test(file) || file.includes("-iii.")) return 3;
  if (file.includes("missing-t2") || /(?:^|_|-)ii\.tex$/.test(file) || file.includes("-ii.")) return 2;
  if (file.includes("missing-t1") || /(?:^|_|-)i\.tex$/.test(file) || file.includes("-i.")) return 1;
  if (/3\.tex$/.test(file)) return 3;
  if (/2\.tex$/.test(file)) return 2;
  return 1;
}

function isShopChampion(champ) {
  const traits = champ.traits || [];
  const cost = champ.cost ?? 99;
  if (!champ.name || !champ.apiName) return false;
  if (!traits.length) return false;
  if (cost < 1 || cost > 7) return false;
  return true;
}

function abilitySummary(ability) {
  if (!ability) return { name: "", text: "", stars: [] };
  const vars = {};
  const stars = [];
  for (const entry of ability.variables || []) {
    const values = entry.value || [];
    const one = values[1];
    const two = values[2];
    const three = values[3];
    if (one != null) vars[entry.name] = one;
    if ([one, two, three].some((v) => v != null)) {
      stars.push({
        name: entry.name,
        values: [one, two, three].map((v) => (v == null ? null : Math.round(v * 1000) / 1000)),
      });
    }
  }
  return {
    name: ability.name || "",
    text: substitute(ability.desc, vars),
    stars,
  };
}

async function main() {
  console.log("Downloading Community Dragon TFT dump…");
  const res = await fetch(CDRAGON_URL);
  if (!res.ok) throw new Error(`CDragon fetch failed: ${res.status}`);
  const data = await res.json();

  const setData = (data.setData || []).find((s) => s.mutator === MUTATOR && s.number === SET_NUMBER);
  if (!setData) throw new Error(`Could not find ${MUTATOR}`);

  const itemsByApi = Object.fromEntries((data.items || []).map((item) => [item.apiName, item]));

  const champions = (setData.champions || [])
    .filter(isShopChampion)
    .map((champ) => ({
      id: champ.apiName,
      name: champ.name,
      cost: champ.cost,
      role: champ.role || "",
      traits: champ.traits || [],
      icon: iconUrl(champ.squareIcon || champ.icon),
      splash: iconUrl(champ.icon),
      stats: champ.stats || {},
      ability: abilitySummary(champ.ability),
    }))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

  const traits = (setData.traits || [])
    .filter((trait) => trait.name && trait.apiName)
    .map((trait) => ({
      id: trait.apiName,
      name: trait.name,
      icon: iconUrl(trait.icon),
      text: substitute(
        trait.desc,
        Object.assign({}, ...(trait.effects || []).map((effect) => effect.variables || {})),
      ),
      breakpoints: (trait.effects || []).map((effect) => ({
        min: effect.minUnits,
        max: effect.maxUnits,
        style: effect.style,
      })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const componentIds = new Set(
    (setData.items || []).filter((id) => id.startsWith("DA_Component_")),
  );

  const items = [];
  for (const apiName of setData.items || []) {
    const raw = itemsByApi[apiName];
    if (!raw || !raw.name) continue;
    if (raw.isAugment) continue;
    const composition = raw.composition || [];
    const isComponent = componentIds.has(apiName);
    const isCrafted = composition.length === 2;
    const isArtifact =
      apiName.startsWith("DA_Artifact_") && !/Artifactinate/i.test(apiName);
    if (!isComponent && !isCrafted && !isArtifact) continue;
    items.push({
      id: apiName,
      name: raw.name,
      icon: iconUrl(raw.icon),
      text: substitute(raw.desc, raw.effects),
      composition,
      unique: Boolean(raw.unique),
      kind: isComponent
        ? "component"
        : isArtifact
          ? "artifact"
          : apiName.includes("Emblem")
            ? "emblem"
            : "completed",
    });
  }

  const augments = (setData.augments || [])
    .map((apiName) => itemsByApi[apiName])
    .filter((raw) => raw && raw.name && !String(raw.icon || "").includes("missing-t"))
    .map((raw) => ({
      id: raw.apiName,
      name: raw.name,
      icon: iconUrl(raw.icon),
      text: substitute(raw.desc, raw.effects),
      tier: augmentTier(raw.icon),
      traits: raw.associatedTraits || [],
    }))
    .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));

  const snapshot = {
    set: SET_NUMBER,
    mutator: MUTATOR,
    name: SET_NAME,
    source: CDRAGON_URL,
    extractedAt: new Date().toISOString(),
    champions,
    traits,
    items,
    augments,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(snapshot));
  console.log(
    `Wrote ${OUT}\n  ${champions.length} champions, ${traits.length} traits, ${items.length} items, ${augments.length} augments`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
