// IndexNow ping — notifies Bing (and other IndexNow engines) of our URLs so
// new/updated content gets indexed in hours instead of weeks. Bing's index is
// what ChatGPT Search reads, so faster Bing indexing => more AI citations.
//
// Runs as the last step of `npm run build`. It is intentionally:
//   * production-only  — skips preview/local builds (set INDEXNOW_FORCE=1 to override)
//   * failure-tolerant — never exits non-zero, so a ping error can't break a deploy
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://reppy.romandev.app';
const HOST = new URL(BASE_URL).host;
const KEY = '8542fbbd5bc1fc75844042edb526a0a8';
const KEY_LOCATION = `${BASE_URL}/${KEY}.txt`;

const isProduction = process.env.VERCEL_ENV === 'production';
const forced = process.env.INDEXNOW_FORCE === '1';

const collectUrls = () => {
  const publicDir = path.resolve(__dirname, '../public');
  const files = ['sitemap-pages.xml', 'sitemap-blog.xml']; // skip athletes (high churn, low value)
  const urls = new Set();
  for (const file of files) {
    const full = path.join(publicDir, file);
    if (!fs.existsSync(full)) continue;
    const xml = fs.readFileSync(full, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].trim());
  }
  return [...urls];
};

const main = async () => {
  if (!isProduction && !forced) {
    console.log(`[IndexNow] Skipped (VERCEL_ENV=${process.env.VERCEL_ENV || 'unset'}; set INDEXNOW_FORCE=1 to force).`);
    return;
  }

  const urlList = collectUrls();
  if (urlList.length === 0) {
    console.warn('[IndexNow] No URLs found in sitemaps — nothing to submit.');
    return;
  }

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
      signal: AbortSignal.timeout(15000),
    });
    // 200 / 202 = accepted. Other codes are informational only.
    console.log(`[IndexNow] Submitted ${urlList.length} URLs — HTTP ${res.status} ${res.statusText}`);
  } catch (e) {
    console.warn('[IndexNow] Ping failed (non-fatal):', e.message);
  }
};

main();
