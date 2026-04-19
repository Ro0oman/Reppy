import { defineStore } from 'pinia';

import { useAudioStore } from './audio';

export const useDamageStore = defineStore('damage', {
  state: () => ({
    activeDamages: [],
    lastDamageTime: 0
  }),
  actions: {
    addDamage(amount, type) {
      const audioStore = useAudioStore();
      const now = Date.now();
      // Throttle rapid calls
      if (now - this.lastDamageTime < 1000) return;
      
      this.lastDamageTime = now;
      audioStore.play('hit');
      const id = now + Math.random();
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

      // SYNC: Remove exactly when animation ends (1.2s)
      setTimeout(() => {
        this.removeDamage(id);
      }, 1200); 
    },
    removeDamage(id) {
      this.activeDamages = this.activeDamages.filter(d => d.id !== id);
    }
  }
});
