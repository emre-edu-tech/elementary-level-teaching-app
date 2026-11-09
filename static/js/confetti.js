// Canvas confetti, no library. Spec in docs/05-frontend.md: ~80 particles
// from top-center, 1.5 s, simple rects + circles, palette from the design
// colors. The <canvas id="confetti"> lives in base.html (fixed, no pointer).

const COLORS = ["#fbbf24", "#f59e0b", "#fb7185", "#34d399", "#38bdf8", "#f8fafc"];

const DURATION = 1500;
const COUNT = 80;
const GRAVITY = 0.18;

export function confetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas && canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const parts = [];
  for (let i = 0; i < COUNT; i++) {
    parts.push({
      x: w / 2,
      y: -10,
      vx: (Math.random() - 0.5) * 14,
      vy: 1 + Math.random() * 4,
      size: 6 + Math.random() * 6,
      round: Math.random() < 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
    });
  }

  const start = performance.now();
  (function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }
      ctx.restore();
    }
    if (t < DURATION) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  })(start);
}
