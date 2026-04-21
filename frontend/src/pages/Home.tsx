import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { LootboxModal } from "../components/LootboxModal";
import { BearCharacter } from "../components/BearCharacter";
import { useBearReaction } from "../hooks/useBearReaction";

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

  const { mood, react } = useBearReaction();

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
  const [loaded, setLoaded]             = useState(false);
  const [savingsGoal, setSavingsGoal]   = useState<any>(null);
  const [savingsCompleted, setSavingsCompleted] = useState(false);
  const [savingsFading, setSavingsFading]       = useState(false);
  const [xpParticles, setXpParticles]   = useState<{ id: number; label: string; x: number; y: number }[]>([]);
  const [showSavingsCreate, setShowSavingsCreate] = useState(false);
  const [savingsName, setSavingsName]   = useState("");
  const [savingsTarget, setSavingsTarget] = useState("");
  const [savingsAdd, setSavingsAdd]     = useState("");

  const phrase = useMemo(() => PHRASES[Math.floor(Math.random() * PHRASES.length)], []);

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setTransactions(d)).catch(() => {});
    fetch(`${API}/lootbox`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setLootboxCount(d.lootboxes || 0)).catch(() => {});
    fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        if (d.user) setUser(d.user);
        setTimeout(() => setLoaded(true), 60);
      }).catch(() => setLoaded(true));
    fetch(`${API}/savings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setSavingsGoal(d.goal || null)).catch(() => {});
  }, [token]);

  const fetchTransactions = () =>
    fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setTransactions(d)).catch(() => {});

  const balance   = transactions.reduce((s, t) => t.category === "income" ? s + t.amount : s - t.amount, 0);
  const xp        = user?.xp ?? 0;
  const level     = Math.min(Math.floor(xp / 100) + 1, 20);
  const xpInLevel = xp % 100;
  const charKey   = user?.character ?? "brown";
  const charColors = CHARACTERS[charKey] ?? CHARACTERS.brown;

  const addTransaction = async (e?: React.MouseEvent) => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    if (type === "expense" && value > balance) {
      setBalanceError(`Insufficient balance. Available: ${balance.toFixed(2)}€`);
      return;
    }
    setBalanceError("");
    const tx = {
      amount: value,
      description: type === "income" ? "Income" : (description.trim() || category),
      category:    type === "income" ? "income" : category,
    };
    const res = await fetch(`${API}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ transaction: tx }),
    });
    const data = await res.json();
    if (!res.ok) { setBalanceError(data.error || "Transaction failed"); return; }
    fetchTransactions();
    setAmount(""); setDescription(""); setBalanceError(""); setShowModal(false);
    spawnXP(type === "income" ? "+10 XP" : "+5 XP", e);
    if (type === "income") {
      react("happy");
    } else {
      react("sad");
    }
    if (type === "expense") { setQuestToast(true); setTimeout(() => setQuestToast(false), 3000); }
  };

  const spawnXP = (label: string, e?: React.MouseEvent) => {
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    const id = Date.now() + Math.random();
    setXpParticles(p => [...p, { id, label, x, y }]);
    setTimeout(() => setXpParticles(p => p.filter(pt => pt.id !== id)), 1100);
  };

  const createSavingsGoal = async () => {
    const target = Number(savingsTarget);
    if (!savingsName.trim() || !target || target <= 0) return;
    const res = await fetch(`${API}/savings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: savingsName.trim(), target_amount: target }),
    });
    const data = await res.json();
    if (res.ok) { setSavingsGoal(data.goal); setSavingsCompleted(false); setSavingsFading(false); setShowSavingsCreate(false); setSavingsName(""); setSavingsTarget(""); }
  };

  const addToSavings = async (e?: React.MouseEvent) => {
    const amount = Number(savingsAdd);
    if (!amount || amount <= 0) return;
    const res = await fetch(`${API}/savings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (res.ok) {
      const goal = data.goal;
      setSavingsGoal(goal);
      setSavingsAdd("");
      spawnXP("+3 XP", e);
      if (goal.saved_amount >= goal.target_amount && !savingsCompleted) {
        react("excited");
        setSavingsCompleted(true);
        setTimeout(() => setSavingsFading(true), 1500);
        setTimeout(() => { setSavingsGoal(null); setSavingsCompleted(false); setSavingsFading(false); }, 2700);
      } else {
        react("proud");
      }
    }
  };

  const NAV_ITEMS = [
    { icon: "🏠", label: "HOME",    path: "/home",         active: true },
    { icon: "🏆", label: "QUESTS",  path: "/achievements", active: false },
    { icon: "📊", label: "STATS",   path: "/stats",        active: false },
    { icon: "👤", label: "PROFILE", path: "/profile",      active: false },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* ── Page enter ── */
        @keyframes mq-page-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mq-page { animation: mq-page-in 0.4s ease both; }

        /* ── Staggered card entrance ── */
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .s1 { animation: card-rise 0.42s ease both 0.08s; }
        .s2 { animation: card-rise 0.42s ease both 0.16s; }
        .s3 { animation: card-rise 0.42s ease both 0.24s; }
        .s4 { animation: card-rise 0.42s ease both 0.32s; }

        /* ── Toast ── */
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-18px) scale(0.92); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        .mq-toast { animation: toast-in 0.32s cubic-bezier(0.34,1.3,0.64,1) both; }

        /* ── Modal sheet ── */
        @keyframes sheet-up {
          from { transform: translateY(50px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .mq-sheet { animation: sheet-up 0.32s cubic-bezier(0.34,1.2,0.64,1) both; }
        .mq-overlay { animation: mq-page-in 0.22s ease both; }

        /* ── Bear breathing ── */
        @keyframes breathe {
          0%, 100% { transform: scaleY(1)    translateY(0);    }
          50%       { transform: scaleY(1.03) translateY(-1.5px); }
        }
        .bear-idle {
          transform-origin: 50% 90%;
          animation: breathe 3.4s ease-in-out infinite;
        }

        /* ── Bear reactions ── */
        @keyframes bear-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          40%       { transform: translateY(-12px) scale(1.06); }
          70%       { transform: translateY(-5px) scale(1.02); }
        }
        @keyframes bear-excited {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25%       { transform: translateY(-14px) rotate(4deg) scale(1.07); }
          50%       { transform: translateY(-10px) rotate(-3deg) scale(1.05); }
          75%       { transform: translateY(-12px) rotate(2deg) scale(1.06); }
        }
        @keyframes bear-proud {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30%       { transform: translateY(-8px) rotate(3deg); }
          60%       { transform: translateY(-5px) rotate(-2deg); }
        }
        @keyframes bear-sad {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          40%       { transform: translateY(5px) rotate(-5deg); }
          70%       { transform: translateY(3px) rotate(-3deg); }
        }

        .bear--happy    { animation: bear-bounce  0.55s cubic-bezier(0.34,1.4,0.64,1) both !important; }
        .bear--excited  { animation: bear-excited 0.7s  cubic-bezier(0.34,1.2,0.64,1) both !important; }
        .bear--proud    { animation: bear-proud   0.65s cubic-bezier(0.34,1.3,0.64,1) both !important; }
        .bear--sad      { animation: bear-sad     0.55s cubic-bezier(0.34,1.2,0.64,1) both !important; }

        /* ── Button press ── */
        .mq-btn {
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.13s cubic-bezier(0.34,1.6,0.64,1), opacity 0.13s, box-shadow 0.13s;
          cursor: pointer;
        }
        .mq-btn:active { transform: scale(0.93) !important; opacity: 0.82; }

        /* ── Cards ── */
        .mq-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 20px;
          margin: 0 16px 14px;
          box-shadow: 0 2px 14px rgba(0,0,0,0.055), 0 1px 3px rgba(0,0,0,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* ── Hero card ── */
        .mq-hero {
          position: relative;
          overflow: hidden;
          margin: 0 16px 14px;
          border-radius: 28px;
          padding: 22px 20px 20px;
          background: linear-gradient(140deg, #11112a 0%, #1d1d43 55%, #282860 100%);
          box-shadow: 0 8px 32px rgba(17,17,42,0.38), 0 2px 6px rgba(0,0,0,0.18);
        }
        /* subtle dot grid */
        .mq-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
        }
        /* ambient glow top-right */
        .mq-hero::after {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(201,168,76,0.22) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Lootbox card ── */
        .loot-active {
          background: linear-gradient(140deg, #11112a 0%, #282860 100%) !important;
          cursor: pointer;
        }
        .loot-active:hover  { transform: translateY(-3px) !important; box-shadow: 0 14px 36px rgba(17,17,42,0.42) !important; }
        .loot-active:active { transform: scale(0.96) !important; }

        /* ── Activity rows ── */
        .activity-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 10px; border-radius: 14px; margin: 0 -10px;
          border-bottom: 1px solid #f3f3ee;
          transition: background 0.15s;
        }
        .activity-row:last-child { border-bottom: none; }
        .activity-row:hover { background: #f9f9f5; }

        /* ── XP bar ── */
        @keyframes xp-in   { from { width: 0%; } }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .xp-bar {
          animation:
            xp-in 0.9s cubic-bezier(0.22,1,0.36,1) both 0.55s,
            shimmer 2.8s linear 1.5s infinite;
          background: linear-gradient(90deg, #c9a84c 0%, #f0ca6a 40%, #ffe17a 50%, #c9a84c 60%, #f0ca6a 100%);
          background-size: 200% 100%;
        }

        /* ── Input ── */
        .mq-input:focus {
          border-color: #11112a !important;
          box-shadow: 0 0 0 3px rgba(17,17,42,0.1) !important;
          outline: none;
        }

        /* ── Lootbox pulse ── */
        @keyframes loot-pulse {
          0%,100% { transform: scale(1) rotate(-3deg); }
          50%      { transform: scale(1.14) rotate(3deg); }
        }

        /* ── Floating XP ── */
        @keyframes xp-float {
          0%   { opacity: 1;   transform: translateY(0)   scale(1); }
          60%  { opacity: 1;   transform: translateY(-38px) scale(1.08); }
          100% { opacity: 0;   transform: translateY(-62px) scale(0.9); }
        }
        .xp-particle {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          font-size: 15px;
          font-weight: 900;
          color: #c9a84c;
          text-shadow: 0 0 12px rgba(201,168,76,0.7), 0 1px 3px rgba(0,0,0,0.25);
          white-space: nowrap;
          animation: xp-float 1.05s cubic-bezier(0.22,1,0.36,1) both;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.3px;
        }

        /* ── Savings goal fade-out ── */
        @keyframes savings-fade-out {
          from { opacity: 1; transform: scaleY(1); max-height: 300px; }
          to   { opacity: 0; transform: scaleY(0.92); max-height: 0; margin-bottom: 0; padding: 0; }
        }
        .savings-fading {
          animation: savings-fade-out 1s cubic-bezier(0.4,0,0.2,1) both;
          overflow: hidden;
          transform-origin: top;
          pointer-events: none;
        }

        /* ── Savings progress bar ── */
        @keyframes savings-in { from { width: 0%; } }
        .savings-bar {
          animation: savings-in 1s cubic-bezier(0.22,1,0.36,1) both 0.3s;
          background: linear-gradient(90deg, #3b5bdb 0%, #748ffc 100%);
        }

        /* ── Nav ── */
        .nav-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; font-size: 10px; border: none; background: none;
          font-family: inherit; cursor: pointer; padding: 0; position: relative;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.15s ease, color 0.2s;
        }
        .nav-btn:active { transform: scale(0.84); }
        .nav-icon {
          font-size: 20px;
          transition: transform 0.2s cubic-bezier(0.34,1.5,0.64,1);
          display: block;
        }
        .nav-btn:hover .nav-icon { transform: translateY(-3px); }
        .nav-btn.is-active .nav-icon { transform: scale(1.14); }
        .nav-pip {
          position: absolute;
          top: -7px; left: 50%;
          transform: translateX(-50%);
          width: 28px; height: 3px;
          background: #11112a;
          border-radius: 0 0 4px 4px;
        }
      `}</style>

      <div
        className="mq-page"
        style={{
          minHeight: "100vh",
          background: "#efefea",
          maxWidth: 390,
          margin: "0 auto",
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          paddingBottom: 120,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      >
        {/* TOAST */}
        {questToast && (
          <div className="mq-toast" style={{
            position: "fixed", top: 24, left: "50%",
            background: "#11112a", color: "white",
            borderRadius: 20, padding: "14px 26px",
            fontSize: 14, fontWeight: 700, zIndex: 200,
            whiteSpace: "nowrap",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
            🏆 Quest progress updated!
          </div>
        )}

        {/* FLOATING XP PARTICLES */}
        {xpParticles.map(pt => (
          <div
            key={pt.id}
            className="xp-particle"
            style={{ left: pt.x - 24, top: pt.y - 16 }}
          >
            {pt.label}
          </div>
        ))}

        {/* HEADER */}
        <div style={{ padding: "24px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#11112a", letterSpacing: "-0.5px" }}>MoneyQuest</span>
          <div className="mq-btn" style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "white", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.09)",
          }}>🔔</div>
        </div>

        {/* ── HERO CARD ── */}
        <div className="mq-hero s1">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 4, position: "relative", zIndex: 1 }}>

            {/* Bear + tagline */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 96 }}>
              <BearCharacter
                fur={charColors.fur}
                inner={charColors.inner}
                equippedHat={user?.equipped_hat}
                equippedGlasses={user?.equipped_glasses}
                mood={mood}
              />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", fontStyle: "italic", textAlign: "center", lineHeight: 1.4, maxWidth: 88 }}>
                "{phrase}"
              </span>
            </div>

            {/* Balance */}
            <div style={{ flex: 1, paddingLeft: 10, paddingTop: 4 }}>
              <p style={{ margin: "0 0 1px", fontSize: 10, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>
                Total Balance
              </p>
              <h1 style={{ margin: "0 0 1px", fontSize: 28, fontWeight: 900, color: "white", lineHeight: 1.1, letterSpacing: "-0.6px" }}>
                {balance.toFixed(2)} €
              </h1>
              <p style={{ margin: "0 0 18px", fontSize: 11, color: "rgba(255,255,255,0.26)", fontWeight: 500 }}>
                tracked via MoneyQuest
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="mq-btn"
                  style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: "none", background: "white", color: "#11112a", fontSize: 13, fontWeight: 800 }}
                  onClick={() => { setType("expense"); setBalanceError(""); setShowModal(true); }}
                >
                  − Expense
                </button>
                <button
                  className="mq-btn"
                  style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: 13, fontWeight: 700 }}
                  onClick={() => { setType("income"); setBalanceError(""); setShowModal(true); }}
                >
                  + Income
                </button>
              </div>
            </div>
          </div>

          {/* XP */}
          <div style={{ marginTop: 20, position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", fontWeight: 800 }}>Level {level}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{xpInLevel} / 100 XP</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div
                className="xp-bar"
                style={{ height: "100%", borderRadius: 4, width: `${xpInLevel}%`, boxShadow: "0 0 10px rgba(201,168,76,0.7)" }}
              />
            </div>
          </div>
        </div>

        {/* LOOTBOX */}
        <div
          className={`mq-card s2 ${lootboxCount > 0 ? "loot-active" : ""}`}
          style={{ transition: "transform 0.22s cubic-bezier(0.34,1.5,0.64,1), box-shadow 0.22s ease" }}
          onClick={() => lootboxCount > 0 && setShowLootbox(true)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 10, color: lootboxCount > 0 ? "#c9a84c" : "#aaa", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>
                Lootboxes
              </p>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: lootboxCount > 0 ? "white" : "#11112a", letterSpacing: "-0.3px" }}>
                {lootboxCount > 0 ? `${lootboxCount} ready to open!` : "No lootboxes yet"}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: lootboxCount > 0 ? "rgba(255,255,255,0.48)" : "#bbb" }}>
                {lootboxCount > 0 ? "Tap to open →" : "Complete quests to earn them"}
              </p>
            </div>
            <div style={{
              fontSize: 44,
              filter: lootboxCount > 0 ? "drop-shadow(0 0 12px rgba(201,168,76,0.85))" : "grayscale(1) opacity(0.25)",
              animation: lootboxCount > 0 ? "loot-pulse 2.4s ease-in-out infinite" : "none",
            }}>📦</div>
          </div>
        </div>

        {/* ACTIVE QUEST */}
        <div className="mq-card s3">
          <p style={{ margin: "0 0 2px", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>
            Active Quest
          </p>
          <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800, color: "#11112a", letterSpacing: "-0.3px" }}>
            Track your spending
          </h3>
          <div style={{ height: 7, borderRadius: 4, background: "#eaeae4", marginBottom: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #11112a, #3b5bdb)", width: "65%", transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#bbb", fontWeight: 600 }}>
            <span>Keep going!</span>
            <button
              onClick={() => navigate("/achievements")}
              style={{ border: "none", background: "none", fontSize: 12, color: "#3b5bdb", fontWeight: 800, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
            >View Quests →</button>
          </div>
        </div>

        {/* SAVINGS GOAL */}
        <div className="mq-card s4" style={{ marginBottom: 14 }}>

          {/* Active goal — fades out on completion */}
          {savingsGoal && (
            <div
              className={savingsFading ? "savings-fading" : ""}
              style={{ marginBottom: savingsGoal ? 0 : undefined }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 10, color: "#3b5bdb", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Savings Goal</p>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#11112a", letterSpacing: "-0.3px" }}>{savingsGoal.name}</h3>
                </div>
                <span style={{ fontSize: 28 }}>🎯</span>
              </div>
              {(() => {
                const pct = Math.min(100, Math.round((savingsGoal.saved_amount / savingsGoal.target_amount) * 100));
                return (
                  <>
                    <div style={{ height: 8, borderRadius: 4, background: "#eaeae4", overflow: "hidden", marginBottom: 8 }}>
                      <div className="savings-bar" style={{ height: "100%", borderRadius: 4, width: `${pct}%` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 14 }}>
                      <span style={{ color: "#3b5bdb", fontWeight: 700 }}>{pct}%</span>
                      <span style={{ color: "#bbb", fontWeight: 600 }}>
                        {savingsGoal.saved_amount}€ / {savingsGoal.target_amount}€
                        {pct < 100 && <span style={{ color: "#e67e22", fontWeight: 700, marginLeft: 6 }}>· {savingsGoal.target_amount - savingsGoal.saved_amount}€ left</span>}
                      </span>
                    </div>
                    {pct < 100 ? (
                      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888", fontWeight: 500, fontStyle: "italic" }}>
                        You're getting closer to your goal 💪
                      </p>
                    ) : (
                      <p style={{ margin: "0 0 12px", fontSize: 14, color: "#2e7d32", fontWeight: 800, letterSpacing: "-0.2px" }}>
                        You did it 🎉
                      </p>
                    )}
                  </>
                );
              })()}
              {!savingsCompleted && (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="mq-input"
                    type="number"
                    placeholder="Amount €"
                    value={savingsAdd}
                    onChange={e => setSavingsAdd(e.target.value)}
                    style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e4e4de", fontSize: 14, fontFamily: "inherit", fontWeight: 600, outline: "none" }}
                  />
                  <button
                    className="mq-btn"
                    onClick={(e) => addToSavings(e)}
                    style={{ padding: "11px 18px", borderRadius: 12, border: "none", background: "#3b5bdb", color: "white", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}
                  >+ Save</button>
                </div>
              )}
              <div style={{ height: 1, background: "#f0f0ea", margin: "14px -20px 14px" }} />
            </div>
          )}

          {/* Create new goal — always visible */}
          {!showSavingsCreate ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 10, color: "#3b5bdb", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Savings Goal</p>
                <p style={{ margin: 0, fontSize: 14, color: "#bbb", fontWeight: 500 }}>
                  {savingsGoal ? "Start a new goal" : "No goal set yet"}
                </p>
              </div>
              <button
                className="mq-btn"
                onClick={() => setShowSavingsCreate(true)}
                style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "#11112a", color: "white", fontSize: 13, fontWeight: 800 }}
              >+ Create Goal</button>
            </div>
          ) : (
            <>
              <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#11112a" }}>🎯 New Savings Goal</p>
              <input
                className="mq-input"
                placeholder="Goal name (e.g. New laptop)"
                value={savingsName}
                onChange={e => setSavingsName(e.target.value)}
                style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1.5px solid #e4e4de", fontSize: 14, fontFamily: "inherit", fontWeight: 500, marginBottom: 10, outline: "none", boxSizing: "border-box" }}
              />
              <input
                className="mq-input"
                type="number"
                placeholder="Target amount €"
                value={savingsTarget}
                onChange={e => setSavingsTarget(e.target.value)}
                style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1.5px solid #e4e4de", fontSize: 14, fontFamily: "inherit", fontWeight: 600, marginBottom: 12, outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="mq-btn" onClick={createSavingsGoal} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "#11112a", color: "white", fontSize: 14, fontWeight: 800 }}>Create</button>
                <button className="mq-btn" onClick={() => { setShowSavingsCreate(false); setSavingsName(""); setSavingsTarget(""); }} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "#f0f0ea", color: "#11112a", fontSize: 14, fontWeight: 600 }}>Cancel</button>
              </div>
            </>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="mq-card s4">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#11112a" }}>Recent Activity</h3>
            <button onClick={() => navigate("/stats")} style={{ border: "none", background: "none", fontSize: 12, color: "#3b5bdb", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              View all
            </button>
          </div>
          {transactions.length === 0 ? (
            <p style={{ color: "#bbb", fontSize: 14, textAlign: "center", padding: "24px 0", fontWeight: 500 }}>No transactions yet</p>
          ) : (
            transactions.slice(0, 5).map((t, i) => (
              <div key={i} className="activity-row">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: t.category === "income" ? "#e8f5e9" : "#f0f0ea",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {CATEGORY_ICONS[t.category] || "💳"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#11112a", lineHeight: 1.3 }}>{t.description}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#bbb", fontWeight: 500, marginTop: 2 }}>
                      {t.category}{t.created_at ? ` · ${formatTime(t.created_at)}` : ""}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: t.category === "income" ? "#2e7d32" : "#c62828", flexShrink: 0, marginLeft: 8, letterSpacing: "-0.3px" }}>
                  {t.category === "income" ? "+" : "−"}{t.amount}€
                </span>
              </div>
            ))
          )}
        </div>

        {/* MODAL */}
        {showModal && (
          <div
            className="mq-overlay"
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="mq-sheet"
              style={{ background: "white", borderRadius: "28px 28px 0 0", padding: "10px 20px 52px", width: "100%", maxWidth: 390 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e0e0da", margin: "8px auto 22px" }} />
              <h3 style={{ margin: "0 0 22px", fontSize: 20, fontWeight: 900, color: "#11112a", letterSpacing: "-0.4px" }}>
                {type === "income" ? "💼 Add Income" : "🧾 Add Expense"}
              </h3>
              {type === "expense" && (
                <>
                  <input
                    className="mq-input"
                    style={{ width: "100%", padding: "15px 16px", borderRadius: 16, border: "1.5px solid #e4e4de", fontSize: 15, marginBottom: 12, fontFamily: "inherit", fontWeight: 500, transition: "border-color 0.15s, box-shadow 0.15s" }}
                    placeholder="What did you spend on? (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  <select
                    style={{ width: "100%", padding: "15px 16px", borderRadius: 16, border: "1.5px solid #e4e4de", fontSize: 15, marginBottom: 12, fontFamily: "inherit", background: "white", outline: "none", color: "#11112a", fontWeight: 500, appearance: "none" as const }}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="food">☕ Food & Coffee</option>
                    <option value="transport">🚗 Transport</option>
                    <option value="fun">🎮 Entertainment</option>
                  </select>
                </>
              )}
              <input
                className="mq-input"
                style={{ width: "100%", padding: "15px 16px", borderRadius: 16, border: "1.5px solid #e4e4de", fontSize: 18, marginBottom: 8, fontFamily: "inherit", fontWeight: 800, letterSpacing: "-0.3px", transition: "border-color 0.15s, box-shadow 0.15s" }}
                type="number"
                inputMode="decimal"
                placeholder="0.00 €"
                value={amount}
                onChange={e => { setAmount(e.target.value); setBalanceError(""); }}
              />
              {/* Quick amount buttons */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[5, 10, 20].map(q => (
                  <button
                    key={q}
                    className="mq-btn"
                    style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: "1.5px solid #e4e4de", background: "white", color: "#11112a", fontSize: 13, fontWeight: 700 }}
                    onClick={() => setAmount(a => a ? String(Number(a) + q) : String(q))}
                  >+{q}€</button>
                ))}
              </div>
              {balanceError && (
                <p style={{ color: "#c62828", fontSize: 13, margin: "-4px 0 14px", fontWeight: 600 }}>⚠️ {balanceError}</p>
              )}
              <button
                className="mq-btn"
                style={{ width: "100%", padding: 17, borderRadius: 16, border: "none", background: "#11112a", color: "white", fontSize: 16, fontWeight: 800, marginBottom: 10, boxShadow: "0 4px 20px rgba(17,17,42,0.28)", letterSpacing: "-0.2px" }}
                onClick={(e) => addTransaction(e)}
              >
                Save Transaction
              </button>
              <button
                className="mq-btn"
                style={{ width: "100%", padding: 16, borderRadius: 16, border: "none", background: "#f0f0ea", color: "#11112a", fontSize: 15, fontWeight: 600 }}
                onClick={() => { setShowModal(false); setBalanceError(""); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* LOOTBOX MODAL */}
        {showLootbox && (
          <LootboxModal
            lootboxCount={lootboxCount}
            onClose={() => setShowLootbox(false)}
            onOpened={(_r, rem) => setLootboxCount(rem)}
          />
        )}
      </div>

      {/* BOTTOM NAV — outside scrollable container */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        width: "100%", maxWidth: 390, margin: "0 auto", background: "white",
        display: "flex", justifyContent: "space-around",
        padding: "12px 0 28px",
        borderTop: "1px solid #eaeae4",
        boxShadow: "0 -6px 24px rgba(0,0,0,0.06)",
        zIndex: 50,
      }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.label}
            className={`nav-btn ${item.active ? "is-active" : ""}`}
            style={{ color: item.active ? "#11112a" : "#bbb", fontWeight: item.active ? 800 : 500, letterSpacing: "0.3px" }}
            onClick={() => !item.active && navigate(item.path)}
          >
            {item.active && <span className="nav-pip" />}
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default Home;