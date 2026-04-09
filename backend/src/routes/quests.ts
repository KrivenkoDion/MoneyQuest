// src/routes/quests.ts
// KEY FIXES vs previous version:
//   - Returns progress and goal on every quest (for progress bar + "X/Y" display)
//   - Claimed quests are EXCLUDED from the response entirely (hidden from active list)
//   - locked_by check is unchanged
//   - Claim endpoint double-checks completed && !claimed before awarding

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { QUESTS } from "../config/quests";
import { addXP, addCoins } from "../utils/xp";

export function questRoutes(pool: any) {
  const router = Router();

  // GET QUESTS
  // Returns only active + claimable quests.
  // Claimed quests are excluded — they've been completed and rewarded.
  // Each quest includes: progress, goal, remaining for UI display.
  router.get("/quests", authMiddleware, async (req: any, res) => {
    const email = req.user.email;

    const result = await pool.query(
      "SELECT quest_id, progress, completed, claimed FROM user_quests WHERE email = $1",
      [email]
    );

    const userQuestMap: Record<string, any> = {};
    for (const row of result.rows) {
      userQuestMap[row.quest_id] = row;
    }

    const quests = QUESTS
      // 1. Hide quests whose prerequisite hasn't been claimed yet
      .filter((q: any) => {
        if (!q.locked_by) return true;
        return userQuestMap[q.locked_by]?.claimed === true;
      })
      // 2. Hide quests that are already claimed (completed + rewarded)
      .filter((q: any) => {
        return userQuestMap[q.id]?.claimed !== true;
      })
      .map((q: any) => {
        const row = userQuestMap[q.id];
        const progress = row?.progress || 0;
        const goal     = q.goal;
        // claimable = progress reached goal AND not yet claimed
        const claimable = progress >= goal && !row?.claimed;

        return {
          id:          q.id,
          title:       q.title,
          description: q.description,
          xp_reward:   q.xp_reward,
          coin_reward: q.coin_reward,
          goal,
          progress,
          remaining:   Math.max(goal - progress, 0),
          claimable,  // explicit field — frontend uses this, not derived booleans
          completed:   row?.completed || false,  // kept for icon logic
        };
      });

    res.json(quests);
  });

  // CLAIM QUEST REWARD
  router.post("/quests/:questId/claim", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { questId } = req.params;

    const quest = QUESTS.find((q: any) => q.id === questId);
    if (!quest) return res.status(404).json({ error: "Quest not found" });

    const result = await pool.query(
      "SELECT progress, completed, claimed FROM user_quests WHERE email = $1 AND quest_id = $2",
      [email, questId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Quest not started" });
    }

    const row = result.rows[0];

    // Guard: must be completed (progress >= goal)
    if (!row.completed) {
      return res.status(400).json({ error: "Quest not completed yet" });
    }

    // Guard: must not already be claimed
    if (row.claimed) {
      return res.status(400).json({ error: "Already claimed" });
    }

    // Mark as claimed — after this, transactions will never update this row again
    await pool.query(
      "UPDATE user_quests SET claimed = true WHERE email = $1 AND quest_id = $2",
      [email, questId]
    );

    await addXP(pool, email, (quest as any).xp_reward);
    await addCoins(pool, email, (quest as any).coin_reward);

    res.json({
      message:     "Reward claimed",
      xp_reward:   (quest as any).xp_reward,
      coin_reward: (quest as any).coin_reward,
    });
  });

  return router;
}
