export type ShopItemConfig = {
  id: string;
  name: string;
  type: "hat" | "glasses" | "scarf" | "outfit";
  cost: number;
};

export const SHOP_ITEMS: ShopItemConfig[] = [
  // ── Hats ──────────────────────────────────────
  { id: "hat",          name: "Hat",          type: "hat",     cost: 30  },
  { id: "crown",        name: "Crown",        type: "hat",     cost: 60  },
  { id: "baseball_cap", name: "Baseball Cap", type: "hat",     cost: 50  },
  { id: "beanie",       name: "Beanie",       type: "hat",     cost: 80  },
  { id: "santa_hat",    name: "Santa Hat",    type: "hat",     cost: 120 },
  { id: "wizard_hat",   name: "Wizard Hat",   type: "hat",     cost: 200 },

  // ── Glasses ───────────────────────────────────
  { id: "glasses",         name: "Glasses",         type: "glasses", cost: 15  },
  { id: "monocle",         name: "Monocle",         type: "glasses", cost: 25  },
  { id: "sunglasses",      name: "Sunglasses",      type: "glasses", cost: 100 },
  { id: "pixel_glasses",   name: "Pixel Glasses",   type: "glasses", cost: 180 },
  { id: "diamond_glasses", name: "Diamond Glasses", type: "glasses", cost: 600 },

  // ── Scarves ───────────────────────────────────
  { id: "scarf", name: "Scarf", type: "scarf", cost: 20 },

  // ── Outfits ───────────────────────────────────
  { id: "hoodie",     name: "Hoodie",     type: "outfit", cost: 300 },
  { id: "suit",       name: "Suit",       type: "outfit", cost: 450 },
  { id: "royal_robe", name: "Royal Robe", type: "outfit", cost: 800 },
];