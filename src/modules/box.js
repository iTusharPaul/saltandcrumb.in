import { gsap } from 'gsap';
import { brand, products } from '../config.js';
import { renderArt } from '../art.js';
import { esc, links } from './bind.js';

const KEY = 'saltandcrumb-box-v1';
const byId = Object.fromEntries(products.map((p) => [p.id, p]));

export const money = (n) => `${brand.currency}${Number(n).toLocaleString('en-IN')}`;

let items = load();
let ctx = { lenis: null, reduced: false };

const $ = (s, el = document) => el.querySelector(s);
const boxEl = $('.box');
const overlay = $('.box-overlay');
const list = $('.box__list');
const form = $('.box__details');
const countEl = $('.nav__count');
const totalEl = $('.box__total b');
const toastEl = $('.toast');
const mbar = $('.mbar');
const mbarCount = $('.mbar__count');
const mbarTotal = $('.mbar__total');

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return Object.fromEntries(
      Object.entries(raw).filter(([id, q]) => byId[id] && Number.isInteger(q) && q > 0)
    );
  } catch {
    return {};
  }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode: keep in memory */ }
}

const count = () => Object.values(items).reduce((a, b) => a + b, 0);
const total = () => Object.entries(items).reduce((s, [id, q]) => s + byId[id].price * q, 0);
export const has = (id) => Boolean(items[id]);

function thumb(p) {
  return `<div class="box__thumb" style="--tone:${esc(p.tone)}">${renderArt(p.art)}${
    p.image ? `<img src="${esc(p.image)}" alt="">` : ''
  }</div>`;
}

function render() {
  const entries = Object.entries(items);
  boxEl.classList.toggle('is-empty', entries.length === 0);
  list.innerHTML = entries
    .map(([id, q]) => {
      const p = byId[id];
      return `<li class="box__item" data-id="${esc(id)}">
        ${thumb(p)}
        <div>
          <p class="box__name">${esc(p.name)}</p>
          <span class="box__meta mono">${money(p.price)} · ${esc(p.unit)}</span>
        </div>
        <div class="box__right">
          <span class="box__line-total">${money(p.price * q)}</span>
          <div class="qty">
            <button type="button" data-qty="-1" aria-label="One less ${esc(p.name)}">−</button>
            <output aria-label="Quantity">${q}</output>
            <button type="button" data-qty="1" aria-label="One more ${esc(p.name)}">+</button>
          </div>
        </div>
      </li>`;
    })
    .join('');
  list.querySelectorAll('img').forEach((img) => img.addEventListener('error', () => img.remove()));
  const n = count();
  countEl.textContent = n;
  totalEl.textContent = money(total());
  mbarCount.textContent = n;
  mbarTotal.textContent = money(total());
  mbar.classList.toggle('is-on', n > 0);
  mbar.tabIndex = n > 0 ? 0 : -1;
  mbar.setAttribute('aria-label', `Open your bake box, ${n} item${n === 1 ? '' : 's'}, ${money(total())}`);
}

const mbarShown = () => getComputedStyle(mbar).display !== 'none' && mbar.classList.contains('is-on');

export function add(id, n = 1) {
  if (!byId[id]) return;
  items[id] = (items[id] || 0) + n;
  save();
  render();
}

function setQty(id, q) {
  if (q <= 0) delete items[id];
  else items[id] = q;
  save();
  render();
}

/* ---------- drawer ---------- */
let isOpen = false;
let lastFocus = null;

export function openBox() {
  if (isOpen) return;
  isOpen = true;
  lastFocus = document.activeElement;
  ctx.lenis?.stop();
  boxEl.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('box-open');
  const d = ctx.reduced ? 0 : 1;
  gsap.timeline()
    .to(overlay, { autoAlpha: 1, duration: 0.5 * d, ease: 'power2.out' }, 0)
    .to(boxEl, { visibility: 'visible', x: 0, duration: 0.9 * d, ease: 'expo.out' }, 0)
    .from(boxEl.querySelectorAll('.box__item, .box__empty > *, .box__details > *'), {
      x: 40, opacity: 0, duration: 0.7 * d, ease: 'expo.out', stagger: 0.04,
    }, 0.12 * d);
  setTimeout(() => $('.box__close').focus({ preventScroll: true }), 50);
}

export function closeBox() {
  if (!isOpen) return;
  isOpen = false;
  boxEl.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('box-open');
  const d = ctx.reduced ? 0 : 1;
  gsap.timeline({ onComplete: () => ctx.lenis?.start() })
    .to(boxEl, { x: () => boxEl.offsetWidth + 20, duration: 0.7 * d, ease: 'expo.inOut' }, 0)
    .set(boxEl, { visibility: 'hidden' })
    .to(overlay, { autoAlpha: 0, duration: 0.5 * d }, 0.2 * d);
  lastFocus?.focus?.({ preventScroll: true });
}

