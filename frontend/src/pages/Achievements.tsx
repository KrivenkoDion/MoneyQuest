// src/pages/Achievements.tsx
// Added vs previous:
//   - Lootbox count badge in header
//   - Quest claim shows lootbox_granted toast
//   - Everything else unchanged

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API = "https://moneyquest-pcoq.onrender.com";

type Quest = {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  coin_reward: number;
  goal: number;
  progress: number;
  remaining: number;
  claimable: boolean;
  completed: boolean;
};

type ShopItem = {
  id: string;
  name: string;
  type: string;
  cost: number;
  owned: boolean;
  equipped: boolean;
};

function Achievements() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const [xp, setXp]           = useState(0);
  const [level, setLevel]     = useState(1);
  const [coins, setCoins]     = useState(0);
  const [lootboxes, setLootboxes] = useState(0);
  const [quests, setQuests]   = useState<Quest[]>([]);
  const [items, setItems]     = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<ShopItem[]>([]);
  const [tab, setTab]         = useState<"quests" | "shop" | "inventory">("quests");
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    loadAll();
  }, []);

  const loadAll = () => {
    loadQuests();
    loadShop();
    loadProfile();
    loadInventory();
    loadLootboxes();
  };

  const loadQuests = async () => {
    const res = await fetch(`${API}/quests`, { headers: { Authorization: `Bearer ${token}` } });
    setQuests(await res.json());
  };

  const loadShop = async () => {
    const res  = await fetch(`${API}/shop`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCoins(data.coins || 0);
    setItems(data.items || []);
  };

  const loadInventory = async () => {
    const res  = await fetch(`${API}/inventory`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setInventory(data.inventory || []);
  };

  const loadProfile = async () => {
    const res  = await fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setXp(data.user?.xp    || 0);
    setLevel(data.user?.level || 1);
  };

  const loadLootboxes = async () => {
    const res  = await fetch(`${API}/lootbox`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setLootboxes(data.lootboxes || 0);
  };

  const claimQuest = async (questId: string) => {
    const res  = await fetch(`${API}/quests/${questId}/claim`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.xp_reward !== undefined) {
      const levelMsg   = data.level_up ? `  ⬆️ Level ${data.level_up}!` : "";
      const lootboxMsg = data.lootbox_granted ? "  📦 +1 Lootbox!" : "";
      showMsg(`+${data.xp_reward} XP  +${data.coin_reward} 🪙 claimed!${levelMsg}${lootboxMsg} 🎉`);
      loadAll();
    } else {
      showMsg(data.error || "Error");
    }
  };

  const buyItem = async (itemId: string) => {
    const res  = await fetch(`${API}/shop/buy/${itemId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.item_id) {
      showMsg("Added to inventory! 🛍️");
      loadShop();
      loadInventory();
    } else {
      showMsg(data.error || "Error");
    }
  };

  const equipItem = async (itemId: string) => {
    const res  = await fetch(`${API}/shop/equip/${itemId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.item_id) {
      showMsg("Equipped! ✨");
      loadShop();
      loadInventory();
    } else {
      showMsg(data.error || "Error");
    }
  };

  const unequipItem = async (slot: string) => {
    const res  = await fetch(`${API}/shop/unequip/${slot}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.slot) {
      showMsg("Unequipped");
      loadShop();
      loadInventory();
    } else {
      showMsg(data.error || "Error");
    }
  };

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3500);
  };

  const ITEM_EMOJI: Record<string, string> = {
    glasses: "🕶️",
    monocle: "🧐",
    hat:     "🎩",
    crown:   "👑",
    scarf:   "🧣",
  };

  const s: Record<string, any> = {
    page:       { minHeight: "100vh", background: "#f5f5f0", maxWidth: 390, margin: "0 auto", fontFamily: "'Inter', sans-serif", paddingBottom: 100 },
    header:     { padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    logo:       { fontWeight: 700, fontSize: 16, color: "#1a1a2e" },
    badges:     { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" as const },
    levelBadge: { padding: "5px 10px", background: "#3b5bdb", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700 },
    xpBadge:    { padding: "5px 10px", background: "#1a1a2e", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700 },
    coinBadge:  { padding: "5px 10px", background: "#c9a84c", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700 },
    boxBadge:   { padding: "5px 10px", background: "#9333ea", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700 },
    tabs: { display: "flex", margin: "0 24px 20px", background: "white", borderRadius: 14, padding: 4, gap: 4 },
    tab: (active: boolean): React.CSSProperties => ({
      flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
      background: active ? "#1a1a2e" : "transparent",
      color: active ? "white" : "#999",
      fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif",
    }),
    card: (highlight: boolean): React.CSSProperties => ({
      background: "white", borderRadius: 20, padding: "20px", margin: "0 24px 14px",
      border: highlight ? "2px solid #c9a84c" : "2px solid transparent",
    }),
    questTitle: { margin: "0 0 3px", fontSize: 16, fontWeight: 700, color: "#1a1a2e" },
    questDesc:  { margin: "0 0 10px", fontSize: 13, color: "#999" },
    rewardRow:  { display: "flex", gap: 8, marginBottom: 12 },
    xpChip:    { display: "inline-block", padding: "4px 10px", background: "#f0f4ff", borderRadius: 20, fontSize: 12, color: "#3b5bdb", fontWeight: 600 },
    coinChip:  { display: "inline-block", padding: "4px 10px", background: "#fff8e7", borderRadius: 20, fontSize: 12, color: "#c9a84c", fontWeight: 600 },
    progressBarBg: { height: 6, borderRadius: 3, background: "#f0f0ea", margin: "0 0 6px" },
    progressLabel: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#999", marginBottom: 12 },
    claimBtn:  { padding: "10px 20px", borderRadius: 10, border: "none", background: "#1a1a2e", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" },
    lockedBtn: { padding: "10px 20px", borderRadius: 10, border: "none", background: "#f0f0ea", color: "#bbb", fontSize: 13, fontWeight: 600, cursor: "default" },
    itemCard:  { background: "white", borderRadius: 20, padding: "16px", textAlign: "center" as const },
    itemEmoji: { fontSize: 36, marginBottom: 6, display: "block" },
    itemName:  { margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#1a1a2e" },
    itemCost:  { margin: "0 0 10px", fontSize: 12, color: "#c9a84c", fontWeight: 600 },
    equipBadge:{ display: "inline-block", padding: "2px 8px", background: "#e8f5e9", borderRadius: 20, fontSize: 11, color: "#4caf50", fontWeight: 600, marginBottom: 8 },
    buyBtn:    { width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "#1a1a2e", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" },
    ownedBtn:  { width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "#e8f0fe", color: "#3b5bdb", fontSize: 13, fontWeight: 600, cursor: "pointer" },
    unequipBtn:{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "#f0f0ea", color: "#999", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 6 },
    toast:     { position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#1a1a2e", color: "white", borderRadius: 14, padding: "12px 20px", fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap" as const, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", maxWidth: "90vw", overflow: "hidden" },
    navBar:    { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: "white", display: "flex", justifyContent: "space-around", padding: "10px 0 26px", borderTop: "1px solid #efefec", boxShadow: "0 -4px 16px rgba(0,0,0,0.05)" },
    navItem: (active: boolean): React.CSSProperties => ({
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 4, fontSize: 10, color: active ? "#1a1a2e" : "#bbb",
      fontWeight: active ? 700 : 400, cursor: "pointer",
      border: "none", background: "none", fontFamily: "'Inter', sans-serif",
    }),
  };

  return (
    <div style={s.page}>

      {msg && <div style={s.toast}>{msg}</div>}

      {/* HEADER */}
      <div style={s.header}>
        <span style={s.logo}>MoneyQuest</span>
        <div style={s.badges}>
          <span style={s.levelBadge}>Lv.{level}</span>
          <span style={s.xpBadge}>⭐ {xp}</span>
          <span style={s.coinBadge}>🪙 {coins}</span>
          {lootboxes > 0 && <span style={s.boxBadge}>📦 {lootboxes}</span>}
        </div>
      </div>

      {/* TABS */}
      <div style={s.tabs}>
        <button style={s.tab(tab === "quests")}    onClick={() => setTab("quests")}>🏆 Quests</button>
        <button style={s.tab(tab === "shop")}      onClick={() => setTab("shop")}>🛒 Shop</button>
        <button style={s.tab(tab === "inventory")} onClick={() => setTab("inventory")}>🎒 Items</button>
      </div>

      {/* ── QUESTS TAB ── */}
      {tab === "quests" && (
        <>
          {quests.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 24px", color: "#999", fontSize: 14 }}>
              All quests completed! 🎉
            </div>
          )}
          {quests.map((q) => {
            const pct       = Math.min((q.progress / q.goal) * 100, 100);
            const highlight = pct >= 80 || q.claimable;
            return (
              <div key={q.id} style={s.card(highlight)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <p style={s.questTitle}>{q.title}</p>
                    <p style={s.questDesc}>{q.description}</p>
                    <div style={s.rewardRow}>
                      <span style={s.xpChip}>+{q.xp_reward} XP</span>
                      <span style={s.coinChip}>+{q.coin_reward} 🪙</span>
                      <span style={{ display: "inline-block", padding: "4px 10px", background: "#f3e8ff", borderRadius: 20, fontSize: 12, color: "#9333ea", fontWeight: 600 }}>+1 📦</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 28, marginLeft: 12 }}>{q.claimable ? "🎁" : "🔒"}</span>
                </div>

                <div style={s.progressBarBg}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, transition: "width 0.3s",
                    background: q.claimable ? "#4caf50" : pct >= 80 ? "#c9a84c" : "#1a1a2e" }} />
                </div>
                <div style={s.progressLabel}>
                  <span>{q.progress} / {q.goal}</span>
                  <span>{q.remaining > 0 ? `${q.remaining} left` : "Ready!"}</span>
                </div>

                {q.claimable ? (
                  <button style={s.claimBtn} onClick={() => claimQuest(q.id)}>
                    Claim +{q.xp_reward} XP +{q.coin_reward} 🪙 +1 📦
                  </button>
                ) : (
                  <button style={s.lockedBtn} disabled>
                    {q.progress === 0 ? "Not started" : "In progress..."}
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ── SHOP TAB ── */}
      {tab === "shop" && (
        <>
          <div style={{ margin: "0 24px 16px", padding: "14px 20px", background: "white", borderRadius: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#999" }}>Your balance</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>🪙 {coins} coins</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "0 24px" }}>
            {items.map((item) => (
              <div key={item.id} style={s.itemCard}>
                <span style={s.itemEmoji}>{ITEM_EMOJI[item.id] || "🎁"}</span>
                <p style={s.itemName}>{item.name}</p>
                <p style={s.itemCost}>🪙 {item.cost}</p>
                {item.equipped && <span style={s.equipBadge}>✓ Equipped</span>}
                {item.owned ? (
                  <button style={s.ownedBtn} onClick={() => equipItem(item.id)}>
                    {item.equipped ? "Re-equip" : "Equip"}
                  </button>
                ) : (
                  <button
                    style={{ ...s.buyBtn, background: coins >= item.cost ? "#1a1a2e" : "#e8e8e0", color: coins >= item.cost ? "white" : "#999", cursor: coins >= item.cost ? "pointer" : "default" }}
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

      {/* ── INVENTORY TAB ── */}
      {tab === "inventory" && (
        <>
          {inventory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 24px", color: "#999", fontSize: 14 }}>
              No items yet. Buy something from the shop! 🛒
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "0 24px" }}>
              {inventory.map((item) => (
                <div key={item.id} style={s.itemCard}>
                  <span style={s.itemEmoji}>{ITEM_EMOJI[item.id] || "🎁"}</span>
                  <p style={s.itemName}>{item.name}</p>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#999", textTransform: "uppercase" as const }}>{item.type}</p>
                  {item.equipped && <span style={s.equipBadge}>✓ Equipped</span>}
                  {item.equipped ? (
                    <button style={s.unequipBtn} onClick={() => unequipItem(item.type)}>
                      Unequip
                    </button>
                  ) : (
                    <button style={s.ownedBtn} onClick={() => equipItem(item.id)}>
                      Equip
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* BOTTOM NAV */}
      <div style={s.navBar}>
        <button style={s.navItem(false)} onClick={() => navigate("/home")}><span style={{ fontSize: 20 }}>🏠</span>HOME</button>
        <button style={s.navItem(true)}><span style={{ fontSize: 20 }}>🏆</span>QUESTS<span style={{ width: 4, height: 4, borderRadius: "50%", background: "#1a1a2e", display: "block", margin: "1px auto 0" }} /></button>
        <button style={s.navItem(false)} onClick={() => navigate("/stats")}><span style={{ fontSize: 20 }}>📊</span>STATS</button>
        <button style={s.navItem(false)} onClick={() => navigate("/profile")}><span style={{ fontSize: 20 }}>👤</span>PROFILE</button>
      </div>

    </div>
  );
}

export default Achievements;
