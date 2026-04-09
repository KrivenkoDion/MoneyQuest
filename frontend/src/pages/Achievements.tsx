// src/pages/Achievements.tsx
// Changes:
//  - xp badge stays (for XP display)
//  - added coins badge next to XP
//  - quest cards show both +XP and +coins rewards
//  - shop uses coins balance, not XP

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API = "https://moneyquest-pcoq.onrender.com";

type Quest = {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  coin_reward: number;
  completed: boolean;
  claimed: boolean;
};

type ShopItem = {
  id: string;
  name: string;
  cost: number;
  owned: boolean;
};

function Achievements() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [tab, setTab] = useState<"quests" | "shop">("quests");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    loadQuests();
    loadShop();
  }, []);

  const loadQuests = async () => {
    const res = await fetch(`${API}/quests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setQuests(data);
  };

  const loadShop = async () => {
    const res = await fetch(`${API}/shop`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    // Shop now returns coins (not xp)
    setCoins(data.coins || 0);
    setItems(data.items || []);
  };

  // Also refresh XP from profile when quests are claimed
  const loadProfile = async () => {
    const res = await fetch(`${API}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setXp(data.user?.xp || 0);
  };

  const claimQuest = async (questId: string) => {
    const res = await fetch(`${API}/quests/${questId}/claim`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.xp_reward !== undefined) {
      showMsg(`+${data.xp_reward} XP  +${data.coin_reward} 🪙 claimed! 🎉`);
      loadQuests();
      loadShop();
      loadProfile();
    } else {
      showMsg(data.error || "Error");
    }
  };

  const buyItem = async (itemId: string) => {
    const res = await fetch(`${API}/shop/buy/${itemId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.item_id) {
      showMsg("Item purchased! 🛍️");
      loadShop();
    } else {
      showMsg(data.error || "Error");
    }
  };

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  const ITEM_EMOJI: Record<string, string> = {
    glasses: "🕶️",
    hat: "🎩",
  };

  const s: Record<string, any> = {
    page: {
      minHeight: "100vh", background: "#f5f5f0",
      maxWidth: 390, margin: "0 auto",
      fontFamily: "'Inter', sans-serif", paddingBottom: 100,
    },
    header: {
      padding: "20px 24px", display: "flex",
      justifyContent: "space-between", alignItems: "center",
    },
    logo: { fontWeight: 700, fontSize: 16, color: "#1a1a2e" },
    // Header badges row
    badges: { display: "flex", gap: 8, alignItems: "center" },
    xpBadge: {
      padding: "6px 14px", background: "#1a1a2e", color: "white",
      borderRadius: 20, fontSize: 13, fontWeight: 700,
    },
    coinBadge: {
      padding: "6px 14px", background: "#c9a84c", color: "white",
      borderRadius: 20, fontSize: 13, fontWeight: 700,
    },
    tabs: {
      display: "flex", margin: "0 24px 20px",
      background: "white", borderRadius: 14, padding: 4, gap: 4,
    },
    tab: (active: boolean): React.CSSProperties => ({
      flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
      background: active ? "#1a1a2e" : "transparent",
      color: active ? "white" : "#999",
      fontSize: 14, fontWeight: 600, cursor: "pointer",
      fontFamily: "'Inter', sans-serif",
    }),
    card: {
      background: "white", borderRadius: 20,
      padding: "20px", margin: "0 24px 14px",
    },
    questTitle: { margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1a1a2e" },
    questDesc: { margin: "0 0 10px", fontSize: 13, color: "#999" },
    rewardRow: { display: "flex", gap: 8, marginBottom: 14 },
    xpChip: {
      display: "inline-block", padding: "4px 10px",
      background: "#f0f4ff", borderRadius: 20,
      fontSize: 12, color: "#3b5bdb", fontWeight: 600,
    },
    coinChip: {
      display: "inline-block", padding: "4px 10px",
      background: "#fff8e7", borderRadius: 20,
      fontSize: 12, color: "#c9a84c", fontWeight: 600,
    },
    claimBtn: {
      padding: "10px 20px", borderRadius: 10, border: "none",
      background: "#1a1a2e", color: "white",
      fontSize: 13, fontWeight: 600, cursor: "pointer",
    },
    claimedBtn: {
      padding: "10px 20px", borderRadius: 10, border: "none",
      background: "#f0f0ea", color: "#999",
      fontSize: 13, fontWeight: 600, cursor: "default",
    },
    lockedBtn: {
      padding: "10px 20px", borderRadius: 10, border: "none",
      background: "#f0f0ea", color: "#bbb",
      fontSize: 13, fontWeight: 600, cursor: "default",
    },
    itemEmoji: { fontSize: 40, marginBottom: 8, display: "block" },
    itemName: { margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1a1a2e" },
    itemCost: { margin: "0 0 14px", fontSize: 13, color: "#c9a84c", fontWeight: 600 },
    buyBtn: {
      width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
      background: "#1a1a2e", color: "white",
      fontSize: 14, fontWeight: 600, cursor: "pointer",
    },
    ownedBtn: {
      width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
      background: "#f0f0ea", color: "#999",
      fontSize: 14, fontWeight: 600, cursor: "default",
    },
    toast: {
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      background: "#1a1a2e", color: "white", borderRadius: 14,
      padding: "12px 20px", fontSize: 14, fontWeight: 600,
      zIndex: 200, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    },
    navBar: {
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: 390, background: "white", display: "flex",
      justifyContent: "space-around", padding: "12px 0 24px",
      borderTop: "1px solid #f0f0ea",
    },
    navItem: (active: boolean): React.CSSProperties => ({
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 4, fontSize: 10, color: active ? "#1a1a2e" : "#999",
      fontWeight: active ? 700 : 400, cursor: "pointer",
      border: "none", background: "none", fontFamily: "'Inter', sans-serif",
    }),
  };

  return (
    <div style={s.page}>

      {/* TOAST */}
      {msg && <div style={s.toast}>{msg}</div>}

      {/* HEADER */}
      <div style={s.header}>
        <span style={s.logo}>MoneyQuest</span>
        <div style={s.badges}>
          <span style={s.xpBadge}>⭐ {xp} XP</span>
          <span style={s.coinBadge}>🪙 {coins}</span>
        </div>
      </div>

      {/* TABS */}
      <div style={s.tabs}>
        <button style={s.tab(tab === "quests")} onClick={() => setTab("quests")}>🏆 Quests</button>
        <button style={s.tab(tab === "shop")} onClick={() => setTab("shop")}>🛒 Shop</button>
      </div>

      {/* QUESTS TAB */}
      {tab === "quests" && quests.map((q) => (
        <div key={q.id} style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={s.questTitle}>{q.title}</p>
              <p style={s.questDesc}>{q.description}</p>
              {/* Reward chips: XP + coins */}
              <div style={s.rewardRow}>
                <span style={s.xpChip}>+{q.xp_reward} XP</span>
                <span style={s.coinChip}>+{q.coin_reward} 🪙</span>
              </div>
            </div>
            <span style={{ fontSize: 32, marginLeft: 12 }}>
              {q.claimed ? "✅" : q.completed ? "🎁" : "🔒"}
            </span>
          </div>

          {q.claimed ? (
            <button style={s.claimedBtn} disabled>Claimed</button>
          ) : q.completed ? (
            <button style={s.claimBtn} onClick={() => claimQuest(q.id)}>
              Claim +{q.xp_reward} XP +{q.coin_reward} 🪙
            </button>
          ) : (
            <button style={s.lockedBtn} disabled>Not completed</button>
          )}
        </div>
      ))}

      {/* SHOP TAB — now uses coins */}
      {tab === "shop" && (
        <>
          <div style={{ margin: "0 24px 16px", padding: "14px 20px", background: "white", borderRadius: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#999" }}>Your balance</p>
            <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: "#1a1a2e" }}>🪙 {coins} coins</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "0 24px" }}>
            {items.map((item) => (
              <div key={item.id} style={{ ...s.card, margin: 0, textAlign: "center" as const }}>
                <span style={s.itemEmoji}>{ITEM_EMOJI[item.id] || "🎁"}</span>
                <p style={s.itemName}>{item.name}</p>
                <p style={s.itemCost}>🪙 {item.cost} coins</p>
                {item.owned ? (
                  <button style={s.ownedBtn} disabled>Owned</button>
                ) : (
                  <button
                    style={{
                      ...s.buyBtn,
                      background: coins >= item.cost ? "#1a1a2e" : "#e8e8e0",
                      color: coins >= item.cost ? "white" : "#999",
                      cursor: coins >= item.cost ? "pointer" : "default",
                    }}
                    onClick={() => coins >= item.cost && buyItem(item.id)}
                  >
                    {coins >= item.cost ? "Buy" : "Need more 🪙"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* BOTTOM NAV */}
      <div style={s.navBar}>
        <button style={s.navItem(false)} onClick={() => navigate("/home")}>
          <span style={{ fontSize: 20 }}>🏠</span>HOME
        </button>
        <button style={s.navItem(true)}>
          <span style={{ fontSize: 20 }}>🏆</span>QUESTS
        </button>
        <button style={s.navItem(false)}>
          <span style={{ fontSize: 20 }}>🎖️</span>MEDALS
        </button>
        <button style={s.navItem(false)} onClick={() => navigate("/profile")}>
          <span style={{ fontSize: 20 }}>👤</span>PROFILE
        </button>
      </div>

    </div>
  );
}

export default Achievements;