/* ---------- toast ---------- */
let toastTimer;
export function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3600);
}

/* ---------- order message ---------- */
function formatDate(v) {
  if (!v) return '';
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function message() {
  const f = new FormData(form);
  const lines = Object.entries(items).map(([id, q]) => {
    const p = byId[id];
    const unit = p.unit === 'each' ? '' : ` (${p.unit})`;
    return `• ${q} × ${p.name}${unit} — ${money(p.price * q)}`;
  });
  let msg = `Hi ${brand.name}! I’d like to order:\n\n${lines.join('\n')}\n\nEstimated total: ${money(total())}`;
  const name = f.get('name')?.toString().trim();
  const date = formatDate(f.get('date')?.toString());
  const mode = f.get('mode')?.toString();
  const note = f.get('note')?.toString().trim();
  const extra = [
    name && `Name: ${name}`,
    date && `Needed on: ${date}`,
    mode && `Pickup / delivery: ${mode}`,
    note && `Note: ${note}`,
  ].filter(Boolean);
  if (extra.length) msg += `\n\n${extra.join('\n')}`;
  return msg;
}

function copyText(text) {
  // synchronous copy keeps the user gesture alive for the window.open that follows
  let ok = false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    ok = document.execCommand('copy');
    ta.remove();
  } catch { /* ignore */ }
  navigator.clipboard?.writeText(text).catch(() => {});
  return ok || Boolean(navigator.clipboard);
}

function send(channel) {
  if (!count()) return;
  const msg = message();
  if (channel === 'whatsapp') {
    window.open(links.whatsapp(msg), '_blank', 'noopener');
    toast('Opening WhatsApp with your order…');
  } else {
    const copied = copyText(msg);
    window.open(links.instagramDm(), '_blank', 'noopener');
    toast(copied ? 'Order copied! Paste it into the Instagram DM.' : 'Opening Instagram. Tell us what you’d like!');
  }
}

/* ---------- fly-to-box ---------- */
/* where a counter will be once its (fixed) bar finishes sliding in.
   offset* values ignore transforms, so this works mid-transition. */
function restingCenter(el, bar) {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  for (let n = el; n && n !== bar.offsetParent; n = n.offsetParent) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return [x, y];
}

export function flyToBox(fromEl) {
  // phones: fly into the floating bar; otherwise reveal the nav and fly into its counter
  const toBar = mbarShown();
  if (!toBar) $('.nav').classList.remove('is-hidden');
  const target = toBar ? mbarCount : countEl;
  if (ctx.reduced || !fromEl) return bump(target);
  const r = fromEl.getBoundingClientRect();
  const [tx, ty] = restingCenter(target, toBar ? mbar : $('.nav'));

  const fly = document.createElement('div');
  fly.className = 'fly';
  fly.innerHTML = fromEl.innerHTML;
  Object.assign(fly.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  document.body.appendChild(fly);

  gsap.timeline({ onComplete: () => { fly.remove(); bump(target); } })
    .to(fly, { x: tx - (r.left + r.width / 2), duration: 0.95, ease: 'power1.inOut' }, 0)
    .to(fly, { y: ty - (r.top + r.height / 2), duration: 0.95, ease: 'power3.in' }, 0)
    .to(fly, { scale: 0.1, rotation: 220, duration: 0.95, ease: 'power2.in' }, 0);
}

function bump(el = countEl) {
  gsap.fromTo(el, { scale: 1.6, backgroundColor: '#B5642A', color: '#F3EBDD' }, {
    scale: 1, backgroundColor: '#E3A945', color: '#2A1A12', duration: 0.9, ease: 'elastic.out(1, .4)', clearProps: 'backgroundColor,color',
  });
}

/* ---------- init ---------- */
export function initBox(options) {
  ctx = { ...ctx, ...options };
  $('.box__empty-art').innerHTML = renderArt({ kind: 'box', seed: 5 });
  render();

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-box]')) return openBox();
    const close = e.target.closest('[data-close-box]');
    if (close) {
      closeBox();
      const goto = close.dataset.goto;
      if (goto) setTimeout(() => ctx.lenis ? ctx.lenis.scrollTo(goto, { duration: 1.4 }) : document.querySelector(goto)?.scrollIntoView(), 350);
      return;
    }
    const q = e.target.closest('[data-qty]');
    if (q) {
      const id = q.closest('.box__item').dataset.id;
      setQty(id, (items[id] || 0) + Number(q.dataset.qty));
      return;
    }
    const s = e.target.closest('[data-send]');
    if (s) send(s.dataset.send);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeBox();
  });
}
