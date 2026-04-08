import express = require("express");
import cors = require("cors");
import jwt = require("jsonwebtoken");
import bcrypt = require("bcrypt");
import dotenv = require("dotenv");
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const { Pool } = require("pg");
const app = express();
const SECRET = process.env.JWT_SECRET || "fallback_secret";

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
// 🧹 RESET DB
// =======================
//app.get("/reset-db", async (req, res) => {
  //await pool.query("DROP TABLE IF EXISTS users");
  //await pool.query("DROP TABLE IF EXISTS transactions");

  //await pool.query(`
    //CREATE TABLE users (
      //id SERIAL PRIMARY KEY,
      //email TEXT UNIQUE,
      //password TEXT
    //);
  //`);

  //await pool.query(`
    //CREATE TABLE transactions (
      //id SERIAL PRIMARY KEY,
      //email TEXT,
      //amount INT,
      //description TEXT,
      //category TEXT
    //);
  //`);

  //res.send("DB RESET ✅");
//});


//app.get("/migrate", async (req, res) => {
  //await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'warrior'");
  //await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0");
  //res.send("Migration done ✅");
//});

//app.get("/migrate", async (req, res) => {
  //await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_income INT DEFAULT 0");
  //await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS income_day INT DEFAULT 1");
  //res.send("Migration done ✅");
//});

//app.get("/migrate", async (req, res) => {
  //await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'");

  //await pool.query(`
    //UPDATE users SET role = 'admin' WHERE email = 'admin@email.com'
  //`);

  //res.send("Migration done ✅");
//});

// =======================
// 🎮 GAMIFICATION MIGRATE 
// =======================
app.get("/migrate-gamification", async (req, res) => {
  // XP already exists on users table (xp INT)
  // Add quests table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_quests (
      id SERIAL PRIMARY KEY,
      email TEXT,
      quest_id TEXT,
      completed BOOLEAN DEFAULT false,
      claimed BOOLEAN DEFAULT false,
      UNIQUE(email, quest_id)
    );
  `);
  // Add shop purchases table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_items (
      id SERIAL PRIMARY KEY,
      email TEXT,
      item_id TEXT,
      UNIQUE(email, item_id)
    );
  `);
  res.send("Gamification migration done ✅");
});

// =======================
// REGISTER
// =======================
app.post("/register", async (req, res) => {
  const { email, password, name, avatar } = req.body;

  const exists = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (exists.rows.length > 0) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10); // ✅ хэшируем

  await pool.query(
    "INSERT INTO users (email, password, name, avatar) VALUES ($1, $2, $3, $4)",
    [email, hashedPassword, name, avatar || "brown"]
  );

  const token = jwt.sign({ email, name }, SECRET, { expiresIn: "1h" });
  res.json({ message: "User created", token });
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

  const isMatch = await bcrypt.compare(password, user.password); // ✅ сравниваем

  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ email, name: user.name, role: user.role }, SECRET, { expiresIn: "1h" });

  res.json({ token });
});


// =======================
// PROFILE
// =======================
app.get("/profile", authMiddleware, async (req: any, res) => {
  const email = req.user.email;

  const result = await pool.query(
    "SELECT email, name, avatar, xp, monthly_income, income_day FROM users WHERE email = $1",
    [email]
  );

  res.json({ user: result.rows[0] });
});


// AVATAR UPDATE
app.post("/update-avatar", authMiddleware, async (req: any, res) => {
  const email = req.user.email;
  const { avatar } = req.body;

  await pool.query(
    "UPDATE users SET avatar = $1 WHERE email = $2",
    [avatar, email]
  );

  res.json({ message: "Avatar updated" });
});

// =======================
// MONTHLY INCOME
// =======================
app.post("/update-income", authMiddleware, async (req: any, res) => {
  const email = req.user.email;
  const { monthly_income, income_day } = req.body;

  await pool.query(
    "UPDATE users SET monthly_income = $1, income_day = $2 WHERE email = $3",
    [monthly_income, income_day, email]
  );

  res.json({ message: "Income updated" });
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
app.get("/users", authMiddleware, async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// ADMIN

app.get("/admin/users", authMiddleware, async (req: any, res) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const result = await pool.query(
    "SELECT id, email, name, role FROM users ORDER BY id DESC"
  );

  res.json(result.rows);
});


app.get("/make-admin", async (req, res) => {
  await pool.query(`
    UPDATE users SET role = 'admin' WHERE email = 'admin@email.com'
  `);

  res.send("You are admin now 🔥");
});


// Reset DataBase
app.post("/admin/reset", authMiddleware, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  await pool.query("TRUNCATE TABLE transactions RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

  res.json({ message: "Database reset successful" });
});