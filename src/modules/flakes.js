/* "Salt & Crumb" particles — salt flakes and toasted crumbs drifting
   down the hero; the cursor gently pushes them aside. */
export function initFlakes(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, flakes = [], raf = 0, running = false;
  const mouse = { x: -9999, y: -9999 };

  const make = (anywhere) => {
    const crumb = Math.random() < 0.28;
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -12,
      s: crumb ? 1.6 + Math.random() * 2.6 : 2 + Math.random() * 4.2,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.018,
      vy: 0.14 + Math.random() * 0.42,
      vx: (Math.random() - 0.5) * 0.12,
      sway: Math.random() * Math.PI * 2,
      ox: 0, oy: 0,
      a: 0.55 + Math.random() * 0.45,
      crumb,
      tone: Math.random(),
    };
  };

  // phones: cap pixel density lower (flakes are tiny, 3× DPR is wasted fill) and use fewer particles
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const resize = () => {
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    if (nw === w && nh === h) return;
    w = nw;
    h = nh;
    const dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(touch ? 34 : 110, (w * h) / (touch ? 9000 : 13000)));
    flakes = Array.from({ length: n }, () => make(true));
  };

  const draw = (f) => {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.r);
    const s = f.s;
    ctx.beginPath();
    if (f.crumb) {
      ctx.moveTo(-s, -s * 0.4);
      ctx.lineTo(-s * 0.2, -s);
      ctx.lineTo(s, -s * 0.3);
      ctx.lineTo(s * 0.6, s * 0.8);
      ctx.lineTo(-s * 0.6, s * 0.7);
      ctx.closePath();
      ctx.fillStyle = f.tone > 0.5 ? `rgba(156,100,52,${f.a * 0.75})` : `rgba(201,142,85,${f.a * 0.85})`;
      ctx.fill();
    } else {
      ctx.moveTo(-s, -s * 0.55);
      ctx.lineTo(s * 0.85, -s * 0.8);
      ctx.lineTo(s, s * 0.5);
      ctx.lineTo(-s * 0.7, s * 0.7);
      ctx.closePath();
      ctx.fillStyle = `rgba(255,252,245,${f.a})`;
      ctx.fill();
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = 'rgba(42,26,18,0.2)';
      ctx.stroke();
    }
    ctx.restore();
  };

  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.sway += 0.012;
      const dx = f.x - mouse.x, dy = f.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 130 && d > 0.1) {
        const force = (1 - d / 130) * 1.1;
        f.ox += (dx / d) * force;
        f.oy += (dy / d) * force;
      }
      f.ox *= 0.92;
      f.oy *= 0.92;
      f.x += f.vx + Math.sin(f.sway) * 0.18 + f.ox;
      f.y += f.vy + f.oy;
      f.r += f.vr + f.ox * 0.02;
      if (f.y > h + 14) Object.assign(f, make(false));
      if (f.x < -14) f.x = w + 12;
      if (f.x > w + 14) f.x = -12;
      draw(f);
    }
    raf = requestAnimationFrame(tick);
  };

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  };

  resize();
  // observe the canvas itself, not window resize: the mobile address bar showing/hiding
  // fires window resizes but doesn't change the (100svh) hero, so nothing is rebuilt
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('pointermove', onMove, { passive: true });

  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(tick); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(canvas);
  return { start, stop };
}
