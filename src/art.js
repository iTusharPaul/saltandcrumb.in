/* Procedural bakery illustrations.
   Every product gets a seeded, hand-made-looking SVG so the site looks
   finished before real photos arrive. All drawings use a 200×200 box. */

const f = (n) => Math.round(n * 10) / 10;

export function rng(seed = 1) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Catmull-Rom → cubic Bézier for smooth closed blobs */
function smooth(pts, closed = true) {
  const n = pts.length;
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

export function blob(cx, cy, r, wobble, points, rand, squash = 1) {
  const pts = [];
  const off = rand() * Math.PI;
  for (let i = 0; i < points; i++) {
    const a = off + (i / points) * Math.PI * 2;
    const rr = r * (1 + (rand() - 0.5) * wobble);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash]);
  }
  return smooth(pts);
}

function scatter(rand, count, radius, cx = 100, cy = 100, minGap = 14) {
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < 600) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * radius;
    const p = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    if (out.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > minGap)) out.push(p);
  }
  return out;
}

const shadow = (d) => `<path d="${d}" fill="#2A1A12" opacity=".13" transform="translate(5 8)"/>`;

function flakes(rand, n, radius, cx = 100, cy = 100) {
  return scatter(rand, n, radius, cx, cy, 18)
    .map(([x, y]) => {
      const w = 4 + rand() * 4;
      const h = 3 + rand() * 3;
      return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx=".8" fill="#FFFCF5" stroke="#2A1A12" stroke-opacity=".12" stroke-width=".6" transform="rotate(${f(rand() * 90)} ${f(x)} ${f(y)})"/>`;
    })
    .join('');
}

/* ---------- COOKIE ---------- */
export function cookieInner(a, rand, { withShadow = true } = {}) {
  const outer = blob(100, 100, 82, 0.09, 15, rand);
  const inner = blob(100, 100, 68, 0.12, 13, rand);
  let s = withShadow ? shadow(outer) : '';
  s += `<path d="${outer}" fill="${a.edge}"/>`;
  s += `<path d="${inner}" fill="${a.dough}"/>`;

  // cracks
  for (let i = 0; i < 5; i++) {
    const ang = rand() * Math.PI * 2;
    const r1 = 18 + rand() * 20;
    const r2 = r1 + 14 + rand() * 18;
    const bend = (rand() - 0.5) * 0.5;
    const x1 = 100 + Math.cos(ang) * r1, y1 = 100 + Math.sin(ang) * r1;
    const x2 = 100 + Math.cos(ang + bend) * r2, y2 = 100 + Math.sin(ang + bend) * r2;
    const mx = 100 + Math.cos(ang + bend * 1.6) * ((r1 + r2) / 2), my = 100 + Math.sin(ang + bend * 1.6) * ((r1 + r2) / 2);
    s += `<path d="M${f(x1)},${f(y1)} Q${f(mx)},${f(my)} ${f(x2)},${f(y2)}" stroke="${a.edge}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".55"/>`;
  }

  if (a.filling) {
    s += `<path d="${blob(100, 100, 20, 0.35, 9, rand)}" fill="${a.filling}"/>`;
    s += `<path d="${blob(96, 96, 8, 0.4, 7, rand)}" fill="#FFFFFF" opacity=".25"/>`;
  }

  const pts = scatter(rand, a.chunks ?? 8, 60, 100, 100, 17).filter(
    ([x, y]) => !a.filling || Math.hypot(x - 100, y - 100) > 26
  );
  pts.forEach(([x, y]) => {
    const r = 5 + rand() * 6.5;
    s += `<path d="${blob(x, y, r, 0.7, 6, rand)}" fill="${a.chunk}"/>`;
    s += `<path d="${blob(x - r * 0.25, y - r * 0.3, r * 0.35, 0.5, 5, rand)}" fill="#FFFFFF" opacity=".14"/>`;
  });

  if (a.petals) {
    scatter(rand, 5, 58, 100, 100, 20).forEach(([x, y]) => {
      s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="5" ry="2.4" fill="${a.petals}" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})"/>`;
    });
  }
  if (a.flakes) s += flakes(rand, a.flakes, 58);
  return s;
}

