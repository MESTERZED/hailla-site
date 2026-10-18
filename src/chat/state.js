// Conversation state shared by the floating widget and the Guide page (same thread across pages).
import { store } from '../core/store.js';
import { getLang } from '../core/i18n.js';
import { localReply } from './engine.js';

const listeners = new Set();
const emit = (type, payload) => listeners.forEach((fn) => fn(type, payload));
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

let messages = store.get('chat', []);
let busy = false;
let remote = null; // null = unknown, true = Claude proxy reachable, false = local engine

const persist = () => store.set('chat', messages.slice(-40));
const uid = () => Math.random().toString(36).slice(2, 10);

export const getMessages = () => messages;
export const isBusy = () => busy;
export const isRemote = () => remote === true;

export async function checkRemote() {
  if (remote !== null) return remote;
  try {
    const r = await fetch('api/health', { headers: { accept: 'application/json' } });
    remote = r.ok && (await r.json()).ai === true;
  } catch { remote = false; }
  emit('mode', remote);
  return remote;
}

export function reset() {
  messages = [];
  persist();
  emit('reset');
}

function add(role, content) {
  const m = { id: uid(), role, content };
  messages = [...messages, m];
  persist();
  emit('add', m);
  return m;
}

function update(id, content) {
  messages = messages.map((m) => (m.id === id ? { ...m, content } : m));
  emit('update', { id, content });
}

async function streamRemote(history, lang, onText) {
  const res = await fetch('api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lang, messages: history.map(({ role, content }) => ({ role, content })) }),
  });
  if (!res.ok || !res.body) throw new Error(`chat ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '', text = '', refusal = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const events = buf.split('\n\n');
    buf = events.pop();
    for (const ev of events) {
      const line = ev.split('\n').find((x) => x.startsWith('data: '));
      if (!line) continue;
      const data = JSON.parse(line.slice(6));
      if (data.t) { text += data.t; onText(text); }
      if (data.refusal) refusal = true;
      if (data.error) throw new Error('stream error');
    }
  }
  return { text, refusal };
}

export async function send(text, { t }) {
  const q = text.trim();
  if (!q || busy) return;
  busy = true;
  add('user', q);
  emit('typing', true);
  const lang = getLang();

  try {
    if (await checkRemote()) {
      let msg = null;
      const { text: answer, refusal } = await streamRemote(messages, lang, (partial) => {
        if (!msg) { emit('typing', false); msg = add('assistant', partial); }
        else update(msg.id, partial);
      });
      emit('typing', false);
      if (refusal || !answer) {
        if (msg) update(msg.id, t('guide.refusal'));
        else add('assistant', t('guide.refusal'));
      }
      persist();
    } else {
      await new Promise((r) => setTimeout(r, 550 + Math.random() * 450));
      emit('typing', false);
      add('assistant', localReply(q, lang));
    }
  } catch (err) {
    console.warn('[guide] remote failed, falling back to local engine', err);
    remote = false;
    emit('mode', false);
    emit('typing', false);
    add('assistant', localReply(q, lang));
  } finally {
    busy = false;
    emit('idle');
  }
}
