import { t, loc, getLang } from '../core/i18n.js';
import { icon } from '../core/ui.js';
import { esc } from '../core/format.js';
import { CITIES } from '../data/places.js';
import { createChatUI } from '../chat/widget.js';
import { subscribe, isRemote, checkRemote, reset } from '../chat/state.js';

export function init(root) {
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
  const ui = createChatUI(host.querySelector('.guide__body'), { autofocus: true });
  window.__guideAsk = (q) => (q ? ui.ask(q) : ui.focus());

  host.querySelector('[data-reset]').addEventListener('click', reset);
  const unsub = subscribe((type, remote) => {
    if (type !== 'mode') return;
    const el = host.querySelector('[data-mode]');
    el.textContent = t(remote ? 'guide.mode.ai' : 'guide.mode.local');
    el.classList.toggle('is-local', !remote);
  });
  checkRemote();

  const form = root.querySelector('[data-planner]');
  const sel = form.querySelector('[data-city-select]');
  sel.innerHTML = Object.entries(CITIES).filter(([, c]) => c.phase === 1).map(([id, c]) => `<option value="${id}">${esc(loc(c.name))}</option>`).join('');
  sel.value = 'bejaia';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = form.days.value, city = loc(CITIES[sel.value].name);
    const q = { fr: `Itinéraire de ${n} jours à ${city}`, en: `${n}-day itinerary in ${city}`, ar: `برنامج ${n} أيام في ${city}` }[getLang()];
    ui.ask(q);
    if (window.matchMedia('(max-width: 960px)').matches) host.scrollIntoView({ behavior: 'smooth' });
  });

  return () => { unsub(); ui.destroy(); delete window.__guideAsk; };
}
