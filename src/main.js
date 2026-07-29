// ============================================
// ELITE STREAK — Main Entry Point
// Personal Performance OS
// ============================================

// Styles
import './styles/index.css';
import './styles/dashboard.css';
import './styles/screens.css';
import './styles/panels.css';
import './styles/components.css';

// Core
import { store } from './core/store.js';
import { getProgressToNextLevel, getRankForLevel } from './core/xpEngine.js';
import { calculateStreak } from './core/streakEngine.js';
import { checkAchievements } from './core/achievementEngine.js';

// Components
import { renderNav } from './components/nav.js';
import { showAchievementToast } from './components/toast.js';
import { celebrateAchievement } from './components/particles.js';

// Screens
import { renderDashboard } from './screens/dashboard.js';
import { renderGoals } from './screens/goals.js';
import { renderBattle } from './screens/battle.js';
import { renderAnalytics } from './screens/analytics.js';
import { renderFocus, cleanupFocus } from './screens/focus.js';
import { renderCheckIn } from './screens/checkin.js';
import { renderSettings } from './screens/settings.js';

// ============================================
// App Controller
// ============================================
const app = {
  currentScreen: 'dashboard',
  initialized: false,

  async init() {
    try {
      // Initialize store
      await store.init();
      this.initialized = true;

      // Load initial screen from hash or default
      const hash = window.location.hash.slice(1);
      if (hash && SCREENS[hash]) {
        this.currentScreen = hash;
      }

      // Render
      this.render();

      // Hide loading screen
      setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) loader.classList.add('hidden');
      }, 800);

      // Check for achievements on load
      this.checkNewAchievements();

      // Listen for hash changes
      window.addEventListener('hashchange', () => {
        const screen = window.location.hash.slice(1);
        if (screen && SCREENS[screen] && screen !== this.currentScreen) {
          this.navigate(screen);
        }
      });

      console.log('%c🔥 ELITE STREAK initialized', 'color: #00ff88; font-size: 16px; font-weight: bold;');

    } catch (err) {
      console.error('Failed to initialize:', err);
      const main = document.getElementById('main-content');
      if (main) {
        main.innerHTML = `
          <div class="empty-state">
            <div class="icon">⚠️</div>
            <h3>Initialization Error</h3>
            <p>${err.message}</p>
            <button class="btn btn-primary" onclick="window.location.reload()" style="margin-top: 1rem;">Reload</button>
          </div>
        `;
      }
      const loader = document.getElementById('loading-screen');
      if (loader) loader.classList.add('hidden');
    }
  },

  navigate(screen) {
    if (!SCREENS[screen]) return;

    // Cleanup current screen
    if (this.currentScreen === 'focus') {
      cleanupFocus();
    }

    this.currentScreen = screen;
    window.location.hash = screen;
    this.render();
  },

  async render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Update nav
    renderNav(this.currentScreen, (screen) => this.navigate(screen));

    // Scroll to top
    main.scrollTop = 0;

    // Render screen
    const renderFn = SCREENS[this.currentScreen];
    if (renderFn) {
      await renderFn(main, this);
    }
  },

  async checkNewAchievements() {
    try {
      const user = await store.getUser();
      const habits = await store.getHabits();
      const dayLogs = await store.getAllDayLogs();
      const focusSessions = await store.getFocusSessions();
      const unlockedAchievements = await store.getAchievements();
      const unlockedIds = unlockedAchievements.map(a => a.id);

      const currentStreak = calculateStreak(dayLogs, habits);
      const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const progress = getProgressToNextLevel(user.totalXpEarned || 0);
      const perfectDays = dayLogs.filter(l =>
        l.completedHabits && l.completedHabits.length === habits.length && habits.length > 0
      ).length;
      const goalsCompleted = (await store.getGoals()).filter(g => g.progress >= g.target).length;

      const stats = {
        currentStreak,
        totalXP: user.totalXpEarned || 0,
        level: progress.level,
        perfectDays,
        totalFocusMinutes,
        goalsCompleted,
        earlyCheckIn: false,
        nightOwl: false,
        comebackStreak: false,
      };

      const newlyUnlocked = checkAchievements(stats, unlockedIds);

      for (const achievement of newlyUnlocked) {
        await store.unlockAchievement(achievement);
        showAchievementToast(achievement);
        setTimeout(() => celebrateAchievement(), 500);
      }
    } catch (err) {
      console.warn('Achievement check failed:', err);
    }
  },
};

// Screen registry
const SCREENS = {
  dashboard: renderDashboard,
  goals: renderGoals,
  battle: renderBattle,
  analytics: renderAnalytics,
  focus: renderFocus,
  checkin: renderCheckIn,
  settings: renderSettings,
};

// Initialize app
app.init();
