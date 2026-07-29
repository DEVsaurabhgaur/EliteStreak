// ============================================
// Streak Engine
// Handles streak calculation, multipliers,
// and streak protection (redemption system)
// ============================================

import { getToday, addDays, getDaysBetween } from '../utils/dates.js';

// --- Streak Multiplier Table ---
const MULTIPLIER_TABLE = [
  { minDays: 90, multiplier: 10 },
  { minDays: 60, multiplier: 5 },
  { minDays: 30, multiplier: 3 },
  { minDays: 14, multiplier: 2 },
  { minDays: 7, multiplier: 1.5 },
  { minDays: 0, multiplier: 1 },
];

export function getStreakMultiplier(streakDays) {
  for (const tier of MULTIPLIER_TABLE) {
    if (streakDays >= tier.minDays) return tier.multiplier;
  }
  return 1;
}

export function getMultiplierLabel(multiplier) {
  return `${multiplier}×`;
}

export function getNextMultiplierTier(streakDays) {
  for (let i = MULTIPLIER_TABLE.length - 2; i >= 0; i--) {
    if (streakDays < MULTIPLIER_TABLE[i].minDays) {
      return {
        daysNeeded: MULTIPLIER_TABLE[i].minDays - streakDays,
        multiplier: MULTIPLIER_TABLE[i].multiplier,
      };
    }
  }
  return null;
}

// --- Streak Calculation ---
export function calculateStreak(dayLogs, habits) {
  const today = getToday();
  let streakDays = 0;
  let currentDate = today;

  // Check today first
  const todayLog = dayLogs.find(l => l.date === today);
  const todayCompleted = todayLog ? getCompletionRate(todayLog, habits) >= 0.5 : false;

  // If today isn't completed yet, start from yesterday
  if (!todayCompleted) {
    currentDate = addDays(new Date(), -1);
  }

  // Walk backwards counting consecutive completed days
  while (true) {
    const dateStr = typeof currentDate === 'string' ? currentDate : addDays(currentDate, 0);
    const log = dayLogs.find(l => l.date === dateStr);

    if (!log || getCompletionRate(log, habits) < 0.5) {
      break;
    }

    streakDays++;
    currentDate = addDays(new Date(dateStr), -1);

    // Safety limit
    if (streakDays > 9999) break;
  }

  return streakDays;
}

export function getCompletionRate(dayLog, habits) {
  if (!dayLog || !dayLog.completedHabits || habits.length === 0) return 0;
  return dayLog.completedHabits.length / habits.length;
}

export function getBestStreak(dayLogs, habits) {
  if (dayLogs.length === 0) return 0;

  const sorted = [...dayLogs].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let current = 0;
  let lastDate = null;

  for (const log of sorted) {
    if (getCompletionRate(log, habits) >= 0.5) {
      if (lastDate && getDaysBetween(lastDate, log.date) === 1) {
        current++;
      } else {
        current = 1;
      }
      if (current > best) best = current;
      lastDate = log.date;
    } else {
      current = 0;
      lastDate = null;
    }
  }
  return best;
}

// --- Streak Status ---
export function isStreakAlive(dayLogs, habits) {
  const yesterday = addDays(new Date(), -1);
  const yesterdayLog = dayLogs.find(l => l.date === yesterday);
  const todayLog = dayLogs.find(l => l.date === getToday());

  const yesterdayDone = yesterdayLog && getCompletionRate(yesterdayLog, habits) >= 0.5;
  const todayDone = todayLog && getCompletionRate(todayLog, habits) >= 0.5;

  return yesterdayDone || todayDone;
}

export function isStreakInDanger(dayLogs, habits) {
  const todayLog = dayLogs.find(l => l.date === getToday());
  const todayDone = todayLog && getCompletionRate(todayLog, habits) >= 0.5;

  if (todayDone) return false;

  const now = new Date();
  const hoursLeft = 24 - now.getHours() - (now.getMinutes() / 60);
  return hoursLeft < 6; // Danger if less than 6 hours left
}

export { MULTIPLIER_TABLE };

// Streak shield cost calculation

