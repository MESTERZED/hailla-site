// Persistent shell: header, mobile menu, language switch, latitude rail.
import { getLang, setLang, onLangChange, t } from './i18n.js';
import { bookings, store } from './store.js';
import { coord } from './format.js';
import { ScrollTrigger } from './motion.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function initShell() {
  // Language switch (header + mobile menu)
  const syncLangButtons = () => $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (b) setLang(b.dataset.lang);
  });
  onLangChange(syncLangButtons);
  syncLangButtons();

  // Mobile menu
  const menu = $('[data-menu]');
  const burger = $('[data-burger]');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('is-locked', open);
    open ? window.__scroll?.stop() : window.__scroll?.start();
    if (open) $('[data-menu-close]', menu).focus();
    else burger.focus({ preventScroll: true });
  };
  burger.addEventListener('click', () => setMenu(true));
  $('[data-menu-close]', menu).addEventListener('click', () => setMenu(false));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });

  // Header hides when scrolling down, returns when scrolling up.
  const header = $('[data-header]');
  let last = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('is-hidden', y > 240 && y > last + 4 && !document.documentElement.classList.contains('is-locked'));
    if (y < last - 4 || y < 240) header.classList.remove('is-hidden');
    last = y;
  }, { passive: true });

  // Upcoming-trip dot on the suitcase icon
  const syncTripsDot = () => {
    const icon = $('[data-trips-icon]');
    const has = bookings.all().some((b) => b.status === 'ok' && b.out >= new Date().toISOString().slice(0, 10));
    icon.querySelector('.dot')?.remove();
    if (has) icon.insertAdjacentHTML('beforeend', '<span class="dot" aria-hidden="true"></span>');
  };
  store.on('bookings', syncTripsDot);
  syncTripsDot();
}

let headerTrigger = null;

// Called on every page (first load and after each Barba transition).
export function syncShell(container) {
  const ns = container.dataset.barbaNamespace;
  document.documentElement.dataset.page = ns;

  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === ns) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  // Latitude rail shows where this page "is".
  const lat = Number(container.dataset.lat), lng = Number(container.dataset.lng);
  if (!Number.isNaN(lat)) $('[data-lat-coord]').textContent = coord(lat, lng);
  $('[data-lat-place]').textContent = container.dataset.place || '';

  // Dark header + light rail while the page's dark hero is under them.
  headerTrigger?.kill();
  const header = $('[data-header]'), rail = $('[data-lat-rail]');
  const dark = container.dataset.header === 'dark';
  const setDark = (on) => { header.classList.toggle('is-dark', on); rail.classList.toggle('is-light', on); };
  setDark(dark);
  if (dark) {
    const hero = container.firstElementChild?.matches('[data-place-root]') ? container.querySelector('.place-hero') || container.firstElementChild : container.firstElementChild;
    headerTrigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top+=70',
      onLeave: () => setDark(false),
      onEnterBack: () => setDark(true),
    });
  }
}

export const pageLabel = (container) => container?.dataset.place || t('nav.home');
