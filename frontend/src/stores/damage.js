import { defineStore } from 'pinia';

import { useAudioStore } from './audio';

export const useDamageStore = defineStore('damage', {
  state: () => ({
    activeDamages: [],
    lastDamageTime: 0
  }),
  actions: {
    addDamage(amount, type, x, y, isCrit = false, userName = null, userId = null) {
      const now = Date.now();
      
      const id = now + Math.random();
      // Use provided coordinates or random near center
      const finalX = x !== undefined ? x : (50 + (Math.random() * 20 - 10));
      const finalY = y !== undefined ? y : (40 + (Math.random() * 20 - 10));
      
      this.activeDamages.push({
        id,
        amount,
        type,
        x: finalX,
        y: finalY,
        isCrit,
        userName,
        userId
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
