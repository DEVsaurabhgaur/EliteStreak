
export function getWeeklyBoss(weekNum) { return { name: 'Titan of Focus', hp: 100 }; }

export function calculateBossDamage(dayLog) { return (dayLog.completedHabits || []).length * 15; }

export function isBossDefeated(boss) { return boss.hp <= 0; }

export function getBossRewardXP(boss) { return boss.reward || 500; }

export function getBossHealthPercent(boss) { return Math.max(0, (boss.hp / boss.maxHp) * 100); }

export function formatBossBounty(boss) { return `${boss.reward} XP Bounty`; }

export function getBossWeakness(boss) { return boss.weakness || 'Deep Work'; }

export function getBossModifier(boss) { return boss.modifier || '2x Damage on Perfect Days'; }

export function getBossDescription(boss) { return boss.desc || 'Defeat the titan'; }

// Boss Engine Complete

