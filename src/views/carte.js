import { t, loc } from '../core/i18n.js';
import { icon, imgTag, favBtn, stars, toast } from '../core/ui.js';
import { distance, haversine, esc, money } from '../core/format.js';
import { createMap, pinIcon, youIcon, locate, knownPosition, L } from '../core/map.js';
import { CITIES, POIS, STAYS, POI_CATS, STAY_TYPES } from '../data/places.js';

const CAT_ICON = { cafe: 'cafe', hotel: 'hotel', musee: 'musee', souvenir: 'souvenir', plage: 'plage', patrimoine: 'patrimoine', nature: 'nature' };

export function init(root) {
  const params = new URLSearchParams(location.search);
  const places = [
    ...POIS.map((p) => ({ ...p, kind: 'poi' })),
    ...STAYS.map((s) => ({ ...s, kind: 'stay', cat: 'hotel', img: s.images[0] })),
  ];
  const state = {
    cat: POI_CATS[params.get('cat')] ? params.get('cat') : 'all',
    city: CITIES[params.get('city')] ? params.get('city') : 'tipaza',
    q: '',
    active: params.get('focus') || null,
  };
  let me = knownPosition();

  const map = createMap(root.querySelector('[data-map]'), { center: [CITIES[state.city].lat, CITIES[state.city].lng], zoom: 13 });
  const layer = L.layerGroup().addTo(map);
  let youMarker = me ? L.marker([me.lat, me.lng], { icon: youIcon(), interactive: false }).addTo(map) : null;
  const markers = new Map();

  const cats = root.querySelector('[data-map-cats]');
  cats.innerHTML = [['all', t('map.all')], ...Object.entries(POI_CATS).map(([k, v]) => [k, loc(v)])]
    .map(([k, label]) => `<button type="button" class="chip" data-cat="${k}" aria-pressed="${k === state.cat}">${k === 'all' ? icon('map') : icon(CAT_ICON[k])}${esc(label)}</button>`).join('');
  const cities = root.querySelector('[data-map-cities]');
  cities.innerHTML = Object.entries(CITIES).filter(([, c]) => c.phase === 1)
    .map(([k, c]) => `<button type="button" class="chip chip--sm" data-city="${k}" aria-pressed="${k === state.city}">${esc(loc(c.name))}</button>`).join('');

  const cards = root.querySelector('[data-map-cards]');
  const origin = (p) => me || CITIES[p.city];

  const visible = () => {
    const q = state.q.toLowerCase();
    return places
      .filter((p) => (state.cat === 'all' || p.cat === state.cat) && (!q || loc(p.name).toLowerCase().includes(q) || p.name.fr.toLowerCase().includes(q)))
      .filter((p) => q || p.city === state.city)
      .map((p) => ({ ...p, km: haversine(origin(p), p) }))
      .sort((a, b) => a.km - b.km);
  };

  const card = (p) => `
    <article class="map-card ${p.id === state.active ? 'is-active' : ''}" data-card="${p.id}">
      <a class="map-card__media" href="lieu.html?id=${p.id}" tabindex="-1" aria-hidden="true">${imgTag(p.img, '', { sizes: '260px' })}</a>
      ${favBtn(p.id)}
      <div class="map-card__body">
        <p class="map-card__meta">${esc(p.kind === 'stay' ? loc(STAY_TYPES[p.type]) : loc(POI_CATS[p.cat]))}${p.kind === 'stay' ? ` · ${money(p.price)}` : ''}</p>
        <h2 class="map-card__title"><a href="lieu.html?id=${p.id}">${esc(loc(p.name))}</a></h2>
        <div class="map-card__foot"><span class="map-card__dist">${icon('locate')} ${distance(p.km)}</span>${stars(p.rating)}</div>
      </div>
    </article>`;

  const setActive = (id, { pan = true, scrollCard = true } = {}) => {
    state.active = id;
    markers.forEach((m, mid) => m.setIcon(pinIcon(CAT_ICON[m.options.cat], { active: mid === id, label: m.options.title })));
    cards.querySelectorAll('[data-card]').forEach((c) => c.classList.toggle('is-active', c.dataset.card === id));
    const m = markers.get(id);
    if (m && pan) map.panTo(m.getLatLng(), { animate: true });
    if (scrollCard) cards.querySelector(`[data-card="${id}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const render = ({ fit = false } = {}) => {
    const list = visible();
    layer.clearLayers(); markers.clear();
    list.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: pinIcon(CAT_ICON[p.cat], { active: p.id === state.active, label: loc(p.name) }), title: loc(p.name), cat: p.cat, keyboard: true, riseOnHover: true });
      m.on('click', () => setActive(p.id, { pan: false }));
      m.addTo(layer); markers.set(p.id, m);
    });
    cards.innerHTML = list.length
      ? `<p class="map-cards__label mono">${t('map.near', { c: loc(CITIES[state.city].name) })} · ${list.length}</p><div class="map-cards__track" data-lenis-prevent>${list.map(card).join('')}</div>`
      : `<div class="map-cards__empty">${t('map.nores')}</div>`;
    if (fit && list.length) map.fitBounds(L.latLngBounds(list.map((p) => [p.lat, p.lng])), { padding: [80, 80], maxZoom: 15 });
  };

  cats.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    state.cat = b.dataset.cat;
    cats.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    render({ fit: true });
  });
  cities.addEventListener('click', (e) => {
    const b = e.target.closest('[data-city]'); if (!b) return;
    state.city = b.dataset.city; state.active = null;
    cities.querySelectorAll('[data-city]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    root.dataset.place = loc(CITIES[state.city].name);
    map.flyTo([CITIES[state.city].lat, CITIES[state.city].lng], 13, { duration: 1.2 });
    render();
  });
  let qTimer;
  root.querySelector('[data-map-search]').addEventListener('input', (e) => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { state.q = e.target.value.trim(); render({ fit: true }); }, 180);
  });
  cards.addEventListener('mouseover', (e) => {
    const c = e.target.closest('[data-card]');
    if (c && c.dataset.card !== state.active) setActive(c.dataset.card, { scrollCard: false });
  });
  cards.addEventListener('focusin', (e) => {
    const c = e.target.closest('[data-card]');
    if (c && c.dataset.card !== state.active) setActive(c.dataset.card, { scrollCard: false });
  });

  const locBtn = root.querySelector('[data-locate]');
  locBtn.addEventListener('click', async () => {
    locBtn.classList.add('is-busy');
    toast(t('map.locating'));
    try {
      me = await locate();
      youMarker?.remove();
      youMarker = L.marker([me.lat, me.lng], { icon: youIcon(), interactive: false }).addTo(map);
      map.flyTo([me.lat, me.lng], 14);
      toast(t('map.located'), { tone: 'ok' });
      render();
    } catch {
      toast(t('map.denied'));
    } finally { locBtn.classList.remove('is-busy'); }
  });

  render();
  if (state.active) { const p = places.find((x) => x.id === state.active); if (p) { state.city = p.city; map.setView([p.lat, p.lng], 15); render(); setActive(p.id); } }
  setTimeout(() => map.invalidateSize(), 100);
  return () => { clearTimeout(qTimer); map.remove(); };
}
