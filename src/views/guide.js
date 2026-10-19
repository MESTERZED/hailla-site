import { t } from '../core/i18n.js';
import { icon } from '../core/ui.js';
import { createChatUI } from '../chat/widget.js';
import { subscribe, isRemote, checkRemote, reset } from '../chat/state.js';
import { mountPlanner } from './planner.js';
import { mountTranslator } from './translator.js';

export function init(root) {
  // ── Chat ──
  const host = root.querySelector('[data-guide-chat]');
  host.innerHTML = `
    <header class="guide__head">
      <span class="chat-launcher__mark" aria-hidden="true"><img src="brand/mark.svg" alt="" class="invert"></span>
      <div class="grow">
        <p class="chat-panel__title">${t('nav.guide')}</p>
        <p class="chat-panel__mode ${isRemote() ? '' : 'is-local'}" data-mode>${t(isRemote() ? 'guide.mode.ai' : 'guide.mode.local')}</p>
      </div>
      <button class="btn btn--ghost btn--sm" type="button" data-reset>${icon('refresh')}<span>${t('guide.clear')}</span></button>
    </header>
    <div class="guide__body" data-chat-id="g"></div>`;
  const ui = createChatUI(host.querySelector('.guide__body'), { autofocus: false });
  window.__guideAsk = (q) => { show('chat'); q ? ui.ask(q) : ui.focus(); };
  host.querySelector('[data-reset]').addEventListener('click', reset);
  const unsub = subscribe((type, remote) => {
    if (type !== 'mode') return;
    const el = host.querySelector('[data-mode]');
    el.textContent = t(remote ? 'guide.mode.ai' : 'guide.mode.local');
    el.classList.toggle('is-local', !remote);
  });
  checkRemote();

  // ── Tabs: Discussion / Planifier / Traducteur ──
  const tabs = [...root.querySelectorAll('[data-gtab]')];
  let planner = null, translator = null;
  const show = (name, focus = false) => {
    tabs.forEach((b) => { const on = b.dataset.gtab === name; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    root.querySelectorAll('[data-gpanel]').forEach((p) => { p.hidden = p.dataset.gpanel !== name; });
    if (name === 'plan' && !planner) planner = mountPlanner(root.querySelector('[data-planner]'));
    if (name === 'tr' && !translator) translator = mountTranslator(root.querySelector('[data-translator]'));
    const q = new URLSearchParams(location.search);
    name === 'chat' ? q.delete('tab') : q.set('tab', name);
    history.replaceState(history.state, '', `${location.pathname}${q.toString() ? `?${q}` : ''}`);
  };
  tabs.forEach((b) => b.addEventListener('click', () => show(b.dataset.gtab)));
  root.querySelector('[data-gtabs]').addEventListener('keydown', (e) => {
    const i = tabs.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    const dir = (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0) * (document.dir === 'rtl' ? -1 : 1);
    if (dir) show(tabs[(i + dir + tabs.length) % tabs.length].dataset.gtab, true);
  });
  root.querySelectorAll('[data-open-tab]').forEach((b) => b.addEventListener('click', () => show(b.dataset.openTab, true)));

  const params = new URLSearchParams(location.search);
  show(['plan', 'tr'].includes(params.get('tab')) ? params.get('tab') : 'chat');
  if (params.get('city') && planner) planner.set(params.get('city'));

  return () => { unsub(); ui.destroy(); translator?.destroy(); delete window.__guideAsk; };
}
