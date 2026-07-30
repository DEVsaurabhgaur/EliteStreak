
export function canUseStreakShield(user) { return (user.xp || 0) >= 500; }

export function useStreakShield(user) { user.xp -= 500; return user; }

export function getShieldStatus(user) { return user.hasShield || false; }

export function getShieldCost() { return 500; }
