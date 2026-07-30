// ============================================
// Analytics Engine
// Data analysis, trends, predictions,
// and performance insights
// ============================================

import { getLast30Days, getLast7Days, getDaysBetween, getToday, addDays } from '../utils/dates.js';
import { average, percentChange } from '../utils/helpers.js';
import { getCompletionRate } from './streakEngine.js';

// --- Trend Calculation ---
export function calculateTrend(dayLogs, habits, days = 30) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(addDays(new Date(), -i));
  }

  return dates.map(date => {
    const log = dayLogs.find(l => l.date === date);
    return {
      date,
      completion: log ? getCompletionRate(log, habits) : 0,
      xp: log ? (log.xpEarned || 0) : 0,
      habits: log ? (log.completedHabits || []).length : 0,
    };
  });
}

// --- Improvement Calculator ---
export function calculateImprovement(dayLogs, habits) {
  const today = getToday();
  const yesterday = addDays(new Date(), -1);

  const todayLog = dayLogs.find(l => l.date === today);
  const yesterdayLog = dayLogs.find(l => l.date === yesterday);

  const todayRate = todayLog ? getCompletionRate(todayLog, habits) * 100 : 0;
  const yesterdayRate = yesterdayLog ? getCompletionRate(yesterdayLog, habits) * 100 : 0;

  return {
    today: todayRate,
    yesterday: yesterdayRate,
    change: todayRate - yesterdayRate,
    percentChange: percentChange(todayRate, yesterdayRate),
  };
}

// --- Weekly Comparison ---
export function compareWeeks(dayLogs, habits) {
  const thisWeekDates = getLast7Days();
  const lastWeekDates = [];
  for (let i = 13; i >= 7; i--) {
    lastWeekDates.push(addDays(new Date(), -i));
  }

  const thisWeekRates = thisWeekDates.map(d => {
    const log = dayLogs.find(l => l.date === d);
    return log ? getCompletionRate(log, habits) * 100 : 0;
  });

  const lastWeekRates = lastWeekDates.map(d => {
    const log = dayLogs.find(l => l.date === d);
    return log ? getCompletionRate(log, habits) * 100 : 0;
  });

  return {
    thisWeek: average(thisWeekRates),
    lastWeek: average(lastWeekRates),
    change: average(thisWeekRates) - average(lastWeekRates),
  };
}

// --- Consistency Score ---
export function calculateConsistency(dayLogs, habits, days = 30) {
  let activeDays = 0;
  for (let i = 0; i < days; i++) {
    const date = addDays(new Date(), -i);
    const log = dayLogs.find(l => l.date === date);
    if (log && getCompletionRate(log, habits) >= 0.5) {
      activeDays++;
    }
  }
  return Math.round((activeDays / days) * 100);
}

