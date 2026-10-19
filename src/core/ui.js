import { t, loc } from './i18n.js';
import { favs } from './store.js';
import { money, esc, num } from './format.js';
import { CITIES, STAY_TYPES } from '../data/places.js';

// Stroke icons (24×24 grid, Lucide-style geometry).
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart: '<path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>',
  plane: '<path d="M10.5 13.5 3 11l1.5-1.5 7.5.5 4-4.5c.8-.8 2.2-.8 2.5-.5.3.3.3 1.7-.5 2.5l-4.5 4 .5 7.5L12.5 21 10 13.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 8 7.5 9 4.3-1 7.5-4.5 7.5-9V6Z"/><path d="M12 10v4M12 7.5v.01"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2.2-2.4 3.8M12 17v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  gauge: '<circle cx="12" cy="12" r="9"/><path d="m7 15 3-4 3 2.5L17 9"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  logout: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v1.5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V16a2 2 0 0 1 0-4 2 2 0 0 1 0-4V6.5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  translate: '<path d="M3 5h10M8 3v2M5.5 5c.8 3 3 5.5 6 7M10.5 5c-.8 3.5-3 6.5-6.5 8"/><path d="m12 21 4.5-10 4.5 10M13.5 17.5h6"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  chevronR: '<path d="m9 6 6 6-6 6"/>',
  wand: '<path d="m4 20 11-11M14 4l1.2 2.3L17.5 7.5l-2.3 1.2L14 11l-1.2-2.3L10.5 7.5l2.3-1.2ZM19 12l.7 1.3 1.3.7-1.3.7L19 16l-.7-1.3L17 14l1.3-.7Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/>',
  crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 10H5Z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  locate: '<path d="m3 11 18-8-8 18-2-8Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
  cafe: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>',
  hotel: '<path d="M3 19V7M3 13h18v6M21 13v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="10.5" r="1.8"/>',
  musee: '<path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  souvenir: '<rect x="3.5" y="8" width="17" height="12" rx="2"/><path d="M12 8v12M3.5 12.5h17M12 8C10.5 4 7 4 7 6s3 2 5 2c2 0 5 0 5-2s-3.5-2-5 2Z"/>',
  plage: '<path d="M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M12 15 8 5M5 7.5c2-3 7-4 10-1.5"/>',
  patrimoine: '<path d="M4 20V10a8 8 0 0 1 16 0v10"/><path d="M9 20v-6a3 3 0 0 1 6 0v6M2.5 20h19"/>',
  nature: '<path d="m12 3-6 9h3l-4 6h14l-4-6h3Z"/><path d="M12 18v3"/>',
  leaf: '<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19c3-4 6-6 9-8"/>',
  wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r=".8" fill="currentColor"/>',
  parking: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5"/>',
  breakfast: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/>',
  pool: '<path d="M2 17c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 21c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 14V5a2 2 0 0 1 4 0M16 14V5a2 2 0 0 0-4 0M8 9h8"/>',
  spa: '<path d="M12 21c-4.5 0-8-3-8-7 3 0 6 1.5 8 4 2-2.5 5-4 8-4 0 4-3.5 7-8 7Z"/><path d="M12 18c-2-2.5-2-7 0-11 2 4 2 8.5 0 11Z"/>',
  shuttle: '<path d="M5 17V9.5L7 5h10l2 4.5V17"/><path d="M3.5 10h17M5 17h14"/><circle cx="8" cy="17.5" r="1.8"/><circle cx="16" cy="17.5" r="1.8"/>',
  beach: '<path d="M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><circle cx="17" cy="7" r="3"/>',
  family: '<circle cx="8" cy="6" r="2.5"/><circle cx="16.5" cy="9" r="2"/><path d="M4 20v-5a4 4 0 0 1 8 0v5M13.5 20v-3.5a3 3 0 0 1 6 0V20"/>',
  clim: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 6l2.5-1.5M9.5 19.5 12 18l2.5 1.5"/>',
  restaurant: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5a2 2 0 0 0 2 2M9 3v5a2 2 0 0 1-2 2M17 21V3c-2 1-3 4-3 8h3"/>',
  terrace: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  hike: '<path d="m3 20 6-10 4 6 3-4 5 8Z"/><circle cx="16" cy="5.5" r="1.8"/>',
  share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4Z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  volume: '<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5Z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  sparkle: '<path d="M12 3c.8 4.2 2.8 6.2 7 7-4.2.8-6.2 2.8-7 7-.8-4.2-2.8-6.2-7-7 4.2-.8 6.2-2.8 7-7Z"/><path d="M19 16c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5Z"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  filter: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>',
  map: '<path d="m9 4-6 2.5v13.5L9 17.5l6 2.5 6-2.5V4L15 6.5Z"/><path d="M9 4v13.5M15 6.5V20"/>',
  play: '<path d="M7 4.5v15L19.5 12Z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  phone: '<path d="M5 3.5h3.5l1.5 4.5-2.2 1.4a11 11 0 0 0 6.8 6.8l1.4-2.2 4.5 1.5V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 7 8.5-7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  trips: '<rect x="3.5" y="7" width="17" height="13" rx="2.5"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3.5 12.5h17"/>',
  eye: '<path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/><circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L3.5 9M4 13a8 8 0 0 0 14.5 4.5l2-2.5"/><path d="M3.5 4v5h5M20.5 20v-5h-5"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
  google: '<path d="M20.5 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.6-3.9 2.6-6.5Z" fill="currentColor" stroke="none"/><path d="M12 21c2.4 0 4.5-.8 5.9-2.2l-2.9-2.2c-.8.5-1.8.9-3 .9a5.3 5.3 0 0 1-5-3.6H4v2.3A9 9 0 0 0 12 21Z" fill="currentColor" stroke="none" opacity=".75"/><path d="M7 13.9a5.4 5.4 0 0 1 0-3.5V8H4a9 9 0 0 0 0 8.2Z" fill="currentColor" stroke="none" opacity=".55"/><path d="M12 6.6c1.3 0 2.5.5 3.4 1.3L18 5.4A9 9 0 0 0 4 8l3 2.3a5.3 5.3 0 0 1 5-3.7Z" fill="currentColor" stroke="none" opacity=".9"/>',
  apple: '<path d="M16.4 12.6c0-2.4 2-3.5 2-3.6a4.3 4.3 0 0 0-3.4-1.8c-1.4-.2-2.8.8-3.5.8s-1.9-.8-3.1-.8A4.6 4.6 0 0 0 4.5 9.6c-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 2.9 2.4s1.6-.8 3-.8 1.8.8 3 .8 2-1.2 2.8-2.3a9.6 9.6 0 0 0 1.3-2.6 4 4 0 0 1-2.3-4ZM14.2 5.6A4 4 0 0 0 15.1 2.5a4.1 4.1 0 0 0-2.7 1.4 3.8 3.8 0 0 0-1 2.9 3.4 3.4 0 0 0 2.8-1.2Z" fill="currentColor" stroke="none"/>',
  playstore: '<path d="M4.5 3.3v17.4c0 .5.5.8.9.6L20 12.6a.7.7 0 0 0 0-1.2L5.4 2.7c-.4-.2-.9.1-.9.6Z"/><path d="m4.8 3 10 10M4.8 21l10-10"/>',
};

