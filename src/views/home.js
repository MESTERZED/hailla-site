import barba from '@barba/core';
import { t, loc, getLang } from '../core/i18n.js';
import { gsap, ScrollTrigger } from '../core/motion.js';
import { reducedMotion, stayCard, imgTag } from '../core/ui.js';
import { isoDay, addDays, num, esc, coord } from '../core/format.js';
import { user, store } from '../core/store.js';
import { CITIES, STAYS } from '../data/places.js';

const L = (fr, en, ar) => ({ fr, en, ar });
const STOPS = [
  { city: 'alger', img: 'casbah-rue', line: L('La Casbah, la baie et les jardins du Hamma.', 'The Casbah, the bay and the Hamma gardens.', 'القصبة والخليج وحدائق الحامة.') },
  { city: 'bejaia', img: 'cap-carbon', line: L('Cap Carbon, Gouraya et les criques des Aiguades.', 'Cap Carbon, Gouraya and the Aiguades coves.', 'رأس كاربون وقورايا وخلجان لي زيغاد.') },
  { city: 'tizi', img: 'djurdjura', line: L('Le Djurdjura, ses villages et la côte d’Azeffoun.', 'The Djurdjura, its villages and the Azeffoun coast.', 'جرجرة وقراها وساحل أزفون.') },
  { city: 'tipaza', img: 'tipaza-ruines', line: L('Des ruines romaines au bord de l’eau.', 'Roman ruins on the water’s edge.', 'آثار رومانية على حافة البحر.') },
  { city: 'oran', img: 'santa-cruz', line: L('El Bahia, le raï et le fort de Santa Cruz.', 'El Bahia, raï music and Santa Cruz fort.', 'الباهية والراي وقلعة سانتا كروز.') },
  { city: 'ghardaia', img: 'mzab', line: L('Les cinq ksour de la vallée du M’Zab.', 'The five ksour of the M’Zab valley.', 'قصور وادي ميزاب الخمسة.') },
  { city: 'taghit', img: 'taghit', line: L('Le Grand Erg occidental au pied d’un ksar.', 'The Great Western Erg below an earthen ksar.', 'العرق الغربي الكبير عند سفح قصر.') },
  { city: 'djanet', img: 'tassili-art', line: L('Le Tassili et ses milliers de peintures rupestres.', 'The Tassili and its thousands of rock paintings.', 'الطاسيلي وآلاف الرسوم الصخرية.') },
  { city: 'tamanrasset', img: 'sahara-dune', line: L('L’Ahaggar et le lever du soleil à l’Assekrem.', 'The Ahaggar and sunrise at Assekrem.', 'الهقار وشروق الشمس في الأسكرام.') },
];
// Sea blues → dusk → sand. Text switches to ink once the background is light.
const BG = ['#0d2a6b', '#123a8f', '#174bb0', '#1b6fb8', '#1b8fa3', '#c99a5b', '#dcb274', '#e8c48a', '#efd3a4'];

