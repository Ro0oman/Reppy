import { defineStore } from 'pinia';

export const useAudioStore = defineStore('audio', {
  state: () => ({
    isMuted: (!import.meta.env.SSR && localStorage.getItem('reppy_audio_muted') === 'true'),
    volume: 0.5,
    sounds: {},
    audioContext: null,
    lastPlayTime: {} // Throttle tracking
  }),
  actions: {
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (!import.meta.env.SSR) {
        localStorage.setItem('reppy_audio_muted', this.isMuted.toString());
      }
    },
    
    async resumeContext() {
      if (import.meta.env.SSR) return null;
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume().catch(() => {});
      }
      return this.audioContext;
    },

    play(soundName) {
      if (import.meta.env.SSR) return;
      if (this.isMuted) return;
      
      // Safety: Prevent rapid-fire duplicate sounds (standard throttle)
      const now = Date.now();
      if (this.lastPlayTime[soundName] && now - this.lastPlayTime[soundName] < 80) {
        return;
      }
      this.lastPlayTime[soundName] = now;

      this.resumeContext();

      if (this.sounds[soundName]) {
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch(() => {});
        return;
      }
      
      const audio = new Audio(`/audio/${soundName}.mp3`);
      audio.volume = this.volume;
      this.sounds[soundName] = audio;
      audio.play().catch(() => {});
    },

    /**
     * Tactical Blip Generation (Web Audio API)
     * No files required.
     */
    async playBlip(freq = 880, duration = 0.1, type = 'sine') {
      if (this.isMuted) return;
      
      try {
        const context = await this.resumeContext();
        if (context.state !== 'running') return;

        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, context.currentTime + duration);

        gain.gain.setValueAtTime(0.1, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start();
        oscillator.stop(context.currentTime + duration);
      } catch (e) {
        // Suppress logs to avoid console noise on first load
      }
    }
  }
});
