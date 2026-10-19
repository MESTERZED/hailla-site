import { t, loc } from '../core/i18n.js';
import { icon, imgTag, imgSrc, favBtn, openSheet, toast } from '../core/ui.js';
import { esc, num, money, isoDay, addDays, date } from '../core/format.js';
import { store, user } from '../core/store.js';
import { CITIES } from '../data/places.js';
import { GUIDES, GUIDE_REVIEWS, EVENTS, TOURS, INTERESTS, INTEREST_ICONS, ACTIVITIES, LANG_NAMES } from '../data/experiences.js';

const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);
const avatar = (g, cls = '') => `<span class="g-avatar ${cls}" style="--h:${g.hue}" aria-hidden="true">${esc(initials(g.name))}</span>`;
const findGuide = (id) => GUIDES.find((g) => g.id === id);

function eventWhen(e) {
  const day = addDays(isoDay(), e.inDays);
  if (e.inDays === 0) return t('xp.today', { h: e.time });
  if (e.inDays === 1) return t('xp.tomorrow', { h: e.time });
  return `${date(day, { weekday: 'short', day: 'numeric', month: 'short' })} · ${e.time}`;
}

function eventIcs(e) {
  const day = addDays(isoDay(), e.inDays).replaceAll('-', '');
  const [h, m] = e.time.split(':');
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HAILLA//Events//FR', 'BEGIN:VEVENT', `UID:${e.id}-${day}@hailla.dz`,
    `DTSTART:${day}T${h}${m}00`, `SUMMARY:${loc(e.name)}`, `LOCATION:${loc(e.venue)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
  a.download = `hailla-${e.id}.ics`;
  a.setAttribute('data-no-barba', '');
  document.body.append(a); a.click(); a.remove();
}

function openGuide(g) {
  const reviews = GUIDE_REVIEWS;
  openSheet({
    wide: true,
    label: g.name,
    html: `
      <article class="gprof">
        <div class="gprof__hero">${imgTag(g.img, '', { sizes: '(max-width: 760px) 100vw, 900px' })}${avatar(g, 'g-avatar--xl')}</div>
        <div class="gprof__id">
          <div><h2 class="gprof__name">${esc(g.name)}${g.top ? ` <span class="gprof__top" title="${t('xp.top')}">${icon('crown')}</span>` : ''}</h2><p class="gprof__loc">${icon('pin')} ${esc(loc(CITIES[g.city].name))}, ${t('xp.algeria')}</p></div>
          ${favBtn(g.id).replace('class="fav', 'class="fav fav--yellow')}
        </div>
        <section class="gprof__sec"><h3>${t('xp.about')}</h3><p class="muted">${esc(loc(g.bio))}</p></section>
        <section class="gprof__sec"><h3>${t('xp.interested')}</h3><div class="chips">${g.interests.map((i) => `<span class="chip chip--static">${icon(INTEREST_ICONS[i] === 'music' ? 'volume' : INTEREST_ICONS[i])}${esc(loc(INTERESTS[i]))}</span>`).join('')}</div></section>
        <section class="gprof__sec"><h3>${t('xp.languages')}</h3>
          <dl class="lang-bars">${Object.entries(g.langs).map(([k, v]) => `<div><dt>${esc(loc(LANG_NAMES[k]))}</dt><dd><span class="lang-bars__bar" role="meter" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${v}" aria-label="${esc(loc(LANG_NAMES[k]))}">${Array.from({ length: 5 }, (_, i) => `<i class="${i < v ? 'on' : ''}"></i>`).join('')}</span></dd></div>`).join('')}</dl>
        </section>
        <section class="gprof__sec"><h3>${t('xp.activities')}</h3><ul class="act-list" role="list">${g.activities.map((a) => `<li><span>${esc(loc(ACTIVITIES[a]))}</span>${icon(a === 'translate' ? 'translate' : a === 'shopping' ? 'souvenir' : a === 'food' ? 'restaurant' : a === 'driving' ? 'shuttle' : a === 'sport' ? 'hike' : 'patrimoine')}</li>`).join('')}</ul></section>
        <section class="gprof__sec"><h3>${t('xp.reviews', { n: g.reviews })}</h3>
          <ul class="g-reviews" role="list">${reviews.map((r) => `<li><span class="avatar" aria-hidden="true">${esc(r.name[0])}</span><div><strong>${esc(r.name)}</strong><p class="muted">${esc(loc(r.text))}</p></div><span class="rating">${num(r.rating, { minimumFractionDigits: 1 })} ${icon('star', 'ico--fill')}</span></li>`).join('')}</ul>
        </section>
        <div class="gprof__bar">
          <p class="gprof__price"><strong>${money(g.price)}</strong> ${t('xp.perHour')}</p>
          <button class="btn btn--ghost btn--sq" type="button" data-avail>${t('xp.availability')}</button>
          <button class="btn btn--yellow btn--sq" type="button" data-contact>${t('xp.contact')}</button>
        </div>
      </article>`,
    onMount: (body, close) => {
      body.addEventListener('click', (e) => {
        if (e.target.closest('[data-avail]')) {
          const days = Array.from({ length: 7 }, (_, i) => addDays(isoDay(), i + 1)).filter((_, i) => (i + g.hue) % 3 !== 0);
          toast(t('xp.availableOn', { d: days.slice(0, 3).map((d) => date(d, { weekday: 'short', day: 'numeric' })).join(', ') }));
        }
        if (e.target.closest('[data-contact]')) { close(); setTimeout(() => contactGuide(g), 350); }
      });
    },
  });
}

function contactGuide(g, tour) {
  const u = user.get();
  openSheet({
    title: t('xp.contactTitle', { n: g.name.split(' ')[0] }),
    html: `<form class="flow__form" data-contact-form novalidate>
      ${tour ? `<p class="muted">${esc(loc(tour.name))} · ${money(tour.price)} ${t('xp.perPerson')}</p>` : ''}
      <label class="ffield"><span>${t('book.name')}</span><input class="input" name="name" autocomplete="name" value="${esc(u?.name || '')}" /></label>
      <label class="ffield"><span>${t('flow.contact')}</span><input class="input" name="contact" autocomplete="tel" value="${esc(u?.phone || u?.email || '')}" /></label>
      <label class="ffield"><span>${t('xp.when')}</span><input class="input" type="date" name="date" min="${addDays(isoDay(), 1)}" value="${addDays(isoDay(), 7)}" /></label>
      <label class="ffield"><span>${t('xp.message')}</span><textarea class="textarea" name="msg" rows="3" placeholder="${t('xp.messagePh')}"></textarea></label>
      <p class="field-error" role="alert" data-err hidden></p>
      <button class="btn btn--yellow btn--block btn--sq" type="submit">${t('xp.send')}</button>
      <p class="flow__hint">${icon('info')} ${t('xp.demoContact')}</p>
    </form>`,
    onMount: (body, close) => {
      body.querySelector('[data-contact-form]').addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.currentTarget, err = f.querySelector('[data-err]');
        if (!f.name.value.trim() || !f.contact.value.trim()) { err.textContent = t('book.err.fields'); err.hidden = false; return; }
        store.update('guideRequests', (l) => [{ guide: g.id, tour: tour?.id || null, date: f.date.value, msg: f.msg.value, at: new Date().toISOString() }, ...l], []);
        close();
        toast(t('xp.sent', { n: g.name.split(' ')[0] }), { tone: 'ok' });
      });
    },
  });
}

export function init(root) {
  let city = '';
  const citiesEl = root.querySelector('[data-xp-cities]');
  citiesEl.innerHTML = [['', t('stays.allcities')], ...Object.entries(CITIES).filter(([, c]) => c.phase === 1).map(([k, c]) => [k, loc(c.name)])]
    .map(([k, l]) => `<button type="button" class="chip" data-xp-city="${k}" aria-pressed="${k === city}">${esc(l)}</button>`).join('');

  const render = () => {
    const by = (x) => !city || x.city === city;
    root.querySelector('[data-tours]').innerHTML = TOURS.filter(by).map((x) => `
      <article class="tour-card">
        <button class="tour-card__btn" type="button" data-tour="${x.id}">
          <span class="tour-card__media">${imgTag(x.img, '', { sizes: '280px' })}</span>
          <span class="tour-card__kind">${esc(loc(x.kind))}</span>
          <span class="tour-card__name">${esc(loc(x.name))}</span>
          <span class="tour-card__foot"><span class="tour-card__price">${money(x.price)} <small>${t('xp.perPerson')}</small></span><span class="rating">${num(x.rating, { minimumFractionDigits: 1 })} ${icon('star', 'ico--fill')}</span></span>
        </button>
      </article>`).join('') || `<p class="muted">${t('map.nores')}</p>`;

    root.querySelector('[data-guides]').innerHTML = GUIDES.filter(by).map((g) => `
      <article class="guide-card">
        <button class="guide-card__btn" type="button" data-guide="${g.id}" aria-label="${esc(g.name)}">
          <span class="guide-card__media">${imgTag(g.img, '', { sizes: '260px' })}${avatar(g)}</span>
        </button>
        <div class="guide-card__body">
          <h3 class="guide-card__name">${esc(g.name)}</h3>
          <p class="guide-card__loc">${icon('pin')} ${esc(loc(CITIES[g.city].name))}, ${t('xp.algeria')}</p>
          <div class="guide-card__foot"><p class="guide-card__price"><strong>${money(g.price)}</strong> ${t('xp.perHour')}</p>${favBtn(g.id).replace('class="fav', 'class="fav fav--yellow fav--sm')}</div>
        </div>
      </article>`).join('') || `<p class="muted">${t('map.nores')}</p>`;

    root.querySelector('[data-events]').innerHTML = EVENTS.filter(by).map((e) => `
      <article class="event-card">
        <button class="event-card__btn" type="button" data-event="${e.id}">
          <span class="event-card__media">${imgTag(e.img, '', { sizes: '260px' })}</span>
          <span class="event-card__when">${esc(eventWhen(e))}</span>
          <span class="event-card__name">${esc(loc(e.name))}</span>
          <span class="event-card__venue">${icon('pin')} ${esc(loc(e.venue))}</span>
        </button>
      </article>`).join('') || `<p class="muted">${t('map.nores')}</p>`;
  };

  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-xp-city]');
    if (c) { city = c.dataset.xpCity; citiesEl.querySelectorAll('[data-xp-city]').forEach((x) => x.setAttribute('aria-pressed', String(x === c))); render(); return; }
    const g = e.target.closest('[data-guide]');
    if (g) { openGuide(findGuide(g.dataset.guide)); return; }
    const tour = e.target.closest('[data-tour]');
    if (tour) { const x = TOURS.find((y) => y.id === tour.dataset.tour); contactGuide(findGuide(x.guide), x); return; }
    const ev = e.target.closest('[data-event]');
    if (ev) {
      const x = EVENTS.find((y) => y.id === ev.dataset.event);
      openSheet({
        title: loc(x.name),
        html: `<div class="ev-sheet"><img class="ev-sheet__img" src="${imgSrc(x.img, 1600)}" alt="" /><p class="event-card__when">${esc(eventWhen(x))}</p><p>${icon('pin')} ${esc(loc(x.venue))}</p><p class="muted">${t('xp.eventDemo')}</p>
          <div class="row"><button class="btn btn--blue btn--sq" type="button" data-ev-ics>${icon('calendar')} ${t('book.done.cal')}</button><a class="btn btn--ghost btn--sq" href="carte.html?city=${x.city}">${icon('map')} ${t('her.onmap')}</a></div></div>`,
        onMount: (body) => body.querySelector('[data-ev-ics]').addEventListener('click', () => eventIcs(x)),
      });
    }
  });

  render();
}
