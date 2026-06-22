import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useRouletteStore = defineStore('roulette', {
  state: () => ({
    canSpin: false,
    hasTicket: false,
    ticketCount: 0,
    extraSpinCost: 5,
    nextSpinAt: null,
    lastCheck: 0,
    fetchPromise: null,
    showModal: false,
    // Which wheel the modal is showing: 'quick' (4h) or 'daily' (24h).
    variant: 'quick',
    // Daily wheel state — kept separate so the two cooldowns never collide.
    dailyCanSpin: false,
    dailyNextSpinAt: null,
    dailyLastCheck: 0,
    dailyFetchPromise: null
  }),

  actions: {
    openModal(variant = 'quick') {
      this.variant = variant;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async checkStatus(force = false) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.token) {
        this.canSpin = false;
        return;
      }

      if (this.fetchPromise) return this.fetchPromise;

      const now = Date.now();
      if (!force && this.lastCheck && now - this.lastCheck < 60000) { // Cache for 1 minute
        return this.canSpin;
      }

      this.fetchPromise = (async () => {
        try {
          const res = await axios.get('/api/roulette/status');
          this.canSpin = res.data.canSpin;
          this.hasTicket = res.data.hasTicket;
          this.ticketCount = res.data.ticketCount;
          this.extraSpinCost = res.data.extraSpinCost || 5;
          this.nextSpinAt = res.data.nextSpinAt || null;
          this.lastCheck = Date.now();
          return this.canSpin;
        } catch (e) {
          console.warn('[ROULETTE_STORE] Failed to fetch status:', e.message);
          return false;
        } finally {
          this.fetchPromise = null;
        }
      })();

      return this.fetchPromise;
    },

    setSpun() {
      this.canSpin = false;
      // Optimistic: show a 4h countdown immediately. checkStatus(true) runs after
      // the spin animation and replaces this with the server's exact nextSpinAt.
      this.nextSpinAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
      this.lastCheck = Date.now();
    },

    async checkDailyStatus(force = false) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.token) {
        this.dailyCanSpin = false;
        return;
      }

      if (this.dailyFetchPromise) return this.dailyFetchPromise;

      const now = Date.now();
      if (!force && this.dailyLastCheck && now - this.dailyLastCheck < 60000) {
        return this.dailyCanSpin;
      }

      this.dailyFetchPromise = (async () => {
        try {
          const res = await axios.get('/api/roulette/daily-status');
          this.dailyCanSpin = res.data.canSpin;
          this.dailyNextSpinAt = res.data.nextSpinAt || null;
          this.dailyLastCheck = Date.now();
          return this.dailyCanSpin;
        } catch (e) {
          console.warn('[ROULETTE_STORE] Failed to fetch daily status:', e.message);
          return false;
        } finally {
          this.dailyFetchPromise = null;
        }
      })();

      return this.dailyFetchPromise;
    },

    setDailySpun() {
      this.dailyCanSpin = false;
      // Optimistic 24h countdown; checkDailyStatus(true) replaces it with the
      // server's authoritative nextSpinAt after the animation.
      this.dailyNextSpinAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      this.dailyLastCheck = Date.now();
    }
  }
});
