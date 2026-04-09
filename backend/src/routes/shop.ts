import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { SHOP_ITEMS } from "../config/shop";

export function shopRoutes(pool: any) {
  const router = Router();

  // GET SHOP
  router.get("/shop", authMiddleware, async (req: any, res) => {
    const email = req.user.email;

    const userResult = await pool.query(
      "SELECT xp FROM users WHERE email = $1",
      [email]
    );
    const userXP = userResult.rows[0]?.xp || 0;

    const purchasedResult = await pool.query(
      "SELECT item_id FROM user_items WHERE email = $1",
      [email]
    );
    const purchasedIds = purchasedResult.rows.map((r: any) => r.item_id);

    const items = SHOP_ITEMS.map((item) => ({
      ...item,
      owned: purchasedIds.includes(item.id),
    }));

    res.json({ xp: userXP, items });
  });

  // BUY ITEM
  router.post("/shop/buy/:itemId", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { itemId } = req.params;

    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const userResult = await pool.query(
      "SELECT xp FROM users WHERE email = $1",
      [email]
    );
    const userXP = userResult.rows[0]?.xp || 0;

    if (userXP < item.cost) {
      return res.status(400).json({ error: "Not enough XP" });
    }

    const alreadyOwned = await pool.query(
      "SELECT * FROM user_items WHERE email = $1 AND item_id = $2",
      [email, itemId]
    );
    if (alreadyOwned.rows.length > 0) {
      return res.status(400).json({ error: "Already owned" });
    }

    await pool.query(
      "UPDATE users SET xp = xp - $1 WHERE email = $2",
      [item.cost, email]
    );

    await pool.query(
      "INSERT INTO user_items (email, item_id) VALUES ($1, $2)",
      [email, itemId]
    );

    res.json({ message: "Item purchased", item_id: itemId });
  });

  return router;
}