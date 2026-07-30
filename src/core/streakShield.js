
export function canUseStreakShield(user) { return (user.xp || 0) >= 500; }

export function useStreakShield(user) { user.xp -= 500; return user; }

export function getShieldStatus(user) { return user.hasShield || false; }

export function getShieldCost() { return 500; }

export function formatShieldBadge(active) { return active ? 'Shielded' : 'Unprotected'; }

export function logShieldUsage(date) { console.log('Shield saved streak on:', date); }
