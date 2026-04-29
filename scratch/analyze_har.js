
import fs from 'fs';
import path from 'path';

const harPath = 'c:/Users/romai/Documents/GitHub/Reppy/network/localhost.har';

function analyzeHar() {
  console.log('Reading HAR file...');
  const data = JSON.parse(fs.readFileSync(harPath, 'utf8'));
  const entries = data.log.entries;

  const urlStats = {};
  const totalEntries = entries.length;
  let totalSize = 0;

  entries.forEach(entry => {
    const url = entry.request.url;
    const method = entry.request.method;
    const status = entry.response.status;
    const size = (entry.response.content.size || 0) + (entry.response.headersSize || 0);
    const ttfb = entry.timings.wait; // TTFB is roughly 'wait' in HAR

    totalSize += size;

    if (!urlStats[url]) {
      urlStats[url] = {
        count: 0,
        totalSize: 0,
        totalTtfb: 0,
        methods: new Set(),
        statuses: new Set()
      };
    }

    urlStats[url].count++;
    urlStats[url].totalSize += size;
    urlStats[url].totalTtfb += ttfb;
    urlStats[url].methods.add(method);
    urlStats[url].statuses.add(status);
  });

  const sortedByCount = Object.entries(urlStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15);

  const sortedBySize = Object.entries(urlStats)
    .sort((a, b) => b[1].totalSize - a[1].totalSize)
    .slice(0, 15);

  const sortedByTtfb = Object.entries(urlStats)
    .filter(([url, stats]) => stats.count > 0)
    .sort((a, b) => (b[1].totalTtfb / b[1].count) - (a[1].totalTtfb / a[1].count))
    .slice(0, 15);

  console.log('--- HAR ANALYSIS SUMMARY ---');
  console.log(`Total Requests: ${totalEntries}`);
  console.log(`Total Egress (approx): ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('\n--- TOP REDUNDANT REQUESTS (Repeated URLs) ---');
  sortedByCount.forEach(([url, stats]) => {
    console.log(`${stats.count}x | ${url.substring(0, 100)}${url.length > 100 ? '...' : ''}`);
  });

  console.log('\n--- TOP HEAVY REQUESTS (Cumulative Size) ---');
  sortedBySize.forEach(([url, stats]) => {
    console.log(`${(stats.totalSize / 1024).toFixed(2)} KB | ${url.substring(0, 100)}${url.length > 100 ? '...' : ''}`);
  });

  console.log('\n--- TOP SLOWEST REQUESTS (Avg TTFB) ---');
  sortedByTtfb.forEach(([url, stats]) => {
    console.log(`${(stats.totalTtfb / stats.count).toFixed(2)} ms | ${url.substring(0, 100)}${url.length > 100 ? '...' : ''}`);
  });
}

analyzeHar();
