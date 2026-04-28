import { defineStore } from 'pinia'
import axios from 'axios'

export const useShopStore = defineStore('shop', {
  state: () => ({
    cosmetics: [],
    dailyItems: [],
    chests: [],
    nextRotation: null,
    lastFetch: 0,
    lastDailyFetch: 0,
    fetchPromise: null,
    dailyFetchPromise: null,
    loading: false
  }),
  actions: {
    async fetchCosmetics(force = false) {
      if (this.fetchPromise) return this.fetchPromise;

      const now = Date.now();
      if (!force && this.lastFetch && now - this.lastFetch < 30000) {
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
    },

    async fetchDailyShop(force = false) {
      if (this.dailyFetchPromise) return this.dailyFetchPromise;

      const now = Date.now();
      if (!force && this.lastDailyFetch && now - this.lastDailyFetch < 60000) {
        return { deals: this.dailyItems, chests: this.chests };
      }

      this.dailyFetchPromise = (async () => {
        try {
          const res = await axios.get('/api/shop/daily');
          this.dailyItems = res.data.deals;
          this.chests = res.data.chests;
          this.nextRotation = res.data.next_rotation;
          this.lastDailyFetch = Date.now();
          return res.data;
        } catch (error) {
          console.error('Error fetching daily shop:', error);
          throw error;
        } finally {
          this.dailyFetchPromise = null;
        }
      })();

      return this.dailyFetchPromise;
    },

    async buyChest(type) {
      try {
        const res = await axios.post(`/api/shop/buy-chest/${type}`);
        return res.data;
      } catch (error) {
        console.error('Error buying chest:', error);
        throw error;
      }
    }
  }
})
