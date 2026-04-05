import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CHARACTERS = [
  { id: "brown", label: "Classic", fur: "#8B7355", inner: "#C4956A", desc: "The Original" },
  { id: "white", label: "Arctic", fur: "#E8E8E8", inner: "#F5F5F5", desc: "The Cool One" },
  { id: "black", label: "Dark", fur: "#2D2D2D", inner: "#4B4B4B", desc: "The Mysterious" },
  { id: "orange", label: "Sunny", fur: "#C2703A", inner: "#E8967A", desc: "The Energetic" },
];

function ChillGuy({ fur, inner, scale = 1 }: { fur: string; inner: string; scale?: number }) {
  const w = 200 * scale;
  const h = 230 * scale;
  return (
    <svg width={w} height={h} viewBox="0 0 200 230">
      {/* ears */}
      <ellipse cx="55" cy="60" rx="18" ry="24" fill={fur} transform="rotate(-15,55,60)" />
      <ellipse cx="145" cy="60" rx="18" ry="24" fill={fur} transform="rotate(15,145,60)" />
      <ellipse cx="55" cy="62" rx="10" ry="14" fill={inner} transform="rotate(-15,55,62)" />
      <ellipse cx="145" cy="62" rx="10" ry="14" fill={inner} transform="rotate(15,145,62)" />
      {/* head */}
      <ellipse cx="100" cy="95" rx="52" ry="50" fill={fur} />
      {/* snout */}
      <ellipse cx="100" cy="118" rx="28" ry="20" fill={inner} />
      {/* nose */}
      <ellipse cx="100" cy="108" rx="10" ry="7" fill="#2D1B0E" />
      {/* eyes */}
      <ellipse cx="78" cy="88" rx="10" ry="7" fill="white" />
      <ellipse cx="122" cy="88" rx="10" ry="7" fill="white" />
      <ellipse cx="78" cy="90" rx="6" ry="5" fill="#3D2B1F" />
      <ellipse cx="122" cy="90" rx="6" ry="5" fill="#3D2B1F" />
      <rect x="68" y="83" width="20" height="7" rx="4" fill={fur} />
      <rect x="112" y="83" width="20" height="7" rx="4" fill={fur} />
      {/* mouth */}
      <path d="M88 126 Q100 134 112 126" fill="none" stroke="#2D1B0E" strokeWidth="2.5" strokeLinecap="round" />
      {/* neck */}
      <rect x="82" y="140" width="36" height="20" fill={fur} />
      {/* hoodie */}
      <rect x="30" y="158" width="140" height="72" rx="20" fill="#4A4A6A" />
      <path d="M30 175 Q100 148 170 175" fill="#4A4A6A" />
      {/* pocket */}
      <rect x="55" y="195" width="90" height="25" rx="10" fill="#3A3A5A" />
      {/* arms */}
      <path d="M30 170 Q10 205 30 235" fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
      <path d="M170 170 Q190 205 170 235" fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
      {/* hands */}
      <ellipse cx="22" cy="232" rx="14" ry="12" fill={fur} />
      <ellipse cx="178" cy="232" rx="14" ry="12" fill={fur} />
    </svg>
  );
}

function CharacterSelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("brown");
  const [loading, setLoading] = useState(false);

  const current = CHARACTERS.find(c => c.id === selected)!;

  const handleConfirm = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    await fetch("https://moneyquest-pcoq.onrender.com/update-avatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ avatar: selected }),
    });

    setLoading(false);
    navigate("/home");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f0",
      maxWidth: 390,
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 24px",
    }}>

      <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 2 }}>
        Step 1 of 1
      </p>
      <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#1a1a2e", textAlign: "center" }}>
        Choose your character
      </h1>
      <p style={{ margin: "0 0 32px", fontSize: 14, color: "#999", textAlign: "center" }}>
        You can unlock new looks as you grow
      </p>

      {/* BIG PREVIEW */}
      <div style={{
        background: "white",
        borderRadius: 28,
        padding: "24px 40px 16px",
        marginBottom: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <ChillGuy fur={current.fur} inner={current.inner} scale={1.1} />
        <p style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>{current.label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#999" }}>{current.desc}</p>
      </div>

      {/* CHARACTER OPTIONS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {CHARACTERS.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelected(c.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "white",
              border: selected === c.id ? "3px solid #1a1a2e" : "3px solid transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border 0.15s",
              boxShadow: selected === c.id ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
            }}>
              <ChillGuy fur={c.fur} inner={c.inner} scale={0.28} />
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: selected === c.id ? 700 : 400,
              color: selected === c.id ? "#1a1a2e" : "#999",
            }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {/* CONFIRM */}
      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 14,
          border: "none",
          background: "#1a1a2e",
          color: "white",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Saving..." : "Let's go →"}
      </button>

    </div>
  );
}

export default CharacterSelect;