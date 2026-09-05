export type AbilityStar = {
  name: string;
  values: Array<number | null>;
};

export type Champion = {
  id: string;
  name: string;
  cost: number;
  role: string;
  traits: string[];
  icon: string;
  splash: string;
  stats: Record<string, number>;
  ability: {
    name: string;
    text: string;
    stars: AbilityStar[];
  };
};

export type Trait = {
  id: string;
  name: string;
  icon: string;
  text: string;
  breakpoints: Array<{ min: number; max: number; style: number }>;
};

export type Item = {
  id: string;
  name: string;
  icon: string;
  text: string;
  composition: string[];
  unique: boolean;
  kind: "component" | "completed" | "emblem" | "artifact";
};

export type Augment = {
  id: string;
  name: string;
  icon: string;
  text: string;
  tier: 1 | 2 | 3 | number;
  traits: string[];
};

export type SetSnapshot = {
  set: number;
  mutator: string;
  name: string;
  source: string;
  extractedAt: string;
  champions: Champion[];
  traits: Trait[];
  items: Item[];
  augments: Augment[];
};

export type CompUnit = {
  championId: string;
  items: string[];
  stars: 1 | 2 | 3;
};

export type Comp = {
  id: string;
  name: string;
  notes: string;
  pinned: boolean;
  units: CompUnit[];
  createdAt: number;
  updatedAt: number;
};

export type OverlayTab = "board" | "comps" | "units" | "items" | "augments" | "traits";
