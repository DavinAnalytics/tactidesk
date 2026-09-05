import type { Champion, Comp, CompUnit } from "./types";

export type MetaTier = "S" | "A" | "B" | "C";

export type RawMetaUnit = {
  champion: string;
  items: string[];
  stars?: 1 | 2 | 3;
};

export type RawMetaComp = {
  id: string;
  name: string;
  tier: MetaTier;
  style: string;
  notes: string;
  units: RawMetaUnit[];
};

export type ResolvedMetaUnit = {
  championId: string;
  champion: Champion;
  itemIds: string[];
  stars: 1 | 2 | 3;
};

export type ResolvedMetaComp = {
  id: string;
  name: string;
  tier: MetaTier;
  style: string;
  notes: string;
  units: ResolvedMetaUnit[];
};

export type ItemHolder = {
  championId: string;
  comps: string[];
  n?: number;
  avgPlace?: number;
  delta?: number;
  source?: "riot" | "board" | "notes";
};

/** Curated Set 18 snapshot (patch 18.1d). Not live match stats. */
export const META_PATCH = "18.1d";
export const META_SOURCE = "Public Set 18 guides, curated for personal reference.";

export const RAW_META_COMPS: RawMetaComp[] = [
  {
    id: "primal-malphite",
    name: "Primal Malphite",
    tier: "S",
    style: "Fast 8",
    notes: "Two AD carries on Nidalee and Sivir. Tank Malphite. Roll 4-2 for Malphite 2 and Sentinel before the lobby does.",
    units: [
      { champion: "Nidalee", items: ["Infinity Edge", "Spear of Shojin", "Hand Of Justice"] },
      { champion: "Sivir", items: ["Infinity Edge", "Striker's Flail", "Red Buff"] },
      { champion: "Malphite", items: ["Gargoyle Stoneplate", "Spirit Visage", "Crownguard"] },
      { champion: "Sentinel", items: ["Protector's Vow", "Adaptive Helm"] },
      { champion: "Vi", items: [] },
      { champion: "Krug", items: [] },
      { champion: "Rek'Sai", items: [] },
      { champion: "Azir", items: [] },
    ],
  },
  {
    id: "flora-malphite",
    name: "Flora Malphite",
    tier: "S",
    style: "Fast 8",
    notes: "Keep Malphite alive so Soraka and Zyra scale. Core five: Soraka, Zyra, Malphite, Azir, Fiddlesticks.",
    units: [
      { champion: "Soraka", items: ["Rabadon's Deathcap", "Nashor's Tooth", "Adaptive Helm"] },
      { champion: "Zyra", items: ["Jeweled Gauntlet", "Void Staff", "Spear of Shojin"] },
      { champion: "Malphite", items: ["Gargoyle Stoneplate", "Crownguard", "Spirit Visage"] },
      { champion: "Azir", items: [] },
      { champion: "Fiddlesticks", items: [] },
      { champion: "Kennen", items: [] },
      { champion: "Karma", items: [] },
      { champion: "Yorick", items: [] },
    ],
  },
  {
    id: "kayle-reroll",
    name: "Solar Kayle",
    tier: "S",
    style: "1-cost reroll",
    notes: "Three-star Kayle, Xayah, and Ornn. Rageblade plus AP on Kayle. Slow-roll level 5 after a 3-1 cleanup.",
    units: [
      { champion: "Kayle", items: ["Guinsoo's Rageblade", "Jeweled Gauntlet", "Rabadon's Deathcap"], stars: 3 },
      { champion: "Xayah", items: ["Guinsoo's Rageblade", "Red Buff"], stars: 3 },
      { champion: "Ornn", items: ["Warmogs Armor", "Gargoyle Stoneplate", "Spirit Visage"], stars: 3 },
      { champion: "Rakan", items: ["Protector's Vow"], stars: 3 },
      { champion: "Leona", items: [], stars: 3 },
      { champion: "Sejuani", items: [] },
      { champion: "Hecarim", items: [] },
    ],
  },
  {
    id: "dragon-fast-9",
    name: "Dragon Fast 9",
    tier: "A",
    style: "Fast 9",
    notes: "Only if you can hit 9. Elder Dragon 2 is the spike. Guinsoo's on Draven if you play him.",
    units: [
      { champion: "Elder Dragon", items: ["Infinity Edge", "Hand Of Justice", "Sterak's Gage"] },
      { champion: "Draven", items: ["Guinsoo's Rageblade", "Kraken's Fury", "Deathblade"] },
      { champion: "Maokai", items: ["Warmogs Armor", "Gargoyle Stoneplate"] },
      { champion: "Sentinel", items: ["Protector's Vow", "Adaptive Helm"] },
      { champion: "Taric", items: [] },
      { champion: "Krug", items: [] },
      { champion: "Cinderling", items: [] },
    ],
  },
  {
    id: "adaptor-reroll",
    name: "Adaptor Reroll",
    tier: "A",
    style: "3-cost reroll",
    notes: "Master Yi 3 is required. AP Yi wants Rageblade; Rengar wants Rageblade plus Edge of Night.",
    units: [
      { champion: "Master Yi", items: ["Guinsoo's Rageblade", "Edge of Night", "Titan's Resolve"], stars: 3 },
      { champion: "Kog'Maw", items: ["Infinity Edge", "Spear of Shojin", "Red Buff"], stars: 3 },
      { champion: "Nidalee", items: ["Guinsoo's Rageblade"] },
      { champion: "Vi", items: ["Gargoyle Stoneplate", "Warmogs Armor", "Spirit Visage"], stars: 3 },
      { champion: "Krug", items: [] },
      { champion: "Rengar", items: ["Guinsoo's Rageblade", "Edge of Night", "Titan's Resolve"], stars: 3 },
    ],
  },
  {
    id: "cassio-reroll",
    name: "Defender Cassiopeia",
    tier: "A",
    style: "3-cost reroll",
    notes: "Open Cassio plus Defenders. Slow-roll Cassio 3, Rammus 3, Fiddlesticks 3. Play 6 Defender.",
    units: [
      { champion: "Cassiopeia", items: ["Hextech Gunblade", "Spear of Shojin", "Archangel's Staff"], stars: 3 },
      { champion: "Rammus", items: ["Gargoyle Stoneplate", "Crownguard", "Bramble Vest"], stars: 3 },
      { champion: "Fiddlesticks", items: ["Sunfire Cape", "Ionic Spark", "Spirit Visage"], stars: 3 },
      { champion: "Ornn", items: [] },
      { champion: "Lillia", items: ["Thief's Gloves"] },
      { champion: "Leona", items: [] },
      { champion: "Shen", items: [] },
      { champion: "Elise", items: ["Gargoyle Stoneplate", "Crownguard", "Warmogs Armor"] },
    ],
  },
  {
    id: "draven-fast-9",
    name: "Draven Fast 9",
    tier: "A",
    style: "Fast 9",
    notes: "Guinsoo's on Draven is the one required slam. Stabilize only after Draven 2 and a 5-cost tank 2.",
    units: [
      { champion: "Draven", items: ["Guinsoo's Rageblade", "Kraken's Fury", "Deathblade"] },
      { champion: "Maokai", items: ["Warmogs Armor", "Gargoyle Stoneplate", "Spirit Visage"] },
      { champion: "Ezreal", items: ["Last Whisper"] },
      { champion: "Ornn", items: [] },
      { champion: "Xayah", items: [] },
      { champion: "Kennen", items: ["Thief's Gloves"] },
      { champion: "Gnar", items: [] },
    ],
  },
  {
    id: "vanguard-aphelios",
    name: "Vanguard Aphelios",
    tier: "A",
    style: "Fast 8",
    notes: "Default AD line when you cannot race 9 for Draven. Itemize Aphelios and Brambleback; flex the tank line if Sentinel is contested.",
    units: [
      { champion: "Aphelios", items: ["Infinity Edge", "Red Buff", "Kraken's Fury"] },
      { champion: "Brambleback", items: ["Sterak's Gage", "Deathblade", "Quicksilver"] },
      { champion: "Sentinel", items: ["Protector's Vow", "Adaptive Helm", "Warmogs Armor"] },
      { champion: "Diana", items: [] },
      { champion: "Rakan", items: [] },
      { champion: "Mama Beak", items: [] },
      { champion: "Alune", items: [] },
    ],
  },
  {
    id: "caitlyn-reroll",
    name: "Caitlyn Reroll",
    tier: "B",
    style: "2-cost reroll",
    notes: "Attack-speed Caitlyn. Three-star Caitlyn, Scuttlecrab, and Sejuani. Needs bows.",
    units: [
      { champion: "Caitlyn", items: ["Guinsoo's Rageblade", "Kraken's Fury", "Giant Slayer"], stars: 3 },
      { champion: "Scuttlecrab", items: ["Warmogs Armor", "Gargoyle Stoneplate", "Spirit Visage"], stars: 3 },
      { champion: "Sejuani", items: ["Sunfire Cape"], stars: 3 },
      { champion: "Sivir", items: ["Last Whisper"] },
      { champion: "Alistar", items: [] },
      { champion: "Ashe", items: ["Spear of Shojin"] },
    ],
  },
  {
    id: "blossom-ahri",
    name: "Blossom Ahri",
    tier: "B",
    style: "Fast 8",
    notes: "Play from a 3 Blossom opener. Roll 4-2 for Ahri 2 and Sett 2, then 9 for Ashe.",
    units: [
      { champion: "Ahri", items: ["Spear of Shojin", "Jeweled Gauntlet", "Striker's Flail"] },
      { champion: "Sett", items: ["Warmogs Armor", "Bramble Vest", "Dragon's Claw"] },
      { champion: "Karma", items: [] },
      { champion: "Yunara", items: [] },
      { champion: "Yorick", items: [] },
      { champion: "Ashe", items: ["Red Buff", "Spear of Shojin", "Last Whisper"] },
      { champion: "Gnar", items: [] },
      { champion: "Zyra", items: [] },
    ],
  },
  {
    id: "invoker-nidalee",
    name: "Invoker Nidalee",
    tier: "B",
    style: "Fast 8",
    notes: "Item-hungry. Nidalee plus Morgana. Flex off Sentinel if the lobby is full of it.",
    units: [
      { champion: "Nidalee", items: ["Guinsoo's Rageblade", "Jeweled Gauntlet", "Striker's Flail"] },
      { champion: "Morgana", items: ["Morellonomicon", "Rabadon's Deathcap", "Void Staff"] },
      { champion: "Sentinel", items: ["Protector's Vow", "Adaptive Helm"] },
      { champion: "Teemo", items: [] },
      { champion: "Pebbles", items: [] },
      { champion: "Rakan", items: [] },
      { champion: "Alune", items: [] },
    ],
  },
  {
    id: "riftbeast-reroll",
    name: "Riftbeast Reroll",
    tier: "B",
    style: "1-cost reroll",
    notes: "Vertical Riftbeasts around Pebbles and Cinderling. Three-star the cheap beasts, then add Mama Beak.",
    units: [
      { champion: "Pebbles", items: ["Spear of Shojin", "Blue Buff", "Jeweled Gauntlet"], stars: 3 },
      { champion: "Cinderling", items: ["Guinsoo's Rageblade", "Red Buff"], stars: 3 },
      { champion: "Murkwolf", items: ["Bloodthirster", "Titan's Resolve"], stars: 3 },
      { champion: "Gromp", items: [], stars: 3 },
      { champion: "Krug", items: ["Gargoyle Stoneplate"] },
      { champion: "Scuttlecrab", items: ["Warmogs Armor"] },
      { champion: "Mama Beak", items: [] },
    ],
  },
  {
    id: "warwick-reroll",
    name: "Warwick Reroll",
    tier: "B",
    style: "2-cost reroll",
    notes: "Blackthorn Warwick. Shojin plus fighter items. Pair with Rek'Sai and Veigar.",
    units: [
      { champion: "Warwick", items: ["Spear of Shojin", "Titan's Resolve", "Sterak's Gage"], stars: 3 },
      { champion: "Rek'Sai", items: ["Bloodthirster"], stars: 3 },
      { champion: "Veigar", items: ["Jeweled Gauntlet", "Blue Buff"], stars: 3 },
      { champion: "Malphite", items: ["Gargoyle Stoneplate"] },
      { champion: "Azir", items: [] },
    ],
  },
  {
    id: "hunter-sivir",
    name: "Hunter Sivir",
    tier: "B",
    style: "Fast 8",
    notes: "Sivir carry with Hunter vertical. Same AD slams as the Primal line if you never find Malphite.",
    units: [
      { champion: "Sivir", items: ["Infinity Edge", "Striker's Flail", "Giant Slayer"] },
      { champion: "Caitlyn", items: ["Guinsoo's Rageblade"] },
      { champion: "Ashe", items: ["Last Whisper", "Spear of Shojin"] },
      { champion: "Tristana", items: [] },
      { champion: "Nidalee", items: [] },
      { champion: "Sett", items: ["Warmogs Armor"] },
    ],
  },
  {
    id: "yunara-reroll",
    name: "Yunara Reroll",
    tier: "C",
    style: "2-cost reroll",
    notes: "Playable if handed Yunara pairs. Weaker than the S/A lines — only from a strong opener.",
    units: [
      { champion: "Yunara", items: ["Infinity Edge", "Last Whisper", "Giant Slayer"], stars: 3 },
      { champion: "Karma", items: ["Spear of Shojin"], stars: 3 },
      { champion: "Sett", items: ["Warmogs Armor", "Bramble Vest"] },
      { champion: "Yorick", items: [] },
      { champion: "Ahri", items: [] },
    ],
  },
];

