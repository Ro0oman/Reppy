<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      @click.self="close">
      <div class="w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/10 bg-[#0b0705] shadow-2xl sm:rounded-3xl">
        <div class="border-b border-white/5 px-4 py-3 text-center">
          <h3 class="text-lg font-black uppercase tracking-wide text-white">{{ i18n.t('path_choice_title') }}</h3>
          <p class="mt-0.5 text-[12px] text-white/50">{{ i18n.t('path_choice_warning') }}</p>
        </div>

        <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          <!-- Light -->
          <button type="button" :disabled="busy" @click="choose('light')"
            class="group rounded-2xl border border-cyan-400/25 bg-gradient-to-b from-cyan-900/30 to-black/30 p-4 text-left transition-all active:scale-[0.98] hover:border-cyan-300/50 disabled:opacity-50">
            <div class="mb-1 text-3xl">🕊️</div>
            <p class="text-base font-black text-cyan-200">{{ i18n.t('campaign_path_light') }}</p>
            <p class="mt-1 text-[12px] leading-snug text-white/55">{{ i18n.t('path_light_desc') }}</p>
          </button>

          <!-- Dark -->
          <button type="button" :disabled="busy" @click="choose('dark')"
            class="group rounded-2xl border border-rose-500/25 bg-gradient-to-b from-rose-950/40 to-black/30 p-4 text-left transition-all active:scale-[0.98] hover:border-rose-400/50 disabled:opacity-50">
            <div class="mb-1 text-3xl">😈</div>
            <p class="text-base font-black text-rose-300">{{ i18n.t('campaign_path_dark') }}</p>
            <p class="mt-1 text-[12px] leading-snug text-white/55">{{ i18n.t('path_dark_desc') }}</p>
          </button>
        </div>

        <button type="button" @click="close" class="w-full border-t border-white/5 py-3 text-xs font-bold text-white/40 hover:text-white/70">
          {{ i18n.t('path_decide_later') }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
import { useCampaignStore } from '@/stores/campaign';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';

const campaign = useCampaignStore();
const i18n = useI18nStore();
const notify = useNotificationStore();

const open = ref(false);
const busy = ref(false);
const emit = defineEmits(['chosen']);

function openModal() { open.value = true; }
function close() { open.value = false; }

async function choose(path) {
  busy.value = true;
  const { ok, body } = await campaign.choosePath(path);
  busy.value = false;
  if (ok) {
    notify.notify(i18n.t(path === 'light' ? 'path_chose_light' : 'path_chose_dark'), 'success');
    open.value = false;
    emit('chosen', path);
  } else {
    notify.notify(body.message || i18n.t('campaign_engage_error'), 'error');
  }
}

defineExpose({ openModal });
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
