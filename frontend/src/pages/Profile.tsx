import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CHARACTERS: Record<string, { fur: string; inner: string }> = {
  brown:  { fur: "#8B5228", inner: "#E8B97A" },
  white:  { fur: "#C8BEB4", inner: "#EDE8E0" },
  black:  { fur: "#4A4050", inner: "#8A8090" },
  orange: { fur: "#C05C20", inner: "#F0A060" },
};

function xpToLevel(xp: number) { return Math.min(Math.floor(xp / 100) + 1, 20); }
function xpForNextLevel(level: number) { return level * 100; }
function xpProgressInLevel(xp: number) { return xp % 100; }

// ─────────────────────────────────────────────────────────────────────────────
//  BEAR CHARACTER — same minimalist mascot as Home screen
// ─────────────────────────────────────────────────────────────────────────────
function BearCharacter({ fur, inner }: { fur: string; inner: string }) {
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

  return (
    <svg
      width="110" height="132"
      viewBox="0 0 200 240"
      className="profile-bear"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* ── BODY — wider, chubby ── */}
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

      {/* ── MOUTH — soft W ── */}
      <path
        d="M88,116 Q94,122 100,116 Q106,122 112,116"
        fill="none"
        stroke="#2A1506"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const isMaxLevel   = currentLevel >= 20;

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
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        .profile-bear { animation: breathe 4s ease-in-out infinite; }

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
          <div className="p-card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px" }}>
            <div style={{ flexShrink: 0 }}>
              <BearCharacter fur={charColors.fur} inner={charColors.inner} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 900, color: "#11112a", letterSpacing: "-0.4px" }}>
                {user.name || "User"}
              </h2>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#aaa", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                <span style={{ padding: "4px 10px", background: "#eff3ff", borderRadius: 20, fontSize: 12, color: "#3b5bdb", fontWeight: 800 }}>Lv.{currentLevel}</span>
                {!isMaxLevel && (
                  <span style={{ padding: "4px 10px", background: "#f0f0ea", borderRadius: 20, fontSize: 12, color: "#11112a", fontWeight: 700 }}>⭐ {user.xp || 0} XP</span>
                )}
                <span style={{ padding: "4px 10px", background: "#fff8e7", borderRadius: 20, fontSize: 12, color: "#c9a84c", fontWeight: 700 }}>🪙 {user.coins || 0}</span>
              </div>
            </div>
          </div>

          {/* XP PROGRESS — hidden at max level */}
          {!isMaxLevel && (
            <div className="p-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: "#11112a" }}>Level {currentLevel}</span>
                <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>→ Level {currentLevel + 1}</span>
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
                {xpInLevel} / {xpNeeded} XP to next level
              </p>
            </div>
          )}

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
                <button
                  className="tap"
                  onClick={() => setShowIncomeEdit(true)}
                  style={{
                    padding: "10px 18px", borderRadius: 12, border: "none",
                    background: user.monthly_income ? "#f0f0ea" : "#11112a",
                    color: user.monthly_income ? "#11112a" : "white",
                    fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                  }}
                >
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