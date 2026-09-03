import { setData } from "../data/catalog";
import type { Champion, Item } from "../data/types";

export function keyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

const CHAMP_ALIASES: Record<string, string> = {
  scuttle: "Scuttlecrab",
  scuttlecrab: "Scuttlecrab",
  yi: "Master Yi",
  masteryi: "Master Yi",
  fiddle: "Fiddlesticks",
  fiddlesticks: "Fiddlesticks",
  sej: "Sejuani",
  kog: "Kog'Maw",
  kogmaw: "Kog'Maw",
  elder: "Elder Dragon",
  elderdragon: "Elder Dragon",
};

const ITEM_ALIASES: Record<string, string> = {
  ie: "Infinity Edge",
  infinityedge: "Infinity Edge",
  shojin: "Spear of Shojin",
  spearofshojin: "Spear of Shojin",
  hoj: "Hand Of Justice",
  handofjustice: "Hand Of Justice",
  gargoyle: "Gargoyle Stoneplate",
  gargoyles: "Gargoyle Stoneplate",
  gargoylestoneplate: "Gargoyle Stoneplate",
  spirit: "Spirit Visage",
  spirits: "Spirit Visage",
  spiritvisage: "Spirit Visage",
  crownguard: "Crownguard",
  strikers: "Striker's Flail",
  strikersflail: "Striker's Flail",
  redbuff: "Red Buff",
  rfc: "Red Buff",
  deathcap: "Rabadon's Deathcap",
  rabadon: "Rabadon's Deathcap",
  rabadons: "Rabadon's Deathcap",
  rabadonsdeathcap: "Rabadon's Deathcap",
  nashor: "Nashor's Tooth",
  nashors: "Nashor's Tooth",
  nashorstooth: "Nashor's Tooth",
  adaptive: "Adaptive Helm",
  adaptivehelm: "Adaptive Helm",
  jg: "Jeweled Gauntlet",
  jeweled: "Jeweled Gauntlet",
  jeweledgauntlet: "Jeweled Gauntlet",
  voidstaff: "Void Staff",
  void: "Void Staff",
  guinsoo: "Guinsoo's Rageblade",
  guinsoos: "Guinsoo's Rageblade",
  rageblade: "Guinsoo's Rageblade",
  warmog: "Warmogs Armor",
  warmogs: "Warmogs Armor",
  warmogsarmor: "Warmogs Armor",
  vow: "Protector's Vow",
  protectorsvow: "Protector's Vow",
  gunblade: "Hextech Gunblade",
  hextechgunblade: "Hextech Gunblade",
  bluebuff: "Blue Buff",
  kraken: "Kraken's Fury",
  krakens: "Kraken's Fury",
  krakensfury: "Kraken's Fury",
  qss: "Quicksilver",
  quicksilver: "Quicksilver",
  sterak: "Sterak's Gage",
  steraks: "Sterak's Gage",
  steraksgage: "Sterak's Gage",
  titan: "Titan's Resolve",
  titans: "Titan's Resolve",
  titansresolve: "Titan's Resolve",
  eon: "Edge of Night",
  edgeofnight: "Edge of Night",
  giantslayer: "Giant Slayer",
  gs: "Giant Slayer",
  lastwhisper: "Last Whisper",
  lw: "Last Whisper",
  bramble: "Bramble Vest",
  bramblevest: "Bramble Vest",
  claw: "Dragon's Claw",
  dragonsclaw: "Dragon's Claw",
  morello: "Morellonomicon",
  morellonomicon: "Morellonomicon",
  spark: "Ionic Spark",
  ionicspark: "Ionic Spark",
  sunfire: "Sunfire Cape",
  sunfirecape: "Sunfire Cape",
  deathblade: "Deathblade",
  db: "Deathblade",
  archangel: "Archangel's Staff",
  archangels: "Archangel's Staff",
  archangelsstaff: "Archangel's Staff",
  bt: "Bloodthirster",
  bloodthirster: "Bloodthirster",
  tg: "Thief's Gloves",
  thiefsgloves: "Thief's Gloves",
  steadfast: "Steadfast Heart",
  evenshroud: "Evenshroud",
};

export function findChampion(name: string): Champion | undefined {
  const wanted = keyName(CHAMP_ALIASES[keyName(name)] || name);
  return setData.champions.find((champ) => keyName(champ.name) === wanted);
}

export function findItem(name: string): Item | undefined {
  const aliased = ITEM_ALIASES[keyName(name)] || name;
  const wanted = keyName(aliased);
  const matches = setData.items.filter((item) => keyName(item.name) === wanted);
  if (!matches.length) return undefined;
  return (
    matches.find((item) => item.id.startsWith("DA_") && item.kind !== "component") ||
    matches.find((item) => item.kind !== "component") ||
    matches[0]
  );
}
