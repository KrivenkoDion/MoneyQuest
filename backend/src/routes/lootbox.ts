// src/routes/lootbox.ts
// Full lootbox system: open, earn, rarity rolls

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { SHOP_ITEMS } from "../config/shop";
import { addXP, addCoins } from "../utils/xp";
import { rollLootbox, LootboxReward } from "../utils/lootbox";

export function lootboxRoutes(pool: any) {
  const router = Router();

  // GET /lootbox — returns how many lootboxes the user has
  router.get("/lootbox", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const result = await pool.query(
      "SELECT lootboxes FROM users WHERE email = $1",
      [email]
    );
    res.json({ lootboxes: result.rows[0]?.lootboxes || 0 });
  });

  // POST /lootbox/open — opens one lootbox, generates and applies reward
  router.post("/lootbox/open", authMiddleware, async (req: any, res) => {
    const email = req.user.email;

    // Check count
    const userResult = await pool.query(
      "SELECT lootboxes FROM users WHERE email = $1",
      [email]
    );
    const lootboxCount = userResult.rows[0]?.lootboxes || 0;

    if (lootboxCount <= 0) {
      return res.status(400).json({ error: "No lootboxes available" });
    }

    // Deduct one lootbox
    await pool.query(
      "UPDATE users SET lootboxes = lootboxes - 1 WHERE email = $1",
      [email]
    );

    // Roll the reward
    const reward: LootboxReward = rollLootbox(SHOP_ITEMS);

    // Apply reward to user
    if (reward.type === "xp") {
      await addXP(pool, email, reward.amount!);
    } else if (reward.type === "coins") {
      await addCoins(pool, email, reward.amount!);
    } else if (reward.type === "item" && reward.itemId) {
      // Only add item if user doesn't already own it
      const existing = await pool.query(
        "SELECT 1 FROM user_items WHERE email = $1 AND item_id = $2",
        [email, reward.itemId]
      );
      if (existing.rows.length > 0) {
        // Already owned — convert to coins instead
        reward.type = "coins";
        reward.amount = 30;
        reward.label = "Duplicate item → 30 coins";
        await addCoins(pool, email, 30);
      } else {
        await pool.query(
          "INSERT INTO user_items (email, item_id) VALUES ($1, $2)",
          [email, reward.itemId]
        );
      }
    }

    // Return remaining lootboxes too
    const afterResult = await pool.query(
      "SELECT lootboxes FROM users WHERE email = $1",
      [email]
    );

    res.json({
      reward,
      lootboxes_remaining: afterResult.rows[0]?.lootboxes || 0,
    });
  });

  // POST /lootbox/grant — admin only: give lootboxes to self (dev tool)
  router.post("/lootbox/grant", authMiddleware, async (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { amount = 1 } = req.body;
    const email = req.user.email;
    await pool.query(
      "UPDATE users SET lootboxes = lootboxes + $1 WHERE email = $2",
      [amount, email]
    );
    res.json({ message: `Granted ${amount} lootbox(es)` });
  });

  return router;
}
