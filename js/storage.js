// storage.js — single source of truth. Everything is local, offline, no auth.
const STORAGE_KEY = 'execOS:v1';

const DEFAULT_STATE = {
  vision: {
    statement: '',
    directions: [],        // [{id, title, note}]
    lockedAt: null,        // ISO date string once the vision is committed
    realignLog: []         // [{date, onTrack: bool, note}]
  },
  goals: [],
  daily: [],
  learning: [],
  shipping: [],
  projects: [],
  achievements: [],
  criticalTasks: [],
  reflections: []
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    // merge so new modules added later don't break old saved data
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch (e) {
    console.error('State load failed, starting fresh.', e);
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('State save failed.', e);
    return false;
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function daysSince(isoDate) {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  const now = new Date();
  const diff = Math.floor((now.setHours(0,0,0,0) - then.setHours(0,0,0,0)) / 86400000);
  return diff;
}

window.Store = { loadState, saveState, uid, daysSince, DEFAULT_STATE };
