// src/routes/quests.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { QUESTS } from "../config/quests";
import { addXP, addCoins } from "../utils/xp";

export function questRoutes(pool: any) {
  const router = Router();

  // GET QUESTS
  // Only shows quests that are either unlocked or have no lock requirement.
  // A quest is visible if its locked_by quest has been claimed (or it has no lock).
  router.get("/quests", authMiddleware, async (req: any, res) => {
    const email = req.user.email;

    const result = await pool.query(
      "SELECT quest_id, completed, claimed FROM user_quests WHERE email = $1",
      [email]
    );

    const userQuestMap: Record<string, any> = {};
    for (const row of result.rows) {
      userQuestMap[row.quest_id] = row;
    }

    const quests = QUESTS
      // Filter: hide quest if its prerequisite hasn't been claimed yet
      .filter((q: any) => {
        if (!q.locked_by) return true;
        return userQuestMap[q.locked_by]?.claimed === true;
      })
      .map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        xp_reward: q.xp_reward,
        coin_reward: q.coin_reward,
        completed: userQuestMap[q.id]?.completed || false,
        claimed:   userQuestMap[q.id]?.claimed   || false,
      }));

    res.json(quests);
  });

  // CLAIM QUEST REWARD
  router.post("/quests/:questId/claim", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { questId } = req.params;

    const quest = QUESTS.find((q: any) => q.id === questId);
    if (!quest) return res.status(404).json({ error: "Quest not found" });

    const result = await pool.query(
      "SELECT * FROM user_quests WHERE email = $1 AND quest_id = $2",
      [email, questId]
    );

    if (result.rows.length === 0 || !result.rows[0].completed) {
      return res.status(400).json({ error: "Quest not completed" });
    }

    if (result.rows[0].claimed) {
      return res.status(400).json({ error: "Already claimed" });
    }

    await pool.query(
      "UPDATE user_quests SET claimed = true WHERE email = $1 AND quest_id = $2",
      [email, questId]
    );

    // Award XP (for leveling) and Coins (for spending)
    await addXP(pool, email, (quest as any).xp_reward);
    await addCoins(pool, email, (quest as any).coin_reward);

    res.json({
      message: "Reward claimed",
      xp_reward: (quest as any).xp_reward,
      coin_reward: (quest as any).coin_reward,
    });
  });

  return router;
}
