// src/config/quests.ts
// Each quest now has: xp_reward, coin_reward, and optional next_quest_id

export const QUESTS = [
  {
    id: "add_expense_once",
    title: "First Transaction",
    description: "Add your first expense",
    xp_reward: 20,
    coin_reward: 10,
    next_quest_id: "add_expense_10", // unlocks next quest on claim
  },
  {
    id: "add_expense_10",
    title: "Getting Serious",
    description: "Add 10 expenses",
    xp_reward: 50,
    coin_reward: 25,
    next_quest_id: "add_expense_50",
    locked_by: "add_expense_once",   // only visible after previous is claimed
  },
  {
    id: "add_expense_50",
    title: "Finance Master",
    description: "Add 50 expenses",
    xp_reward: 150,
    coin_reward: 75,
    locked_by: "add_expense_10",
  },
];
