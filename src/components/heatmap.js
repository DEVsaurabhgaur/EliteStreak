// ============================================
// Heatmap Component (GitHub-style)
// ============================================

import { getLast365Days, getMonthName } from '../utils/dates.js';

export function renderHeatmap(container, dayLogs, habits) {
  const days = getLast365Days();

  // Calculate intensity for each day
  const dayData = days.map(date => {
    const log = dayLogs.find(l => l.date === date);
    if (!log || !log.completedHabits) return { date, level: 0, count: 0 };
    const rate = habits.length > 0 ? log.completedHabits.length / habits.length : 0;
    let level = 0;
    if (rate > 0) level = 1;
    if (rate >= 0.4) level = 2;
    if (rate >= 0.7) level = 3;
    if (rate >= 1.0) level = 4;
    return { date, level, count: log.completedHabits.length };
  });

  // Build grid — 7 rows (Mon-Sun) × ~53 weeks
  const firstDate = new Date(days[0]);
  const firstDayOfWeek = firstDate.getDay(); // 0=Sun
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Mon=0

  let html = '<div class="heatmap-container">';
  html += '<div class="heatmap-grid" style="grid-template-rows: repeat(7, 1fr);">';

  // Pad the start with empty cells
  for (let i = 0; i < offset; i++) {
    html += '<div class="heatmap-cell" style="visibility:hidden"></div>';
  }

  // Render days
  for (const day of dayData) {
    const d = new Date(day.date);
    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const habitLabel = `${day.count} habit${day.count !== 1 ? 's' : ''} completed`;
    html += `<div class="heatmap-cell l${day.level}"
                  data-tooltip="${dateLabel}: ${habitLabel}"
                  data-date="${day.date}"></div>`;
  }

  html += '</div>';

  // Month labels
  html += '<div class="heatmap-months">';
  const months = new Set();
  let lastMonth = -1;
  for (const date of days) {
    const m = new Date(date).getMonth();
    if (m !== lastMonth) {
      months.add(getMonthName(m));
      lastMonth = m;
    }
  }
  for (const m of months) {
    html += `<span>${m}</span>`;
  }
  html += '</div>';

  // Legend
  html += `
    <div class="heatmap-legend">
      <span>Less</span>
      <div class="legend-cell" style="background: var(--bg-elevated)"></div>
      <div class="legend-cell l1" style="background: rgba(0, 255, 136, 0.15)"></div>
      <div class="legend-cell l2" style="background: rgba(0, 255, 136, 0.3)"></div>
      <div class="legend-cell l3" style="background: rgba(0, 255, 136, 0.5)"></div>
      <div class="legend-cell l4" style="background: var(--neon-green)"></div>
      <span>More</span>
    </div>
  `;

  html += '</div>';
  container.innerHTML = html;
}
