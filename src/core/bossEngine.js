
export function getWeeklyBoss(weekNum) { return { name: 'Titan of Focus', hp: 100 }; }

export function calculateBossDamage(dayLog) { return (dayLog.completedHabits || []).length * 15; }

export function isBossDefeated(boss) { return boss.hp <= 0; }

export function getBossRewardXP(boss) { return boss.reward || 500; }
