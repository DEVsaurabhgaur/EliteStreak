// ============================================
// Battle Arena Screen
// RPG gamification hub
// ============================================

import { store } from '../core/store.js';
import { getProgressToNextLevel, getRankForLevel, getNextRank, RANKS } from '../core/xpEngine.js';
import { calculateStreak, getStreakMultiplier, getBestStreak } from '../core/streakEngine.js';
import { ACHIEVEMENTS, SKILL_TREE, checkAchievements } from '../core/achievementEngine.js';
import { calculateConsistency } from '../core/analyticsEngine.js';
import { formatNumber } from '../utils/helpers.js';

export async function renderBattle(container, app) {
  const user = await store.getUser();
  const habits = await store.getHabits();
  const dayLogs = await store.getAllDayLogs();
  const unlockedAchievements = await store.getAchievements();
  const focusSessions = await store.getFocusSessions();

  const currentStreak = calculateStreak(dayLogs, habits);
  const bestStreak = getBestStreak(dayLogs, habits);
  const multiplier = getStreakMultiplier(currentStreak);
  const progress = getProgressToNextLevel(user.totalXpEarned || 0);
  const rank = getRankForLevel(progress.level);
  const nextRank = getNextRank(progress.level);
  const consistency = calculateConsistency(dayLogs, habits);

  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const perfectDays = dayLogs.filter(l => l.completedHabits && l.completedHabits.length === habits.length && habits.length > 0).length;
  const unlockedIds = unlockedAchievements.map(a => a.id);
  const goalsCompleted = (await store.getGoals()).filter(g => g.progress >= g.target).length;

  // Character stats
  const stats = {
    discipline: Math.min(Math.round(consistency * 1.0), 100),
    focus: Math.min(Math.round(totalFocusMinutes / 60), 100),
    consistency,
    growth: Math.min(progress.level, 100),
    resilience: Math.min(currentStreak, 100),
  };

  // Boss battles (weekly challenges)
  const bossBattles = [
    {
      name: '🐉 The Procrastination Dragon',
      description: 'Complete ALL habits for 7 consecutive days',
      reward: 500,
      progress: Math.min(currentStreak, 7),
      target: 7,
    },
    {
      name: '🧠 The Deep Focus Titan',
      description: 'Accumulate 10 hours of deep work this week',
      reward: 400,
      progress: Math.min(Math.round(totalFocusMinutes / 60), 10),
      target: 10,
    },
    {
      name: '💀 The 40% Rule Challenge',
      description: 'Score 90%+ on 5 days this week (Goggins: you\'re only at 40%)',
      reward: 600,
      progress: Math.min(perfectDays, 5),
      target: 5,
    },
  ];

  container.innerHTML = `
    <div class="battle-screen screen-enter">
      <div class="screen-header">
        <h1>Battle Arena</h1>
        <p class="subtitle">Level up your character through discipline and consistency</p>
      </div>

      <!-- Character Profile -->
      <div class="character-profile">
        <div class="character-avatar">${user.avatar || '⚡'}</div>
        <div class="character-info">
          <h2>${user.name}</h2>
          <div class="character-title">${rank.icon} ${rank.name} · Level ${progress.level}</div>

          <!-- XP Bar -->
          <div class="xp-bar-container" style="margin-bottom: var(--space-4);">
            <div class="xp-bar-header">
              <span class="xp-bar-level">LVL ${progress.level}</span>
              <span class="xp-bar-text">${progress.currentXP} / ${progress.neededXP} XP</span>
            </div>
            <div class="xp-bar-track">
              <div class="xp-bar-fill" style="width: ${progress.percent}%"></div>
            </div>
          </div>

          <div class="character-stats-grid">
            <div class="char-stat">
              <div class="char-stat-value">${stats.discipline}</div>
              <div class="char-stat-label">Discipline</div>
            </div>
            <div class="char-stat">
              <div class="char-stat-value">${stats.focus}</div>
              <div class="char-stat-label">Focus</div>
            </div>
            <div class="char-stat">
              <div class="char-stat-value">${stats.consistency}</div>
              <div class="char-stat-label">Consistency</div>
            </div>
            <div class="char-stat">
              <div class="char-stat-value">${stats.growth}</div>
              <div class="char-stat-label">Growth</div>
            </div>
            <div class="char-stat">
              <div class="char-stat-value">${stats.resilience}</div>
              <div class="char-stat-label">Resilience</div>
            </div>
          </div>
        </div>
        <div class="character-rank">
          <span class="rank-icon">${rank.icon}</span>
          <div class="rank-name">${rank.name}</div>
          <div class="rank-level">Level ${progress.level}</div>
          ${nextRank ? `<div style="margin-top: var(--space-2); font-size: var(--fs-xs); color: var(--text-tertiary);">Next: ${nextRank.icon} ${nextRank.name} at Lv.${nextRank.minLevel}</div>` : ''}
        </div>
      </div>

      <!-- Battle Grid -->
      <div class="battle-grid">
        <!-- Skill Tree -->
        <div class="skill-tree-card">
          <h3>🌳 Skill Tree</h3>
          <div class="skill-tree-list">
            ${SKILL_TREE.map(skill => {
              const unlocked = currentStreak >= skill.requiredStreak || skill.unlocked;
              return `
                <div class="skill-node ${unlocked ? 'unlocked' : 'locked'}">
                  <div class="skill-icon">${skill.icon}</div>
                  <div class="skill-info">
                    <h5>${skill.name}</h5>
                    <p>${skill.description}</p>
                  </div>
                  <div class="skill-req">${unlocked ? '✅' : `${skill.requiredStreak}d`}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Achievements -->
        <div class="achievements-card">
          <h3>🏆 Achievements (${unlockedIds.length}/${ACHIEVEMENTS.length})</h3>
          <div class="achievement-grid">
            ${ACHIEVEMENTS.map(ach => {
              const unlocked = unlockedIds.includes(ach.id);
              return `
                <div class="achievement-badge ${unlocked ? '' : 'locked'}" data-tooltip="${ach.name}: ${ach.description}">
                  <span class="badge-icon">${ach.icon}</span>
                  <span class="badge-name">${ach.name}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Boss Battles -->
        <div class="boss-battle-card">
          <h3>⚔️ Boss Battles</h3>
          <p class="boss-subtitle">Weekly challenges that push your limits. "When you think you're done, you're only at 40%." — Goggins</p>
          ${bossBattles.map(boss => `
            <div class="boss-challenge">
              <div class="boss-icon">${boss.name.split(' ')[0]}</div>
              <div class="boss-info">
                <h4>${boss.name.split(' ').slice(1).join(' ')}</h4>
                <p>${boss.description}</p>
                <div class="progress-bar" style="margin-top: var(--space-2); max-width: 300px;">
                  <div class="fill" style="width: ${(boss.progress / boss.target) * 100}%; ${boss.progress >= boss.target ? 'background: var(--xp-gold)' : ''}"></div>
                </div>
                <span style="font-size: var(--fs-xs); color: var(--text-tertiary); font-family: var(--font-mono);">${boss.progress}/${boss.target}</span>
              </div>
              <div class="boss-reward">
                <div class="xp-amount">${boss.reward}</div>
                <div style="font-size: var(--fs-xs); color: var(--text-secondary);">XP</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="grid-3" style="margin-top: var(--space-6);">
        <div class="card-flat" style="text-align: center;">
          <div class="stat-value" style="color: var(--hot-orange);">${currentStreak}</div>
          <div class="stat-label">Current Streak</div>
        </div>
        <div class="card-flat" style="text-align: center;">
          <div class="stat-value" style="color: var(--neon-green);">${bestStreak}</div>
          <div class="stat-label">Best Streak</div>
        </div>
        <div class="card-flat" style="text-align: center;">
          <div class="stat-value" style="color: var(--xp-gold);">${formatNumber(user.totalXpEarned || 0)}</div>
          <div class="stat-label">Total XP</div>
        </div>
      </div>
    </div>
  `;
}

// Level rank progress readout


// Pulse glow CSS effect


// Boss Battle XP bounty badge


// Skill node hover audio

