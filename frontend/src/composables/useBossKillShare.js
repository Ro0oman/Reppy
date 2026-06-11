import { useNotificationStore } from '@/stores/notification';
import { useI18nStore } from '@/stores/i18n';

const PRIMARY = 'hsl(215 92% 56%)';
const AMBER = '#f59e0b';
const RED = '#ef4444';
const FONT = "'Inter Tight', Inter, system-ui, sans-serif";
const W = 1080, H = 1920, CX = W / 2;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function setShadow(ctx, blur = 0, color = 'rgba(0,0,0,0.9)') {
  ctx.shadowColor = blur ? color : 'transparent';
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = blur ? 3 : 0;
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const cr = w / h;
  let dw, dh, dx, dy;
  if (ir > cr) { dh = h; dw = h * ir; dx = x + (w - dw) / 2; dy = y; }
  else { dw = w; dh = w / ir; dx = x; dy = y + (h - dh) / 2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}

async function renderCard(data, top3, locale, bossImg) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0a0205';
  ctx.fillRect(0, 0, W, H);

  if (bossImg) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    drawCover(ctx, bossImg, 0, 0, W, H);
    ctx.restore();
  }

  // Dark overlay
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);

  // Red glow top
  const topGlow = ctx.createRadialGradient(CX, 0, 0, CX, 0, 700);
  topGlow.addColorStop(0, 'rgba(220,20,20,0.35)');
  topGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

  // Bottom fade
  const fade = ctx.createLinearGradient(0, H * 0.6, 0, H);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 72) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  let curY = 130;

  // ── Logo ────────────────────────────────────────────────────────────────────
  const ls = 80;
  ctx.font = `900 62px ${FONT}`;
  const wordW = ctx.measureText('REPPY').width;
  const lx = CX - (ls + 22 + wordW + 22) / 2;

  setShadow(ctx, 18);
  roundRect(ctx, lx, curY - ls / 2, ls, ls, 20);
  ctx.fillStyle = PRIMARY; ctx.fill();
  setShadow(ctx, 0);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 46px ${FONT}`;
  ctx.fillText('R', lx + ls / 2, curY + 2);
  ctx.textAlign = 'left';
  ctx.font = `900 62px ${FONT}`;
  setShadow(ctx, 12);
  ctx.fillStyle = '#fff';
  ctx.fillText('REPPY', lx + ls + 22, curY);
  ctx.fillStyle = PRIMARY;
  ctx.fillText('.', lx + ls + 22 + wordW, curY);
  setShadow(ctx, 0);
  curY += 100;

  // ── Event pill ───────────────────────────────────────────────────────────────
  const pillTxt = locale === 'es' ? '☠️  BOSS DERROTADO' : '☠️  BOSS DEFEATED';
  ctx.font = `800 30px ${FONT}`;
  const pillW = Math.min(ctx.measureText(pillTxt).width + 72, W - 80);
  const pillH = 62;
  roundRect(ctx, CX - pillW / 2, curY, pillW, pillH, pillH / 2);
  ctx.fillStyle = 'rgba(220,20,20,0.20)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(220,20,20,0.55)'; ctx.stroke();
  ctx.fillStyle = '#fca5a5';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(pillTxt, CX, curY + pillH / 2 + 1);
  curY += pillH + 70;

  // ── Boss name ────────────────────────────────────────────────────────────────
  ctx.font = `700 32px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(locale === 'es' ? 'HA CAÍDO' : 'HAS FALLEN', CX, curY);
  curY += 55;

  const bossName = data.boss_name || 'Boss';
  ctx.font = `900 100px ${FONT}`;
  setShadow(ctx, 40, 'rgba(220,20,20,0.7)');
  ctx.fillStyle = '#fff';
  // Fit name
  let fontSize = 100;
  while (fontSize > 40 && ctx.measureText(bossName).width > W - 100) {
    fontSize -= 6;
    ctx.font = `900 ${fontSize}px ${FONT}`;
  }
  ctx.fillText(bossName, CX, curY + fontSize / 2);
  setShadow(ctx, 0);
  curY += fontSize + 70;

  // ── Last hit banner ───────────────────────────────────────────────────────────
  const killerName = data.killer_name || '?';
  const lhLabel = locale === 'es' ? 'ÚLTIMO GOLPE' : 'LAST HIT';
  const lhTxt = `⚔️  ${killerName.toUpperCase()}  👑`;

  ctx.font = `800 28px ${FONT}`;
  const lhW = Math.min(ctx.measureText(lhTxt).width + 80, W - 80);
  const lhH = 110;
  roundRect(ctx, CX - lhW / 2, curY, lhW, lhH, 28);
  const lhGrad = ctx.createLinearGradient(CX - lhW / 2, curY, CX + lhW / 2, curY);
  lhGrad.addColorStop(0, 'rgba(245,158,11,0.22)');
  lhGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lhGrad; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(245,158,11,0.50)'; ctx.stroke();

  ctx.font = `700 24px ${FONT}`;
  ctx.fillStyle = 'rgba(245,158,11,0.65)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(lhLabel, CX, curY + 32);

  ctx.font = `900 38px ${FONT}`;
  setShadow(ctx, 16, 'rgba(245,158,11,0.4)');
  ctx.fillStyle = AMBER;
  // Truncate killer name
  let kn = lhTxt;
  while (ctx.measureText(kn).width > lhW - 40) kn = kn.slice(0, -1);
  ctx.fillText(kn, CX, curY + 80);
  setShadow(ctx, 0);
  curY += lhH + 60;

  // ── Separator ────────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(CX - 180, curY); ctx.lineTo(CX + 180, curY);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5; ctx.stroke();
  curY += 55;

  // ── Top 3 ────────────────────────────────────────────────────────────────────
  if (top3.length) {
    const topLabel = locale === 'es' ? 'TOP DAÑO INFLIGIDO' : 'TOP DAMAGE DEALERS';
    ctx.font = `700 26px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(topLabel, CX, curY + 14);
    curY += 55;

    const rowH = 120;
    const rowW = W - 80;
    const rowX = CX - rowW / 2;
    const rankMedals = ['🥇', '🥈', '🥉'];
    const rankColors = [AMBER, '#9ca3af', '#cd7f32'];

    top3.forEach((p, i) => {
      const ry = curY + i * (rowH + 20);
      const rg = ctx.createLinearGradient(rowX, ry, rowX + rowW, ry);
      rg.addColorStop(0, i === 0 ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.05)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      roundRect(ctx, rowX, ry, rowW, rowH, 24);
      ctx.fillStyle = rg; ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = i === 0 ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.08)';
      ctx.stroke();

      // Medal
      ctx.font = `56px ${FONT}`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(rankMedals[i], rowX + 24, ry + rowH / 2);

      // Name
      ctx.font = `800 34px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.90)';
      let pname = (p.name || '').toUpperCase();
      while (pname.length > 1 && ctx.measureText(pname).width > rowW - 320) pname = pname.slice(0, -1);
      if (pname !== (p.name || '').toUpperCase()) pname += '…';
      ctx.fillText(pname, rowX + 100, ry + rowH / 2);

      // Damage
      ctx.font = `900 40px ${FONT}`;
      setShadow(ctx, 10, i === 0 ? 'rgba(245,158,11,0.4)' : 'rgba(0,0,0,0.5)');
      ctx.fillStyle = rankColors[i];
      ctx.textAlign = 'right';
      ctx.fillText(Number(p.damage_dealt).toLocaleString(), rowX + rowW - 24, ry + rowH / 2 - 8);
      setShadow(ctx, 0);
      ctx.font = `600 20px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.30)';
      ctx.fillText('DMG', rowX + rowW - 24, ry + rowH / 2 + 24);
    });

    curY += top3.length * (rowH + 20) + 30;
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  ctx.font = `700 26px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.30)';
  ctx.textAlign = 'center';
  const footerTagline = locale === 'es' ? 'ENTRENA · SUBE DE NIVEL' : 'TRAIN · LEVEL UP';
  ctx.fillText(`reppy-weld.vercel.app  ·  ${footerTagline}`, CX, H - 110);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/png', 0.95);
  });
}

export function useBossKillShare() {
  const notificationStore = useNotificationStore();
  const i18n = useI18nStore();

  async function share(data, top3) {
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const bossImg = await loadImage(data.boss_image);
      const canvas = await renderCard(data, top3 || [], i18n.locale, bossImg);
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'reppy-boss-kill.png', { type: 'image/png' });
      const caption = i18n.locale === 'es'
        ? `☠️ ¡${data.boss_name} ha caído en Reppy! ⚔️ Último golpe: ${data.killer_name}`
        : `☠️ ${data.boss_name} has fallen in Reppy! ⚔️ Last hit: ${data.killer_name}`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Reppy', text: caption });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'reppy-boss-kill.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
        notificationStore.notify(
          i18n.locale === 'es' ? 'Imagen descargada' : 'Image downloaded',
          'success'
        );
      }
    } catch (e) {
      if (e?.name === 'AbortError') return;
      throw e;
    }
  }

  return { share };
}
