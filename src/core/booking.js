import barba from '@barba/core';
import { t, loc } from './i18n.js';
import { openSheet, toast, icon, reducedMotion } from './ui.js';
import { bookings, user } from './store.js';
import { money, isoDay, addDays, nightsBetween, date, esc } from './format.js';
import { CITIES } from '../data/places.js';

// Tourist tax estimate per person per night (varies by category in Algeria; shown as an estimate).
const TAX = { hotel: 300, maison: 150, appart: 150, auberge: 100, eco: 100 };

const makeRef = () => `HL-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

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

export function openBooking(stay) {
  const u = user.get();
  const today = isoDay();
  const p = new URLSearchParams(location.search);
  const din = p.get('in') >= today ? p.get('in') : addDays(today, 14);
  const dout = p.get('out') > din ? p.get('out') : addDays(din, 2);
  const g = Math.min(Number(p.get('guests')) || 2, stay.capacity);

  const html = `
    <form class="book" data-book novalidate>
      <div class="book__place">
        <img src="img/${stay.images[0]}-800.webp" alt="" width="96" height="96" />
        <div><strong>${esc(loc(stay.name))}</strong><span class="muted">${esc(loc(stay.area))}</span></div>
      </div>
      <div class="book__grid">
        <label class="field"><span>${t('book.in')}</span><input class="input" type="date" name="in" min="${today}" value="${din}" required /></label>
        <label class="field"><span>${t('book.out')}</span><input class="input" type="date" name="out" min="${addDays(din, 1)}" value="${dout}" required /></label>
        <label class="field"><span>${t('book.guests')}</span><select class="select" name="guests">${Array.from({ length: 6 }, (_, i) => `<option ${i + 1 === g ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label>
        <label class="field"><span>${t('book.rooms')}</span><select class="select" name="rooms">${[1, 2, 3].map((n) => `<option>${n}</option>`).join('')}</select></label>
      </div>
      <p class="book__hint muted" data-cap></p>
      <dl class="book__sum" data-sum></dl>
      <fieldset class="book__pay">
        <legend class="label">${t('book.pay')}</legend>
        <label class="radio-card"><input type="radio" name="pay" value="site" checked /><span>${t('book.pay.site')}</span></label>
        <label class="radio-card is-disabled"><input type="radio" name="pay" value="cib" disabled /><span>${t('book.pay.cib')}</span></label>
      </fieldset>
      <div class="book__grid">
        <label class="field book__full"><span>${t('book.name')}</span><input class="input" name="name" autocomplete="name" value="${esc(u?.name || '')}" /></label>
        <label class="field"><span>${t('book.phone')}</span><input class="input" name="phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(u?.phone || '')}" placeholder="05 XX XX XX XX" /></label>
        <label class="field"><span>${t('book.email')}</span><input class="input" name="email" type="email" autocomplete="email" value="${esc(u?.email || '')}" /></label>
        <label class="field book__full"><span>${t('book.note')}</span><textarea class="textarea" name="note" rows="2"></textarea></label>
      </div>
      <p class="field-error" role="alert" data-err hidden></p>
      <p class="book__free">${icon('check')} ${t('book.free')}</p>
      <button class="btn btn--azur btn--block" type="submit">${t('book.confirm')}</button>
    </form>`;

  openSheet({
    title: t('book.title'),
    html,
    onMount: (body, close) => {
      const form = body.querySelector('[data-book]');
      const sum = body.querySelector('[data-sum]');
      const err = body.querySelector('[data-err]');
      const calc = () => {
        const n = Math.max(0, nightsBetween(form.in.value, form.out.value));
        const guests = Number(form.guests.value), rooms = Number(form.rooms.value);
        const lodging = n * stay.price * rooms;
        const tax = n * guests * (TAX[stay.type] || 150);
        body.querySelector('[data-cap]').textContent = guests > stay.capacity * rooms ? t('book.capacity', { n: stay.capacity }) : '';
        sum.innerHTML = `
          <div><dt>${money(stay.price)} × ${n === 1 ? t('book.night1') : t('book.nights', { n })}${rooms > 1 ? ` × ${rooms}` : ''}</dt><dd>${money(lodging)}</dd></div>
          <div><dt>${t('book.tax')}</dt><dd>${money(tax)}</dd></div>
          <div class="book__total"><dt>${t('book.total')}</dt><dd>${money(lodging + tax)}</dd></div>`;
        return { n, guests, rooms, total: lodging + tax };
      };
      form.addEventListener('input', (e) => {
        if (e.target.name === 'in') { form.out.min = addDays(form.in.value, 1); if (form.out.value <= form.in.value) form.out.value = addDays(form.in.value, 2); }
        calc();
      });
      calc();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const c = calc();
        const fail = (msg, field) => { err.textContent = msg; err.hidden = false; field?.setAttribute('aria-invalid', 'true'); field?.focus(); };
        form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
        err.hidden = true;
        if (form.in.value < today) return fail(t('book.err.past'), form.in);
        if (c.n < 1) return fail(t('book.err.dates'), form.out);
        if (c.guests > stay.capacity * c.rooms) return fail(t('book.capacity', { n: stay.capacity }), form.guests);
        if (!form.name.value.trim()) return fail(t('book.err.fields'), form.name);
        if (!form.phone.value.trim() && !form.email.value.trim()) return fail(t('book.err.fields'), form.phone);
        if (form.email.value && !form.email.checkValidity()) return fail(t('common.email.bad'), form.email);

        const b = {
          ref: makeRef(), placeId: stay.id, in: form.in.value, out: form.out.value, nights: c.n,
          guests: c.guests, rooms: c.rooms, total: c.total, status: 'ok', name: form.name.value.trim(),
          createdAt: new Date().toISOString(),
        };
        bookings.add(b);
        showDone(body, b, stay, close);
      });
    },
  });
}

function showDone(body, b, stay, close) {
  body.innerHTML = `
    <div class="book-done">
      <div class="book-done__anim" data-lottie aria-hidden="true"></div>
      <h3 class="book-done__title">${t('book.done.t')}</h3>
      <p>${t('book.done.p', { ref: `<strong class="mono keep">${b.ref}</strong>` })}</p>
      <dl class="book__sum">
        <div><dt>${esc(loc(stay.name))}</dt><dd>${esc(loc(CITIES[stay.city].name))}</dd></div>
        <div><dt>${date(b.in)} → ${date(b.out)}</dt><dd>${b.nights === 1 ? t('book.night1') : t('book.nights', { n: b.nights })}</dd></div>
        <div class="book__total"><dt>${t('book.total')}</dt><dd>${money(b.total)}</dd></div>
      </dl>
      <div class="book-done__actions">
        <button class="btn btn--ghost" type="button" data-ics>${icon('calendar')} ${t('book.done.cal')}</button>
        <button class="btn" type="button" data-trips>${t('book.done.trips')}</button>
      </div>
    </div>`;
  toast(t('book.done.t'), { tone: 'ok' });
  body.querySelector('[data-ics]').addEventListener('click', () => icsFor(b, stay));
  body.querySelector('[data-trips]').addEventListener('click', () => { close(); barba.go('voyages.html'); });

  const host = body.querySelector('[data-lottie]');
  if (reducedMotion()) { host.innerHTML = `<span class="book-done__static">${icon('check')}</span>`; return; }
  import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
    lottie.loadAnimation({ container: host, renderer: 'svg', loop: false, autoplay: true, path: 'lottie/check.json' });
  }).catch(() => { host.innerHTML = `<span class="book-done__static">${icon('check')}</span>`; });
}
