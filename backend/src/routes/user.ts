// src/routes/user.ts
// Only change: SELECT now also returns coins and streak

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

export function userRoutes(pool: any) {
  const router = Router();

  // PROFILE — added coins, streak to SELECT
  router.get("/profile", authMiddleware, async (req: any, res) => {
    const email = req.user.email;

    const result = await pool.query(
      "SELECT email, name, avatar, xp, coins, streak, monthly_income, income_day, role FROM users WHERE email = $1",
      [email]
    );

    res.json({ user: result.rows[0] });
  });

  // UPDATE AVATAR — unchanged
  router.post("/update-avatar", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { avatar } = req.body;

    await pool.query(
      "UPDATE users SET avatar = $1 WHERE email = $2",
      [avatar, email]
    );

    res.json({ message: "Avatar updated" });
  });

  // UPDATE INCOME — unchanged
  router.post("/update-income", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { monthly_income, income_day } = req.body;

    await pool.query(
      "UPDATE users SET monthly_income = $1, income_day = $2 WHERE email = $3",
      [monthly_income, income_day, email]
    );

    res.json({ message: "Income updated" });
  });

  return router;
}
