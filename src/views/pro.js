import { t, loc, getLang } from '../core/i18n.js';
import { toast } from '../core/ui.js';
import { store } from '../core/store.js';
import { num, esc } from '../core/format.js';
import { CITIES, STAY_TYPES } from '../data/places.js';

// Demo figures (labelled as such in the UI). Origin palette validated for the dark surface (dataviz validator).
const SEARCHES = [['alger', 4820], ['oran', 3610], ['bejaia', 3140], ['tipaza', 2380], ['tizi', 1930], ['ghardaia', 1210], ['djanet', 860]];
const MONTHS = [312, 288, 401, 520, 690, 940, 1460, 1610, 870, 610, 430, 520];
const ORIGIN = [['dz', 62, '#1f9e95'], ['dia', 24, '#b38c08'], ['int', 14, '#5b7ff0']];

export function init(root) {
  // Partner form
  const form = root.querySelector('[data-pro-form]');
  form.querySelector('[data-type-select]').innerHTML = Object.entries(STAY_TYPES).map(([k, v]) => `<option value="${k}">${esc(loc(v))}</option>`).join('') + `<option value="agence">${esc({ fr: 'Agence de voyage', en: 'Travel agency', ar: 'وكالة سياحية' }[getLang()])}</option>`;
  form.querySelector('[data-city-select]').innerHTML = Object.entries(CITIES).filter(([, c]) => c.phase === 1).map(([k, c]) => `<option value="${k}">${esc(loc(c.name))}</option>`).join('');
  const err = form.querySelector('[data-form-error]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    const bad = [];
    if (!form.name.value.trim()) bad.push(form.name);
    if (!form.phone.value.trim() && !form.email.value.trim()) bad.push(form.phone);
    if (form.email.value && !form.email.checkValidity()) bad.push(form.email);
    if (bad.length) {
      bad.forEach((x) => x.setAttribute('aria-invalid', 'true'));
      err.textContent = t('pro.form.err'); err.hidden = false; bad[0].focus();
      return;
    }
    err.hidden = true;
    store.update('partnerRequests', (l) => [{ ...Object.fromEntries(new FormData(form)), at: new Date().toISOString() }, ...l], []);
    form.reset();
    toast(t('pro.form.sent'), { tone: 'ok' });
  });

  // Dashboard
  const dash = root.querySelector('[data-dash]');
  const monthNames = Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat(`${getLang() === 'ar' ? 'ar-DZ' : getLang()}-u-nu-latn`, { month: 'short' }).format(new Date(2026, i, 1)));
  const total = MONTHS.reduce((a, b) => a + b, 0);

  dash.innerHTML = `
    <div class="kpis">
      <div class="kpi"><p class="kpi__label">${t('pro.dash.kpi1')}</p><p class="kpi__value">${num(8155)}</p></div>
      <div class="kpi"><p class="kpi__label">${t('pro.dash.kpi2')}</p><p class="kpi__value">50</p></div>
      <div class="kpi"><p class="kpi__label">${t('pro.dash.kpi3')}</p><p class="kpi__value">${num(4.5, { minimumFractionDigits: 1 })}<span>/5</span></p></div>
    </div>
    <figure class="chart chart--bars">
      <figcaption class="chart__title">${t('pro.dash.search')}</figcaption>
      <div class="bars" role="img" aria-label="${t('pro.dash.search')}">
        ${SEARCHES.map(([c, v]) => `<div class="bars__row" data-tip="${esc(loc(CITIES[c].name))} · ${num(v)}"><span class="bars__label">${esc(loc(CITIES[c].name))}</span><span class="bars__track"><span class="bars__bar" style="--w:${(v / SEARCHES[0][1]) * 100}%"></span></span><span class="bars__value">${num(v)}</span></div>`).join('')}
      </div>
      ${table([t('pro.dash.search'), ''], SEARCHES.map(([c, v]) => [loc(CITIES[c].name), num(v)]))}
    </figure>
    <figure class="chart chart--line">
      <figcaption class="chart__title">${t('pro.dash.month')} · <span class="muted">${num(total)}</span></figcaption>
      <div class="line" data-line></div>
      ${table([t('pro.dash.month'), ''], MONTHS.map((v, i) => [monthNames[i], num(v)]))}
    </figure>
    <figure class="chart chart--origin">
      <figcaption class="chart__title">${t('pro.dash.origin')}</figcaption>
      <div class="stack-bar" role="img" aria-label="${ORIGIN.map(([k, v]) => `${t(`pro.dash.${k}`)} ${v} %`).join(', ')}">
        ${ORIGIN.map(([k, v, c]) => `<span class="stack-bar__seg" style="--w:${v}%;--c:${c}" data-tip="${t(`pro.dash.${k}`)} · ${v} %"></span>`).join('')}
      </div>
      <ul class="legend" role="list">${ORIGIN.map(([k, v, c]) => `<li><span class="legend__sw" style="--c:${c}"></span>${t(`pro.dash.${k}`)} <strong>${v} %</strong></li>`).join('')}</ul>
    </figure>
    <div class="chart-tip" data-chart-tip role="status" hidden></div>`;

  drawLine(dash.querySelector('[data-line]'), MONTHS, monthNames);

  // Hover tooltips for bars & segments
  const tip = dash.querySelector('[data-chart-tip]');
  const show = (el, x, y) => { tip.textContent = el.dataset.tip; tip.hidden = false; const r = dash.getBoundingClientRect(); tip.style.transform = `translate(${x - r.left + 14}px, ${y - r.top - 36}px)`; };
  dash.addEventListener('pointermove', (e) => { const el = e.target.closest('[data-tip]'); if (el) show(el, e.clientX, e.clientY); else if (!e.target.closest('[data-line]')) tip.hidden = true; });
  dash.addEventListener('pointerleave', () => { tip.hidden = true; });
}

