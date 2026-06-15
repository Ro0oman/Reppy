<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-left text-sm font-bold text-foreground transition hover:border-white/25 focus:border-primary-500/60 focus:outline-none"
      :class="open ? 'border-primary-500/60' : ''"
      @click="toggle"
    >
      <span :class="selectedLabel ? '' : 'text-muted/60'">{{ selectedLabel || placeholder }}</span>
      <ChevronDown class="h-4 w-4 shrink-0 text-muted transition-transform" :class="open ? 'rotate-180' : ''" />
    </button>

    <transition name="ds-fade">
      <div
        v-if="open"
        class="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-deep-abyss/98 p-1 shadow-2xl backdrop-blur-xl"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition"
          :class="opt.value === modelValue
            ? 'bg-primary-500/15 text-primary-400'
            : 'text-foreground/90 hover:bg-white/[0.06]'"
          @click="select(opt.value)"
        >
          <span class="truncate">{{ opt.label }}</span>
          <Check v-if="opt.value === modelValue" class="h-3.5 w-3.5 shrink-0" />
        </button>
        <p v-if="!options.length" class="px-3 py-2 text-xs font-semibold text-muted/60">{{ emptyLabel }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Check, ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: [String, Number, null], default: '' },
  options: { type: Array, default: () => [] }, // [{ value, label }]
  placeholder: { type: String, default: '' },
  emptyLabel: { type: String, default: '—' },
});

const emit = defineEmits(['update:modelValue']);

const root = ref(null);
const open = ref(false);

const selectedLabel = computed(() => props.options.find(o => o.value === props.modelValue)?.label || '');

const toggle = () => { open.value = !open.value; };
const select = (value) => {
  emit('update:modelValue', value);
  open.value = false;
};

const onClickOutside = (e) => {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false;
};

onMounted(() => document.addEventListener('click', onClickOutside, true));
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside, true));
</script>

<style scoped>
.ds-fade-enter-active,
.ds-fade-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.ds-fade-enter-from,
.ds-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