export const EMBLEM_HOLDERS: Array<{ emblem: string; units: string[] }> = [
  { emblem: "Hunter Emblem", units: ["Nidalee"] },
  { emblem: "Executioner Emblem", units: ["Zyra", "Kennen"] },
  { emblem: "Spellweaver Emblem", units: ["Soraka", "Ahri"] },
  { emblem: "Brawler Emblem", units: ["Master Yi", "Sett"] },
  { emblem: "Rapidfire Emblem", units: ["Brambleback", "Kayle"] },
  { emblem: "Blossom Emblem", units: ["Gnar", "Ahri"] },
  { emblem: "Fae Emblem", units: ["Kayle"] },
  { emblem: "Elderwood Emblem", units: ["Sejuani", "Leona"] },
  { emblem: "Invoker Emblem", units: ["Morgana", "Alune"] },
  { emblem: "Vanguard Emblem", units: ["Aphelios"] },
  { emblem: "Primal Emblem", units: ["Nidalee", "Sivir"] },
  { emblem: "Ravager Emblem", units: ["Warwick"] },
  { emblem: "Blackthorn Emblem", units: ["Malphite", "Amumu"] },
  { emblem: "Inferno Emblem", units: ["Kennen"] },
  { emblem: "Lunar Emblem", units: ["Aphelios"] },
  { emblem: "Sprykin Emblem", units: ["Teemo"] },
];