export const icon = (name, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || ''}</svg>`;

export const imgSrc = (id, w = 800) => `img/${id}-${w}.webp`;
export const imgTag = (id, alt = '', { sizes = '(max-width: 720px) 100vw, 50vw', eager = false, cls = '' } = {}) =>
  `<img class="${cls}" src="${imgSrc(id, 800)}" srcset="${imgSrc(id, 800)} 800w, ${imgSrc(id, 1600)} 1600w" sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="800" height="533">`;

export const stars = (r) => `<span class="rating" aria-label="${num(r, { minimumFractionDigits: 1 })} / 5">${num(r, { minimumFractionDigits: 1 })} ${icon('star', 'ico--fill')}</span>`;

export const favBtn = (id) => {
  const on = favs.has(id);
  return `<button class="fav ${on ? 'is-on' : ''}" type="button" data-fav="${id}" aria-pressed="${on}" aria-label="${t(on ? 'fav.remove' : 'fav.add')}">${icon('heart')}</button>`;
};

// "Available Hotels" card from the app: wide photo, heart, name + star chip, DZD price, View details.
export function hotelCard(s, { dist } = {}) {
  return `
  <article class="hotel-card" data-id="${s.id}">
    <a class="hotel-card__media" href="lieu.html?id=${s.id}" tabindex="-1" aria-hidden="true">
      ${imgTag(s.images[0], '', { sizes: '(max-width: 720px) 92vw, 380px' })}
      ${s.eco ? `<span class="badge badge--eco">${icon('leaf')}${t('place.eco')}</span>` : ''}
    </a>
    ${favBtn(s.id).replace('class="fav', 'class="fav fav--round')}
    <div class="hotel-card__body">
      <div class="hotel-card__row">
        <h3 class="hotel-card__title"><a href="lieu.html?id=${s.id}">${esc(loc(s.name))}</a></h3>
        <span class="star-chip">${icon('star')} ${num(s.rating, { minimumFractionDigits: 1 })}</span>
      </div>
      <p class="hotel-card__meta">${esc(loc(STAY_TYPES[s.type]))} · ${esc(loc(CITIES[s.city].name))}${dist ? ` · ${dist}` : ''}</p>
      <div class="hotel-card__foot">
        <p class="hotel-card__price"><strong>${t('common.dzd') === 'DA' ? 'DZD' : t('common.dzd')} ${num(s.price)}</strong><span>${t('stays.night')}</span></p>
        <a class="btn btn--blue btn--xs" href="lieu.html?id=${s.id}">${t('ex.details')}</a>
      </div>
    </div>
  </article>`;
}

export function stayCard(s, { dist } = {}) {
  return `
  <article class="stay-card" data-id="${s.id}">
    <a class="stay-card__media arch" href="lieu.html?id=${s.id}" aria-label="${esc(loc(s.name))}">
      ${imgTag(s.images[0], '', { sizes: '(max-width: 720px) 90vw, 360px' })}
      ${s.eco ? `<span class="badge badge--eco">${icon('leaf')}${t('place.eco')}</span>` : ''}
    </a>
    ${favBtn(s.id)}
    <div class="stay-card__body">
      <p class="stay-card__meta mono">${esc(loc(STAY_TYPES[s.type]))} · ${esc(loc(CITIES[s.city].name))}${dist ? ` · ${dist}` : ''}</p>
      <h3 class="stay-card__title"><a href="lieu.html?id=${s.id}">${esc(loc(s.name))}</a></h3>
      <p class="stay-card__tag">${esc(loc(s.tagline))}</p>
      <div class="stay-card__foot">
        <p class="price"><strong>${money(s.price)}</strong> <span>${t('stays.night')}</span></p>
        ${stars(s.rating)}
      </div>
    </div>
  </article>`;
}

// ── Toasts ────────────────────────────────────────────
export function toast(msg, { tone = 'info' } = {}) {
  let host = document.getElementById('toasts');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toasts';
    host.className = 'toasts';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    document.body.append(host);
  }
  const el = document.createElement('div');
  el.className = `toast toast--${tone}`;
  el.textContent = msg;
  host.append(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => { el.classList.remove('is-in'); setTimeout(() => el.remove(), 400); }, 3200);
}

// ── Dialog / bottom sheet (focus trap, Esc, restore focus) ──
export function openSheet({ title, html, onMount, onClose, wide = false, label }) {
  const prev = document.activeElement;
  const wrap = document.createElement('div');
  wrap.className = 'sheet';
  wrap.innerHTML = `
    <div class="sheet__scrim" data-close></div>
    <div class="sheet__panel ${wide ? 'sheet__panel--wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(label || title || '')}">
      <header class="sheet__head">
        ${title ? `<h2 class="sheet__title">${esc(title)}</h2>` : '<span></span>'}
        <button class="icon-btn" type="button" data-close aria-label="${t('common.close')}">${icon('x')}</button>
      </header>
      <div class="sheet__body">${html}</div>
    </div>`;
  document.body.append(wrap);
  document.documentElement.classList.add('is-locked');
  window.__scroll?.stop();
  const panel = wrap.querySelector('.sheet__panel');
  const focusables = () => [...panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')];

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    onClose?.();
    wrap.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => {
      wrap.remove();
      if (!document.querySelector('.sheet')) { document.documentElement.classList.remove('is-locked'); window.__scroll?.start(); }
      prev?.focus?.();
    }, 320);
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = focusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', onKey);
  wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  requestAnimationFrame(() => { wrap.classList.add('is-open'); focusables()[0]?.focus({ preventScroll: true }); });
  onMount?.(panel.querySelector('.sheet__body'), close);
  return close;
}

export function confirmDialog(message, { yes = t('common.yes'), no = t('common.cancel') } = {}) {
  return new Promise((resolve) => {
    let answer = false;
    openSheet({
      label: message,
      html: `<p class="confirm__msg">${esc(message)}</p><div class="confirm__actions"><button class="btn btn--ghost" type="button" data-no>${esc(no)}</button><button class="btn btn--danger" type="button" data-yes>${esc(yes)}</button></div>`,
      onMount: (body, done) => {
        body.querySelector('[data-yes]').addEventListener('click', () => { answer = true; done(); });
        body.querySelector('[data-no]').addEventListener('click', done);
      },
      onClose: () => resolve(answer),
    });
  });
}

// Global favourite toggling (works for cards rendered anywhere, including the chat).
export function bindFavourites() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    const on = favs.toggle(btn.dataset.fav);
    document.querySelectorAll(`[data-fav="${btn.dataset.fav}"]`).forEach((b) => {
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', t(on ? 'fav.remove' : 'fav.add'));
    });
    toast(t(on ? 'fav.added' : 'fav.removed'));
  });
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
