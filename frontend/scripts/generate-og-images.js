import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogPosts = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/blogPosts.json'), 'utf8'));
const fontPath = path.resolve(__dirname, '../src/assets/fonts/Inter.ttf');
const outRoot = path.resolve(__dirname, '../dist/og/blog');

const W = 1200, H = 630;
const BRAND = '#2f80ed';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripEmoji = (s) => s.replace(/[\u{1F000}-\u{1FFFF}]|[☀-➿]/gu, '').replace(/\s+/g, ' ').trim();

const wrap = (text, max) => {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
};

// Pick a wrap width + font size that keeps the title to <=4 balanced lines
const layoutTitle = (title) => {
  let fontSize = 72, lines = wrap(title, 20);
  if (lines.length > 2) { fontSize = 60; lines = wrap(title, 24); }
  if (lines.length > 3) { fontSize = 50; lines = wrap(title, 29); }
  if (lines.length > 4) {
    lines = wrap(title, 33).slice(0, 4);
    lines[3] = lines[3].replace(/[.,;:]?\s*\S*$/, '') + '…';
    fontSize = 46;
  }
  return { lines, fontSize };
};

const buildSvg = (title, category, footer) => {
  const { lines, fontSize } = layoutTitle(title);
  const lineH = fontSize * 1.16;
  const firstBaseline = Math.round(362 - (lines.length - 1) * lineH / 2 + fontSize * 0.34);
  const titleSvg = lines
    .map((l, i) => `<text x="90" y="${firstBaseline + i * lineH}" font-family="Inter" font-weight="800" font-size="${fontSize}" fill="#ffffff">${esc(l)}</text>`)
    .join('');
  const chipW = category.length * 14 + 48;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0d1326"/><stop offset="1" stop-color="#0a0a12"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1060" cy="110" r="280" fill="${BRAND}" fill-opacity="0.10"/>
  <rect x="90" y="64" width="56" height="56" rx="16" fill="${BRAND}"/>
  <text x="118" y="104" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="#ffffff">R</text>
  <text x="162" y="105" font-family="Inter" font-weight="800" font-size="34" fill="#ffffff">Reppy</text>
  <rect x="90" y="158" width="${chipW}" height="42" rx="21" fill="${BRAND}" fill-opacity="0.16"/>
  <text x="${90 + chipW / 2}" y="185" text-anchor="middle" font-family="Inter" font-weight="800" font-size="20" fill="${BRAND}" letter-spacing="2">${esc(category)}</text>
  ${titleSvg}
  <rect x="90" y="540" width="6" height="34" rx="3" fill="${BRAND}"/>
  <text x="112" y="566" font-family="Inter" font-weight="700" font-size="24" fill="#9aa6c2">${esc(footer)}</text>
</svg>`;
};

const render = (svg) =>
  new Resvg(svg, { font: { fontFiles: [fontPath], loadSystemFonts: false, defaultFontFamily: 'Inter' } })
    .render()
    .asPng();

// Failure-tolerant: las OG images son un extra de SEO/social; si el binario nativo
// de resvg no está disponible en el entorno de build, avisamos pero NO rompemos el
// deploy (mismo criterio que indexnow-ping.js).
try {
  let count = 0;
  for (const lang of ['es', 'en']) {
    const dir = path.join(outRoot, lang);
    fs.mkdirSync(dir, { recursive: true });
    const footer = lang === 'es' ? 'Guías de calistenia · reppy.romandev.app' : 'Calisthenics guides · reppy.romandev.app';
    for (const post of blogPosts) {
      if (!post.slug) continue;
      const locale = post.locales?.[lang] || post.locales?.en;
      if (!locale?.title) continue;
      const title = stripEmoji(locale.title);
      const category = (post.category || 'Reppy').toUpperCase();
      const svg = buildSvg(title, category, footer);
      fs.writeFileSync(path.join(dir, `${post.slug}.png`), render(svg));
      count++;
    }
  }
  console.log(`🖼️  [SEO] Generated ${count} branded OG images in dist/og/blog/{es,en}/`);
} catch (e) {
  console.warn('[SEO] OG image generation skipped (non-fatal):', e.message);
}
