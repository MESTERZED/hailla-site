import { animate, stagger } from 'animejs';
import { t, loc, getLang, onLangChange } from '../core/i18n.js';
import { icon, imgSrc, reducedMotion } from '../core/ui.js';
import { esc, money } from '../core/format.js';
import { findPlace, CITIES, STAY_TYPES, POI_CATS } from '../data/places.js';
import { subscribe, getMessages, send, reset, checkRemote, isRemote, isBusy } from './state.js';

// ── Markdown-lite → safe HTML (+ place cards) ─────────────
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
}

function miniCard(id) {
  const p = findPlace(id);
  if (!p) return '';
  const img = p.kind === 'stay' ? p.images[0] : p.img;
  const meta = p.kind === 'stay' ? `${loc(STAY_TYPES[p.type])} · ${money(p.price)}` : `${loc(POI_CATS[p.cat])} · ${loc(CITIES[p.city].name)}`;
  return `<a class="mini-card" href="lieu.html?id=${p.id}"><img src="${imgSrc(img, 800)}" alt="" loading="lazy" width="196" height="110"><div><strong>${esc(loc(p.name))}</strong><span>${esc(meta)}</span></div></a>`;
}

export function renderMessage(text) {
  const ids = [];
  const body = text.replace(/\[\[place:([\w-]+)\]\]/g, (_, id) => { ids.push(id); return ''; });
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const html = blocks.map((b) => {
    const lines = b.split('\n');
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>`;
    const out = []; let list = [];
    for (const l of lines) {
      if (/^\s*[-•]\s+/.test(l)) list.push(`<li>${inline(l.replace(/^\s*[-•]\s+/, ''))}</li>`);
      else { if (list.length) { out.push(`<ul>${list.join('')}</ul>`); list = []; } out.push(`<p>${inline(l)}</p>`); }
    }
    if (list.length) out.push(`<ul>${list.join('')}</ul>`);
    return out.join('');
  }).join('');
  const cards = [...new Set(ids)].map(miniCard).join('');
  return html + (cards ? `<div class="msg__cards" data-lenis-prevent>${cards}</div>` : '');
}

const plain = (text) => text.replace(/\[\[place:[\w-]+\]\]/g, '').replace(/\*\*/g, '').replace(/^\s*-\s+/gm, '');

// ── Speech (read aloud + dictation) ───────────────────────
const VOICE_LANG = { fr: 'fr-FR', en: 'en-GB', ar: 'ar-SA' };
export function speak(text, lang = getLang()) {
  if (!('speechSynthesis' in window)) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(plain(text));
  u.lang = VOICE_LANG[/[؀-ۿ]/.test(text) ? 'ar' : lang];
  speechSynthesis.speak(u);
  return true;
}

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// ── Chat surface ──────────────────────────────────────────
export function createChatUI(host, { autofocus = false } = {}) {
  host.innerHTML = `
    <div class="chat">
      <div class="chat__log" data-log role="log" aria-live="polite" aria-relevant="additions" tabindex="0" data-lenis-prevent></div>
      <div class="chat__suggest" data-suggest></div>
      <form class="chat__form" data-form>
        <label class="sr-only" for="chat-input-${host.dataset.chatId || 'x'}">${t('guide.ph')}</label>
        <textarea class="chat__input" id="chat-input-${host.dataset.chatId || 'x'}" rows="1" placeholder="${t('guide.ph')}" data-input></textarea>
        ${Recognition ? `<button class="chat__btn" type="button" data-mic aria-label="${t('guide.mic')}">${icon('mic')}</button>` : ''}
        <button class="chat__btn chat__btn--send" type="submit" aria-label="${t('guide.send')}">${icon('send')}</button>
      </form>
    </div>`;

  const log = host.querySelector('[data-log]');
  const input = host.querySelector('[data-input]');
  const form = host.querySelector('[data-form]');
  const suggest = host.querySelector('[data-suggest]');
  let typingEl = null, typingAnim = null;

  const scrollDown = () => { log.scrollTop = log.scrollHeight; };

  const bubble = (m, animateIn = false) => {
    const el = document.createElement('div');
    el.className = `msg msg--${m.role === 'user' ? 'user' : 'bot'}`;
    el.dataset.id = m.id;
    el.dir = 'auto';
    el.innerHTML = m.role === 'user' ? `<p>${esc(m.content)}</p>` : renderMessage(m.content) + toolsHtml();
    log.append(el);
    if (animateIn && !reducedMotion()) {
      animate(el, { opacity: [0, 1], translateY: [14, 0], scale: [0.97, 1], duration: 520, ease: 'outExpo' });
      const cards = el.querySelectorAll('.mini-card');
      if (cards.length) animate(cards, { opacity: [0, 1], translateX: [18, 0], delay: stagger(70, { start: 160 }), duration: 480, ease: 'outQuart' });
    }
    scrollDown();
    return el;
  };
  const toolsHtml = () => ('speechSynthesis' in window ? `<div class="msg__tools"><button type="button" data-speak>${icon('volume')}<span>${t('guide.speak')}</span></button></div>` : '');

  const renderAll = () => {
    log.innerHTML = '';
    bubble({ id: 'hello', role: 'assistant', content: t('guide.hello') });
    getMessages().forEach((m) => bubble(m));
  };

  const renderSuggestions = () => {
    suggest.innerHTML = ['guide.s1', 'guide.s2', 'guide.s3', 'guide.s4', 'guide.s5']
      .map((k) => `<button class="chip" type="button" data-q="${esc(t(k))}">${esc(t(k))}</button>`).join('');
  };

  const setTyping = (on) => {
    typingAnim?.pause?.(); typingAnim?.revert?.(); typingAnim = null;
    typingEl?.remove(); typingEl = null;
    if (!on) return;
    typingEl = document.createElement('div');
    typingEl.className = 'msg msg--bot typing';
    typingEl.setAttribute('aria-label', t('guide.typing'));
    typingEl.innerHTML = '<i></i><i></i><i></i>';
    log.append(typingEl);
    scrollDown();
    if (!reducedMotion()) typingAnim = animate(typingEl.querySelectorAll('i'), { translateY: [0, -5, 0], opacity: [0.35, 1, 0.35], delay: stagger(130), duration: 900, loop: true, ease: 'inOutSine' });
  };

  const submit = (text) => { send(text, { t }); input.value = ''; input.style.height = ''; };

  form.addEventListener('submit', (e) => { e.preventDefault(); submit(input.value); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input.value); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 140)}px`; });
  suggest.addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) submit(b.dataset.q); });
  log.addEventListener('click', (e) => {
    const b = e.target.closest('[data-speak]');
    if (!b) return;
    const id = b.closest('.msg').dataset.id;
    const m = id === 'hello' ? { content: t('guide.hello') } : getMessages().find((x) => x.id === id);
    if (m) speak(m.content);
  });

  const mic = host.querySelector('[data-mic]');
  if (mic) {
    let rec = null;
    mic.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      rec = new Recognition();
      rec.lang = VOICE_LANG[getLang()];
      rec.interimResults = true;
      mic.classList.add('is-live');
      rec.onresult = (ev) => { input.value = [...ev.results].map((r) => r[0].transcript).join(' '); };
      rec.onend = () => { mic.classList.remove('is-live'); rec = null; if (input.value.trim()) submit(input.value); };
      rec.onerror = () => { mic.classList.remove('is-live'); rec = null; };
      rec.start();
    });
  }

  const unsub = subscribe((type, p) => {
    if (type === 'add') bubble(p, true);
    if (type === 'update') {
      const el = log.querySelector(`[data-id="${p.id}"]`);
      if (el) { el.innerHTML = renderMessage(p.content) + toolsHtml(); scrollDown(); }
    }
    if (type === 'typing') setTyping(p);
    if (type === 'reset') renderAll();
  });

  renderAll();
  renderSuggestions();
  if (isBusy()) setTyping(true);
  if (autofocus) setTimeout(() => input.focus({ preventScroll: true }), 50);

  return {
    focus: () => input.focus({ preventScroll: true }),
    ask: (q) => submit(q),
    destroy: () => { unsub(); setTyping(false); host.innerHTML = ''; },
  };
}

