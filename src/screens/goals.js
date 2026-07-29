// ============================================
// Goals & Missions Screen
// ============================================

import { store } from '../core/store.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { generateId } from '../utils/helpers.js';
import { formatDateDisplay, getToday } from '../utils/dates.js';

const GOAL_TYPES = [
  { value: 'mission', label: 'Life Mission', icon: '🌟' },
  { value: 'quarterly', label: 'Quarterly', icon: '📅' },
  { value: 'weekly', label: 'Weekly Sprint', icon: '🏃' },
  { value: 'daily', label: 'Daily Quest', icon: '⚡' },
];

export async function renderGoals(container, app) {
  const user = await store.getUser();
  const goals = await store.getGoals();

  let activeTab = 'all';

  function render() {
    const filtered = activeTab === 'all' ? goals : goals.filter(g => g.type === activeTab);
    const completedGoals = goals.filter(g => g.progress >= g.target);
    const activeGoals = goals.filter(g => g.progress < g.target);

    container.innerHTML = `
      <div class="goals-screen screen-enter">
        <div class="screen-header">
          <h1>Goals & Missions</h1>
          <p class="subtitle">Begin with the end in mind — Stephen Covey</p>
        </div>

        <!-- Mission Banner -->
        <div class="mission-banner">
          <h2>🌟 ${user.mission || 'Define your life mission'}</h2>
          <p>Every goal, habit, and minute of focus pushes you closer to this mission.</p>
          <button class="btn btn-ghost edit-mission" id="edit-mission-btn">✏️</button>
        </div>

        <!-- Goal Tabs -->
        <div class="goal-tabs">
          <button class="goal-tab ${activeTab === 'all' ? 'active' : ''}" data-tab="all">All (${goals.length})</button>
          <button class="goal-tab ${activeTab === 'quarterly' ? 'active' : ''}" data-tab="quarterly">Quarterly</button>
          <button class="goal-tab ${activeTab === 'weekly' ? 'active' : ''}" data-tab="weekly">Weekly</button>
          <button class="goal-tab ${activeTab === 'daily' ? 'active' : ''}" data-tab="daily">Daily</button>
        </div>

        <!-- Goals Grid -->
        <div class="grid-auto stagger">
          ${filtered.map((goal, i) => `
            <div class="goal-card" style="animation-delay: ${i * 60}ms">
              <div class="goal-card-header">
                <div class="flex items-center">
                  <span class="goal-icon">${goal.icon || '🎯'}</span>
                  <h4>${goal.title}</h4>
                </div>
                <div class="flex gap-2">
                  <span class="badge ${goal.progress >= goal.target ? 'badge-green' : 'badge-purple'}">
                    ${goal.progress >= goal.target ? '✅ Done' : goal.type}
                  </span>
                  <button class="btn btn-ghost btn-sm" data-delete-goal="${goal.id}">🗑️</button>
                </div>
              </div>
              ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
              <div class="goal-progress">
                <div class="goal-progress-text">
                  <span>Progress</span>
                  <span class="progress-value">${goal.progress}/${goal.target} ${goal.unit || ''}</span>
                </div>
                <div class="progress-bar">
                  <div class="fill" style="width: ${Math.min((goal.progress / goal.target) * 100, 100)}%"></div>
                </div>
              </div>
              <div class="goal-meta">
                ${goal.deadline ? `<span class="goal-deadline">📅 ${formatDateDisplay(goal.deadline)}</span>` : ''}
                <button class="btn btn-sm btn-secondary" data-update-goal="${goal.id}">Update Progress</button>
              </div>
            </div>
          `).join('')}

          <!-- Add Goal Card -->
          <div class="add-goal-card" id="add-goal-btn">
            <span class="add-icon">+</span>
            <span>Add New Goal</span>
          </div>
        </div>

        ${completedGoals.length > 0 ? `
          <div style="margin-top: var(--space-8);">
            <h3 style="margin-bottom: var(--space-4); color: var(--text-secondary);">✅ Completed (${completedGoals.length})</h3>
            <p style="color: var(--text-tertiary); font-size: var(--fs-sm);">
              ${completedGoals.map(g => `${g.icon || '🎯'} ${g.title}`).join(' · ')}
            </p>
          </div>
        ` : ''}
      </div>
    `;

    // Tab handlers
    container.querySelectorAll('.goal-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        render();
      });
    });

    // Edit mission
    container.querySelector('#edit-mission-btn')?.addEventListener('click', () => {
      showModal({
        title: 'Edit Life Mission',
        content: `
          <div class="goal-form">
            <div class="form-group">
              <label>Your Mission</label>
              <textarea id="mission-input" rows="4" placeholder="What's your ultimate purpose?">${user.mission || ''}</textarea>
            </div>
          </div>
        `,
        onConfirm: async (body) => {
          const mission = body.querySelector('#mission-input').value;
          user.mission = mission;
          await store.saveUser(user);
          render();
          showToast({ title: 'Mission Updated', message: 'Stay locked in.', type: 'success' });
        }
      });
    });

    // Add goal
    container.querySelector('#add-goal-btn')?.addEventListener('click', () => showAddGoalModal());

    // Update progress
    container.querySelectorAll('[data-update-goal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const goal = goals.find(g => g.id === btn.dataset.updateGoal);
        if (goal) showUpdateGoalModal(goal);
      });
    });

    // Delete goal
    container.querySelectorAll('[data-delete-goal]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const goalId = btn.dataset.deleteGoal;
        await store.deleteGoal(goalId);
        const idx = goals.findIndex(g => g.id === goalId);
        if (idx !== -1) goals.splice(idx, 1);
        render();
        showToast({ title: 'Goal Removed', type: 'info', icon: '🗑️' });
      });
    });
  }

  function showAddGoalModal() {
    showModal({
      title: 'New Goal',
      content: `
        <div class="goal-form">
          <div class="form-group">
            <label>Title</label>
            <input type="text" id="goal-title" placeholder="What do you want to achieve?" />
          </div>
          <div class="form-group">
            <label>Description (optional)</label>
            <textarea id="goal-desc" rows="2" placeholder="Why is this important?"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Type</label>
              <select id="goal-type">
                ${GOAL_TYPES.map(t => `<option value="${t.value}">${t.icon} ${t.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Icon</label>
              <input type="text" id="goal-icon" placeholder="🎯" maxlength="2" value="🎯" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Target</label>
              <input type="number" id="goal-target" placeholder="100" value="100" />
            </div>
            <div class="form-group">
              <label>Unit</label>
              <input type="text" id="goal-unit" placeholder="hours, pages, reps..." />
            </div>
          </div>
          <div class="form-group">
            <label>Deadline (optional)</label>
            <input type="date" id="goal-deadline" />
          </div>
        </div>
      `,
      confirmText: 'Create Goal',
      onConfirm: async (body) => {
        const goal = {
          id: generateId(),
          title: body.querySelector('#goal-title').value || 'Untitled Goal',
          description: body.querySelector('#goal-desc').value,
          type: body.querySelector('#goal-type').value,
          icon: body.querySelector('#goal-icon').value || '🎯',
          target: parseInt(body.querySelector('#goal-target').value) || 100,
          unit: body.querySelector('#goal-unit').value,
          deadline: body.querySelector('#goal-deadline').value || null,
          progress: 0,
          createdAt: new Date().toISOString(),
        };
        await store.saveGoal(goal);
        goals.push(goal);
        render();
        showToast({ title: 'Goal Created!', message: goal.title, type: 'success', icon: '🎯' });
      }
    });
  }

  function showUpdateGoalModal(goal) {
    showModal({
      title: `Update: ${goal.title}`,
      content: `
        <div class="goal-form">
          <div class="form-group">
            <label>Current Progress</label>
            <input type="number" id="goal-progress" value="${goal.progress}" min="0" max="${goal.target}" />
          </div>
          <p style="color: var(--text-secondary); font-size: var(--fs-sm);">Target: ${goal.target} ${goal.unit || ''}</p>
        </div>
      `,
      confirmText: 'Update',
      onConfirm: async (body) => {
        const newProgress = parseInt(body.querySelector('#goal-progress').value) || 0;
        goal.progress = newProgress;
        await store.saveGoal(goal);
        render();
        if (newProgress >= goal.target) {
          showToast({ title: '🏆 Goal Completed!', message: goal.title, type: 'xp', icon: '🎉' });
          const { celebrateAchievement } = await import('../components/particles.js');
          celebrateAchievement();
        } else {
          showToast({ title: 'Progress Updated', message: `${newProgress}/${goal.target}`, type: 'success' });
        }
      }
    });
  }

  render();
}

// Audio chord synthesis


// Deadline warning badge


// Category filter pills

