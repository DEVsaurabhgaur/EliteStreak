// ============================================
// Analytics & Intelligence Screen
// ============================================

import { store } from '../core/store.js';
import { calculateTrend, calculateConsistency, compareWeeks, findPeakHours, generateInsights, getHabitStreaks } from '../core/analyticsEngine.js';
import { calculateStreak, getStreakMultiplier, getBestStreak, getCompletionRate } from '../core/streakEngine.js';
import { getLast30Days, getLast7Days, getDayOfWeek } from '../utils/dates.js';
import { formatMinutes } from '../utils/helpers.js';

export async function renderAnalytics(container, app) {
  const habits = await store.getHabits();
  const dayLogs = await store.getAllDayLogs();
  const focusSessions = await store.getFocusSessions();

  const consistency = calculateConsistency(dayLogs, habits);
  const weekComp = compareWeeks(dayLogs, habits);
  const currentStreak = calculateStreak(dayLogs, habits);
  const bestStreak = getBestStreak(dayLogs, habits);
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const insights = generateInsights(dayLogs, habits, focusSessions);
  const habitStreaks = getHabitStreaks(dayLogs, habits);

  // Weekly breakdown
  const last7 = getLast7Days();
  const weeklyData = last7.map(date => {
    const log = dayLogs.find(l => l.date === date);
    return {
      date,
      day: getDayOfWeek(date),
      completion: log ? Math.round(getCompletionRate(log, habits) * 100) : 0,
      habits: log ? (log.completedHabits || []).length : 0,
    };
  });

  container.innerHTML = `
    <div class="analytics-screen screen-enter">
      <div class="screen-header">
        <h1>Analytics & Intelligence</h1>
        <p class="subtitle">Data-driven insights to optimize your performance</p>
      </div>

      <!-- Summary Cards -->
      <div class="analytics-summary stagger">
        <div class="stat-card score" style="animation-delay: 0ms;">
          <div class="stat-icon">📊</div>
          <div class="stat-value" style="color: var(--neon-green);">${consistency}%</div>
          <div class="stat-label">30-Day Consistency</div>
        </div>
        <div class="stat-card streak" style="animation-delay: 80ms;">
          <div class="stat-icon">📈</div>
          <div class="stat-value" style="color: ${weekComp.change >= 0 ? 'var(--neon-green)' : 'var(--danger-red)'}">
            ${weekComp.change >= 0 ? '+' : ''}${weekComp.change.toFixed(1)}%
          </div>
          <div class="stat-label">Week over Week</div>
        </div>
        <div class="stat-card xp" style="animation-delay: 160ms;">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value" style="color: var(--ice-blue);">${formatMinutes(totalFocusMinutes)}</div>
          <div class="stat-label">Total Focus Time</div>
        </div>
        <div class="stat-card level" style="animation-delay: 240ms;">
          <div class="stat-icon">🔥</div>
          <div class="stat-value" style="color: var(--hot-orange);">${currentStreak}/${bestStreak}</div>
          <div class="stat-label">Current / Best Streak</div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="analytics-charts">
        <!-- Weekly Performance -->
        <div class="analytics-card" style="animation-delay: 100ms;">
          <h3>Weekly Performance</h3>
          <div class="chart-container" style="height: 240px;">
            <canvas id="weekly-chart"></canvas>
          </div>
        </div>

        <!-- Habit Streaks -->
        <div class="analytics-card" style="animation-delay: 150ms;">
          <h3>Habit Streaks</h3>
          <div class="chart-container" style="height: 240px;">
            <canvas id="habit-streaks-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Insights & Habit Table -->
      <div class="analytics-charts">
        <!-- AI Insights -->
        <div class="analytics-card" style="animation-delay: 200ms;">
          <h3>🧠 AI Insights</h3>
          <div class="insights-list">
            ${insights.map(insight => `
              <div class="insight-item">
                <span class="insight-icon">${insight.icon}</span>
                <div class="insight-text">${insight.text}</div>
              </div>
            `).join('')}
            ${insights.length === 0 ? '<p style="color: var(--text-tertiary); font-size: var(--fs-sm);">Keep tracking to unlock insights! Need at least 7 days of data.</p>' : ''}
          </div>
        </div>

        <!-- Habit Breakdown -->
        <div class="analytics-card" style="animation-delay: 250ms;">
          <h3>Habit Breakdown (7-day)</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${habitStreaks.sort((a, b) => b.streak - a.streak).map(habit => {
              // Calculate 7-day completion
              let completed = 0;
              for (const date of last7) {
                const log = dayLogs.find(l => l.date === date);
                if (log && log.completedHabits && log.completedHabits.includes(habit.id)) completed++;
              }
              const rate = Math.round((completed / 7) * 100);
              return `
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                  <span style="width: 30px; text-align: center;">${habit.icon}</span>
                  <span style="flex: 1; font-size: var(--fs-sm);">${habit.name}</span>
                  <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--hot-orange); min-width: 40px;">${habit.streak}d</span>
                  <div style="width: 100px;">
                    <div class="progress-bar" style="height: 6px;">
                      <div class="fill" style="width: ${rate}%; ${rate >= 80 ? '' : rate >= 50 ? 'background: linear-gradient(90deg, var(--hot-orange), #ff9f43);' : 'background: linear-gradient(90deg, var(--danger-red), #ff6b6b);'}"></div>
                    </div>
                  </div>
                  <span style="font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-secondary); min-width: 35px; text-align: right;">${rate}%</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Render charts
  renderWeeklyChart(container.querySelector('#weekly-chart'), weeklyData);
  renderHabitStreaksChart(container.querySelector('#habit-streaks-chart'), habitStreaks);
}

function renderWeeklyChart(canvas, weeklyData) {
  if (!canvas) return;
  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables);
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: weeklyData.map(d => d.day),
        datasets: [{
          label: 'Completion %',
          data: weeklyData.map(d => d.completion),
          backgroundColor: weeklyData.map(d =>
            d.completion >= 80 ? 'rgba(0, 255, 136, 0.6)' :
            d.completion >= 50 ? 'rgba(255, 107, 53, 0.6)' :
            'rgba(255, 51, 102, 0.4)'
          ),
          borderColor: weeklyData.map(d =>
            d.completion >= 80 ? '#00ff88' :
            d.completion >= 50 ? '#ff6b35' :
            '#ff3366'
          ),
          borderWidth: 1.5,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#555566' } },
          y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#555566', callback: v => v + '%' } }
        }
      }
    });
  });
}

function renderHabitStreaksChart(canvas, habitStreaks) {
  if (!canvas) return;
  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables);
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    const sorted = [...habitStreaks].sort((a, b) => b.streak - a.streak);

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: sorted.map(h => h.icon + ' ' + h.name),
        datasets: [{
          label: 'Streak Days',
          data: sorted.map(h => h.streak),
          backgroundColor: 'rgba(255, 107, 53, 0.5)',
          borderColor: '#ff6b35',
          borderWidth: 1.5,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(18, 18, 30, 0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#555566' } },
          y: { grid: { display: false }, ticks: { color: '#888', font: { size: 11 } } }
        }
      }
    });
  });
}

// Week-over-week performance color delta


// Chart.js custom hover styling


// Streak days counter in breakdown

