// Profile & Settings screens (app design), shown on compte.html once signed in.
import barba from '@barba/core';
import { t, loc } from '../core/i18n.js';
import { icon, toast, openSheet, confirmDialog } from '../core/ui.js';
import { user, bookings, favs, store } from '../core/store.js';
import { esc, isoDay, date } from '../core/format.js';
import { findPlace } from '../data/places.js';
import { EVENTS } from '../data/experiences.js';

const INTERESTS = ['beach', 'heritage', 'mountain', 'food', 'desert', 'eco'];
const TRAVEL = ['solo', 'couple', 'family', 'group'];
const BUDGET = ['low', 'mid', 'high'];

const upcoming = () => bookings.all().filter((b) => b.status === 'ok' && b.out >= isoDay());

function notifications() {
  const list = upcoming().map((b) => ({ icon: 'calendar', text: t('pf.nBooking', { p: loc(findPlace(b.placeId)?.name), d: date(b.in) }) }));
  EVENTS.filter((e) => e.inDays <= 3).forEach((e) => list.push({ icon: 'ticket', text: t('pf.nEvent', { e: loc(e.name) }) }));
  list.push({ icon: 'sparkle', text: t('pf.nWelcome') });
  return list;
}

export function profileHtml(u) {
  const n = upcoming().length;
  const row = (key, ic, label, extra = '') => `<button type="button" class="pf-row" data-pf="${key}"><span class="pf-row__ico" aria-hidden="true">${icon(ic)}</span><span class="pf-row__label">${label}</span>${extra}<span class="pf-row__chev" aria-hidden="true">${icon('chevronR', 'flip-rtl')}</span></button>`;
  return `
    <section class="pf container" aria-labelledby="pf-title">
      <h1 class="sr-only" id="pf-title">${t('pf.profile')}</h1>
      <div class="pf-card">
        <p class="pf-card__title" aria-hidden="true">${t('pf.profile')}</p>
        <span class="pf-avatar" aria-hidden="true">${esc((u.name[0] || 'H').toUpperCase())}</span>
        <p class="pf-name">${esc(u.name)}</p>
        <p class="pf-mail">${esc(u.email || u.phone || '')}</p>
        <div class="pf-rows">
          ${row('info', 'user', t('pf.info'))}
          ${row('history', 'ticket', t('pf.history'), n ? `<span class="pf-badge">${t('pf.upcomingN', { n })}</span>` : '')}
          ${row('notif', 'bell', t('pf.notifications'), store.get('notifSeen') ? '' : '<span class="pf-dot" aria-label="•"></span>')}
          ${row('saved', 'heart', t('pf.saved'), favs.all().length ? `<span class="pf-count">${favs.all().length}</span>` : '')}
          ${row('settings', 'gear', t('pf.settings'))}
        </div>
      </div>
    </section>`;
}

function infoSheet(rerender) {
  const u = user.get(), prefs = user.prefs();
  const chip = (group, value, label, on, multi) => `<button type="button" class="chip" data-${group}="${value}" aria-pressed="${on}" ${multi ? '' : `role="radio" aria-checked="${on}"`}>${esc(label)}</button>`;
  openSheet({
    title: t('pf.info'),
    html: `<form class="flow__form" data-info novalidate>
      <label class="ffield"><span>${t('acc.name')}</span><input class="input" name="name" autocomplete="name" value="${esc(u.name)}" /></label>
      <label class="ffield"><span>${t('book.email')}</span><input class="input" name="email" type="email" autocomplete="email" value="${esc(u.email || '')}" /></label>
      <label class="ffield"><span>${t('acc.phone')}</span><input class="input" name="phone" type="tel" autocomplete="tel" value="${esc(u.phone || '')}" /></label>
      <fieldset class="prefs__group"><legend>${t('acc.budget')}</legend><div class="chips" role="radiogroup">${BUDGET.map((b) => chip('budget', b, t(`bud.${b}`), prefs.budget === b)).join('')}</div></fieldset>
      <fieldset class="prefs__group"><legend>${t('acc.interests')}</legend><div class="chips">${INTERESTS.map((i) => chip('interest', i, t(`int.${i}`), prefs.interests.includes(i), true)).join('')}</div></fieldset>
      <fieldset class="prefs__group"><legend>${t('acc.travel')}</legend><div class="chips" role="radiogroup">${TRAVEL.map((x) => chip('travel', x, t(`trav.${x}`), prefs.travel === x)).join('')}</div></fieldset>
      <p class="field-error" role="alert" data-err hidden></p>
      <button class="btn btn--blue btn--sq btn--block" type="submit">${t('acc.save')}</button>
      <p class="auth__demo">${t('acc.demo')}</p>
    </form>`,
    onMount: (body, close) => {
      const f = body.querySelector('[data-info]');
      f.addEventListener('click', (e) => {
        const b = e.target.closest('[data-budget],[data-travel],[data-interest]');
        if (!b) return;
        const group = b.dataset.budget ? 'budget' : b.dataset.travel ? 'travel' : 'interest';
        if (group === 'interest') b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
        else f.querySelectorAll(`[data-${group}]`).forEach((x) => { const on = x === b; x.setAttribute('aria-pressed', String(on)); x.setAttribute('aria-checked', String(on)); });
      });
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!f.name.value.trim()) { const err = f.querySelector('[data-err]'); err.textContent = t('acc.err'); err.hidden = false; f.name.focus(); return; }
        user.set({ ...u, name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim() });
        user.setPrefs({
          budget: f.querySelector('[data-budget][aria-pressed="true"]')?.dataset.budget || 'mid',
          travel: f.querySelector('[data-travel][aria-pressed="true"]')?.dataset.travel || 'couple',
          interests: [...f.querySelectorAll('[data-interest][aria-pressed="true"]')].map((x) => x.dataset.interest),
        });
        close();
        toast(t('acc.saved'), { tone: 'ok' });
        rerender();
      });
    },
  });
}

