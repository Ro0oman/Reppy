import { defineStore } from 'pinia'
import axios from 'axios'

export const useShopStore = defineStore('shop', {
  state: () => ({
    cosmetics: [],
    lastFetch: 0,
    fetchPromise: null,
    loading: false
  }),
  actions: {
    async fetchCosmetics(force = false) {
      if (this.fetchPromise) return this.fetchPromise;

      const now = Date.now();
      if (!force && this.lastFetch && now - this.lastFetch < 30000) { // 30s cache for shop
        return this.cosmetics;
      }

      this.fetchPromise = (async () => {
        this.loading = true;
        try {
          const res = await axios.get('/api/shop/cosmetics');
          this.cosmetics = res.data;
          this.lastFetch = Date.now();
          return this.cosmetics;
        } catch (error) {
          console.error('Error fetching cosmetics:', error);
          throw error;
        } finally {
          this.loading = false;
          this.fetchPromise = null;
        }
      })();

      return this.fetchPromise;
    }
  }
})
