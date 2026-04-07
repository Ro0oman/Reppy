import { defineStore } from 'pinia';

export const useDamageStore = defineStore('damage', {
  state: () => ({
    activeDamages: []
  }),
  actions: {
    addDamage(amount, type) {
      const id = Date.now() + Math.random();
      // Generate random position near the center/target area
      const x = 50 + (Math.random() * 20 - 10);
      const y = 40 + (Math.random() * 20 - 10);
      
      this.activeDamages.push({
        id,
        amount,
        type,
        x,
        y
      });

      // Character-specific colors for JRPG style
      // PullUps: Yellow/Primary
      // PushUps: Red/Orange
      // MuscleUps: Purple/Legendary
      // etc.

      setTimeout(() => {
        this.removeDamage(id);
      }, 2000); // Duration matches animation
    },
    removeDamage(id) {
      this.activeDamages = this.activeDamages.filter(d => d.id !== id);
    }
  }
});
