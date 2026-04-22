import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import baseballCap    from "../assets/items/baseball_cap.png";
import beanie         from "../assets/items/beanie.png";
import santaHat       from "../assets/items/santa_hat.png";
import wizardHat      from "../assets/items/wizard_hat.png";
import crownImg       from "../assets/items/crown.png";
import glassesBasic   from "../assets/items/glasses_basic.png";
import sunglassesImg  from "../assets/items/sunglasses.png";
import pixelGlasses   from "../assets/items/pixel_glasses.png";
import diamondGlasses from "../assets/items/diamond_glasses.png";
import hoodie         from "../assets/items/hoodie.png";
import suit           from "../assets/items/suit.png";
import royalRobe      from "../assets/items/royal_robe.png";

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

const ITEM_IMAGE: Record<string, string> = {
  hat:             baseballCap,
  beanie:          beanie,
  santa_hat:       santaHat,
  wizard_hat:      wizardHat,
  crown:           crownImg,
  glasses:         glassesBasic,
  sunglasses:      sunglassesImg,
  monocle:         pixelGlasses,
  pixel_glasses:   pixelGlasses,
  diamond_glasses: diamondGlasses,
  hoodie:          hoodie,
  suit:            suit,
  royal_robe:      royalRobe,
};

const ITEM_RARITY: Record<string, React.CSSProperties> = {
  crown:           { boxShadow: "0 0 14px rgba(201,168,76,0.55)", border: "1.5px solid rgba(201,168,76,0.45)" },
  diamond_glasses: { boxShadow: "0 0 14px rgba(201,168,76,0.55)", border: "1.5px solid rgba(201,168,76,0.45)" },
  royal_robe:      { boxShadow: "0 0 14px rgba(201,168,76,0.55)", border: "1.5px solid rgba(201,168,76,0.45)" },
  wizard_hat:      { boxShadow: "0 0 8px rgba(147,51,234,0.35)",  border: "1.5px solid rgba(147,51,234,0.3)"  },
  suit:            { boxShadow: "0 0 8px rgba(59,91,219,0.3)",    border: "1.5px solid rgba(59,91,219,0.25)"  },
  hoodie:          { boxShadow: "0 0 8px rgba(59,91,219,0.3)",    border: "1.5px solid rgba(59,91,219,0.25)"  },
};

