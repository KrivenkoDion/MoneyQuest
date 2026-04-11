// src/routes/shop.ts
// Added vs previous version:
//   - GET /inventory — returns owned items with equipped flags
//   - POST /shop/equip/:itemId — equips an item into its slot
//   - POST /shop/unequip/:slot — unequips a slot (hat / glasses / scarf)
//   - GET /shop still returns `equipped` flag per item
//   - Buy now uses coins (unchanged)

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { SHOP_ITEMS } from "../config/shop";

// Map item type → DB column
const EQUIP_SLOT: Record<string, string> = {
  hat:     "equipped_hat",
  glasses: "equipped_glasses",
  scarf:   "equipped_scarf",
};

export function shopRoutes(pool: any) {
  const router = Router();

  // GET /shop — returns user's coins + items with owned + equipped flags
  router.get("/shop", authMiddleware, async (req: any, res) => {
    const email = req.user.email;

    const userResult = await pool.query(
      "SELECT coins, equipped_hat, equipped_glasses, equipped_scarf FROM users WHERE email = $1",
      [email]
    );
    const userCoins       = userResult.rows[0]?.coins            || 0;
    const equippedHat     = userResult.rows[0]?.equipped_hat     || null;
    const equippedGlasses = userResult.rows[0]?.equipped_glasses || null;
    const equippedScarf   = userResult.rows[0]?.equipped_scarf   || null;

    const purchasedResult = await pool.query(
      "SELECT item_id FROM user_items WHERE email = $1",
      [email]
    );
    const purchasedIds = purchasedResult.rows.map((r: any) => r.item_id);

    const items = SHOP_ITEMS.map((item) => {
      const isEquipped =
        (item.type === "hat"     && equippedHat     === item.id) ||
        (item.type === "glasses" && equippedGlasses === item.id) ||
        (item.type === "scarf"   && equippedScarf   === item.id);
      return {
        ...item,
        owned:    purchasedIds.includes(item.id),
        equipped: isEquipped,
      };
    });

    res.json({ coins: userCoins, items });
  });

  // GET /inventory — owned items with equipped flag (for Inventory tab)
  router.get("/inventory", authMiddleware, async (req: any, res) => {
    const email = req.user.email;

    const userResult = await pool.query(
      "SELECT equipped_hat, equipped_glasses, equipped_scarf FROM users WHERE email = $1",
      [email]
    );
    const equippedHat     = userResult.rows[0]?.equipped_hat     || null;
    const equippedGlasses = userResult.rows[0]?.equipped_glasses || null;
    const equippedScarf   = userResult.rows[0]?.equipped_scarf   || null;

    const purchasedResult = await pool.query(
      "SELECT item_id FROM user_items WHERE email = $1",
      [email]
    );
    const purchasedIds = purchasedResult.rows.map((r: any) => r.item_id);

    const inventory = SHOP_ITEMS
      .filter((item) => purchasedIds.includes(item.id))
      .map((item) => {
        const isEquipped =
          (item.type === "hat"     && equippedHat     === item.id) ||
          (item.type === "glasses" && equippedGlasses === item.id) ||
          (item.type === "scarf"   && equippedScarf   === item.id);
        return { ...item, owned: true, equipped: isEquipped };
      });

    res.json({ inventory });
  });

  // BUY ITEM — deducts coins
  router.post("/shop/buy/:itemId", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { itemId } = req.params;

    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const userResult = await pool.query(
      "SELECT coins FROM users WHERE email = $1",
      [email]
    );
    const userCoins = userResult.rows[0]?.coins || 0;

    if (userCoins < item.cost) {
      return res.status(400).json({ error: "Not enough coins" });
    }

    const alreadyOwned = await pool.query(
      "SELECT 1 FROM user_items WHERE email = $1 AND item_id = $2",
      [email, itemId]
    );
    if (alreadyOwned.rows.length > 0) {
      return res.status(400).json({ error: "Already owned" });
    }

    await pool.query(
      "UPDATE users SET coins = coins - $1 WHERE email = $2",
      [item.cost, email]
    );
    await pool.query(
      "INSERT INTO user_items (email, item_id) VALUES ($1, $2)",
      [email, itemId]
    );

    res.json({ message: "Item purchased", item_id: itemId });
  });

  // EQUIP ITEM
  router.post("/shop/equip/:itemId", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { itemId } = req.params;

    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const slot = EQUIP_SLOT[item.type];
    if (!slot) return res.status(400).json({ error: "Item has no equip slot" });

    // Must own it
    const owns = await pool.query(
      "SELECT 1 FROM user_items WHERE email = $1 AND item_id = $2",
      [email, itemId]
    );
    if (owns.rows.length === 0) {
      return res.status(400).json({ error: "You don't own this item" });
    }

    await pool.query(
      `UPDATE users SET ${slot} = $1 WHERE email = $2`,
      [itemId, email]
    );

    res.json({ message: "Item equipped", item_id: itemId, slot });
  });

  // UNEQUIP SLOT
  router.post("/shop/unequip/:slot", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { slot } = req.params; // "hat" | "glasses" | "scarf"

    const col = EQUIP_SLOT[slot];
    if (!col) return res.status(400).json({ error: "Unknown slot" });

    await pool.query(
      `UPDATE users SET ${col} = NULL WHERE email = $1`,
      [email]
    );

    res.json({ message: "Unequipped", slot });
  });

  return router;
}