function settingsSheet(rerender) {
  const group = (title, rows) => `<p class="st-group__title">${title}</p><div class="st-group">${rows.join('')}</div>`;
  const row = (key, ic, label, extra = '') => `<button type="button" class="st-row" data-st="${key}">${icon(ic)}<span>${label}</span>${extra}</button>`;
  const toggle = (key) => `<span class="st-toggle ${store.get(key) ? 'is-on' : ''}" aria-hidden="true"></span>`;
  openSheet({
    title: t('pf.settings'),
    html: `<div class="st">
      ${group(t('st.account'), [row('edit', 'user', t('st.edit')), row('security', 'shield', t('st.security')), row('notif', 'bell', t('pf.notifications'), `<span class="st-toggle ${store.get('notifOff') ? '' : 'is-on'}" aria-hidden="true"></span>`), row('privacy', 'lock', t('st.privacy'))])}
      ${group(t('st.support'), [row('sub', 'card', t('st.subscription')), row('help', 'help', t('st.help')), row('terms', 'info', t('st.terms'))])}
      ${group(t('st.cache'), [row('free', 'trash', t('st.free')), row('saver', 'gauge', t('st.saver'), toggle('dataSaver'))])}
      ${group(t('st.actions'), [row('report', 'flag', t('st.report')), row('add', 'users', t('st.add')), row('logout', 'logout', t('acc.logout'))])}
    </div>`,
    onMount: (body, close) => {
      body.addEventListener('click', async (e) => {
        const r = e.target.closest('[data-st]'); if (!r) return;
        const k = r.dataset.st;
        if (k === 'edit') { close(); setTimeout(() => infoSheet(rerender), 350); }
        if (k === 'security') toast(t('st.securityP'));
        if (k === 'privacy') toast(t('st.privacyP'));
        if (k === 'notif') { store.set('notifOff', !store.get('notifOff')); r.querySelector('.st-toggle')?.classList.toggle('is-on', !store.get('notifOff')); toast(t(store.get('notifOff') ? 'st.notifOff' : 'st.notifOn')); }
        if (k === 'saver') { store.set('dataSaver', !store.get('dataSaver')); r.querySelector('.st-toggle').classList.toggle('is-on', !!store.get('dataSaver')); toast(t(store.get('dataSaver') ? 'st.saverOn' : 'st.saverOff')); }
        if (k === 'sub') { close(); barba.go('guide.html'); }
        if (k === 'help' || k === 'report') window.location.href = `mailto:contact@hailla.dz?subject=${encodeURIComponent(k === 'help' ? 'Aide HAILLA' : 'Signalement HAILLA')}`;
        if (k === 'terms') { close(); barba.go('a-propos.html'); }
        if (k === 'free' && (await confirmDialog(t('st.freeQ'), { yes: t('st.freeYes') }))) { ['chat', 'tr-log', 'tips'].forEach((x) => store.set(x, [])); toast(t('st.freed'), { tone: 'ok' }); }
        if (k === 'add' || k === 'logout') { user.clear(); close(); rerender(); }
      });
    },
  });
}

export function bindProfile(host, rerender) {
  host.addEventListener('click', (e) => {
    const r = e.target.closest('[data-pf]'); if (!r) return;
    const k = r.dataset.pf;
    if (k === 'info') infoSheet(rerender);
    if (k === 'history') barba.go('voyages.html');
    if (k === 'saved') barba.go('voyages.html#favoris');
    if (k === 'settings') settingsSheet(rerender);
    if (k === 'notif') {
      store.set('notifSeen', true);
      r.querySelector('.pf-dot')?.remove();
      openSheet({ title: t('pf.notifications'), html: `<ul class="notif-list" role="list">${notifications().map((n) => `<li>${icon(n.icon)}<span>${esc(n.text)}</span></li>`).join('')}</ul>` });
    }
  });
}

