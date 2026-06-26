<template>
  <Teleport to="body">
    <transition name="potion-modal">
      <div v-if="show && item" class="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
        @click.self="$emit('close')">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

        <div class="relative w-full max-w-sm rounded-t-3xl border border-white/10 bg-surface p-5 shadow-2xl sm:rounded-3xl">
          <!-- Close -->
          <button @click="$emit('close')"
            class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted transition-colors hover:text-foreground">
            <X class="h-4 w-4" />
          </button>

          <!-- Potion icon -->
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border"
            :class="accentClasses.box">
            <FlaskConical class="h-10 w-10" :class="accentClasses.icon" />
          </div>

          <!-- Title + rarity -->
          <h3 class="mt-4 text-center text-lg font-black text-foreground">{{ item.name }}</h3>
          <p v-if="item.rarity" class="mt-0.5 text-center text-[10px] font-black uppercase tracking-[0.25em]"
            :class="rarityColor">{{ item.rarity }}</p>

          <!-- Effect + duration chips -->
          <div class="mt-4 flex items-center justify-center gap-2">
            <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-foreground">
              {{ effectLabel(item) }}
            </span>
            <span v-if="durationLabel(item)" class="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-muted">
              <Clock class="h-3.5 w-3.5" /> {{ durationLabel(item) }}
            </span>
          </div>

          <!-- Description -->
          <p v-if="item.description" class="mt-3 text-center text-xs leading-relaxed text-muted">{{ item.description }}</p>

          <!-- Activate -->
          <button @click="onActivate" :disabled="busy || isPotionTypeActive(item)"
            class="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black uppercase tracking-wide transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            :class="isPotionTypeActive(item)
              ? 'bg-white/10 text-muted'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'">
            <div v-if="busy" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
            <Sparkles v-else class="h-4 w-4" />
            <span>
              {{ isPotionTypeActive(item) ? i18n.t('battle_potion_active') : i18n.t('inv_activate_module') }}
              <template v-if="!isPotionTypeActive(item)">(x{{ item.quantity || 1 }})</template>
            </span>
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { X, FlaskConical, Clock, Sparkles } from 'lucide-vue-next';
import { useI18nStore } from '@/stores/i18n';
import { usePotions } from '@/composables/usePotions';

const props = defineProps({
  item: { type: Object, default: null },
  show: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'activated']);

const i18n = useI18nStore();
const { isPotionTypeActive, effectLabel, durationLabel, accent, activate } = usePotions();
const busy = ref(false);

const accentClasses = computed(() => {
  const a = props.item ? accent(props.item) : 'stat';
  if (a === 'damage') return { box: 'border-rose-500/30 bg-rose-500/10', icon: 'text-rose-400' };
  if (a === 'crit') return { box: 'border-cyan-500/30 bg-cyan-500/10', icon: 'text-cyan-300' };
  return { box: 'border-emerald-500/30 bg-emerald-500/10', icon: 'text-emerald-300' };
});

const rarityColor = computed(() => {
  const map = {
    common: 'text-zinc-400',
    rare: 'text-blue-400',
    especial: 'text-fuchsia-400',
    legendary: 'text-amber-400',
    calistenico: 'text-cyan-300',
  };
  return map[props.item?.rarity] || 'text-zinc-400';
});

const onActivate = async () => {
  if (busy.value || !props.item) return;
  busy.value = true;
  const ok = await activate(props.item);
  busy.value = false;
  if (ok) {
    emit('activated');
    emit('close');
  }
};
</script>

<style scoped>
.h-13 { height: 3.25rem; }
.potion-modal-enter-active, .potion-modal-leave-active { transition: opacity 0.2s ease; }
.potion-modal-enter-from, .potion-modal-leave-to { opacity: 0; }
</style>
