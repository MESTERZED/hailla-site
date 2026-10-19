// Booking flow, step by step as in the app:
// Choisir les dates → Détails → Moyen de paiement → (Paiement démo) → Réservation confirmée
import barba from '@barba/core';
import { t, loc, getLang } from './i18n.js';
import { openSheet, toast, icon, reducedMotion } from './ui.js';
import { bookings, user } from './store.js';
import { money, isoDay, addDays, nightsBetween, date, esc } from './format.js';
import { CITIES } from '../data/places.js';

// Tourist tax estimate per person per night (varies by category in Algeria; shown as an estimate).
const TAX = { hotel: 300, maison: 150, appart: 150, auberge: 100, eco: 100 };
const METHODS = [
  { id: 'cib', icon: 'card', online: true },
  { id: 'paypal', icon: 'paypal', online: true },
  { id: 'apple', icon: 'apple', online: true },
  { id: 'site', icon: 'hotel', online: false },
];

const makeRef = () => `HL-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
const locale = () => ({ fr: 'fr-FR', en: 'en-GB', ar: 'ar-DZ' })[getLang()];

export function icsFor(b, stay) {
  const d = (iso) => iso.replaceAll('-', '');
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HAILLA//Reservation//FR', 'BEGIN:VEVENT',
    `UID:${b.ref}@hailla.dz`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${d(b.in)}`, `DTEND;VALUE=DATE:${d(b.out)}`,
    `SUMMARY:${loc(stay.name)} — HAILLA ${b.ref}`, `LOCATION:${loc(stay.area)}`,
    `DESCRIPTION:${b.guests} pers. · ${money(b.total)}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
  a.download = `hailla-${b.ref}.ics`;
  a.setAttribute('data-no-barba', '');
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// Small brand-coloured marks for the payment list (not the companies' logos).
const methodIcon = (m) => {
  if (m.icon === 'paypal') return '<span class="pay-ico pay-ico--paypal" aria-hidden="true">P</span>';
  if (m.icon === 'card') return '<span class="pay-ico pay-ico--card" aria-hidden="true"><i></i><i></i></span>';
  return `<span class="pay-ico" aria-hidden="true">${icon(m.icon)}</span>`;
};

function calendarMonth(y, m, sel, today) {
  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  const title = new Intl.DateTimeFormat(locale(), { month: 'long' }).format(first);
  const wd = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale(), { weekday: 'narrow' }).format(new Date(2026, 1, 1 + i))); // 1 Feb 2026 is a Sunday
  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push('<span></span>');
  for (let d = 1; d <= days; d++) {
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const past = iso < today;
    const isStart = iso === sel.in, isEnd = iso === sel.out;
    const inRange = sel.in && sel.out && iso > sel.in && iso < sel.out;
    const cls = ['cal__day', past && 'is-past', (isStart || isEnd) && 'is-edge', inRange && 'is-range', isStart && sel.out && 'is-start', isEnd && 'is-end'].filter(Boolean).join(' ');
    cells.push(`<button type="button" class="${cls}" data-day="${iso}" ${past ? 'disabled' : ''} aria-pressed="${isStart || isEnd}" aria-label="${date(iso, { weekday: 'long', day: 'numeric', month: 'long' })}"><span>${d}</span></button>`);
  }
  return `<section class="cal__month"><h3 class="cal__mtitle">${esc(title.charAt(0).toUpperCase() + title.slice(1))}</h3>
    <div class="cal__grid cal__grid--head" aria-hidden="true">${wd.map((w) => `<span>${esc(w)}</span>`).join('')}</div>
    <div class="cal__grid">${cells.join('')}</div></section>`;
}

export function openBooking(stay) {
  const u = user.get();
  const today = isoDay();
  const p = new URLSearchParams(location.search);
  const s = {
    step: 'dates',
    in: p.get('in') >= today ? p.get('in') : null,
    out: null,
    view: null, // first month shown (YYYY-MM)
    guests: Math.min(Number(p.get('guests')) || 2, stay.capacity),
    rooms: 1,
    name: u?.name || '', phone: u?.phone || '', email: u?.email || '', idType: 'cni', note: '',
    method: 'cib',
  };
  if (s.in && p.get('out') > s.in) s.out = p.get('out');
  const start = new Date(`${s.in || today}T12:00:00`);
  s.view = { y: start.getFullYear(), m: start.getMonth() };

  const totals = () => {
    const n = s.in && s.out ? nightsBetween(s.in, s.out) : 0;
    const lodging = n * stay.price * s.rooms;
    const tax = n * s.guests * (TAX[stay.type] || 150);
    return { n, lodging, tax, total: lodging + tax };
  };
  const totalBar = (label, attrs = '') => `
    <div class="flow__bar">
      <p class="flow__total"><span>${t('book.total')}</span> <strong>${money(totals().total)}</strong></p>
      <button class="btn btn--blue btn--sq" type="button" data-next ${attrs}>${label}</button>
    </div>`;

  const TITLES = { dates: 'flow.dates', details: 'flow.details', methods: 'flow.methods', pay: 'flow.pay', done: '' };

  let body, closeSheet, titleEl;
  const render = () => {
    titleEl.textContent = TITLES[s.step] ? t(TITLES[s.step]) : '';
    const back = s.step !== 'dates' && s.step !== 'done';
    const backBtn = back ? `<button class="icon-btn flow__back" type="button" data-back aria-label="${t('place.back')}">${icon('back', 'flip-rtl')}</button>` : '';
    let html = '';

    if (s.step === 'dates') {
      const months = [0, 1].map((k) => { const d = new Date(s.view.y, s.view.m + k, 1); return calendarMonth(d.getFullYear(), d.getMonth(), s, today); }).join('');
      const { n } = totals();
      html = `
        <div class="cal">
          <div class="cal__nav">
            <button class="icon-btn" type="button" data-cal="-1" aria-label="${t('flow.prevMonth')}">${icon('back', 'flip-rtl')}</button>
            <p class="cal__year">${s.view.y}</p>
            <button class="icon-btn" type="button" data-cal="1" aria-label="${t('flow.nextMonth')}">${icon('chevronR', 'flip-rtl')}</button>
          </div>
          ${months}
          <p class="cal__sum" aria-live="polite">${s.in ? `${date(s.in)}${s.out ? ` → ${date(s.out)} · ${n === 1 ? t('book.night1') : t('book.nights', { n })}` : ` → ${t('flow.pickOut')}`}` : t('flow.pickIn')}</p>
        </div>
        <div class="flow__bar flow__bar--two">
          <button class="btn btn--ghost btn--sq" type="button" data-close-flow>${t('flow.back')}</button>
          <button class="btn btn--blue btn--sq" type="button" data-next ${s.in && s.out ? '' : 'disabled'}>${t('flow.confirm')}</button>
        </div>`;
    }

    if (s.step === 'details') {
      html = `${backBtn}
        <form class="flow__form" data-details novalidate>
          <div class="book__place">
            <img src="img/${stay.images[0]}-800.webp" alt="" width="64" height="64" />
            <div><strong>${esc(loc(stay.name))}</strong><span class="muted">${date(s.in)} → ${date(s.out)}</span></div>
          </div>
          <label class="ffield"><span>${t('flow.responsible')}</span><input class="input" name="name" autocomplete="name" value="${esc(s.name)}" /></label>
          <label class="ffield"><span>${t('flow.contact')}</span><input class="input" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(s.phone)}" placeholder="05 XX XX XX XX" /></label>
          <label class="ffield"><span>${t('book.email')}</span><input class="input" name="email" type="email" autocomplete="email" value="${esc(s.email)}" /></label>
          <div class="book__grid">
            <label class="ffield"><span>${t('flow.members')}</span><select class="select" name="guests">${Array.from({ length: 6 }, (_, i) => `<option value="${i + 1}" ${i + 1 === s.guests ? 'selected' : ''}>${t('flow.memberN', { n: i + 1 })}</option>`).join('')}</select></label>
            <label class="ffield"><span>${t('book.rooms')}</span><select class="select" name="rooms">${[1, 2, 3].map((r) => `<option ${r === s.rooms ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
          </div>
          <label class="ffield"><span>${t('flow.idType')}</span><select class="select" name="idType">${['cni', 'passport', 'license'].map((k) => `<option value="${k}" ${k === s.idType ? 'selected' : ''}>${t(`flow.id.${k}`)}</option>`).join('')}</select></label>
          <p class="flow__hint">${icon('info')} ${t('flow.idHint')}</p>
          <label class="ffield"><span>${t('book.note')}</span><textarea class="textarea" name="note" rows="2">${esc(s.note)}</textarea></label>
          <p class="field-error" role="alert" data-err hidden></p>
          <p class="book__hint muted" data-cap></p>
        </form>
        ${totalBar(t('flow.toMethods'))}`;
    }

    if (s.step === 'methods') {
      html = `${backBtn}
        <div class="pay-list" role="radiogroup" aria-label="${t('flow.methods')}">
          ${METHODS.map((m) => `<button type="button" class="pay-opt" role="radio" aria-checked="${m.id === s.method}" data-method="${m.id}">${methodIcon(m)}<span class="pay-opt__label">${t(`flow.m.${m.id}`)}</span><span class="pay-opt__check" aria-hidden="true">${icon('check')}</span></button>`).join('')}
        </div>
        <dl class="book__sum">
          <div><dt>${money(stay.price)} × ${totals().n === 1 ? t('book.night1') : t('book.nights', { n: totals().n })}${s.rooms > 1 ? ` × ${s.rooms}` : ''}</dt><dd>${money(totals().lodging)}</dd></div>
          <div><dt>${t('book.tax')}</dt><dd>${money(totals().tax)}</dd></div>
        </dl>
        <p class="book__free">${icon('check')} ${t('book.free')}</p>
        ${totalBar(t('flow.process'))}`;
    }

    if (s.step === 'pay') {
      html = `${backBtn}
        <div class="demo-card" aria-label="${t('flow.demoCard')}">
          <p class="demo-card__holder">${esc(s.name || 'HAILLA')}</p>
          <p class="demo-card__brand">${t(`flow.m.${s.method}`)}</p>
          <p class="demo-card__num">•••• &nbsp;•••• &nbsp;•••• &nbsp;9018</p>
          <p class="demo-card__amount">${money(totals().total)}</p>
          <span class="demo-card__chip" aria-hidden="true"></span>
        </div>
        <p class="flow__demo">${icon('shield')} ${t('flow.demoNote')}</p>
        ${totalBar(t('flow.payDemo'))}`;
    }

    if (s.step === 'done') {
      const b = s.booking;
      html = `
        <div class="flow-done">
          <div class="flow-done__art" aria-hidden="true">${beachArt}</div>
          <h3 class="flow-done__title">${t('flow.doneTitle')}</h3>
          <p class="muted">${t('flow.doneText')}</p>
          <p>${t('book.done.p', { ref: `<strong>${b.ref}</strong>` })}</p>
          <dl class="book__sum">
            <div><dt>${esc(loc(stay.name))}</dt><dd>${esc(loc(CITIES[stay.city].name))}</dd></div>
            <div><dt>${date(b.in)} → ${date(b.out)}</dt><dd>${b.nights === 1 ? t('book.night1') : t('book.nights', { n: b.nights })}</dd></div>
            <div class="book__total"><dt>${t('book.total')}</dt><dd>${money(b.total)}</dd></div>
          </dl>
          <div class="flow-done__actions">
            <button class="btn btn--ghost btn--sq" type="button" data-ics>${icon('calendar')} ${t('book.done.cal')}</button>
            <button class="btn btn--ghost btn--sq" type="button" data-trips>${t('book.done.trips')}</button>
          </div>
          <button class="btn btn--blue btn--sq btn--block" type="button" data-explore>${t('flow.exploreMore')}</button>
        </div>`;
    }

    body.innerHTML = `<div class="flow flow--${s.step}">${html}</div>`;
    if (s.step === 'details') syncCap();
    if (s.step === 'done' && !reducedMotion()) {
      body.querySelectorAll('.flow-done__art svg > *').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 80 * i, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
    }
    body.querySelector('[data-next]:not([disabled]), [data-day]:not([disabled]), input, button')?.focus({ preventScroll: true });
  };

  const syncCap = () => {
    const cap = body.querySelector('[data-cap]');
    if (cap) cap.textContent = s.guests > stay.capacity * s.rooms ? t('book.capacity', { n: stay.capacity }) : '';
    const tot = body.querySelector('.flow__total strong');
    if (tot) tot.textContent = money(totals().total);
  };

  const readDetails = () => {
    const f = body.querySelector('[data-details]');
    if (!f) return true;
    Object.assign(s, { name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), guests: Number(f.guests.value), rooms: Number(f.rooms.value), idType: f.idType.value, note: f.note.value });
    const err = f.querySelector('[data-err]');
    f.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    const fail = (msg, field) => { err.textContent = msg; err.hidden = false; field.setAttribute('aria-invalid', 'true'); field.focus(); return false; };
    if (!s.name) return fail(t('book.err.fields'), f.name);
    if (!s.phone && !s.email) return fail(t('book.err.fields'), f.phone);
    if (s.email && !f.email.checkValidity()) return fail(t('common.email.bad'), f.email);
    if (s.guests > stay.capacity * s.rooms) return fail(t('book.capacity', { n: stay.capacity }), f.guests);
    return true;
  };

  const finish = () => {
    const tt = totals();
    const b = {
      ref: makeRef(), placeId: stay.id, in: s.in, out: s.out, nights: tt.n, guests: s.guests, rooms: s.rooms,
      total: tt.total, status: 'ok', name: s.name, method: s.method, createdAt: new Date().toISOString(),
    };
    bookings.add(b);
    s.booking = b;
    s.step = 'done';
    toast(t('book.done.t'), { tone: 'ok' });
    render();
  };

  const go = (step) => { s.step = step; render(); body.scrollTop = 0; };

  openSheet({
    title: t('flow.dates'),
    html: '',
    onMount: (b, close) => {
      body = b; closeSheet = close;
      titleEl = b.closest('.sheet__panel').querySelector('.sheet__title');
      b.closest('.sheet__panel').classList.add('sheet__panel--flow');
      render();
      b.addEventListener('click', (e) => {
        const day = e.target.closest('[data-day]');
        if (day) {
          const iso = day.dataset.day;
          if (!s.in || s.out || iso <= s.in) { s.in = iso; s.out = null; } else s.out = iso;
          render();
          body.querySelector(`[data-day="${iso}"]`)?.focus({ preventScroll: true });
          return;
        }
        const nav = e.target.closest('[data-cal]');
        if (nav) {
          const d = new Date(s.view.y, s.view.m + Number(nav.dataset.cal), 1);
          const now = new Date();
          if (d < new Date(now.getFullYear(), now.getMonth(), 1)) return;
          s.view = { y: d.getFullYear(), m: d.getMonth() };
          render();
          return;
        }
        const m = e.target.closest('[data-method]');
        if (m) { s.method = m.dataset.method; body.querySelectorAll('[data-method]').forEach((x) => x.setAttribute('aria-checked', String(x === m))); return; }
        if (e.target.closest('[data-close-flow]')) { closeSheet(); return; }
        if (e.target.closest('[data-back]')) { go({ details: 'dates', methods: 'details', pay: 'methods' }[s.step]); return; }
        if (e.target.closest('[data-next]')) {
          if (s.step === 'dates') go('details');
          else if (s.step === 'details') { if (readDetails()) go('methods'); }
          else if (s.step === 'methods') METHODS.find((x) => x.id === s.method).online ? go('pay') : finish();
          else if (s.step === 'pay') finish();
          return;
        }
        if (e.target.closest('[data-ics]')) icsFor(s.booking, stay);
        if (e.target.closest('[data-trips]')) { closeSheet(); barba.go('voyages.html'); }
        if (e.target.closest('[data-explore]')) { closeSheet(); barba.go('explorer.html'); }
      });
      b.addEventListener('input', (e) => {
        if (e.target.name === 'guests') s.guests = Number(e.target.value);
        if (e.target.name === 'rooms') s.rooms = Number(e.target.value);
        if (['guests', 'rooms'].includes(e.target.name)) syncCap();
      });
      b.addEventListener('keydown', (e) => {
        const day = e.target.closest('[data-day]');
        if (!day || !['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        e.preventDefault();
        let delta = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (document.dir === 'rtl' && Math.abs(delta) === 1) delta = -delta;
        body.querySelector(`[data-day="${addDays(day.dataset.day, delta)}"]`)?.focus();
      });
    },
  });
}

// Palm & sunbed illustration (after the app's "Booking Successfully" screen)
const beachArt = `<svg viewBox="0 0 160 130" fill="none" stroke="#0a1a3f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="128" cy="26" r="9" fill="#fcb424"/>
  <path d="M128 9v-4M128 47v-4M111 26h-4M149 26h-4M116 14l-3-3M143 41l-3-3M116 38l-3 3M143 11l-3 3"/>
  <path d="M58 118c2-26 6-50 18-74" />
  <path d="M76 44c-10-8-26-8-36 2 12-2 22 0 30 6M76 44c-2-12-12-22-26-22 8 6 14 14 16 24M76 44c8-10 22-14 34-8-10 0-20 4-26 12M76 44c12-4 26 0 32 10-8-6-20-6-28-2" fill="#fcb424"/>
  <path d="M86 92h42l8-14M92 92l-6 26M124 92l6 26M86 104h44"/>
  <path d="M112 66c0-10 8-16 16-16s16 6 16 16Z" fill="#fcb424"/><path d="M128 66v26"/>
  <path d="M20 118h124"/>
</svg>`;

