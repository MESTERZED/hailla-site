import barba from '@barba/core';
import { t, loc, getLang } from '../core/i18n.js';
import { icon, imgTag, imgSrc, favBtn, stars, openSheet, toast } from '../core/ui.js';
import { money, distance, haversine, isOpen, esc, num, date, isoDay } from '../core/format.js';
import { reviews, store, user } from '../core/store.js';
import { createMap, pinIcon, knownPosition, L } from '../core/map.js';
import { openBooking } from '../core/booking.js';
import { findPlace, CITIES, STAY_TYPES, POI_CATS, AMENITIES, LANGS_SPOKEN, POIS, SEED_REVIEWS, SEED_COMMUNITY } from '../data/places.js';

const CAT_ICON = { cafe: 'cafe', musee: 'musee', souvenir: 'souvenir', plage: 'plage', patrimoine: 'patrimoine', nature: 'nature' };

export function init(root) {
  const host = root.querySelector('[data-place-root]');
  const id = new URLSearchParams(location.search).get('id');
  const p = findPlace(id);
  const cleanups = [];

  if (!p) {
    root.dataset.header = 'light';
    host.innerHTML = `<div class="container page-head"><div class="empty">${icon('pin')}<h1 class="h3">${t('place.notfound')}</h1><a class="btn" href="explorer.html">${t('place.notfound.cta')}</a></div></div>`;
    return;
  }
  root.dataset.lat = p.lat; root.dataset.lng = p.lng; root.dataset.place = loc(CITIES[p.city].name);
  document.title = `${loc(p.name)} — HAILLA`;

  const isStay = p.kind === 'stay';
  const images = isStay ? p.images : [p.img];
  const nearby = POIS.filter((x) => x.id !== p.id).map((x) => ({ ...x, km: haversine(p, x) })).sort((a, b) => a.km - b.km).slice(0, 3);
  const gallery = [...new Set([...images, ...nearby.map((n) => n.img)])];
  const me = knownPosition();
  const kmFromMe = me ? haversine(me, p) : null;
  const open = isOpen(p.hours);

  const allReviews = () => [...reviews.for(p.id), ...(SEED_REVIEWS[p.id] || [])];
  const tips = () => [...store.get('tips', []).filter((x) => x.city === p.city), ...SEED_COMMUNITY.filter((x) => x.city === p.city)];

  const tags = isStay
    ? [loc(STAY_TYPES[p.type]), loc(p.tagline)]
    : [loc(POI_CATS[p.cat]), open == null ? '' : `${t(open ? 'place.open' : 'place.closed')}`].filter(Boolean);

  host.innerHTML = `
    <section class="place-hero on-dark">
      <div class="place-hero__img">${imgTag(images[0], loc(p.name), { sizes: '100vw', eager: true })}</div>
      <div class="place-hero__shade" aria-hidden="true"></div>
      <div class="container place-hero__inner">
        <div class="place-hero__top">
          <button class="icon-btn" type="button" data-back aria-label="${t('place.back')}">${icon('back', 'flip-rtl')}</button>
          <div class="row" style="--row: 8px">
            <button class="icon-btn" type="button" data-share aria-label="${t('place.share')}">${icon('share')}</button>
            ${favBtn(p.id).replace('class="fav', 'class="fav fav--static')}
          </div>
        </div>
        <div class="place-hero__info">
          <p class="place-hero__loc">${icon('pin')} ${esc(isStay ? loc(p.area) : loc(CITIES[p.city].name))}, ${{ fr: 'Algérie', en: 'Algeria', ar: 'الجزائر' }[getLang()]}</p>
          <h1 class="place-hero__title">${esc(loc(p.name))}</h1>
          <div class="place-hero__tags">
            ${stars(p.rating)}
            ${tags.map((x) => `<span>${esc(x)}</span>`).join('<span aria-hidden="true">•</span>')}
            ${isStay && p.eco ? `<span class="badge badge--eco">${icon('leaf')}${t('place.eco')}</span>` : ''}
          </div>
        </div>
      </div>
    </section>

    <div class="place-body">
      <div class="tabs tabs--place container" role="tablist" data-tabs>
        ${['overview', 'photos', 'reviews', 'community'].map((k, i) => `<button role="tab" type="button" id="t-${k}" aria-controls="p-${k}" aria-selected="${i === 0}" ${i ? 'tabindex="-1"' : ''} data-tab="${k}">${t(`place.${k}`)}</button>`).join('')}
        <span class="tabs__ink" aria-hidden="true" data-ink></span>
      </div>

      <div class="container place-grid">
        <div class="place-main">
          <section role="tabpanel" id="p-overview" aria-labelledby="t-overview" data-panel="overview">
            <h2 class="place-h">${t('place.about')}</h2>
            <p class="place-desc">${esc(loc(p.desc))}</p>
            <dl class="facts-table">
              ${p.hours ? `<div><dt>${t('place.hours')}</dt><dd>${open == null ? '' : `<span class="${open ? 'hours-open' : 'hours-closed'}">${t(open ? 'place.open' : 'place.closed')}</span> `}${p.hours === '24h' ? '24 h/24' : esc(p.hours.replace('-', ' – '))}</dd></div>` : ''}
              ${isStay ? `
                <div><dt>${t('place.clean')}</dt><dd class="mono keep">${num(p.cleanliness, { minimumFractionDigits: 1 })}/10</dd></div>
                <div><dt>${t('place.comfort')}</dt><dd class="mono keep">${num(p.comfort, { minimumFractionDigits: 1 })}/10</dd></div>
                <div><dt>${t('place.capacity')}</dt><dd>${t('place.adults', { n: p.capacity })}</dd></div>
                <div><dt>${t('place.langs')}</dt><dd>${p.langs.map((l) => esc(loc(LANGS_SPOKEN[l]))).join(' · ')}</dd></div>` : ''}
            </dl>
            ${isStay ? `
              <h2 class="place-h">${t('place.amenities')}</h2>
              <ul class="amenities" role="list">${p.amenities.map((a) => `<li>${icon(a)}<span>${esc(loc(AMENITIES[a]))}</span></li>`).join('')}</ul>` : ''}
            <div class="place-h place-h--row"><h2>${t('place.location')}</h2>${kmFromMe != null ? `<span class="mono keep">${icon('locate')} ${distance(kmFromMe)}</span>` : ''}</div>
            <div class="place-map arch-soft" data-place-map></div>
            <h2 class="place-h">${t('place.near')}</h2>
            <ul class="nearby" role="list">
              ${nearby.map((n) => `<li><a href="lieu.html?id=${n.id}">${imgTag(n.img, '', { sizes: '120px' })}<span><strong>${esc(loc(n.name))}</strong><span class="muted">${esc(loc(POI_CATS[n.cat]))} · ${distance(n.km)}</span></span></a></li>`).join('')}
            </ul>
          </section>

          <section role="tabpanel" id="p-photos" aria-labelledby="t-photos" data-panel="photos" hidden>
            <div class="gallery">${gallery.map((g, i) => `<button type="button" class="gallery__item ${i === 0 ? 'gallery__item--big' : ''}" data-photo="${g}">${imgTag(g, '', { sizes: '(max-width: 720px) 50vw, 33vw' })}</button>`).join('')}</div>
          </section>

          <section role="tabpanel" id="p-reviews" aria-labelledby="t-reviews" data-panel="reviews" hidden>
            <div class="reviews-head">
              <p class="reviews-score"><span class="display">${num(p.rating, { minimumFractionDigits: 1 })}</span><span class="muted">/ 5 · ${t('stays.reviews', { n: (p.reviews || 0) + reviews.for(p.id).length })}</span></p>
            </div>
            <ul class="reviews" role="list" data-reviews></ul>
            <form class="review-form" data-review-form novalidate>
              <h3>${t('review.write')}</h3>
              <fieldset class="stars-input"><legend class="label">${t('review.rating')}</legend>
                ${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="r${n}" value="${n}"><label for="r${n}" aria-label="${n}/5">${icon('star')}</label>`).join('')}
              </fieldset>
              <label class="field"><span>${t('review.text')}</span><textarea class="textarea" name="text" placeholder="${t('review.text.ph')}"></textarea></label>
              <p class="field-error" data-review-err role="alert" hidden></p>
              <button class="btn btn--ink" type="submit">${t('review.send')}</button>
            </form>
          </section>

          <section role="tabpanel" id="p-community" aria-labelledby="t-community" data-panel="community" hidden>
            <h2 class="place-h">${t('community.t')} — ${esc(loc(CITIES[p.city].name))}</h2>
            <ul class="tips" role="list" data-tips></ul>
            <form class="tip-form" data-tip-form>
              <label class="sr-only" for="tip">${t('community.ph')}</label>
              <textarea class="textarea" id="tip" name="tip" rows="2" placeholder="${t('community.ph')}"></textarea>
              <button class="btn btn--ink btn--sm" type="submit">${t('community.send')}</button>
            </form>
          </section>
        </div>

        <aside class="place-side">
          <div class="reserve-card">
            ${isStay ? `
              <p class="price price--lg"><strong>${money(p.price)}</strong> <span>${t('stays.night')}</span></p>
              <button class="btn btn--azur btn--block" type="button" data-reserve>${t('place.reserve')}</button>
              <p class="reserve-card__note">${icon('check')} ${t('book.free')}</p>` : `
              <a class="btn btn--azur btn--block" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noopener">${icon('locate')} ${t('place.directions')}</a>`}
            <button class="btn btn--ghost btn--block" type="button" data-ask>${icon('sparkle')} ${t('place.askguide')}</button>
          </div>
        </aside>
      </div>
    </div>

    ${isStay ? `<div class="reserve-bar"><p class="price"><strong>${money(p.price)}</strong> <span>${t('stays.night')}</span></p><button class="btn btn--azur" type="button" data-reserve>${t('place.reserve')}</button></div>` : ''}`;

  // Tabs (roving tabindex + arrow keys) with the yellow ink bar from the app
  const tabs = [...host.querySelectorAll('[data-tab]')];
  const ink = host.querySelector('[data-ink]');
  const moveInk = (tab) => { ink.style.width = `${tab.offsetWidth}px`; ink.style.transform = `translateX(${tab.offsetLeft}px)`; };
  const select = (tab) => {
    tabs.forEach((b) => { const on = b === tab; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    host.querySelectorAll('[data-panel]').forEach((pnl) => { pnl.hidden = pnl.dataset.panel !== tab.dataset.tab; });
    moveInk(tab);
    if (tab.dataset.tab === 'overview') setTimeout(() => miniMap?.invalidateSize(), 30);
  };
  tabs.forEach((b) => b.addEventListener('click', () => select(b)));
  host.querySelector('[data-tabs]').addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const dir = (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0) * (document.dir === 'rtl' ? -1 : 1);
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    next.focus(); select(next);
  });
  requestAnimationFrame(() => moveInk(tabs[0]));
  const onResize = () => moveInk(tabs.find((b) => b.getAttribute('aria-selected') === 'true'));
  window.addEventListener('resize', onResize);
  cleanups.push(() => window.removeEventListener('resize', onResize));

  // Mini map
  const miniMap = createMap(host.querySelector('[data-place-map]'), { center: [p.lat, p.lng], zoom: 14 });
  L.marker([p.lat, p.lng], { icon: pinIcon(isStay ? 'hotel' : CAT_ICON[p.cat], { active: true }), title: loc(p.name) }).addTo(miniMap);
  nearby.forEach((n) => L.marker([n.lat, n.lng], { icon: pinIcon(CAT_ICON[n.cat]), title: loc(n.name) }).addTo(miniMap));
  cleanups.push(() => miniMap.remove());

  // Reviews
  const renderReviews = () => {
    const list = allReviews();
    host.querySelector('[data-reviews]').innerHTML = list.length
      ? list.map((r) => `<li class="review"><div class="review__head"><span class="avatar" aria-hidden="true">${esc(r.name[0])}</span><div><strong>${esc(r.name)}</strong><span class="muted">${r.from ? `${esc(r.from)} · ` : ''}${date(r.date)}</span></div>${stars(r.rating)}</div><p>${esc(r.text)}</p></li>`).join('')
      : `<li class="muted">${t('review.none')}</li>`;
  };
  renderReviews();
  host.querySelector('[data-review-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget, err = host.querySelector('[data-review-err]');
    const rating = Number(f.rating.value), text = f.text.value.trim();
    if (!rating || text.length < 3) { err.textContent = t('review.need'); err.hidden = false; return; }
    err.hidden = true;
    reviews.add(p.id, { name: user.get()?.name || t('common.you'), from: '', rating, date: isoDay(), text });
    f.reset();
    renderReviews();
    toast(t('review.sent'), { tone: 'ok' });
  });

  // Community tips
  const renderTips = () => {
    host.querySelector('[data-tips]').innerHTML = tips().map((x) => `<li class="tip"><span class="avatar" aria-hidden="true">${esc(x.name[0])}</span><p><strong>${esc(x.name)}</strong> ${esc(x.text)}</p></li>`).join('');
  };
  renderTips();
  host.querySelector('[data-tip-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = e.currentTarget.tip.value.trim();
    if (text.length < 3) return;
    store.update('tips', (l) => [{ name: user.get()?.name || t('common.you'), city: p.city, text }, ...l], []);
    e.currentTarget.reset();
    renderTips();
    toast(t('community.sent'), { tone: 'ok' });
  });

  // Photos lightbox
  host.addEventListener('click', (e) => {
    const ph = e.target.closest('[data-photo]');
    if (ph) openSheet({ wide: true, label: loc(p.name), html: `<img class="lightbox-img" src="${imgSrc(ph.dataset.photo, 1600)}" alt="" />` });
    if (e.target.closest('[data-reserve]')) openBooking(p);
    if (e.target.closest('[data-ask]')) window.__openGuide?.(`${loc(p.name)} — ${loc(CITIES[p.city].name)}`);
    if (e.target.closest('[data-back]')) history.length > 1 ? history.back() : barba.go('explorer.html');
    if (e.target.closest('[data-share]')) {
      const url = location.href;
      if (navigator.share) navigator.share({ title: loc(p.name), url }).catch(() => {});
      else navigator.clipboard?.writeText(url).then(() => toast(t('place.copied')));
    }
  });

  return () => cleanups.forEach((fn) => fn());
}
