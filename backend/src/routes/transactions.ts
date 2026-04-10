// src/routes/transactions.ts
// Changes vs v2:
//   1. Balance safety: expense rejected if it would make balance < 0
//   2. Quest progress counts ONLY transactions after each quest's started_at
//   3. When a quest row is first created, started_at = NOW() is set
//   4. MIN_AMOUNT stays at 1€, daily cap stays at 20

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const MIN_AMOUNT = 1;
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

    if (transaction.category !== "income") {

      // ── 1. Minimum amount ────────────────────────────────────
      if (!transaction.amount || transaction.amount < MIN_AMOUNT) {
        return res.status(400).json({ error: `Minimum transaction amount is ${MIN_AMOUNT}€` });
      }

      // ── 2. Balance safety check ───────────────────────────────
      // Calculate current balance from all transactions
      const balanceResult = await pool.query(
        `SELECT COALESCE(SUM(CASE WHEN category = 'income' THEN amount ELSE -amount END), 0) AS balance
         FROM transactions WHERE email = $1`,
        [email]
      );
      const currentBalance = parseFloat(balanceResult.rows[0].balance);
      if (transaction.amount > currentBalance) {
        return res.status(400).json({
          error: `Insufficient balance. Current balance: ${currentBalance.toFixed(2)}€`,
        });
      }

      // ── 3. Daily cap ─────────────────────────────────────────
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

    // ── Insert transaction ──────────────────────────────────────
    await pool.query(
      "INSERT INTO transactions (email, amount, description, category, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [email, transaction.amount, transaction.description, transaction.category]
    );

    // ── Quest progress (expenses >= 1€ only) ───────────────────
    if (transaction.category !== "income" && transaction.amount >= MIN_AMOUNT) {
      await updateQuestProgress(pool, email);
    }

    // ── Streak (all transaction types) ────────────────────────
    await updateStreak(pool, email);

    res.json({ message: "Transaction added" });
  });

  return router;
}

// ── Quest progress ─────────────────────────────────────────────

async function updateQuestProgress(pool: any, email: string) {
  // Load all active (unclaimed) quest rows for this user, including started_at
  const questRows = await pool.query(
    "SELECT quest_id, started_at, claimed FROM user_quests WHERE email = $1 AND claimed = false",
    [email]
  );

  // Build a map: questId → started_at
  const activeQuests: Record<string, Date> = {};
  for (const row of questRows.rows) {
    activeQuests[row.quest_id] = new Date(row.started_at);
  }

  // For each active quest, count only transactions AFTER started_at
  for (const [questId, startedAt] of Object.entries(activeQuests)) {
    await recalcProgress(pool, email, questId, startedAt);
  }
}

/**
 * Recalculate progress for one quest using only transactions after startedAt.
 * Uses the quest's type to know whether to count rows or sum amounts.
 */
async function recalcProgress(
  pool: any,
  email: string,
  questId: string,
  startedAt: Date
) {
  // Count-based quests
  const countGoals: Record<string, number> = {
    add_expense_once: 1,
    add_expense_5:    5,
    add_expense_10:   10,
    add_expense_20:   20,
    add_expense_50:   50,
  };

  // Amount-based quests
  const amountGoals: Record<string, number> = {
    track_50_euros:  50,
    track_200_euros: 200,
  };

  let progressValue: number;
  let goal: number;

  if (questId in countGoals) {
    goal = countGoals[questId];
    const r = await pool.query(
      `SELECT COUNT(*) AS cnt FROM transactions
       WHERE email = $1
         AND category != 'income'
         AND amount >= 1
         AND created_at > $2`,
      [email, startedAt]
    );
    progressValue = parseInt(r.rows[0].cnt, 10);

  } else if (questId in amountGoals) {
    goal = amountGoals[questId];
    const r = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions
       WHERE email = $1
         AND category != 'income'
         AND amount >= 1
         AND created_at > $2`,
      [email, startedAt]
    );
    progressValue = parseFloat(r.rows[0].total);

  } else {
    return; // streak quests are handled separately
  }

  const clampedProgress = Math.min(progressValue, goal);
  const completed = clampedProgress >= goal;

  // Update progress — WHERE claimed = false ensures we never touch claimed quests
  await pool.query(
    `UPDATE user_quests
     SET progress = $1, completed = $2
     WHERE email = $3 AND quest_id = $4 AND claimed = false`,
    [clampedProgress, completed, email, questId]
  );
}

// ── Streak ─────────────────────────────────────────────────────

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
  if (alreadyToday) return;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const wasYesterday = lastActive && lastActive.getTime() === yesterday.getTime();

  const newStreak = wasYesterday ? user.streak + 1 : 1;
  const coinReward = Math.min(newStreak * 10, 50);

  await pool.query(
    "UPDATE users SET streak = $1, last_active = $2, coins = coins + $3 WHERE email = $4",
    [newStreak, today.toISOString().split("T")[0], coinReward, email]
  );

  // Update streak quest progress (streak quests are NOT count/amount based,
  // so we upsert directly using the new streak value as progress)
  const streakQuests = [
    { id: "streak_3", goal: 3 },
    { id: "streak_7", goal: 7 },
  ];
  for (const q of streakQuests) {
    const clampedProgress = Math.min(newStreak, q.goal);
    const completed = clampedProgress >= q.goal;
    await pool.query(
      `UPDATE user_quests
       SET progress = $1, completed = $2
       WHERE email = $3 AND quest_id = $4 AND claimed = false`,
      [clampedProgress, completed, email, q.id]
    );
  }
}
