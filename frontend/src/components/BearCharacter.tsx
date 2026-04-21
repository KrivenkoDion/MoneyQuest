import { useState, useEffect } from "react";
import type { BearMood } from "../hooks/useBearReaction";
 
function BearCharacter({
  fur, inner, equippedHat, equippedGlasses, onClick, mood = "idle",
}: {
  fur: string; inner: string;
  equippedHat?: string | null;
  equippedGlasses?: string | null;
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
      <rect x="30" y="158" width="140" height="72" rx="20" fill="#4A4A6A" />
      <path d="M30 175 Q100 148 170 175" fill="#4A4A6A" />
      <rect x="55" y="195" width="90" height="25" rx="10" fill="#3A3A5A" />
      <path d="M30 170 Q10 205 30 235"   fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
      <path d="M170 170 Q190 205 170 235" fill="none" stroke="#4A4A6A" strokeWidth="28" strokeLinecap="round" />
      <ellipse cx="22"  cy="232" rx="14" ry="12" fill={fur} />
      <ellipse cx="178" cy="232" rx="14" ry="12" fill={fur} />
      {equippedHat === "hat" && (
        <g><rect x="72" y="38" width="56" height="8" rx="3" fill="#2D1B0E" /><rect x="82" y="18" width="36" height="22" rx="5" fill="#2D1B0E" /></g>
      )}
      {equippedHat === "crown" && (
        <g><polygon points="76,42 88,22 100,36 112,22 124,42" fill="#FFD700" /><rect x="76" y="40" width="48" height="6" rx="2" fill="#FFD700" /></g>
      )}
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
 
export { BearCharacter };