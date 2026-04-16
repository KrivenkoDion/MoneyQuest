// src/routes/savings.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

export function savingsRoutes(pool: any) {
  const router = Router();

  // GET current user's goal
  router.get("/savings", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const result = await pool.query(
      "SELECT * FROM savings_goals WHERE email = $1 ORDER BY id DESC LIMIT 1",
      [email]
    );
    res.json({ goal: result.rows[0] || null });
  });

  // POST create goal (replaces existing)
  router.post("/savings", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { name, target_amount } = req.body;

    if (!name || !target_amount || target_amount <= 0) {
      return res.status(400).json({ error: "Invalid goal data" });
    }

    // Delete old goal for this user (one goal at a time)
    await pool.query("DELETE FROM savings_goals WHERE email = $1", [email]);

    const result = await pool.query(
      "INSERT INTO savings_goals (email, name, target_amount, saved_amount) VALUES ($1, $2, $3, 0) RETURNING *",
      [email, name, target_amount]
    );
    res.json({ goal: result.rows[0] });
  });

  // PATCH update saved_amount
  router.patch("/savings", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const result = await pool.query(
      `UPDATE savings_goals
       SET saved_amount = LEAST(saved_amount + $1, target_amount)
       WHERE email = $2
       RETURNING *`,
      [amount, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No savings goal found" });
    }

    res.json({ goal: result.rows[0] });
  });

  return router;
}
