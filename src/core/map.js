import L from 'leaflet';
import { icon } from './ui.js';
import { store } from './store.js';

export { L };

export function createMap(el, { center = [36.6, 3.2], zoom = 8, interactive = true } = {}) {
  el.setAttribute('data-lenis-prevent', '');
  const map = L.map(el, {
    center, zoom,
    zoomControl: interactive,
    scrollWheelZoom: interactive,
    dragging: interactive,
    touchZoom: interactive,
    doubleClickZoom: interactive,
    keyboard: interactive,
    attributionControl: true,
  });
  // OpenStreetMap standard tiles (no key). Softened in CSS to sit with the brand palette.
  // For production traffic, switch to a hosted tile provider per the OSM tile usage policy.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  if (interactive) map.zoomControl.setPosition(document.dir === 'rtl' ? 'bottomleft' : 'bottomright');
  return map;
}

// Dark round pins with a white glyph, like the app.
export const pinIcon = (glyph, { active = false, label = '' } = {}) =>
  L.divIcon({
    className: '',
    html: `<span class="pin ${active ? 'is-active' : ''}" ${label ? `aria-label="${label}"` : ''}>${icon(glyph)}</span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

export const priceIcon = (text, active = false) =>
  L.divIcon({ className: '', html: `<span class="pin-price ${active ? 'is-active' : ''}">${text}</span>`, iconSize: null, iconAnchor: [30, 18] });

export const youIcon = () => L.divIcon({ className: '', html: '<span class="pin-you" aria-hidden="true"></span>', iconSize: [22, 22], iconAnchor: [11, 11] });

// Geolocation, remembered for the session so distances stay consistent across pages.
export function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; store.set('geo', p); resolve(p); },
      reject,
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 }
    );
  });
}
export const knownPosition = () => store.get('geo', null);
