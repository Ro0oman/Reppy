import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useDamageStore } from '@/stores/damage';
import { getLocalDateString } from '@/utils/dateUtils.js';
import { markPushPromptEligible } from '@/utils/pushEligibility.js';
import { useAudio } from '@/composables/useAudio';
import { logError } from '@/utils/logger';

// Shared rep-logging flow used by RepsInput, the Battle reps panel and the
// quick-log FAB sheet. POST /api/reps → flying damage → SFX → toasts/jackpot →
// gem drop → refresh profile. Returns the API response so callers can refresh
// boss/badges and react to the result. `origin` ({x,y} in px) lets the caller
// make the damage numbers fly over the boss instead of screen-center.
export function useRepLogger() {
  const loading = ref(false);
  const { playHit } = useAudio();

  async function logReps({ count, exerciseType = 'pullups', addedWeight = 0, origin = null } = {}) {
    const repsToSubmit = Math.max(1, Math.floor(Number(count) || 0));
    if (loading.value || repsToSubmit < 1) return null;

    const authStore = useAuthStore();
    const i18n = useI18nStore();
    const notificationStore = useNotificationStore();
    const damageStore = useDamageStore();

    loading.value = true;
    playHit();
    try {
      const today = getLocalDateString();
      const res = await axios.post('/api/reps', {
        count: repsToSubmit,
        date: today,
        exercise_type: exerciseType,
        added_weight: addedWeight || 0,
      });

      // Flying damage numbers (over the boss when origin is provided).
      const damageToAnimate = res.data.damage_dealt_this_set ?? res.data.boss_damage_dealt;
      if (damageToAnimate > 0) {
        damageStore.addDamage(damageToAnimate, exerciseType, origin?.x, origin?.y, res.data.is_crit);
      }

      // 5/7 weekly jackpot feedback.
      if (res.data.jackpot_awarded) {
        const jackpotMsg = i18n.locale === 'es'
          ? `🎉 ¡Bonus semanal! +${res.data.jackpot_coins} RC por entrenar 5 días esta semana`
          : `🎉 Weekly bonus! +${res.data.jackpot_coins} RC for training 5 days this week`;
        notificationStore.notify(jackpotMsg, 'success');
        try {
          const { default: confetti } = await import('canvas-confetti');
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#3b82f6', '#60a5fa', '#34d399', '#fbbf24'] });
        } catch (_) {}
      } else {
        const msg = i18n.locale === 'es' ? `+${repsToSubmit} reps registradas` : `+${repsToSubmit} reps logged`;
        notificationStore.notify(msg, 'success');
      }

      // gem_vein skill perk: celebrate a lucky gem drop.
      if (res.data.gem_dropped) {
        notificationStore.notify(i18n.t('skilltree_gem_dropped'), 'success');
      }

      // Refresh global user state to sync header level/XP/coins.
      await authStore.fetchProfile();
      markPushPromptEligible();
      return res.data;
    } catch (error) {
      console.error('Error logging reps:', error);
      // Deja en el log QUÉ se intentaba registrar; el status y el cuerpo de la
      // respuesta los añade aparte el interceptor de axios del logger.
      logError('logReps falló', { exerciseType, count: repsToSubmit, addedWeight }, error);
      const msg = i18n.locale === 'es' ? 'No se pudieron registrar las reps' : 'Failed to log reps';
      notificationStore.notify(msg, 'error');
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { loading, logReps };
}