// --- Peak Hours Detection ---
export function findPeakHours(focusSessions) {
  const hourCounts = new Array(24).fill(0);
  const hourMinutes = new Array(24).fill(0);

  for (const session of focusSessions) {
    if (session.startTime) {
      const hour = new Date(session.startTime).getHours();
      hourCounts[hour]++;
      hourMinutes[hour] += session.duration || 0;
    }
  }

  // Find top 3 hours
  const ranked = hourCounts.map((count, hour) => ({ hour, count, minutes: hourMinutes[hour] }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 3);

  return ranked;
}

// --- Prediction Engine ---
export function predictGoalCompletion(goal) {
  if (!goal || goal.progress >= goal.target) return null;
  if (goal.dailyProgress === undefined || goal.dailyProgress <= 0) {
    return { daysRemaining: Infinity, onTrack: false };
  }

  const remaining = goal.target - goal.progress;
  const daysRemaining = Math.ceil(remaining / goal.dailyProgress);
  const predictedDate = addDays(new Date(), daysRemaining);
  const onTrack = !goal.deadline || predictedDate <= goal.deadline;

  return { daysRemaining, predictedDate, onTrack };
}

// --- Performance Score ---
export function calculateDailyScore(dayLog, habits, focusSessions = []) {
  if (!dayLog) return 0;

  let score = 0;
  // Habit completion (40%)
  score += getCompletionRate(dayLog, habits) * 40;

  // Check-in completed (20%)
  if (dayLog.checkinCompleted) score += 20;

  // Focus sessions (20%)
  const todaySessions = focusSessions.filter(s => s.date === dayLog.date);
  const focusMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  score += Math.min(focusMinutes / 120, 1) * 20; // Max at 2 hours

  // Mood & Energy (10% each)
  if (dayLog.mood) score += (dayLog.mood / 10) * 10;
  if (dayLog.energy) score += (dayLog.energy / 10) * 10;

  return Math.round(score);
}

// --- Generate Insights ---
export function generateInsights(dayLogs, habits, focusSessions) {
  const insights = [];
  const consistency = calculateConsistency(dayLogs, habits);
  const weekComp = compareWeeks(dayLogs, habits);
  const peakHours = findPeakHours(focusSessions);

  // Consistency insight
  if (consistency >= 80) {
    insights.push({
      icon: '🔥',
      text: `Your consistency is <strong>${consistency}%</strong> over the last 30 days. You're building unstoppable momentum!`,
      type: 'success'
    });
  } else if (consistency >= 50) {
    insights.push({
      icon: '💪',
      text: `Your consistency is <strong>${consistency}%</strong>. Good progress, but there's room to push higher. Aim for 80%+.`,
      type: 'info'
    });
  } else {
    insights.push({
      icon: '⚠️',
      text: `Your consistency is <strong>${consistency}%</strong>. Remember: "You fall to the level of your systems." - James Clear. Let's rebuild.`,
      type: 'warning'
    });
  }

  // Week over week
  if (weekComp.change > 0) {
    insights.push({
      icon: '📈',
      text: `You're <strong>${Math.abs(weekComp.change).toFixed(1)}%</strong> better than last week. The compound effect is working.`,
      type: 'success'
    });
  } else if (weekComp.change < -5) {
    insights.push({
      icon: '📉',
      text: `Performance dipped <strong>${Math.abs(weekComp.change).toFixed(1)}%</strong> from last week. "Don't stop when you're tired. Stop when you're done." - Goggins`,
      type: 'warning'
    });
  }

  // Peak hours
  if (peakHours.length > 0 && peakHours[0].minutes > 0) {
    const h = peakHours[0].hour;
    const label = h < 12 ? `${h || 12} AM` : `${h === 12 ? 12 : h - 12} PM`;
    insights.push({
      icon: '⏰',
      text: `Your peak focus hour is <strong>${label}</strong>. Schedule your hardest tasks here for maximum flow state.`,
      type: 'info'
    });
  }

  // Habit-specific insights
  if (dayLogs.length >= 7) {
    const last7 = getLast7Days();
    const habitScores = {};
    for (const habit of habits) {
      let completed = 0;
      for (const date of last7) {
        const log = dayLogs.find(l => l.date === date);
        if (log && log.completedHabits && log.completedHabits.includes(habit.id)) {
          completed++;
        }
      }
      habitScores[habit.id] = { name: habit.name, rate: completed / 7 };
    }

    const weakest = Object.values(habitScores).sort((a, b) => a.rate - b.rate)[0];
    if (weakest && weakest.rate < 0.5) {
      insights.push({
        icon: '🎯',
        text: `<strong>${weakest.name}</strong> is your weakest habit (${Math.round(weakest.rate * 100)}% this week). Focus on making it easier to start. Stack it after an existing habit.`,
        type: 'warning'
      });
    }
  }

  return insights;
}

// --- Habit Streaks ---
export function getHabitStreaks(dayLogs, habits) {
  return habits.map(habit => {
    let streak = 0;
    let date = getToday();

    // Check if completed today
    const todayLog = dayLogs.find(l => l.date === date);
    const todayDone = todayLog && todayLog.completedHabits && todayLog.completedHabits.includes(habit.id);

    if (!todayDone) {
      date = addDays(new Date(), -1);
    }

    while (true) {
      const dateStr = typeof date === 'string' ? date : addDays(date, 0);
      const log = dayLogs.find(l => l.date === dateStr);
      if (log && log.completedHabits && log.completedHabits.includes(habit.id)) {
        streak++;
        date = addDays(new Date(dateStr), -1);
      } else {
        break;
      }
      if (streak > 9999) break;
    }

    return { ...habit, streak };
  });
}

// Peak productivity hour detection


// 7-day rolling average completion


// Numeric consistency rating label


export function buildCorrelationMatrix(logs) { return {}; }
