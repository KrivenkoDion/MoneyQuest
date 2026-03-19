import { useState, useEffect } from "react";

type Transaction = {
  amount: number;
  description: string;
  category: string;
};

function App() {
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem("balance");
    return saved ? Number(saved) : 1000;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");

  useEffect(() => {
    localStorage.setItem("balance", balance.toString());
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [balance, transactions]);

  const addExpense = () => {
    const value = Number(amount);

    if (!value || value <= 0 || description.trim() === "") return;

    const newTransaction = {
      amount: value,
      description: description,
      category: category,
    };

    setTransactions([newTransaction, ...transactions]);
    setBalance(balance - value);

    setAmount("");
    setDescription("");
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>MoneyQuest 💰</h1>

      {/* Баланс */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          borderRadius: 10,
          background: "#f5f5f5",
        }}
      >
        <h2>Баланс</h2>
        <h1>{balance} €</h1>
      </div>

      {/* Ввод */}
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Описание (еда, такси...)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: 10,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 10,
            width: "100%",
          }}
        />

        {/* Категория */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: 10,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 10,
            width: "100%",
          }}
        >
          <option value="food">🍔 Еда</option>
          <option value="transport">🚕 Транспорт</option>
          <option value="fun">🎮 Развлечения</option>
        </select>

        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            padding: 10,
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginRight: 10,
          }}
        />

        <button
          onClick={addExpense}
          style={{
            padding: "10px 16px",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            background: "#4CAF50",
            color: "white",
            cursor: "pointer",
          }}
        >
          Добавить
        </button>
      </div>

      {/* Список */}
      <div style={{ marginTop: 30 }}>
        <h3>Последние операции</h3>

        {transactions.length === 0 ? (
          <p>Пока пусто...</p>
        ) : (
          transactions.map((t, index) => (
            <div
              key={index}
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 8,
                background: "#f9f9f9",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {t.description} ({t.category})
              </span>
              <span>-{t.amount} €</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;