import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { LootboxModal } from "../components/LootboxModal";
import { useXP } from "../hooks/useXP";
import { useSavings } from "../hooks/useSavings";

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
  brown:  { fur: "#8B5228", inner: "#E8B97A" },
  white:  { fur: "#C8BEB4", inner: "#EDE8E0" },
  black:  { fur: "#4A4050", inner: "#8A8090" },
  orange: { fur: "#C05C20", inner: "#F0A060" },
};

type BearMood = "idle" | "happy" | "sad" | "excited" | "proud";

function useBearReaction(resetDelay = 1500) {
  const [mood, setMood] = useState<BearMood>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const react = useCallback((nextMood: BearMood) => {
    if (timer.current) clearTimeout(timer.current);
    setMood(nextMood);
    timer.current = setTimeout(() => setMood("idle"), resetDelay);
  }, [resetDelay]);

  return { mood, react };
}

function BearCharacter({
  fur, inner, onClick, mood = "idle",
  equippedHat: _h, equippedGlasses: _g, equippedOutfit: _o,
}: {
  fur: string; inner: string;
  equippedHat?: string | null;
  equippedGlasses?: string | null;
  equippedOutfit?: string | null;
  onClick?: () => void;
  mood?: BearMood;
}) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); schedule(); }, 100);
      }, 2800 + Math.random() * 2200);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  const eyeRy = blink ? 0.6 : 7.5;

  const mouthD =
    mood === "happy"   ? "M85,116 Q100,128 115,116"        :
    mood === "excited" ? "M83,115 Q100,129 117,115"        :
    mood === "sad"     ? "M86,122 Q100,113 114,122"        :
    mood === "proud"   ? "M87,117 Q100,123 113,117"        :
    "M88,116 Q94,122 100,116 Q106,122 112,116";

  return (
    <svg
      width="130" height="156"
      viewBox="0 0 200 240"
      onClick={onClick}
      className={`bear-idle ${mood !== "idle" ? `bear--${mood}` : ""}`}
      style={{ cursor: "pointer", display: "block", overflow: "visible" }}
    >
      {/* ── BODY ── */}
      <ellipse cx="100" cy="186" rx="68" ry="50" fill={fur} />
      <ellipse cx="100" cy="194" rx="44" ry="36" fill={inner} />

      {/* ── EARS ── */}
      <circle cx="46"  cy="44" r="21" fill={fur} />
      <circle cx="154" cy="44" r="21" fill={fur} />
      <circle cx="46"  cy="46" r="11" fill={inner} />
      <circle cx="154" cy="46" r="11" fill={inner} />

      {/* ── HEAD ── */}
      <circle cx="100" cy="95" r="68" fill={fur} />

      {/* ── MUZZLE ── */}
      <ellipse cx="100" cy="118" rx="34" ry="24" fill={inner} />

      {/* ── NOSE ── */}
      <ellipse cx="100" cy="107" rx="7.5" ry="5.5" fill="#2A1506" />

      {/* ── CHEEKS ── */}
      <circle cx="70"  cy="114" r="12" fill="#E07080" opacity="0.42" />
      <circle cx="130" cy="114" r="12" fill="#E07080" opacity="0.42" />

      {/* ── EYES ── */}
      <ellipse cx="79"  cy="96" rx="9" ry={eyeRy} fill="#2A1506" />
      <ellipse cx="121" cy="96" rx="9" ry={eyeRy} fill="#2A1506" />
      {!blink && (
        <>
          <circle cx="83"  cy="91" r="3.2" fill="white" opacity="0.92" />
          <circle cx="125" cy="91" r="3.2" fill="white" opacity="0.92" />
        </>
      )}

      {/* ── MOUTH ── */}
      <path
        d={mouthD}
        fill="none"
        stroke="#2A1506"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Subtle floating sparkle particles around the bear
function BearAura() {
  // Static sparkle positions (relative to bear container)
  const sparkles = [
    { x: 108, y: 12,  size: 10, color: "#4A6FE3", delay: "0s",    dur: "3.2s" },
    { x: -10, y: 55,  size: 8,  color: "#7B9CF0", delay: "1.1s",  dur: "4s"   },
    { x: 112, y: 90,  size: 7,  color: "#50C878", delay: "0.5s",  dur: "3.6s" },
    { x: -14, y: 105, size: 9,  color: "#4A6FE3", delay: "1.8s",  dur: "4.4s" },
    { x: 96,  y: 130, size: 6,  color: "#A0B8FF", delay: "2.3s",  dur: "3s"   },
  ];

  return (
    <>
      {/* Soft radial aura behind bear */}
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "radial-gradient(ellipse 80% 70% at 50% 55%, rgba(180,195,255,0.18) 0%, rgba(180,195,255,0.06) 55%, transparent 75%)",
        pointerEvents: "none",
      }} />
      {/* Sparkle crosses */}
      {sparkles.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            pointerEvents: "none",
            opacity: 0.18,
            animation: `sparkle-float ${s.dur} ease-in-out ${s.delay} infinite`,
          }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 10 10">
            <path d="M5 0 L5.4 4.6 L10 5 L5.4 5.4 L5 10 L4.6 5.4 L0 5 L4.6 4.6 Z" fill={s.color} />
          </svg>
        </div>
      ))}
    </>
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

