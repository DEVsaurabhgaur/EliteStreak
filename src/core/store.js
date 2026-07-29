// ============================================
// Data Store — IndexedDB + LocalStorage
// Persistent local storage for all app data
// ============================================

const DB_NAME = 'EliteStreakDB';
const DB_VERSION = 1;
let db = null;

const STORES = {
  USER: 'user',
  HABITS: 'habits',
  DAY_LOGS: 'dayLogs',
  GOALS: 'goals',
  FOCUS_SESSIONS: 'focusSessions',
  ACHIEVEMENTS: 'achievements',
};

// --- Default Data ---
const DEFAULT_USER = {
  id: 'user_1',
  name: 'Saurabh',
  xp: 0,
  level: 1,
  totalXpEarned: 0,
  createdAt: new Date().toISOString(),
  mission: 'Get into the top 1% through relentless discipline, deep work, and consistent daily improvement.',
  avatar: '⚡',
  settings: {
    soundEnabled: true,
    notificationsEnabled: true,
    focusDuration: 25,
    breakDuration: 5,
  }
};

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Deep Work Session', icon: '🧠', category: 'work', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: 'h2', name: 'Exercise / Gym', icon: '💪', category: 'health', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: 'h3', name: 'Read 30 min', icon: '📖', category: 'learning', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: 'h4', name: 'Meditation', icon: '🧘', category: 'mindset', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: 'h5', name: 'Code / Build', icon: '💻', category: 'work', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: 'h6', name: 'Cold Shower', icon: '🥶', category: 'health', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: 'h7', name: 'Journal', icon: '✍️', category: 'mindset', frequency: 'daily', createdAt: new Date().toISOString() },
  { id: 'h8', name: 'No Social Media', icon: '📵', category: 'discipline', frequency: 'daily', createdAt: new Date().toISOString() },
];

// --- IndexedDB Init ---
function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORES.USER)) {
        database.createObjectStore(STORES.USER, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.HABITS)) {
        database.createObjectStore(STORES.HABITS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.DAY_LOGS)) {
        database.createObjectStore(STORES.DAY_LOGS, { keyPath: 'date' });
      }
      if (!database.objectStoreNames.contains(STORES.GOALS)) {
        database.createObjectStore(STORES.GOALS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.FOCUS_SESSIONS)) {
        const fs = database.createObjectStore(STORES.FOCUS_SESSIONS, { keyPath: 'id' });
        fs.createIndex('date', 'date', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.ACHIEVEMENTS)) {
        database.createObjectStore(STORES.ACHIEVEMENTS, { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

async function getStore(storeName, mode = 'readonly') {
  const database = await openDB();
  const tx = database.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

async function getAll(storeName) {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getById(storeName, id) {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put(storeName, data) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteById(storeName, id) {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- Public API ---
export const store = {
  async init() {
    await openDB();
    // Initialize user if first time
    const user = await this.getUser();
    if (!user) {
      await put(STORES.USER, DEFAULT_USER);
      for (const habit of DEFAULT_HABITS) {
        await put(STORES.HABITS, habit);
      }
    }
  },

  // User
  async getUser() {
    return getById(STORES.USER, 'user_1');
  },

  async saveUser(user) {
    return put(STORES.USER, { ...user, id: 'user_1' });
  },

  // Habits
  async getHabits() {
    return getAll(STORES.HABITS);
  },

  async saveHabit(habit) {
    return put(STORES.HABITS, habit);
  },

  async deleteHabit(id) {
    return deleteById(STORES.HABITS, id);
  },

  // Day Logs
  async getDayLog(date) {
    return getById(STORES.DAY_LOGS, date);
  },

  async saveDayLog(log) {
    return put(STORES.DAY_LOGS, log);
  },

  async getAllDayLogs() {
    return getAll(STORES.DAY_LOGS);
  },

  // Goals
  async getGoals() {
    return getAll(STORES.GOALS);
  },

  async saveGoal(goal) {
    return put(STORES.GOALS, goal);
  },

  async deleteGoal(id) {
    return deleteById(STORES.GOALS, id);
  },

  // Focus Sessions
  async getFocusSessions() {
    return getAll(STORES.FOCUS_SESSIONS);
  },

  async saveFocusSession(session) {
    return put(STORES.FOCUS_SESSIONS, session);
  },

  // Achievements
  async getAchievements() {
    return getAll(STORES.ACHIEVEMENTS);
  },

  async unlockAchievement(achievement) {
    return put(STORES.ACHIEVEMENTS, {
      ...achievement,
      unlockedAt: new Date().toISOString()
    });
  },

  // Export/Import
  async exportData() {
    const data = {
      user: await this.getUser(),
      habits: await this.getHabits(),
      dayLogs: await this.getAllDayLogs(),
      goals: await this.getGoals(),
      focusSessions: await this.getFocusSessions(),
      achievements: await this.getAchievements(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  async importData(jsonString) {
    const data = JSON.parse(jsonString);
    if (data.user) await put(STORES.USER, data.user);
    if (data.habits) for (const h of data.habits) await put(STORES.HABITS, h);
    if (data.dayLogs) for (const d of data.dayLogs) await put(STORES.DAY_LOGS, d);
    if (data.goals) for (const g of data.goals) await put(STORES.GOALS, g);
    if (data.focusSessions) for (const f of data.focusSessions) await put(STORES.FOCUS_SESSIONS, f);
    if (data.achievements) for (const a of data.achievements) await put(STORES.ACHIEVEMENTS, a);
  },
};

// Auto-save timestamp tracker


// Database error warning log


// JSON schema validation

