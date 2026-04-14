// src/pages/Stats.tsx
// UI/UX polish pass:
//   - Page fade-in, card shadows, consistent border-radius
//   - Stat boxes: bigger numbers, better typography
//   - Stat boxes: subtle hover lift
//   - Transaction rows: hover highlight
//   - Month selector: cleaner styling
//   - Nav: active dot indicator, icon hover lift

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

const CATEGORY_ICONS: Record<string, string> = {
  food: "☕", transport: "🚗", fun: "🎮", income: "💼",
};

const API = "https://moneyquest-pcoq.onrender.com";

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });
}

function Stats() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  const now = new Date();
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : []);
        setTimeout(() => setLoaded(true), 60);
      })
      .catch(() => setLoaded(true));
  }, [token]);

  const monthOptions = useMemo(() => {
    const opts: { year: number; month: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i);
      opts.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return opts;
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (!t.created_at) return false;
      const d = new Date(t.created_at);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [transactions, selectedYear, selectedMonth]);

  const totalIncome  = filtered.filter(t => t.category === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.category !== "income").reduce((s, t) => s + t.amount, 0);
  const net          = totalIncome - totalExpense;

  const pieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filtered.filter(t => t.category !== "income").forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        @keyframes mq-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mq-page { animation: mq-fadein 0.35s ease both; }

        .mq-card {
          background: white;
          border-radius: 22px;
          padding: 20px;
          margin: 0 16px 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
        }

        .mq-stat-box {
          flex: 1;
          border-radius: 18px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .mq-stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }

        .mq-activity-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 8px; border-radius: 12px; margin: 0 -8px;
          border-bottom: 1px solid #f5f5f0;
          transition: background 0.15s ease;
        }
        .mq-activity-row:last-child { border-bottom: none; }
        .mq-activity-row:hover { background: #f9f9f6; }

        .mq-btn {
          transition: transform 0.15s ease, opacity 0.15s ease;
          cursor: pointer;
        }
        .mq-btn:hover  { opacity: 0.88; }
        .mq-btn:active { transform: scale(0.95); }

        .mq-back-btn {
          width: 38px; height: 38px; border-radius: 50%;
          background: white; border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .mq-back-btn:hover  { box-shadow: 0 4px 14px rgba(0,0,0,0.12); transform: translateX(-1px); }
        .mq-back-btn:active { transform: scale(0.92); }

        .mq-month-select {
          width: 100%; padding: 13px 16px;
          border-radius: 14px; border: 1.5px solid #e8e8e0;
          font-size: 14px; background: white;
          font-family: 'Inter', sans-serif; color: #1a1a2e;
          outline: none; box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 38px;
        }
        .mq-month-select:focus {
          border-color: #1a1a2e;
          box-shadow: 0 0 0 3px rgba(26,26,46,0.08);
        }

        .mq-nav-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; font-size: 10px; border: none; background: none;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: transform 0.15s ease; padding: 0;
        }
        .mq-nav-btn:active { transform: scale(0.88); }
        .mq-nav-icon {
          font-size: 20px;
          transition: transform 0.15s ease;
        }
        .mq-nav-btn:hover .mq-nav-icon { transform: translateY(-2px); }
      `}</style>

      <div
        className="mq-page"
        style={{
          minHeight: "100vh",
          background: "#f5f5f0",
          maxWidth: 390,
          margin: "0 auto",
          fontFamily: "'Inter', sans-serif",
          paddingBottom: 100,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* HEADER */}
        <div style={{ padding: "22px 20px 14px", display: "flex", alignItems: "center", gap: 12 }}>
          <button className="mq-back-btn" onClick={() => navigate("/home")}>←</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.3px" }}>
            Monthly Stats
          </h2>
        </div>

        {/* MONTH SELECTOR */}
        <div style={{ padding: "0 16px 16px" }}>
          <select
            className="mq-month-select"
            value={`${selectedYear}-${selectedMonth}`}
            onChange={e => {
              const [y, m] = e.target.value.split("-").map(Number);
              setSelectedYear(y); setSelectedMonth(m);
            }}
          >
            {monthOptions.map(o => (
              <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
                {getMonthLabel(o.year, o.month)}
              </option>
            ))}
          </select>
        </div>

        {/* STAT BOXES */}
        <div style={{ display: "flex", gap: 10, margin: "0 16px 14px" }}>
          <div className="mq-stat-box" style={{ background: "#e8f5e9" }}>
            <span style={{ fontSize: 10, color: "#4caf50", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>
              Income
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#2e7d32", letterSpacing: "-0.5px" }}>
              +{totalIncome.toFixed(2)}€
            </span>
          </div>
          <div className="mq-stat-box" style={{ background: "#fce4ec" }}>
            <span style={{ fontSize: 10, color: "#e53935", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>
              Spent
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#c62828", letterSpacing: "-0.5px" }}>
              -{totalExpense.toFixed(2)}€
            </span>
          </div>
          <div className="mq-stat-box" style={{ background: net >= 0 ? "#e8f5e9" : "#fce4ec" }}>
            <span style={{ fontSize: 10, color: net >= 0 ? "#4caf50" : "#e53935", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>
              Net
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: net >= 0 ? "#2e7d32" : "#c62828", letterSpacing: "-0.5px" }}>
              {net >= 0 ? "+" : ""}{net.toFixed(2)}€
            </span>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="mq-card">
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
            Spending by Category
          </p>
          {pieData.length === 0 ? (
            <p style={{ color: "#ccc", fontSize: 14, textAlign: "center", padding: "28px 0" }}>
              No expenses this month
            </p>
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
        <div className="mq-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
              Transactions
            </p>
            <span style={{ fontSize: 12, color: "#bbb", fontWeight: 500 }}>
              {filtered.length} total
            </span>
          </div>
          {filtered.length === 0 ? (
            <p style={{ color: "#ccc", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
              No transactions this month
            </p>
          ) : (
            filtered.map((t, i) => (
              <div key={i} className="mq-activity-row">
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: "#f5f5f0", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {CATEGORY_ICONS[t.category] || "💳"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.3 }}>
                      {t.description}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#bbb", marginTop: 2 }}>
                      {t.category}
                      {t.created_at ? ` · ${new Date(t.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}` : ""}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 700, flexShrink: 0, marginLeft: 8,
                  color: t.category === "income" ? "#4caf50" : "#e53935",
                }}>
                  {t.category === "income" ? "+" : "-"}{t.amount}€
                </span>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM NAV */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: 390, background: "white",
          display: "flex", justifyContent: "space-around",
          padding: "10px 0 26px",
          borderTop: "1px solid #efefec",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.05)",
        }}>
          {([
            { icon: "🏠", label: "HOME",    path: "/home",         active: false },
            { icon: "🏆", label: "QUESTS",  path: "/achievements", active: false },
            { icon: "📊", label: "STATS",   path: "/stats",        active: true  },
            { icon: "👤", label: "PROFILE", path: "/profile",      active: false },
          ] as { icon: string; label: string; path: string; active: boolean }[]).map(item => (
            <button
              key={item.label}
              className="mq-nav-btn"
              style={{ color: item.active ? "#1a1a2e" : "#bbb", fontWeight: item.active ? 700 : 400 }}
              onClick={() => !item.active && navigate(item.path)}
            >
              <span className="mq-nav-icon">{item.icon}</span>
              {item.label}
              {item.active && (
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#1a1a2e", marginTop: 1 }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default Stats;
