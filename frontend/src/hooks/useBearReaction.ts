import { useState, useCallback, useRef } from "react";
 
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
 
export type { BearMood };
export { useBearReaction };