// src/routes/quests.ts
// Added vs previous version:
//   - Claiming a quest now grants 1 lootbox (UPDATE users SET lootboxes = lootboxes + 1)
//   - Response includes lootbox_granted: true so frontend can show the reward

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { QUESTS } from "../config/quests";
import { addXP, addCoins } from "../utils/xp";

export function questRoutes(pool: any) {
  const router = Router();

  // GET /quests
  router.get("/quests", authMiddleware, async (req: any, res) => {
    const email = req.user.email;

    const result = await pool.query(
      "SELECT quest_id, progress, completed, claimed, started_at FROM user_quests WHERE email = $1",
      [email]
    );

    const userQuestMap: Record<string, any> = {};
    for (const row of result.rows) {
      userQuestMap[row.quest_id] = row;
    }

    const unlockedQuests = QUESTS.filter((q: any) => {
      if (!q.locked_by) return true;
      return userQuestMap[q.locked_by]?.claimed === true;
    });

    for (const q of unlockedQuests) {
      if (!userQuestMap[q.id]) {
        await pool.query(
          `INSERT INTO user_quests (email, quest_id, progress, completed, claimed, started_at)
           VALUES ($1, $2, 0, false, false, NOW())
           ON CONFLICT (email, quest_id) DO NOTHING`,
          [email, q.id]
        );
        userQuestMap[q.id] = { progress: 0, completed: false, claimed: false };
      }
    }

    const quests = unlockedQuests
      .filter((q: any) => userQuestMap[q.id]?.claimed !== true)
      .map((q: any) => {
        const row      = userQuestMap[q.id];
        const progress = row?.progress || 0;
        const goal     = q.goal;
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
          claimable,
          completed:   row?.completed || false,
        };
      });

    res.json(quests);
  });

  // POST /quests/:questId/claim
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

    if (!row.completed) {
      return res.status(400).json({ error: "Quest not completed yet" });
    }
    if (row.claimed) {
      return res.status(400).json({ error: "Already claimed" });
    }

    await pool.query(
      "UPDATE user_quests SET claimed = true WHERE email = $1 AND quest_id = $2",
      [email, questId]
    );

    const newLevel = await addXP(pool, email, (quest as any).xp_reward);
    await addCoins(pool, email, (quest as any).coin_reward);

    // 🎁 Grant 1 lootbox only on level-up
    if (newLevel) {
      await pool.query(
        "UPDATE users SET lootboxes = lootboxes + 1 WHERE email = $1",
        [email]
      );
    }

    res.json({
      message:          "Reward claimed",
      xp_reward:        (quest as any).xp_reward,
      coin_reward:      (quest as any).coin_reward,
      level_up:         newLevel,
      lootbox_granted:  !!newLevel,
    });
  });

  return router;
}
