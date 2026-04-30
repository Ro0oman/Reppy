import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useRouletteStore = defineStore('roulette', {
  state: () => ({
    canSpin: false,
    hasTicket: false,
    ticketCount: 0,
    extraSpinCost: 5,
    lastCheck: 0,
    fetchPromise: null,
    showModal: false
  }),
  
  actions: {
    openModal() {
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
      this.lastCheck = Date.now();
    }
  }
});
