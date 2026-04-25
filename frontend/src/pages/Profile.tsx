import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CHARACTERS: Record<string, { fur: string; inner: string }> = {
  brown:  { fur: "#8B7355", inner: "#C4956A" },
  white:  { fur: "#E8E8E8", inner: "#F5F5F5" },
  black:  { fur: "#2D2D2D", inner: "#4B4B4B" },
  orange: { fur: "#C2703A", inner: "#E8967A" },
};

function xpToLevel(xp: number) { return Math.min(Math.floor(xp / 100) + 1, 20); }
function xpForNextLevel(level: number) { return level * 100; }
function xpProgressInLevel(xp: number) { return xp % 100; }

function ChillGuy({ fur, inner, equippedHat, equippedGlasses, equippedOutfit }: {
  fur: string; inner: string;
  equippedHat: string | null;
  equippedGlasses: string | null;
  equippedOutfit?: string | null;
}) {
  return (
    <svg width="120" height="140" viewBox="0 0 200 230" className="profile-bear">

      {/* ── HOODIE ── */}
      {equippedOutfit === "hoodie" && (
        <g>
          {/* Hood behind head */}
          <ellipse cx="100" cy="62" rx="46" ry="38" fill="#4A6ED4" opacity="0.95" />
          <ellipse cx="100" cy="58" rx="38" ry="30" fill="#5B7DD8" />

          {/* Wide body — extends far outside bear silhouette */}
          <rect x="10" y="148" width="180" height="90" rx="28" fill="#5B7DD8" />

          {/* Shoulder bulk */}
          <ellipse cx="22"  cy="168" rx="28" ry="22" fill="#5B7DD8" />
          <ellipse cx="178" cy="168" rx="28" ry="22" fill="#5B7DD8" />

          {/* Sleeve left */}
          <path d="M10 162 Q-18 190 -8 228" fill="none" stroke="#5B7DD8" strokeWidth="38" strokeLinecap="round" />
          {/* Sleeve right */}
          <path d="M190 162 Q218 190 208 228" fill="none" stroke="#5B7DD8" strokeWidth="38" strokeLinecap="round" />

          {/* Sleeve cuffs */}
          <ellipse cx="-8"  cy="228" rx="19" ry="10" fill="#4A6BC7" />
          <ellipse cx="208" cy="228" rx="19" ry="10" fill="#4A6BC7" />

          {/* Body shading */}
          <rect x="10" y="185" width="180" height="53" rx="18" fill="#4A6BC7" opacity="0.5" />

          {/* Center seam */}
          <line x1="100" y1="150" x2="100" y2="238" stroke="#4060B8" strokeWidth="2" opacity="0.6" />

          {/* Front pocket */}
          <rect x="68" y="195" width="64" height="36" rx="14" fill="#4A6BC7" />
          <rect x="72" y="199" width="56" height="28" rx="11" fill="#4560C0" />

          {/* Hood inner shadow */}
          <ellipse cx="100" cy="72" rx="28" ry="22" fill="#4A6BC7" opacity="0.4" />

          {/* Hood drawstring */}
          <path d="M78 94 Q88 100 100 97 Q112 100 122 94" fill="none" stroke="#3A5AB0" strokeWidth="2" strokeLinecap="round" />
          <circle cx="78"  cy="94" r="3" fill="#3A5AB0" />
          <circle cx="122" cy="94" r="3" fill="#3A5AB0" />
        </g>
      )}

      {/* ── SUIT ── */}
      {equippedOutfit === "suit" && (
        <g>
          {/* Jacket base */}
          <rect x="14" y="148" width="172" height="90" rx="22" fill="#1E1E38" />

          {/* Shoulder pads */}
          <ellipse cx="20"  cy="162" rx="26" ry="16" fill="#252545" />
          <ellipse cx="180" cy="162" rx="26" ry="16" fill="#252545" />

          {/* Left sleeve */}
          <path d="M14 158 Q-14 188 -4 230" fill="none" stroke="#1E1E38" strokeWidth="36" strokeLinecap="round" />
          {/* Right sleeve */}
          <path d="M186 158 Q214 188 204 230" fill="none" stroke="#1E1E38" strokeWidth="36" strokeLinecap="round" />

          {/* Sleeve cuffs — white shirt peeking */}
          <ellipse cx="-4"  cy="230" rx="18" ry="9" fill="#F0F0F0" />
          <ellipse cx="204" cy="230" rx="18" ry="9" fill="#F0F0F0" />

          {/* Jacket panels */}
          <path d="M14 148 Q14 238 55 238 L55 148 Z" fill="#252548" opacity="0.7" />
          <path d="M186 148 Q186 238 145 238 L145 148 Z" fill="#252548" opacity="0.7" />

          {/* White shirt V */}
          <polygon points="100,150 80,238 120,238" fill="#F5F5F5" />

          {/* Left lapel */}
          <polygon points="100,150 60,150 76,196" fill="#2A2A4A" />
          {/* Right lapel */}
          <polygon points="100,150 140,150 124,196" fill="#2A2A4A" />

          {/* Lapel shine */}
          <polygon points="100,150 64,150 72,172" fill="#32325A" opacity="0.8" />
          <polygon points="100,150 136,150 128,172" fill="#32325A" opacity="0.8" />

          {/* Pocket square */}
          <rect x="26" y="168" width="18" height="12" rx="3" fill="#F5F5F5" opacity="0.9" />

          {/* Tie */}
          <polygon points="100,152 94,172 100,220 106,172" fill="#C9A84C" />
          <polygon points="94,152 106,152 108,164 92,164" fill="#E8C060" />
          <line x1="100" y1="175" x2="100" y2="215" stroke="#B89040" strokeWidth="1.5" opacity="0.6" />

          {/* Buttons */}
          <circle cx="100" cy="228" r="3" fill="#2A2A4A" />
          <circle cx="100" cy="214" r="3" fill="#2A2A4A" />
          <circle cx="100" cy="200" r="3" fill="#2A2A4A" />

          {/* Jacket bottom edge */}
          <rect x="14" y="232" width="172" height="8" rx="6" fill="#161630" />
        </g>
      )}

      {/* ── ROYAL ROBE ── */}
      {equippedOutfit === "royal_robe" && (
        <g>
          {/* Cape — dramatic wide shape */}
          <ellipse cx="100" cy="155" rx="88" ry="20" fill="#4A0E8F" />
          <path d="M12 155 Q-10 210 8 250 Q50 270 100 268 Q150 270 192 250 Q210 210 188 155 Z" fill="#5B1AAA" />

          {/* Cape inner shadow */}
          <path d="M30 158 Q16 205 28 245 Q60 260 100 258 Q140 260 172 245 Q184 205 170 158 Z" fill="#4A0E8F" opacity="0.6" />

          {/* Robe body */}
          <rect x="22" y="148" width="156" height="92" rx="24" fill="#6B21A8" />

          {/* Shoulder mantle */}
          <ellipse cx="100" cy="150" rx="76" ry="18" fill="#7C2EC0" />

          {/* Left sleeve */}
          <path d="M22 156 Q-16 192 -4 238" fill="none" stroke="#6B21A8" strokeWidth="40" strokeLinecap="round" />
          {/* Right sleeve */}
          <path d="M178 156 Q216 192 204 238" fill="none" stroke="#6B21A8" strokeWidth="40" strokeLinecap="round" />

          {/* Gold cuffs */}
          <ellipse cx="-4"  cy="238" rx="20" ry="10" fill="#C9A84C" />
          <ellipse cx="204" cy="238" rx="20" ry="10" fill="#C9A84C" />
          <ellipse cx="-4"  cy="237" rx="16" ry="6"  fill="#E8C060" opacity="0.6" />
          <ellipse cx="204" cy="237" rx="16" ry="6"  fill="#E8C060" opacity="0.6" />

          {/* Gold shoulder trim */}
          <path d="M24 150 Q100 132 176 150" fill="none" stroke="#C9A84C" strokeWidth="5" strokeLinecap="round" />
          <path d="M24 150 Q100 132 176 150" fill="none" stroke="#F0D870" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          {/* Gold bottom hem */}
          <rect x="22" y="230" width="156" height="10" rx="5" fill="#C9A84C" />
          <rect x="22" y="231" width="156" height="5"  rx="3" fill="#F0D870" opacity="0.5" />

          {/* Center front panel */}
          <rect x="82" y="150" width="36" height="88" rx="6" fill="#7C2EC0" />

          {/* Gold center trim */}
          <rect x="93" y="148" width="14" height="92" rx="4" fill="#C9A84C" />
          <rect x="96" y="148" width="8"  height="92" rx="3" fill="#F0D870" opacity="0.5" />

          {/* Gemstones */}
          <circle cx="100" cy="168" r="6" fill="#E53935" />
          <circle cx="100" cy="168" r="3" fill="#FF6B6B" opacity="0.7" />
          <circle cx="100" cy="190" r="5" fill="#1565C0" />
          <circle cx="100" cy="190" r="2.5" fill="#64B5F6" opacity="0.7" />
          <circle cx="100" cy="210" r="5" fill="#2E7D32" />
          <circle cx="100" cy="210" r="2.5" fill="#81C784" opacity="0.7" />

          {/* Side ornaments */}
          <circle cx="56"  cy="172" r="5" fill="#C9A84C" />
          <circle cx="144" cy="172" r="5" fill="#C9A84C" />
          <circle cx="56"  cy="172" r="2.5" fill="#F0D870" opacity="0.7" />
          <circle cx="144" cy="172" r="2.5" fill="#F0D870" opacity="0.7" />

          {/* Side accent lines */}
          <line x1="40"  y1="158" x2="40"  y2="235" stroke="#C9A84C" strokeWidth="2" opacity="0.5" />
          <line x1="160" y1="158" x2="160" y2="235" stroke="#C9A84C" strokeWidth="2" opacity="0.5" />

          {/* Fur collar */}
          <path d="M22 150 Q100 138 178 150 Q160 162 100 158 Q40 162 22 150 Z" fill="#F5F5F5" opacity="0.9" />
          <path d="M30 150 Q100 141 170 150 Q155 158 100 155 Q45 158 30 150 Z" fill="#E8E8E8" opacity="0.5" />
        </g>
      )}

      {/* ── DEFAULT BODY (hidden when outfit equipped) ── */}
      {!equippedOutfit && (
        <g>
          <rect x="30" y="158" width="140" height="72" rx="20" fill="#4A4A6A" />
          <path d="M30 175 Q100 148 170 175" fill="#4A4A6A" />
          <rect x="55" y="195" width="90" height="25" rx="10" fill="#3A3A5A" />
          <path d="M30 170 Q10 205 30 235"   fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
          <path d="M170 170 Q190 205 170 235" fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
        </g>
      )}

      {/* ── BEAR BODY ── */}
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

      <ellipse cx="22"  cy="232" rx="14" ry="12" fill={fur} />
      <ellipse cx="178" cy="232" rx="14" ry="12" fill={fur} />

      {/* ── HATS ── */}
      {equippedHat === "hat" && (
        <g><rect x="72" y="38" width="56" height="8" rx="3" fill="#2D1B0E" /><rect x="82" y="18" width="36" height="22" rx="5" fill="#2D1B0E" /></g>
      )}
      {equippedHat === "crown" && (
        <g><polygon points="76,42 88,22 100,36 112,22 124,42" fill="#FFD700" /><rect x="76" y="40" width="48" height="6" rx="2" fill="#FFD700" /></g>
      )}

      {/* ── GLASSES ── */}
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

function Profile() {
  const navigate = useNavigate();
  const [user, setUser]                     = useState<any>(null);
  const [showIncomeEdit, setShowIncomeEdit] = useState(false);
  const [incomeAmount, setIncomeAmount]     = useState("");
  const [incomeDay, setIncomeDay]           = useState("1");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    fetch("https://moneyquest-pcoq.onrender.com/profile", {
      headers: { Authorization: "Bearer " + token },
    }).then(r => r.json()).then(d => { if (!d.user) navigate("/"); else setUser(d.user); })
      .catch(() => navigate("/"));
  }, []);

  const handleSaveIncome = async () => {
    const token = localStorage.getItem("token");
    await fetch("https://moneyquest-pcoq.onrender.com/update-income", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ monthly_income: Number(incomeAmount), income_day: Number(incomeDay) }),
    });
    setUser({ ...user, monthly_income: Number(incomeAmount), income_day: Number(incomeDay) });
    setShowIncomeEdit(false);
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#efefea", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      <p style={{ color: "#bbb", fontWeight: 600 }}>Loading…</p>
    </div>
  );

  const charColors   = CHARACTERS[user.avatar] || CHARACTERS.brown;
  const currentLevel = user.level || xpToLevel(user.xp || 0);
  const xpInLevel    = xpProgressInLevel(user.xp || 0);
  const xpNeeded     = xpForNextLevel(currentLevel);
  const xpPct        = (xpInLevel / xpNeeded) * 100;

  const NAV_ITEMS = [
    { icon: "🏠", label: "HOME",    path: "/home",         active: false },
    { icon: "🏆", label: "QUESTS",  path: "/achievements", active: false },
    { icon: "📊", label: "STATS",   path: "/stats",        active: false },
    { icon: "👤", label: "PROFILE", path: "/profile",      active: true  },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes prof-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .prof-page { animation: prof-in 0.35s ease both; }

        @keyframes breathe {
          0%,100% { transform: scaleY(1) translateY(0); }
          50%      { transform: scaleY(1.03) translateY(-2px); }
        }
        .profile-bear { transform-origin: 50% 90%; animation: breathe 3.6s ease-in-out infinite; }

        @keyframes xp-in { from { width: 0 !important; } }
        .xp-prof { animation: xp-in 0.9s cubic-bezier(0.22,1,0.36,1) both 0.3s; }

        .p-card {
          background: white; border-radius: 22px; padding: 20px;
          margin-bottom: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.055);
        }
        .p-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-top: 1px solid #f0f0ea; cursor: pointer;
          transition: background 0.14s;
        }
        .p-row:hover { background: #fafaf8; }

        .tap {
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.13s cubic-bezier(0.34,1.5,0.64,1), opacity 0.13s;
          cursor: pointer;
        }
        .tap:active { transform: scale(0.94) !important; opacity: 0.8; }

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
        .mq-input:focus { border-color: #11112a !important; box-shadow: 0 0 0 3px rgba(17,17,42,0.08) !important; outline: none; }
      `}</style>

      <div className="prof-page" style={{ minHeight: "100vh", background: "#efefea", maxWidth: 390, margin: "0 auto", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", paddingBottom: 100 }}>

        {/* HEADER */}
        <div style={{ padding: "24px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#11112a", letterSpacing: "-0.4px" }}>MoneyQuest</span>
          <div className="tap" style={{ width: 40, height: 40, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>🔔</div>
        </div>

        <div style={{ padding: "0 20px" }}>

          {/* CHARACTER CARD */}
          <div className="p-card" style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 20px" }}>
            <div style={{ flexShrink: 0 }}>
              <ChillGuy
                fur={charColors.fur}
                inner={charColors.inner}
                equippedHat={user.equipped_hat || null}
                equippedGlasses={user.equipped_glasses || null}
                equippedOutfit={user.equipped_outfit || null}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 900, color: "#11112a", letterSpacing: "-0.4px" }}>
                {user.name || "User"}
              </h2>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#aaa", fontWeight: 500 }}>{user.email}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                <span style={{ padding: "4px 10px", background: "#eff3ff", borderRadius: 20, fontSize: 12, color: "#3b5bdb", fontWeight: 800 }}>Lv.{currentLevel}</span>
                <span style={{ padding: "4px 10px", background: "#f0f0ea", borderRadius: 20, fontSize: 12, color: "#11112a", fontWeight: 700 }}>⭐ {user.xp || 0} XP</span>
                <span style={{ padding: "4px 10px", background: "#fff8e7", borderRadius: 20, fontSize: 12, color: "#c9a84c", fontWeight: 700 }}>🪙 {user.coins || 0}</span>
              </div>
            </div>
          </div>

          {/* XP PROGRESS */}
          <div className="p-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#11112a" }}>Level {currentLevel}</span>
              {currentLevel < 20 && <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>→ Level {currentLevel + 1}</span>}
            </div>
            <div style={{ height: 9, borderRadius: 5, background: "#f0f0ea", overflow: "hidden" }}>
              <div
                className="xp-prof"
                style={{
                  width: `${xpPct}%`, height: "100%", borderRadius: 5,
                  background: "linear-gradient(90deg, #3b5bdb, #11112a)",
                  boxShadow: "0 0 8px rgba(59,91,219,0.4)",
                }}
              />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#aaa", fontWeight: 500 }}>
              {currentLevel < 20 ? `${xpInLevel} / ${xpNeeded} XP to next level` : "Max level reached! 🎉"}
            </p>
          </div>

          {/* STATS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ background: "white", borderRadius: 18, padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Coins</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#c9a84c", letterSpacing: "-0.4px" }}>🪙 {user.coins || 0}</p>
            </div>
            <div style={{ background: "white", borderRadius: 18, padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Streak</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#e53935", letterSpacing: "-0.4px" }}>🔥 {user.streak || 0}d</p>
            </div>
          </div>

          {/* MONTHLY INCOME */}
          <div className="p-card">
            <p style={{ margin: "0 0 12px", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Monthly Income</p>
            {!showIncomeEdit ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#11112a", letterSpacing: "-0.4px" }}>
                    {user.monthly_income ? `${user.monthly_income} €` : "Not set"}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#aaa", fontWeight: 500 }}>
                    {user.income_day ? `Every month on day ${user.income_day}` : "Set up automatic top-ups"}
                  </p>
                </div>
                <button className="tap" onClick={() => setShowIncomeEdit(true)} style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: "#f0f0ea", color: "#11112a", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>
                  {user.monthly_income ? "Edit" : "Set up →"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="number" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} placeholder="1500" className="mq-input"
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1.5px solid #e4e4de", fontSize: 15, fontFamily: "inherit", fontWeight: 600 }} />
                <input type="number" min="1" max="28" value={incomeDay} onChange={e => setIncomeDay(e.target.value)} placeholder="Day 1–28" className="mq-input"
                  style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1.5px solid #e4e4de", fontSize: 15, fontFamily: "inherit", fontWeight: 600 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="tap" onClick={handleSaveIncome} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "#11112a", color: "white", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>Save</button>
                  <button className="tap" onClick={() => setShowIncomeEdit(false)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "#f0f0ea", color: "#11112a", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* PERSONAL INFO */}
          <div className="p-card" style={{ padding: "8px 20px" }}>
            <p style={{ margin: "10px 0 2px", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Personal Info</p>
            {[{ label: "Account Details", icon: "👤" }, { label: "Linked Banks", icon: "🏦" }].map(item => (
              <div key={item.label} className="p-row" style={{ borderRadius: 8, margin: "0 -4px", padding: "14px 4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 15, color: "#11112a", fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
              </div>
            ))}
          </div>

          {/* SETTINGS */}
          <div className="p-card" style={{ padding: "8px 20px" }}>
            <p style={{ margin: "10px 0 2px", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Settings</p>
            {[{ label: "Security & Privacy", icon: "🔒" }, { label: "Notifications", icon: "🔔" }, { label: "Appearance", icon: "🌙" }].map(item => (
              <div key={item.label} className="p-row" style={{ borderRadius: 8, margin: "0 -4px", padding: "14px 4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 15, color: "#11112a", fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
              </div>
            ))}
          </div>

          {/* ADMIN DEV TOOLS */}
          {user.role === "admin" && (
            <div className="p-card">
              <p style={{ margin: "0 0 12px", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Dev Tools</p>
              <button
                className="tap"
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  const r = await fetch("https://moneyquest-pcoq.onrender.com/admin/add-xp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ amount: 100 }),
                  });
                  const d = await r.json();
                  if (d.amount) setUser({ ...user, xp: (user.xp || 0) + d.amount });
                }}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "#fff8e7", color: "#c9a84c", fontSize: 14, fontWeight: 800, fontFamily: "inherit" }}
              >⚡ +100 XP (Dev)</button>
              <button
                className="tap"
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  const r = await fetch("https://moneyquest-pcoq.onrender.com/admin/add-coins", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ amount: 100 }),
                  });
                  const d = await r.json();
                  if (d.amount) setUser({ ...user, coins: (user.coins || 0) + d.amount });
                }}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "#fff8e7", color: "#c9a84c", fontSize: 14, fontWeight: 800, fontFamily: "inherit", marginTop: 8 }}
              >🪙 +100 Coins (Dev)</button>
            </div>
          )}

          {/* LOGOUT */}
          <button
            className="tap"
            onClick={handleLogout}
            style={{ width: "100%", padding: 17, borderRadius: 16, border: "none", background: "#fff0f0", color: "#c62828", fontSize: 15, fontWeight: 700, fontFamily: "inherit", marginBottom: 12 }}
          >
            Sign out
          </button>
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

export default Profile;