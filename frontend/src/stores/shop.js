import { defineStore } from 'pinia'
import axios from 'axios'

export const useShopStore = defineStore('shop', {
  state: () => ({
    cosmetics: [],
    dailyItems: [],
    chests: [],
    nextRotation: null,
    refreshCost: 0,
    refreshCostGems: 0,
    dailyRefreshes: 0,
    lastFetch: 0,
    lastDailyFetch: 0,
    lastInventoryFetch: 0,
    fetchPromise: null,
    dailyFetchPromise: null,
    inventoryFetchPromise: null,
    inventory: [],
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

    async fetchInventory(force = false) {
      if (this.inventoryFetchPromise) return this.inventoryFetchPromise;

      const now = Date.now();
      if (!force && this.lastInventoryFetch && now - this.lastInventoryFetch < 30000) {
        return this.inventory;
      }

      this.inventoryFetchPromise = (async () => {
        this.loading = true;
        try {
          const res = await axios.get('/api/users/inventory');
          this.inventory = res.data;
          this.lastInventoryFetch = Date.now();
          return this.inventory;
        } catch (error) {
          console.error('Error fetching inventory:', error);
          throw error;
        } finally {
          this.loading = false;
          this.inventoryFetchPromise = null;
        }
      })();

      return this.inventoryFetchPromise;
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
          this.dailyItems = (res.data.deals || []).map(item => {
            let parsedStats = item.stats;
            if (typeof item.stats === 'string') {
              try {
                parsedStats = JSON.parse(item.stats);
              } catch (e) {
                console.warn(`Failed to parse stats for item ${item.name}:`, item.stats);
                parsedStats = {};
              }
            }
            // Normalize prices for daily deals: use discounted if available, otherwise original
            const finalPrice = item.discounted_price !== undefined && item.discounted_price !== null ? item.discounted_price : item.price;
            const finalGems = item.discounted_gems !== undefined && item.discounted_gems !== null ? item.discounted_gems : item.price_gems;
            
            return { 
              ...item, 
              price: finalPrice,
              price_gems: finalGems,
              stats: parsedStats || {} 
            };
          });
          this.chests = res.data.chests;
          this.nextRotation = res.data.next_rotation;
          this.refreshCostGems = res.data.refresh_cost_gems;
          this.dailyRefreshes = res.data.daily_refreshes;
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

    async refreshDailyShop() {
      try {
        const res = await axios.post('/api/shop/daily/refresh');
        await this.fetchDailyShop(true);
        return res.data;
      } catch (error) {
        console.error('Error refreshing daily shop:', error);
        throw error;
      }
    },

    async buyChest(type) {
      try {
        const res = await axios.post(`/api/shop/buy-chest/${type}`);
        // Synchronize inventory after purchase to ensure new items show up immediately
        await this.fetchInventory(true);
        return res.data;
      } catch (error) {
        console.error('Error buying chest:', error);
        throw error;
      }
    },
    
    async claimDailyReward(dealId) {
      try {
        const res = await axios.post(`/api/shop/daily/claim/${dealId}`);
        await this.fetchDailyShop(true);
        // Also fetch inventory in case the reward was an item
        await this.fetchInventory(true);
        return res.data;
      } catch (error) {
        console.error('Error claiming reward:', error);
        throw error;
      }
    }
  }
})