export function init(root) {
  const cleanups = [];
  const ctx = gsap.context(() => {}, root);

  // ── Hero sea (WebGL) ──
  const seaHost = root.querySelector('[data-sea]');
  if (!reducedMotion() && window.WebGLRenderingContext && !store.get('dataSaver')) {
    import('../webgl/sea.js').then(({ mountSea }) => {
      if (!root.isConnected) return;
      const lmName = root.querySelector('[data-lm-name]'), lmMeta = root.querySelector('[data-lm-meta]');
      const caption = (s) => {
        const write = () => { lmName.textContent = loc(s.name); lmMeta.textContent = `${loc(s.where)} · ${coord(s.lat, s.lng)}`; };
        gsap.timeline().to([lmName, lmMeta], { opacity: 0, y: -8, duration: 0.35, ease: 'power2.in', onComplete: write })
          .to([lmName, lmMeta], { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 });
      };
      try { cleanups.push(mountSea(seaHost, { onShape: caption })); } catch (e) { console.warn('WebGL unavailable', e); root.querySelector('[data-landmark]')?.remove(); }
    });
  } else {
    root.querySelector('[data-landmark]')?.remove();
  }

  // ── Hero entrance ──
  const word = root.querySelector('[data-hero-word] span');
  if (word && !reducedMotion()) {
    const text = word.textContent;
    word.setAttribute('aria-label', text);
    // Arabic letters must stay joined: animate the whole word instead of per-character.
    const parts = getLang() === 'ar' ? [text] : [...text];
    word.innerHTML = parts.map((c) => `<span class="char" aria-hidden="true">${esc(c)}</span>`).join('');
    ctx.add(() => {
      gsap.timeline({ delay: 0.15 })
        .from(word.querySelectorAll('.char'), { yPercent: 115, rotate: 6, duration: 1.1, ease: 'expo.out', stagger: 0.05 })
        .from(root.querySelectorAll('[data-hero-in]'), { y: 24, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, '-=0.8');
      gsap.to(root.querySelector('.hero__inner'), { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: root.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  // ── Search ──
  root.querySelectorAll('[data-city-select]').forEach((sel) => {
    Object.entries(CITIES).filter(([, c]) => c.phase === 1).forEach(([id, c]) => sel.insertAdjacentHTML('beforeend', `<option value="${id}">${esc(loc(c.name))}</option>`));
  });
  const din = root.querySelector('[data-date-in]'), dout = root.querySelector('[data-date-out]');
  const today = isoDay();
  din.min = today; din.value = addDays(today, 14);
  dout.min = addDays(din.value, 1); dout.value = addDays(din.value, 2);
  din.addEventListener('change', () => { dout.min = addDays(din.value, 1); if (dout.value <= din.value) dout.value = addDays(din.value, 2); });
  root.querySelector('[data-search]').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = new URLSearchParams(new FormData(e.currentTarget));
    [...q.keys()].forEach((k) => { if (!q.get(k)) q.delete(k); });
    barba.go(`explorer.html?${q}`);
  });

  // ── La traversée ──
  const list = root.querySelector('[data-traverse-stops]');
  list.innerHTML = STOPS.map((s, i) => {
    const c = CITIES[s.city];
    const ok = c.phase === 1;
    return `<li class="stop ${i === 0 ? 'is-active' : ''}" data-stop="${i}">
      <div class="stop__media arch">${imgTag(s.img, '', { sizes: '(max-width: 900px) 70vw, 420px' })}</div>
      <div class="stop__body">
        <p class="stop__lat mono keep">${num(c.lat, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}° N</p>
        <h3 class="stop__name">${esc(loc(c.name))}</h3>
        <p class="stop__line">${esc(loc(s.line))}</p>
        <div class="row">
          <span class="badge ${ok ? 'badge--ok' : 'badge--soon'}">${t(ok ? 'home.available' : 'home.soon')}</span>
          <a class="link-arrow" href="${ok ? `explorer.html?city=${s.city}` : 'patrimoine.html'}">${esc(t(ok ? 'nav.stays' : 'nav.heritage'))}<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        </div>
      </div>
    </li>`;
  }).join('');

  const section = root.querySelector('[data-traverse]');
  const latEl = root.querySelector('[data-traverse-lat]');
  const bar = root.querySelector('[data-traverse-progress]');
  const stops = [...list.children];
  const lats = STOPS.map((s) => CITIES[s.city].lat);

  if (reducedMotion()) {
    section.classList.add('is-static');
  } else {
    ctx.add(() => {
      let active = 0;
      const n = STOPS.length;
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * (n - 1) * 0.75}`,
        pin: root.querySelector('[data-traverse-pin]'),
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress * (n - 1);
          const i = Math.min(n - 1, Math.round(p));
          const lo = Math.floor(p), hi = Math.min(n - 1, lo + 1);
          latEl.textContent = num(lats[lo] + (lats[hi] - lats[lo]) * (p - lo), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          bar.style.transform = `scaleY(${self.progress})`;
          section.style.backgroundColor = gsap.utils.interpolate(BG[lo], BG[hi], p - lo);
          section.classList.toggle('is-south', p > 4.6);
          if (i !== active) {
            stops[active].classList.remove('is-active');
            stops[i].classList.add('is-active');
            active = i;
          }
        },
      });
    });
  }

  // ── Stays rail (follows saved preferences) ──
  const prefs = user.prefs();
  const ranked = [...STAYS].sort((a, b) => {
    const score = (s) => s.rating + (prefs.interests?.includes('eco') && s.eco ? 0.5 : 0) + (prefs.budget === 'low' && s.price < 5000 ? 0.6 : 0) + (prefs.budget === 'high' && s.price > 12000 ? 0.4 : 0);
    return score(b) - score(a);
  });
  root.querySelector('[data-home-stays]').innerHTML = `<div class="rail__track">${ranked.slice(0, 8).map((s) => stayCard(s)).join('')}</div>`;

  return () => { ctx.revert(); cleanups.forEach((fn) => fn?.()); };
}
