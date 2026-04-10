// src/pages/Profile.tsx
// Changes vs v2:
//   - Shows level badge and level progress bar (XP toward next level)
//   - Character SVG renders equipped_hat and equipped_glasses overlays
//   - Stat grid shows Level card
//   - /profile now returns level, equipped_hat, equipped_glasses (from updated user.ts)

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CHARACTERS: Record<string, { fur: string; inner: string }> = {
  brown:  { fur: "#8B7355", inner: "#C4956A" },
  white:  { fur: "#E8E8E8", inner: "#F5F5F5" },
  black:  { fur: "#2D2D2D", inner: "#4B4B4B" },
  orange: { fur: "#C2703A", inner: "#E8967A" },
};

// XP thresholds (same formula as backend: level = floor(xp/100)+1, cap 20)
function xpToLevel(xp: number): number {
  return Math.min(Math.floor(xp / 100) + 1, 20);
}
function xpForNextLevel(level: number): number {
  return level * 100; // XP needed to reach next level
}
function xpProgressInLevel(xp: number): number {
  return xp % 100; // progress within current level
}

function ChillGuy({
  fur, inner,
  equippedHat, equippedGlasses,
}: {
  fur: string; inner: string;
  equippedHat: string | null;
  equippedGlasses: string | null;
}) {
  return (
    <svg width="120" height="140" viewBox="0 0 200 230">
      {/* Base character — unchanged from original */}
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

      {/* ── Equipped overlays ── */}

      {/* HAT: simple rect on top of the head */}
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

      {/* GLASSES: two circles over the eyes */}
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
  const [user, setUser]                 = useState<any>(null);
  const [showIncomeEdit, setShowIncomeEdit] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDay, setIncomeDay]       = useState("1");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    fetch("https://moneyquest-pcoq.onrender.com/profile", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.user) navigate("/");
        else setUser(data.user);
      })
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#999" }}>Loading...</p>
      </div>
    );
  }

  const charColors = CHARACTERS[user.avatar] || CHARACTERS.brown;
  const currentLevel = user.level || xpToLevel(user.xp || 0);
  const xpInLevel = xpProgressInLevel(user.xp || 0);
  const xpNeeded = xpForNextLevel(currentLevel);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", maxWidth: 390, margin: "0 auto", fontFamily: "'Inter', sans-serif", paddingBottom: 40 }}>

      {/* HEADER */}
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>MoneyQuest</span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e8e8e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔔</div>
      </div>

      <div style={{ padding: "20px 24px 0" }}>

        {/* CHARACTER CARD — equipped items reflected on SVG */}
        <div style={{ background: "white", borderRadius: 24, padding: "24px 20px", display: "flex", alignItems: "center", gap: 20, marginBottom: 12 }}>
          <div style={{ flexShrink: 0 }}>
            <ChillGuy
              fur={charColors.fur}
              inner={charColors.inner}
              equippedHat={user.equipped_hat || null}
              equippedGlasses={user.equipped_glasses || null}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
              {user.name || "User"}
            </h2>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#999" }}>{user.email}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 10px", background: "#e8f0fe", borderRadius: 20, fontSize: 12, color: "#3b5bdb", fontWeight: 700 }}>
                Lv.{currentLevel}
              </span>
              <span style={{ padding: "4px 10px", background: "#f5f5f0", borderRadius: 20, fontSize: 12, color: "#1a1a2e", fontWeight: 600 }}>
                ⭐ {user.xp || 0} XP
              </span>
              <span style={{ padding: "4px 10px", background: "#fff8e7", borderRadius: 20, fontSize: 12, color: "#c9a84c", fontWeight: 600 }}>
                🪙 {user.coins || 0}
              </span>
            </div>
          </div>
        </div>

        {/* LEVEL PROGRESS BAR */}
        <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Level {currentLevel}</span>
            {currentLevel < 20 && (
              <span style={{ fontSize: 12, color: "#999" }}>→ Level {currentLevel + 1}</span>
            )}
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#f0f0ea" }}>
            <div style={{
              width: `${(xpInLevel / xpNeeded) * 100}%`,
              height: "100%", borderRadius: 4,
              background: "linear-gradient(90deg, #3b5bdb, #1a1a2e)",
              transition: "width 0.3s",
            }} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#999" }}>
            {currentLevel < 20
              ? `${xpInLevel} / ${xpNeeded} XP to next level`
              : "Max level reached! 🎉"}
          </p>
        </div>

        {/* STATS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "16px 20px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Coins</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>🪙 {user.coins || 0}</p>
          </div>
          <div style={{ background: "white", borderRadius: 16, padding: "16px 20px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Daily Streak</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#e53935" }}>
              🔥 {user.streak || 0} day{user.streak !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* MONTHLY INCOME — unchanged */}
        <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
          <p style={{ margin: "0 0 12px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Monthly Income</p>
          {!showIncomeEdit ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>
                  {user.monthly_income ? `${user.monthly_income} €` : "Not set"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#999" }}>
                  {user.income_day ? `Every month on day ${user.income_day}` : "Set up automatic top-ups"}
                </p>
              </div>
              <button onClick={() => setShowIncomeEdit(true)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "#f5f5f0", color: "#1a1a2e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {user.monthly_income ? "Edit" : "Set up →"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="number" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} placeholder="1500"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e8e8e0", fontSize: 15, boxSizing: "border-box", outline: "none" }} />
              <input type="number" min="1" max="28" value={incomeDay} onChange={(e) => setIncomeDay(e.target.value)} placeholder="1"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e8e8e0", fontSize: 15, boxSizing: "border-box", outline: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSaveIncome} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#1a1a2e", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Save</button>
                <button onClick={() => setShowIncomeEdit(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#f5f5f0", color: "#1a1a2e", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* PERSONAL INFO — unchanged */}
        <div style={{ background: "white", borderRadius: 16, padding: "8px 0", marginBottom: 12 }}>
          <p style={{ margin: "8px 20px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Personal Info</p>
          {[{ label: "Account Details", icon: "👤" }, { label: "Linked Banks", icon: "🏦" }].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f5f5f0", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 15, color: "#1a1a2e" }}>{item.label}</span>
              </div>
              <span style={{ color: "#ccc" }}>›</span>
            </div>
          ))}
        </div>

        {/* SETTINGS — unchanged */}
        <div style={{ background: "white", borderRadius: 16, padding: "8px 0", marginBottom: 12 }}>
          <p style={{ margin: "8px 20px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Settings</p>
          {[{ label: "Security & Privacy", icon: "🔒" }, { label: "Notifications", icon: "🔔" }, { label: "Appearance", icon: "🌙" }].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f5f5f0", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 15, color: "#1a1a2e" }}>{item.label}</span>
              </div>
              <span style={{ color: "#ccc" }}>›</span>
            </div>
          ))}
        </div>

        {/* ADMIN DEV TOOLS — unchanged */}
        {user.role === "admin" && (
          <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Dev Tools</p>
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                const res = await fetch("https://moneyquest-pcoq.onrender.com/admin/add-xp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ amount: 100 }),
                });
                const data = await res.json();
                if (data.amount) setUser({ ...user, xp: (user.xp || 0) + data.amount });
              }}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "#fff8e7", color: "#c9a84c", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              ⚡ +100 XP (Dev)
            </button>
          </div>
        )}

        {/* LOGOUT */}
        <button onClick={handleLogout} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: "#fff0f0", color: "#e53935", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          Sign out
        </button>

      </div>
    </div>
  );
}

export default Profile;
