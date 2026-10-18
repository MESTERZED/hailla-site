import { getLang, t } from './i18n.js';

const locale = () => ({ fr: 'fr-DZ', en: 'en-GB', ar: 'ar-DZ' })[getLang()];

// Latin digits everywhere (Algerian usage, also in Arabic UI).
export const num = (n, opts = {}) => new Intl.NumberFormat(`${locale()}-u-nu-latn`, opts).format(n);
export const money = (n) => `${num(n)} ${t('common.dzd')}`;

export function distance(km) {
  if (km == null || Number.isNaN(km)) return '';
  return km < 1 ? `${num(Math.round(km * 1000 / 10) * 10)} ${t('common.m')}` : `${num(km, { maximumFractionDigits: km < 10 ? 1 : 0 })} ${t('common.km')}`;
}

export function haversine(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const date = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Intl.DateTimeFormat(`${locale()}-u-nu-latn`, opts).format(new Date(`${iso}T12:00:00`));

export const isoDay = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
export const addDays = (iso, n) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return isoDay(d); };
export const nightsBetween = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);

export const coord = (lat, lng) => {
  const ns = lat >= 0 ? 'N' : 'S', ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${ns} · ${Math.abs(lng).toFixed(4)}° ${ew}`;
};

export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// "08:00-18:00" → open now? ("24h" = always)
export function isOpen(hours, now = new Date()) {
  if (!hours) return null;
  if (hours === '24h') return true;
  const [a, b] = hours.split('-').map((h) => { const [H, M] = h.split(':').map(Number); return H * 60 + M; });
  const m = now.getHours() * 60 + now.getMinutes();
  return b > a ? m >= a && m < b : m >= a || m < b;
}
