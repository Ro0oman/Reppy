import { ref } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import { useI18nStore } from '@/stores/i18n';
import { parseGIF, decompressFrames } from 'gifuct-js';

// Client-side share-image/video generator for finished challenges (Issue #201).
// Pure Canvas API + MediaRecorder — no extra dependencies.
// Animated export: draws GIF frame-by-frame via MediaRecorder → WebM video.
// Falls back to static PNG if MediaRecorder is unavailable.

const PRIMARY = 'hsl(215 92% 56%)'; // Reppy Electric Blue
const AMBER = '#f59e0b';
const FONT = "'Inter Tight', Inter, system-ui, sans-serif";

const FORMATS = {
  story: {
    w: 1080, h: 1920,
    logoY: 175, pillY: 285, midY: 900, resultY: 1340, footerY: 1800,
    avR: 132, nameFont: 46, scoreFont: 150,
  },
  square: {
    w: 1080, h: 1080,
    logoY: 110, pillY: 200, midY: 560, resultY: 850, footerY: 1010,
    avR: 116, nameFont: 42, scoreFont: 128,
  },
};

function loadImage(src, cors = false) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const cr = w / h;
  let dw, dh, dx, dy;
  if (ir > cr) { dh = h; dw = h * ir; dx = x + (w - dw) / 2; dy = y; }
  else { dw = w; dh = w / ir; dx = x; dy = y + (h - dh) / 2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function truncate(ctx, str, maxW) {
  if (ctx.measureText(str).width <= maxW) return str;
  let s = str;
  while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s + '…';
}

function setShadow(ctx, blur = 0) {
  ctx.shadowColor = blur ? 'rgba(0,0,0,0.9)' : 'transparent';
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = blur ? 3 : 0;
}

function drawAvatar(ctx, img, cx, cy, r, ringColor, name, dimmed) {
  ctx.save();
  if (dimmed) ctx.globalAlpha = 0.4;
  if (ringColor === AMBER) {
    ctx.save();
    ctx.shadowColor = 'rgba(245,158,11,0.7)';
    ctx.shadowBlur = 50;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245,158,11,0.25)'; ctx.fill();
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill();
  if (img) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    drawCover(ctx, img, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  } else {
    ctx.font = `900 ${Math.round(r)}px ${FONT}`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((name || '?')[0].toUpperCase(), cx, cy + 2);
  }
  ctx.lineWidth = 9;
  ctx.strokeStyle = ringColor;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// Returns the epic result banner text based on goal type and winner score.
function epicResultText(ctx, c, maxW) {
  if (!c.winner_id) return { txt: '⚔️ EMPATE', color: '#fff' };
  const challengerWon = c.winner_id === c.challenger_id;
  const wn = (challengerWon ? c.challenger_name : c.challenged_name || '').toUpperCase();
  const score = Number(challengerWon ? c.challenger_score : c.challenged_score || 0).toLocaleString('es');
  let raw;
  if (c.goal_type === 'damage') {
    raw = `🏆 ${wn} INFLIGIÓ ${score} DE DAÑO`;
  } else if (c.goal_type === 'reps') {
    raw = `🏆 ${wn} COMPLETÓ ${score} REPS`;
  } else {
    raw = `🏆 ${wn} DOMINA EL RETO`;
  }
  return { txt: truncate(ctx, raw, maxW), color: AMBER };
}

// Draws everything except the background onto ctx (used for both static and animated).
function drawOverlay(ctx, c, L, av1, av2) {
  const W = L.w, H = L.h;
  const cx = W / 2;
  const challengerWon = c.winner_id === c.challenger_id;
  const challengedWon = c.winner_id === c.challenged_id;

  // dark + gradient overlay
  ctx.fillStyle = 'rgba(0,0,0,0.74)';
  ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0.10)');
  grad.addColorStop(1, 'rgba(0,0,0,0.88)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // logo
  const ls = 74;
  ctx.font = `900 56px ${FONT}`;
  const wordW = ctx.measureText('REPPY').width;
  const dotW = 26;
  const totalW = ls + 22 + wordW + dotW;
  let lx = cx - totalW / 2;
  const ly = L.logoY;
  setShadow(ctx, 18);
  roundRect(ctx, lx, ly - ls / 2, ls, ls, 20);
  ctx.fillStyle = PRIMARY; ctx.fill();
  setShadow(ctx, 0);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 44px ${FONT}`;
  ctx.fillText('R', lx + ls / 2, ly + 2);
  ctx.textAlign = 'left';
  ctx.font = `900 56px ${FONT}`;
  setShadow(ctx, 12);
  ctx.fillText('REPPY', lx + ls + 22, ly);
  ctx.fillStyle = PRIMARY;
  ctx.fillText('.', lx + ls + 22 + wordW, ly);
  setShadow(ctx, 0);

  // title pill
  ctx.font = `900 30px ${FONT}`;
  const titleTxt = (c.status === 'finished' ? 'RETO FINALIZADO' : 'RETO').toUpperCase();
  const tW = ctx.measureText(titleTxt).width;
  const pillW = tW + 64, pillH = 56;
  roundRect(ctx, cx - pillW / 2, L.pillY - pillH / 2, pillW, pillH, pillH / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(titleTxt, cx, L.pillY + 2);

  // VS block
  const colX1 = W * 0.27;
  const colX2 = W * 0.73;
  const midY = L.midY;
  const avR = L.avR;
  const avCy = midY - avR - 30;
  const maxNameW = W * 0.38;

  const players = [
    { x: colX1, img: av1, name: c.challenger_name, score: c.challenger_score, won: challengerWon, color: PRIMARY },
    { x: colX2, img: av2, name: c.challenged_name, score: c.challenged_score, won: challengedWon, color: AMBER },
  ];

  players.forEach((p) => {
    const dimmed = !!c.winner_id && !p.won;
    drawAvatar(ctx, p.img, p.x, avCy, avR, p.won ? AMBER : 'rgba(255,255,255,0.25)', p.name, dimmed);
    ctx.save();
    if (dimmed) ctx.globalAlpha = 0.45;
    ctx.font = `900 ${L.nameFont}px ${FONT}`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    setShadow(ctx, 10);
    ctx.fillText(truncate(ctx, (p.name || '').toUpperCase(), maxNameW), p.x, avCy + avR + 50);
    ctx.font = `900 ${L.scoreFont}px ${FONT}`;
    ctx.fillStyle = p.won ? p.color : '#fff';
    setShadow(ctx, 16);
    ctx.fillText(Number(p.score || 0).toLocaleString(), p.x, midY + L.scoreFont / 2 + 10);
    setShadow(ctx, 0);
    ctx.restore();
  });

  // center VS + goal
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 60px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.30)';
  ctx.fillText('VS', cx, avCy);
  const goalLabels = { reps: 'REPS', damage: 'DAÑO' };
  ctx.font = `800 24px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText((goalLabels[c.goal_type] || c.goal_type || '').toUpperCase(), cx, avCy + 50);
  ctx.font = `800 22px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('META ' + Number(c.goal_value || 0).toLocaleString(), cx, avCy + 84);

  // result banner (epic text)
  ctx.font = `900 44px ${FONT}`;
  const { txt: resultTxt, color: resultColor } = epicResultText(ctx, c, W * 0.82);
  const rW = ctx.measureText(resultTxt).width + 80;
  const rH = 86;
  roundRect(ctx, cx - rW / 2, L.resultY - rH / 2, rW, rH, 22);
  ctx.fillStyle = c.winner_id ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = c.winner_id ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.2)';
  ctx.stroke();
  ctx.fillStyle = resultColor;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(resultTxt, cx, L.resultY + 2);

  // footer
  ctx.font = `800 26px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.textAlign = 'center';
  ctx.fillText('ENTRENA · COMPITE · SUBE DE NIVEL', cx, L.footerY);
}

// Static PNG render (fallback when MediaRecorder is unavailable).
function renderStaticCard({ c, format, bgImg, av1, av2 }) {
  const L = FORMATS[format];
  const canvas = document.createElement('canvas');
  canvas.width = L.w; canvas.height = L.h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, L.w, L.h);
  if (bgImg) drawCover(ctx, bgImg, 0, 0, L.w, L.h);
  drawOverlay(ctx, c, L, av1, av2);
  return canvas;
}

// Fetch and decode all GIF frames using gifuct-js.
async function decodeGifFrames(url) {
  const resp = await fetch(url);
  const buf = await resp.arrayBuffer();
  const gif = parseGIF(buf);
  const frames = decompressFrames(gif, true); // true = patch transparent pixels
  return frames;
}

// Animated WebM render: decodes GIF frames with gifuct-js and draws them
// frame-by-frame at the correct delay onto the canvas, captured by MediaRecorder.
async function renderAnimatedCard({ c, format, bgGifUrl, av1, av2 }) {
  const L = FORMATS[format];
  const W = L.w, H = L.h;

  const frames = await decodeGifFrames(bgGifUrl);
  if (!frames.length) throw new Error('no-gif-frames');

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Pre-render static overlay once.
  const overlay = document.createElement('canvas');
  overlay.width = W; overlay.height = H;
  drawOverlay(overlay.getContext('2d'), c, L, av1, av2);

  // Offscreen canvas for compositing each GIF frame (gifuct gives us raw pixel data).
  const gifCanvas = document.createElement('canvas');
  const gifCtx = gifCanvas.getContext('2d');

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const videoBlob = await new Promise((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType.split(';')[0] }));
    recorder.onerror = reject;

    const LOOPS = 2; // record 2 full GIF loops
    const totalFrames = frames.length * LOOPS;
    let frameIdx = 0;

    recorder.start();

    function drawNextFrame() {
      if (frameIdx >= totalFrames) {
        recorder.stop();
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const f = frames[frameIdx % frames.length];
      frameIdx++;

      // Resize gifCanvas to match this frame's dimensions.
      gifCanvas.width = f.dims.width;
      gifCanvas.height = f.dims.height;
      const imgData = gifCtx.createImageData(f.dims.width, f.dims.height);
      imgData.data.set(f.patch);
      gifCtx.putImageData(imgData, 0, 0);

      // Draw: dark base → GIF frame scaled to card → overlay.
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);
      drawCover(ctx, gifCanvas, 0, 0, W, H);
      ctx.drawImage(overlay, 0, 0);

      // Advance after this frame's delay (gifuct gives delay in ms).
      const delay = Math.max((f.delay ?? 4) * 10, 16); // centiseconds → ms; 4cs default, min 16ms
      setTimeout(drawNextFrame, delay);
    }

    drawNextFrame();
  });

  return videoBlob;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/png', 0.95);
    } catch (e) {
      reject(e);
    }
  });
}