// Format balance: 98771 → "98 771", 98771.5 → "98 771.50"
function formatBalance(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const isWhole = rounded % 1 === 0;
  const intPart = Math.floor(Math.abs(rounded)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const sign = rounded < 0 ? "−" : "";
  if (isWhole) return `${sign}${intPart}`;
  const decPart = (Math.abs(rounded) - Math.floor(Math.abs(rounded))).toFixed(2).slice(1);
  return `${sign}${intPart}${decPart}`;
}

const API = "https://moneyquest-pcoq.onrender.com";

function Home() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const { mood, react } = useBearReaction();
  const { xpParticles, spawnXP } = useXP();

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

  const {
    savingsGoal,
    savingsCompleted,
    savingsFading,
    savingsName,   setSavingsName,
    savingsTarget, setSavingsTarget,
    savingsAdd,    setSavingsAdd,
    showSavingsCreate, setShowSavingsCreate,
    fetchSavings,
    createSavingsGoal,
    addToSavings,
  } = useSavings(token, react, spawnXP);

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
    fetchSavings();
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
      setBalanceError(`Insufficient balance. Available: ${formatBalance(balance)} €`);
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
    if (type === "income") { react("happy"); } else { react("sad"); }
    if (type === "expense") { setQuestToast(true); setTimeout(() => setQuestToast(false), 3000); }
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

        @keyframes mq-page-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mq-page { animation: mq-page-in 0.35s ease both; }

        @keyframes card-rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .s1 { animation: card-rise 0.38s ease both 0.06s; }
        .s2 { animation: card-rise 0.38s ease both 0.12s; }
        .s3 { animation: card-rise 0.38s ease both 0.18s; }
        .s4 { animation: card-rise 0.38s ease both 0.24s; }

        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-14px) scale(0.94); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        .mq-toast { animation: toast-in 0.28s cubic-bezier(0.34,1.3,0.64,1) both; }

        @keyframes sheet-up {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .mq-sheet   { animation: sheet-up 0.3s cubic-bezier(0.34,1.2,0.64,1) both; }
        .mq-overlay { animation: mq-page-in 0.2s ease both; }

        /* Bear breathing */
        @keyframes breathe {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-2px); }
        }
        .bear-idle { animation: breathe 4s ease-in-out infinite; }

        /* Mood animations */
        @keyframes bear-bounce {
          0%, 100% { transform: translateY(0); }
          40%       { transform: translateY(-7px); }
          70%       { transform: translateY(-3px); }
        }
        @keyframes bear-sad {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(3px) rotate(-2deg); }
        }
        @keyframes bear-proud {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-4px) rotate(1deg); }
        }
        .bear--happy   { animation: bear-bounce 0.5s cubic-bezier(0.34,1.4,0.64,1) both !important; }
        .bear--excited { animation: bear-bounce 0.5s cubic-bezier(0.34,1.4,0.64,1) both !important; }
        .bear--proud   { animation: bear-proud  0.6s ease both !important; }
        .bear--sad     { animation: bear-sad    0.5s ease both !important; }

        /* Sparkle float */
        @keyframes sparkle-float {
          0%, 100% { transform: translateY(0) scale(1);    opacity: 0.15; }
          50%       { transform: translateY(-6px) scale(1.15); opacity: 0.22; }
        }

        .mq-btn {
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.12s cubic-bezier(0.34,1.5,0.64,1), opacity 0.12s;
          cursor: pointer;
        }
        .mq-btn:active { transform: scale(0.95) !important; opacity: 0.85; }

        .mq-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 18px 20px;
          margin: 0 16px 12px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
        }

        /* Hero card — white, clean */
        .mq-hero {
          background: #ffffff;
          border-radius: 22px;
          margin: 0 16px 12px;
          padding: 16px 16px 16px;
          box-shadow: 0 2px 14px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
          position: relative;
          overflow: visible;
        }

        .loot-active {
          background: linear-gradient(140deg, #11112a 0%, #282860 100%) !important;
          cursor: pointer;
        }
        .loot-active:hover  { transform: translateY(-2px); }
        .loot-active:active { transform: scale(0.97); }

        .activity-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 8px; border-radius: 12px; margin: 0 -8px;
          border-bottom: 1px solid #f2f2ef;
          transition: background 0.12s;
        }
        .activity-row:last-child { border-bottom: none; }
        .activity-row:hover { background: #fafaf8; }

        @keyframes xp-in { from { width: 0%; } }
        .xp-bar {
          animation: xp-in 0.9s cubic-bezier(0.22,1,0.36,1) both 0.4s;
          background: #3b5bdb;
          border-radius: 4px;
          height: 100%;
        }

        .mq-input:focus {
          border-color: #3b5bdb !important;
          box-shadow: 0 0 0 3px rgba(59,91,219,0.1) !important;
          outline: none;
        }

        @keyframes loot-pulse {
          0%,100% { transform: scale(1) rotate(-2deg); }
          50%      { transform: scale(1.1) rotate(2deg); }
        }

        @keyframes xp-float {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          60%  { opacity: 1; transform: translateY(-34px) scale(1.06); }
          100% { opacity: 0; transform: translateY(-56px) scale(0.9); }
        }
        .xp-particle {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          font-size: 14px;
          font-weight: 800;
          color: #3b5bdb;
          white-space: nowrap;
          animation: xp-float 1s cubic-bezier(0.22,1,0.36,1) both;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes savings-fade-out {
          from { opacity: 1; transform: scaleY(1); max-height: 300px; }
          to   { opacity: 0; transform: scaleY(0.94); max-height: 0; margin-bottom: 0; padding: 0; }
        }
        .savings-fading {
          animation: savings-fade-out 1s cubic-bezier(0.4,0,0.2,1) both;
          overflow: hidden; transform-origin: top; pointer-events: none;
        }
        @keyframes savings-in { from { width: 0%; } }
        .savings-bar {
          animation: savings-in 1s cubic-bezier(0.22,1,0.36,1) both 0.3s;
          background: #3b5bdb;
          border-radius: 4px;
          height: 100%;
        }

        .nav-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; font-size: 10px; border: none; background: none;
          font-family: inherit; cursor: pointer; padding: 0; position: relative;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.14s ease, color 0.2s;
        }
        .nav-btn:active { transform: scale(0.86); }
        .nav-icon { font-size: 20px; transition: transform 0.18s cubic-bezier(0.34,1.5,0.64,1); display: block; }
        .nav-btn:hover .nav-icon { transform: translateY(-2px); }
        .nav-btn.is-active .nav-icon { transform: scale(1.1); }
        .nav-pip {
          position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
          width: 24px; height: 3px; background: #11112a; border-radius: 0 0 3px 3px;
        }
      `}</style>

      <div
        className="mq-page"
        style={{
          minHeight: "100vh",
          background: "#F2F2EF",
          maxWidth: 390,
          margin: "0 auto",
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          paddingBottom: 120,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* TOAST */}
        {questToast && (
          <div className="mq-toast" style={{
            position: "fixed", top: 22, left: "50%",
            background: "#11112a", color: "white",
            borderRadius: 18, padding: "12px 22px",
            fontSize: 13, fontWeight: 700, zIndex: 200,
            whiteSpace: "nowrap", boxShadow: "0 6px 24px rgba(0,0,0,0.28)",
          }}>🏆 Quest progress updated!</div>
        )}

        {/* XP PARTICLES */}
        {xpParticles.map(pt => (
          <div key={pt.id} className="xp-particle" style={{ left: pt.x - 20, top: pt.y - 14 }}>
            {pt.label}
          </div>
        ))}

        {/* ── HEADER ── */}
        <div style={{ padding: "24px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 900, fontSize: 17, color: "#11112a", letterSpacing: "-0.4px" }}>MoneyQuest</span>
          <div className="mq-btn" style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "white", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, boxShadow: "0 1px 8px rgba(0,0,0,0.1)",
          }}>🔔</div>
        </div>

        {/* ── HERO CARD ── */}
        <div className="mq-hero s1">

          {/* ── TOP ROW: account+streak  |  level info ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#11112a", letterSpacing: "-0.2px" }}>Main account</p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#aaa", fontWeight: 500 }}>
                🔥 {user?.streak || 0} day streak
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#11112a" }}>Level {level}</p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: "#aaa", fontWeight: 500 }}>
                {100 - xpInLevel} XP to next level
              </p>
            </div>
          </div>

          {/* ── BALANCE ROW + BEAR ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>

            {/* Left: balance + phrase */}
            <div style={{ flex: 1, paddingRight: 0, minWidth: 0 }}>
              <p style={{ margin: "0 0 2px", fontSize: 12, color: "#aaa", fontWeight: 500 }}>Total balance</p>
              <h1 style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 900,
                color: "#11112a",
                letterSpacing: "-1.2px",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}>
                {formatBalance(balance)} €
              </h1>
              <p style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "#3b5bdb",
                fontWeight: 700,
                fontStyle: "italic",
              }}>
                "{phrase}"
              </p>
            </div>

            {/* Right: bear with aura */}
            <div style={{
              flexShrink: 0,
              position: "relative",
              width: 104,
              height: 118,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: -6,
            }}>
              <BearAura />
              <div style={{ transform: "scale(0.78)", transformOrigin: "center bottom" }}>
                <BearCharacter
                  fur={charColors.fur}
                  inner={charColors.inner}
                  mood={mood}
                />
              </div>
            </div>
          </div>

          {/* ── XP BAR ── */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "#aaa", fontWeight: 500 }}>
                Next level in {100 - xpInLevel} XP
              </span>
              <span style={{ fontSize: 11, color: "#aaa", fontWeight: 500 }}>
                {xpInLevel} / 100
              </span>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: "#EEEEED", overflow: "hidden" }}>
              <div className="xp-bar" style={{ width: `${xpInLevel}%` }} />
            </div>
          </div>

          {/* ── BUTTONS ── */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              className="mq-btn"
              style={{
                flex: 1, padding: "13px 0", borderRadius: 999,
                border: "none", background: "#F0F0ED",
                color: "#11112a", fontSize: 15, fontWeight: 800, fontFamily: "inherit",
              }}
              onClick={() => { setType("expense"); setBalanceError(""); setShowModal(true); }}
            >− Expense</button>
            <button
              className="mq-btn"
              style={{
                flex: 1, padding: "13px 0", borderRadius: 999,
                border: "none", background: "#11112a",
                color: "white", fontSize: 15, fontWeight: 800, fontFamily: "inherit",
              }}
              onClick={() => { setType("income"); setBalanceError(""); setShowModal(true); }}
            >+ Income</button>
          </div>
        </div>

        {/* LOOTBOX */}
        <div
          className={`mq-card s2 ${lootboxCount > 0 ? "loot-active" : ""}`}
          style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
          onClick={() => lootboxCount > 0 && setShowLootbox(true)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 10, color: lootboxCount > 0 ? "#c9a84c" : "#aaa", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Lootboxes</p>
              <h3 style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 800, color: lootboxCount > 0 ? "white" : "#11112a" }}>
                {lootboxCount > 0 ? `${lootboxCount} ready to open!` : "No lootboxes yet"}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: lootboxCount > 0 ? "rgba(255,255,255,0.5)" : "#bbb" }}>
                {lootboxCount > 0 ? "Tap to open →" : "Complete quests to earn them"}
              </p>
            </div>
            <div style={{
              fontSize: 40,
              filter: lootboxCount > 0 ? "drop-shadow(0 0 10px rgba(201,168,76,0.8))" : "grayscale(1) opacity(0.22)",
              animation: lootboxCount > 0 ? "loot-pulse 2.4s ease-in-out infinite" : "none",
            }}>📦</div>
          </div>
        </div>

        {/* ACTIVE QUEST */}
        <div className="mq-card s3">
          <p style={{ margin: "0 0 2px", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Active Quest</p>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: "#11112a" }}>Track your spending</h3>
          <div style={{ height: 6, borderRadius: 3, background: "#EEEEED", marginBottom: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: "#11112a", width: "65%", transition: "width 0.7s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#bbb", fontWeight: 600 }}>
            <span>Keep going!</span>
            <button onClick={() => navigate("/achievements")} style={{ border: "none", background: "none", fontSize: 12, color: "#3b5bdb", fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
              View Quests →
            </button>
          </div>
        </div>

        {/* SAVINGS GOAL */}
        <div className="mq-card s4" style={{ marginBottom: 12 }}>
          {savingsGoal && (
            <div className={savingsFading ? "savings-fading" : ""}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 10, color: "#3b5bdb", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Savings Goal</p>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#11112a" }}>{savingsGoal.name}</h3>
                </div>
                <span style={{ fontSize: 24 }}>🎯</span>
              </div>
              {(() => {
                const pct = Math.min(100, Math.round((savingsGoal.saved_amount / savingsGoal.target_amount) * 100));
                return (
                  <>
                    <div style={{ height: 6, borderRadius: 3, background: "#EEEEED", overflow: "hidden", marginBottom: 6 }}>
                      <div className="savings-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 12 }}>
                      <span style={{ color: "#3b5bdb", fontWeight: 700 }}>{pct}%</span>
                      <span style={{ color: "#bbb", fontWeight: 500 }}>
                        {savingsGoal.saved_amount}€ / {savingsGoal.target_amount}€
                        {pct < 100 && <span style={{ color: "#e67e22", fontWeight: 600, marginLeft: 5 }}>· {savingsGoal.target_amount - savingsGoal.saved_amount}€ left</span>}
                      </span>
                    </div>
                    {pct < 100
                      ? <p style={{ margin: "0 0 10px", fontSize: 12, color: "#aaa", fontWeight: 500 }}>Getting closer 💪</p>
                      : <p style={{ margin: "0 0 10px", fontSize: 13, color: "#2e7d32", fontWeight: 700 }}>You did it 🎉</p>
                    }
                  </>
                );
              })()}
              {!savingsCompleted && (
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="mq-input" type="number" placeholder="Amount €" value={savingsAdd} onChange={e => setSavingsAdd(e.target.value)}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E8E8E4", fontSize: 14, fontFamily: "inherit", fontWeight: 600, outline: "none" }} />
                  <button className="mq-btn" onClick={e => addToSavings(e)}
                    style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#3b5bdb", color: "white", fontSize: 13, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap" }}>+ Save</button>
                </div>
              )}
              <div style={{ height: 1, background: "#F2F2EF", margin: "12px -20px 12px" }} />
            </div>
          )}

          {!showSavingsCreate ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 10, color: "#3b5bdb", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Savings Goal</p>
                <p style={{ margin: 0, fontSize: 13, color: "#bbb", fontWeight: 500 }}>{savingsGoal ? "Start a new goal" : "No goal set yet"}</p>
              </div>
              <button className="mq-btn" onClick={() => setShowSavingsCreate(true)}
                style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: "#11112a", color: "white", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>+ Create Goal</button>
            </div>
          ) : (
            <>
              <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800, color: "#11112a" }}>🎯 New Savings Goal</p>
              <input className="mq-input" placeholder="Goal name" value={savingsName} onChange={e => setSavingsName(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8E8E4", fontSize: 14, fontFamily: "inherit", fontWeight: 500, marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
              <input className="mq-input" type="number" placeholder="Target amount €" value={savingsTarget} onChange={e => setSavingsTarget(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8E8E4", fontSize: 14, fontFamily: "inherit", fontWeight: 600, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="mq-btn" onClick={createSavingsGoal} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#11112a", color: "white", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>Create</button>
                <button className="mq-btn" onClick={() => { setShowSavingsCreate(false); setSavingsName(""); setSavingsTarget(""); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#F2F2EF", color: "#11112a", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
              </div>
            </>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="mq-card s4">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#11112a" }}>Recent Activity</h3>
            <button onClick={() => navigate("/stats")} style={{ border: "none", background: "none", fontSize: 12, color: "#3b5bdb", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>View all</button>
          </div>
          {transactions.length === 0 ? (
            <p style={{ color: "#bbb", fontSize: 13, textAlign: "center", padding: "20px 0", fontWeight: 500 }}>No transactions yet</p>
          ) : (
            transactions.slice(0, 5).map((t, i) => (
              <div key={i} className="activity-row">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: t.category === "income" ? "#EEF7EE" : "#F5F5F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {CATEGORY_ICONS[t.category] || "💳"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#11112a", lineHeight: 1.3 }}>{t.description}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#bbb", fontWeight: 500, marginTop: 1 }}>
                      {t.category}{t.created_at ? ` · ${formatTime(t.created_at)}` : ""}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: t.category === "income" ? "#2e7d32" : "#c62828", flexShrink: 0, marginLeft: 8 }}>
                  {t.category === "income" ? "+" : "−"}{t.amount}€
                </span>
              </div>
            ))
          )}
        </div>

        {/* LOOTBOX MODAL */}
        {showLootbox && (
          <LootboxModal
            lootboxCount={lootboxCount}
            onClose={() => setShowLootbox(false)}
            onOpened={(_r, rem) => setLootboxCount(rem)}
          />
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        width: "100%", maxWidth: 390, margin: "0 auto",
        background: "white",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 26px",
        borderTop: "1px solid #EEEEED",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
        zIndex: 50,
      }}>
        {NAV_ITEMS.map(item => (
          <button key={item.label} className={`nav-btn ${item.active ? "is-active" : ""}`}
            style={{ color: item.active ? "#11112a" : "#bbb", fontWeight: item.active ? 800 : 500, letterSpacing: "0.3px" }}
            onClick={() => !item.active && navigate(item.path)}>
            {item.active && <span className="nav-pip" />}
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* MODAL — portal */}
      {showModal && ReactDOM.createPortal(
        <div className="mq-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}
          onClick={() => setShowModal(false)}
        >
          <div className="mq-sheet"
            style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "10px 20px 52px", width: "100%", maxWidth: 390 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E0E0DA", margin: "8px auto 20px" }} />
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 900, color: "#11112a", letterSpacing: "-0.3px" }}>
              {type === "income" ? "💼 Add Income" : "🧾 Add Expense"}
            </h3>
            {type === "expense" && (
              <>
                <input className="mq-input"
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #E8E8E4", fontSize: 14, marginBottom: 10, fontFamily: "inherit", fontWeight: 500 }}
                  placeholder="What did you spend on? (optional)" value={description} onChange={e => setDescription(e.target.value)} />
                <select style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #E8E8E4", fontSize: 14, marginBottom: 10, fontFamily: "inherit", background: "white", outline: "none", color: "#11112a", fontWeight: 500, appearance: "none" as const }}
                  value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="food">☕ Food & Coffee</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="fun">🎮 Entertainment</option>
                </select>
              </>
            )}
            <input className="mq-input"
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #E8E8E4", fontSize: 22, marginBottom: 8, fontFamily: "inherit", fontWeight: 800, letterSpacing: "-0.5px" }}
              type="number" inputMode="decimal" placeholder="0.00 €" value={amount}
              onChange={e => { setAmount(e.target.value); setBalanceError(""); }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[5, 10, 20].map(q => (
                <button key={q} className="mq-btn"
                  style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "1.5px solid #E8E8E4", background: "#FAFAF8", color: "#11112a", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}
                  onClick={() => setAmount(a => a ? String(Number(a) + q) : String(q))}>+{q}€</button>
              ))}
            </div>
            {balanceError && <p style={{ color: "#c62828", fontSize: 12, margin: "-4px 0 12px", fontWeight: 600 }}>⚠️ {balanceError}</p>}
            <button className="mq-btn"
              style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: "#11112a", color: "white", fontSize: 15, fontWeight: 800, marginBottom: 8, fontFamily: "inherit" }}
              onClick={e => addTransaction(e)}>Save Transaction</button>
            <button className="mq-btn"
              style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "#F2F2EF", color: "#11112a", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}
              onClick={() => { setShowModal(false); setBalanceError(""); }}>Cancel</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Home;