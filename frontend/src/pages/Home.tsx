import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Transaction = {
  amount: number;
  description: string;
  category: string;
};

function Home() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser) {
    window.location.href = "/";
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [income, setIncome] = useState("");

  // 🔥 Загрузка транзакций с backend
  useEffect(() => {
    fetch(`https://moneyquest-pcoq.onrender.com/transactions/${currentUser.email}`)
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(() => alert("Ошибка загрузки данных"));
  }, []);

  // 💰 Баланс считается автоматически
  const balance = transactions.reduce((sum, t) => {
    return t.category === "income" ? sum + t.amount : sum - t.amount;
  }, 1000);

  // ➖ расход
  const addExpense = async () => {
    const value = Number(amount);

    if (!value || value <= 0 || description.trim() === "" || !category) return;

    const newTransaction = {
      amount: value,
      description,
      category,
    };

    await fetch("https://moneyquest-pcoq.onrender.com/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: currentUser.email,
        transaction: newTransaction,
      }),
    });

    setTransactions([newTransaction, ...transactions]);

    setAmount("");
    setDescription("");
  };

  // ➕ доход
  const addIncome = async () => {
    const value = Number(income);

    if (!value || value <= 0) return;

    const newTransaction = {
      amount: value,
      description: "Пополнение",
      category: "income",
    };

    await fetch("https://moneyquest-pcoq.onrender.com/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: currentUser.email,
        transaction: newTransaction,
      }),
    });

    setTransactions([newTransaction, ...transactions]);

    setIncome("");
  };

  // 📊 диаграмма
  const data = Object.values(
    transactions
      .filter((t) => t.category !== "income")
      .reduce((acc: any, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { name: t.category, value: 0 };
        }
        acc[t.category].value += t.amount;
        return acc;
      }, {})
  );

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#2ecc71"];

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>MoneyQuest 💰</h1>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={() => navigate("/profile")}>Профиль</button>
        <button onClick={() => navigate("/achievements")}>Ачивки</button>
      </div>

      <h2>Баланс: {balance} €</h2>

      {/* ➖ расход */}
      <div>
        <input
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="food">Еда</option>
          <option value="transport">Транспорт</option>
          <option value="fun">Развлечения</option>
        </select>

        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button onClick={addExpense}>Добавить</button>
      </div>

      {/* ➕ доход */}
      <div style={{ marginTop: 20 }}>
        <input
          type="number"
          placeholder="Пополнение"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />

        <button onClick={addIncome}>Пополнить</button>
      </div>

      {/* 📊 график */}
      <div style={{ marginTop: 30 }}>
        {data.length > 0 && (
          <PieChart width={300} height={300}>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%">
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </div>

      {/* 📋 список */}
      <div style={{ marginTop: 30 }}>
        <h3>Операции</h3>

        {transactions.length === 0 ? (
          <p>Пусто</p>
        ) : (
          transactions.map((t, i) => (
            <div key={i}>
              {t.description} — {t.category} — {t.amount} €
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;