function captionFor(c, i18n) {
  const es = i18n.locale === 'es';
  if (c.winner_id) {
    const challengerWon = c.winner_id === c.challenger_id;
    const wn = challengerWon ? c.challenger_name : c.challenged_name;
    const score = Number(challengerWon ? c.challenger_score : c.challenged_score || 0).toLocaleString('es');
    if (es) {
      if (c.goal_type === 'damage') return `🏆 ${wn} infligió ${score} de daño en Reppy — ${c.challenger_name} ${c.challenger_score} vs ${c.challenged_score} ${c.challenged_name}`;
      if (c.goal_type === 'reps') return `🏆 ${wn} completó ${score} reps en Reppy — ${c.challenger_name} ${c.challenger_score} vs ${c.challenged_score} ${c.challenged_name}`;
      return `🏆 ${wn} domina el reto en Reppy — ${c.challenger_name} ${c.challenger_score} vs ${c.challenged_score} ${c.challenged_name}`;
    }
    if (c.goal_type === 'damage') return `🏆 ${wn} dealt ${score} damage on Reppy — ${c.challenger_name} ${c.challenger_score} vs ${c.challenged_score} ${c.challenged_name}`;
    if (c.goal_type === 'reps') return `🏆 ${wn} completed ${score} reps on Reppy — ${c.challenger_name} ${c.challenger_score} vs ${c.challenged_score} ${c.challenged_name}`;
    return `🏆 ${wn} dominated the challenge on Reppy — ${c.challenger_name} ${c.challenger_score} vs ${c.challenged_score} ${c.challenged_name}`;
  }
  return i18n.locale === 'es'
    ? `⚔️ Empate en Reppy — ${c.challenger_name} ${c.challenger_score} - ${c.challenged_score} ${c.challenged_name}`
    : `⚔️ Draw on Reppy — ${c.challenger_name} ${c.challenger_score} - ${c.challenged_score} ${c.challenged_name}`;
}

