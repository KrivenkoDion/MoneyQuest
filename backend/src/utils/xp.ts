// src/utils/xp.ts

// XP needed to reach each level. Level 1 = 0 XP, Level 2 = 100 XP, etc.
// Formula: level = floor(xp / 100) + 1, capped at 20
export function xpToLevel(xp: number): number {
  return Math.min(Math.floor(xp / 100) + 1, 20);
}

// Coins awarded on level-up (flat 25 coins per level)
const LEVEL_UP_COIN_REWARD = 25;

/**
 * Add XP to a user and automatically handle level-up if threshold is crossed.
 * Returns the new level if a level-up occurred, otherwise null.
 */
export async function addXP(
  pool: any,
  email: string,
  amount: number
): Promise<number | null> {
  // Read current XP and level before the update
  const before = await pool.query(
    "SELECT xp, level FROM users WHERE email = $1",
    [email]
  );
  const oldXP    = before.rows[0]?.xp    || 0;
  const oldLevel = before.rows[0]?.level || 1;

  const newXP    = oldXP + amount;
  const newLevel = xpToLevel(newXP);

  if (newLevel > oldLevel) {
    // Level up — update XP, level, and award bonus coins in one query
    await pool.query(
      "UPDATE users SET xp = $1, level = $2, coins = coins + $3 WHERE email = $4",
      [newXP, newLevel, LEVEL_UP_COIN_REWARD, email]
    );
    return newLevel; // caller can use this to notify the user
  } else {
    await pool.query(
      "UPDATE users SET xp = $1 WHERE email = $2",
      [newXP, email]
    );
    return null;
  }
}

export async function addCoins(pool: any, email: string, amount: number) {
  await pool.query(
    "UPDATE users SET coins = coins + $1 WHERE email = $2",
    [amount, email]
  );
}
