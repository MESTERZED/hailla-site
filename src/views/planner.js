// "Plan a New Trip" → "AI Trip Assistant" → "Customize Your Trip" → "Trip Plan" (app screens)
import barba from '@barba/core';
import { t, loc } from '../core/i18n.js';
import { icon, imgSrc, toast } from '../core/ui.js';
import { esc, date, isoDay, addDays } from '../core/format.js';
import { store } from '../core/store.js';
import { CITIES, POIS, STAYS } from '../data/places.js';
import { DISHES, DAY_TRIPS } from '../chat/engine.js';

const L = (fr, en, ar) => ({ fr, en, ar });
const DESTS = [
  { city: 'alger', img: 'alger-baie', tag: L('La Blanche, entre Casbah et baie', 'The White City, Casbah and bay', 'البيضاء، بين القصبة والخليج') },
  { city: 'oran', img: 'santa-cruz', tag: L('El Bahia, raï et front de mer', 'El Bahia, raï and seafront', 'الباهية، الراي والواجهة البحرية') },
  { city: 'bejaia', img: 'cap-carbon', tag: L('Falaises, Gouraya et criques', 'Cliffs, Gouraya and coves', 'منحدرات، قورايا وخلجان') },
  { city: 'tipaza', img: 'tipaza-ruines', tag: L('Ruines romaines au bord de l’eau', 'Roman ruins by the sea', 'آثار رومانية على البحر') },
  { city: 'tizi', img: 'djurdjura', tag: L('Djurdjura et villages kabyles', 'Djurdjura and Kabyle villages', 'جرجرة والقرى القبائلية') },
  { city: 'taghit', img: 'taghit', tag: L('Le joyau du Sahara — bientôt', 'The jewel of the Sahara — soon', 'جوهرة الصحراء — قريبًا'), soon: true },
];
// Extra day trips once a city's own sites are covered (the first one comes from the guide engine).
const MORE_TRIPS = {
  alger: [L('Forêt de cèdres de Chréa, au-dessus de Blida', 'Chréa cedar forest above Blida', 'غابة أرز الشريعة فوق البليدة')],
  tipaza: [L('Randonnée sur le mont Chenoua', 'Hike on Mount Chenoua', 'نزهة على جبل شنوة')],
  bejaia: [L('Gorges de Kherrata et cascade de Kefrida', 'Kherrata gorges and Kefrida waterfall', 'مضائق خراطة وشلال كفريدة')],
  oran: [L('Tlemcen et ses monuments mérinides (2 h 30)', 'Tlemcen and its Marinid monuments (2 h 30)', 'تلمسان ومعالمها المرينية (ساعتان ونصف)')],
  tizi: [L('Tikjda et le lac Agoulmime', 'Tikjda and Lake Agoulmime', 'تيكجدة وبحيرة أقولميم')],
};
const EXPERIENCES = [['history', 'patrimoine'], ['nature', 'nature'], ['beach', 'plage'], ['food', 'cafe']];
const BUDGETS = ['eco', 'comfort', 'premium', 'luxury'];
const FLEX = ['exact', 'pm2', 'week', 'exploring'];
const WHO = ['solo', 'couple', 'family', 'friends'];
const INTERESTS = [['culture', ['patrimoine', 'musee']], ['nature', ['nature', 'plage']], ['gastro', ['cafe']], ['adventure', ['nature']], ['shopping', ['souvenir']]];
const WHO_ICON = { solo: 'user', couple: 'users', family: 'family', friends: 'sparkle' };
const EXP_ICON = { history: 'musee', nature: 'nature', beach: 'plage', food: 'restaurant' };

