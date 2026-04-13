// src/pages/Home.tsx
// Changes:
//   1. Transaction type extended with created_at; timestamp shown in Recent Activity
//   2. Hero card: character (left) + balance (right) + XP bar + random phrase
//   3. Stats nav button added to bottom navbar

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { LootboxModal } from "../components/LootboxModal";

type Transaction = {
  amount: number;
  description: string;
  category: string;
  created_at?: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  food:      "☕",
  transport: "🚗",
  fun:       "🎮",
  income:    "💼",
};

const PHRASES = [
  "Good job.",
  "Keep going.",
  "You're doing great.",
  "Stay on track!",
  "Every euro counts.",
  "Nice work today.",
];

const CHARACTERS: Record<string, { fur: string; inner: string }> = {
  brown:  { fur: "#8B7355", inner: "#C4956A" },
  white:  { fur: "#E8E8E8", inner: "#F5F5F5" },
  black:  { fur: "#2D2D2D", inner: "#4B4B4B" },
  orange: { fur: "#C2703A", inner: "#E8967A" },
};

function MiniCharacter({
  fur, inner,
  equippedHat, equippedGlasses,
}: {
  fur: string; inner: string;
  equippedHat?: string | null;
  equippedGlasses?: string | null;
}) {
  return (
    <svg width="90" height="105" viewBox="0 0 200 230">
      <ellipse cx="55"  cy="60"  rx="18" ry="24" fill={fur}   transform="rotate(-15,55,60)" />
      <ellipse cx="145" cy="60"  rx="18" ry="24" fill={fur}   transform="rotate(15,145,60)" />
      <ellipse cx="55"  cy="62"  rx="10" ry="14" fill={inner} transform="rotate(-15,55,62)" />
      <ellipse cx="145" cy="62"  rx="10" ry="14" fill={inner} transform="rotate(15,145,62)" />
      <ellipse cx="100" cy="95"  rx="52" ry="50" fill={fur} />
      <ellipse cx="100" cy="118" rx="28" ry="20" fill={inner} />
      <ellipse cx="100" cy="108" rx="10" ry="7"  fill="#2D1B0E" />
      <ellipse cx="78"  cy="88"  rx="10" ry="7"  fill="white" />
      <ellipse cx="122" cy="88"  rx="10" ry="7"  fill="white" />
      <ellipse cx="78"  cy="90"  rx="6"  ry="5"  fill="#3D2B1F" />
      <ellipse cx="122" cy="90"  rx="6"  ry="5"  fill="#3D2B1F" />
      <rect x="68"  y="83" width="20" height="7" rx="4" fill={fur} />
      <rect x="112" y="83" width="20" height="7" rx="4" fill={fur} />
      <path d="M88 126 Q100 134 112 126" fill="none" stroke="#2D1B0E" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="82" y="140" width="36" height="20" fill={fur} />
      <rect x="30" y="158" width="140" height="72" rx="20" fill="#4A4A6A" />
      <path d="M30 175 Q100 148 170 175" fill="#4A4A6A" />
      <rect x="55" y="195" width="90" height="25" rx="10" fill="#3A3A5A" />
      <path d="M30 170 Q10 205 30 235"   fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
      <path d="M170 170 Q190 205 170 235" fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
      <ellipse cx="22"  cy="232" rx="14" ry="12" fill={fur} />
      <ellipse cx="178" cy="232" rx="14" ry="12" fill={fur} />
      {equippedHat === "hat" && (
        <g>
          <rect x="72" y="38" width="56" height="8"  rx="3" fill="#2D1B0E" />
          <rect x="82" y="18" width="36" height="22" rx="5" fill="#2D1B0E" />
        </g>
      )}
      {equippedHat === "crown" && (
        <g>
          <polygon points="76,42 88,22 100,36 112,22 124,42" fill="#FFD700" />
          <rect x="76" y="40" width="48" height="6" rx="2" fill="#FFD700" />
        </g>
      )}
      {equippedGlasses === "glasses" && (
        <g>
          <circle cx="78"  cy="90" r="11" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
          <circle cx="122" cy="90" r="11" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
          <line x1="89" y1="90" x2="111" y2="90" stroke="#1a1a2e" strokeWidth="2" />
        </g>
      )}
      {equippedGlasses === "monocle" && (
        <g>
          <circle cx="122" cy="90" r="13" fill="none" stroke="#8B7355" strokeWidth="2.5" />
          <line x1="122" y1="103" x2="126" y2="114" stroke="#8B7355" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}

function formatTime(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const API = "https://moneyquest-pcoq.onrender.com";

function Home() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal]       = useState(false);
  const [type, setType]                 = useState<"expense" | "income">("expense");
  const [amount, setAmount]             = useState("");
  const [description, setDescription]  = useState("");
  const [category, setCategory]         = useState("food");
  const [questToast, setQuestToast]     = useState(false);
  const [balanceError, setBalanceError] = useState("");
  const [lootboxCount, setLootboxCount] = useState(0);
  const [showLootbox, setShowLootbox]   = useState(false);
  const [user, setUser]                 = useState<any>(null);

  // Pick a random phrase once on mount
  const phrase = useMemo(() => PHRASES[Math.floor(Math.random() * PHRASES.length)], []);

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setTransactions(data)).catch(() => {});

    fetch(`${API}/lootbox`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setLootboxCount(data.lootboxes || 0)).catch(() => {});

    fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => { if (data.user) setUser(data.user); }).catch(() => {});
  }, [token]);

  const fetchTransactions = () =>
    fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setTransactions(data)).catch(() => {});

  const balance = transactions.reduce((sum, t) =>
    t.category === "income" ? sum + t.amount : sum - t.amount, 0);

  const xp        = user?.xp ?? 0;
  const level     = Math.min(Math.floor(xp / 100) + 1, 20);
  const xpInLevel = xp % 100;
  const charKey   = user?.character ?? "brown";
  const charColors = CHARACTERS[charKey] ?? CHARACTERS.brown;

  const addTransaction = async () => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    if (type === "expense" && value > balance) {
      setBalanceError(`Insufficient balance. Available: ${balance.toFixed(2)}€`);
      return;
    }
    setBalanceError("");
    const newTransaction = {
      amount:      value,
      description: type === "income" ? "Income" : description,
      category:    type === "income" ? "income" : category,
    };
    const res = await fetch(`${API}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ transaction: newTransaction }),
    });
    const data = await res.json();
    if (!res.ok) { setBalanceError(data.error || "Transaction failed"); return; }

    // Re-fetch to get server-side created_at
    fetchTransactions();
    setAmount(""); setDescription(""); setBalanceError(""); setShowModal(false);
    if (type === "expense") { setQuestToast(true); setTimeout(() => setQuestToast(false), 3000); }
  };

  const s: Record<string, React.CSSProperties> = {
    page:         { minHeight: "100vh", background: "#f5f5f0", maxWidth: 390, margin: "0 auto", fontFamily: "'Inter', sans-serif", paddingBottom: 100 },
    header:       { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    logo:         { fontWeight: 700, fontSize: 16, color: "#1a1a2e" },
    bell:         { width: 36, height: 36, borderRadius: "50%", background: "#e8e8e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
    card:         { background: "white", borderRadius: 20, padding: "20px", margin: "0 24px 16px" },
    cardLabel:    { margin: "0 0 4px", fontSize: 11, color: "#c9a84c", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
    cardTitle:    { margin: "0 0 12px", fontSize: 20, fontWeight: 700, color: "#1a1a2e" },
    progressBar:  { height: 6, borderRadius: 3, background: "#f0f0ea", marginBottom: 8 },
    progressFill: { height: "100%", borderRadius: 3, background: "#1a1a2e", width: "65%" },
    progressRow:  { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#999" },
    activityItem: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f5f5f0" },
    activityLeft: { display: "flex", alignItems: "center", gap: 12 },
    activityIcon: { width: 40, height: 40, borderRadius: 12, background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
    activityName: { margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1a2e" },
    activityDate: { margin: 0, fontSize: 12, color: "#999" },
    income:       { fontSize: 14, fontWeight: 700, color: "#4caf50" },
    expense:      { fontSize: 14, fontWeight: 700, color: "#e53935" },
    navBar:       { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: "white", display: "flex", justifyContent: "space-around", padding: "12px 0 24px", borderTop: "1px solid #f0f0ea" },
    navItem:      { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10, color: "#999", cursor: "pointer", border: "none", background: "none", fontFamily: "'Inter', sans-serif" },
    navItemActive:{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10, color: "#1a1a2e", fontWeight: 700, cursor: "pointer", border: "none", background: "none", fontFamily: "'Inter', sans-serif" },
    overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 },
    modal:        { background: "white", borderRadius: "24px 24px 0 0", padding: "28px 24px 48px", width: "100%", maxWidth: 390 },
    modalTitle:   { margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "#1a1a2e" },
    input:        { width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid #e8e8e0", fontSize: 15, marginBottom: 12, boxSizing: "border-box" as const, outline: "none", fontFamily: "'Inter', sans-serif" },
    select:       { width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid #e8e8e0", fontSize: 15, marginBottom: 12, boxSizing: "border-box" as const, outline: "none", fontFamily: "'Inter', sans-serif", background: "white" },
    saveBtn:      { width: "100%", padding: 16, borderRadius: 14, border: "none", background: "#1a1a2e", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 10 },
    cancelBtn:    { width: "100%", padding: 16, borderRadius: 14, border: "none", background: "#f5f5f0", color: "#1a1a2e", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  };

  return (
    <div style={s.page}>

      {questToast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#1a1a2e", color: "white", borderRadius: 14, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          🏆 Quest progress updated! Check Quests →
        </div>
      )}

      {/* HEADER */}
      <div style={s.header}>
        <span style={s.logo}>MoneyQuest</span>
        <div style={s.bell}>🔔</div>
      </div>

      {/* ── HERO CARD ── */}
      <div style={{ margin: "0 24px 16px", background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)", borderRadius: 20, padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Character side */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <MiniCharacter
              fur={charColors.fur}
              inner={charColors.inner}
              equippedHat={user?.equipped_hat}
              equippedGlasses={user?.equipped_glasses}
            />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontStyle: "italic", textAlign: "center", maxWidth: 90 }}>
              "{phrase}"
            </span>
          </div>

          {/* Balance side */}
          <div style={{ flex: 1, paddingLeft: 16 }}>
            <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Balance</p>
            <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "white", lineHeight: 1 }}>{balance.toFixed(2)} €</h1>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>tracked via MoneyQuest</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "white", color: "#1a1a2e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                onClick={() => { setType("expense"); setBalanceError(""); setShowModal(true); }}>
                + Expense
              </button>
              <button style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                onClick={() => { setType("income"); setBalanceError(""); setShowModal(true); }}>
                + Income
              </button>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Lv. {level}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{xpInLevel} / 100 XP</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.12)" }}>
            <div style={{ height: "100%", borderRadius: 3, background: "#c9a84c", width: `${xpInLevel}%`, transition: "width 0.4s ease" }} />
          </div>
        </div>
      </div>

      {/* 🎁 LOOTBOX CARD */}
      <div style={{
        ...s.card,
        background: lootboxCount > 0 ? "linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)" : "white",
        cursor: lootboxCount > 0 ? "pointer" : "default",
      }} onClick={() => lootboxCount > 0 && setShowLootbox(true)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ ...s.cardLabel, color: lootboxCount > 0 ? "#c9a84c" : "#999" }}>Lootboxes</p>
            <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: lootboxCount > 0 ? "white" : "#1a1a2e" }}>
              {lootboxCount > 0 ? `${lootboxCount} ready to open!` : "No lootboxes yet"}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: lootboxCount > 0 ? "rgba(255,255,255,0.6)" : "#999" }}>
              {lootboxCount > 0 ? "Tap to open →" : "Complete quests to earn them"}
            </p>
          </div>
          <div style={{ fontSize: 44, filter: lootboxCount > 0 ? "drop-shadow(0 0 12px rgba(201,168,76,0.8))" : "none", animation: lootboxCount > 0 ? "pulse 2s infinite" : "none" }}>📦</div>
        </div>
      </div>

      {/* ACTIVE QUEST CARD */}
      <div style={s.card}>
        <p style={s.cardLabel}>Active Quest</p>
        <h3 style={s.cardTitle}>Track your spending</h3>
        <div style={s.progressBar}><div style={s.progressFill} /></div>
        <div style={s.progressRow}><span>Keep going!</span><span>→ Quests</span></div>
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
                <div style={s.activityIcon}>{CATEGORY_ICONS[t.category] || "💳"}</div>
                <div>
                  <p style={s.activityName}>{t.description}</p>
                  <p style={s.activityDate}>
                    {t.category}{t.created_at ? ` · ${formatTime(t.created_at)}` : ""}
                  </p>
                </div>
              </div>
              <span style={t.category === "income" ? s.income : s.expense}>
                {t.category === "income" ? "+" : "-"}{t.amount}€
              </span>
            </div>
          ))
        )}
      </div>

      {/* TRANSACTION MODAL */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitle}>{type === "income" ? "Add Income" : "Add Expense"}</h3>
            {type === "expense" && (
              <>
                <input style={s.input} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <select style={s.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="food">🍕 Food</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="fun">🎮 Fun</option>
                </select>
              </>
            )}
            <input style={s.input} type="number" placeholder="Amount (€)" value={amount}
              onChange={(e) => { setAmount(e.target.value); setBalanceError(""); }} />
            {balanceError && (
              <p style={{ color: "#e53935", fontSize: 13, margin: "-4px 0 12px", fontWeight: 500 }}>⚠️ {balanceError}</p>
            )}
            <button style={s.saveBtn} onClick={addTransaction}>Save</button>
            <button style={s.cancelBtn} onClick={() => { setShowModal(false); setBalanceError(""); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* LOOTBOX MODAL */}
      {showLootbox && (
        <LootboxModal
          lootboxCount={lootboxCount}
          onClose={() => setShowLootbox(false)}
          onOpened={(_reward, remaining) => setLootboxCount(remaining)}
        />
      )}

      {/* BOTTOM NAV */}
      <div style={s.navBar}>
        <button style={s.navItemActive}><span style={{ fontSize: 20 }}>🏠</span>HOME</button>
        <button style={s.navItem} onClick={() => navigate("/achievements")}><span style={{ fontSize: 20 }}>🏆</span>QUESTS</button>
        <button style={s.navItem} onClick={() => navigate("/stats")}><span style={{ fontSize: 20 }}>📊</span>STATS</button>
        <button style={s.navItem} onClick={() => navigate("/profile")}><span style={{ fontSize: 20 }}>👤</span>PROFILE</button>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
    </div>
  );
}

export default Home;
