// ============================================
// Achievement Engine
// Defines all achievements and checks unlock conditions
// ============================================

const ACHIEVEMENTS = [
  // Streak Achievements
  { id: 'streak_7', name: 'Week Warrior', icon: '🗡️', description: '7-day streak', category: 'streak', condition: (s) => s.currentStreak >= 7 },
  { id: 'streak_14', name: 'Fortnight Force', icon: '⚔️', description: '14-day streak', category: 'streak', condition: (s) => s.currentStreak >= 14 },
  { id: 'streak_30', name: 'Iron Month', icon: '🛡️', description: '30-day streak', category: 'streak', condition: (s) => s.currentStreak >= 30 },
  { id: 'streak_60', name: 'Diamond Discipline', icon: '💎', description: '60-day streak', category: 'streak', condition: (s) => s.currentStreak >= 60 },
  { id: 'streak_90', name: 'Unstoppable', icon: '🔥', description: '90-day streak', category: 'streak', condition: (s) => s.currentStreak >= 90 },
  { id: 'streak_180', name: 'Half Year Hero', icon: '👑', description: '180-day streak', category: 'streak', condition: (s) => s.currentStreak >= 180 },
  { id: 'streak_365', name: 'Legendary Year', icon: '🌟', description: '365-day streak', category: 'streak', condition: (s) => s.currentStreak >= 365 },

  // XP Achievements
  { id: 'xp_1000', name: 'First Thousand', icon: '✨', description: 'Earn 1,000 XP', category: 'xp', condition: (s) => s.totalXP >= 1000 },
  { id: 'xp_5000', name: 'XP Hunter', icon: '💫', description: 'Earn 5,000 XP', category: 'xp', condition: (s) => s.totalXP >= 5000 },
  { id: 'xp_10000', name: 'XP Master', icon: '⭐', description: 'Earn 10,000 XP', category: 'xp', condition: (s) => s.totalXP >= 10000 },
  { id: 'xp_50000', name: 'XP Legend', icon: '🏆', description: 'Earn 50,000 XP', category: 'xp', condition: (s) => s.totalXP >= 50000 },
  { id: 'xp_100000', name: 'XP God', icon: '👁️', description: 'Earn 100,000 XP', category: 'xp', condition: (s) => s.totalXP >= 100000 },

  // Perfect Day Achievements
  { id: 'perfect_1', name: 'Perfect Start', icon: '🎯', description: 'First perfect day', category: 'perfect', condition: (s) => s.perfectDays >= 1 },
  { id: 'perfect_7', name: 'Perfect Week', icon: '🏅', description: '7 perfect days', category: 'perfect', condition: (s) => s.perfectDays >= 7 },
  { id: 'perfect_30', name: 'Perfect Month', icon: '🥇', description: '30 perfect days', category: 'perfect', condition: (s) => s.perfectDays >= 30 },

  // Focus Achievements
  { id: 'focus_10h', name: 'Deep Diver', icon: '🤿', description: '10 hours of deep work', category: 'focus', condition: (s) => s.totalFocusMinutes >= 600 },
  { id: 'focus_50h', name: 'Focus Master', icon: '🧠', description: '50 hours of deep work', category: 'focus', condition: (s) => s.totalFocusMinutes >= 3000 },
  { id: 'focus_100h', name: 'Flow State', icon: '🌊', description: '100 hours of deep work', category: 'focus', condition: (s) => s.totalFocusMinutes >= 6000 },
  { id: 'focus_500h', name: 'Deep Work Elite', icon: '🏔️', description: '500 hours of deep work', category: 'focus', condition: (s) => s.totalFocusMinutes >= 30000 },
  { id: 'focus_1000h', name: '1000 Hour Club', icon: '💀', description: '1000 hours of deep work', category: 'focus', condition: (s) => s.totalFocusMinutes >= 60000 },

  // Level Achievements
  { id: 'level_10', name: 'Rising Star', icon: '🌟', description: 'Reach Level 10', category: 'level', condition: (s) => s.level >= 10 },
  { id: 'level_25', name: 'Ascendant', icon: '🚀', description: 'Reach Level 25', category: 'level', condition: (s) => s.level >= 25 },
  { id: 'level_50', name: 'Transcendent', icon: '🌌', description: 'Reach Level 50', category: 'level', condition: (s) => s.level >= 50 },
  { id: 'level_100', name: 'Centurion', icon: '🏛️', description: 'Reach Level 100', category: 'level', condition: (s) => s.level >= 100 },

  // Goal Achievements
  { id: 'goal_1', name: 'Goal Getter', icon: '🎯', description: 'Complete your first goal', category: 'goals', condition: (s) => s.goalsCompleted >= 1 },
  { id: 'goal_5', name: 'Achiever', icon: '🏹', description: 'Complete 5 goals', category: 'goals', condition: (s) => s.goalsCompleted >= 5 },
  { id: 'goal_10', name: 'Conqueror', icon: '⚡', description: 'Complete 10 goals', category: 'goals', condition: (s) => s.goalsCompleted >= 10 },

  // Special
  { id: 'early_bird', name: 'Early Bird', icon: '🐦', description: 'Check in before 7 AM', category: 'special', condition: (s) => s.earlyCheckIn },
  { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Focus session past midnight', category: 'special', condition: (s) => s.nightOwl },
  { id: 'comeback', name: 'The Comeback', icon: '🔄', description: 'Rebuild a 7-day streak after losing one', category: 'special', condition: (s) => s.comebackStreak },
];

export function checkAchievements(stats, unlockedIds) {
  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;
    if (achievement.condition(stats)) {
      newlyUnlocked.push(achievement);
    }
  }
  return newlyUnlocked;
}

export function getAchievementById(id) {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category) {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getAchievementProgress(stats) {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: a.condition(stats),
  }));
}

// Skill tree nodes — unlocked at streak milestones
export const SKILL_TREE = [
  { id: 'sk1', name: 'Spark', icon: '✨', description: 'Begin your journey', requirement: 'Start using the app', requiredStreak: 0, unlocked: true },
  { id: 'sk2', name: 'Discipline I', icon: '🔥', description: '+10% XP from habits', requirement: '3-day streak', requiredStreak: 3 },
  { id: 'sk3', name: 'Iron Will', icon: '🛡️', description: 'Streak protection unlocked', requirement: '7-day streak', requiredStreak: 7 },
  { id: 'sk4', name: 'Focus Lens', icon: '🔍', description: '+25% XP from deep work', requirement: '14-day streak', requiredStreak: 14 },
  { id: 'sk5', name: 'Momentum', icon: '🌊', description: 'Streak multiplier +0.5×', requirement: '21-day streak', requiredStreak: 21 },
  { id: 'sk6', name: 'Discipline II', icon: '⚡', description: '+20% XP from all sources', requirement: '30-day streak', requiredStreak: 30 },
  { id: 'sk7', name: 'Titan Mind', icon: '🧠', description: 'Unlock analytics predictions', requirement: '45-day streak', requiredStreak: 45 },
  { id: 'sk8', name: 'Unbreakable', icon: '💎', description: 'Double streak protection', requirement: '60-day streak', requiredStreak: 60 },
  { id: 'sk9', name: 'Ascension', icon: '🚀', description: '+50% XP from all sources', requirement: '90-day streak', requiredStreak: 90 },
  { id: 'sk10', name: 'Transcendence', icon: '👁️', description: 'Maximum power achieved', requirement: '120-day streak', requiredStreak: 120 },
];

export { ACHIEVEMENTS };

// Multi-category filter

