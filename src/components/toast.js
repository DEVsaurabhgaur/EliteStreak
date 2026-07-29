// ============================================
// Toast Notifications Component
// ============================================

let toastId = 0;

export function showToast({ title, message, type = 'success', duration = 4000, icon }) {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const id = ++toastId;
  const defaultIcons = {
    success: '✅', error: '❌', warning: '⚠️', xp: '⭐', levelup: '🎉', info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.id = `toast-${id}`;
  toast.innerHTML = `
    <span class="toast-icon">${icon || defaultIcons[type] || '✅'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
  `;

  root.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);

  return id;
}

export function showXPToast(amount) {
  showToast({
    title: `+${amount} XP`,
    message: 'Keep going!',
    type: 'xp',
    icon: '⭐',
    duration: 2500
  });
}

export function showLevelUpToast(level, rank) {
  showToast({
    title: `Level Up! → Level ${level}`,
    message: `Rank: ${rank.icon} ${rank.name}`,
    type: 'levelup',
    icon: '🎉',
    duration: 5000
  });
}

export function showAchievementToast(achievement) {
  showToast({
    title: 'Achievement Unlocked!',
    message: `${achievement.icon} ${achievement.name} — ${achievement.description}`,
    type: 'xp',
    icon: '🏆',
    duration: 5000
  });
}

// Sound trigger on toast popups

