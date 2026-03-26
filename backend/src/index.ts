import express = require("express");
import cors = require("cors");
import jwt = require("jsonwebtoken");

const app = express();
const SECRET = "SECRET_KEY";

const users: any[] = [];
const transactions: any = {};

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
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}


// тест
app.get("/", (req, res) => {
  res.send("MoneyQuest API работает 🚀");
});


// REGISTER
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const exists = users.find(u => u.email === email);

  if (exists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const user = { email, password };
  users.push(user);

  transactions[email] = [];

  res.json({ message: "User created" });
});


// LOGIN (🔥 теперь с JWT)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user || user.password !== password) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ email }, SECRET, { expiresIn: "1h" });

  res.json({
    message: "Login successful",
    token
  });
});


// PROFILE
app.get("/profile", authMiddleware, (req: any, res) => {
  res.json({
    message: "Protected data 🔒",
    user: req.user,
  });
});


// 🔥 ТРАНЗАКЦИИ

// получить
app.get("/transactions/:email", (req, res) => {
  const { email } = req.params;
  res.json(transactions[email] || []);
});

// добавить
app.post("/transactions", (req, res) => {
  const { email, transaction } = req.body;

  if (!transactions[email]) {
    transactions[email] = [];
  }

  transactions[email].unshift(transaction);

  res.json({ message: "Transaction added" });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});