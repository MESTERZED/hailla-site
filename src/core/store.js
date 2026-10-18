// Tiny localStorage wrapper. Storage can be unavailable (private mode, blocked site data):
// every access is guarded and falls back to an in-memory copy so the site keeps working.
const PREFIX = 'hailla:';
const memory = new Map();
const subs = new Map();

function read(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) return JSON.parse(raw);
  } catch { /* fall through to memory */ }
  return memory.has(key) ? memory.get(key) : undefined;
}

function write(key, value) {
  memory.set(key, value);
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* memory only */ }
  (subs.get(key) || []).forEach((fn) => fn(value));
}

export const store = {
  get: (key, fallback) => { const v = read(key); return v === undefined ? fallback : v; },
  set: write,
  update: (key, fn, fallback) => write(key, fn(store.get(key, fallback))),
  on: (key, fn) => {
    if (!subs.has(key)) subs.set(key, new Set());
    subs.get(key).add(fn);
    return () => subs.get(key).delete(fn);
  },
};

// Domain helpers
export const favs = {
  all: () => store.get('favs', []),
  has: (id) => favs.all().includes(id),
  toggle: (id) => {
    const on = !favs.has(id);
    store.update('favs', (list) => (on ? [...list, id] : list.filter((x) => x !== id)), []);
    return on;
  },
};

export const bookings = {
  all: () => store.get('bookings', []),
  add: (b) => store.update('bookings', (list) => [b, ...list], []),
  cancel: (ref) => store.update('bookings', (list) => list.map((b) => (b.ref === ref ? { ...b, status: 'cancel' } : b)), []),
};

export const reviews = {
  for: (id) => store.get('reviews', {})[id] || [],
  add: (id, r) => store.update('reviews', (all) => ({ ...all, [id]: [r, ...(all[id] || [])] }), {}),
};

export const user = {
  get: () => store.get('user', null),
  set: (u) => store.set('user', u),
  clear: () => store.set('user', null),
  prefs: () => store.get('prefs', { budget: 'mid', interests: [], travel: 'couple' }),
  setPrefs: (p) => store.set('prefs', p),
};
