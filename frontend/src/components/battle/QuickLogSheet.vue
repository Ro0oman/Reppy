<template>
  <Teleport to="body">
    <transition name="sheet">
      <div v-if="show" class="fixed inset-0 z-[190] flex items-end justify-center" @click.self="$emit('close')">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <div class="relative w-full max-w-md rounded-t-3xl border border-white/10 bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
          <div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/15"></div>

          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-black uppercase tracking-wide text-foreground">{{ i18n.t('quicklog_title') }}</h3>
            <button @click="$emit('close')" class="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted hover:text-foreground">
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Exercise picker -->
          <div class="grid grid-cols-4 gap-1.5">
            <button v-for="ex in exercises" :key="ex.id" @click="exerciseType = ex.id"
              class="flex flex-col items-center gap-1 rounded-xl border py-2 transition-all active:scale-95"
              :class="exerciseType === ex.id
                ? 'border-primary-500/50 bg-primary-500/15 text-primary-400'
                : 'border-border bg-foreground/[0.04] text-muted'">
              <component :is="ex.icon" class="h-4 w-4" />
              <span class="text-[9px] font-bold leading-tight">{{ ex.label }}</span>
            </button>
          </div>

          <!-- Quantity -->
          <div class="mt-4 grid items-center gap-2" style="grid-template-columns: 3.25rem 1fr 3.25rem">
            <button @click="quantity = Math.max(1, normalized - 1)"
              class="flex h-13 items-center justify-center rounded-2xl border border-border bg-foreground/[0.06] text-foreground active:scale-95">
              <Minus class="h-5 w-5" />
            </button>
            <input v-model.number="quantity" type="number" min="1" inputmode="numeric"
              class="h-13 w-full min-w-0 rounded-2xl border border-border bg-foreground/[0.03] text-center text-3xl font-black text-foreground focus:border-primary-500/50 focus:outline-none" />
            <button @click="quantity = normalized + 1"
              class="flex h-13 items-center justify-center rounded-2xl border border-primary-500/40 bg-primary-500/10 text-primary-500 active:scale-95">
              <Plus class="h-5 w-5" />
            </button>
          </div>

          <div class="mt-3 grid grid-cols-4 gap-2">
            <button v-for="q in [5,10,20,50]" :key="q" @click="quantity = normalized + q"
              class="h-10 rounded-xl border border-border bg-foreground/[0.04] text-sm font-bold text-foreground/80 active:scale-95">+{{ q }}</button>
          </div>

          <button @click="onLog" :disabled="loading"
            class="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-primary-500/25 active:scale-[0.98] disabled:opacity-50">
            <div v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
            <Check v-else class="h-4 w-4" />
            <span>{{ i18n.t('battle_train_cta') }} · {{ normalized }}</span>
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { X, Plus, Minus, Check, Dumbbell, Flame, Target, Zap } from 'lucide-vue-next';
import { useI18nStore } from '@/stores/i18n';
import { useRepLogger } from '@/composables/useRepLogger';
import { useBossStore } from '@/stores/boss';

const props = defineProps({ show: { type: Boolean, default: false } });
const emit = defineEmits(['close', 'logged']);

const i18n = useI18nStore();
const bossStore = useBossStore();
const { loading, logReps } = useRepLogger();
const isEs = computed(() => i18n.locale !== 'en');

const LAST_KEY = 'reppy_last_exercise';
const exerciseType = ref(localStorage.getItem(LAST_KEY) || 'pullups');
const quantity = ref(10);

const exercises = computed(() => [
  { id: 'pullups', icon: Dumbbell, label: isEs.value ? 'Dominadas' : 'Pull-ups' },
  { id: 'pushups', icon: Flame, label: isEs.value ? 'Flexiones' : 'Push-ups' },
  { id: 'dips', icon: Target, label: isEs.value ? 'Fondos' : 'Dips' },
  { id: 'muscleups', icon: Zap, label: 'Muscle Ups' },
]);

const normalized = computed(() => Math.max(1, Math.floor(Number(quantity.value) || 0)));

watch(exerciseType, (v) => { try { localStorage.setItem(LAST_KEY, v); } catch (_) {} });

const onLog = async () => {
  const res = await logReps({ count: normalized.value, exerciseType: exerciseType.value });
  if (res) {
    bossStore.fetchActiveBoss(true);
    emit('logged');
    emit('close');
  }
};
</script>

<style scoped>
.h-13 { height: 3.25rem; }
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.2s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type='number'] { -moz-appearance: textfield; appearance: textfield; }
</style>
