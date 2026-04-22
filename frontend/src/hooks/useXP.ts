import { useState } from "react";

export function useXP() {
const [xpParticles, setXpParticles] = useState<{
  id: number;
  label: string;
  x: number;
  y: number;
}[]>([]);

  const spawnXP = (label: string, e?: React.MouseEvent) => {
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    const id = Date.now() + Math.random();
    setXpParticles(p => [...p, { id, label, x, y }]);
    setTimeout(() => setXpParticles(p => p.filter(pt => pt.id !== id)), 1100);
  };

  return { xpParticles, spawnXP };
}