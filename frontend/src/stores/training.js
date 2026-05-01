import { defineStore } from 'pinia';
import axios from 'axios';

export const useTrainingStore = defineStore('training', {
  state: () => ({
    plans: [],
    activePlan: null,
    todayWorkout: null,
    onboardingMode: null,
    onboardingCompleted: false,
    canShowOnboarding: false,
    completedToday: false,
    isTrainingLockedToday: false,
    lockedUntilDate: null,
    nextWorkoutPreview: null,
    isPlanPaused: false,
    loading: false,
  }),

  actions: {
    async fetchPlans() {
      const res = await axios.get('/api/training/plans');
      this.plans = res.data.plans || [];
    },

    async fetchMine() {
      const res = await axios.get('/api/training/me');
      this.activePlan = res.data.activePlan || null;
      this.todayWorkout = res.data.todayWorkout || null;
      this.onboardingMode = res.data.onboardingMode || null;
      this.onboardingCompleted = !!res.data.onboardingCompleted;
      this.canShowOnboarding = !!res.data.canShowOnboarding;
      this.completedToday = !!res.data.completedToday;
      this.isTrainingLockedToday = !!res.data.isTrainingLockedToday;
      this.lockedUntilDate = res.data.lockedUntilDate || null;
      this.nextWorkoutPreview = res.data.nextWorkoutPreview || null;
      this.isPlanPaused = !!res.data.isPlanPaused;
    },

    async selectPlan(payload) {
      await axios.post('/api/training/select', payload);
      await this.fetchMine();
    },

    async chooseFreeMode() {
      await axios.post('/api/training/free-mode');
      await this.fetchMine();
    },

    async abandonPlan() {
      await axios.post('/api/training/abandon');
      await this.fetchMine();
    },

    async pausePlan() {
      await axios.post('/api/training/pause');
      await this.fetchMine();
    },

    async resumePlan() {
      await axios.post('/api/training/resume');
      await this.fetchMine();
    },

    async startSession(planDayId) {
      const res = await axios.post('/api/training/sessions/start', { planDayId });
      return res.data.session;
    },

    async completeSession(sessionId, sets) {
      const res = await axios.post(`/api/training/sessions/${sessionId}/complete`, { sets });
      await this.fetchMine();
      return res.data;
    },
  },
});
