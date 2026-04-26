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
  brown:  { fur: "#8B7355", inner: "#C4956A" },
  white:  { fur: "#E8E8E8", inner: "#F5F5F5" },
  black:  { fur: "#2D2D2D", inner: "#4B4B4B" },
  orange: { fur: "#C2703A", inner: "#E8967A" },
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
  fur, inner, equippedHat, equippedGlasses, equippedOutfit, onClick, mood = "idle",
}: {
  fur: string; inner: string;
  equippedHat?: string | null;
  equippedGlasses?: string | null;
  equippedOutfit?: string | null;
  onClick?: () => void;
  mood?: BearMood;
}) {
  const [blink, setBlink] = useState(false);
  const [happy, setHappy] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); schedule(); }, 170);
      }, 3200 + Math.random() * 2800);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    setHappy(true);
    setTimeout(() => setHappy(false), 900);
    onClick?.();
  };

  const eyeRy = blink ? 1 : 5;
  const mouthPath = happy || mood === "happy" || mood === "excited" || mood === "proud"
    ? "M84 126 Q100 140 116 126"
    : mood === "sad"
    ? "M88 132 Q100 124 112 132"
    : "M88 126 Q100 134 112 126";

  return (
    <svg
      width="90" height="105"
      viewBox="0 0 200 230"
      onClick={handleClick}
      className={`bear-idle ${mood !== "idle" ? `bear--${mood}` : ""}`}
      style={{
        cursor: "pointer",
        filter: happy || mood === "excited" ? "drop-shadow(0 0 14px rgba(201,168,76,0.9))" : mood === "proud" ? "drop-shadow(0 0 10px rgba(59,91,219,0.7))" : "none",
        transition: "filter 0.3s ease",
      }}
    >
      {/* ── OUTFIT (renders behind body) ── */}
      {equippedOutfit === "hoodie" && (
        <g>
          <ellipse cx="100" cy="62" rx="46" ry="38" fill="#4A6ED4" opacity="0.95" />
          <ellipse cx="100" cy="58" rx="38" ry="30" fill="#5B7DD8" />
          <rect x="10" y="148" width="180" height="90" rx="28" fill="#5B7DD8" />
          <ellipse cx="22"  cy="168" rx="28" ry="22" fill="#5B7DD8" />
          <ellipse cx="178" cy="168" rx="28" ry="22" fill="#5B7DD8" />
          <path d="M10 162 Q-18 190 -8 228" fill="none" stroke="#5B7DD8" strokeWidth="38" strokeLinecap="round" />
          <path d="M190 162 Q218 190 208 228" fill="none" stroke="#5B7DD8" strokeWidth="38" strokeLinecap="round" />
          <ellipse cx="-8"  cy="228" rx="19" ry="10" fill="#4A6BC7" />
          <ellipse cx="208" cy="228" rx="19" ry="10" fill="#4A6BC7" />
          <rect x="10" y="185" width="180" height="53" rx="18" fill="#4A6BC7" opacity="0.5" />
          <line x1="100" y1="150" x2="100" y2="238" stroke="#4060B8" strokeWidth="2" opacity="0.6" />
          <rect x="68" y="195" width="64" height="36" rx="14" fill="#4A6BC7" />
          <rect x="72" y="199" width="56" height="28" rx="11" fill="#4560C0" />
          <ellipse cx="100" cy="72" rx="28" ry="22" fill="#4A6BC7" opacity="0.4" />
          <path d="M78 94 Q88 100 100 97 Q112 100 122 94" fill="none" stroke="#3A5AB0" strokeWidth="2" strokeLinecap="round" />
          <circle cx="78"  cy="94" r="3" fill="#3A5AB0" />
          <circle cx="122" cy="94" r="3" fill="#3A5AB0" />
        </g>
      )}
      {equippedOutfit === "suit" && (
        <g>
          <rect x="14" y="148" width="172" height="90" rx="22" fill="#1E1E38" />
          <ellipse cx="20"  cy="162" rx="26" ry="16" fill="#252545" />
          <ellipse cx="180" cy="162" rx="26" ry="16" fill="#252545" />
          <path d="M14 158 Q-14 188 -4 230" fill="none" stroke="#1E1E38" strokeWidth="36" strokeLinecap="round" />
          <path d="M186 158 Q214 188 204 230" fill="none" stroke="#1E1E38" strokeWidth="36" strokeLinecap="round" />
          <ellipse cx="-4"  cy="230" rx="18" ry="9" fill="#F0F0F0" />
          <ellipse cx="204" cy="230" rx="18" ry="9" fill="#F0F0F0" />
          <path d="M14 148 Q14 238 55 238 L55 148 Z" fill="#252548" opacity="0.7" />
          <path d="M186 148 Q186 238 145 238 L145 148 Z" fill="#252548" opacity="0.7" />
          <polygon points="100,150 80,238 120,238" fill="#F5F5F5" />
          <polygon points="100,150 60,150 76,196" fill="#2A2A4A" />
          <polygon points="100,150 140,150 124,196" fill="#2A2A4A" />
          <polygon points="100,150 64,150 72,172" fill="#32325A" opacity="0.8" />
          <polygon points="100,150 136,150 128,172" fill="#32325A" opacity="0.8" />
          <rect x="26" y="168" width="18" height="12" rx="3" fill="#F5F5F5" opacity="0.9" />
          <polygon points="100,152 94,172 100,220 106,172" fill="#C9A84C" />
          <polygon points="94,152 106,152 108,164 92,164" fill="#E8C060" />
          <line x1="100" y1="175" x2="100" y2="215" stroke="#B89040" strokeWidth="1.5" opacity="0.6" />
          <circle cx="100" cy="228" r="3" fill="#2A2A4A" />
          <circle cx="100" cy="214" r="3" fill="#2A2A4A" />
          <circle cx="100" cy="200" r="3" fill="#2A2A4A" />
          <rect x="14" y="232" width="172" height="8" rx="6" fill="#161630" />
        </g>
      )}
      {equippedOutfit === "royal_robe" && (
        <g>
          <ellipse cx="100" cy="155" rx="88" ry="20" fill="#4A0E8F" />
          <path d="M12 155 Q-10 210 8 250 Q50 270 100 268 Q150 270 192 250 Q210 210 188 155 Z" fill="#5B1AAA" />
          <path d="M30 158 Q16 205 28 245 Q60 260 100 258 Q140 260 172 245 Q184 205 170 158 Z" fill="#4A0E8F" opacity="0.6" />
          <rect x="22" y="148" width="156" height="92" rx="24" fill="#6B21A8" />
          <ellipse cx="100" cy="150" rx="76" ry="18" fill="#7C2EC0" />
          <path d="M22 156 Q-16 192 -4 238" fill="none" stroke="#6B21A8" strokeWidth="40" strokeLinecap="round" />
          <path d="M178 156 Q216 192 204 238" fill="none" stroke="#6B21A8" strokeWidth="40" strokeLinecap="round" />
          <ellipse cx="-4"  cy="238" rx="20" ry="10" fill="#C9A84C" />
          <ellipse cx="204" cy="238" rx="20" ry="10" fill="#C9A84C" />
          <ellipse cx="-4"  cy="237" rx="16" ry="6"  fill="#E8C060" opacity="0.6" />
          <ellipse cx="204" cy="237" rx="16" ry="6"  fill="#E8C060" opacity="0.6" />
          <path d="M24 150 Q100 132 176 150" fill="none" stroke="#C9A84C" strokeWidth="5" strokeLinecap="round" />
          <path d="M24 150 Q100 132 176 150" fill="none" stroke="#F0D870" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <rect x="22" y="230" width="156" height="10" rx="5" fill="#C9A84C" />
          <rect x="22" y="231" width="156" height="5"  rx="3" fill="#F0D870" opacity="0.5" />
          <rect x="82" y="150" width="36" height="88" rx="6" fill="#7C2EC0" />
          <rect x="93" y="148" width="14" height="92" rx="4" fill="#C9A84C" />
          <rect x="96" y="148" width="8"  height="92" rx="3" fill="#F0D870" opacity="0.5" />
          <circle cx="100" cy="168" r="6" fill="#E53935" />
          <circle cx="100" cy="168" r="3" fill="#FF6B6B" opacity="0.7" />
          <circle cx="100" cy="190" r="5" fill="#1565C0" />
          <circle cx="100" cy="190" r="2.5" fill="#64B5F6" opacity="0.7" />
          <circle cx="100" cy="210" r="5" fill="#2E7D32" />
          <circle cx="100" cy="210" r="2.5" fill="#81C784" opacity="0.7" />
          <circle cx="56"  cy="172" r="5" fill="#C9A84C" />
          <circle cx="144" cy="172" r="5" fill="#C9A84C" />
          <circle cx="56"  cy="172" r="2.5" fill="#F0D870" opacity="0.7" />
          <circle cx="144" cy="172" r="2.5" fill="#F0D870" opacity="0.7" />
          <line x1="40"  y1="158" x2="40"  y2="235" stroke="#C9A84C" strokeWidth="2" opacity="0.5" />
          <line x1="160" y1="158" x2="160" y2="235" stroke="#C9A84C" strokeWidth="2" opacity="0.5" />
          <path d="M22 150 Q100 138 178 150 Q160 162 100 158 Q40 162 22 150 Z" fill="#F5F5F5" opacity="0.9" />
          <path d="M30 150 Q100 141 170 150 Q155 158 100 155 Q45 158 30 150 Z" fill="#E8E8E8" opacity="0.5" />
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
      <ellipse cx="78"  cy="90"  rx="6"  ry={eyeRy} fill="#3D2B1F" />
      <ellipse cx="122" cy="90"  rx="6"  ry={eyeRy} fill="#3D2B1F" />
      <rect x="68"  y="83" width="20" height="7" rx="4" fill={fur} />
      <rect x="112" y="83" width="20" height="7" rx="4" fill={fur} />
      <path d={mouthPath} fill="none" stroke="#2D1B0E" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="82" y="140" width="36" height="20" fill={fur} />

      {/* ── DEFAULT BODY (only when no outfit) ── */}
      {!equippedOutfit && (
        <g>
          <rect x="30" y="158" width="140" height="72" rx="20" fill="#4A4A6A" />
          <path d="M30 175 Q100 148 170 175" fill="#4A4A6A" />
          <rect x="55" y="195" width="90" height="25" rx="10" fill="#3A3A5A" />
          <path d="M30 170 Q10 205 30 235"   fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
          <path d="M170 170 Q190 205 170 235" fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
        </g>
      )}

      <ellipse cx="22"  cy="232" rx="14" ry="12" fill={fur} />
      <ellipse cx="178" cy="232" rx="14" ry="12" fill={fur} />

      {/* ── HATS ── */}
      {equippedHat === "hat" && (
        <g>
          <rect x="72" y="38" width="56" height="8"  rx="3" fill="#2D1B0E" />
          <rect x="82" y="18" width="36" height="22" rx="5" fill="#2D1B0E" />
        </g>
      )}
      {equippedHat === "baseball_cap" && (
        <g>
          <ellipse cx="100" cy="46" rx="34" ry="14" fill="#E53935" />
          <rect x="66" y="44" width="68" height="8" rx="4" fill="#C62828" />
          <ellipse cx="100" cy="44" rx="34" ry="16" fill="#E53935" />
          <path d="M100 28 Q120 26 126 40" fill="none" stroke="#C62828" strokeWidth="2" />
          <rect x="100" y="36" width="44" height="10" rx="5" fill="#C62828" />
          <rect x="86" y="40" width="28" height="6" rx="3" fill="#EF5350" />
        </g>
      )}
      {equippedHat === "beanie" && (
        <g>
          <ellipse cx="100" cy="50" rx="38" ry="20" fill="#1565C0" />
          <ellipse cx="100" cy="42" rx="36" ry="18" fill="#1976D2" />
          <rect x="64"  y="48" width="72" height="10" rx="5" fill="#1565C0" />
          <rect x="64"  y="54" width="72" height="7"  rx="3" fill="#E3F2FD" />
          <ellipse cx="100" cy="26" rx="10" ry="10" fill="#E3F2FD" />
        </g>
      )}
      {equippedHat === "santa_hat" && (
        <g>
          <polygon points="100,10 68,52 132,52" fill="#D32F2F" />
          <rect x="64" y="48" width="72" height="12" rx="6" fill="#F5F5F5" />
          <ellipse cx="100" cy="12" rx="7" ry="7" fill="#F5F5F5" />
        </g>
      )}
      {equippedHat === "wizard_hat" && (
        <g>
          <polygon points="100,4 68,56 132,56" fill="#4A148C" />
          <rect x="62" y="52" width="76" height="10" rx="5" fill="#7B1FA2" />
          <circle cx="88"  cy="38" r="4" fill="#FFD700" />
          <circle cx="106" cy="24" r="3" fill="#FFD700" />
          <circle cx="114" cy="42" r="3" fill="#CE93D8" />
          <path d="M72 50 Q100 30 128 50" fill="none" stroke="#CE93D8" strokeWidth="1.5" strokeDasharray="4 3" />
        </g>
      )}
      {equippedHat === "crown" && (
        <g>
          <polygon points="76,42 88,22 100,36 112,22 124,42" fill="#FFD700" />
          <rect x="76" y="40" width="48" height="6" rx="2" fill="#FFD700" />
          <circle cx="88"  cy="24" r="3" fill="#E53935" />
          <circle cx="100" cy="38" r="3" fill="#1565C0" />
          <circle cx="112" cy="24" r="3" fill="#43A047" />
        </g>
      )}

      {/* ── GLASSES ── */}
      {equippedGlasses === "glasses" && (
        <g>
          <circle cx="78"  cy="90" r="11" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
          <circle cx="122" cy="90" r="11" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
          <line x1="89" y1="90" x2="111" y2="90" stroke="#1a1a2e" strokeWidth="2" />
          <line x1="56" y1="88" x2="67"  y2="88" stroke="#1a1a2e" strokeWidth="2" />
          <line x1="133" y1="88" x2="144" y2="88" stroke="#1a1a2e" strokeWidth="2" />
        </g>
      )}
      {equippedGlasses === "monocle" && (
        <g>
          <circle cx="122" cy="90" r="13" fill="none" stroke="#8B7355" strokeWidth="2.5" />
          <line x1="122" y1="103" x2="126" y2="114" stroke="#8B7355" strokeWidth="1.5" />
          <line x1="133" y1="88"  x2="144" y2="86"  stroke="#8B7355" strokeWidth="1.5" />
        </g>
      )}
      {equippedGlasses === "sunglasses" && (
        <g>
          <rect x="65" y="83" width="26" height="16" rx="8" fill="#1a1a1a" />
          <rect x="109" y="83" width="26" height="16" rx="8" fill="#1a1a1a" />
          <line x1="91" y1="91" x2="109" y2="91" stroke="#1a1a1a" strokeWidth="2.5" />
          <line x1="54" y1="88" x2="65"  y2="88" stroke="#1a1a1a" strokeWidth="2" />
          <line x1="135" y1="88" x2="146" y2="88" stroke="#1a1a1a" strokeWidth="2" />
          <rect x="66" y="84" width="24" height="6" rx="3" fill="#2D2D2D" opacity="0.5" />
          <rect x="110" y="84" width="24" height="6" rx="3" fill="#2D2D2D" opacity="0.5" />
        </g>
      )}
      {equippedGlasses === "pixel_glasses" && (
        <g>
          <rect x="64" y="83" width="28" height="14" rx="2" fill="none" stroke="#00E676" strokeWidth="2.5" />
          <rect x="108" y="83" width="28" height="14" rx="2" fill="none" stroke="#00E676" strokeWidth="2.5" />
          <line x1="92" y1="90" x2="108" y2="90" stroke="#00E676" strokeWidth="2.5" />
          <line x1="53" y1="88" x2="64"  y2="88" stroke="#00E676" strokeWidth="2" />
          <line x1="136" y1="88" x2="147" y2="88" stroke="#00E676" strokeWidth="2" />
          <rect x="68" y="87" width="4" height="4" fill="#00E676" />
          <rect x="76" y="85" width="4" height="4" fill="#00E676" />
          <rect x="112" y="87" width="4" height="4" fill="#00E676" />
          <rect x="120" y="85" width="4" height="4" fill="#00E676" />
        </g>
      )}
      {equippedGlasses === "diamond_glasses" && (
        <g>
          <polygon points="78,79 91,88 78,99 65,88" fill="rgba(147,210,255,0.55)" stroke="#90CAF9" strokeWidth="2" />
          <polygon points="122,79 135,88 122,99 109,88" fill="rgba(147,210,255,0.55)" stroke="#90CAF9" strokeWidth="2" />
          <line x1="91" y1="88" x2="109" y2="88" stroke="#90CAF9" strokeWidth="2" />
          <line x1="54" y1="86" x2="65"  y2="88" stroke="#90CAF9" strokeWidth="2" />
          <line x1="135" y1="88" x2="146" y2="86" stroke="#90CAF9" strokeWidth="2" />
          <polygon points="78,82 83,88 78,94 73,88" fill="rgba(255,255,255,0.6)" />
          <polygon points="122,82 127,88 122,94 117,88" fill="rgba(255,255,255,0.6)" />
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
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mq-page { animation: mq-page-in 0.4s ease both; }

        @keyframes card-rise {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .s1 { animation: card-rise 0.42s ease both 0.08s; }
        .s2 { animation: card-rise 0.42s ease both 0.16s; }
        .s3 { animation: card-rise 0.42s ease both 0.24s; }
        .s4 { animation: card-rise 0.42s ease both 0.32s; }

        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-18px) scale(0.92); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        .mq-toast { animation: toast-in 0.32s cubic-bezier(0.34,1.3,0.64,1) both; }

        @keyframes sheet-up {
          from { transform: translateY(50px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .mq-sheet { animation: sheet-up 0.32s cubic-bezier(0.34,1.2,0.64,1) both; }
        .mq-overlay { animation: mq-page-in 0.22s ease both; }

        @keyframes breathe {
          0%, 100% { transform: scaleY(1)    translateY(0);    }
          50%       { transform: scaleY(1.03) translateY(-1.5px); }
        }
        .bear-idle {
          transform-origin: 50% 90%;
          animation: breathe 3.4s ease-in-out infinite;
        }

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

        .mq-btn {
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.13s cubic-bezier(0.34,1.6,0.64,1), opacity 0.13s, box-shadow 0.13s;
          cursor: pointer;
        }
        .mq-btn:active { transform: scale(0.93) !important; opacity: 0.82; }

        .mq-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 20px;
          margin: 0 16px 14px;
          box-shadow: 0 2px 14px rgba(0,0,0,0.055), 0 1px 3px rgba(0,0,0,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .mq-hero {
          position: relative;
          overflow: visible;
          margin: 0 16px 14px;
          border-radius: 28px;
          padding: 22px 20px 20px;
          background: linear-gradient(140deg, #11112a 0%, #1d1d43 55%, #282860 100%);
          box-shadow: 0 8px 32px rgba(17,17,42,0.38), 0 2px 6px rgba(0,0,0,0.18);
          clip-path: none;
        }
        .mq-hero::before {
          content: '';
          position: absolute; inset: 0;
          border-radius: 28px;
          background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
        }
        .mq-hero::after {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(201,168,76,0.22) 0%, transparent 70%);
          pointer-events: none;
        }

        .loot-active {
          background: linear-gradient(140deg, #11112a 0%, #282860 100%) !important;
          cursor: pointer;
        }
        .loot-active:hover  { transform: translateY(-3px) !important; box-shadow: 0 14px 36px rgba(17,17,42,0.42) !important; }
        .loot-active:active { transform: scale(0.96) !important; }

        .activity-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 10px; border-radius: 14px; margin: 0 -10px;
          border-bottom: 1px solid #f3f3ee;
          transition: background 0.15s;
        }
        .activity-row:last-child { border-bottom: none; }
        .activity-row:hover { background: #f9f9f5; }

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

        .mq-input:focus {
          border-color: #11112a !important;
          box-shadow: 0 0 0 3px rgba(17,17,42,0.1) !important;
          outline: none;
        }

        @keyframes loot-pulse {
          0%,100% { transform: scale(1) rotate(-3deg); }
          50%      { transform: scale(1.14) rotate(3deg); }
        }

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

        @keyframes savings-in { from { width: 0%; } }
        .savings-bar {
          animation: savings-in 1s cubic-bezier(0.22,1,0.36,1) both 0.3s;
          background: linear-gradient(90deg, #3b5bdb 0%, #748ffc 100%);
        }

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
          <div key={pt.id} className="xp-particle" style={{ left: pt.x - 24, top: pt.y - 16 }}>
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
        <div className="mq-hero s1" style={{ paddingTop: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 0, position: "relative", zIndex: 1 }}>

            {/* Character column — intentionally oversized, bursts out of card */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              minWidth: 105,
              marginLeft: -8,
              marginBottom: -12,
              marginTop: -10,
              position: "relative",
              zIndex: 2,
            }}>
              {/* Glow platform under bear */}
              <div style={{
                position: "absolute",
                bottom: 22,
                left: "50%",
                transform: "translateX(-50%)",
                width: 100,
                height: 22,
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(201,168,76,0.32) 0%, transparent 75%)",
                filter: "blur(6px)",
                pointerEvents: "none",
              }} />

              {/* Bear — intentionally oversized, head punches above card */}
              <div
                style={{
                  transform: "scale(1.92)",
                  transformOrigin: "bottom center",
                  filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.55))",
                  transition: "transform 0.3s cubic-bezier(0.34,1.4,0.64,1)",
                  cursor: "pointer",
                  marginBottom: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(2.0)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1.92)")}
              >
                <BearCharacter
                  fur={charColors.fur}
                  inner={charColors.inner}
                  equippedHat={user?.equipped_hat}
                  equippedGlasses={user?.equipped_glasses}
                  equippedOutfit={user?.equipped_outfit}
                  mood={mood}
                />
              </div>

              <span style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.28)",
                fontStyle: "italic",
                textAlign: "center",
                lineHeight: 1.4,
                maxWidth: 90,
                marginTop: 2,
              }}>
                "{phrase}"
              </span>
            </div>

            {/* Balance + buttons */}
            <div style={{ flex: 1, paddingLeft: 14, paddingTop: 6, paddingBottom: 4 }}>
              <p style={{ margin: "0 0 1px", fontSize: 10, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700 }}>
                Total Balance
              </p>
              <h1 style={{ margin: "0 0 1px", fontSize: 26, fontWeight: 900, color: "white", lineHeight: 1.1, letterSpacing: "-0.6px" }}>
                {balance.toFixed(2)} €
              </h1>
              <p style={{ margin: "0 0 16px", fontSize: 11, color: "rgba(255,255,255,0.26)", fontWeight: 500 }}>
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
          <div style={{ marginTop: 16, position: "relative", zIndex: 1 }}>
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

      {/* MODAL — portal */}
      {showModal && ReactDOM.createPortal(
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
        </div>,
        document.body
      )}
    </>
  );
}

export default Home;