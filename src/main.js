import './styles/base.css';
import './styles/sections.css';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products } from './config.js';
import { heroCookie as heroCookieSvg, renderArt } from './art.js';
import { bindContact } from './modules/bind.js';
import { initBox } from './modules/box.js';
import { initMenu } from './modules/menu.js';
import { initFlakes } from './modules/flakes.js';
import * as motion from './modules/motion.js';

// Respect the OS "reduce motion" setting; `?motion=full` forces the full experience (handy for testing).
const forceMotion = new URLSearchParams(location.search).get('motion') === 'full';
const reduced = !forceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (forceMotion) document.documentElement.classList.add('force-motion');
const byId = Object.fromEntries(products.map((p) => [p.id, p]));

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---- static content from config + illustrations ---- */
bindContact();
document.querySelector('.hero-cookie').innerHTML = heroCookieSvg();
document.querySelectorAll('[data-mini]').forEach((el) => {
  const p = byId[el.dataset.mini];
  if (p) el.innerHTML = renderArt(p.art);
});
const cta = document.querySelector('.cta');
cta.querySelector('.cta__sticker').innerHTML = renderArt(byId['sea-salt-dark'].art);
const sticker2 = document.createElement('div');
sticker2.className = 'cta__sticker cta__sticker--l';
sticker2.setAttribute('aria-hidden', 'true');
sticker2.innerHTML = renderArt(byId['butter-croissant'].art);
cta.prepend(sticker2);

/* ---- boot ---- */
const lenis = motion.initLenis(reduced);
initBox({ lenis, reduced });
initMenu({ reduced });
motion.initAnchors(lenis);
motion.mobileMenu(lenis);
motion.nav();
motion.cursor();
motion.magnetic();

// wait until our stylesheet is applied (sentinel var at the end of sections.css) and fonts have landed
const cssReady = new Promise((resolve) => {
  const check = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--css-ready').trim() === '1'
      ? resolve()
      : requestAnimationFrame(check);
  check();
});
const layoutReady = cssReady.then(() =>
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))])
);
const intro = motion.preloader(reduced);

// re-measure scroll positions whenever the page height changes (photos loading, filtering…)
let refreshTimer;
new ResizeObserver(() => {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
}).observe(document.querySelector('main'));

layoutReady.then(async () => {
  try {
    // everything that measures text runs after the fonts land
    motion.marquee(reduced);
    motion.lineReveals(reduced);
    motion.story(reduced);
    motion.process(reduced);
    motion.menuReveal(reduced);
    motion.finale(reduced);
    motion.heroCookie(reduced);
    if (!reduced) initFlakes(document.querySelector('.hero__flakes'));
    ScrollTrigger.refresh();
  } finally {
    await intro;
    const split = motion.heroIntro(reduced);
    if (!reduced && split) motion.heroProximity(split.chars);
  }
});

window.addEventListener('load', () => ScrollTrigger.refresh());

if (import.meta.env.DEV) Object.assign(window, { ScrollTrigger, lenis });
