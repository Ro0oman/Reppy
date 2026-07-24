import axios from 'axios';

/**
 * GA4 funnel events. gtag is loaded globally in index.html (G-TJ4SF4KS8R),
 * so this just wraps window.gtag defensively (SSR-safe, no-op if gtag absent).
 */
export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', name, params);
  } catch (e) {
    /* analytics must never break the app */
  }
}

/** Fire an event at most once per browser (persisted in localStorage). */
export function trackEventOnce(name, params = {}) {
  if (typeof window === 'undefined') return;
  const key = `ga_once_${name}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
  } catch (e) {
    // localStorage unavailable → fall through and just fire (better than losing it).
  }
  trackEvent(name, params);
}

/**
 * Day-2 return: fired the first time a user opens the app on a different
 * calendar day than their first visit. A lightweight D2-retention funnel step.
 */
export function trackDay2Return() {
  if (typeof window === 'undefined') return;
  try {
    const FIRST = 'ga_first_seen_date';
    const today = new Date().toISOString().slice(0, 10);
    const first = localStorage.getItem(FIRST);
    if (!first) {
      localStorage.setItem(FIRST, today);
      return;
    }
    if (first !== today) {
      trackEventOnce('day2_return');
    }
  } catch (e) {
    /* ignore */
  }
}

/**
 * Central funnel instrumentation via a single axios response interceptor —
 * catches these actions no matter which component triggers them:
 *   signup       → POST /auth/signup
 *   first_log    → first successful POST /reps (once per browser)
 *   spin         → POST /roulette/(daily-)spin | buy-and-spin
 *   push_enabled → POST /push/subscribe
 */
export function initFunnelTracking() {
  axios.interceptors.response.use(
    (response) => {
      try {
        const cfg = response.config || {};
        const method = (cfg.method || '').toLowerCase();
        const url = cfg.url || '';
        if (method === 'post') {
          if (/\/auth\/signup$/.test(url)) {
            trackEvent('signup', { method: 'password' });
          } else if (/\/reps\/?$/.test(url)) {
            trackEventOnce('first_log');
          } else if (/\/roulette\/(daily-spin|spin|buy-and-spin)$/.test(url)) {
            trackEvent('spin');
          } else if (/\/push\/subscribe$/.test(url)) {
            trackEvent('push_enabled');
          }
        }
      } catch (e) {
        /* never let tracking break a response */
      }
      return response;
    },
    (error) => Promise.reject(error)
  );
}
