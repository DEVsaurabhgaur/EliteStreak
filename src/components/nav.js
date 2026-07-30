// ============================================
// Navigation Sidebar Component
// ============================================

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Command Center' },
  { id: 'goals', icon: '🎯', label: 'Goals & Missions' },
  { id: 'battle', icon: '⚔️', label: 'Battle Arena' },
  { id: 'analytics', icon: '📊', label: 'Analytics' },
  { id: 'focus', icon: '⏱️', label: 'Focus Arena' },
  { id: 'checkin', icon: '📝', label: 'Daily Check-In' },
];

const NAV_BOTTOM = [
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

export function renderNav(activeScreen, onNavigate) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="nav-logo" data-tooltip="ELITE STREAK">🔥</div>
    <div class="nav-items">
      ${NAV_ITEMS.map(item => `
        <button class="nav-item ${activeScreen === item.id ? 'active' : ''}"
                data-screen="${item.id}"
                data-tooltip="${item.label}"
                aria-label="${item.label}">
          ${item.icon}
        </button>
      `).join('')}
    </div>
    <div class="nav-bottom">
      ${NAV_BOTTOM.map(item => `
        <button class="nav-item ${activeScreen === item.id ? 'active' : ''}"
                data-screen="${item.id}"
                data-tooltip="${item.label}"
                aria-label="${item.label}">
          ${item.icon}
        </button>
      `).join('')}
    </div>
  `;

  // Event delegation
  sidebar.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const screen = btn.dataset.screen;
      if (screen && screen !== activeScreen) {
        onNavigate(screen);
      }
    });
  });
}

// Hover tooltip label positioning


// Active sidebar indicator glow

