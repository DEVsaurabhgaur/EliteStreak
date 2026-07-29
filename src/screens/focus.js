// ============================================
// Focus Arena Screen (Deep Work Timer)
// ============================================

import { store } from '../core/store.js';
import { calculateXP } from '../core/xpEngine.js';
import { getStreakMultiplier, calculateStreak } from '../core/streakEngine.js';
import { showToast, showXPToast } from '../components/toast.js';
import { spawnParticles } from '../components/particles.js';
import { generateId, formatDuration } from '../utils/helpers.js';
import { getToday, formatTime } from '../utils/dates.js';

let timerInterval = null;
let timerState = {
  running: false,
  seconds: 0,
  totalSeconds: 25 * 60,
  preset: 25,
};

export async function renderFocus(container, app) {
  const user = await store.getUser();
  const focusSessions = await store.getFocusSessions();
  const habits = await store.getHabits();
  const dayLogs = await store.getAllDayLogs();

  const todaySessions = focusSessions.filter(s => s.date === getToday());
  const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalMinutes = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const sessionCount = todaySessions.length;

  const presets = [
    { label: '25m', minutes: 25 },
    { label: '50m', minutes: 50 },
    { label: '90m', minutes: 90 },
    { label: '120m', minutes: 120 },
  ];

  function formatTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getProgress() {
    if (timerState.totalSeconds === 0) return 0;
    return ((timerState.totalSeconds - timerState.seconds) / timerState.totalSeconds) * 100;
  }

  const circumference = 2 * Math.PI * 130;

  function render() {
    const progressPercent = getProgress();
    const dashOffset = circumference - (progressPercent / 100) * circumference;

    container.innerHTML = `
      <div class="focus-screen screen-enter">
        <div class="screen-header" style="text-align: center;">
          <h1>Focus Arena</h1>
          <p class="subtitle">"The ability to perform deep work is becoming increasingly rare and increasingly valuable." — Cal Newport</p>
        </div>

        <!-- Timer -->
        <div class="focus-timer-section">
          <div class="timer-ring">
            <svg viewBox="0 0 280 280">
              <circle class="timer-track" cx="140" cy="140" r="130" />
              <circle class="timer-progress" cx="140" cy="140" r="130"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${dashOffset}" />
            </svg>
            <div class="timer-display">
              <div class="timer-time">${formatTimer(timerState.seconds)}</div>
              <div class="timer-label">${timerState.running ? 'FOCUSING' : 'READY'}</div>
            </div>
          </div>

          <!-- Controls -->
          <div class="timer-controls">
            ${timerState.running ? `
              <button class="timer-btn pause" id="timer-pause">⏸</button>
            ` : `
              <button class="timer-btn play" id="timer-start">▶</button>
            `}
            <button class="timer-btn reset" id="timer-reset">⟲</button>
          </div>

          <!-- Presets -->
          <div class="timer-presets">
            ${presets.map(p => `
              <button class="preset-btn ${timerState.preset === p.minutes ? 'active' : ''}"
                      data-minutes="${p.minutes}">${p.label}</button>
            `).join('')}
          </div>
        </div>

        <!-- Stats -->
        <div class="focus-stats-row stagger">
          <div class="stat-card xp" style="text-align: center;">
            <div class="stat-value" style="color: var(--neon-green);">${todayMinutes}</div>
            <div class="stat-label">Minutes Today</div>
          </div>
          <div class="stat-card streak" style="text-align: center;">
            <div class="stat-value" style="color: var(--ice-blue);">${sessionCount}</div>
            <div class="stat-label">Sessions Today</div>
          </div>
          <div class="stat-card level" style="text-align: center;">
            <div class="stat-value" style="color: var(--electric-purple);">${Math.round(totalMinutes / 60)}h</div>
            <div class="stat-label">Total Deep Work</div>
          </div>
        </div>

        <!-- Today's Sessions -->
        <div class="focus-history">
          <h3>Today's Sessions</h3>
          ${todaySessions.length > 0 ? todaySessions.sort((a, b) => b.startTime?.localeCompare(a.startTime)).map(session => `
            <div class="session-item">
              <span class="session-time">${session.startTime ? formatTime(session.startTime) : '--'}</span>
              <span class="session-duration">${session.duration}m</span>
              <span class="session-type">${session.type || 'Deep Work'}</span>
              <span class="session-score" style="color: var(--xp-gold);">+${session.xpEarned || 0} XP</span>
            </div>
          `).join('') : `
            <div class="empty-state" style="padding: var(--space-6);">
              <p style="color: var(--text-tertiary);">No sessions yet. Start your first deep work session!</p>
            </div>
          `}
        </div>
      </div>
    `;

    // Event handlers
    container.querySelector('#timer-start')?.addEventListener('click', startTimer);
    container.querySelector('#timer-pause')?.addEventListener('click', pauseTimer);
    container.querySelector('#timer-reset')?.addEventListener('click', resetTimer);

    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (timerState.running) return;
        const minutes = parseInt(btn.dataset.minutes);
        timerState.preset = minutes;
        timerState.totalSeconds = minutes * 60;
        timerState.seconds = minutes * 60;
        render();
      });
    });
  }

  function startTimer() {
    if (timerState.running) return;
    timerState.running = true;
    timerState.startTime = new Date().toISOString();

    if (timerState.seconds === 0) {
      timerState.seconds = timerState.totalSeconds;
    }

    timerInterval = setInterval(() => {
      timerState.seconds--;
      updateTimerDisplay();

      if (timerState.seconds <= 0) {
        clearInterval(timerInterval);
        timerState.running = false;
        completeSession();
      }
    }, 1000);

    render();
  }

  function pauseTimer() {
    timerState.running = false;
    clearInterval(timerInterval);
    render();
  }

  function resetTimer() {
    timerState.running = false;
    clearInterval(timerInterval);
    timerState.seconds = timerState.totalSeconds;
    render();
  }

  function updateTimerDisplay() {
    const timeEl = container.querySelector('.timer-time');
    const progressEl = container.querySelector('.timer-progress');
    const labelEl = container.querySelector('.timer-label');

    if (timeEl) {
      const m = Math.floor(timerState.seconds / 60);
      const s = timerState.seconds % 60;
      timeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    if (progressEl) {
      const progressPercent = getProgress();
      const dashOffset = circumference - (progressPercent / 100) * circumference;
      progressEl.setAttribute('stroke-dashoffset', dashOffset);
    }
  }

  async function completeSession() {
    const duration = timerState.preset;
    const currentStreak = calculateStreak(dayLogs, habits);
    const multiplier = getStreakMultiplier(currentStreak);

    let xpAction = 'DEEP_WORK_25';
    if (duration >= 90) xpAction = 'DEEP_WORK_90';
    else if (duration >= 50) xpAction = 'DEEP_WORK_50';

    const xpEarned = calculateXP(xpAction, multiplier);

    const session = {
      id: generateId(),
      date: getToday(),
      startTime: timerState.startTime,
      duration,
      type: 'Deep Work',
      xpEarned,
    };

    await store.saveFocusSession(session);

    // Update user XP
    const u = await store.getUser();
    u.totalXpEarned = (u.totalXpEarned || 0) + xpEarned;
    await store.saveUser(u);

    showToast({
      title: '🏁 Session Complete!',
      message: `${duration} minutes of deep work. +${xpEarned} XP`,
      type: 'xp',
      icon: '🧠',
      duration: 5000
    });

    const btn = container.querySelector('.timer-btn.play');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      spawnParticles(rect.left + rect.width / 2, rect.top, 25, ['#00d4ff', '#7c3aed', '#00ff88']);
    }

    timerState.seconds = timerState.totalSeconds;

    // Re-render to update stats
    renderFocus(container, app);
  }

  render();
}

// Cleanup on navigation
export function cleanupFocus() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

// Session completion alert

