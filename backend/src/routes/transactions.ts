import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

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

    await pool.query(
      "INSERT INTO transactions (email, amount, description, category) VALUES ($1, $2, $3, $4)",
      [email, transaction.amount, transaction.description, transaction.category]
    );

    // Mark quest "add_expense_once" as completed (if not already)
    if (transaction.category !== "income") {
      await pool.query(`
        INSERT INTO user_quests (email, quest_id, completed, claimed)
        VALUES ($1, 'add_expense_once', true, false)
        ON CONFLICT (email, quest_id) DO NOTHING
      `, [email]);
    }

    res.json({ message: "Transaction added" });
  });

  return router;
}