function buildPlan(s) {
  const expCat = EXPERIENCES.find(([k]) => k === s.exp)?.[1];
  const cats = new Set([expCat, ...s.interests.flatMap((i) => INTERESTS.find(([k]) => k === i)[1])].filter(Boolean));
  const pois = POIS.filter((p) => p.city === s.city);
  const score = (p) => (cats.has(p.cat) ? 2 : 0) + p.rating;
  const main = pois.filter((p) => !['cafe', 'souvenir'].includes(p.cat)).sort((a, b) => score(b) - score(a));
  const cafes = pois.filter((p) => p.cat === 'cafe');
  const shops = pois.filter((p) => p.cat === 'souvenir');
  const budgetMax = { eco: 5000, comfort: 12000, premium: 25000, luxury: 1e9 }[s.budget];
  const stays = STAYS.filter((x) => x.city === s.city);
  const stay = stays.filter((x) => x.price <= budgetMax).sort((a, b) => b.rating - a.rating)[0] || stays.sort((a, b) => a.price - b.price)[0];
  const days = [];
  const perDay = Math.min(2, Math.max(1, Math.ceil(main.length / s.days)));
  let trip = 0;
  for (let d = 0; d < s.days; d++) {
    const a = main[d * perDay], b = perDay > 1 ? main[d * perDay + 1] : null;
    const items = [];
    if (a) items.push({ time: '10:00', place: a });
    else {
      const trips = [DAY_TRIPS[s.city], ...(MORE_TRIPS[s.city] || [])];
      items.push({ time: '09:00', text: loc(trips[trip % trips.length]), meta: t('pl.dayTrip') });
      trip++;
    }
    const cafe = cafes[d % Math.max(cafes.length, 1)];
    items.push(cafe ? { time: '13:00', place: cafe, meta: loc(DISHES[s.city]) } : { time: '13:00', text: t('pl.lunch'), meta: loc(DISHES[s.city]) });
    if (b) items.push({ time: '15:30', place: b });
    if (d === s.days - 1 && shops[0]) items.push({ time: '18:00', place: shops[0] });
    const title = a ? loc(a.name) : t('pl.dayTrip');
    days.push({ title: d === 0 ? `${t('pl.arrival')} & ${title}` : title, items });
  }
  return { stay, days, places: new Set(days.flatMap((d) => d.items.filter((i) => i.place && i.place.cat !== 'cafe').map((i) => i.place.id))).size, dining: cafes.length };
}

