import { defineStore } from 'pinia'
import axios from 'axios'

export const useBossStore = defineStore('boss', {
  state: () => ({
    activeBoss: null,
    lastFetch: 0,
    fetchPromise: null,
    history: [],
    loading: false
  }),
  actions: {
    async fetchActiveBoss(force = false) {
      if (this.fetchPromise) return this.fetchPromise;

      const now = Date.now();
      if (!force && this.lastFetch && now - this.lastFetch < 10000) {
        return this.activeBoss;
      }

      this.fetchPromise = (async () => {
        this.loading = true;
        try {
          const res = await axios.get('/api/boss/active');
          this.activeBoss = res.data;
          this.lastFetch = Date.now();
          return this.activeBoss;
        } catch (error) {
          console.error('Error fetching active boss:', error);
          throw error;
        } finally {
          this.loading = false;
          this.fetchPromise = null;
        }
      })();

      return this.fetchPromise;
    },

    async fetchBossHistory() {
      try {
        const res = await axios.get('/api/boss/history');
        this.history = res.data;
        return this.history;
      } catch (error) {
        console.error('Error fetching boss history:', error);
        throw error;
      }
    }
  }
})
