<template>
  <Teleport to="body">
    <transition name="prompt-fade">
      <div v-if="isVisible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-xl">
        <!-- Abstract Background Glows -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
        </div>

        <div class="w-full max-w-lg bg-surface/90 border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center p-8 sm:p-12">
          <!-- Animated Icon Header -->
          <div class="relative mb-8">
            <div class="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl animate-ping"></div>
            <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center relative shadow-xl shadow-primary-500/30">
              <Bell class="w-10 h-10 text-white" />
            </div>
          </div>

          <!-- Content Section -->
          <h2 class="text-3xl sm:text-4xl font-black text-industrial text-foreground uppercase italic tracking-tighter mb-4 leading-none">
            {{ i18n.t('notif_push_title') || 'ACTIVA TU POTENCIAL' }}
          </h2>
          
          <p class="text-sm sm:text-base font-medium text-muted/80 leading-relaxed mb-10 max-w-sm">
            {{ i18n.t('notif_push_desc') || 'Recibe alertas de racha, comentarios de tus amigos e insultos del Boss en tiempo real.' }}
          </p>

          <!-- Feature Grid -->
          <div class="grid grid-cols-1 gap-4 w-full mb-10">
            <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-left transition-all hover:bg-white/10">
              <div class="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                <Zap class="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 class="text-xs font-black text-foreground uppercase tracking-wider">{{ i18n.t('notif_push_streak_title') || 'Alertas de Racha' }}</h4>
                <p class="text-[10px] text-muted">{{ i18n.t('notif_push_streak_desc') || 'Evita perder tu racha diaria.' }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-left transition-all hover:bg-white/10">
              <div class="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck class="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h4 class="text-xs font-black text-foreground uppercase tracking-wider">{{ i18n.t('notif_push_secure_title') || '100% Seguro' }}</h4>
                <p class="text-[10px] text-muted">{{ i18n.t('notif_push_secure_desc') || 'Sin spam, solo lo importante.' }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-4 w-full">
            <button @click="handleSubscribe" 
                    class="w-full btn-reppy h-16 text-lg group overflow-hidden relative">
              <span class="relative z-10">{{ i18n.t('notif_push_allow') || 'ACTIVAR NOTIFICACIONES' }}</span>
              <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            
            <button @click="handleDecline" 
                    class="w-full py-4 text-[10px] font-black text-muted hover:text-foreground uppercase tracking-[0.3em] transition-colors">
              {{ i18n.t('notif_push_later') || 'QUIZÁS MÁS TARDE' }}
            </button>
            
            <button @click="handleNever" 
                    class="w-full py-3 text-[13px] italic font-semibold text-muted/90 bg-white/5 rounded-xl border border-white/10 tracking-normal transition-colors hover:bg-white/10 hover:text-foreground">
              {{ i18n.t('notif_push_never') || 'No, nunca' }}
            </button>
          </div>

          <!-- Bottom Technical Decoration -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Bell, Zap, ShieldCheck } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { getPushStatus, subscribeToPush, getPushPreferences, updatePushPreferences } from '../utils/pushService';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const i18n = useI18nStore();
const isVisible = ref(false);

const NOTIF_VERSION = 'v2'; // Bump this to force re-subscription/re-prompt

const checkPermission = async () => {
  const status = await getPushStatus();
  
  // Show if user has never been asked (prompt)
  // or if they are supported but haven't subscribed yet
  if (status === 'prompt') {
    // Small delay to let the app load
    setTimeout(() => {
      isVisible.value = true;
    }, 2000);
  } else if (status === 'granted') {
    // If already granted, ensure we are subscribed in the backend
    // but only if we haven't successfully synced in this session
    if (!sessionStorage.getItem('reppy_push_synced')) {
      handleSubscribe(true); // Silent subscribe
    }
  }
};

const handleSubscribe = async (silent = false) => {
  if (!authStore.isAuthenticated) return;
  try {
    const success = await subscribeToPush();
    if (success) {
      await updatePushPreferences(false);
      isVisible.value = false;
      localStorage.setItem('reppy_push_asked', 'true');
      localStorage.setItem('reppy_notif_version', NOTIF_VERSION);
      sessionStorage.setItem('reppy_push_synced', 'true');
    }
  } catch (error) {
    const msg = String(error?.message || '').toLowerCase();
    const isBrave = navigator.userAgent.includes('Brave') || navigator.brave;
    const isPushServiceAbort = msg.includes('registration failed - push service error') || msg.includes('aborterror');

    if (isBrave && isPushServiceAbort) {
      notificationStore.notify(
        i18n.locale === 'es'
          ? 'Brave bloqueó el registro Push. Activa "Use Google services for push messaging" en brave://settings/privacy y vuelve a intentar.'
          : 'Brave blocked Push registration. Enable "Use Google services for push messaging" in brave://settings/privacy and try again.',
        'info',
        9000
      );
      if (!silent) isVisible.value = true;
      return;
    }

    if (!silent) {
      console.error('Failed to subscribe:', error);
      isVisible.value = false;
    }
  }
};

const handleDecline = () => {
  isVisible.value = false;
  localStorage.setItem('reppy_push_asked', Date.now());
  localStorage.setItem('reppy_notif_version', NOTIF_VERSION);
};

const handleNever = () => {
  isVisible.value = false;
  localStorage.setItem('reppy_push_asked', 'never');
  localStorage.setItem('reppy_notif_version', NOTIF_VERSION);
  updatePushPreferences(true).catch((error) => {
    console.error('Failed to persist push preference:', error);
  });
};

onMounted(async () => {
  if (!authStore.isAuthenticated) return;

  try {
    const pref = await getPushPreferences();
    if (pref?.push_disabled) {
      localStorage.setItem('reppy_push_asked', 'never');
      localStorage.setItem('reppy_notif_version', NOTIF_VERSION);
      isVisible.value = false;
      return;
    }
  } catch (error) {
    console.warn('[PUSH_PROMPT] Could not fetch push preferences, using local fallback.', error);
  }

  const status = await getPushStatus();
  const lastAsked = localStorage.getItem('reppy_push_asked');
  const lastVersion = localStorage.getItem('reppy_notif_version');
  
  // Force Reset Logic: If version mismatch, clear flags to allow re-prompt or silent re-sync
  if (lastVersion !== NOTIF_VERSION) {
    console.log('[PUSH_PROMPT] Version mismatch. Resetting notification flags.');
    localStorage.removeItem('reppy_push_asked');
    sessionStorage.removeItem('reppy_push_synced');
    // If we already have permission, we'll re-sync silently via checkPermission -> handleSubscribe
  }

  // If already granted, we always try to sync with backend (silent)
  if (status === 'granted') {
    checkPermission();
    return;
  }

  // If not granted, check if we should show the modal
  const askedDate = parseInt(lastAsked);
  const shouldAsk = lastAsked !== 'never' && (!lastAsked || (!isNaN(askedDate) && Date.now() - askedDate > 3 * 24 * 60 * 60 * 1000));
  
  if (shouldAsk) {
    checkPermission();
  }
});
</script>

<style scoped>
.prompt-fade-enter-active,
.prompt-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.prompt-fade-enter-from,
.prompt-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.text-industrial { font-family: 'Inter Tight', sans-serif; }

/* Pulse for background elements */
@keyframes pulse {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(1.1); }
}

.animate-pulse {
  animation: pulse 4s ease-in-out infinite;
}
</style>
