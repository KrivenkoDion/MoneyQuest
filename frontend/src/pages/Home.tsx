import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

type Transaction = {
  amount: number;
  description: string;
  category: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  food: "☕",
  transport: "🚗",
  fun: "🎮",
  income: "💼",
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
  const [questToast, setQuestToast] = useState(false);

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    fetch("https://moneyquest-pcoq.onrender.com/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch(() => {});
  }, [token]);

  const balance = transactions.reduce((sum, t) => {
    return t.category === "income" ? sum + t.amount : sum - t.amount;
  }, 0);

  const addTransaction = async () => {
    const value = Number(amount);
    if (!value || value <= 0) return;

    const newTransaction = {
      amount: value,
      description: type === "income" ? "Income" : description,
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

    // 🎮 Show toast if expense quest just triggered
    if (type === "expense") {
      setQuestToast(true);
      setTimeout(() => setQuestToast(false), 3000);
    }
  };

  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#f5f5f0",
      maxWidth: 390,
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      paddingBottom: 100,
    },
    header: {
      padding: "20px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logo: { fontWeight: 700, fontSize: 16, color: "#1a1a2e" },
    bell: {
      width: 36, height: 36, borderRadius: "50%",
      background: "#e8e8e0", display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: 16,
    },
    balanceSection: { padding: "0 24px 24px" },
    balanceLabel: { margin: "0 0 4px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 },
    balanceValue: { margin: "0 0 4px", fontSize: 36, fontWeight: 800, color: "#1a1a2e" },
    balanceSub: { margin: 0, fontSize: 13, color: "#4caf50" },
    actions: { display: "flex", gap: 12, marginTop: 20 },
    btnExpense: {
      flex: 1, padding: "14px 0", borderRadius: 14,
      border: "none", background: "#1a1a2e", color: "white",
      fontSize: 14, fontWeight: 600, cursor: "pointer",
    },
    btnIncome: {
      flex: 1, padding: "14px 0", borderRadius: 14,
      border: "2px solid #1a1a2e", background: "transparent", color: "#1a1a2e",
      fontSize: 14, fontWeight: 600, cursor: "pointer",
    },
    card: {
      background: "white", borderRadius: 20,
      padding: "20px", margin: "0 24px 16px",
    },
    cardLabel: { margin: "0 0 4px", fontSize: 11, color: "#c9a84c", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
    cardTitle: { margin: "0 0 12px", fontSize: 20, fontWeight: 700, color: "#1a1a2e" },
    progressBar: { height: 6, borderRadius: 3, background: "#f0f0ea", marginBottom: 8 },
    progressFill: { height: "100%", borderRadius: 3, background: "#1a1a2e", width: "65%" },
    progressRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#999" },
    activityItem: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0", borderBottom: "1px solid #f5f5f0",
    },
    activityLeft: { display: "flex", alignItems: "center", gap: 12 },
    activityIcon: {
      width: 40, height: 40, borderRadius: 12,
      background: "#f5f5f0", display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: 18,
    },
    activityName: { margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1a2e" },
    activityDate: { margin: 0, fontSize: 12, color: "#999" },
    income: { fontSize: 14, fontWeight: 700, color: "#4caf50" },
    expense: { fontSize: 14, fontWeight: 700, color: "#e53935" },
    navBar: {
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: 390, background: "white", display: "flex",
      justifyContent: "space-around", padding: "12px 0 24px",
      borderTop: "1px solid #f0f0ea",
    },
    navItem: {
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 4, fontSize: 10, color: "#999", cursor: "pointer", border: "none",
      background: "none", fontFamily: "'Inter', sans-serif",
    },
    navItemActive: {
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 4, fontSize: 10, color: "#1a1a2e", fontWeight: 700, cursor: "pointer",
      border: "none", background: "none", fontFamily: "'Inter', sans-serif",
    },
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100,
    },
    modal: {
      background: "white", borderRadius: "24px 24px 0 0",
      padding: "28px 24px 48px", width: "100%", maxWidth: 390,
    },
    modalTitle: { margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "#1a1a2e" },
    input: {
      width: "100%", padding: "14px 16px", borderRadius: 12,
      border: "1.5px solid #e8e8e0", fontSize: 15, marginBottom: 12,
      boxSizing: "border-box" as const, outline: "none", fontFamily: "'Inter', sans-serif",
    },
    select: {
      width: "100%", padding: "14px 16px", borderRadius: 12,
      border: "1.5px solid #e8e8e0", fontSize: 15, marginBottom: 12,
      boxSizing: "border-box" as const, outline: "none", fontFamily: "'Inter', sans-serif",
      background: "white",
    },
    saveBtn: {
      width: "100%", padding: 16, borderRadius: 14,
      border: "none", background: "#1a1a2e", color: "white",
      fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 10,
    },
    cancelBtn: {
      width: "100%", padding: 16, borderRadius: 14,
      border: "none", background: "#f5f5f0", color: "#1a1a2e",
      fontSize: 15, fontWeight: 600, cursor: "pointer",
    },
  };

  return (
    <div style={s.page}>

      {/* QUEST TOAST */}
      {questToast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "#1a1a2e", color: "white", borderRadius: 14,
          padding: "12px 20px", fontSize: 14, fontWeight: 600,
          zIndex: 200, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          🏆 Quest unlocked! Go claim your XP →
        </div>
      )}

      {/* HEADER */}
      <div style={s.header}>
        <span style={s.logo}>MoneyQuest</span>
        <div style={s.bell}>🔔</div>
      </div>

      {/* BALANCE */}
      <div style={s.balanceSection}>
        <p style={s.balanceLabel}>Available Balance</p>
        <h1 style={s.balanceValue}>{balance.toFixed(2)} €</h1>
        <p style={s.balanceSub}>↑ tracked via MoneyQuest</p>

        {/* ACTIONS */}
        <div style={s.actions}>
          <button style={s.btnExpense} onClick={() => { setType("expense"); setShowModal(true); }}>
            + Add Expense
          </button>
          <button style={s.btnIncome} onClick={() => { setType("income"); setShowModal(true); }}>
            + Add Income
          </button>
        </div>
      </div>

      {/* ACTIVE QUEST */}
      <div style={s.card}>
        <p style={s.cardLabel}>Active Quest</p>
        <h3 style={s.cardTitle}>Save 1,000€</h3>
        <div style={s.progressBar}>
          <div style={s.progressFill} />
        </div>
        <div style={s.progressRow}>
          <span>650€ saved</span>
          <span>65%</span>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>Recent Activity</h3>
          <span style={{ fontSize: 13, color: "#999", cursor: "pointer" }}>View all</span>
        </div>

        {transactions.length === 0 ? (
          <p style={{ color: "#999", fontSize: 14 }}>No transactions yet</p>
        ) : (
          transactions.slice(0, 5).map((t, i) => (
            <div key={i} style={s.activityItem}>
              <div style={s.activityLeft}>
                <div style={s.activityIcon}>
                  {CATEGORY_ICONS[t.category] || "💳"}
                </div>
                <div>
                  <p style={s.activityName}>{t.description}</p>
                  <p style={s.activityDate}>{t.category}</p>
                </div>
              </div>
              <span style={t.category === "income" ? s.income : s.expense}>
                {t.category === "income" ? "+" : "-"}{t.amount}€
              </span>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitle}>{type === "income" ? "Add Income" : "Add Expense"}</h3>

            {type === "expense" && (
              <>
                <input
                  style={s.input}
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <select
                  style={s.select}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="food">🍕 Food</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="fun">🎮 Fun</option>
                </select>
              </>
            )}

            <input
              style={s.input}
              type="number"
              placeholder="Amount (€)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <button style={s.saveBtn} onClick={addTransaction}>Save</button>
            <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={s.navBar}>
        <button style={s.navItemActive}>
          <span style={{ fontSize: 20 }}>🏠</span>
          HOME
        </button>
        <button style={s.navItem} onClick={() => navigate("/achievements")}>
          <span style={{ fontSize: 20 }}>🏆</span>
          QUESTS
        </button>
        <button style={s.navItem}>
          <span style={{ fontSize: 20 }}>🎖️</span>
          MEDALS
        </button>
        <button style={s.navItem} onClick={() => navigate("/profile")}>
          <span style={{ fontSize: 20 }}>👤</span>
          PROFILE
        </button>
      </div>

    </div>
  );
}

export default Home;