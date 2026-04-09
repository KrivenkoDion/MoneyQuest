import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { QUESTS } from "../config/quests";
import { addXP } from "../utils/xp";

export function questRoutes(pool: any) {
  const router = Router();

  // GET QUESTS
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

    const quests = QUESTS.map((q) => ({
      ...q,
      completed: userQuestMap[q.id]?.completed || false,
      claimed:   userQuestMap[q.id]?.claimed   || false,
    }));

    res.json(quests);
  });

  // CLAIM QUEST REWARD
  router.post("/quests/:questId/claim", authMiddleware, async (req: any, res) => {
    const email = req.user.email;
    const { questId } = req.params;

    const quest = QUESTS.find((q) => q.id === questId);
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

    await addXP(pool, email, quest.xp_reward);

    res.json({ message: "Reward claimed", xp_reward: quest.xp_reward });
  });

  return router;
}