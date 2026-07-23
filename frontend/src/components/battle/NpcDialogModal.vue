<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      @click.self="close">
      <div class="w-full max-w-md overflow-hidden rounded-t-3xl border border-amber-500/25 bg-gradient-to-b from-[#1a120b] to-[#0b0705] shadow-2xl sm:rounded-3xl">
        <!-- NPC header -->
        <div class="flex items-center gap-3 border-b border-white/5 px-4 py-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/15 text-2xl">
            {{ factionEmoji }}
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-base font-black text-amber-100">{{ tName(npc?.name) }}</h3>
            <p class="truncate text-[11px] uppercase tracking-widest text-white/35">{{ i18n.t('npc_faction_' + (npc?.faction || 'neutral')) }}</p>
          </div>
          <button type="button" @click="close" class="rounded-full p-1.5 text-white/40 hover:bg-white/5 hover:text-white/70">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Dialogue -->
        <p v-if="npc?.dialogue" class="border-b border-white/5 px-4 py-3 text-sm italic text-white/70">
          “{{ tName(npc.dialogue) }}”
        </p>

        <!-- Quests -->
        <div class="max-h-[55vh] space-y-2 overflow-y-auto px-3 py-3">
          <p v-if="loading" class="py-6 text-center text-sm text-white/40">…</p>
          <p v-else-if="!quests.length" class="py-6 text-center text-sm text-white/40">{{ i18n.t('npc_no_quests') }}</p>

          <div v-for="q in quests" :key="q.id"
            class="rounded-2xl border border-white/8 bg-black/30 p-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm font-bold text-white/90">{{ tName(q.name) }}</p>
                <p class="mt-0.5 text-[12px] leading-snug text-white/50">{{ tName(q.description) }}</p>
              </div>
              <span :class="['shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider', stateClass(q.state)]">
                {{ i18n.t('quest_state_' + q.state) }}
              </span>
            </div>

            <!-- Progress bar for accepted quests -->
            <div v-if="q.state === 'accepted' && q.target > 1" class="mt-2">
              <div class="h-2 w-full overflow-hidden rounded-full bg-black/50">
                <div class="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                  :style="{ width: Math.min(100, Math.round((q.current_value / q.target) * 100)) + '%' }"></div>
              </div>
              <p class="mt-1 text-right text-[10px] tabular-nums text-white/40">{{ q.current_value }} / {{ q.target }}</p>
            </div>

            <!-- Rewards + action -->
            <div class="mt-2 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 text-[11px] font-bold text-white/50">
                <span v-if="q.rewards?.coins">🪙 {{ q.rewards.coins }}</span>
                <span v-if="q.rewards?.gems">💎 {{ q.rewards.gems }}</span>
              </div>
              <button v-if="q.state === 'available'" type="button" @click="onAccept(q)" :disabled="busy"
                class="rounded-lg bg-amber-500/90 px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50">
                {{ i18n.t('quest_accept') }}
              </button>
              <button v-else-if="q.state === 'completed'" type="button" @click="onClaim(q)" :disabled="busy"
                class="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50">
                {{ i18n.t('quest_claim') }}
              </button>
              <span v-else-if="q.state === 'claimed'" class="text-xs font-bold text-emerald-400">✓</span>
              <span v-else-if="q.state === 'locked'" class="text-xs">🔒</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { X } from 'lucide-vue-next';
import { useCampaignStore } from '@/stores/campaign';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';

const campaign = useCampaignStore();
const i18n = useI18nStore();
const notify = useNotificationStore();
const authStore = useAuthStore();

const open = ref(false);
const loading = ref(false);
const busy = ref(false);
const npc = ref(null);
const quests = ref([]);

const tName = (v) => (v && typeof v === 'object') ? (v[i18n.locale] || v.es || v.en || '') : (v || '');

const factionEmoji = computed(() => ({ light: '🕊️', dark: '😈', neutral: '🧙' }[npc.value?.faction] || '🧙'));

const stateClass = (s) => ({
  available: 'bg-amber-500/20 text-amber-300',
  accepted: 'bg-cyan-500/20 text-cyan-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  claimed: 'bg-white/10 text-white/40',
  locked: 'bg-white/5 text-white/30',
  failed: 'bg-rose-500/20 text-rose-300',
}[s] || 'bg-white/10 text-white/40');

async function load(slug) {
  loading.value = true;
  const data = await campaign.fetchNpc(slug);
  npc.value = data?.npc || null;
  quests.value = data?.quests || [];
  loading.value = false;
}

async function openFor(slug) {
  open.value = true;
  npc.value = null;
  quests.value = [];
  await load(slug);
}

function close() { open.value = false; }

async function onAccept(q) {
  busy.value = true;
  const { ok, body } = await campaign.acceptQuest(q.id);
  busy.value = false;
  if (ok) {
    notify.notify(i18n.t('quest_accepted'), 'success');
    if (npc.value) await load(npc.value.slug);
  } else {
    notify.notify(body.message || 'Error', 'error');
  }
}

async function onClaim(q) {
  busy.value = true;
  const { ok, body } = await campaign.claimQuest(q.id);
  busy.value = false;
  if (ok) {
    const parts = [];
    if (body.reward_coins) parts.push(`+${body.reward_coins} 🪙`);
    if (body.reward_gems) parts.push(`+${body.reward_gems} 💎`);
    notify.notify(`${i18n.t('quest_claimed')} ${parts.join('  ')}`.trim(), 'success');
    authStore.fetchProfile();
    if (npc.value) await load(npc.value.slug);
  } else {
    notify.notify(body.message || 'Error', 'error');
  }
}

defineExpose({ openFor });
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
