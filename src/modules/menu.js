import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categories, products } from '../config.js';
import { renderArt } from '../art.js';
import { esc } from './bind.js';
import { add, flyToBox, has, money, openBox } from './box.js';

gsap.registerPlugin(Flip, ScrollTrigger);

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const plus = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;

function card(p, i) {
  return `<article class="card" data-cat="${esc(p.category)}" data-id="${esc(p.id)}" style="--tone:${esc(p.tone)}">
    <div class="card__media" data-cursor="Add +">
      <div class="card__art">${renderArt(p.art)}</div>
      ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async">` : ''}
      <span class="card__no mono">No. ${String(i + 1).padStart(2, '0')}</span>
      ${p.tag ? `<span class="card__tag mono">${esc(p.tag)}</span>` : ''}
      <button class="card__add" type="button" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to your bake box">
        ${plus}<span class="card__add-label">Add to box</span>
      </button>
    </div>
    <div class="card__body">
      <div class="card__row">
        <h3 class="card__name">${esc(p.name)}</h3>
        <span class="card__price">${money(p.price)}</span>
      </div>
      <p class="card__desc">${esc(p.description)}</p>
      <div class="card__foot mono">
        <span>${esc(p.unit)}</span>
        <button type="button" class="card__order u-link mono" data-order="${esc(p.id)}">Order this ↗</button>
      </div>
    </div>
  </article>`;
}

export function initMenu({ reduced }) {
  const grid = document.querySelector('.grid');
  const filters = document.querySelector('.filters');
  document.querySelector('.menu__count').textContent = `(${products.length})`;

  grid.innerHTML = products.map(card).join('');
  grid.querySelectorAll('img').forEach((img) => img.addEventListener('error', () => img.remove()));

  /* ---- filters ---- */
  const counts = products.reduce((m, p) => ((m[p.category] = (m[p.category] || 0) + 1), m), {});
  filters.innerHTML =
    `<span class="filters__pill" aria-hidden="true"></span>` +
    categories
      .filter((c) => c.id === 'all' || counts[c.id])
      .map(
        (c, i) => `<button class="filter" type="button" role="tab" aria-selected="${i === 0}" data-filter="${esc(c.id)}">${esc(c.label)}<sup>${c.id === 'all' ? products.length : counts[c.id]}</sup></button>`
      )
      .join('');

  const pill = filters.querySelector('.filters__pill');
  const movePill = (btn, instant) => {
    gsap.to(pill, {
      x: btn.offsetLeft, y: btn.offsetTop - 22, width: btn.offsetWidth,
      duration: instant || reduced ? 0 : 0.65, ease: 'expo.out',
    });
  };
  const current = () => filters.querySelector('[aria-selected="true"]');
  // re-align whenever the filter row's layout changes (CSS/fonts landing, resize, wrapping)
  new ResizeObserver(() => movePill(current(), true)).observe(filters);
  document.fonts?.ready.then(() => movePill(current(), true));

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn || btn.getAttribute('aria-selected') === 'true') return;
    filters.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    movePill(btn);

    const cat = btn.dataset.filter;
    const cards = [...grid.children];
    const state = Flip.getState(cards);
    const fromH = grid.offsetHeight;
    cards.forEach((c) => (c.style.display = cat === 'all' || c.dataset.cat === cat ? '' : 'none'));
    if (reduced) return ScrollTrigger.refresh();
    // keep the page below steady: glide the grid's height instead of letting it collapse
    const toH = grid.offsetHeight;
    gsap.fromTo(grid, { height: fromH }, { height: toH, duration: 0.75, ease: 'expo.inOut', clearProps: 'height' });
    Flip.from(state, {
      duration: 0.75,
      ease: 'expo.inOut',
      absolute: true,
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'expo.out', delay: 0.25, stagger: 0.05 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4, ease: 'power2.in' }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  });

  /* ---- add / order ---- */
  grid.addEventListener('click', (e) => {
    const order = e.target.closest('[data-order]');
    if (order) {
      const id = order.dataset.order;
      if (!has(id)) add(id);
      openBox();
      return;
    }
    // mouse: the whole image adds (cursor says "Add +"). touch: only the visible button does,
    // since people tap photos just to look and shouldn't add items by accident.
    const media = e.target.closest('.card__media');
    if (!media) return;
    if (!e.target.closest('.card__add') && !finePointer.matches) return;
    const cardEl = media.closest('.card');
    const id = cardEl.dataset.id;
    add(id);
    flyToBox(cardEl.querySelector('.card__art'));

    const btn = cardEl.querySelector('.card__add');
    const label = btn.querySelector('.card__add-label');
    btn.classList.add('is-added');
    label.textContent = 'Added ✓';
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.classList.remove('is-added'); label.textContent = 'Add to box'; }, 1400);
  });
}
