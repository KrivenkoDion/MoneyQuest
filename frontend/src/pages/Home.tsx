import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "../styles.css";

type Transaction = {
  amount: number;
  description: string;
  category: string;
};

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<"expense" | "income">("expense");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");

  // redirect
  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  // load data
  useEffect(() => {
    fetch("https://moneyquest-pcoq.onrender.com/transactions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch(() => alert("Ошибка загрузки"));
  }, [token]);

  const balance = transactions.reduce((sum, t) => {
    return t.category === "income" ? sum + t.amount : sum - t.amount;
  }, 1000);

  const addTransaction = async () => {
    const value = Number(amount);
    if (!value || value <= 0) return;

    const newTransaction = {
      amount: value,
      description: type === "income" ? "Пополнение" : description,
      category: type === "income" ? "income" : category,
    };

    await fetch("https://moneyquest-pcoq.onrender.com/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ transaction: newTransaction }),
    });

    setTransactions([newTransaction, ...transactions]);

    setAmount("");
    setDescription("");
    setShowModal(false);
  };

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
    <div className="home-container">

      {/* HEADER */}
      <div className="home-header">
        <div className="home-logo">MQ</div>
        <h2>MoneyQuest</h2>
      </div>

      {/* BALANCE */}
      <p className="balance-label">AVAILABLE BALANCE</p>
      <h1 className="balance-value">{balance} €</h1>

      {/* ACTIONS */}
      <div className="home-actions">
        <button
          className="btn-expense"
          onClick={() => {
            setType("expense");
            setShowModal(true);
          }}
        >
          + Add Expense
        </button>

        <button
          className="btn-income"
          onClick={() => {
            setType("income");
            setShowModal(true);
          }}
        >
          + Add Income
        </button>
      </div>

      {/* QUEST */}
      <div className="home-card">
        <p className="card-title">ACTIVE QUEST</p>
        <h3 className="card-main">Save 1000€</h3>

        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>

        <div className="progress-row">
          <span>650€ saved</span>
          <span>65%</span>
        </div>
      </div>

      {/* GRAPH */}
      <div className="home-card">
        <h3>Expenses</h3>

        {data.length === 0 ? (
          <p>No data</p>
        ) : (
          <PieChart width={280} height={280}>
            <Pie data={data} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </div>

      {/* ACTIVITY */}
      <div className="home-card">
        <h3>Recent Activity</h3>

        {transactions.slice(0, 5).map((t, i) => (
          <div key={i} className="activity-item">
            <span>{t.description}</span>
            <span className={t.category === "income" ? "income" : "expense"}>
              {t.category === "income" ? "+" : "-"}
              {t.amount}€
            </span>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{type === "income" ? "Add Income" : "Add Expense"}</h3>

            {type === "expense" && (
              <>
                <input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="fun">Fun</option>
                </select>
              </>
            )}

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <button onClick={addTransaction}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

// testik