<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      @click.self="close">
      <div class="w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#1a120b] to-[#0b0705] text-center shadow-2xl">
        <div class="px-6 py-6">
          <div class="mb-2 text-5xl">👑</div>
          <h3 class="bg-gradient-to-b from-amber-200 to-orange-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent">
            {{ i18n.t('prestige_title') }}
          </h3>
          <p class="mt-2 text-sm text-white/60">{{ i18n.t('prestige_desc') }}</p>

          <div class="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left">
            <p class="text-[12px] text-white/70">🔺 {{ i18n.t('prestige_effect_hp') }}</p>
            <p class="mt-1 text-[12px] text-white/70">💰 {{ i18n.t('prestige_effect_rewards') }}</p>
            <p class="mt-1 text-[12px] text-white/70">📖 {{ i18n.t('prestige_effect_codex') }}</p>
          </div>

          <button type="button" @click="onPrestige" :disabled="busy"
            class="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 font-black uppercase tracking-wide text-white transition-all active:scale-95 disabled:opacity-50">
            {{ i18n.t('prestige_cta') }}
          </button>
          <button type="button" @click="close" class="mt-2 w-full py-1.5 text-xs font-bold text-white/40 hover:text-white/70">
            {{ i18n.t('prestige_later') }}
          </button>
        </div>
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
const emit = defineEmits(['prestiged']);

function openModal() { open.value = true; }
function close() { open.value = false; }

async function onPrestige() {
  busy.value = true;
  const { ok, body } = await campaign.prestige();
  busy.value = false;
  if (ok) {
    notify.notify(`${i18n.t('prestige_done')} ${body.prestige_level}`, 'success');
    open.value = false;
    emit('prestiged', body.prestige_level);
  } else {
    notify.notify(body.message || 'Error', 'error');
  }
}

defineExpose({ openModal });
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
