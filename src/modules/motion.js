import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ============ SMOOTH SCROLL ============ */
export function initLenis(reduced) {
  if (reduced) return null;
  const lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function initAnchors(lenis) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    closeMobileMenu();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else if (target === 0) window.scrollTo(0, 0);
    else target.scrollIntoView();
  });
}

/* ============ PRELOADER ============ */
export function preloader(reduced) {
  let seen = false;
  try { seen = sessionStorage.getItem('sc-seen') === '1'; sessionStorage.setItem('sc-seen', '1'); } catch { /* ignore */ }
  const el = $('.preloader');
  if (reduced || seen) {
    document.body.classList.add('no-preloader');
    el?.remove();
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const temp = { v: 0 };
    const b = $('.preloader__temp b');
    gsap.timeline({ onComplete: () => el.remove() })
      // phones: ~25% quicker, so people on mobile data aren't kept waiting
      .timeScale(finePointer() ? 1 : 1.3)
      .from('.preloader__word > *', { yPercent: 120, rotate: 6, duration: 1.1, ease: 'expo.out', stagger: 0.09 })
      .from('.preloader__foot', { opacity: 0, duration: 0.6 }, 0.2)
      .to(temp, { v: 180, duration: 1.7, ease: 'power2.inOut', onUpdate: () => (b.textContent = Math.round(temp.v)) }, 0.15)
      .to('.preloader__bar i', { scaleX: 1, duration: 1.7, ease: 'power2.inOut' }, 0.15)
      .to('.preloader__word > *', { yPercent: -120, duration: 0.7, ease: 'expo.in', stagger: 0.05 }, '+=0.05')
      .to('.preloader__foot, .preloader__bar', { opacity: 0, duration: 0.3 }, '<')
      .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'expo.inOut' }, '-=0.25')
      .call(resolve, null, '-=0.75');
  });
}

/* ============ HERO ============ */
export function heroIntro(reduced) {
  const lines = $$('.hero__line');
  const split = new SplitText(lines, { type: 'chars', charsClass: 'char' });
  document.body.classList.remove('is-loading');
  if (reduced) return split;

  lines.forEach((l) => (l.style.overflow = 'clip'));
  gsap.timeline({ onComplete: () => lines.forEach((l) => (l.style.overflow = '')) })
    .from('.hero__meta > *', { y: 20, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 0)
    .from(split.chars, { yPercent: 115, rotate: 8, duration: 1.25, ease: 'expo.out', stagger: 0.028 }, 0.05)
    .from('.hero-cookie', { scale: 0.35, rotate: -140, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.25)
    .from('.hero__flakes', { opacity: 0, duration: 1.6 }, 0.5)
    .from('.hero__foot > *', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.6);
  return split;
}

/* variable-font "proximity" effect: letters near the cursor swell & soften */
export function heroProximity(chars) {
  if (!finePointer()) return;
  const hero = $('.hero');
  const base = { w: 340, s: 30 };
  const peak = { w: 760, s: 100 };
  const state = chars.map(() => ({ w: base.w, s: base.s }));
  const mouse = { x: -9999, y: -9999, active: false };
  hero.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  hero.addEventListener('pointerleave', () => (mouse.active = false));

  let visible = true;
  ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => (visible = s.isActive) });

  gsap.ticker.add(() => {
    if (!visible) return;
    chars.forEach((c, i) => {
      let tw = base.w, ts = base.s;
      if (mouse.active) {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / 320);
        const e = k * k * (3 - 2 * k);
        tw = base.w + (peak.w - base.w) * e;
        ts = base.s + (peak.s - base.s) * e;
      }
      const st = state[i];
      if (Math.abs(st.w - tw) < 0.5 && Math.abs(st.s - ts) < 0.5) return;
      st.w += (tw - st.w) * 0.14;
      st.s += (ts - st.s) * 0.14;
      c.style.fontVariationSettings = `'opsz' 144, 'wght' ${st.w.toFixed(1)}, 'SOFT' ${st.s.toFixed(1)}`;
    });
  });
}

