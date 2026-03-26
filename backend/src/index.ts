import express = require("express");
import cors = require("cors");
import jwt = require("jsonwebtoken");

const app = express();
const SECRET = "SECRET_KEY";

// временное хранилище пользователей
const users: any[] = [];

app.use(cors());
app.use(express.json());


// 🔒 middleware проверки токена
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


// тестовый роут
app.get("/", (req, res) => {
  res.send("MoneyQuest API работает 🚀");
});


// регистрация
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = { email, password };
  users.push(newUser);

  res.json({ message: "User created successfully" });
});


// логин
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email: user.email },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    token
  });
});


// 🔥 ЗАЩИЩЕННЫЙ РОУТ
app.get("/profile", authMiddleware, (req: any, res) => {
  res.json({
    message: "Protected data 🔒",
    user: req.user,
  });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});