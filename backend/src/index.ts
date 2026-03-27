import express = require("express");
import cors = require("cors");
import jwt = require("jsonwebtoken");

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const { Pool } = require("pg");
const app = express();
const SECRET = "SECRET_KEY";

// 🔥 PostgreSQL подключение
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(cors());
app.use(express.json());


// 🔒 middleware
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}


// =======================
// 🧹 RESET DB (ВАЖНО)
// =======================
app.get("/reset-db", async (req, res) => {
  await pool.query("DROP TABLE IF EXISTS users");
  await pool.query("DROP TABLE IF EXISTS transactions");

  await pool.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      email TEXT,
      amount INT,
      description TEXT,
      category TEXT
    );
  `);

  res.send("DB RESET ✅");
});


// =======================
// REGISTER
// =======================
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const exists = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (exists.rows.length > 0) {
    return res.status(400).json({ error: "User already exists" });
  }

  await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2)",
    [email, password]
  );

  res.json({ message: "User created" });
});


// =======================
// LOGIN
// =======================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const user = result.rows[0];

  if (user.password !== password) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ email }, SECRET, { expiresIn: "1h" });

  res.json({ token });
});


// =======================
// PROFILE
// =======================
app.get("/profile", authMiddleware, (req: any, res) => {
  res.json({
    user: req.user
  });
});


// =======================
// ТРАНЗАКЦИИ
// =======================
app.get("/transactions", authMiddleware, async (req: any, res) => {
  const email = req.user.email;

  const result = await pool.query(
    "SELECT * FROM transactions WHERE email = $1 ORDER BY id DESC",
    [email]
  );

  res.json(result.rows);
});

app.post("/transactions", authMiddleware, async (req: any, res) => {
  const email = req.user.email;
  const { transaction } = req.body;

  await pool.query(
    "INSERT INTO transactions (email, amount, description, category) VALUES ($1, $2, $3, $4)",
    [email, transaction.amount, transaction.description, transaction.category]
  );

  res.json({ message: "Transaction added" });
});


// =======================
// DEBUG USERS
// =======================
app.get("/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});