/* ---------- BROWNIE / BLONDIE ---------- */
function brownie(a, rand) {
  const pts = [];
  const corners = [[38, 42], [162, 38], [166, 160], [34, 164]];
  corners.forEach((c, i) => {
    const n = corners[(i + 1) % 4];
    for (let k = 0; k < 5; k++) {
      const t = k / 5;
      pts.push([c[0] + (n[0] - c[0]) * t + (rand() - 0.5) * 4, c[1] + (n[1] - c[1]) * t + (rand() - 0.5) * 4]);
    }
  });
  const body = smooth(pts);
  let s = shadow(body);
  s += `<path d="${body}" fill="${a.base}"/>`;
  // side depth
  s += `<path d="M36,150 Q100,170 166,150 L166,160 Q100,180 34,164Z" fill="#000" opacity=".18"/>`;
  // crackly top sheen
  for (let i = 0; i < 6; i++) {
    const x = 55 + rand() * 90, y = 55 + rand() * 80;
    s += `<path d="${blob(x, y, 12 + rand() * 14, 0.8, 7, rand, 0.6)}" fill="${a.top}" opacity=".9"/>`;
  }
  for (let i = 0; i < 7; i++) {
    const x = 50 + rand() * 100, y = 52 + rand() * 96;
    s += `<path d="M${f(x)},${f(y)} l${f(8 + rand() * 10)},${f((rand() - 0.5) * 8)}" stroke="#FFF" stroke-opacity=".22" stroke-width="1.4" stroke-linecap="round"/>`;
  }
  scatter(rand, 7, 52, 100, 100, 22).forEach(([x, y]) => {
    s += `<path d="${blob(x, y, 5 + rand() * 4, 0.8, 6, rand)}" fill="${a.chunk}"/>`;
  });
  s += flakes(rand, 3, 50);
  return s;
}

