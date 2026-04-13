// src/pages/Stats.tsx
// New page: /stats
// Shows monthly spending stats with PieChart (recharts) + income/expense totals
// Uses existing transaction data, consistent UI style

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Transaction = {
  amount: number;
  description: string;
  category: string;
  created_at?: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  food:      "#c9a84c",
  transport: "#4A90D9",
  fun:       "#7B68EE",
  income:    "#4caf50",
};

const API = "https://moneyquest-pcoq.onrender.com";

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });
}

function Stats() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const now = new Date();
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  // Build month options from available transactions (last 12 months)
  const monthOptions = useMemo(() => {
    const opts: { year: number; month: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i);
      opts.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return opts;
  }, []);

  // Filter transactions for selected month
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (!t.created_at) return false;
      const d = new Date(t.created_at);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [transactions, selectedYear, selectedMonth]);

  const totalIncome  = filtered.filter(t => t.category === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.category !== "income").reduce((s, t) => s + t.amount, 0);

  // Pie chart: expense categories only
  const pieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filtered.filter(t => t.category !== "income").forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const s: Record<string, React.CSSProperties> = {
    page:      { minHeight: "100vh", background: "#f5f5f0", maxWidth: 390, margin: "0 auto", fontFamily: "'Inter', sans-serif", paddingBottom: 100 },
    header:    { padding: "20px 24px 16px", display: "flex", alignItems: "center", gap: 12 },
    backBtn:   { width: 36, height: 36, borderRadius: "50%", background: "#e8e8e0", border: "none", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    title:     { margin: 0, fontSize: 20, fontWeight: 700, color: "#1a1a2e" },
    card:      { background: "white", borderRadius: 20, padding: "20px", margin: "0 24px 16px" },
    select:    { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e8e8e0", fontSize: 14, background: "white", fontFamily: "'Inter', sans-serif", color: "#1a1a2e", outline: "none", boxSizing: "border-box" as const },
    statRow:   { display: "flex", gap: 12 },
    statBox:   { flex: 1, borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", gap: 4 },
    navBar:    { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: "white", display: "flex", justifyContent: "space-around", padding: "12px 0 24px", borderTop: "1px solid #f0f0ea" },
    navItem:   { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10, color: "#999", cursor: "pointer", border: "none", background: "none", fontFamily: "'Inter', sans-serif" },
    navItemActive: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10, color: "#1a1a2e", fontWeight: 700, cursor: "pointer", border: "none", background: "none", fontFamily: "'Inter', sans-serif" },
  };

  return (
    <div style={s.page}>
      {/* HEADER */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate("/home")}>←</button>
        <h2 style={s.title}>Monthly Stats</h2>
      </div>

      {/* MONTH SELECTOR */}
      <div style={{ padding: "0 24px 16px" }}>
        <select style={s.select}
          value={`${selectedYear}-${selectedMonth}`}
          onChange={e => {
            const [y, m] = e.target.value.split("-").map(Number);
            setSelectedYear(y); setSelectedMonth(m);
          }}>
          {monthOptions.map(o => (
            <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
              {getMonthLabel(o.year, o.month)}
            </option>
          ))}
        </select>
      </div>

      {/* TOTALS */}
      <div style={{ margin: "0 24px 16px" }}>
        <div style={s.statRow}>
          <div style={{ ...s.statBox, background: "#e8f5e9" }}>
            <span style={{ fontSize: 11, color: "#4caf50", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Income</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#2e7d32" }}>+{totalIncome.toFixed(2)}€</span>
          </div>
          <div style={{ ...s.statBox, background: "#fce4ec" }}>
            <span style={{ fontSize: 11, color: "#e53935", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Spent</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#c62828" }}>-{totalExpense.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {/* PIE CHART */}
      <div style={s.card}>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Spending by Category</p>
        {pieData.length === 0 ? (
          <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: "24px 0" }}>No expenses this month</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={CATEGORY_COLORS[entry.name] || "#9e9e9e"} />
                ))}
              </Pie>
              <Tooltip formatter={((value: number) => `${value.toFixed(2)}€`) as any} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* TRANSACTION LIST */}
      <div style={s.card}>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>
          Transactions ({filtered.length})
        </p>
        {filtered.length === 0 ? (
          <p style={{ color: "#999", fontSize: 14 }}>No transactions this month</p>
        ) : (
          filtered.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < filtered.length - 1 ? "1px solid #f5f5f0" : "none" }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{t.description}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
                  {t.category}
                  {t.created_at ? ` · ${new Date(t.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}` : ""}
                </p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.category === "income" ? "#4caf50" : "#e53935" }}>
                {t.category === "income" ? "+" : "-"}{t.amount}€
              </span>
            </div>
          ))
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={s.navBar}>
        <button style={s.navItem} onClick={() => navigate("/home")}><span style={{ fontSize: 20 }}>🏠</span>HOME</button>
        <button style={s.navItem} onClick={() => navigate("/achievements")}><span style={{ fontSize: 20 }}>🏆</span>QUESTS</button>
        <button style={s.navItemActive}><span style={{ fontSize: 20 }}>📊</span>STATS</button>
        <button style={s.navItem} onClick={() => navigate("/profile")}><span style={{ fontSize: 20 }}>👤</span>PROFILE</button>
      </div>
    </div>
  );
}

export default Stats;