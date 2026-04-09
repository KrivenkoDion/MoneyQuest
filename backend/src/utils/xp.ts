export async function addXP(pool: any, email: string, amount: number) {
  await pool.query(
    "UPDATE users SET xp = xp + $1 WHERE email = $2",
    [amount, email]
  );
}