// ── Floating widget (all pages except the Guide page) ─────
export function initChatWidget() {
  const launcher = document.querySelector('[data-chat-open].chat-launcher');
  const panel = document.querySelector('[data-chat-panel]');
  let ui = null;

  const header = () => `
    <header class="chat-panel__head">
      <span class="chat-launcher__mark" aria-hidden="true"><img src="brand/mark.svg" alt="" class="invert"></span>
      <div class="grow">
        <p class="chat-panel__title" id="chat-title">${t('nav.guide')}</p>
        <p class="chat-panel__mode ${isRemote() ? '' : 'is-local'}" data-mode>${t(isRemote() ? 'guide.mode.ai' : 'guide.mode.local')}</p>
      </div>
      <button class="icon-btn" type="button" data-chat-reset aria-label="${t('guide.clear')}" title="${t('guide.clear')}">${icon('refresh')}</button>
      <a class="icon-btn" href="guide.html" aria-label="${t('chat.expand')}" title="${t('chat.expand')}" data-chat-expand>${icon('expand')}</a>
      <button class="icon-btn" type="button" data-chat-close aria-label="${t('chat.close')}">${icon('x')}</button>
    </header>
    <div class="chat-panel__body" data-chat-id="w"></div>`;

  const build = () => {
    ui?.destroy();
    panel.innerHTML = header();
    const body = panel.querySelector('.chat-panel__body');
    body.dataset.chatId = 'w';
    ui = createChatUI(body);
  };

  const open = (prompt) => {
    if (document.documentElement.dataset.page === 'guide') { window.__guideAsk?.(prompt); return; }
    if (!ui) build();
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    launcher.classList.add('is-hidden');
    window.__scroll?.stop();
    setTimeout(() => (prompt ? ui.ask(prompt) : ui.focus()), 80);
  };
  const close = () => {
    panel.classList.remove('is-open');
    launcher.classList.remove('is-hidden');
    window.__scroll?.start();
    setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 400);
    launcher.focus({ preventScroll: true });
  };
  window.__openGuide = open;

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-chat-open]');
    if (opener) { e.preventDefault(); open(opener.dataset.chatPrompt || ''); return; }
    if (e.target.closest('[data-chat-close]')) close();
    if (e.target.closest('[data-chat-reset]')) reset();
    if (e.target.closest('[data-chat-expand]') || (panel.contains(e.target) && e.target.closest('a[href]:not([href^="http"])'))) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('is-open')) close(); });

  subscribe((type, remote) => {
    if (type !== 'mode') return;
    const el = panel.querySelector('[data-mode]');
    if (el) { el.textContent = t(remote ? 'guide.mode.ai' : 'guide.mode.local'); el.classList.toggle('is-local', !remote); }
  });
  onLangChange(() => { if (ui) build(); });
  checkRemote();
}
