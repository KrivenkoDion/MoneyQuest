import { Router } from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const SECRET = process.env.JWT_SECRET || "fallback_secret";

export function authRoutes(pool: any) {
  const router = Router();

  // REGISTER
  router.post("/register", async (req, res) => {
    const email = req.body.email.toLowerCase().trim();
    const { password, name, avatar } = req.body;

    const exists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email, password, name, avatar) VALUES ($1, $2, $3, $4)",
      [email, hashedPassword, name, avatar || "brown"]
    );

    const token = jwt.sign({ email, name, role: "user" }, SECRET, { expiresIn: "1h" });
    res.json({ message: "User created", token });
  });

  // LOGIN
  router.post("/login", async (req, res) => {
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email, name: user.name, role: user.role },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  });

  return router;
}