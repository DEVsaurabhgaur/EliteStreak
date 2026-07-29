// ============================================
// XP & Leveling Engine
// Handles experience points, levels, and ranks
// ============================================

// XP required for each level follows a curve: Level N needs N^1.5 * 100 total XP
export function getXPForLevel(level) {
  return Math.floor(Math.pow(level, 1.5) * 100);
}

export function getTotalXPForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

export function getLevelForTotalXP(totalXP) {
  let level = 1;
  let xpNeeded = 0;
  while (true) {
    xpNeeded += getXPForLevel(level);
    if (totalXP < xpNeeded) return level;
    level++;
    if (level > 999) return 999;
  }
}

export function getProgressToNextLevel(totalXP) {
  const level = getLevelForTotalXP(totalXP);
  const xpForCurrentLevel = getTotalXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level);
  const currentLevelXP = totalXP - xpForCurrentLevel;
  return {
    level,
    currentXP: currentLevelXP,
    neededXP: xpForNextLevel,
    percent: Math.min((currentLevelXP / xpForNextLevel) * 100, 100),
  };
}

// --- Ranks ---
const RANKS = [
  { name: 'Recruit', icon: '🟤', minLevel: 1, color: '#8B6914' },
  { name: 'Warrior', icon: '⚪', minLevel: 11, color: '#C0C0C0' },
  { name: 'Champion', icon: '🟡', minLevel: 26, color: '#FFD700' },
  { name: 'Elite', icon: '💎', minLevel: 51, color: '#00D4FF' },
  { name: 'Legend', icon: '💠', minLevel: 76, color: '#7C3AED' },
  { name: 'Unstoppable', icon: '🔥', minLevel: 100, color: '#FF3366' },
];

export function getRankForLevel(level) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r;
  }
  return rank;
}

export function getNextRank(level) {
  for (const r of RANKS) {
    if (level < r.minLevel) return r;
  }
  return null;
}

// --- XP Rewards ---
const XP_REWARDS = {
  HABIT_COMPLETE: 10,
  ALL_HABITS_COMPLETE: 50,
  DEEP_WORK_25: 25,
  DEEP_WORK_50: 60,
  DEEP_WORK_90: 100,
  DAILY_CHECKIN: 15,
  BOSS_BATTLE_WIN: 200,
  MILESTONE: 500,
  PERFECT_DAY: 100,
  GOAL_COMPLETE: 300,
  STREAK_7: 75,
  STREAK_30: 200,
  STREAK_100: 1000,
};

export function calculateXP(action, streakMultiplier = 1) {
  const baseXP = XP_REWARDS[action] || 0;
  return Math.floor(baseXP * streakMultiplier);
}

export { RANKS, XP_REWARDS };

// Level bonus XP scalar


// Cap maximum streak multiplier scalar


// Remaining XP calculator

