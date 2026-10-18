import { t, loc } from '../core/i18n.js';
import { stayCard, icon, toast } from '../core/ui.js';
import { money, distance, haversine, esc, num } from '../core/format.js';
import { createMap, priceIcon, knownPosition, L } from '../core/map.js';
import { CITIES, STAYS, STAY_TYPES, LANGS_SPOKEN } from '../data/places.js';

export function init(root) {
  const params = new URLSearchParams(location.search);
  const state = {
    city: CITIES[params.get('city')] ? params.get('city') : '',
    types: new Set(),
    budget: 20000,
    rating: 0,
    langs: new Set(),
    eco: params.get('eco') === '1',
    sort: 'reco',
    view: 'list',
  };
  const guests = Number(params.get('guests')) || 0;

  const form = root.querySelector('[data-filter-form]');
  const citySel = form.querySelector('[data-city-select]');
  Object.entries(CITIES).filter(([, c]) => c.phase === 1).forEach(([id, c]) => citySel.insertAdjacentHTML('beforeend', `<option value="${id}">${esc(loc(c.name))}</option>`));
  citySel.value = state.city;
  form.eco.checked = state.eco;

  const chipRow = (host, items, kind) => {
    host.innerHTML = items.map(([v, label]) => `<button type="button" class="chip" data-${kind}="${v}" aria-pressed="false">${esc(label)}</button>`).join('');
  };
  chipRow(form.querySelector('[data-type-chips]'), Object.entries(STAY_TYPES).map(([k, v]) => [k, loc(v)]), 'type');
  chipRow(form.querySelector('[data-rating-chips]'), [['0', t('stays.any')], ['4', '4,0 +'], ['4.5', '4,5 +']], 'rating');
  chipRow(form.querySelector('[data-lang-chips]'), Object.entries(LANGS_SPOKEN).map(([k, v]) => [k, loc(v)]), 'lang');

  const out = form.querySelector('[data-budget-out]');
  const syncControls = () => {
    form.querySelectorAll('[data-type]').forEach((b) => b.setAttribute('aria-pressed', String(state.types.has(b.dataset.type))));
    form.querySelectorAll('[data-rating]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.rating) === state.rating)));
    form.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(state.langs.has(b.dataset.lang))));
    form.budget.value = state.budget;
    out.textContent = money(state.budget);
  };

  const origin = () => knownPosition() || (state.city ? CITIES[state.city] : CITIES.alger);

  const filtered = () => {
    const o = origin();
    let list = STAYS.filter((s) =>
      (!state.city || s.city === state.city) &&
      (!state.types.size || state.types.has(s.type)) &&
      s.price <= state.budget &&
      s.rating >= state.rating &&
      (!state.langs.size || [...state.langs].every((l) => s.langs.includes(l))) &&
      (!state.eco || s.eco) &&
      (!guests || s.capacity >= Math.min(guests, 6))
    ).map((s) => ({ ...s, km: haversine(o, s) }));
    const by = { reco: (a, b) => b.rating * Math.log10(b.reviews) - a.rating * Math.log10(a.reviews), price: (a, b) => a.price - b.price, rating: (a, b) => b.rating - a.rating, dist: (a, b) => a.km - b.km };
    return list.sort(by[state.sort]);
  };

  const grid = root.querySelector('[data-results]');
  const mapEl = root.querySelector('[data-results-map]');
  const count = root.querySelector('[data-count]');
  let map = null, layer = null;

  const renderMap = (list) => {
    if (!map) { map = createMap(mapEl, { center: [36.4, 2.8], zoom: 7 }); layer = L.layerGroup().addTo(map); }
    layer.clearLayers();
    list.forEach((s) => {
      L.marker([s.lat, s.lng], { icon: priceIcon(money(s.price)), title: loc(s.name), keyboard: true })
        .bindPopup(`<a class="map-pop" href="lieu.html?id=${s.id}"><strong>${esc(loc(s.name))}</strong><span>${esc(loc(STAY_TYPES[s.type]))} · ${num(s.rating, { minimumFractionDigits: 1 })}★</span></a>`)
        .addTo(layer);
    });
    if (list.length) map.fitBounds(L.latLngBounds(list.map((s) => [s.lat, s.lng])), { padding: [40, 40], maxZoom: 12 });
    setTimeout(() => map.invalidateSize(), 50);
  };

  const render = () => {
    const list = filtered();
    count.textContent = list.length === 1 ? t('stays.result1') : t('stays.results', { n: list.length });
    if (!list.length) {
      grid.innerHTML = `<div class="empty">${icon('search')}<h2 class="h3">${t('stays.empty.t')}</h2><p class="muted">${t('stays.empty.p')}</p><button class="btn btn--ghost btn--sm" type="button" data-reset>${t('stays.reset')}</button></div>`;
    } else {
      grid.innerHTML = list.map((s) => stayCard(s, { dist: state.sort === 'dist' || knownPosition() ? distance(s.km) : '' })).join('');
    }
    if (state.view === 'map') renderMap(list);
    syncControls();
    const q = new URLSearchParams(location.search);
    state.city ? q.set('city', state.city) : q.delete('city');
    state.eco ? q.set('eco', '1') : q.delete('eco');
    history.replaceState(history.state, '', `${location.pathname}${q.toString() ? `?${q}` : ''}`);
  };

  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-type],[data-rating],[data-lang]');
    if (!b) return;
    if (b.dataset.type) state.types.has(b.dataset.type) ? state.types.delete(b.dataset.type) : state.types.add(b.dataset.type);
    if (b.dataset.rating !== undefined) state.rating = Number(b.dataset.rating);
    if (b.dataset.lang) state.langs.has(b.dataset.lang) ? state.langs.delete(b.dataset.lang) : state.langs.add(b.dataset.lang);
    render();
  });
  form.addEventListener('input', (e) => {
    if (e.target.name === 'budget') state.budget = Number(e.target.value);
    if (e.target.name === 'city') state.city = e.target.value;
    if (e.target.name === 'eco') state.eco = e.target.checked;
    render();
  });
  const reset = () => {
    Object.assign(state, { city: '', budget: 20000, rating: 0, eco: false });
    state.types.clear(); state.langs.clear();
    citySel.value = ''; form.eco.checked = false;
    render();
  };
  root.addEventListener('click', (e) => { if (e.target.closest('[data-reset]')) reset(); });

  root.querySelector('[data-sort]').addEventListener('change', (e) => {
    state.sort = e.target.value;
    if (state.sort === 'dist' && !knownPosition()) toast(t('map.denied'));
    render();
  });

  root.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    state.view = b.dataset.view;
    root.querySelectorAll('[data-view]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    grid.hidden = state.view === 'map';
    mapEl.hidden = state.view !== 'map';
    render();
  }));

  // Mobile filters drawer
  const aside = root.querySelector('[data-filters]');
  const setDrawer = (open) => {
    aside.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('is-locked', open);
    open ? window.__scroll?.stop() : window.__scroll?.start();
    if (open) aside.querySelector('select, button')?.focus();
  };
  root.querySelector('[data-open-filters]').addEventListener('click', () => setDrawer(true));
  root.querySelector('[data-close-filters]').addEventListener('click', () => setDrawer(false));
  const onKey = (e) => { if (e.key === 'Escape' && aside.classList.contains('is-open')) setDrawer(false); };
  document.addEventListener('keydown', onKey);
  aside.setAttribute('data-lenis-prevent', '');

  render();
  return () => {
    document.removeEventListener('keydown', onKey);
    if (aside.classList.contains('is-open')) setDrawer(false);
    map?.remove();
  };
}