/**
 * Usual artifact holders when the NA snapshot has fewer than ARTIFACT_MIN_SAMPLE games.
 * Ladder pairs still win when n is high enough. Horizon Focus only belongs on units that stun.
 */
export const ARTIFACT_HOLDERS: Array<{ artifact: string; units: string[] }> = [
  { artifact: "Fishbones", units: ["Aphelios", "Sivir", "Draven", "Caitlyn"] },
  { artifact: "Horizon Focus", units: ["Kennen", "Sejuani", "Rammus", "Amumu", "Leona", "Lillia"] },
  { artifact: "Lich Bane", units: ["Kayle", "Ahri", "Cassiopeia"] },
  { artifact: "Mittens", units: ["Master Yi", "Warwick", "Rengar"] },
  { artifact: "Dawncore", units: ["Cassiopeia", "Soraka", "Karma", "Azir"] },
  { artifact: "Death's Defiance", units: ["Warwick", "Master Yi", "Rengar"] },
  { artifact: "Gold Collector", units: ["Draven", "Sivir", "Nidalee"] },
  { artifact: "Rapid Firecannon", units: ["Sivir", "Draven", "Caitlyn", "Xayah"] },
  { artifact: "Flickerblades", units: ["Kayle", "Xayah", "Draven"] },
  { artifact: "Statikk Shiv", units: ["Kayle"] },
  { artifact: "Titanic Hydra", units: ["Malphite", "Ornn", "Maokai"] },
  { artifact: "The Indomitable", units: ["Malphite", "Ornn", "Rammus"] },
  { artifact: "Wit's End", units: ["Kayle", "Master Yi"] },
  { artifact: "Zhonya's Paradox", units: ["Soraka", "Kayle", "Ahri"] },
  { artifact: "Silvermere Dawn", units: ["Warwick", "Master Yi", "Malphite"] },
  { artifact: "Manazane", units: ["Cassiopeia", "Azir", "Karma"] },
  { artifact: "Luden's Tempest", units: ["Zyra", "Ahri", "Fiddlesticks", "Kennen"] },
  { artifact: "Blighting Jewel", units: ["Zyra", "Cassiopeia", "Ahri"] },
  { artifact: "Infinity Force", units: ["Master Yi", "Rengar"] },
  { artifact: "Hullcrusher", units: ["Warwick", "Rek'Sai"] },
  { artifact: "Hellfire Hatchet", units: ["Warwick", "Rengar"] },
  { artifact: "Aegis of Dawn", units: ["Malphite", "Leona", "Ornn"] },
  { artifact: "Aegis of Dusk", units: ["Ornn", "Malphite"] },
  { artifact: "Lightshield Crest", units: ["Soraka", "Rakan"] },
  { artifact: "Forbidden Idol", units: ["Soraka", "Karma"] },
  { artifact: "Gambler's Blade", units: ["Aphelios", "Xayah", "Kayle", "Draven"] },
  { artifact: "Void Gauntlet", units: ["Fiddlesticks", "Zyra"] },
  { artifact: "Seeker's Armguard", units: ["Elise", "Rammus"] },
  { artifact: "Mogul's Mail", units: ["Ornn", "Maokai"] },
  { artifact: "Eternal Pact", units: ["Veigar", "Soraka"] },
];

export function notebookFromMeta(comp: ResolvedMetaComp, pinned = true): Comp {
  const now = Date.now();
  const units: CompUnit[] = comp.units.map((unit) => ({
    championId: unit.championId,
    items: unit.itemIds,
    stars: unit.stars,
  }));
  return {
    id: `meta:${comp.id}`,
    name: comp.name,
    notes: `${comp.tier} · ${comp.style}\n${comp.notes}`,
    pinned,
    units,
    createdAt: now,
    updatedAt: now,
  };
}
