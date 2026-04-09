// src/config/quests.ts
// KEY ADDITIONS vs previous version:
//   - goal: the number progress must reach for the quest to become claimable
//   - type: how progress is tracked ("expense_count" | "expense_amount" | "streak")
//   - locked_by: quest id that must be claimed before this one appears
//   - coin_reward + xp_reward unchanged

export const QUESTS = [

  // ── COUNT-BASED ──────────────────────────────────────────────
  {
    id: "add_expense_once",
    title: "First Step",
    description: "Add your first expense",
    type: "expense_count",
    goal: 1,
    xp_reward: 20,
    coin_reward: 10,
  },
  {
    id: "add_expense_5",
    title: "Getting Started",
    description: "Add 5 expenses",
    type: "expense_count",
    goal: 5,
    xp_reward: 30,
    coin_reward: 15,
    locked_by: "add_expense_once",
  },
  {
    id: "add_expense_10",
    title: "Getting Serious",
    description: "Add 10 expenses",
    type: "expense_count",
    goal: 10,
    xp_reward: 50,
    coin_reward: 25,
    locked_by: "add_expense_5",
  },
  {
    id: "add_expense_20",
    title: "In the Habit",
    description: "Add 20 expenses",
    type: "expense_count",
    goal: 20,
    xp_reward: 80,
    coin_reward: 40,
    locked_by: "add_expense_10",
  },
  {
    id: "add_expense_50",
    title: "Finance Master",
    description: "Add 50 expenses",
    type: "expense_count",
    goal: 50,
    xp_reward: 150,
    coin_reward: 75,
    locked_by: "add_expense_20",
  },

  // ── AMOUNT-BASED ─────────────────────────────────────────────
  {
    id: "track_50_euros",
    title: "Money Tracker",
    description: "Track 50€ in expenses",
    type: "expense_amount",
    goal: 50,
    xp_reward: 40,
    coin_reward: 20,
  },
  {
    id: "track_200_euros",
    title: "Budget Watcher",
    description: "Track 200€ in expenses",
    type: "expense_amount",
    goal: 200,
    xp_reward: 100,
    coin_reward: 50,
    locked_by: "track_50_euros",
  },

  // ── STREAK-BASED ─────────────────────────────────────────────
  {
    id: "streak_3",
    title: "3-Day Streak",
    description: "Stay active 3 days in a row",
    type: "streak",
    goal: 3,
    xp_reward: 30,
    coin_reward: 20,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Stay active 7 days in a row",
    type: "streak",
    goal: 7,
    xp_reward: 100,
    coin_reward: 60,
    locked_by: "streak_3",
  },
];
