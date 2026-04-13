// src/components/LootboxModal.tsx
// Full lootbox opening experience with animations and rarity effects

import { useState } from "react";

const API = "https://moneyquest-pcoq.onrender.com";

type Rarity = "common" | "rare" | "epic";

type Reward = {
  type: "xp" | "coins" | "item";
  rarity: Rarity;
  amount?: number;
  itemId?: string;
  itemName?: string;
  label: string;
  emoji: string;
};

const RARITY_STYLE: Record<Rarity, { color: string; glow: string; bg: string; label: string }> = {
  common: {
    color: "#6b7280",
    glow:  "0 0 30px rgba(107,114,128,0.5)",
    bg:    "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    label: "COMMON",
  },
  rare: {
    color: "#3b5bdb",
    glow:  "0 0 40px rgba(59,91,219,0.7), 0 0 80px rgba(59,91,219,0.3)",
    bg:    "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
    label: "RARE",
  },
  epic: {
    color: "#9333ea",
    glow:  "0 0 50px rgba(147,51,234,0.8), 0 0 100px rgba(147,51,234,0.4)",
    bg:    "linear-gradient(135deg, #f3e8ff, #e9d5ff)",
    label: "EPIC",
  },
};

const ITEM_EMOJI: Record<string, string> = {
  glasses: "🕶️",
  monocle: "🧐",
  hat:     "🎩",
  crown:   "👑",
  scarf:   "🧣",
};

type Phase = "idle" | "shaking" | "opening" | "reveal";

interface Props {
  lootboxCount: number;
  onClose: () => void;
  onOpened: (reward: Reward, remaining: number) => void;
}