export function heroCookie(reduced) {
  const wrap = $('.hero-cookie');
  if (reduced) return;

  // idle spin: only ticks while the hero is on screen
  const spin = gsap.to('.hero-cookie__spin', { rotate: 360, duration: 90, ease: 'none', repeat: -1 });
  ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: (s) => spin.paused(!s.isActive) });

  // mouse parallax
  if (finePointer()) {
    const xTo = gsap.quickTo(wrap, 'x', { duration: 1.2, ease: 'power3.out' });
    const yTo = gsap.quickTo(wrap, 'y', { duration: 1.2, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => {
      xTo((e.clientX / innerWidth - 0.5) * -40);
      yTo((e.clientY / innerHeight - 0.5) * -30);
    }, { passive: true });
  }

  // the break: halves split apart and crumbs spray as you scroll away
  const crumbs = $$('.crumb', wrap);
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.9 },
  });
  // halves are separate <svg> layers → these are pure compositor transforms
  tl.to('.hero-cookie__half--l', { xPercent: -11, yPercent: 3, rotate: -16, ease: 'power2.out' }, 0)
    .to('.hero-cookie__half--r', { xPercent: 11, yPercent: -2, rotate: 14, ease: 'power2.out' }, 0)
    .to('.hero-cookie__shadow', { opacity: 0, ease: 'none' }, 0)
    .to(crumbs, {
      opacity: 1,
      x: () => gsap.utils.random(-90, 90),
      y: () => gsap.utils.random(-40, 110),
      rotate: () => gsap.utils.random(-180, 180),
      ease: 'power2.out',
      stagger: { each: 0.01, from: 'center' },
    }, 0.02)
    .to(wrap, { yPercent: 38, scale: 0.92, ease: 'none' }, 0)
    .to('.hero__title', { yPercent: -10, ease: 'none' }, 0)
    .to('.hero__flakes', { opacity: 0.2, ease: 'none' }, 0);
}

