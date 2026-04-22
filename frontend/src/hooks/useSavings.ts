import { useState } from "react";
import type { BearMood } from "./useBearReaction";

const API = "https://moneyquest-pcoq.onrender.com";

export function useSavings(
  token: string | null,
  react: (mood: BearMood) => void,
  spawnXP: (label: string, e?: React.MouseEvent) => void,
) {
  const [savingsGoal, setSavingsGoal]           = useState<any>(null);
  const [savingsCompleted, setSavingsCompleted] = useState(false);
  const [savingsFading, setSavingsFading]       = useState(false);
  const [savingsName, setSavingsName]           = useState("");
  const [savingsTarget, setSavingsTarget]       = useState("");
  const [savingsAdd, setSavingsAdd]             = useState("");
  const [showSavingsCreate, setShowSavingsCreate] = useState(false);

  const fetchSavings = () =>
    fetch(`${API}/savings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSavingsGoal(d.goal || null))
      .catch(() => {});

  const createSavingsGoal = async () => {
    const target = Number(savingsTarget);
    if (!savingsName.trim() || !target || target <= 0) return;
    const res = await fetch(`${API}/savings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: savingsName.trim(), target_amount: target }),
    });
    const data = await res.json();
    if (res.ok) {
      setSavingsGoal(data.goal);
      setSavingsCompleted(false);
      setSavingsFading(false);
      setShowSavingsCreate(false);
      setSavingsName("");
      setSavingsTarget("");
    }
  };

  const addToSavings = async (e?: React.MouseEvent) => {
    const amount = Number(savingsAdd);
    if (!amount || amount <= 0) return;
    const res = await fetch(`${API}/savings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (res.ok) {
      const goal = data.goal;
      setSavingsGoal(goal);
      setSavingsAdd("");
      spawnXP("+3 XP", e);
      if (goal.saved_amount >= goal.target_amount && !savingsCompleted) {
        react("excited");
        setSavingsCompleted(true);
        setTimeout(() => setSavingsFading(true), 1500);
        setTimeout(() => {
          setSavingsGoal(null);
          setSavingsCompleted(false);
          setSavingsFading(false);
        }, 2700);
      } else {
        react("proud");
      }
    }
  };

  return {
    savingsGoal,   setSavingsGoal,
    savingsCompleted,
    savingsFading,
    savingsName,   setSavingsName,
    savingsTarget, setSavingsTarget,
    savingsAdd,    setSavingsAdd,
    showSavingsCreate, setShowSavingsCreate,
    fetchSavings,
    createSavingsGoal,
    addToSavings,
  };
}