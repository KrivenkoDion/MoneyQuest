// src/utils/lootbox.ts
// Pure lootbox logic: rarity rolls, reward generation
// No DB calls — all DB work is in the route

export type Rarity = "common" | "rare" | "epic";

export type LootboxReward = {
  type: "xp" | "coins" | "item";
  rarity: Rarity;
  amount?: number;
  itemId?: string;
  itemName?: string;
  label: string;
  emoji: string;
};

// Rarity weights: common 60%, rare 30%, epic 10%
const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 0.60,
  rare:   0.30,
  epic:   0.10,
};

// XP rewards per rarity
const XP_REWARDS: Record<Rarity, number> = {
  common: 15,
  rare:   40,
  epic:   100,
};

// Coin rewards per rarity
const COIN_REWARDS: Record<Rarity, number> = {
  common: 20,
  rare:   60,
  epic:   150,
};

// Rarity display config
export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; glow: string; emoji: string }> = {
  common: {
    label: "Common",
    color: "#6b7280",
    glow:  "rgba(107,114,128,0.4)",
    emoji: "⬜",
  },
  rare: {
    label: "Rare",
    color: "#3b5bdb",
    glow:  "rgba(59,91,219,0.5)",
    emoji: "🔷",
  },
  epic: {
    label: "Epic",
    color: "#9333ea",
    glow:  "rgba(147,51,234,0.6)",
    emoji: "💜",
  },
};

function rollRarity(): Rarity {
  const roll = Math.random();
  if (roll < RARITY_WEIGHTS.epic) return "epic";
  if (roll < RARITY_WEIGHTS.epic + RARITY_WEIGHTS.rare) return "rare";
  return "common";
}

// Decide reward type based on rarity
// Epic always has a chance at item, common never does
function rollRewardType(rarity: Rarity): "xp" | "coins" | "item" {
  const roll = Math.random();
  if (rarity === "epic") {
    // 40% item, 35% XP, 25% coins
    if (roll < 0.40) return "item";
    if (roll < 0.75) return "xp";
    return "coins";
  }
  if (rarity === "rare") {
    // 20% item, 45% XP, 35% coins
    if (roll < 0.20) return "item";
    if (roll < 0.65) return "xp";
    return "coins";
  }
  // common: no items, 50/50 XP or coins
  return roll < 0.5 ? "xp" : "coins";
}

export function rollLootbox(shopItems: any[]): LootboxReward {
  const rarity = rollRarity();
  const type   = rollRewardType(rarity);
  const cfg    = RARITY_CONFIG[rarity];

  if (type === "item") {
    // Pick a random item from the shop
    const item = shopItems[Math.floor(Math.random() * shopItems.length)];
    return {
      type:     "item",
      rarity,
      itemId:   item.id,
      itemName: item.name,
      label:    `${item.name} unlocked!`,
      emoji:    cfg.emoji,
    };
  }

  if (type === "xp") {
    const amount = XP_REWARDS[rarity];
    return {
      type,
      rarity,
      amount,
      label: `+${amount} XP`,
      emoji: "⭐",
    };
  }

  // coins
  const amount = COIN_REWARDS[rarity];
  return {
    type,
    rarity,
    amount,
    label: `+${amount} coins`,
    emoji: "🪙",
  };
}
