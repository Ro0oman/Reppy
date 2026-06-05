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

const RARITY_COLORS = {
  common: '#9ca3af', rare: '#60a5fa', especial: '#a78bfa',
  legendary: '#f59e0b', calistenico: '#34d399', cosmico: '#f472b6',
};
const RARITY_LABELS_ES = {
  common: 'Común', rare: 'Rara', especial: 'Especial',
  legendary: 'Legendaria', calistenico: 'Calisténica', cosmico: 'Cósmica',
};
const RARITY_LABELS_EN = {
  common: 'Common', rare: 'Rare', especial: 'Special',
  legendary: 'Legendary', calistenico: 'Calisthenic', cosmico: 'Cosmic',
};

function pill(ctx, txt, cx, y, bg, border, textColor, fontSize = 26, hPad = 64, pillH = 52) {
  ctx.font = `800 ${fontSize}px ${FONT}`;
  const tW = ctx.measureText(txt).width;
  const pW = Math.min(tW + hPad, W - 80);
  roundRect(ctx, cx - pW / 2, y, pW, pillH, pillH / 2);
  ctx.fillStyle = bg; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = border; ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(txt, cx, y + pillH / 2 + 1);
  return pillH;
}

function renderCard(data, locale) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#080b12';
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(CX, H * 0.38, 60, CX, H * 0.38, 480);
  glow.addColorStop(0, 'rgba(37,99,235,0.20)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const fade = ctx.createLinearGradient(0, H * 0.7, 0, H);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.8)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 72) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // ── Logo ────────────────────────────────────────────────────────────────────
  let curY = 130;
  const ls = 64;
  ctx.font = `900 50px ${FONT}`;
  const wordW = ctx.measureText('REPPY').width;
  const totalLogoW = ls + 18 + wordW + 20;
  let lx = CX - totalLogoW / 2;

  setShadow(ctx, 16);
  roundRect(ctx, lx, curY - ls / 2, ls, ls, 18);
  ctx.fillStyle = PRIMARY; ctx.fill();
  setShadow(ctx, 0);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 38px ${FONT}`;
  ctx.fillText('R', lx + ls / 2, curY + 2);
  ctx.textAlign = 'left';
  ctx.font = `900 50px ${FONT}`;
  setShadow(ctx, 10);
  ctx.fillStyle = '#fff';
  ctx.fillText('REPPY', lx + ls + 18, curY);
  ctx.fillStyle = PRIMARY;
  ctx.fillText('.', lx + ls + 18 + wordW, curY);
  setShadow(ctx, 0);
  curY += 60;

  // ── Week pill ───────────────────────────────────────────────────────────────
  const weekLabel = locale === 'es' ? 'MI SEMANA' : 'MY WEEK';
  const pillTxt = `${weekLabel}  ·  ${formatWeekRange(data.weekStart, data.weekEnd)}`;
  pill(ctx, pillTxt, CX, curY, 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0.80)', 24, 56, 48);
  curY += 68;

  // ── Global ranking badge ─────────────────────────────────────────────────────
  if (data.ranking?.globalRank) {
    const r = data.ranking.globalRank;
    const rankColor = r === 1 ? AMBER : r <= 3 ? '#fbbf24' : r <= 10 ? PRIMARY : 'rgba(255,255,255,0.75)';
    const rankEmoji = r === 1 ? '👑' : r <= 3 ? '🏆' : r <= 10 ? '🥇' : '⚔️';
    const rankLabel = r === 1
      ? (locale === 'es' ? '¡Nº 1 DEL MUNDO!' : 'N° 1 IN THE WORLD!')
      : r <= 3  ? (locale === 'es' ? 'TOP 3 MUNDIAL'  : 'TOP 3 WORLDWIDE')
      : r <= 10 ? (locale === 'es' ? 'TOP 10 MUNDIAL' : 'TOP 10 WORLDWIDE')
      : r <= 50 ? (locale === 'es' ? 'TOP 50 MUNDIAL' : 'TOP 50 WORLDWIDE')
      : (locale === 'es' ? `RANKING GLOBAL #${r}` : `GLOBAL RANK #${r}`);

    const subLabel = data.ranking.totalPlayers
      ? (locale === 'es'
          ? `#${r} de ${data.ranking.totalPlayers.toLocaleString()} atletas`
          : `#${r} of ${data.ranking.totalPlayers.toLocaleString()} athletes`)
      : `#${r}`;

    const mainTxt = `${rankEmoji}  ${rankLabel}`;
    ctx.font = `800 30px ${FONT}`;
    const badgeW = Math.min(ctx.measureText(mainTxt).width + 80, W - 80);
    const badgeH = 96;
    const badgeX = CX - badgeW / 2;

    roundRect(ctx, badgeX, curY, badgeW, badgeH, 28);
    const rg = ctx.createLinearGradient(badgeX, curY, badgeX + badgeW, curY);
    rg.addColorStop(0, r <= 3 ? 'rgba(245,158,11,0.20)' : 'rgba(37,99,235,0.17)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg; ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = r <= 3 ? 'rgba(245,158,11,0.55)' : 'rgba(37,99,235,0.45)';
    ctx.stroke();

    setShadow(ctx, 18, r <= 3 ? 'rgba(245,158,11,0.45)' : 'rgba(37,99,235,0.45)');
    ctx.fillStyle = rankColor;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(mainTxt, CX, curY + 34);
    setShadow(ctx, 0);

    ctx.font = `600 22px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.fillText(subLabel, CX, curY + 72);
    curY += badgeH + 40;
  }

  // ── Main stat: total reps ────────────────────────────────────────────────────
  const mainLabel = locale === 'es' ? 'REPETICIONES TOTALES' : 'TOTAL REPS';
  ctx.font = `800 28px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.40)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(mainLabel, CX, curY + 20);

  ctx.font = `900 190px ${FONT}`;
  setShadow(ctx, 38, 'rgba(37,99,235,0.65)');
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(fmtNumber(data.totalReps), CX, curY + 145);
  setShadow(ctx, 0);
  curY += 265;

  // Separator
  ctx.beginPath();
  ctx.moveTo(CX - 160, curY); ctx.lineTo(CX + 160, curY);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  curY += 44;

  // ── Stat cards row ───────────────────────────────────────────────────────────
  const cardH = 175;
  const cardW = 295;
  const gap = 35;
  const totalCardsW = cardW * 3 + gap * 2;
  const cardStartX = CX - totalCardsW / 2;

  const cards = [
    { icon: '⚔️', value: fmtNumber(data.bossDamage), label: locale === 'es' ? 'Daño jefe' : 'Boss dmg', color: '#ef4444', glow: 'rgba(239,68,68,0.2)' },
    { icon: '🔥', value: `${data.streak}`,            label: locale === 'es' ? 'Racha días' : 'Day streak', color: AMBER,    glow: 'rgba(245,158,11,0.2)' },
    { icon: '⭐', value: `Nv. ${data.level}`,         label: locale === 'es' ? 'Nivel'      : 'Level',      color: EMERALD,  glow: 'rgba(16,185,129,0.2)' },
  ];

  cards.forEach((card, i) => {
    const cx = cardStartX + i * (cardW + gap);
    const cg = ctx.createLinearGradient(cx, curY, cx, curY + cardH);
    cg.addColorStop(0, 'rgba(255,255,255,0.07)');
    cg.addColorStop(1, 'rgba(255,255,255,0.02)');
    roundRect(ctx, cx, curY, cardW, cardH, 26);
    ctx.fillStyle = cg; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.stroke();

    roundRect(ctx, cx + 18, curY + 14, cardW - 36, 4, 2);
    ctx.fillStyle = card.color; ctx.fill();

    ctx.font = `46px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(card.icon, cx + cardW / 2, curY + 60);

    ctx.font = `900 46px ${FONT}`;
    setShadow(ctx, 10, card.glow);
    ctx.fillStyle = card.color;
    ctx.fillText(card.value, cx + cardW / 2, curY + 112);
    setShadow(ctx, 0);

    ctx.font = `700 19px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(card.label.toUpperCase(), cx + cardW / 2, curY + 152);
  });
  curY += cardH + 40;

  // ── Gear row ──────────────────────────────────────────────────────────────────
  const gearItems = [
    data.gear?.weapon ? { icon: '🗡️', slot: locale === 'es' ? 'ARMA' : 'WEAPON', ...data.gear.weapon } : null,
    data.gear?.armor  ? { icon: '🛡️', slot: locale === 'es' ? 'ARMADURA' : 'ARMOR',  ...data.gear.armor  } : null,
  ].filter(Boolean);

  if (gearItems.length) {
    const gearH = 148;
    const gearW = gearItems.length === 2 ? (W - 120) / 2 : W - 80;
    const gearGap = 40;
    const gearStartX = CX - (gearItems.length === 2 ? gearW * 2 + gearGap : gearW) / 2;

    gearItems.forEach((g, i) => {
      const gx = gearStartX + i * (gearW + gearGap);
      const color = RARITY_COLORS[g.rarity] || '#9ca3af';
      const rarityLabel = locale === 'es'
        ? (RARITY_LABELS_ES[g.rarity] || g.rarity || '')
        : (RARITY_LABELS_EN[g.rarity] || g.rarity || '');

      const gg = ctx.createLinearGradient(gx, curY, gx + gearW, curY);
      gg.addColorStop(0, color + '14');
      gg.addColorStop(1, 'rgba(255,255,255,0.02)');
      roundRect(ctx, gx, curY, gearW, gearH, 22);
      ctx.fillStyle = gg; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = color + '55'; ctx.stroke();

      // Left accent bar
      roundRect(ctx, gx, curY + 14, 5, gearH - 28, 3);
      ctx.fillStyle = color; ctx.fill();

      const iconX = gx + 28, textX = gx + 76;
      // Icon
      ctx.font = `44px ${FONT}`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(g.icon, iconX, curY + gearH / 2 - 10);

      // Slot label
      ctx.font = `700 18px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.fillText(g.slot, textX, curY + 30);

      // Name (truncated)
      ctx.font = `800 26px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.90)';
      const maxNW = gearW - textX + gx - 20;
      let name = g.name || '';
      while (name.length > 1 && ctx.measureText(name).width > maxNW) name = name.slice(0, -1);
      if (name !== g.name) name += '…';
      ctx.fillText(name, textX, curY + 70);

      // Rarity label (colored)
      ctx.font = `700 20px ${FONT}`;
      ctx.fillStyle = color;
      ctx.fillText(rarityLabel.toUpperCase(), textX, curY + 108);
    });
    curY += gearH + 36;
  }

  // ── Star exercise ────────────────────────────────────────────────────────────
  if (data.starExercise) {
    const starTxt = locale === 'es'
      ? `🏅  ${exerciseLabel(data.starExercise, locale).toUpperCase()}  ·  ${fmtNumber(data.starCount)} REPS`
      : `🏅  ${exerciseLabel(data.starExercise, locale).toUpperCase()}  ·  ${fmtNumber(data.starCount)} REPS`;
    pill(ctx, starTxt, CX, curY, 'rgba(245,158,11,0.11)', 'rgba(245,158,11,0.32)', AMBER, 26, 72, 62);
    curY += 80;
  }

  // ── Active buff ──────────────────────────────────────────────────────────────
  if (data.activeBuff) {
    const buffTxt = locale === 'es'
      ? `⚗️  BUFF ACTIVO  ·  ×${data.activeBuff.multiplier} DAÑO`
      : `⚗️  ACTIVE BUFF  ·  ×${data.activeBuff.multiplier} DAMAGE`;
    pill(ctx, buffTxt, CX, curY, 'rgba(139,92,246,0.13)', 'rgba(139,92,246,0.38)', '#a78bfa', 26, 72, 62);
    curY += 80;
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  // Position footer at a fixed distance from bottom so it always looks anchored
  const footerY = H - 110;
  ctx.font = `700 24px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.textAlign = 'center';
  ctx.fillText('reppy-weld.vercel.app  ·  ENTRENA · SUBE DE NIVEL', CX, footerY);

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
      const gearPart = weeklyData.value.gear?.weapon?.name ? ` · 🗡️ ${weeklyData.value.gear.weapon.name}` : '';
      const rank = weeklyData.value.ranking?.globalRank;
      const rankPart = rank
        ? (rank === 1
            ? (i18n.locale === 'es' ? ' · 👑 Nº 1 del mundo' : ' · 👑 #1 in the world')
            : rank <= 10
              ? (i18n.locale === 'es' ? ` · 🏆 Top ${rank} mundial` : ` · 🏆 Top ${rank} worldwide`)
              : ` · #${rank}`)
        : '';
      const caption = i18n.locale === 'es'
        ? `💪 Mi semana en Reppy: ${fmtNumber(weeklyData.value.totalReps)} reps · Racha ${weeklyData.value.streak} días · Nv. ${weeklyData.value.level}${rankPart}${gearPart} 🔥`
        : `💪 My week on Reppy: ${fmtNumber(weeklyData.value.totalReps)} reps · ${weeklyData.value.streak}-day streak · Lv. ${weeklyData.value.level}${rankPart}${gearPart} 🔥`;

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
