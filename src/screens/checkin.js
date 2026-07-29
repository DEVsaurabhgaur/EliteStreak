// ============================================
// Daily Check-In Screen (Accountability Mirror)
// ============================================

import { store } from '../core/store.js';
import { calculateXP } from '../core/xpEngine.js';
import { getStreakMultiplier, calculateStreak } from '../core/streakEngine.js';
import { showToast, showXPToast } from '../components/toast.js';
import { getToday } from '../utils/dates.js';

export async function renderCheckIn(container, app) {
  const user = await store.getUser();
  const habits = await store.getHabits();
  const dayLogs = await store.getAllDayLogs();

  let todayLog = await store.getDayLog(getToday());
  if (!todayLog) {
    todayLog = {
      date: getToday(),
      completedHabits: [],
      xpEarned: 0,
      mits: ['', '', ''],
      mood: 5,
      energy: 5,
      motivation: 5,
      wins: '',
      losses: '',
      reflection: '',
      resistance: 5,
      accountability: {},
      checkinCompleted: false,
    };
  }

  // Ensure defaults
  if (!todayLog.mits) todayLog.mits = ['', '', ''];
  if (!todayLog.accountability) todayLog.accountability = {};

  function render() {
    container.innerHTML = `
      <div class="checkin-screen screen-enter">
        <div class="screen-header" style="text-align: center;">
          <h1>Daily Check-In</h1>
          <p class="subtitle">"The only person who was going to turn my life around was me." — David Goggins</p>
        </div>

        ${todayLog.checkinCompleted ? `
          <div style="text-align: center; padding: var(--space-6); margin-bottom: var(--space-6);">
            <span class="badge badge-green" style="font-size: var(--fs-base); padding: var(--space-3) var(--space-5);">
              ✅ Today's check-in is complete!
            </span>
          </div>
        ` : ''}

        <!-- MITs (Most Important Tasks) -->
        <div class="checkin-section" style="animation-delay: 0ms;">
          <h3>⚡ 3 Non-Negotiables</h3>
          <p class="section-description">What are the 3 things you MUST do today? No excuses.</p>
          <div class="mit-list">
            ${[0, 1, 2].map(i => `
              <div class="mit-item">
                <span class="mit-number">${i + 1}</span>
                <input type="text" class="mit-input" data-mit-idx="${i}"
                       value="${todayLog.mits[i] || ''}"
                       placeholder="Non-negotiable task ${i + 1}..." />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Energy / Mood / Motivation -->
        <div class="checkin-section" style="animation-delay: 80ms;">
          <h3>📊 Status Check</h3>
          <p class="section-description">How are you feeling right now? Track your state daily to find patterns.</p>

          <div class="slider-group">
            <div class="slider-header">
              <label>😊 Mood</label>
              <span class="slider-value" id="mood-value">${todayLog.mood || 5}/10</span>
            </div>
            <input type="range" min="1" max="10" value="${todayLog.mood || 5}" id="mood-slider" />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label>⚡ Energy</label>
              <span class="slider-value" id="energy-value">${todayLog.energy || 5}/10</span>
            </div>
            <input type="range" min="1" max="10" value="${todayLog.energy || 5}" id="energy-slider" />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label>🔥 Motivation</label>
              <span class="slider-value" id="motivation-value">${todayLog.motivation || 5}/10</span>
            </div>
            <input type="range" min="1" max="10" value="${todayLog.motivation || 5}" id="motivation-slider" />
          </div>

          <div class="slider-group">
            <div class="slider-header">
              <label>💀 Resistance Overcome</label>
              <span class="slider-value" id="resistance-value">${todayLog.resistance || 5}/10</span>
            </div>
            <input type="range" min="1" max="10" value="${todayLog.resistance || 5}" id="resistance-slider" />
          </div>
        </div>

        <!-- Accountability Mirror -->
        <div class="checkin-section" style="animation-delay: 160ms;">
          <h3>🪞 Accountability Mirror</h3>
          <p class="section-description">Be brutally honest. "Champions don't do extraordinary things. They do ordinary things without thinking." — Duhigg</p>

          <div class="accountability-questions">
            ${[
              'Did you do what you said you\'d do yesterday?',
              'Did you push past your comfort zone today?',
              'Did you avoid distractions during focus time?',
              'Did you prioritize deep work over shallow work?',
              'Did you take care of your body (exercise, nutrition, sleep)?'
            ].map((q, i) => `
              <div class="accountability-q">
                <span class="q-text">${q}</span>
                <div class="q-toggle">
                  <button class="toggle-btn yes ${todayLog.accountability[`q${i}`] === true ? 'active' : ''}"
                          data-q-id="q${i}" data-q-val="true">Yes</button>
                  <button class="toggle-btn no ${todayLog.accountability[`q${i}`] === false ? 'active' : ''}"
                          data-q-id="q${i}" data-q-val="false">No</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Reflection -->
        <div class="checkin-section" style="animation-delay: 240ms;">
          <h3>✍️ Reflection</h3>
          <p class="section-description">Growth mindset: "Becoming is better than being." — Carol Dweck</p>

          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div>
              <label style="font-size: var(--fs-sm); color: var(--text-secondary); display: block; margin-bottom: var(--space-2);">🏆 Today's Wins</label>
              <textarea id="wins-input" rows="2" placeholder="What went well today?">${todayLog.wins || ''}</textarea>
            </div>
            <div>
              <label style="font-size: var(--fs-sm); color: var(--text-secondary); display: block; margin-bottom: var(--space-2);">📖 What I Learned</label>
              <textarea id="reflection-input" rows="2" placeholder="Key lesson or insight from today...">${todayLog.reflection || ''}</textarea>
            </div>
            <div>
              <label style="font-size: var(--fs-sm); color: var(--text-secondary); display: block; margin-bottom: var(--space-2);">🔄 What I'll Improve Tomorrow</label>
              <textarea id="losses-input" rows="2" placeholder="What could have been better?">${todayLog.losses || ''}</textarea>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div style="text-align: center; padding: var(--space-6) 0;">
          <button class="btn btn-primary btn-lg" id="submit-checkin" style="min-width: 200px;">
            ${todayLog.checkinCompleted ? '✅ Update Check-In' : '🔒 Complete Check-In'}
          </button>
        </div>
      </div>
    `;

    // Slider handlers
    ['mood', 'energy', 'motivation', 'resistance'].forEach(field => {
      const slider = container.querySelector(`#${field}-slider`);
      const display = container.querySelector(`#${field}-value`);
      if (slider && display) {
        slider.addEventListener('input', () => {
          display.textContent = `${slider.value}/10`;
          todayLog[field] = parseInt(slider.value);
        });
      }
    });

    // MIT handlers
    container.querySelectorAll('.mit-input').forEach(input => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.mitIdx);
        todayLog.mits[idx] = input.value;
      });
    });

    // Accountability toggle handlers
    container.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qId;
        const val = btn.dataset.qVal === 'true';
        todayLog.accountability[qId] = val;

        // Update UI
        const parent = btn.closest('.q-toggle');
        parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Submit handler
    container.querySelector('#submit-checkin')?.addEventListener('click', async () => {
      todayLog.wins = container.querySelector('#wins-input')?.value || '';
      todayLog.losses = container.querySelector('#losses-input')?.value || '';
      todayLog.reflection = container.querySelector('#reflection-input')?.value || '';

      const wasCompleted = todayLog.checkinCompleted;
      todayLog.checkinCompleted = true;

      // Award XP for check-in (only first time)
      if (!wasCompleted) {
        const currentStreak = calculateStreak(dayLogs, habits);
        const multiplier = getStreakMultiplier(currentStreak);
        const xpGained = calculateXP('DAILY_CHECKIN', multiplier);
        todayLog.xpEarned = (todayLog.xpEarned || 0) + xpGained;

        const u = await store.getUser();
        u.totalXpEarned = (u.totalXpEarned || 0) + xpGained;
        await store.saveUser(u);

        showXPToast(xpGained);
      }

      await store.saveDayLog(todayLog);
      showToast({
        title: wasCompleted ? 'Check-In Updated' : '✅ Check-In Complete!',
        message: wasCompleted ? 'Your reflections have been saved.' : 'Great discipline. Tomorrow, be even better.',
        type: 'success',
        icon: wasCompleted ? '✏️' : '🔒'
      });
      render();
    });
  }

  render();
}