function Achievements() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const [xp, setXp]               = useState(0);
  const [level, setLevel]         = useState(1);
  const [coins, setCoins]         = useState(0);
  const [lootboxes, setLootboxes] = useState(0);
  const [quests, setQuests]       = useState<Quest[]>([]);
  const [items, setItems]         = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<ShopItem[]>([]);
  const [tab, setTab]             = useState<"quests" | "shop" | "inventory">("quests");
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    loadAll();
  }, []);

  const loadAll = () => { loadQuests(); loadShop(); loadProfile(); loadInventory(); loadLootboxes(); };

  const loadQuests    = async () => { const r = await fetch(`${API}/quests`,    { headers: { Authorization: `Bearer ${token}` } }); setQuests(await r.json()); };
  const loadInventory = async () => { const r = await fetch(`${API}/inventory`, { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); setInventory(d.inventory || []); };
  const loadLootboxes = async () => { const r = await fetch(`${API}/lootbox`,   { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); setLootboxes(d.lootboxes || 0); };
  const loadShop      = async () => { const r = await fetch(`${API}/shop`,      { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); setCoins(d.coins || 0); setItems(d.items || []); };
  const loadProfile   = async () => { const r = await fetch(`${API}/profile`,   { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); setXp(d.user?.xp || 0); setLevel(d.user?.level || 1); };

  const claimQuest = async (id: string) => {
    const r = await fetch(`${API}/quests/${id}/claim`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.xp_reward !== undefined) {
      const lv  = d.level_up        ? `  ⬆️ Level ${d.level_up}!`  : "";
      const lb  = d.lootbox_granted ? "  📦 +1 Lootbox!" : "";
      showMsg(`+${d.xp_reward} XP  +${d.coin_reward} 🪙 claimed!${lv}${lb} 🎉`);
      loadAll();
    } else {
      showMsg(d.error || "Error");
    }
  };

  const buyItem = async (id: string) => {
    const r = await fetch(`${API}/shop/buy/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.item_id) { showMsg("Added to inventory! 🛍️"); loadShop(); loadInventory(); }
    else showMsg(d.error || "Error");
  };

  const equipItem = async (id: string) => {
    const r = await fetch(`${API}/shop/equip/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.item_id) { showMsg("Equipped! ✨"); loadShop(); loadInventory(); }
    else showMsg(d.error || "Error");
  };

  const unequipItem = async (slot: string) => {
    const r = await fetch(`${API}/shop/unequip/${slot}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.slot) { showMsg("Unequipped"); loadShop(); loadInventory(); }
    else showMsg(d.error || "Error");
  };

  const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(""), 3500); };

  const NAV_ITEMS = [
    { icon: "🏠", label: "HOME",    path: "/home",         active: false },
    { icon: "🏆", label: "QUESTS",  path: "/achievements", active: true  },
    { icon: "📊", label: "STATS",   path: "/stats",        active: false },
    { icon: "👤", label: "PROFILE", path: "/profile",      active: false },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes ach-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ach-page { animation: ach-in 0.35s ease both; font-family: 'Plus Jakarta Sans','Inter',sans-serif; }

        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.92); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        .ach-toast { animation: toast-in 0.3s cubic-bezier(0.34,1.3,0.64,1) both; }

        /* Quest cards */
        .quest-card {
          background: white;
          border-radius: 22px;
          padding: 20px;
          margin: 0 16px 12px;
          border: 2px solid transparent;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.22s ease;
        }
        .quest-card.highlight {
          border-color: #c9a84c;
          box-shadow: 0 4px 20px rgba(201,168,76,0.18);
        }
        .quest-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.1);
        }

        /* Progress fill animation */
        @keyframes prog-fill {
          from { width: 0 !important; }
        }
        .prog-bar {
          animation: prog-fill 0.8s cubic-bezier(0.22,1,0.36,1) both 0.2s;
        }

        /* Shop/inventory item cards */
        .item-card {
          background: white;
          border-radius: 20px;
          padding: 18px 14px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .item-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 22px rgba(0,0,0,0.1);
        }

        /* Buttons */
        .btn-primary {
          padding: 11px 20px; border-radius: 12px; border: none;
          background: #11112a; color: white; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: transform 0.13s cubic-bezier(0.34,1.5,0.64,1), opacity 0.13s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-primary:active { transform: scale(0.94); opacity: 0.8; }
        .btn-secondary {
          padding: 11px 20px; border-radius: 12px; border: none;
          background: #f0f0ea; color: #aaa; font-size: 13px; font-weight: 600;
          cursor: default; font-family: inherit;
        }
        .btn-shop {
          width: 100%; padding: 11px 0; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
          transition: transform 0.13s cubic-bezier(0.34,1.5,0.64,1), opacity 0.13s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-shop:active { transform: scale(0.95); opacity: 0.8; }

        /* Nav */
        .nav-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 3px; font-size: 10px; border: none; background: none;
          font-family: inherit; cursor: pointer; padding: 0; position: relative;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.15s ease, color 0.2s;
        }
        .nav-btn:active { transform: scale(0.84); }
        .nav-icon { font-size: 20px; transition: transform 0.2s cubic-bezier(0.34,1.5,0.64,1); display: block; }
        .nav-btn:hover .nav-icon { transform: translateY(-3px); }
        .nav-btn.active .nav-icon { transform: scale(1.12); }
        .nav-pip {
          position: absolute; top: -7px; left: 50%; transform: translateX(-50%);
          width: 28px; height: 3px; background: #11112a; border-radius: 0 0 4px 4px;
        }
      `}</style>

      <div className="ach-page" style={{ minHeight: "100vh", background: "#efefea", maxWidth: 390, margin: "0 auto", paddingBottom: 100 }}>

        {msg && (
          <div className="ach-toast" style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "#11112a", color: "white", borderRadius: 20, padding: "13px 22px", fontSize: 13, fontWeight: 700, zIndex: 200, whiteSpace: "nowrap", boxShadow: "0 8px 28px rgba(0,0,0,0.3)", maxWidth: "92vw", overflow: "hidden", textOverflow: "ellipsis" }}>
            {msg}
          </div>
        )}

        {/* HEADER */}
        <div style={{ padding: "24px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#11112a", letterSpacing: "-0.4px" }}>MoneyQuest</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" as const }}>
            <span style={{ padding: "5px 10px", background: "#3b5bdb", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>Lv.{level}</span>
            <span style={{ padding: "5px 10px", background: "#11112a", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>⭐ {xp}</span>
            <span style={{ padding: "5px 10px", background: "#c9a84c", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>🪙 {coins}</span>
            {lootboxes > 0 && <span style={{ padding: "5px 10px", background: "#9333ea", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>📦 {lootboxes}</span>}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", margin: "0 16px 18px", background: "white", borderRadius: 16, padding: 4, gap: 4, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          {(["quests", "shop", "inventory"] as const).map(t => (
            <button
              key={t}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 12, border: "none",
                background: tab === t ? "#11112a" : "transparent",
                color: tab === t ? "white" : "#aaa",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", transition: "background 0.2s, color 0.2s",
              }}
              onClick={() => setTab(t)}
            >
              {t === "quests" ? "🏆 Quests" : t === "shop" ? "🛒 Shop" : "🎒 Items"}
            </button>
          ))}
        </div>

        {/* ── QUESTS ── */}
        {tab === "quests" && (
          <>
            {quests.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#bbb", fontSize: 14, fontWeight: 500 }}>
                All quests completed! 🎉
              </div>
            )}
            {quests.map(q => {
              const pct = Math.min((q.progress / q.goal) * 100, 100);
              return (
                <div key={q.id} className={`quest-card ${pct >= 80 || q.claimable ? "highlight" : ""}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 800, color: "#11112a", letterSpacing: "-0.3px" }}>{q.title}</p>
                      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#999", fontWeight: 500 }}>{q.description}</p>
                      <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" as const }}>
                        <span style={{ padding: "4px 10px", background: "#eff3ff", borderRadius: 20, fontSize: 12, color: "#3b5bdb", fontWeight: 700 }}>+{q.xp_reward} XP</span>
                        <span style={{ padding: "4px 10px", background: "#fff8e7", borderRadius: 20, fontSize: 12, color: "#c9a84c", fontWeight: 700 }}>+{q.coin_reward} 🪙</span>
                        <span style={{ padding: "4px 10px", background: "#f3e8ff", borderRadius: 20, fontSize: 12, color: "#9333ea", fontWeight: 700 }}>+1 📦</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 30, marginLeft: 10 }}>{q.claimable ? "🎁" : "🔒"}</span>
                  </div>

                  <div style={{ height: 7, borderRadius: 4, background: "#f0f0ea", marginBottom: 8, overflow: "hidden" }}>
                    <div
                      className="prog-bar"
                      style={{
                        height: "100%", borderRadius: 4,
                        width: `${pct}%`,
                        background: q.claimable ? "#4caf50" : pct >= 80 ? "#c9a84c" : "#11112a",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#bbb", fontWeight: 600, marginBottom: 14 }}>
                    <span>{q.progress} / {q.goal}</span>
                    <span>{q.remaining > 0 ? `${q.remaining} to go` : "Ready to claim!"}</span>
                  </div>

                  {q.claimable ? (
                    <button className="btn-primary" style={{ width: "100%", padding: 14, borderRadius: 14, fontSize: 14 }} onClick={() => claimQuest(q.id)}>
                      Claim Reward 🎉
                    </button>
                  ) : (
                    <button className="btn-secondary" style={{ width: "100%", padding: 14, borderRadius: 14, fontSize: 14 }} disabled>
                      {q.progress === 0 ? "Not started" : "In progress…"}
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── SHOP ── */}
        {tab === "shop" && (
          <>
            <div style={{ margin: "0 16px 16px", padding: "16px 20px", background: "white", borderRadius: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Your Balance</p>
              <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 900, color: "#11112a", letterSpacing: "-0.5px" }}>🪙 {coins} coins</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "0 16px" }}>
              {items.map(item => (
                <div key={item.id} className="item-card" style={ITEM_RARITY[item.id] ?? {}}>
                  <div style={{
                    width: 64, height: 64, margin: "0 auto 8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 16, background: "#f5f5f0",
                    ...(ITEM_RARITY[item.id] ?? {}),
                  }}>
                    {ITEM_IMAGE[item.id]
                      ? <img src={ITEM_IMAGE[item.id]} alt={item.name} style={{ width: 44, height: 44, objectFit: "contain" }} />
                      : <span style={{ fontSize: 32 }}>🎁</span>
                    }
                  </div>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 800, color: "#11112a" }}>{item.name}</p>
                  <p style={{ margin: "0 0 10px", fontSize: 12, color: "#c9a84c", fontWeight: 700 }}>🪙 {item.cost}</p>
                  {item.equipped && (
                    <span style={{ display: "inline-block", padding: "3px 10px", background: "#e8f5e9", borderRadius: 20, fontSize: 11, color: "#2e7d32", fontWeight: 700, marginBottom: 8 }}>
                      ✓ On
                    </span>
                  )}
                  {item.owned ? (
                    <button className="btn-shop" style={{ background: "#eff3ff", color: "#3b5bdb" }} onClick={() => equipItem(item.id)}>
                      {item.equipped ? "Re-equip" : "Equip"}
                    </button>
                  ) : (
                    <button
                      className="btn-shop"
                      style={{ background: coins >= item.cost ? "#11112a" : "#eaeae4", color: coins >= item.cost ? "white" : "#aaa", cursor: coins >= item.cost ? "pointer" : "default" }}
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

        {/* ── INVENTORY ── */}
        {tab === "inventory" && (
          <>
            {inventory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "#bbb", fontSize: 14, fontWeight: 500 }}>
                Nothing here yet. Visit the Shop! 🛒
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "0 16px" }}>
                {inventory.map(item => (
                  <div key={item.id} className="item-card" style={ITEM_RARITY[item.id] ?? {}}>
                    <div style={{
                      width: 64, height: 64, margin: "0 auto 8px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 16, background: "#f5f5f0",
                      ...(ITEM_RARITY[item.id] ?? {}),
                    }}>
                      {ITEM_IMAGE[item.id]
                        ? <img src={ITEM_IMAGE[item.id]} alt={item.name} style={{ width: 44, height: 44, objectFit: "contain" }} />
                        : <span style={{ fontSize: 32 }}>🎁</span>
                      }
                    </div>
                    <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 800, color: "#11112a" }}>{item.name}</p>
                    <p style={{ margin: "0 0 10px", fontSize: 11, color: "#aaa", textTransform: "uppercase" as const, fontWeight: 600, letterSpacing: "0.5px" }}>{item.type}</p>
                    {item.equipped && (
                      <span style={{ display: "inline-block", padding: "3px 10px", background: "#e8f5e9", borderRadius: 20, fontSize: 11, color: "#2e7d32", fontWeight: 700, marginBottom: 8 }}>
                        ✓ Equipped
                      </span>
                    )}
                    {item.equipped ? (
                      <button className="btn-shop" style={{ background: "#f0f0ea", color: "#aaa" }} onClick={() => unequipItem(item.type)}>Unequip</button>
                    ) : (
                      <button className="btn-shop" style={{ background: "#eff3ff", color: "#3b5bdb", cursor: "pointer" }} onClick={() => equipItem(item.id)}>Equip</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* BOTTOM NAV */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: "white", display: "flex", justifyContent: "space-around", padding: "12px 0 28px", borderTop: "1px solid #eaeae4", boxShadow: "0 -6px 24px rgba(0,0,0,0.06)" }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.label}
              className={`nav-btn ${item.active ? "active" : ""}`}
              style={{ color: item.active ? "#11112a" : "#bbb", fontWeight: item.active ? 800 : 500, letterSpacing: "0.3px" }}
              onClick={() => !item.active && navigate(item.path)}
            >
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

export default Achievements;

//dd