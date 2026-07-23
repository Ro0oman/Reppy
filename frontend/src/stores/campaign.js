import { defineStore } from 'pinia';
import axios from 'axios';

// Campaign state: the data-driven RPG map + the player's active run and engaged
// node. Mirrors backend/campaign.js (/status, /map, /engage/:nodeId).
export const useCampaignStore = defineStore('campaign', {
  state: () => ({
    run: null,
    engaged: null,      // { node, enemy, progress } — the single active target
    map: null,          // { run, zones, nodes, edges }
    bestiary: null,     // { total, discovered, enemies: [...] }
    loadingStatus: false,
    loadingMap: false,
    loadingBestiary: false,
    engaging: false,
  }),

  getters: {
    hasEngaged: (s) => !!s.engaged,
    nodesByZone: (s) => {
      const out = {};
      for (const n of s.map?.nodes || []) (out[n.zone_id] ||= []).push(n);
      return out;
    },
  },

  actions: {
    async fetchStatus(force = false) {
      if (this.loadingStatus && !force) return;
      this.loadingStatus = true;
      try {
        const { data } = await axios.get('/api/campaign/status');
        this.run = data.run;
        this.engaged = data.engaged;
      } catch (e) {
        console.error('[campaign] fetchStatus failed', e);
      } finally {
        this.loadingStatus = false;
      }
    },

    async fetchMap(force = false) {
      if (this.loadingMap && !force) return;
      this.loadingMap = true;
      try {
        const { data } = await axios.get('/api/campaign/map');
        this.map = data;
        this.run = data.run;
      } catch (e) {
        console.error('[campaign] fetchMap failed', e);
      } finally {
        this.loadingMap = false;
      }
    },

    async prestige() {
      try {
        const { data } = await axios.post('/api/campaign/prestige');
        return { ok: true, body: data };
      } catch (e) {
        return { ok: false, body: e.response?.data || { message: 'Error' } };
      }
    },

    async choosePath(path) {
      try {
        const { data } = await axios.post('/api/campaign/choose-path', { path });
        if (this.run) this.run.path = data.path;
        return { ok: true, body: data };
      } catch (e) {
        return { ok: false, body: e.response?.data || { message: 'Error' } };
      }
    },

    async fetchNpc(slug) {
      try {
        const { data } = await axios.get(`/api/campaign/npcs/${slug}`);
        return data; // { npc, quests }
      } catch (e) {
        console.error('[campaign] fetchNpc failed', e);
        return null;
      }
    },

    async acceptQuest(questId) {
      try {
        const { data } = await axios.post(`/api/campaign/quests/${questId}/accept`);
        return { ok: true, body: data };
      } catch (e) {
        return { ok: false, body: e.response?.data || { message: 'Error' } };
      }
    },

    async claimQuest(questId) {
      try {
        const { data } = await axios.post(`/api/campaign/quests/${questId}/claim`);
        return { ok: true, body: data };
      } catch (e) {
        return { ok: false, body: e.response?.data || { message: 'Error' } };
      }
    },

    async fetchBestiary(force = false) {
      if (this.loadingBestiary && !force) return;
      this.loadingBestiary = true;
      try {
        const { data } = await axios.get('/api/campaign/bestiary');
        this.bestiary = data;
      } catch (e) {
        console.error('[campaign] fetchBestiary failed', e);
      } finally {
        this.loadingBestiary = false;
      }
    },

    // Engage a node. Returns { ok, body }. On success the engaged target is set.
    async engage(nodeId) {
      this.engaging = true;
      try {
        const { data } = await axios.post(`/api/campaign/engage/${nodeId}`);
        this.engaged = { node: data.node, enemy: data.enemy, progress: data.progress };
        if (data.run) this.run = { ...this.run, ...data.run };
        return { ok: true, body: data };
      } catch (e) {
        return { ok: false, body: e.response?.data || { message: 'Error' } };
      } finally {
        this.engaging = false;
      }
    },

    // Apply the campaign slice of a POST /api/reps response to the engaged target.
    applyLoggedResult(campaign) {
      if (!campaign || !this.engaged) return;
      const p = this.engaged.progress;
      if (campaign.cleared) {
        p.current_hp = 0;
      } else if (campaign.killed) {
        // Next enemy in a pack: HP resets to full, kills advances.
        p.current_hp = p.total_hp;
        p.kills = (p.kills || 0) + 1;
      } else {
        p.current_hp = Math.max(0, p.current_hp - campaign.damage);
      }
    },
  },
});