export function mountPlanner(host) {
  const s = { step: 'where', city: null, q: '', exp: 'history', budget: 'comfort', flex: 'pm2', days: 5, who: 'solo', interests: ['culture'], start: addDays(isoDay(), 14) };
  const progress = (n) => `<div class="pl-progress" aria-hidden="true"><span style="width:${n * 25}%"></span></div>`;
  const header = (title, { back = true, close = false, ai = false } = {}) => `
    <header class="app-screen__head">
      ${back ? `<button class="icon-btn icon-btn--soft" type="button" data-pl-back aria-label="${t('place.back')}">${icon('back', 'flip-rtl')}</button>` : '<span></span>'}
      <h2 class="app-screen__title">${ai ? `<span class="ai-pill">${icon('wand')} ${title}</span>` : title}</h2>
      ${close ? `<button class="icon-btn icon-btn--soft" type="button" data-pl-reset aria-label="${t('common.close')}">${icon('x')}</button>` : '<span></span>'}
    </header>`;

  const render = () => {
    let html = '';
    if (s.step === 'where') {
      const q = s.q.toLowerCase();
      const list = DESTS.filter((d) => !q || loc(CITIES[d.city].name).toLowerCase().includes(q));
      html = `${header(t('pl.newTrip'), { back: false })}
        <div class="pl-body">
          <h3 class="pl-big">${t('pl.where')}</h3>
          <p class="muted">${t('pl.whereP')}</p>
          <label class="pl-search">${icon('pin')}<span class="sr-only">${t('pl.whereP')}</span><input type="search" value="${esc(s.q)}" placeholder="${t('pl.wherePh')}" data-pl-q autocomplete="off" /></label>
          <p class="pl-label">${t('pl.popular')}</p>
          <div class="pl-dests" role="radiogroup" aria-label="${t('pl.popular')}">
            ${list.map((d) => `<button type="button" class="pl-dest ${d.soon ? 'is-soon' : ''}" role="radio" aria-checked="${s.city === d.city}" data-pl-city="${d.city}" ${d.soon ? 'aria-disabled="true"' : ''}>
              <img src="${imgSrc(d.img, 800)}" alt="" width="64" height="64" loading="lazy" />
              <span><strong>${esc(loc(CITIES[d.city].name))}</strong><span>${esc(loc(d.tag))}</span></span>
              <span class="pl-dest__go" aria-hidden="true">${icon(s.city === d.city ? 'check' : 'arrow', s.city === d.city ? '' : 'pl-diag')}</span>
            </button>`).join('') || `<p class="muted">${t('map.nores')}</p>`}
          </div>
          <button class="btn btn--yellow btn--block pl-cta" type="button" data-pl-next ${s.city ? '' : 'disabled'}>${t('pl.start')} ${icon('wand')}</button>
        </div>`;
    }
    if (s.step === 'assistant') {
      const q = (n, req, title, sub, inner) => `<fieldset class="pl-q"><legend class="sr-only">${title}</legend><p class="pl-q__meta"><span>${t('pl.question', { n })}</span><span>${t(req ? 'pl.required' : 'pl.optional')}</span></p><p class="pl-q__title">${title}</p>${sub ? `<p class="pl-q__sub">${sub}</p>` : ''}${inner}</fieldset>`;
      html = `${header(t('pl.assistant'), { ai: true, close: true })}
        <div class="pl-body">
          <p class="pl-step"><span>${t('pl.stepOf', { a: 1, b: 4 })}</span><button type="button" class="pl-link" data-pl-skip>${t('pl.skip')}</button></p>
          ${progress(1)}
          <h3 class="pl-mid">${t('pl.setup')}</h3>
          <p class="muted">${t('pl.setupP')}</p>
          ${q(1, true, t('pl.q1'), t('pl.q1s'), `<div class="pl-tiles" role="radiogroup">${EXPERIENCES.map(([k]) => `<button type="button" class="pl-tile" role="radio" aria-checked="${s.exp === k}" data-pl-exp="${k}">${icon(EXP_ICON[k])}<strong>${t(`pl.exp.${k}`)}</strong><span>${t(`pl.exp.${k}.s`)}</span></button>`).join('')}</div>`)}
          ${q(2, false, t('pl.q2'), '', `<div class="chips" role="radiogroup">${BUDGETS.map((k) => `<button type="button" class="chip chip--soft" role="radio" aria-checked="${s.budget === k}" aria-pressed="${s.budget === k}" data-pl-budget="${k}">${t(`pl.b.${k}`)}</button>`).join('')}</div>`)}
          ${q(3, false, t('pl.q3'), '', `<div class="chips" role="radiogroup">${FLEX.map((k) => `<button type="button" class="chip chip--soft" role="radio" aria-checked="${s.flex === k}" aria-pressed="${s.flex === k}" data-pl-flex="${k}">${t(`pl.f.${k}`)}</button>`).join('')}</div>`)}
          <div class="pl-foot"><p><span>${t('pl.upnext')}</span>${t('pl.upnextP')}</p><button class="btn btn--yellow" type="button" data-pl-next>${t('pl.continue')} ${icon('arrow', 'flip-rtl')}</button></div>
        </div>`;
    }
    if (s.step === 'customize') {
      html = `${header(t('pl.customize'))}
        <div class="pl-body">
          ${progress(3)}
          <p class="pl-q__title pl-q__title--lg">${t('pl.howLong')}</p>
          <div class="pl-days"><output class="pl-days__n" data-pl-days-out>${t('pl.daysN', { n: s.days })}</output><input type="range" min="1" max="7" value="${s.days}" data-pl-days aria-label="${t('pl.howLong')}" /></div>
          <p class="pl-q__title pl-q__title--lg">${t('pl.who')}</p>
          <div class="pl-who" role="radiogroup">${WHO.map((k) => `<button type="button" class="pl-who__opt" role="radio" aria-checked="${s.who === k}" data-pl-who="${k}">${icon(WHO_ICON[k])}<span>${t(`pl.w.${k}`)}</span></button>`).join('')}</div>
          <p class="pl-q__title pl-q__title--lg">${t('pl.interests')}</p>
          <p class="pl-q__sub">${t('pl.selectAll')}</p>
          <div class="chips">${INTERESTS.map(([k]) => `<button type="button" class="chip chip--dark" aria-pressed="${s.interests.includes(k)}" data-pl-int="${k}">${t(`pl.i.${k}`)}</button>`).join('')}</div>
          <div class="pl-foot pl-foot--center"><button type="button" class="pl-link" data-pl-next>${t('pl.skipShort')}</button><button class="btn btn--yellow" type="button" data-pl-next>${t('pl.continue')} ${icon('arrow', 'flip-rtl')}</button></div>
        </div>`;
    }
    if (s.step === 'result') {
      const plan = buildPlan(s);
      const end = addDays(s.start, s.days);
      html = `${header(t('pl.tripPlan'), { close: true })}
        <div class="pl-body">
          <h3 class="pl-big">${t('pl.yourTrip', { c: esc(loc(CITIES[s.city].name)) })}</h3>
          <p class="pl-date">${icon('calendar')} ${date(s.start, { day: 'numeric', month: 'short' })} – ${date(end, { day: 'numeric', month: 'short' })} (${t('pl.daysN', { n: s.days })})</p>
          <div class="pl-sum">
            <a class="pl-sum__tile" href="lieu.html?id=${plan.stay.id}">${icon('hotel')}<strong>${t('pl.hotels')}</strong><span>${esc(loc(plan.stay.name))}</span></a>
            <div class="pl-sum__tile">${icon('restaurant')}<strong>${t('pl.dining')}</strong><span>${t('pl.diningN', { n: plan.dining })}</span></div>
            <div class="pl-sum__tile">${icon('pin')}<strong>${t('pl.places')}</strong><span>${t('pl.placesN', { n: plan.places })}</span></div>
            <a class="pl-sum__tile" href="explorer.html?tab=flights">${icon('plane')}<strong>${t('ex.flights')}</strong><span>${t('pl.flightsP')}</span></a>
          </div>
          <p class="pl-label pl-label--row"><span>${t('pl.unforgettable')}</span></p>
          <ol class="pl-timeline" role="list">
            ${plan.days.map((d, i) => `<li class="pl-day"><p class="pl-day__title">${t('pl.dayN', { n: i + 1 })} • ${esc(d.title)}</p>
              <ul role="list">${d.items.map((it) => `<li>${it.place
                ? `<a class="pl-item" href="lieu.html?id=${it.place.id}"><img src="${imgSrc(it.place.img, 800)}" alt="" width="72" height="72" loading="lazy" /><span><span class="pl-item__time">${it.time}</span><strong>${esc(loc(it.place.name))}</strong><span class="pl-item__meta">${esc(it.meta || loc(it.place.desc))}</span></span></a>`
                : `<div class="pl-item pl-item--text"><span class="pl-item__ph" aria-hidden="true">${icon('sun')}</span><span><span class="pl-item__time">${it.time}</span><strong>${esc(it.text)}</strong><span class="pl-item__meta">${esc(it.meta || '')}</span></span></div>`}</li>`).join('')}</ul></li>`).join('')}
          </ol>
          <div class="pl-actions">
            <button class="btn btn--ink" type="button" data-pl-confirm>${icon('check')} ${t('pl.confirm')}</button>
            <button class="btn btn--ghost" type="button" data-pl-reset>${icon('wand')} ${t('pl.newPlan')}</button>
          </div>
        </div>`;
      s.plan = plan;
    }
    host.innerHTML = html;
  };

  const go = (step) => { s.step = step; render(); host.scrollIntoView({ block: 'start', behavior: 'smooth' }); host.querySelector('h3, .app-screen__title')?.focus?.(); };

  host.addEventListener('click', (e) => {
    const el = (sel) => e.target.closest(sel);
    if (el('[data-pl-city]')) { const b = el('[data-pl-city]'); if (b.getAttribute('aria-disabled') === 'true') { toast(t('pl.soon')); return; } s.city = b.dataset.plCity; render(); host.querySelector('[data-pl-next]')?.focus(); return; }
    if (el('[data-pl-exp]')) { s.exp = el('[data-pl-exp]').dataset.plExp; render(); return; }
    if (el('[data-pl-budget]')) { s.budget = el('[data-pl-budget]').dataset.plBudget; render(); return; }
    if (el('[data-pl-flex]')) { s.flex = el('[data-pl-flex]').dataset.plFlex; render(); return; }
    if (el('[data-pl-who]')) { s.who = el('[data-pl-who]').dataset.plWho; render(); return; }
    if (el('[data-pl-int]')) { const k = el('[data-pl-int]').dataset.plInt; s.interests = s.interests.includes(k) ? s.interests.filter((x) => x !== k) : [...s.interests, k]; render(); return; }
    if (el('[data-pl-skip]')) { go('customize'); return; }
    if (el('[data-pl-back]')) { go({ assistant: 'where', customize: 'assistant', result: 'customize' }[s.step]); return; }
    if (el('[data-pl-reset]')) { Object.assign(s, { step: 'where', city: null, q: '' }); render(); return; }
    if (el('[data-pl-next]')) { if (s.step === 'where' && !s.city) return; go({ where: 'assistant', assistant: 'customize', customize: 'result' }[s.step]); return; }
    if (el('[data-pl-confirm]')) {
      store.update('plans', (l) => [{ id: Date.now().toString(36), city: s.city, start: s.start, days: s.days, who: s.who, plan: s.plan.days.map((d) => ({ title: d.title, items: d.items.map((i) => ({ time: i.time, id: i.place?.id || null, text: i.text || null })) })), stay: s.plan.stay.id }, ...l], []);
      toast(t('pl.saved'), { tone: 'ok' });
      setTimeout(() => barba.go('voyages.html#plans'), 600);
    }
  });
  host.addEventListener('input', (e) => {
    if (e.target.matches('[data-pl-q]')) { s.q = e.target.value; const pos = e.target.selectionStart; render(); const inp = host.querySelector('[data-pl-q]'); inp.focus(); inp.setSelectionRange(pos, pos); }
    if (e.target.matches('[data-pl-days]')) { s.days = Number(e.target.value); host.querySelector('[data-pl-days-out]').textContent = t('pl.daysN', { n: s.days }); }
  });

  render();
  return { set: (city) => { if (CITIES[city]?.phase === 1) { s.city = city; s.step = 'assistant'; render(); } } };
}
