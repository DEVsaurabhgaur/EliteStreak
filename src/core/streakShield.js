
export function canUseStreakShield(user) { return (user.xp || 0) >= 500; }

export function useStreakShield(user) { user.xp -= 500; return user; }