/* ---------- CROISSANT ---------- */
function croissant(a, rand) {
  let s = `<ellipse cx="104" cy="152" rx="80" ry="14" fill="#2A1A12" opacity=".12"/>`;
  const segs = [
    { t: 0.0, rx: 20, ry: 13 },
    { t: 1.0, rx: 20, ry: 13 },
    { t: 0.17, rx: 30, ry: 18 },
    { t: 0.83, rx: 30, ry: 18 },
    { t: 0.34, rx: 40, ry: 24 },
    { t: 0.66, rx: 40, ry: 24 },
    { t: 0.5, rx: 46, ry: 27 },
  ];
  segs.forEach(({ t, rx, ry }) => {
    const ang = (200 + t * 140) * (Math.PI / 180);
    const x = 100 + Math.cos(ang) * 74;
    const y = 178 + Math.sin(ang) * 74;
    const rot = (ang * 180) / Math.PI;
    s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">
      <ellipse rx="${rx}" ry="${ry}" fill="#B86A2A"/>
      <ellipse rx="${rx * 0.82}" ry="${ry * 0.7}" cx="${rx * 0.08}" fill="#D58E43"/>
      <ellipse rx="${rx * 0.5}" ry="${ry * 0.26}" cx="${rx * 0.3}" fill="#F0C27A" opacity=".75"/>
    </g>`;
  });
  return s;
}

/* ---------- CINNAMON ROLL ---------- */
function roll(a, rand) {
  const outer = blob(100, 100, 80, 0.06, 14, rand);
  let s = shadow(outer) + `<path d="${outer}" fill="#C88A4E"/>`;
  s += `<path d="${blob(100, 100, 74, 0.05, 14, rand)}" fill="#E2B07A"/>`;
  const pts = [];
  for (let th = 0; th < Math.PI * 2 * 3.6; th += 0.12) {
    const r = 4 + th * 2.95;
    pts.push(`${f(100 + Math.cos(th) * r)},${f(100 + Math.sin(th) * r)}`);
  }
  s += `<polyline points="${pts.join(' ')}" fill="none" stroke="#8A4B22" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  // glaze drizzle: thin wobbly diagonal lines
  for (let i = 0; i < 4; i++) {
    const y0 = 58 + i * 26;
    let d = `M${34 + i * 4},${y0 + 14}`;
    for (let k = 1; k <= 6; k++) {
      const x = 34 + i * 4 + k * 22;
      const y = y0 + 14 - k * 5 + (k % 2 ? -5 : 5) * (0.6 + rand() * 0.6);
      d += ` Q${f(x - 11)},${f(y + (k % 2 ? 7 : -7))} ${f(x)},${f(y)}`;
    }
    s += `<path d="${d}" fill="none" stroke="#FFF7EA" stroke-width="${f(3 + rand() * 1.4)}" stroke-linecap="round" opacity=".93"/>`;
  }
  scatter(rand, 8, 62, 100, 100, 16).forEach(([x, y]) => {
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="1.8" fill="#4F6B33"/>`;
  });
  return s;
}

/* ---------- MUFFIN ---------- */
function muffin(a, rand) {
  let s = `<ellipse cx="102" cy="176" rx="60" ry="9" fill="#2A1A12" opacity=".13"/>`;
  s += `<path d="M52,104 L66,172 Q100,180 134,172 L148,104Z" fill="#E9E1D3"/>`;
  for (let i = 0; i < 9; i++) {
    const x = 56 + i * 11;
    s += `<path d="M${x},106 L${f(68 + i * 8.2)},172" stroke="#2A1A12" stroke-opacity=".12" stroke-width="1.4"/>`;
  }
  const dome = smooth([
    [40, 110], [44, 78], [66, 50], [100, 40], [136, 50], [158, 78], [160, 110], [100, 120],
  ]);
  s += `<path d="${dome}" fill="#C98B4B"/>`;
  s += `<path d="M50,96 Q60,60 100,52 Q140,60 150,96 Q100,104 50,96Z" fill="#DBA463"/>`;
  scatter(rand, 16, 44, 100, 76, 9).forEach(([x, y]) => {
    s += `<path d="${blob(x, y, 3.4 + rand() * 2.4, 0.6, 5, rand)}" fill="#F0CF94"/>`;
  });
  scatter(rand, 6, 42, 100, 84, 16).forEach(([x, y]) => {
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(4.5 + rand() * 2)}" fill="#3D3466"/><circle cx="${f(x - 1.3)}" cy="${f(y - 1.4)}" r="1.3" fill="#fff" opacity=".35"/>`;
  });
  return s;
}

/* ---------- LOAF ---------- */
function loaf(a, rand) {
  let s = `<ellipse cx="102" cy="164" rx="84" ry="10" fill="#2A1A12" opacity=".13"/>`;
  s += `<path d="M24,160 L24,96 Q24,64 60,58 L144,58 Q178,64 178,96 L178,160 Q100,170 24,160Z" fill="#7A431E"/>`;
  s += `<path d="M34,152 L34,100 Q36,76 64,72 L140,72 Q168,76 168,100 L168,152 Q100,160 34,152Z" fill="#9C5A2A" opacity=".55"/>`;
  // split crust
  s += `<path d="M44,78 Q100,52 160,78 Q100,92 44,78Z" fill="#D59A57"/>`;
  s += `<path d="M58,77 Q100,62 146,77" stroke="#F3CD8B" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  // demerara
  scatter(rand, 14, 40, 100, 80, 7).forEach(([x, y]) => {
    s += `<rect x="${f(x)}" y="${f(y * 0.9 + 6)}" width="2.6" height="2.2" fill="#F7E2B5" transform="rotate(${f(rand() * 90)} ${f(x)} ${f(y)})"/>`;
  });
  // banana slice on top
  s += `<ellipse cx="128" cy="66" rx="16" ry="7" fill="#F2DE9E" transform="rotate(-10 128 66)"/>`;
  s += `<circle cx="124" cy="66" r="1.2" fill="#6A4A2A"/><circle cx="130" cy="64" r="1.2" fill="#6A4A2A"/><circle cx="131" cy="69" r="1.2" fill="#6A4A2A"/>`;
  // walnuts
  [[70, 120], [120, 132], [96, 104], [146, 112]].forEach(([x, y]) => {
    s += `<path d="${blob(x, y, 7, 0.5, 7, rand)}" fill="#5B3418" opacity=".8"/>`;
  });
  return s;
}

/* ---------- GIFT BOX ---------- */
const MINI = [
  { dough: '#C98E55', edge: '#9C6434', chunk: '#2B1710', chunks: 6, flakes: 3 },
  { dough: '#93302D', edge: '#6E2020', chunk: '#F4E8D6', chunks: 5 },
  { dough: '#DDBB85', edge: '#B8925A', chunk: '#7E9447', chunks: 6, petals: '#C46D78' },
  { dough: '#BC7A41', edge: '#8F5528', chunk: '#6B3518', chunks: 5 },
  { dough: '#D29D62', edge: '#A8703D', chunk: '#4A2A1A', chunks: 7 },
  { dough: '#C98E55', edge: '#9C6434', chunk: '#2B1710', chunks: 6, flakes: 3 },
];
function box(a, rand) {
  let s = `<rect x="18" y="30" width="172" height="150" rx="8" fill="#2A1A12" opacity=".13"/>`;
  s += `<rect x="12" y="22" width="172" height="150" rx="8" fill="#C59D72"/>`;
  s += `<rect x="20" y="30" width="156" height="134" rx="5" fill="#A77D52"/>`;
  s += `<rect x="20" y="30" width="156" height="134" rx="5" fill="#F7EEDF" opacity=".95"/>`;
  MINI.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 46 + col * 52;
    const y = 64 + row * 66;
    s += `<g transform="translate(${x - 24} ${y - 24}) scale(.24)">${cookieInner(m, rng(a.seed * 10 + i))}</g>`;
  });
  // twine
  s += `<path d="M12,98 L184,92" stroke="#7A4A26" stroke-width="2.4"/><path d="M98,22 L102,172" stroke="#7A4A26" stroke-width="2.4"/>`;
  s += `<path d="M100,95 q-16,-18 -22,-2 q6,10 22,2 q16,-18 22,-2 q-6,10 -22,2" fill="none" stroke="#7A4A26" stroke-width="2.4"/>`;
  // tag
  s += `<g transform="rotate(-12 150 140)"><rect x="128" y="126" width="46" height="24" rx="3" fill="#F3EBDD" stroke="#2A1A12" stroke-opacity=".25"/><text x="151" y="142" font-family="Fraunces, serif" font-size="10" font-style="italic" text-anchor="middle" fill="#2A1A12">S&amp;C</text></g>`;
  return s;
}

const KINDS = { cookie: (a, r) => cookieInner(a, r), brownie, croissant, roll, muffin, loaf, box };

export function renderArt(art, className = '') {
  const draw = KINDS[art.kind] ?? KINDS.cookie;
  return `<svg class="${className}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${draw(art, rng(art.seed ?? 1))}</svg>`;
}

/* ---------- HERO: a cookie that breaks apart on scroll ---------- */
export function heroCookie() {
  const a = { dough: '#C98E55', edge: '#9C6434', chunk: '#2B1710', chunks: 10, flakes: 9 };
  const inner = cookieInner(a, rng(7), { withShadow: false });
  const rand = rng(99);

  // jagged break line top → bottom
  const zig = [];
  for (let y = -4; y <= 204; y += 13) zig.push([100 + (rand() - 0.5) * 18, y]);
  const zz = zig.map((p) => `${f(p[0])},${f(p[1])}`).join(' L');
  const left = `M-10,-10 L${zz} L-10,210Z`;
  const right = `M210,-10 L${zz} L210,210Z`;

  let crumbs = '';
  for (let i = 0; i < 16; i++) {
    const [x, y] = zig[Math.floor(rand() * zig.length)];
    const r = 2.4 + rand() * 4.6;
    const col = rand() > 0.3 ? a.dough : a.chunk;
    crumbs += `<path class="crumb" d="${blob(x, Math.min(180, Math.max(20, y)), r, 0.7, 6, rand)}" fill="${col}"/>`;
  }

  const outer = blob(100, 100, 82, 0.09, 15, rng(7));
  // Each piece is its own <svg> so the break animates as GPU-composited layers:
  // the detailed cookie is rasterised once instead of re-painted every scroll frame.
  const layer = (cls, body) =>
    `<svg class="hero-cookie__layer ${cls}" viewBox="-20 -20 240 240" aria-hidden="true" focusable="false">${body}</svg>`;
  return `<div class="hero-cookie__spin">
    ${layer('hero-cookie__shadow', `<path d="${outer}" fill="#2A1A12" opacity=".14" transform="translate(6 10)"/>`)}
    ${layer('hero-cookie__half hero-cookie__half--l', `<defs><clipPath id="hc-l"><path d="${left}"/></clipPath></defs><g clip-path="url(#hc-l)">${inner}</g>`)}
    ${layer('hero-cookie__half hero-cookie__half--r', `<defs><clipPath id="hc-r"><path d="${right}"/></clipPath></defs><g clip-path="url(#hc-r)">${inner}</g>`)}
    ${layer('hero-cookie__crumbs', crumbs)}
  </div>`;
}
