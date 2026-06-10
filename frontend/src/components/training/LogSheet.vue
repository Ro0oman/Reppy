<template>
  <Teleport to="body">
    <Transition name="logsheet">
      <div
        v-if="open"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
        role="dialog"
        aria-modal="true"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60" @click="$emit('close')" />

        <!-- Sheet -->
        <div class="logsheet-panel relative z-10 w-full sm:max-w-md bg-surface border-t sm:border border-border rounded-t-3xl sm:rounded-2xl px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-5">
          <!-- Grabber + close -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex-1 flex justify-center sm:hidden">
              <span class="h-1 w-10 rounded-full bg-foreground/15"></span>
            </div>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-xl text-muted hover:text-foreground hover:bg-foreground/[0.06] transition-colors sm:ml-auto"
              :aria-label="i18n.t('dash_close') || 'Close'"
              @click="$emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <RepsInput :exercise-type="exerciseType" @updated="handleUpdated" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue';
import { X } from 'lucide-vue-next';
import { useI18nStore } from '@/stores/i18n';
import RepsInput from '@/components/training/RepsInput.vue';

const i18n = useI18nStore();
const props = defineProps({
  open: { type: Boolean, default: false },
  exerciseType: { type: String, default: 'pullups' },
});
const emit = defineEmits(['close', 'updated']);

// Lock body scroll while the sheet is open.
watch(() => props.open, (isOpen) => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = isOpen ? 'hidden' : '';
}, { immediate: true });

const handleUpdated = () => {
  emit('updated');
  emit('close');
};
</script>

<style scoped>
.logsheet-enter-active,
.logsheet-leave-active { transition: opacity 0.25s ease; }
.logsheet-enter-from,
.logsheet-leave-to { opacity: 0; }
.logsheet-enter-active .logsheet-panel,
.logsheet-leave-active .logsheet-panel { transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
.logsheet-enter-from .logsheet-panel,
.logsheet-leave-to .logsheet-panel { transform: translateY(100%); }
@media (min-width: 640px) {
  .logsheet-enter-from .logsheet-panel,
  .logsheet-leave-to .logsheet-panel { transform: translateY(12px) scale(0.98); }
}
</style>
