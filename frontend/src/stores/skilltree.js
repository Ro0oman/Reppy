import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

// Skill Tree (combat perks). Mirrors the lightweight fetch/cache pattern of the
// roulette store. The user earns 1 point per level-up (granted server-side) and
// spends it here; upgrades are atomic on the backend (FOR UPDATE).
export const useSkillTreeStore = defineStore('skilltree', {
  state: () => ({
    skillPoints: 0,
    branches: [],   // [{ id, order, color }]
    perks: [],      // [{ id, branch, tier, rank, maxRank, perRank, kind, requires, unlocked }]
    bonuses: {},
    loaded: false,
    fetchPromise: null,
    upgrading: null, // perkId currently being upgraded
    showModal: false,
  }),

  actions: {
    openModal() {
      this.showModal = true;
      this.fetchTree(true);
    },
    closeModal() {
      this.showModal = false;
    },

    async fetchTree(force = false) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.token) return;
      if (this.fetchPromise) return this.fetchPromise;
      if (this.loaded && !force) return;

      this.fetchPromise = (async () => {
        try {
          const res = await axios.get('/api/skilltree');
          this.skillPoints = res.data.skillPoints || 0;
          this.branches = res.data.branches || [];
          this.perks = res.data.perks || [];
          this.bonuses = res.data.bonuses || {};
          this.loaded = true;
        } catch (e) {
          console.warn('[SKILLTREE_STORE] fetch failed:', e.message);
        } finally {
          this.fetchPromise = null;
        }
      })();

      return this.fetchPromise;
    },

    async upgrade(perkId) {
      if (this.upgrading || this.skillPoints < 1) return { ok: false, code: 'NO_POINTS' };
      this.upgrading = perkId;
      try {
        const res = await axios.post('/api/skilltree/upgrade', { perkId });
        this.skillPoints = res.data.skillPoints;
        this.perks = res.data.perks;
        this.bonuses = res.data.bonuses;
        // Keep the user's mirrored point count in sync for top-of-dashboard badges.
        const authStore = useAuthStore();
        if (authStore.user) authStore.user.skill_points = res.data.skillPoints;
        return { ok: true };
      } catch (e) {
        return { ok: false, code: e.response?.data?.code, error: e.response?.data?.error };
      } finally {
        this.upgrading = null;
      }
    },
  },
});
