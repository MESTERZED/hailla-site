import { t, loc } from '../core/i18n.js';
import { icon, imgTag, stayCard, confirmDialog, toast } from '../core/ui.js';
import { bookings, favs, store } from '../core/store.js';
import { money, date, isoDay, esc, addDays } from '../core/format.js';
import { icsFor } from '../core/booking.js';
import { findPlace, CITIES, STAY_TYPES, POI_CATS } from '../data/places.js';

export function init(root) {
  const tabs = [...root.querySelectorAll('[data-tab]')];
  const today = isoDay();

  const row = (b) => {
    const s = findPlace(b.placeId);
    if (!s) return '';
    const done = b.status === 'ok' && b.out < today;
    const status = b.status === 'cancel' ? 'cancel' : done ? 'done' : 'ok';
    return `
      <article class="trip trip--${status}">
        <a class="trip__media arch" href="lieu.html?id=${s.id}" tabindex="-1" aria-hidden="true">${imgTag(s.images[0], '', { sizes: '200px' })}</a>
        <div class="trip__body">
          <p class="mono">${t('trips.ref')} <span class="keep">${b.ref}</span> · <span class="trip__status">${t(`trips.status.${status}`)}</span></p>
          <h2 class="trip__title"><a href="lieu.html?id=${s.id}">${esc(loc(s.name))}</a></h2>
          <p class="muted">${esc(loc(STAY_TYPES[s.type]))} · ${esc(loc(CITIES[s.city].name))}</p>
          <p class="trip__dates">${icon('calendar')} ${date(b.in)} → ${date(b.out)} · ${b.nights === 1 ? t('book.night1') : t('book.nights', { n: b.nights })} · ${icon('users')} ${b.guests}</p>
        </div>
        <div class="trip__side">
          <p class="price price--lg"><strong>${money(b.total)}</strong></p>
          <div class="trip__actions">
            ${status === 'ok' ? `<button class="btn btn--ghost btn--sm" type="button" data-ics="${b.ref}">${icon('calendar')} ${t('book.done.cal')}</button><button class="btn btn--ghost btn--sm trip__cancel" type="button" data-cancel="${b.ref}">${t('trips.cancel')}</button>` : ''}
            ${status === 'done' ? `<a class="btn btn--sm" href="lieu.html?id=${s.id}#p-reviews">${icon('star')} ${t('trips.review')}</a>` : ''}
          </div>
        </div>
      </article>`;
  };

  const planRow = (p) => `
    <article class="trip trip--plan">
      <div class="trip__body">
        <p class="mono">${date(p.start)} → ${date(addDays(p.start, p.days))}</p>
        <h2 class="trip__title">${t('pl.yourTrip', { c: esc(loc(CITIES[p.city].name)) })}</h2>
        <ol class="plan-mini" role="list">${p.plan.map((d, i) => `<li><strong>${t('pl.dayN', { n: i + 1 })}</strong> ${esc(d.title)}</li>`).join('')}</ol>
      </div>
      <div class="trip__side"><div class="trip__actions">
        <a class="btn btn--ghost btn--sm" href="lieu.html?id=${p.stay}">${icon('hotel')} ${t('pl.hotels')}</a>
        <button class="btn btn--ghost btn--sm trip__cancel" type="button" data-plan-del="${p.id}">${icon('trash')}</button>
      </div></div>
    </article>`;

  const empty = (msg, cta = true) => `<div class="empty">${icon('trips')}<p>${msg}</p>${cta ? `<a class="btn" href="explorer.html">${t('trips.empty.cta')}</a>` : ''}</div>`;

  const render = () => {
    const all = bookings.all();
    const up = all.filter((b) => b.status === 'ok' && b.out >= today).sort((a, b) => a.in.localeCompare(b.in));
    const past = all.filter((b) => !(b.status === 'ok' && b.out >= today));
    const fav = favs.all().map(findPlace).filter(Boolean);
    root.querySelector('[data-n="up"]').textContent = up.length || '';
    root.querySelector('[data-n="past"]').textContent = past.length || '';
    root.querySelector('[data-n="favs"]').textContent = fav.length || '';
    const plans = store.get('plans', []);
    root.querySelector('[data-n="plans"]').textContent = plans.length || '';
    root.querySelector('[data-panel="plans"]').innerHTML = plans.length ? plans.map(planRow).join('') : `<div class="empty">${icon('wand')}<p>${t('trips.plans.empty')}</p><a class="btn" href="guide.html?tab=plan">${t('gt.plan')}</a></div>`;
    root.querySelector('[data-panel="up"]').innerHTML = up.length ? up.map(row).join('') : empty(t('trips.empty'));
    root.querySelector('[data-panel="past"]').innerHTML = past.length ? past.map(row).join('') : empty(t('trips.empty'), false);
    root.querySelector('[data-panel="favs"]').innerHTML = fav.length
      ? `<div class="fav-grid">${fav.map((p) => (p.kind === 'stay' ? stayCard(p) : poiCard(p))).join('')}</div>`
      : empty(t('trips.favs.empty'), false);
  };

  const poiCard = (p) => `
    <article class="stay-card">
      <a class="stay-card__media arch" href="lieu.html?id=${p.id}">${imgTag(p.img, '', { sizes: '360px' })}</a>
      <button class="fav is-on" type="button" data-fav="${p.id}" aria-pressed="true" aria-label="${t('fav.remove')}">${icon('heart')}</button>
      <div class="stay-card__body"><p class="stay-card__meta mono">${esc(loc(POI_CATS[p.cat]))} · ${esc(loc(CITIES[p.city].name))}</p><h3 class="stay-card__title"><a href="lieu.html?id=${p.id}">${esc(loc(p.name))}</a></h3></div>
    </article>`;

  const select = (tab) => {
    tabs.forEach((b) => { const on = b === tab; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    root.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
  };
  tabs.forEach((b) => b.addEventListener('click', () => select(b)));
  root.querySelector('[data-trip-tabs]').addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    const dir = (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0) * (document.dir === 'rtl' ? -1 : 1);
    if (i < 0 || !dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length]; next.focus(); select(next);
  });

  root.addEventListener('click', async (e) => {
    const c = e.target.closest('[data-cancel]');
    if (c && (await confirmDialog(t('trips.cancel.q')))) {
      bookings.cancel(c.dataset.cancel);
      toast(t('trips.cancelled'));
      render();
    }
    const ics = e.target.closest('[data-ics]');
    if (ics) { const b = bookings.all().find((x) => x.ref === ics.dataset.ics); if (b) icsFor(b, findPlace(b.placeId)); }
    if (e.target.closest('[data-fav]')) setTimeout(render, 0);
    const del = e.target.closest('[data-plan-del]');
    if (del) { store.update('plans', (l) => l.filter((x) => x.id !== del.dataset.planDel), []); render(); }
  });

  render();
  if (location.hash === '#favoris') select(tabs.find((b) => b.dataset.tab === 'favs'));
  if (location.hash === '#plans') select(tabs.find((b) => b.dataset.tab === 'plans'));
}

