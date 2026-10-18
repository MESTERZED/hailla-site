import { t, loc, getLang } from '../core/i18n.js';
import { icon, imgTag, imgSrc, openSheet, stayCard, reducedMotion } from '../core/ui.js';
import { esc } from '../core/format.js';
import { gsap } from '../core/motion.js';
import { createMap, pinIcon, L } from '../core/map.js';
import { speak } from '../chat/widget.js';
import { HERITAGE, ERAS } from '../data/heritage.js';
import { STAYS, CITIES } from '../data/places.js';

export function init(root) {
  let era = 'all';
  const grid = root.querySelector('[data-heritage-grid]');
  const chips = root.querySelector('[data-era-chips]');
  root.querySelector('[data-her-count]').textContent = t('her.count', { n: HERITAGE.length });

  chips.innerHTML = [['all', t('her.all')], ['unesco', 'UNESCO'], ...Object.entries(ERAS).map(([k, v]) => [k, loc(v)])]
    .map(([k, label]) => `<button type="button" class="chip" data-era="${k}" aria-pressed="${k === era}">${esc(label)}</button>`).join('');

  const render = () => {
    const list = HERITAGE.filter((h) => era === 'all' || (era === 'unesco' ? h.unesco : h.era === era));
    grid.innerHTML = list.map((h, i) => `
      <article class="her-card ${i % 3 === 1 ? 'her-card--tall' : ''}">
        <button class="her-card__btn" type="button" data-open="${h.id}" aria-label="${esc(loc(h.name))}">
          <span class="her-card__media arch">${imgTag(h.img, '', { sizes: '(max-width: 720px) 92vw, 33vw' })}</span>
          <span class="her-card__body">
            <span class="her-card__meta mono">${esc(loc(ERAS[h.era]))} · ${esc(loc(h.region))}</span>
            <span class="her-card__title">${esc(loc(h.name))}</span>
            ${h.unesco ? `<span class="badge badge--unesco">${t('her.unesco', { y: h.unesco })}</span>` : ''}
          </span>
        </button>
      </article>`).join('');
    if (!reducedMotion()) gsap.from(grid.children, { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05, clearProps: 'all' });
  };

  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-era]'); if (!b) return;
    era = b.dataset.era;
    chips.querySelectorAll('[data-era]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });

  const openSite = (h) => {
    const stays = h.city && CITIES[h.city]?.phase === 1 ? STAYS.filter((s) => s.city === h.city).slice(0, 2) : [];
    let map = null;
    openSheet({
      wide: true,
      title: loc(h.name),
      html: `
        <div class="her-sheet">
          <div class="her-sheet__gallery" data-lenis-prevent>${h.gallery.map((g) => `<img src="${imgSrc(g, 1600)}" alt="" loading="lazy" width="1600" height="1067" />`).join('')}</div>
          <div class="her-sheet__cols">
            <div class="stack" style="--stack: 16px">
              <p class="mono">${esc(loc(ERAS[h.era]))} · ${esc(loc(h.region))}${h.unesco ? ` · ${t('her.unesco', { y: h.unesco })}` : ''}</p>
              <p class="her-sheet__story">${esc(loc(h.story))}</p>
              <div><button class="btn btn--ink btn--sm" type="button" data-listen>${icon('volume')}<span>${t('her.listen')}</span></button></div>
              <dl class="facts-table">
                <div><dt>${t('her.best')}</dt><dd>${esc(loc(h.best))}</dd></div>
                <div><dt>${t('her.access')}</dt><dd>${esc(loc(h.access))}</dd></div>
              </dl>
            </div>
            <div class="stack" style="--stack: 12px">
              <div class="her-sheet__map" data-her-map></div>
              <p class="mono keep">${h.lat.toFixed(4)}° N · ${Math.abs(h.lng).toFixed(4)}° ${h.lng < 0 ? 'W' : 'E'}</p>
            </div>
          </div>
          ${stays.length ? `<h3 class="her-sheet__h">${t('her.stays')}</h3><div class="her-sheet__stays">${stays.map((s) => stayCard(s)).join('')}</div>` : ''}
        </div>`,
      onMount: (body) => {
        setTimeout(() => {
          map = createMap(body.querySelector('[data-her-map]'), { center: [h.lat, h.lng], zoom: h.era === 'nature' ? 9 : 11 });
          L.marker([h.lat, h.lng], { icon: pinIcon('patrimoine', { active: true }) }).addTo(map);
        }, 350);
        let speaking = false;
        const btn = body.querySelector('[data-listen]');
        btn.addEventListener('click', () => {
          if (speaking) { speechSynthesis.cancel(); speaking = false; btn.lastElementChild.textContent = t('her.listen'); return; }
          if (speak(`${loc(h.name)}. ${loc(h.story)}`, getLang())) {
            speaking = true; btn.lastElementChild.textContent = t('her.stop');
            const iv = setInterval(() => { if (!speechSynthesis.speaking) { clearInterval(iv); speaking = false; btn.lastElementChild.textContent = t('her.listen'); } }, 500);
          }
        });
        if (!('speechSynthesis' in window)) btn.hidden = true;
      },
      onClose: () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); map?.remove(); },
    });
  };

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open]');
    if (b) openSite(HERITAGE.find((h) => h.id === b.dataset.open));
  });

  // Immersive tour — full-screen Ken Burns slideshow
  const tour = () => {
    const slides = HERITAGE.map((h) => ({ img: h.img, name: loc(h.name), sub: `${loc(h.region)}${h.unesco ? ` · UNESCO ${h.unesco}` : ''}` }));
    const el = document.createElement('div');
    el.className = 'tour';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', t('her.tour'));
    el.innerHTML = `
      ${slides.map((s, i) => `<figure class="tour__slide" data-slide="${i}"><img src="${imgSrc(s.img, 1600)}" alt="" /><figcaption><span class="mono keep">${String(i + 1).padStart(2, '0')} / ${slides.length}</span><strong>${esc(s.name)}</strong><span>${esc(s.sub)}</span></figcaption></figure>`).join('')}
      <div class="tour__ui">
        <button class="icon-btn" type="button" data-prev aria-label="‹">${icon('back', 'flip-rtl')}</button>
        <div class="tour__bar"><span data-bar></span></div>
        <button class="icon-btn" type="button" data-next aria-label="›">${icon('arrow', 'flip-rtl')}</button>
        <button class="btn btn--light btn--sm" type="button" data-close>${t('her.tour.close')}</button>
      </div>`;
    document.body.append(el);
    document.documentElement.classList.add('is-locked');
    window.__scroll?.stop();
    const figs = [...el.querySelectorAll('[data-slide]')];
    let i = -1, timer = null, kb = null;
    const go = (n) => {
      const prev = figs[i];
      i = (n + figs.length) % figs.length;
      const cur = figs[i];
      kb?.kill();
      if (prev) gsap.to(prev, { opacity: 0, duration: 1, ease: 'power2.inOut' });
      gsap.fromTo(cur, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.inOut' });
      gsap.fromTo(cur.querySelector('figcaption'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'expo.out' });
      if (!reducedMotion()) kb = gsap.fromTo(cur.querySelector('img'), { scale: 1.12, xPercent: i % 2 ? -3 : 3 }, { scale: 1, xPercent: 0, duration: 7, ease: 'none' });
      gsap.fromTo(el.querySelector('[data-bar]'), { scaleX: 0 }, { scaleX: 1, duration: 6.5, ease: 'none' });
      clearTimeout(timer);
      timer = setTimeout(() => go(i + 1), 6500);
    };
    const close = () => {
      clearTimeout(timer); kb?.kill();
      document.removeEventListener('keydown', onKey);
      gsap.to(el, { opacity: 0, duration: 0.4, onComplete: () => { el.remove(); document.documentElement.classList.remove('is-locked'); window.__scroll?.start(); root.querySelector('[data-tour]')?.focus(); } });
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      const rtl = document.dir === 'rtl';
      if (e.key === 'ArrowRight') go(i + (rtl ? -1 : 1));
      if (e.key === 'ArrowLeft') go(i + (rtl ? 1 : -1));
    };
    document.addEventListener('keydown', onKey);
    el.querySelector('[data-next]').addEventListener('click', () => go(i + 1));
    el.querySelector('[data-prev]').addEventListener('click', () => go(i - 1));
    el.querySelector('[data-close]').addEventListener('click', close);
    gsap.from(el, { opacity: 0, duration: 0.4 });
    go(0);
    el.querySelector('[data-close]').focus();
    tourClose = close;
  };
  let tourClose = null;
  root.querySelector('[data-tour]').addEventListener('click', tour);

  render();
  return () => { tourClose && document.querySelector('.tour') && tourClose(); };
}
