// Renders a post's worked-muscle map (front + back figures, highlighted by
// activation intensity) to a shareable PNG. Mirrors the canvas approach used by
// useWeeklyShare so shared posts carry an actual image of the graphic.
import { aggregateMuscleActivation, MUSCLE_LABELS } from '@/utils/muscleMap';

const FONT = "'Inter Tight', Inter, system-ui, sans-serif";
const W = 1080;
const CX = W / 2;

// Body base + muscle geometry, authored in the same 300x320 viewBox / center=75
// coordinate space as BodyMuscleMap.vue (back figure = front translated +150).
const BASE_PATHS = [
  'M55 56 Q75 50 95 56 L90 124 Q75 130 60 124 Z',          // torso
  'M60 122 L90 122 L86 150 Q75 154 64 150 Z',              // pelvis
  'M40 64 Q40 56 47 56 Q54 56 54 64 L52 128 Q52 135 46 135 Q40 135 40 128 Z', // arm L
  'M110 64 Q110 56 103 56 Q96 56 96 64 L98 128 Q98 135 104 135 Q110 135 110 128 Z', // arm R
  'M60 150 L73 150 L73 232 Q73 238 66.5 238 Q60 238 60 232 Z', // leg L
  'M77 150 L90 150 L90 232 Q90 238 83.5 238 Q77 238 77 232 Z', // leg R
];

const FRONT_MUSCLES = {
  shoulders: [{ e: [49, 62, 9, 8] }, { e: [101, 62, 9, 8] }],
  chest:     [{ p: 'M74 57 Q61 58 60 69 Q61 79 74 79 Z' }, { p: 'M76 57 Q89 58 90 69 Q89 79 76 79 Z' }],
  biceps:    [{ e: [46, 86, 6, 15] }, { e: [104, 86, 6, 15] }],
  forearms:  [{ e: [44, 118, 5.5, 15] }, { e: [106, 118, 5.5, 15] }],
  core:      [{ r: [64, 83, 22, 38, 7] }],
  quads:     [{ e: [66, 186, 7, 30] }, { e: [84, 186, 7, 30] }],
};

const BACK_MUSCLES = {
  traps:      [{ p: 'M211 56 Q225 52 239 56 Q233 70 225 70 Q217 70 211 56 Z' }],
  shoulders:  [{ e: [199, 62, 9, 8] }, { e: [251, 62, 9, 8] }],
  back:       [{ p: 'M224 72 Q212 74 211 92 Q212 108 224 110 Z' }, { p: 'M226 72 Q238 74 239 92 Q238 108 226 110 Z' }],
  triceps:    [{ e: [196, 86, 6, 15] }, { e: [254, 86, 6, 15] }],
  forearms:   [{ e: [194, 118, 5.5, 15] }, { e: [256, 118, 5.5, 15] }],
  glutes:     [{ p: 'M225 124 Q212 124 212 137 Q212 149 225 149 Z' }, { p: 'M225 124 Q238 124 238 137 Q238 149 225 149 Z' }],
  hamstrings: [{ e: [216, 180, 7, 26] }, { e: [234, 180, 7, 26] }],
  calves:     [{ e: [216, 216, 6, 15] }, { e: [234, 216, 6, 15] }],
};

const MUSCLE_STROKE = 'rgba(255,255,255,0.14)';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function muscleFill(v) {
  if (!v || v <= 0) return 'rgba(255,255,255,0.10)';
  return `hsla(215, 92%, 56%, ${(0.22 + 0.73 * v).toFixed(3)})`;
}

function drawBase(ctx) {
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.strokeStyle = 'rgba(255,255,255,0.13)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(75, 30, 12.5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, 69.5, 39, 11, 8, 3);
  ctx.fill();
  ctx.stroke();
  for (const d of BASE_PATHS) {
    const p = new Path2D(d);
    ctx.fill(p);
    ctx.stroke(p);
  }
}

