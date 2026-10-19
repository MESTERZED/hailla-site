import 'leaflet/dist/leaflet.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/pages.css';
import './styles/app.css';

import barba from '@barba/core';
import { applyI18n, syncDocumentLang, onLangChange } from './core/i18n.js';
import { initScroll, scrollTop, reveals, gsap, ScrollTrigger, resizeScroll } from './core/motion.js';
import { initShell, syncShell, pageLabel } from './core/shell.js';
import { bindFavourites, reducedMotion } from './core/ui.js';
import { initChatWidget } from './chat/widget.js';

// One module per page, loaded on demand. Each exports init(container) → cleanup().
const VIEWS = {
  home: () => import('./views/home.js'),
  explorer: () => import('./views/explorer.js'),
  lieu: () => import('./views/lieu.js'),
  carte: () => import('./views/carte.js'),
  patrimoine: () => import('./views/patrimoine.js'),
  guide: () => import('./views/guide.js'),
  experiences: () => import('./views/experiences.js'),
  voyages: () => import('./views/voyages.js'),
  compte: () => import('./views/compte.js'),
  pro: () => import('./views/pro.js'),
  about: () => import('./views/about.js'),
};

let current = { container: null, cleanup: null, revealCleanup: null };

async function mount(container) {
  const ns = container.dataset.barbaNamespace;
  applyI18n(container);
  const mod = VIEWS[ns] ? await VIEWS[ns]() : null;
  const cleanup = (await mod?.init?.(container)) || null;
  syncShell(container);
  current = { container, cleanup, revealCleanup: reveals(container) };
  requestAnimationFrame(() => resizeScroll());
}

function unmount() {
  current.cleanup?.();
  current.revealCleanup?.();
  ScrollTrigger.getAll().forEach((t) => t.kill());
  current = { container: null, cleanup: null, revealCleanup: null };
}

// Re-render the current page when the language changes (static text is swapped by applyI18n).
onLangChange(async () => {
  if (!current.container) return;
  const c = current.container;
  unmount();
  await mount(c);
});

function scrollToHash() {
  const id = location.hash.slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (el) setTimeout(() => (window.__scroll ? window.__scroll.to(el, { offset: -90 }) : el.scrollIntoView()), 120);
}

function initTransitions() {
  const curtain = document.querySelector('[data-curtain]');
  const mark = curtain.querySelector('.curtain__mark');
  const label = curtain.querySelector('[data-curtain-label]');

  barba.init({
    debug: false,
    timeout: 8000,
    preventRunning: true,
    prevent: ({ el, href }) =>
      el.hasAttribute('data-no-barba') ||
      el.target === '_blank' ||
      /^(mailto|tel):/.test(href) ||
      (href.includes('#') && href.split('#')[0] === location.href.split('#')[0]),
    transitions: [
      {
        name: 'curtain',
        async leave() {
          if (reducedMotion()) return gsap.to('main', { opacity: 0, duration: 0.15 });
          label.textContent = '';
          await gsap
            .timeline()
            .set(curtain, { yPercent: 101 })
            .to(curtain, { yPercent: 0, duration: 0.55, ease: 'expo.inOut' })
            .fromTo(mark, { opacity: 0, scale: 0.7, rotate: -8 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, '-=0.15');
        },
        beforeEnter({ next }) {
          unmount();
          scrollTop();
          label.textContent = pageLabel(next.container);
          gsap.fromTo(label, { opacity: 0, y: 8 }, { opacity: 0.85, y: 0, duration: 0.3 });
        },
        async enter({ next }) {
          await mount(next.container);
          if (reducedMotion()) { gsap.fromTo(next.container, { opacity: 0 }, { opacity: 1, duration: 0.2 }); return; }
          await gsap
            .timeline()
            .to([mark, label], { opacity: 0, duration: 0.2 })
            .to(curtain, { yPercent: -101, duration: 0.65, ease: 'expo.inOut' }, '-=0.05')
            .set(curtain, { yPercent: 101 });
        },
        after() {
          scrollToHash();
          document.getElementById('main')?.focus({ preventScroll: true });
        },
      },
    ],
  });
}

async function boot() {
  syncDocumentLang();
  applyI18n();
  initScroll();
  initShell();
  bindFavourites();
  initChatWidget();
  const container = document.querySelector('[data-barba="container"]');
  container.setAttribute('tabindex', '-1');
  barba.hooks.after(({ next }) => next.container.setAttribute('tabindex', '-1'));
  initTransitions();
  await mount(container);
  scrollToHash();
}

boot();
