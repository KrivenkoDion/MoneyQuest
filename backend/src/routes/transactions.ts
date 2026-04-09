// src/routes/transactions.ts
// KEY FIXES vs previous version:
//   - MIN_AMOUNT raised to 1€ (anti-abuse requirement)
//   - Quest progress uses UPDATE with progress increment, NOT INSERT-only
//   - Claimed quests are NEVER touched (claimed guard on every update)
//   - Progress is stored in user_quests.progress column
//   - Amount-based and streak quests also tracked here

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const MIN_AMOUNT = 1;           // anti-abuse: ignore transactions < 1€
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

    // ── Anti-abuse (expenses only) ────────────────────────────
    if (transaction.category !== "income") {

      // 1. Minimum 1€ — blocks zero/tiny spam transactions
      if (!transaction.amount || transaction.amount < MIN_AMOUNT) {
        return res.status(400).json({ error: `Minimum transaction amount is ${MIN_AMOUNT}€` });
      }

      // 2. Daily cap: max 20 expense transactions per day
      const today = new Date().toISOString().split("T")[0];
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM transactions
         WHERE email = $1 AND category != 'income' AND DATE(created_at) = $2`,
        [email, today]
      );
      if (parseInt(countResult.rows[0].count, 10) >= MAX_EXPENSES_PER_DAY) {
        return res.status(429).json({ error: "Daily transaction limit reached (20/day)" });
      }
    }

    // ── Insert transaction ────────────────────────────────────
    await pool.query(
      "INSERT INTO transactions (email, amount, description, category, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [email, transaction.amount, transaction.description, transaction.category]
    );

    // ── Quest progress update (expenses only, amount >= 1€) ───
    if (transaction.category !== "income" && transaction.amount >= MIN_AMOUNT) {

      // Get current expense count and total amount for this user
      const statsResult = await pool.query(
        `SELECT COUNT(*) AS cnt, COALESCE(SUM(amount), 0) AS total
         FROM transactions
         WHERE email = $1 AND category != 'income' AND amount >= $2`,
        [email, MIN_AMOUNT]
      );
      const expenseCount  = parseInt(statsResult.rows[0].cnt, 10);
      const expenseAmount = parseFloat(statsResult.rows[0].total);

      // Update count-based quests
      const countQuests = [
        { id: "add_expense_once", goal: 1  },
        { id: "add_expense_5",    goal: 5  },
        { id: "add_expense_10",   goal: 10 },
        { id: "add_expense_20",   goal: 20 },
        { id: "add_expense_50",   goal: 50 },
      ];
      for (const q of countQuests) {
        await upsertProgress(pool, email, q.id, expenseCount, q.goal);
      }

      // Update amount-based quests
      const amountQuests = [
        { id: "track_50_euros",  goal: 50  },
        { id: "track_200_euros", goal: 200 },
      ];
      for (const q of amountQuests) {
        await upsertProgress(pool, email, q.id, expenseAmount, q.goal);
      }
    }

    // ── Streak update (every transaction type counts) ─────────
    await updateStreak(pool, email);

    res.json({ message: "Transaction added" });
  });

  return router;
}

// ── Helpers ───────────────────────────────────────────────────

/**
 * Upsert quest progress.
 * NEVER touches a quest row where claimed = true — this is the core bug fix.
 * Uses progress value directly (absolute count/amount, not delta).
 */
async function upsertProgress(
  pool: any,
  email: string,
  questId: string,
  progressValue: number,
  goal: number
) {
  const completed = progressValue >= goal;
  // Clamp progress at goal so it never shows "12/10"
  const clampedProgress = Math.min(progressValue, goal);

  await pool.query(
    `INSERT INTO user_quests (email, quest_id, progress, completed, claimed)
     VALUES ($1, $2, $3, $4, false)
     ON CONFLICT (email, quest_id) DO UPDATE
       SET progress  = EXCLUDED.progress,
           completed = EXCLUDED.completed
       WHERE user_quests.claimed = false`, 
    [email, questId, clampedProgress, completed]
  );
}

/**
 * Daily streak tracking.
 * Marks streak quests as complete when thresholds are hit.
 * Only fires once per day.
 */
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
  if (alreadyToday) return; // already counted today

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const wasYesterday = lastActive && lastActive.getTime() === yesterday.getTime();

  const newStreak = wasYesterday ? user.streak + 1 : 1;
  const coinReward = Math.min(newStreak * 10, 50);

  await pool.query(
    "UPDATE users SET streak = $1, last_active = $2, coins = coins + $3 WHERE email = $4",
    [newStreak, today.toISOString().split("T")[0], coinReward, email]
  );

  // Update streak quest progress using same upsertProgress logic
  const streakQuests = [
    { id: "streak_3", goal: 3 },
    { id: "streak_7", goal: 7 },
  ];
  for (const q of streakQuests) {
    await upsertProgress(pool, email, q.id, newStreak, q.goal);
  }
}
