import { ref } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '@/stores/notification';
import { useI18nStore } from '@/stores/i18n';

const PRIMARY = 'hsl(215 92% 56%)';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const FONT = "'Inter Tight', Inter, system-ui, sans-serif";

const W = 1080;
const H = 1920;
const CX = W / 2;

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

function fmtNumber(n) {
  return Number(n || 0).toLocaleString();
}

function exerciseLabel(slug, locale) {
  const map = {
    pullups: locale === 'es' ? 'Dominadas' : 'Pull-ups',
    pushups: locale === 'es' ? 'Flexiones' : 'Push-ups',
    squats:  locale === 'es' ? 'Sentadillas' : 'Squats',
    dips:    locale === 'es' ? 'Fondos' : 'Dips',
    situps:  locale === 'es' ? 'Abdominales' : 'Sit-ups',
  };
  return map[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '—');
}

function formatWeekRange(start, end) {
  const opts = { day: 'numeric', month: 'short' };
  const s = new Date(start + 'T12:00:00').toLocaleDateString(undefined, opts);
  const e = new Date(end + 'T12:00:00').toLocaleDateString(undefined, opts);
  return `${s} – ${e}`;
}

function renderCard(data, locale) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#080b12';
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow behind main stat
  const glow = ctx.createRadialGradient(CX, H * 0.42, 60, CX, H * 0.42, 500);
  glow.addColorStop(0, 'rgba(37,99,235,0.18)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Bottom gradient fade
  const fade = ctx.createLinearGradient(0, H * 0.65, 0, H);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H);

  // Faint grid lines for techy feel
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 80) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // ── Logo ────────────────────────────────────────────────────────────────────
  const logoY = 175;
  const ls = 74;
  ctx.font = `900 56px ${FONT}`;
  const wordW = ctx.measureText('REPPY').width;
  const totalLogoW = ls + 22 + wordW + 26;
  let lx = CX - totalLogoW / 2;

  setShadow(ctx, 18);
  roundRect(ctx, lx, logoY - ls / 2, ls, ls, 20);
  ctx.fillStyle = PRIMARY; ctx.fill();
  setShadow(ctx, 0);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 44px ${FONT}`;
  ctx.fillText('R', lx + ls / 2, logoY + 2);
  ctx.textAlign = 'left';
  ctx.font = `900 56px ${FONT}`;
  setShadow(ctx, 12);
  ctx.fillStyle = '#fff';
  ctx.fillText('REPPY', lx + ls + 22, logoY);
  ctx.fillStyle = PRIMARY;
  ctx.fillText('.', lx + ls + 22 + wordW, logoY);
  setShadow(ctx, 0);

  // ── Week pill ────────────────────────────────────────────────────────────────
  const pillY = 285;
  const weekLabel = locale === 'es' ? 'MI SEMANA' : 'MY WEEK';
  ctx.font = `800 26px ${FONT}`;
  const pillTxt = `${weekLabel}  ·  ${formatWeekRange(data.weekStart, data.weekEnd)}`;
  const pillTxtW = ctx.measureText(pillTxt).width;
  const pillW = pillTxtW + 64, pillH = 52;
  roundRect(ctx, CX - pillW / 2, pillY - pillH / 2, pillW, pillH, pillH / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(pillTxt, CX, pillY + 2);

  // ── Main stat: total reps ────────────────────────────────────────────────────
  const mainY = 620;
  const mainLabel = locale === 'es' ? 'REPETICIONES TOTALES' : 'TOTAL REPS';
  ctx.font = `800 32px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(mainLabel, CX, mainY - 70);

  ctx.font = `900 240px ${FONT}`;
  setShadow(ctx, 40, 'rgba(37,99,235,0.6)');
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(fmtNumber(data.totalReps), CX, mainY + 60);
  setShadow(ctx, 0);

  // Thin separator
  const sepY = mainY + 200;
  ctx.beginPath();
  ctx.moveTo(CX - 180, sepY); ctx.lineTo(CX + 180, sepY);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── Stat cards row ───────────────────────────────────────────────────────────
  const cardY = sepY + 80;
  const cardH = 200;
  const cardW = 290;
  const gap = 40;
  const totalCardsW = cardW * 3 + gap * 2;
  const cardStartX = CX - totalCardsW / 2;

  const cards = [
    {
      icon: '⚔️',
      value: fmtNumber(data.bossDamage),
      label: locale === 'es' ? 'Daño al jefe' : 'Boss damage',
      color: '#ef4444',
      glow: 'rgba(239,68,68,0.2)',
    },
    {
      icon: '🔥',
      value: `${data.streak}`,
      label: locale === 'es' ? 'Días de racha' : 'Day streak',
      color: AMBER,
      glow: 'rgba(245,158,11,0.2)',
    },
    {
      icon: '⭐',
      value: `Nv. ${data.level}`,
      label: locale === 'es' ? 'Nivel' : 'Level',
      color: EMERALD,
      glow: 'rgba(16,185,129,0.2)',
    },
  ];

  cards.forEach((card, i) => {
    const cx = cardStartX + i * (cardW + gap);

    // Card background
    const cardGrad = ctx.createLinearGradient(cx, cardY, cx, cardY + cardH);
    cardGrad.addColorStop(0, 'rgba(255,255,255,0.07)');
    cardGrad.addColorStop(1, 'rgba(255,255,255,0.03)');
    roundRect(ctx, cx, cardY, cardW, cardH, 28);
    ctx.fillStyle = cardGrad; ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.stroke();

    // Colored top bar
    roundRect(ctx, cx + 20, cardY + 16, cardW - 40, 5, 3);
    ctx.fillStyle = card.color; ctx.fill();

    // Icon
    ctx.font = `52px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(card.icon, cx + cardW / 2, cardY + 70);

    // Value
    ctx.font = `900 52px ${FONT}`;
    setShadow(ctx, 10, card.glow);
    ctx.fillStyle = card.color;
    ctx.fillText(card.value, cx + cardW / 2, cardY + 130);
    setShadow(ctx, 0);

    // Label
    ctx.font = `700 22px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.50)';
    ctx.fillText(card.label.toUpperCase(), cx + cardW / 2, cardY + 174);
  });

  // ── Gear row ──────────────────────────────────────────────────────────────────
  const RARITY_COLORS = {
    common: '#9ca3af', rare: '#60a5fa', especial: '#a78bfa',
    legendary: '#f59e0b', calistenico: '#34d399', cosmico: '#f472b6',
  };
  const gearItems = [
    data.gear?.weapon ? { icon: '🗡️', label: locale === 'es' ? 'ARMA' : 'WEAPON', ...data.gear.weapon } : null,
    data.gear?.armor  ? { icon: '🛡️', label: locale === 'es' ? 'ARMADURA' : 'ARMOR',  ...data.gear.armor  } : null,
  ].filter(Boolean);

  if (gearItems.length) {
    const gearY = cardY + cardH + 60;
    const gearH = 130;
    const gearW = gearItems.length === 2 ? (W - 120) / 2 : W - 80;
    const gearGap = 40;
    const gearTotalW = gearItems.length === 2 ? gearW * 2 + gearGap : gearW;
    const gearStartX = CX - gearTotalW / 2;

    gearItems.forEach((g, i) => {
      const gx = gearStartX + i * (gearW + gearGap);
      const color = RARITY_COLORS[g.rarity] || '#9ca3af';

      const gGrad = ctx.createLinearGradient(gx, gearY, gx, gearY + gearH);
      gGrad.addColorStop(0, 'rgba(255,255,255,0.06)');
      gGrad.addColorStop(1, 'rgba(255,255,255,0.02)');
      roundRect(ctx, gx, gearY, gearW, gearH, 24);
      ctx.fillStyle = gGrad; ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color + '55'; ctx.stroke();

      // Colored left accent bar
      roundRect(ctx, gx, gearY + 16, 5, gearH - 32, 3);
      ctx.fillStyle = color; ctx.fill();

      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      // Icon
      ctx.font = `38px ${FONT}`;
      ctx.fillText(g.icon, gx + 24, gearY + gearH / 2 - 14);
      // Slot label
      ctx.font = `700 20px ${FONT}`;
      ctx.fillStyle = color;
      ctx.fillText(g.label, gx + 72, gearY + gearH / 2 - 18);
      // Name
      ctx.font = `800 24px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const maxNameW = gearW - 84;
      let name = g.name || '';
      while (name.length > 1 && ctx.measureText(name).width > maxNameW) name = name.slice(0, -1);
      if (name !== g.name) name += '…';
      ctx.fillText(name, gx + 72, gearY + gearH / 2 + 16);
    });

    // ── Star exercise banner ───────────────────────────────────────────────────
    if (data.starExercise) {
      const starY = gearY + gearH + 50;
      const starTxt = locale === 'es'
        ? `🏅 EJERCICIO ESTRELLA · ${exerciseLabel(data.starExercise, locale).toUpperCase()} · ${fmtNumber(data.starCount)} REPS`
        : `🏅 STAR EXERCISE · ${exerciseLabel(data.starExercise, locale).toUpperCase()} · ${fmtNumber(data.starCount)} REPS`;

      ctx.font = `800 26px ${FONT}`;
      const starTxtW = ctx.measureText(starTxt).width;
      const starBannerW = Math.min(starTxtW + 72, W - 80);
      const starBannerH = 64;
      roundRect(ctx, CX - starBannerW / 2, starY, starBannerW, starBannerH, starBannerH / 2);
      ctx.fillStyle = 'rgba(245,158,11,0.12)'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(245,158,11,0.35)'; ctx.stroke();
      ctx.fillStyle = AMBER;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(starTxt, CX, starY + starBannerH / 2 + 2);
    }

    // ── Active buff pill ───────────────────────────────────────────────────────
    if (data.activeBuff) {
      const buffY = (data.starExercise ? cardY + cardH + 60 + gearH + 50 + 64 : cardY + cardH + 60 + gearH) + 50;
      const buffTxt = locale === 'es'
        ? `⚗️ BUFF ACTIVO · ×${data.activeBuff.multiplier} DAÑO`
        : `⚗️ ACTIVE BUFF · ×${data.activeBuff.multiplier} DAMAGE`;
      ctx.font = `800 26px ${FONT}`;
      const buffW = Math.min(ctx.measureText(buffTxt).width + 72, W - 80);
      const buffH = 64;
      roundRect(ctx, CX - buffW / 2, buffY, buffW, buffH, buffH / 2);
      ctx.fillStyle = 'rgba(139,92,246,0.15)'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(139,92,246,0.40)'; ctx.stroke();
      ctx.fillStyle = '#a78bfa';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(buffTxt, CX, buffY + buffH / 2 + 2);
    }
  } else {
    // No gear — fall back to original star exercise position
    if (data.starExercise) {
      const starY = cardY + cardH + 70;
      const starTxt = locale === 'es'
        ? `🏅 EJERCICIO ESTRELLA · ${exerciseLabel(data.starExercise, locale).toUpperCase()} · ${fmtNumber(data.starCount)} REPS`
        : `🏅 STAR EXERCISE · ${exerciseLabel(data.starExercise, locale).toUpperCase()} · ${fmtNumber(data.starCount)} REPS`;

      ctx.font = `800 28px ${FONT}`;
      const starTxtW = ctx.measureText(starTxt).width;
      const starBannerW = Math.min(starTxtW + 72, W - 80);
      const starBannerH = 68;
      roundRect(ctx, CX - starBannerW / 2, starY, starBannerW, starBannerH, starBannerH / 2);
      ctx.fillStyle = 'rgba(245,158,11,0.12)'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(245,158,11,0.35)'; ctx.stroke();
      ctx.fillStyle = AMBER;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(starTxt, CX, starY + starBannerH / 2 + 2);
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  ctx.font = `700 28px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.40)';
  ctx.textAlign = 'center';
  ctx.fillText('reppy.app  ·  ENTRENA · SUBE DE NIVEL', CX, H - 100);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/png', 0.95);
  });
}

