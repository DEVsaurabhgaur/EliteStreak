// ============================================
// Dashboard / Command Center Screen
// ============================================

import { store } from '../core/store.js';
import { getProgressToNextLevel, getRankForLevel, calculateXP } from '../core/xpEngine.js';
import { calculateStreak, getStreakMultiplier, getCompletionRate, isStreakInDanger } from '../core/streakEngine.js';
import { calculateImprovement, calculateConsistency, calculateDailyScore } from '../core/analyticsEngine.js';
import { getDailyQuote } from '../core/quotes.js';
import { renderHeatmap } from '../components/heatmap.js';
import { showToast, showXPToast } from '../components/toast.js';
import { celebrateHabitComplete, celebratePerfectDay } from '../components/particles.js';
import { getToday, formatDateDisplay, getLast30Days } from '../utils/dates.js';
import { formatNumber, animateValue } from '../utils/helpers.js';

export async function renderDashboard(container, app) {
  const user = await store.getUser();
  const habits = await store.getHabits();
  const dayLogs = await store.getAllDayLogs();
  const focusSessions = await store.getFocusSessions();
  const today = getToday();

  let todayLog = await store.getDayLog(today);
  if (!todayLog) {
    todayLog = { date: today, completedHabits: [], xpEarned: 0 };
  }

  const currentStreak = calculateStreak(dayLogs, habits);
  const multiplier = getStreakMultiplier(currentStreak);
  const progress = getProgressToNextLevel(user.totalXpEarned || 0);
  const rank = getRankForLevel(progress.level);
  const improvement = calculateImprovement(dayLogs, habits);
  const consistency = calculateConsistency(dayLogs, habits);
  const dailyScore = calculateDailyScore(todayLog, habits, focusSessions);
  const quote = getDailyQuote();
  const completionRate = habits.length > 0
    ? Math.round((todayLog.completedHabits.length / habits.length) * 100)
    : 0;

  const dangerClass = isStreakInDanger(dayLogs, habits) ? 'badge-red' : 'badge-green';

  container.innerHTML = `
    <div class="dashboard screen-enter">
      <div class="screen-header flex justify-between items-center">
        <div>
          <h1>Command Center</h1>
          <p class="subtitle">${formatDateDisplay(new Date())} · Level ${progress.level} ${rank.icon} ${rank.name}</p>
        </div>
        <div class="flex gap-3 items-center">
          <span class="badge ${dangerClass}">
            ${isStreakInDanger(dayLogs, habits) ? '⚠️ Streak in Danger' : '✅ On Track'}
          </span>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="dash-stats-row stagger">
        <div class="stat-card streak" style="animation-delay: 0ms">
          <div class="stat-icon">🔥</div>
          <div class="stat-value" style="background: linear-gradient(135deg, var(--hot-orange), #ff9f43); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${currentStreak}</div>
          <div class="stat-label">Day Streak</div>
          <div class="stat-meta">
            <span class="streak-multiplier">${multiplier}× XP</span>
          </div>
        </div>
        <div class="stat-card xp" style="animation-delay: 80ms">
          <div class="stat-icon">⭐</div>
          <div class="stat-value" style="color: var(--xp-gold)">${formatNumber(todayLog.xpEarned || 0)}</div>
          <div class="stat-label">Today's XP</div>
          <div class="stat-meta">
            <span class="stat-change positive">Total: ${formatNumber(user.totalXpEarned || 0)}</span>
          </div>
        </div>
        <div class="stat-card level" style="animation-delay: 160ms">
          <div class="stat-icon">${rank.icon}</div>
          <div class="stat-value" style="color: var(--electric-purple)">${progress.level}</div>
          <div class="stat-label">Level</div>
          <div class="stat-meta" style="flex-direction: column; align-items: flex-start; gap: 4px; width: 100%;">
            <div class="progress-bar progress-bar-gold" style="height: 6px;">
              <div class="fill" style="width: ${progress.percent}%"></div>
            </div>
            <span style="font-size: var(--fs-xs); color: var(--text-tertiary); font-family: var(--font-mono);">${progress.currentXP}/${progress.neededXP} XP</span>
          </div>
        </div>
        <div class="stat-card score" style="animation-delay: 240ms">
          <div class="stat-icon">📈</div>
          <div class="stat-value" style="color: var(--neon-green)">${dailyScore}</div>
          <div class="stat-label">Daily Score</div>
          <div class="stat-meta">
            <span class="stat-change ${improvement.change >= 0 ? 'positive' : 'negative'}">
              ${improvement.change >= 0 ? '↑' : '↓'} ${Math.abs(improvement.change).toFixed(0)}% vs yesterday
            </span>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="dash-main-grid">
        <!-- Heatmap -->
        <div class="dash-heatmap-card">
          <div class="flex justify-between items-center">
            <div>
              <h3>Contribution Map</h3>
              <p class="subtitle">${consistency}% consistency over 30 days</p>
            </div>
          </div>
          <div id="dashboard-heatmap"></div>
        </div>

        <!-- Right Panel -->
        <div class="dash-right-panel">
          <!-- Quick Actions -->
          <div class="quick-actions">
            <h4>⚡ Quick Actions</h4>
            <div class="actions-grid">
              <button class="quick-action-btn" data-action="focus">
                <span class="action-icon">⏱️</span>
                Focus Session
              </button>
              <button class="quick-action-btn" data-action="checkin">
                <span class="action-icon">📝</span>
                Check In
              </button>
              <button class="quick-action-btn" data-action="goals">
                <span class="action-icon">🎯</span>
                View Goals
              </button>
              <button class="quick-action-btn" data-action="analytics">
                <span class="action-icon">📊</span>
                Analytics
              </button>
            </div>
          </div>

          <!-- Today's Habits -->
          <div class="today-habits">
            <h4>
              <span>Today's Habits</span>
              <span class="completion-rate">${completionRate}%</span>
            </h4>
            <div class="habits-list" id="habits-list">
              ${habits.map(habit => {
                const completed = todayLog.completedHabits.includes(habit.id);
                return `
                  <div class="habit-item ${completed ? 'done' : ''}" data-habit-id="${habit.id}">
                    <div class="habit-check ${completed ? 'completed' : ''}" data-habit-toggle="${habit.id}"></div>
                    <span class="habit-name">${habit.icon} ${habit.name}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="dash-bottom-row">
        <!-- Performance Chart -->
        <div class="dash-chart-card">
          <h3>30-Day Performance</h3>
          <div class="chart-container">
            <canvas id="performance-chart"></canvas>
          </div>
        </div>

        <!-- Quote -->
        <div class="dash-quote-card">
          <div class="quote-text">"${quote.text}"</div>
          <div class="quote-author">— ${quote.author}</div>
          <div class="quote-book">${quote.book}</div>
        </div>
      </div>
    </div>
  `;

  // Render heatmap
  const heatmapEl = container.querySelector('#dashboard-heatmap');
  if (heatmapEl) renderHeatmap(heatmapEl, dayLogs, habits);

  // Render chart
  renderPerformanceChart(container.querySelector('#performance-chart'), dayLogs, habits);

  // Quick action handlers
  container.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => app.navigate(btn.dataset.action));
  });

  // Habit toggle handlers
  container.querySelectorAll('[data-habit-toggle]').forEach(el => {
    el.addEventListener('click', async (e) => {
      const habitId = el.dataset.habitToggle;
      let log = await store.getDayLog(today);
      if (!log) log = { date: today, completedHabits: [], xpEarned: 0 };

      const idx = log.completedHabits.indexOf(habitId);
      let xpGained = 0;

      if (idx === -1) {
        log.completedHabits.push(habitId);
        xpGained = calculateXP('HABIT_COMPLETE', multiplier);
        log.xpEarned = (log.xpEarned || 0) + xpGained;

        // Update user XP
        const u = await store.getUser();
        u.totalXpEarned = (u.totalXpEarned || 0) + xpGained;
        const oldLevel = getProgressToNextLevel(u.totalXpEarned - xpGained).level;
        const newLevel = getProgressToNextLevel(u.totalXpEarned).level;
        await store.saveUser(u);

        // Check for perfect day
        if (log.completedHabits.length === habits.length) {
          const perfectXP = calculateXP('PERFECT_DAY', multiplier);
          log.xpEarned += perfectXP;
          u.totalXpEarned += perfectXP;
          await store.saveUser(u);
          showToast({ title: '🏆 PERFECT DAY!', message: `+${perfectXP} XP bonus!`, type: 'xp', icon: '💯' });
          setTimeout(() => celebratePerfectDay(), 300);
        }

        // All habits bonus
        if (log.completedHabits.length === habits.length) {
          const allXP = calculateXP('ALL_HABITS_COMPLETE', multiplier);
          log.xpEarned += allXP;
          u.totalXpEarned += allXP;
          await store.saveUser(u);
        }

        showXPToast(xpGained);
        celebrateHabitComplete(el);

        // Level up notification
        if (newLevel > oldLevel) {
          const { showLevelUpToast } = await import('../components/toast.js');
          const { celebrateLevelUp } = await import('../components/particles.js');
          const newRank = getRankForLevel(newLevel);
          showLevelUpToast(newLevel, newRank);
          setTimeout(() => celebrateLevelUp(), 200);
        }
      } else {
        log.completedHabits.splice(idx, 1);
      }

      await store.saveDayLog(log);

      // Re-render
      renderDashboard(container, app);
    });
  });
}

function renderPerformanceChart(canvas, dayLogs, habits) {
  if (!canvas) return;

  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables);

    const last30 = getLast30Days();
    const data = last30.map(date => {
      const log = dayLogs.find(l => l.date === date);
      return log ? Math.round(getCompletionRate(log, habits) * 100) : 0;
    });

    const labels = last30.map(d => {
      const date = new Date(d);
      return `${date.getDate()}`;
    });

    // Destroy existing chart
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Completion %',
          data,
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0, 255, 136, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#00ff88',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(18, 18, 30, 0.95)',
            titleColor: '#e8e8f0',
            bodyColor: '#00ff88',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (ctx) => `${ctx.parsed.y}% completed`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
            ticks: { color: '#555566', font: { size: 10 } },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
            ticks: {
              color: '#555566',
              font: { size: 10 },
              callback: (v) => v + '%',
              stepSize: 25,
            },
          }
        }
      }
    });
  });
}

// Tooltip annotations


// Quote author credit citation


// Quick action icon scaling

