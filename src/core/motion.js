import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';
import { reducedMotion } from './ui.js';

gsap.registerPlugin(ScrollTrigger);

let loco = null;

// Smooth scroll: Locomotive Scroll v5 (Lenis) driven by GSAP's ticker so ScrollTrigger stays in sync.
export function initScroll() {
  if (reducedMotion()) return null;
  const render = (fn) => gsap.ticker.add(fn);
  loco = new LocomotiveScroll({
    lenisOptions: { lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 },
    scrollCallback: () => ScrollTrigger.update(),
    initCustomTicker: render,
    destroyCustomTicker: (fn) => gsap.ticker.remove(fn),
  });
  gsap.ticker.lagSmoothing(0);
  window.__scroll = {
    stop: () => loco?.stop(),
    start: () => loco?.start(),
    to: (target, opts) => loco?.scrollTo(target, opts),
  };
  return loco;
}

export const scrollTop = () => {
  if (loco) loco.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
};

export const resizeScroll = () => { loco?.resize(); ScrollTrigger.refresh(); };

// Scroll reveals for [data-reveal] inside a container. Returns a cleanup function.
export function reveals(root) {
  const items = [...root.querySelectorAll('[data-reveal]')];
  if (!items.length) return () => {};
  if (reducedMotion()) { gsap.set(items, { opacity: 1, y: 0 }); return () => {}; }
  const triggers = ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
  return () => triggers.forEach((t) => t.kill());
}

export { gsap, ScrollTrigger };