function drawMuscles(ctx, groups, activation) {
  for (const [key, shapes] of Object.entries(groups)) {
    ctx.fillStyle = muscleFill(activation[key]);
    for (const s of shapes) {
      if (s.e) {
        const [cx, cy, rx, ry] = s.e;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      } else if (s.r) {
        const [x, y, w, h, rad] = s.r;
        roundRect(ctx, x, y, w, h, rad);
      } else {
        const p = new Path2D(s.p);
        ctx.fill(p);
        ctx.strokeStyle = MUSCLE_STROKE;
        ctx.lineWidth = 0.5;
        ctx.stroke(p);
        continue;
      }
      ctx.fill();
      ctx.strokeStyle = MUSCLE_STROKE;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}

function renderCard(data, locale) {
  const activation = data.activation || {};
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // ── Geometry: figures + legend rows are laid out before painting so the
  //    canvas height fits the content (no overlap between legend and footer). ──
  const scale = 2.55;
  const figW = 300 * scale;
  const offsetX = (W - figW) / 2;
  const offsetY = 340;
  const figBottom = offsetY + 244 * scale; // body ends ~y=238 in the 300x320 viewBox

  const top = Object.entries(activation)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key]) => (MUSCLE_LABELS[key]?.[locale] || MUSCLE_LABELS[key]?.es || key).toUpperCase());

  const padX = 34;
  const gap = 18;
  const pillH = 58;
  ctx.font = `800 26px ${FONT}`;
  const rows = [];
  if (top.length) {
    let row = [];
    let rowW = 0;
    top.forEach((t) => {
      const pw = ctx.measureText(t).width + padX * 2;
      if (rowW + pw + (row.length ? gap : 0) > W - 120 && row.length) {
        rows.push({ items: row, width: rowW });
        row = [];
        rowW = 0;
      }
      row.push({ t, pw });
      rowW += pw + (row.length > 1 ? gap : 0);
    });
    if (row.length) rows.push({ items: row, width: rowW });
  }

  const legendTop = figBottom + 46;
  const legendH = rows.length ? rows.length * pillH + (rows.length - 1) * gap : 0;
  const footerTop = (rows.length ? legendTop + legendH + 50 : figBottom + 46);
  const H = Math.round(footerTop + 70);

  canvas.width = W;
  canvas.height = H;

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#080b12';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(CX, H * 0.45, 80, CX, H * 0.45, 640);
  glow.addColorStop(0, 'rgba(37,99,235,0.18)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 72) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // ── Header ──────────────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 60px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.fillText('REPPY', CX - 8, 110);
  ctx.fillStyle = 'hsl(215 92% 56%)';
  const w = ctx.measureText('REPPY').width;
  ctx.fillText('.', CX - 8 + w / 2 + 14, 110);

  ctx.font = `800 30px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.fillText(locale === 'es' ? 'MÚSCULOS TRABAJADOS' : 'WORKED MUSCLES', CX, 178);

  if (data.userName) {
    ctx.font = `800 40px ${FONT}`;
    ctx.fillStyle = '#fff';
    ctx.fillText(data.userName, CX, 240);
  }
  if (data.totalReps) {
    ctx.font = `900 34px ${FONT}`;
    ctx.fillStyle = 'hsl(215 92% 56%)';
    ctx.fillText(`${Number(data.totalReps).toLocaleString()} REPS`, CX, 296);
  }

  // ── Figures ─────────────────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  drawBase(ctx);
  drawMuscles(ctx, FRONT_MUSCLES, activation);
  ctx.save();
  ctx.translate(150, 0);
  drawBase(ctx);
  ctx.restore();
  drawMuscles(ctx, BACK_MUSCLES, activation);
  ctx.restore();

  ctx.font = `800 26px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.textAlign = 'center';
  ctx.fillText(locale === 'es' ? 'FRENTE' : 'FRONT', offsetX + 75 * scale, offsetY + 18);
  ctx.fillText(locale === 'es' ? 'ESPALDA' : 'BACK', offsetX + 225 * scale, offsetY + 18);

  // ── Legend pills ────────────────────────────────────────────────────────────
  if (rows.length) {
    ctx.font = `800 26px ${FONT}`;
    let py = legendTop;
    rows.forEach((r) => {
      let px = CX - r.width / 2;
      r.items.forEach(({ t, pw }) => {
        roundRect(ctx, px, py, pw, pillH, pillH / 2);
        ctx.fillStyle = 'rgba(37,99,235,0.14)';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(37,99,235,0.40)';
        ctx.stroke();
        ctx.fillStyle = 'hsl(215 92% 66%)';
        ctx.fillText(t, px + pw / 2, py + pillH / 2 + 1);
        px += pw + gap;
      });
      py += pillH + gap;
    });
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  ctx.font = `700 24px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('reppy.romandev.app', CX, footerTop + 24);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/png', 0.95);
  });
}

/**
 * Build a shareable PNG File of a post's worked-muscle map.
 * @returns {Promise<File|null>} null when the post has no mapped muscle data.
 */
export async function buildMuscleShareImage(activity, locale) {
  const activation = aggregateMuscleActivation(activity?.exercises);
  if (!activation || Object.keys(activation).length === 0) return null;

  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }
  const canvas = renderCard(
    {
      activation,
      userName: activity?.user_name,
      totalReps: activity?.total_reps_today,
    },
    locale
  );
  const blob = await canvasToBlob(canvas);
  return new File([blob], 'reppy-musculos.png', { type: 'image/png' });
}
