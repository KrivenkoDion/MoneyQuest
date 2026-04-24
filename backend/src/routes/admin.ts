import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

export function adminRoutes(pool: any) {
  const router = Router();

  // ADD XP (admin only)
  router.post("/admin/add-xp", authMiddleware, async (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { amount } = req.body;
    const email = req.user.email;

    await pool.query(
      "UPDATE users SET xp = xp + $1 WHERE email = $2",
      [amount, email]
    );

    res.json({ message: "XP added", amount });
  });

  // ADD COINS (admin only)
  router.post("/admin/add-coins", authMiddleware, async (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { amount } = req.body;
    const email = req.user.email;

    await pool.query(
      "UPDATE users SET coins = coins + $1 WHERE email = $2",
      [amount, email]
    );

    res.json({ message: "Coins added", amount });
  });

  // GET ALL USERS (admin only)
  router.get("/admin/users", authMiddleware, async (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      "SELECT id, email, name, role FROM users ORDER BY id DESC"
    );

    res.json(result.rows);
  });

  // RESET DATABASE (admin only)
  router.post("/admin/reset", authMiddleware, async (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    await pool.query("TRUNCATE TABLE transactions RESTART IDENTITY CASCADE");
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    res.json({ message: "Database reset successful" });
  });

  // DEBUG: list all users (unprotected — consider removing in production)
  router.get("/users", authMiddleware, async (req, res) => {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  });

  // One-time helper: make admin (consider removing in production)
  router.get("/make-admin", async (req, res) => {
    await pool.query(`
      UPDATE users SET role = 'admin' WHERE email = 'admin@email.com'
    `);
    res.send("You are admin now 🔥");
  });

  return router;
}