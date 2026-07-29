// ============================================
// Settings & Profile Screen
// ============================================

import { store } from '../core/store.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { generateId } from '../utils/helpers.js';
import { formatDateDisplay } from '../utils/dates.js';

const AVATAR_OPTIONS = ['⚡', '🔥', '💎', '🦁', '🐉', '🦅', '🐺', '🦊', '🧠', '👑', '🚀', '⭐', '🌟', '💀', '🗡️', '🛡️'];

export async function renderSettings(container, app) {
  const user = await store.getUser();
  const habits = await store.getHabits();

  function render() {
    container.innerHTML = `
      <div class="settings-screen screen-enter">
        <div class="screen-header">
          <h1>Settings</h1>
          <p class="subtitle">Configure your Performance OS</p>
        </div>

        <!-- Profile -->
        <div class="settings-section" style="animation-delay: 0ms;">
          <h3>👤 Profile</h3>
          <div class="setting-row">
            <div class="setting-info">
              <h4>Name</h4>
              <p>${user.name}</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="edit-name-btn">Edit</button>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <h4>Avatar</h4>
              <p style="font-size: 1.5rem;">${user.avatar || '⚡'}</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="edit-avatar-btn">Change</button>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <h4>Member Since</h4>
              <p>${formatDateDisplay(user.createdAt)}</p>
            </div>
          </div>
        </div>

        <!-- Habits Management -->
        <div class="settings-section" style="animation-delay: 60ms;">
          <h3>📋 Habits</h3>
          ${habits.map(habit => `
            <div class="setting-row">
              <div class="setting-info">
                <h4>${habit.icon} ${habit.name}</h4>
                <p>${habit.category} · ${habit.frequency}</p>
              </div>
              <div class="flex gap-2">
                <button class="btn btn-ghost btn-sm" data-edit-habit="${habit.id}">✏️</button>
                <button class="btn btn-ghost btn-sm" data-delete-habit="${habit.id}">🗑️</button>
              </div>
            </div>
          `).join('')}
          <div style="padding-top: var(--space-4);">
            <button class="btn btn-secondary" id="add-habit-btn">+ Add Habit</button>
          </div>
        </div>

        <!-- Focus Settings -->
        <div class="settings-section" style="animation-delay: 120ms;">
          <h3>⏱️ Focus Timer</h3>
          <div class="setting-row">
            <div class="setting-info">
              <h4>Default Duration</h4>
              <p>${user.settings?.focusDuration || 25} minutes</p>
            </div>
            <select id="focus-duration-select" style="width: auto; min-width: 100px;">
              ${[15, 25, 30, 45, 50, 60, 90, 120].map(m => `
                <option value="${m}" ${(user.settings?.focusDuration || 25) === m ? 'selected' : ''}>${m} min</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Data Management -->
        <div class="settings-section" style="animation-delay: 180ms;">
          <h3>💾 Data Management</h3>
          <div class="setting-row">
            <div class="setting-info">
              <h4>Export Data</h4>
              <p>Download all your data as JSON backup</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="export-btn">📤 Export</button>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <h4>Import Data</h4>
              <p>Restore from a previous backup</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="import-btn">📥 Import</button>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <h4>Reset All Data</h4>
              <p>⚠️ This will delete everything permanently</p>
            </div>
            <button class="btn btn-danger btn-sm" id="reset-btn">🗑️ Reset</button>
          </div>
        </div>

        <!-- About -->
        <div class="settings-section" style="animation-delay: 240ms;">
          <h3>ℹ️ About</h3>
          <div class="setting-row">
            <div class="setting-info">
              <h4>ELITE STREAK</h4>
              <p>Personal Performance OS v1.0 — Built for the top 1%</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Edit name
    container.querySelector('#edit-name-btn')?.addEventListener('click', () => {
      showModal({
        title: 'Edit Name',
        content: `<input type="text" id="name-input" value="${user.name}" placeholder="Your name" />`,
        onConfirm: async (body) => {
          user.name = body.querySelector('#name-input').value || 'User';
          await store.saveUser(user);
          render();
          showToast({ title: 'Name Updated', type: 'success' });
        }
      });
    });

    // Edit avatar
    container.querySelector('#edit-avatar-btn')?.addEventListener('click', () => {
      showModal({
        title: 'Choose Avatar',
        content: `
          <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: var(--space-3);">
            ${AVATAR_OPTIONS.map(a => `
              <button class="btn ${user.avatar === a ? 'btn-primary' : 'btn-secondary'}"
                      style="font-size: 1.5rem; height: 50px;"
                      data-avatar="${a}">${a}</button>
            `).join('')}
          </div>
        `,
        showCancel: true,
        onConfirm: async (body) => {
          const selected = body.querySelector('.btn-primary[data-avatar]');
          if (selected) {
            user.avatar = selected.dataset.avatar;
            await store.saveUser(user);
            render();
            showToast({ title: 'Avatar Updated', type: 'success', icon: user.avatar });
          }
        }
      });

      // Avatar selection logic
      setTimeout(() => {
        document.querySelectorAll('[data-avatar]').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('[data-avatar]').forEach(b => {
              b.className = 'btn btn-secondary';
              b.style.fontSize = '1.5rem';
              b.style.height = '50px';
            });
            btn.className = 'btn btn-primary';
            btn.style.fontSize = '1.5rem';
            btn.style.height = '50px';
            user.avatar = btn.dataset.avatar;
          });
        });
      }, 100);
    });

    // Add habit
    container.querySelector('#add-habit-btn')?.addEventListener('click', () => {
      showModal({
        title: 'Add Habit',
        content: `
          <div class="goal-form">
            <div class="form-group">
              <label>Habit Name</label>
              <input type="text" id="habit-name" placeholder="e.g., Morning Run" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Icon</label>
                <input type="text" id="habit-icon" placeholder="🏃" maxlength="2" value="🎯" />
              </div>
              <div class="form-group">
                <label>Category</label>
                <select id="habit-category">
                  <option value="health">Health</option>
                  <option value="work">Work</option>
                  <option value="learning">Learning</option>
                  <option value="mindset">Mindset</option>
                  <option value="discipline">Discipline</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        `,
        confirmText: 'Add Habit',
        onConfirm: async (body) => {
          const habit = {
            id: generateId(),
            name: body.querySelector('#habit-name').value || 'New Habit',
            icon: body.querySelector('#habit-icon').value || '🎯',
            category: body.querySelector('#habit-category').value,
            frequency: 'daily',
            createdAt: new Date().toISOString(),
          };
          await store.saveHabit(habit);
          habits.push(habit);
          render();
          showToast({ title: 'Habit Added!', message: habit.name, type: 'success', icon: habit.icon });
        }
      });
    });

    // Delete habit
    container.querySelectorAll('[data-delete-habit]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const habitId = btn.dataset.deleteHabit;
        const habit = habits.find(h => h.id === habitId);
        if (confirm(`Delete "${habit?.name}"? This cannot be undone.`)) {
          await store.deleteHabit(habitId);
          const idx = habits.findIndex(h => h.id === habitId);
          if (idx !== -1) habits.splice(idx, 1);
          render();
          showToast({ title: 'Habit Removed', type: 'info', icon: '🗑️' });
        }
      });
    });

    // Edit habit
    container.querySelectorAll('[data-edit-habit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const habit = habits.find(h => h.id === btn.dataset.editHabit);
        if (!habit) return;
        showModal({
          title: 'Edit Habit',
          content: `
            <div class="goal-form">
              <div class="form-group">
                <label>Name</label>
                <input type="text" id="habit-name" value="${habit.name}" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Icon</label>
                  <input type="text" id="habit-icon" value="${habit.icon}" maxlength="2" />
                </div>
                <div class="form-group">
                  <label>Category</label>
                  <select id="habit-category">
                    ${['health', 'work', 'learning', 'mindset', 'discipline', 'other'].map(c =>
                      `<option value="${c}" ${habit.category === c ? 'selected' : ''}>${c}</option>`
                    ).join('')}
                  </select>
                </div>
              </div>
            </div>
          `,
          confirmText: 'Save',
          onConfirm: async (body) => {
            habit.name = body.querySelector('#habit-name').value;
            habit.icon = body.querySelector('#habit-icon').value;
            habit.category = body.querySelector('#habit-category').value;
            await store.saveHabit(habit);
            render();
            showToast({ title: 'Habit Updated', type: 'success' });
          }
        });
      });
    });

    // Focus duration
    container.querySelector('#focus-duration-select')?.addEventListener('change', async (e) => {
      if (!user.settings) user.settings = {};
      user.settings.focusDuration = parseInt(e.target.value);
      await store.saveUser(user);
      showToast({ title: 'Focus Duration Updated', message: `${e.target.value} minutes`, type: 'success' });
    });

    // Export
    container.querySelector('#export-btn')?.addEventListener('click', async () => {
      const data = await store.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elite-streak-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast({ title: 'Data Exported!', message: 'JSON file downloaded', type: 'success', icon: '📤' });
    });

    // Import
    container.querySelector('#import-btn')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
          await store.importData(text);
          showToast({ title: 'Data Imported!', message: 'Your data has been restored', type: 'success', icon: '📥' });
          render();
        } catch (err) {
          showToast({ title: 'Import Failed', message: err.message, type: 'error' });
        }
      };
      input.click();
    });

    // Reset
    container.querySelector('#reset-btn')?.addEventListener('click', () => {
      if (confirm('⚠️ Are you absolutely sure? This will delete ALL your data permanently.')) {
        if (confirm('This is your LAST chance. Type "RESET" in the next prompt to confirm.')) {
          indexedDB.deleteDatabase('EliteStreakDB');
          localStorage.clear();
          showToast({ title: 'All Data Cleared', message: 'Refreshing...', type: 'warning' });
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    });
  }

  render();
}

// Dynamic theme selector