export function LootboxModal({ lootboxCount, onClose, onOpened }: Props) {
  const token = localStorage.getItem("token");
  const [phase, setPhase]     = useState<Phase>("idle");
  const [reward, setReward]   = useState<Reward | null>(null);
  const [remaining, setRemaining] = useState(lootboxCount);
  const [error, setError]     = useState("");

  const openLootbox = async () => {
    if (phase !== "idle" || remaining <= 0) return;

    setPhase("shaking");

    // Shake for 600ms then open
    setTimeout(async () => {
      setPhase("opening");

      try {
        const res = await fetch(`${API}/lootbox/open`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to open");
          setPhase("idle");
          return;
        }

        // Brief pause then reveal
        setTimeout(() => {
          setReward(data.reward);
          setRemaining(data.lootboxes_remaining);
          setPhase("reveal");
          onOpened(data.reward, data.lootboxes_remaining);
        }, 400);

      } catch {
        setError("Network error");
        setPhase("idle");
      }
    }, 700);
  };

  const handleOpenAnother = () => {
    setPhase("idle");
    setReward(null);
    setError("");
  };

  const rarityStyle = reward ? RARITY_STYLE[reward.rarity] : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={phase === "reveal" || phase === "idle" ? onClose : undefined}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div onClick={(e) => e.stopPropagation()} style={{
          width: 340,
          background: "white",
          borderRadius: 28,
          padding: "32px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* ── IDLE / SHAKING / OPENING phase ── */}
          {phase !== "reveal" && (
            <>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>
                Lootbox
              </p>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>
                Open Lootbox
              </h2>
              <p style={{ margin: "0 0 32px", fontSize: 13, color: "#999" }}>
                {remaining} remaining
              </p>

              {/* Box animation */}
              <div style={{
                fontSize: 80,
                marginBottom: 32,
                display: "inline-block",
                animation: phase === "shaking" ? "shake 0.1s infinite" : "none",
                transform: phase === "opening" ? "scale(1.3)" : "scale(1)",
                opacity: phase === "opening" ? 0 : 1,
                transition: "transform 0.3s ease, opacity 0.3s ease",
                filter: phase === "shaking"
                  ? "drop-shadow(0 0 20px rgba(201,168,76,0.8))"
                  : "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
              }}>
                📦
              </div>

              {error && (
                <p style={{ color: "#e53935", fontSize: 13, marginBottom: 16 }}>{error}</p>
              )}

              <button
                onClick={openLootbox}
                disabled={phase !== "idle" || remaining <= 0}
                style={{
                  width: "100%", padding: 16, borderRadius: 14,
                  border: "none",
                  background: remaining > 0 && phase === "idle"
                    ? "linear-gradient(135deg, #1a1a2e, #3b5bdb)"
                    : "#e8e8e0",
                  color: remaining > 0 && phase === "idle" ? "white" : "#999",
                  fontSize: 16, fontWeight: 700, cursor: remaining > 0 && phase === "idle" ? "pointer" : "default",
                  transition: "all 0.2s",
                  boxShadow: remaining > 0 && phase === "idle" ? "0 4px 20px rgba(59,91,219,0.3)" : "none",
                }}
              >
                {phase === "shaking" ? "✨ Opening..." : phase === "opening" ? "🎉 Revealing..." : "Open!"}
              </button>

              <button
                onClick={onClose}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "none", color: "#999", fontSize: 14, cursor: "pointer", marginTop: 8 }}
              >
                Close
              </button>
            </>
          )}

          {/* ── REVEAL phase ── */}
          {phase === "reveal" && reward && rarityStyle && (
            <>
              {/* Rarity glow background burst */}
              <div style={{
                position: "absolute", inset: 0,
                background: rarityStyle.bg,
                opacity: 0.6,
                borderRadius: 28,
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Rarity badge */}
                <div style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: 20,
                  background: rarityStyle.color,
                  color: "white",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 2,
                  marginBottom: 20,
                  boxShadow: rarityStyle.glow,
                }}>
                  {RARITY_STYLE[reward.rarity].label}
                </div>

                {/* Reward icon */}
                <div style={{
                  fontSize: 72,
                  marginBottom: 16,
                  display: "block",
                  filter: `drop-shadow(${rarityStyle.glow.split(",")[0].replace("0 0 ", "0px 0px ").trim()})`,
                  animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}>
                  {reward.type === "item"
                    ? (ITEM_EMOJI[reward.itemId || ""] || "🎁")
                    : reward.emoji}
                </div>

                {/* Reward label */}
                <h2 style={{
                  margin: "0 0 6px",
                  fontSize: 26,
                  fontWeight: 800,
                  color: rarityStyle.color,
                }}>
                  {reward.label}
                </h2>

                <p style={{ margin: "0 0 28px", fontSize: 13, color: "#999" }}>
                  {reward.type === "xp"    && "Added to your XP"}
                  {reward.type === "coins" && "Added to your wallet"}
                  {reward.type === "item"  && "Added to your inventory"}
                </p>

                {/* Buttons */}
                {remaining > 0 ? (
                  <button
                    onClick={handleOpenAnother}
                    style={{
                      width: "100%", padding: 16, borderRadius: 14, border: "none",
                      background: "linear-gradient(135deg, #1a1a2e, #3b5bdb)",
                      color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer",
                      boxShadow: "0 4px 20px rgba(59,91,219,0.3)",
                      marginBottom: 8,
                    }}
                  >
                    Open Another ({remaining} left)
                  </button>
                ) : null}

                <button
                  onClick={onClose}
                  style={{
                    width: "100%", padding: 14, borderRadius: 14, border: "none",
                    background: "#f5f5f0", color: "#1a1a2e",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {remaining > 0 ? "Close" : "Close"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes shake {
          0%   { transform: translateX(0) rotate(0deg); }
          25%  { transform: translateX(-6px) rotate(-3deg); }
          50%  { transform: translateX(6px) rotate(3deg); }
          75%  { transform: translateX(-4px) rotate(-2deg); }
          100% { transform: translateX(0) rotate(0deg); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.3); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}


//dwЫ