const table = (head, rows) => `<table class="sr-only"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

function drawLine(host, values, labels) {
  const W = 640, H = 240, P = { l: 44, r: 16, t: 16, b: 30 };
  const max = Math.ceil(Math.max(...values) / 500) * 500;
  const x = (i) => P.l + (i * (W - P.l - P.r)) / (values.length - 1);
  const y = (v) => H - P.b - (v / max) * (H - P.t - P.b);
  const pts = values.map((v, i) => [x(i), y(v)]);
  const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('');
  const area = `${d}L${x(values.length - 1)},${H - P.b}L${x(0)},${H - P.b}Z`;
  const ticks = [0, max / 2, max];
  const peak = values.indexOf(Math.max(...values));
  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${values.map((v, i) => `${labels[i]} ${v}`).join(', ')}">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ecdc4" stop-opacity=".35"/><stop offset="1" stop-color="#4ecdc4" stop-opacity="0"/></linearGradient></defs>
      ${ticks.map((v) => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${P.l - 8}" y="${y(v) + 4}" text-anchor="end" class="axis">${num(v)}</text>`).join('')}
      ${labels.map((l, i) => (i % 2 === 0 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="axis">${l}</text>` : '')).join('')}
      <path d="${area}" fill="url(#lg)"/>
      <path d="${d}" fill="none" stroke="#4ecdc4" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${pts[peak][0]}" cy="${pts[peak][1]}" r="5" fill="#4ecdc4" stroke="#13265a" stroke-width="2"/>
      <text x="${pts[peak][0] - 10}" y="${pts[peak][1] - 4}" text-anchor="end" class="label">${labels[peak]} · ${num(values[peak])}</text>
      <g data-cross hidden><line class="cross" y1="${P.t}" y2="${H - P.b}"/><circle r="5" fill="#fff" stroke="#4ecdc4" stroke-width="2"/></g>
      <rect x="${P.l}" y="${P.t}" width="${W - P.l - P.r}" height="${H - P.t - P.b}" fill="transparent" data-hit/>
    </svg>`;
  const svg = host.querySelector('svg');
  const cross = svg.querySelector('[data-cross]');
  const tip = host.closest('[data-dash]').querySelector('[data-chart-tip]');
  svg.querySelector('[data-hit]').addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(values.length - 1, Math.round(((sx - P.l) / (W - P.l - P.r)) * (values.length - 1))));
    cross.hidden = false;
    cross.querySelector('line').setAttribute('x1', x(i)); cross.querySelector('line').setAttribute('x2', x(i));
    cross.querySelector('circle').setAttribute('cx', x(i)); cross.querySelector('circle').setAttribute('cy', y(values[i]));
    tip.textContent = `${labels[i]} · ${num(values[i])}`;
    tip.hidden = false;
    const d = host.closest('[data-dash]').getBoundingClientRect();
    tip.style.transform = `translate(${r.left - d.left + (x(i) / W) * r.width + 12}px, ${r.top - d.top + (y(values[i]) / H) * r.height - 40}px)`;
  });
  svg.querySelector('[data-hit]').addEventListener('pointerleave', () => { cross.hidden = true; tip.hidden = true; });
}
