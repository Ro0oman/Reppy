import { defineStore } from 'pinia';
import axios from 'axios';

// Aggregate "red dot" badges for the player card (Misiones / Cofres / Ranking)
// and the inventory tab. Short cache so it stays cheap on the hot battle view.
export const useBadgesStore = defineStore('badges', {
  state: () => ({
    missions_claimable: 0,
    chests_total: 0,
    inventory_new: false,
    ranking_new: false,
    ranking_key: null,
    lastFetch: 0,
    fetchPromise: null,
  }),

  getters: {
    hasMissions: (state) => state.missions_claimable > 0,
    hasChests: (state) => state.chests_total > 0,
  },

  actions: {
    async fetchBadges(force = false) {
      if (this.fetchPromise) return this.fetchPromise;

      const now = Date.now();
      if (!force && this.lastFetch && now - this.lastFetch < 30000) {
        return;
      }

      this.fetchPromise = (async () => {
        try {
          const res = await axios.get('/api/features/badges');
          this.missions_claimable = res.data.missions_claimable || 0;
          this.chests_total = res.data.chests_total || 0;
          this.inventory_new = !!res.data.inventory_new;
          this.ranking_new = !!res.data.ranking_new;
          this.ranking_key = res.data.ranking_key || null;
          this.lastFetch = Date.now();
        } catch (e) {
          console.error('Error fetching badges:', e);
        } finally {
          this.fetchPromise = null;
        }
      })();

      return this.fetchPromise;
    },

    // Called when the user opens the ranking: clears the weekly dot locally and
    // persists it via the feature-seen mechanism.
    async clearRanking() {
      if (!this.ranking_new || !this.ranking_key) return;
      this.ranking_new = false;
      try {
        await axios.post(`/api/features/seen/${this.ranking_key}`);
      } catch (e) {
        console.error('Error clearing ranking dot:', e);
      }
    },
  },
});
