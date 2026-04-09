// src/routes/transactions.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

// Anti-abuse: minimum transaction amount and max 20 expense transactions per day
const MIN_AMOUNT = 0.01;
const MAX_EXPENSES_PER_DAY = 20;

export function transactionRoutes(pool: any) {
  const router = Router();

  // GET TRANSACTIONS
  router.get("/transactions", authMiddleware, async (req: any, res) => {
    const email = req.user.email;

    const result = await pool.query(
      "SELECT * FROM transactions WHERE email = $1 ORDER BY id DESC",
      [email]
    );

    res.json(result.rows);
  });

  // ADD TRANSACTION
  router.post("/transactions", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { transaction } = req.body;

    // --- Anti-abuse checks (expenses only) ---
    if (transaction.category !== "income") {

      // 1. Minimum amount guard
      if (!transaction.amount || transaction.amount < MIN_AMOUNT) {
        return res.status(400).json({ error: "Transaction amount too small" });
      }

      // 2. Daily limit: max 20 expense transactions per day
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM transactions
         WHERE email = $1
           AND category != 'income'
           AND DATE(created_at) = $2`,
        [email, today]
      );
      const todayCount = parseInt(countResult.rows[0].count, 10);
      if (todayCount >= MAX_EXPENSES_PER_DAY) {
        return res.status(429).json({ error: "Daily transaction limit reached" });
      }
    }

    // Insert transaction (requires created_at column — see migration note)
    await pool.query(
      "INSERT INTO transactions (email, amount, description, category, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [email, transaction.amount, transaction.description, transaction.category]
    );

    // --- Quest progress tracking ---
    if (transaction.category !== "income") {

      // Quest 1: first expense ever
      await pool.query(`
        INSERT INTO user_quests (email, quest_id, completed, claimed)
        VALUES ($1, 'add_expense_once', true, false)
        ON CONFLICT (email, quest_id) DO NOTHING
      `, [email]);

      // Quest 2: 10 expenses total
      const totalExpenses = await pool.query(
        "SELECT COUNT(*) FROM transactions WHERE email = $1 AND category != 'income'",
        [email]
      );
      const expenseCount = parseInt(totalExpenses.rows[0].count, 10);

      if (expenseCount >= 10) {
        await pool.query(`
          INSERT INTO user_quests (email, quest_id, completed, claimed)
          VALUES ($1, 'add_expense_10', true, false)
          ON CONFLICT (email, quest_id) DO NOTHING
        `, [email]);
      }

      // Quest 3: 50 expenses total
      if (expenseCount >= 50) {
        await pool.query(`
          INSERT INTO user_quests (email, quest_id, completed, claimed)
          VALUES ($1, 'add_expense_50', true, false)
          ON CONFLICT (email, quest_id) DO NOTHING
        `, [email]);
      }
    }

    // --- Daily streak update ---
    await updateStreak(pool, email);

    res.json({ message: "Transaction added" });
  });

  return router;
}

// Streak logic: reward coins per day of streak (day1=10, day2=20, day3=30, capped at 50)
async function updateStreak(pool: any, email: string) {
  const result = await pool.query(
    "SELECT streak, last_active FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.last_active ? new Date(user.last_active) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  const alreadyToday = lastActive && lastActive.getTime() === today.getTime();
  if (alreadyToday) return; // already rewarded today

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const wasYesterday = lastActive && lastActive.getTime() === yesterday.getTime();

  const newStreak = wasYesterday ? user.streak + 1 : 1;
  const coinReward = Math.min(newStreak * 10, 50); // day1=10...day5+=50

  await pool.query(
    "UPDATE users SET streak = $1, last_active = $2, coins = coins + $3 WHERE email = $4",
    [newStreak, today.toISOString().split("T")[0], coinReward, email]
  );
}
