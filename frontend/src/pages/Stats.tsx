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
      .then(r => r.json())
      .then(d => { setTransactions(Array.isArray(d) ? d : []); setTimeout(() => setLoaded(true), 60); })
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

  const filtered = useMemo(() =>
    transactions.filter(t => {
      if (!t.created_at) return false;
      const d = new Date(t.created_at);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    }), [transactions, selectedYear, selectedMonth]);

  const totalIncome  = filtered.filter(t => t.category === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.category !== "income").reduce((s, t) => s + t.amount, 0);
  const net          = totalIncome - totalExpense;

  const pieData = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.filter(t => t.category !== "income").forEach(t => { m[t.category] = (m[t.category] || 0) + t.amount; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const NAV_ITEMS = [
    { icon: "🏠", label: "HOME",    path: "/home",         active: false },
    { icon: "🏆", label: "QUESTS",  path: "/achievements", active: false },
    { icon: "📊", label: "STATS",   path: "/stats",        active: true  },
    { icon: "👤", label: "PROFILE", path: "/profile",      active: false },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes stats-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .stats-page { animation: stats-in 0.35s ease both; }

        .s-card {
          background: white; border-radius: 24px; padding: 20px;
          margin: 0 16px 14px;
          box-shadow: 0 2px 14px rgba(0,0,0,0.055), 0 1px 3px rgba(0,0,0,0.04);
        }

        .stat-box {
          flex: 1; border-radius: 18px; padding: 15px 14px;
          display: flex; flex-direction: column; gap: 3px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-box:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(0,0,0,0.1); }

        .activity-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 10px; border-radius: 14px; margin: 0 -10px;
          border-bottom: 1px solid #f3f3ee;
          transition: background 0.15s;
        }
        .activity-row:last-child { border-bottom: none; }
        .activity-row:hover { background: #f9f9f5; }

        .tap {
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.13s cubic-bezier(0.34,1.5,0.64,1), opacity 0.13s;
          cursor: pointer;
        }
        .tap:active { transform: scale(0.93) !important; opacity: 0.8; }

        .month-select {
          width: 100%; padding: 13px 16px;
          border-radius: 16px; border: 1.5px solid #e4e4de;
          font-size: 14px; background: white;
          font-family: inherit; color: #11112a; font-weight: 600;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 38px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .month-select:focus { border-color: #11112a; box-shadow: 0 0 0 3px rgba(17,17,42,0.08); }

        .back-btn {
          width: 40px; height: 40px; border-radius: 50%;
          background: white; border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .back-btn:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateX(-1px); }
        .back-btn:active { transform: scale(0.9); }

        .nav-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; font-size: 10px; border: none; background: none;
          font-family: inherit; cursor: pointer; padding: 0; position: relative;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.15s, color 0.2s;
        }
        .nav-btn:active { transform: scale(0.84); }
        .nav-icon { font-size: 20px; transition: transform 0.2s cubic-bezier(0.34,1.5,0.64,1); display: block; }
        .nav-btn:hover .nav-icon { transform: translateY(-3px); }
        .nav-btn.active .nav-icon { transform: scale(1.12); }
        .nav-pip { position: absolute; top: -7px; left: 50%; transform: translateX(-50%); width: 28px; height: 3px; background: #11112a; border-radius: 0 0 4px 4px; }
      `}</style>

      <div
        className="stats-page"
        style={{
          minHeight: "100vh", background: "#efefea", maxWidth: 390,
          margin: "0 auto", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
          paddingBottom: 100,
          opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease",
        }}
      >
        {/* HEADER */}
        <div style={{ padding: "24px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button className="back-btn" onClick={() => navigate("/home")}>←</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#11112a", letterSpacing: "-0.4px" }}>Monthly Stats</h2>
        </div>

        {/* MONTH SELECTOR */}
        <div style={{ padding: "0 16px 16px" }}>
          <select
            className="month-select"
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
          <div className="stat-box" style={{ background: "#e8f5e9" }}>
            <span style={{ fontSize: 10, color: "#2e7d32", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Income</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#2e7d32", letterSpacing: "-0.5px" }}>+{totalIncome.toFixed(2)}€</span>
          </div>
          <div className="stat-box" style={{ background: "#fce4ec" }}>
            <span style={{ fontSize: 10, color: "#c62828", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Spent</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#c62828", letterSpacing: "-0.5px" }}>−{totalExpense.toFixed(2)}€</span>
          </div>
          <div className="stat-box" style={{ background: net >= 0 ? "#e8f5e9" : "#fce4ec" }}>
            <span style={{ fontSize: 10, color: net >= 0 ? "#2e7d32" : "#c62828", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Net</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: net >= 0 ? "#2e7d32" : "#c62828", letterSpacing: "-0.5px" }}>
              {net >= 0 ? "+" : ""}{net.toFixed(2)}€
            </span>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="s-card">
          <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#11112a" }}>Spending by Category</p>
          {pieData.length === 0 ? (
            <p style={{ color: "#ccc", fontSize: 14, textAlign: "center", padding: "28px 0", fontWeight: 500 }}>No expenses this month</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={56} outerRadius={88} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#9e9e9e"} />
                  ))}
                </Pie>
                <Tooltip formatter={((v: number) => `${v.toFixed(2)}€`) as any} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* TRANSACTION LIST */}
        <div className="s-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#11112a" }}>Transactions</p>
            <span style={{ fontSize: 12, color: "#bbb", fontWeight: 600 }}>{filtered.length} total</span>
          </div>
          {filtered.length === 0 ? (
            <p style={{ color: "#ccc", fontSize: 14, textAlign: "center", padding: "20px 0", fontWeight: 500 }}>No transactions this month</p>
          ) : (
            filtered.map((t, i) => (
              <div key={i} className="activity-row">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13,
                    background: t.category === "income" ? "#e8f5e9" : "#f0f0ea",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {CATEGORY_ICONS[t.category] || "💳"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#11112a", lineHeight: 1.3 }}>{t.description}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#bbb", fontWeight: 500, marginTop: 2 }}>
                      {t.category}{t.created_at ? ` · ${new Date(t.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}` : ""}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, flexShrink: 0, marginLeft: 8, letterSpacing: "-0.3px", color: t.category === "income" ? "#2e7d32" : "#c62828" }}>
                  {t.category === "income" ? "+" : "−"}{t.amount}€
                </span>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM NAV */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: "white", display: "flex", justifyContent: "space-around", padding: "12px 0 28px", borderTop: "1px solid #eaeae4", boxShadow: "0 -6px 24px rgba(0,0,0,0.06)" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.label} className={`nav-btn ${item.active ? "active" : ""}`}
              style={{ color: item.active ? "#11112a" : "#bbb", fontWeight: item.active ? 800 : 500, letterSpacing: "0.3px" }}
              onClick={() => !item.active && navigate(item.path)}>
              {item.active && <span className="nav-pip" />}
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default Stats;
