import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CHARACTERS = [
  { id: "brown",  label: "Classic", fur: "#8B7355", inner: "#C4956A", desc: "The Original" },
  { id: "white",  label: "Arctic",  fur: "#E8E8E8", inner: "#F5F5F5", desc: "The Cool One" },
  { id: "black",  label: "Dark",    fur: "#2D2D2D", inner: "#4B4B4B", desc: "The Mysterious" },
  { id: "orange", label: "Sunny",   fur: "#C2703A", inner: "#E8967A", desc: "The Energetic" },
];

function BearPreview({ fur, inner, scale = 1 }: { fur: string; inner: string; scale?: number }) {
  return (
    <svg width={200 * scale} height={230 * scale} viewBox="0 0 200 230" className="bear-preview">
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
    </svg>
  );
}

function CharacterSelect() {
  const navigate  = useNavigate();
  const [selected, setSelected] = useState("brown");
  const [loading, setLoading]   = useState(false);

  const current = CHARACTERS.find(c => c.id === selected)!;

  const handleConfirm = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    await fetch("https://moneyquest-pcoq.onrender.com/update-avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ avatar: selected }),
    });
    setLoading(false);
    navigate("/home");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes page-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-page { animation: page-in 0.4s ease both; }

        /* Bear breathe */
        @keyframes breathe {
          0%,100% { transform: scaleY(1) translateY(0); }
          50%      { transform: scaleY(1.025) translateY(-2px); }
        }
        .bear-preview {
          transform-origin: 50% 90%;
          animation: breathe 3s ease-in-out infinite;
        }

        /* Character swap */
        @keyframes bear-swap {
          from { opacity: 0; transform: scale(0.88) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .bear-enter { animation: bear-swap 0.28s cubic-bezier(0.34,1.2,0.64,1) both; }

        /* Option swatch */
        .swatch {
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          cursor: pointer; -webkit-tap-highlight-color: transparent;
          transition: transform 0.18s cubic-bezier(0.34,1.5,0.64,1);
        }
        .swatch:hover  { transform: translateY(-3px); }
        .swatch:active { transform: scale(0.9); }

        .swatch-ring {
          width: 62px; height: 62px; border-radius: 18px;
          background: white;
          display: flex; align-items: center; justify-content: center;
          transition: border 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
        }
        .swatch-ring.active {
          box-shadow: 0 0 0 3px #11112a, 0 6px 18px rgba(17,17,42,0.18);
        }

        /* CTA button */
        .confirm-btn {
          width: 100%; padding: 17px; border-radius: 16px; border: none;
          background: #11112a; color: white;
          font-size: 17px; font-weight: 900; font-family: inherit; letter-spacing: -0.3px;
          cursor: pointer;
          box-shadow: 0 5px 22px rgba(17,17,42,0.3);
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.13s cubic-bezier(0.34,1.5,0.64,1), opacity 0.13s, box-shadow 0.13s;
        }
        .confirm-btn:hover  { opacity: 0.9; }
        .confirm-btn:active { transform: scale(0.95); opacity: 0.82; }
        .confirm-btn:disabled { opacity: 0.5; cursor: default; }
      `}</style>

      <div className="cs-page" style={{
        minHeight: "100vh",
        background: "#efefea",
        maxWidth: 390,
        margin: "0 auto",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 40px",
      }}>
        {/* Step indicator */}
        <p style={{ margin: "0 0 6px", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>
          Step 1 of 1
        </p>

        {/* Title */}
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, color: "#11112a", textAlign: "center", letterSpacing: "-0.5px" }}>
          Choose your character
        </h1>
        <p style={{ margin: "0 0 32px", fontSize: 14, color: "#aaa", textAlign: "center", fontWeight: 500 }}>
          You can unlock new looks as you grow
        </p>

        {/* Big preview card */}
        <div style={{
          background: "white", borderRadius: 28, padding: "28px 40px 20px",
          marginBottom: 26, display: "flex", flexDirection: "column",
          alignItems: "center", width: "100%",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          transition: "box-shadow 0.2s",
        }}>
          <div key={selected} className="bear-enter">
            <BearPreview fur={current.fur} inner={current.inner} scale={1.1} />
          </div>
          <p style={{ margin: "12px 0 2px", fontSize: 20, fontWeight: 900, color: "#11112a", letterSpacing: "-0.4px" }}>{current.label}</p>
          <p style={{ margin: 0, fontSize: 13, color: "#aaa", fontWeight: 500 }}>{current.desc}</p>
        </div>

        {/* Swatch selector */}
        <div style={{ display: "flex", gap: 14, marginBottom: 36 }}>
          {CHARACTERS.map(c => (
            <div key={c.id} className="swatch" onClick={() => setSelected(c.id)}>
              <div className={`swatch-ring ${selected === c.id ? "active" : ""}`}>
                <BearPreview fur={c.fur} inner={c.inner} scale={0.28} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: selected === c.id ? 800 : 500,
                color: selected === c.id ? "#11112a" : "#aaa",
                transition: "color 0.15s, font-weight 0.15s",
              }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* Confirm */}
        <button className="confirm-btn" onClick={handleConfirm} disabled={loading}>
          {loading ? "Saving…" : "Let's go →"}
        </button>
      </div>
    </>
  );
}

export default CharacterSelect;
