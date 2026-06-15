<template>
  <div
    class="group relative flex h-full flex-col rounded-2xl border p-4 text-left transition active:scale-[0.99]"
    :class="[
      selected ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25',
      selectable ? 'cursor-pointer' : '',
    ]"
    @click="selectable ? $emit('select', plan) : null"
  >
    <div class="flex items-start justify-between gap-2">
      <p class="text-sm font-black leading-tight text-foreground">{{ title }}</p>
      <span
        v-if="active"
        class="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400"
      >
        {{ i18n.locale === 'es' ? 'Activo' : 'Active' }}
      </span>
      <span
        v-else-if="plan.isCustom"
        class="shrink-0 rounded-full border border-primary-500/30 bg-primary-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary-500"
      >
        {{ i18n.locale === 'es' ? 'Propia' : 'Custom' }}
      </span>
    </div>

    <p v-if="description" class="mt-2 line-clamp-3 text-xs font-semibold leading-relaxed text-muted/70">
      {{ description }}
    </p>

    <div class="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-500">
      <span class="inline-flex items-center gap-1">
        <Dumbbell v-if="plan.isCustom" class="h-3 w-3" />
        <CalendarDays v-else class="h-3 w-3" />
        {{ plan.isCustom
          ? (i18n.locale === 'es' ? 'Rutina' : 'Routine')
          : `${plan.durationDays} ${i18n.locale === 'es' ? 'misiones' : 'missions'}` }}
      </span>
      <span v-if="plan.difficulty" class="rounded-full border border-white/10 px-2 py-0.5 text-muted">
        {{ plan.difficulty }}
      </span>
    </div>

    <div v-if="$slots.actions" class="mt-4 flex items-center gap-2" @click.stop>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { CalendarDays, Dumbbell } from 'lucide-vue-next';
import { useI18nStore } from '@/stores/i18n';

const props = defineProps({
  plan: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
});

defineEmits(['select']);

const i18n = useI18nStore();

// Custom plans store literal text in titleKey/descriptionKey; i18n.t falls back to
// the raw string when the key is unknown, so this works for both kinds of plan.
const title = computed(() => i18n.t(props.plan.titleKey));
const description = computed(() => (props.plan.descriptionKey ? i18n.t(props.plan.descriptionKey) : ''));
</script>
