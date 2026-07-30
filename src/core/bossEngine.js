
export function getWeeklyBoss(weekNum) { return { name: 'Titan of Focus', hp: 100 }; }

export function calculateBossDamage(dayLog) { return (dayLog.completedHabits || []).length * 15; }