export function useWeeklyShare() {
  const notificationStore = useNotificationStore();
  const i18n = useI18nStore();
  const generating = ref(false);
  const weeklyData = ref(null);
  const loading = ref(false);

  async function fetchWeeklyData() {
    loading.value = true;
    try {
      const res = await axios.get('/api/reps/weekly-summary');
      weeklyData.value = res.data;
    } catch {
      notificationStore.notify(
        i18n.locale === 'es' ? 'No se pudo cargar el resumen semanal' : 'Could not load weekly summary',
        'error'
      );
    } finally {
      loading.value = false;
    }
  }

  async function share() {
    if (generating.value || !weeklyData.value) return;
    generating.value = true;
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = renderCard(weeklyData.value, i18n.locale);
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'reppy-mi-semana.png', { type: 'image/png' });
      const gearPart = weeklyData.value.gear?.weapon?.name
        ? (i18n.locale === 'es' ? ` · 🗡️ ${weeklyData.value.gear.weapon.name}` : ` · 🗡️ ${weeklyData.value.gear.weapon.name}`)
        : '';
      const caption = i18n.locale === 'es'
        ? `💪 Mi semana en Reppy: ${fmtNumber(weeklyData.value.totalReps)} reps · Racha ${weeklyData.value.streak} días · Nv. ${weeklyData.value.level}${gearPart} 🔥`
        : `💪 My week on Reppy: ${fmtNumber(weeklyData.value.totalReps)} reps · ${weeklyData.value.streak}-day streak · Lv. ${weeklyData.value.level}${gearPart} 🔥`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Reppy', text: caption });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'reppy-mi-semana.png';
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
      notificationStore.notify(
        i18n.locale === 'es' ? 'No se pudo generar la imagen' : 'Could not generate image',
        'error'
      );
    } finally {
      generating.value = false;
    }
  }

  return { fetchWeeklyData, share, generating, loading, weeklyData };
}