/* ============ MARQUEE (scroll-velocity reactive) ============ */
export function marquee(reduced) {
  const rows = $$('.marquee__row').map((row) => {
    const inner = $('.marquee__inner', row);
    const track = document.createElement('div');
    track.className = 'marquee__track';
    row.appendChild(track);
    track.appendChild(inner);
    const w = inner.offsetWidth;
    const copies = Math.ceil((innerWidth * 2) / w) + 1;
    for (let i = 0; i < copies; i++) {
      const c = inner.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    }
    return { track, inner, w, x: 0, dir: Number(row.dataset.dir) || -1 };
  });
  if (reduced) return;

  const ro = new ResizeObserver(() => rows.forEach((r) => (r.w = r.inner.offsetWidth)));
  rows.forEach((r) => ro.observe(r.inner));

  // only run while the ticker band is on screen
  let onScreen = false;
  new IntersectionObserver(([e]) => (onScreen = e.isIntersecting), { rootMargin: '100px 0px' }).observe($('.marquee'));

  // scroll velocity from the real scroll position, so it reacts to touch scrolling too
  // (Lenis leaves touch native, where its own velocity stays 0)
  let lastY = window.scrollY;
  let v = 0;
  let skew = 0;
  let flip = 1;
  gsap.ticker.add((_, dt) => {
    const y = window.scrollY;
    const raw = ((y - lastY) / Math.max(dt, 1)) * 16.67; // px per 60fps-frame
    lastY = y;
    v += (raw - v) * 0.2;
    if (!onScreen) return;
    if (Math.abs(v) > 0.4) flip = v < 0 ? -1 : 1;
    const boost = 1 + Math.min(Math.abs(v) * 0.14, 6);
    skew += (gsap.utils.clamp(-7, 7, -v * 0.45) - skew) * 0.12;
    const step = (dt / 16.67) * 0.75 * boost;
    rows.forEach((r) => {
      r.x = gsap.utils.wrap(-r.w, 0, r.x + r.dir * flip * step);
      r.track.style.transform = `translate3d(${r.x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    });
  });
}

/* ============ GENERIC REVEALS ============ */
export function lineReveals(reduced) {
  $$('[data-lines]').forEach((el) => {
    const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
    if (reduced) return;
    gsap.from(split.lines, {
      yPercent: 110, rotate: 3, duration: 1.2, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  if (reduced) return;
  $$('.story__label, .menu__sub, .filters, .cta__label, .cta__steps > div, .footer__grid > div').forEach((el) => {
    gsap.from(el, {
      y: 30, opacity: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });
}

/* ============ STORY ============ */
export function story(reduced) {
  const text = $('[data-words]');
  const split = new SplitText(text, { type: 'words', wordsClass: 'word' });

  const counters = $$('[data-count]');
  if (reduced) return;

  gsap.fromTo(split.words, { opacity: 0.13 }, {
    opacity: 1, ease: 'none', stagger: 0.1,
    scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 50%', scrub: true },
  });
  $$('.pill', text).forEach((p) => {
    gsap.from(p, {
      scale: 0, opacity: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: p, start: 'top 80%' },
    });
    gsap.from(p.querySelector('svg'), {
      rotate: -120, scale: 0.4, duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: p, start: 'top 80%' },
    });
  });

  counters.forEach((el) => {
    const to = Number(el.dataset.count);
    const from = to === 0 ? 99 : 0;
    const o = { v: from };
    el.textContent = from;
    gsap.to(o, {
      v: to, duration: 2, ease: 'power3.out',
      onUpdate: () => (el.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
  gsap.from('.stat', {
    y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: '.stats', start: 'top 88%' },
  });
}

/* ============ PROCESS (pinned horizontal) ============ */
function drawable(svg) {
  return $$('path, circle, ellipse, rect, line, polyline', svg).map((p) => {
    const len = p.getTotalLength?.() ?? 400;
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    return p;
  });
}

export function process(reduced) {
  if (reduced) return;
  const mm = gsap.matchMedia();
  const track = $('.process__track');

  mm.add('(min-width: 821px)', () => {
    const dist = () => track.scrollWidth - window.innerWidth;
    const scroller = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.process',
        start: 'top top',
        end: () => '+=' + dist(),
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (s) => gsap.set('.process__progress i', { scaleX: s.progress }),
      },
    });

    $$('.step').forEach((step) => {
      const paths = drawable($('.step__art', step));
      gsap.to(paths, {
        strokeDashoffset: 0, ease: 'none', stagger: 0.06,
        // ends by 'left 72%' so the last panel (which stops ~68% across) finishes drawing
        scrollTrigger: { trigger: step, containerAnimation: scroller, start: 'left 98%', end: 'left 72%', scrub: true },
      });
      gsap.from($('.step__num', step), {
        yPercent: 60, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: step, containerAnimation: scroller, start: 'left 105%', end: 'left 80%', scrub: true },
      });
      gsap.from([$('h3', step), $('p', step)], {
        y: 40, opacity: 0, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: step, containerAnimation: scroller, start: 'left 95%', end: 'left 74%', scrub: true },
      });
    });
  });

  mm.add('(max-width: 820px)', () => {
    $$('.step').forEach((step) => {
      const paths = drawable($('.step__art', step));
      gsap.to(paths, {
        strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.08,
        scrollTrigger: { trigger: step, start: 'top 75%' },
      });
    });
    return () => $$('.step__art *').forEach((p) => (p.style.strokeDasharray = p.style.strokeDashoffset = ''));
  });
}

/* ============ MENU ============ */
export function menuReveal(reduced) {
  if (reduced) return;
  const cards = $$('.card');
  gsap.set(cards, { y: 80, opacity: 0 });
  ScrollTrigger.batch(cards, {
    start: 'top 92%',
    once: true,
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.09, overwrite: true }),
  });
  // gentle parallax on illustrations: desktop only (single-column phones gain little, and it's 12 scrubbed layers)
  if (!finePointer()) return;
  cards.forEach((c) => {
    gsap.fromTo($('.card__art', c), { yPercent: 6 }, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ============ CTA + FOOTER ============ */
export function finale(reduced) {
  const title = $('.cta__title');
  const split = new SplitText($$('span, em', title), { type: 'chars', charsClass: 'char' });
  const word = new SplitText($$('.footer__word > *'), { type: 'chars', charsClass: 'char' });
  if (reduced) return;

  gsap.from(split.chars, {
    yPercent: 100, opacity: 0, rotate: 10, duration: 1.3, ease: 'expo.out', stagger: 0.04,
    scrollTrigger: { trigger: title, start: 'top 82%' },
  });
  gsap.fromTo(title, { scaleY: 1.25, transformOrigin: '50% 100%' }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: title, start: 'top bottom', end: 'top 40%', scrub: true },
  });

  $$('.cta__sticker').forEach((s, i) => {
    gsap.fromTo(s, { rotate: i ? 40 : -60, y: 80 }, {
      rotate: i ? -30 : 50, y: -80, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  gsap.from('.cta__buttons > *', {
    y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: '.cta__buttons', start: 'top 92%' },
  });

  gsap.from(word.chars, {
    yPercent: 105, duration: 1.4, ease: 'expo.out', stagger: 0.045,
    scrollTrigger: { trigger: '.footer__word', start: 'top 95%' },
  });
}

/* ============ NAV ============ */
export function nav() {
  const el = $('.nav');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (s) => {
      const y = s.scroll();
      el.classList.toggle('is-scrolled', y > 40);
      const menuOpen = document.documentElement.classList.contains('menu-open');
      el.classList.toggle('is-hidden', s.direction === 1 && y > 320 && !menuOpen);
    },
  });
}

let mobileTl;
function closeMobileMenu() {
  if (!document.documentElement.classList.contains('menu-open')) return;
  $('.nav__burger').click();
}
export function mobileMenu(lenis) {
  const btn = $('.nav__burger');
  const menu = $('.mobile-menu');
  mobileTl = gsap.timeline({ paused: true })
    .set(menu, { visibility: 'visible' })
    .to(menu, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
    .from($$('a, .mobile-menu__foot', menu), { yPercent: 80, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, '-=0.4');

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('menu-open', open);
    if (open) { lenis?.stop(); mobileTl.timeScale(1).play(); }
    else { lenis?.start(); mobileTl.timeScale(1.6).reverse(); }
  });
}

/* ============ CURSOR + MAGNETIC ============ */
export function cursor() {
  if (!finePointer()) return;
  const el = $('.cursor');
  const label = $('.cursor__label');
  const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });

  window.addEventListener('pointermove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
    el.classList.add('is-visible');
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.remove('is-visible'));

  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    const labelled = t.closest('[data-cursor]');
    const interactive = t.closest('a, button, input, select, textarea, label');
    const onButtonInLabelled = labelled && t.closest('button');
    el.classList.toggle('has-label', Boolean(labelled) && !onButtonInLabelled);
    label.textContent = labelled ? labelled.dataset.cursor : '';
    el.classList.toggle('is-link', !labelled && Boolean(interactive));
    el.classList.toggle('is-hidden', Boolean(onButtonInLabelled) || Boolean(t.closest('.box, input, textarea, select')));
  });
}

export function magnetic() {
  if (!finePointer()) return;
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2) - gsap.getProperty(el, 'x')) * 0.3;
      const y = (e.clientY - (r.top + r.height / 2) - gsap.getProperty(el, 'y')) * 0.4;
      gsap.to(el, { x, y, duration: 0.6, ease: 'power3.out', overwrite: true });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .35)', overwrite: true });
    });
  });
}
