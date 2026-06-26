import { defineStore } from 'pinia';
import axios from 'axios';

// Generic per-user "NEW" tracking for freshly added sections/cards. A feature
// shows its NEW marker until the user has seen it; the seen state lives in DB so
// it never reappears across devices/sessions.
export const useFeatureSeenStore = defineStore('featureSeen', {
  state: () => ({
    seen: [],          // array of feature keys already seen
    loaded: false,
    fetchPromise: null,
    pending: new Set(), // keys whose markSeen is in flight (avoid double POST)
  }),

  actions: {
    async load(force = false) {
      if (this.fetchPromise) return this.fetchPromise;
      if (this.loaded && !force) return;

      this.fetchPromise = (async () => {
        try {
          const res = await axios.get('/api/features/seen');
          this.seen = Array.isArray(res.data) ? res.data : [];
          this.loaded = true;
        } catch (e) {
          console.error('Error loading seen features:', e);
        } finally {
          this.fetchPromise = null;
        }
      })();

      return this.fetchPromise;
    },

    isNew(key) {
      // Before load completes, don't flash NEW badges; treat as seen.
      if (!this.loaded) return false;
      return !this.seen.includes(key);
    },

    async markSeen(key) {
      if (!key || this.seen.includes(key) || this.pending.has(key)) return;
      this.pending.add(key);
      this.seen.push(key); // optimistic
      try {
        await axios.post(`/api/features/seen/${key}`);
      } catch (e) {
        console.error('Error marking feature seen:', e);
        // rollback so a retry can happen later
        this.seen = this.seen.filter((k) => k !== key);
      } finally {
        this.pending.delete(key);
      }
    },
  },
});
