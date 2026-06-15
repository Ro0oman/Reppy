import { defineStore } from 'pinia';
import axios from 'axios';

export const useTrainingStore = defineStore('training', {
  state: () => ({
    plans: [],
    customPlans: [],
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

    async fetchCustomPlans() {
      const res = await axios.get('/api/training/custom-plans');
      this.customPlans = res.data.plans || [];
      return this.customPlans;
    },

    async fetchCustomPlanDetail(id) {
      const res = await axios.get(`/api/training/custom-plans/${id}`);
      return res.data.plan;
    },

    async createCustomPlan(payload) {
      const res = await axios.post('/api/training/custom-plans', payload);
      await this.fetchCustomPlans();
      return res.data.plan;
    },

    async updateCustomPlan(id, payload) {
      const res = await axios.put(`/api/training/custom-plans/${id}`, payload);
      await this.fetchCustomPlans();
      return res.data.plan;
    },

    async deleteCustomPlan(id) {
      await axios.delete(`/api/training/custom-plans/${id}`);
      await this.fetchCustomPlans();
      await this.fetchMine();
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

    async cancelSession(sessionId) {
      await axios.post(`/api/training/sessions/${sessionId}/cancel`);
    },

    async completeSession(sessionId, sets) {
      const res = await axios.post(`/api/training/sessions/${sessionId}/complete`, { sets });
      await this.fetchMine();
      return res.data;
    },
  },
});