const canUseMediaRecorder = typeof MediaRecorder !== 'undefined' && typeof HTMLCanvasElement !== 'undefined';

export function useChallengeShare() {
  const notificationStore = useNotificationStore();
  const i18n = useI18nStore();
  const generating = ref(false);

  async function share(c, format, bgGif) {
    if (generating.value || !c) return;
    generating.value = true;
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const [av1, av2] = await Promise.all([
        loadImage(c.challenger_avatar, true),
        loadImage(c.challenged_avatar, true),
      ]);

      const caption = captionFor(c, i18n);
      const url = (typeof window !== 'undefined' && window.location?.origin) || '';

      let blob;
      let fileName;
      let mimeType;

      // Try animated WebM first when a GIF background is available.
      if (bgGif && canUseMediaRecorder) {
        try {
          const videoBlob = await renderAnimatedCard({ c, format, bgGifUrl: bgGif, av1, av2 });
          blob = videoBlob;
          mimeType = videoBlob.type;
          fileName = 'reppy-reto.webm';
        } catch {
          // fall through to static PNG
        }
      }

      // Static PNG fallback.
      if (!blob) {
        const bgImg = await loadImage(bgGif, false);
        const canvas = renderStaticCard({ c, format, bgImg, av1, av2 });
        blob = await canvasToBlob(canvas);
        mimeType = 'image/png';
        fileName = 'reppy-reto.png';
      }

      const file = new File([blob], fileName, { type: mimeType });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Reppy', text: `${caption}\n${url}` });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
        notificationStore.notify(i18n.locale === 'es' ? 'Imagen descargada' : 'Image downloaded', 'success');
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      notificationStore.notify(
        i18n.locale === 'es' ? 'No se pudo generar la imagen' : 'Could not generate image',
        'error'
      );
    } finally {
      generating.value = false;
    }
  }

  return { share, generating };
}
