<template>
  <span
    v-if="show"
    class="inline-flex items-center gap-1 align-middle"
    :class="dotOnly
      ? ''
      : 'rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm shadow-rose-500/40'"
  >
    <span v-if="dotOnly" class="relative flex h-2.5 w-2.5">
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-70"></span>
      <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-background"></span>
    </span>
    <template v-else>
      <span class="relative flex h-1.5 w-1.5">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-75"></span>
        <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-white"></span>
      </span>
      {{ label || i18n.t('badge_new') }}
    </template>
  </span>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useFeatureSeenStore } from '@/stores/featureSeen';
import { useI18nStore } from '@/stores/i18n';

const props = defineProps({
  // Feature key tracked in DB. If omitted, `forceShow` controls visibility.
  featureKey: { type: String, default: '' },
  // Render only the pulsing dot (no "NEW" pill).
  dotOnly: { type: Boolean, default: false },
  // Override label text.
  label: { type: String, default: '' },
  // Bypass the feature-seen store (e.g. for count-based dots).
  forceShow: { type: Boolean, default: null },
  // Mark the feature seen as soon as the badge mounts (use when merely viewing counts).
  markOnMount: { type: Boolean, default: false },
});

const featureSeen = useFeatureSeenStore();
const i18n = useI18nStore();

const show = computed(() => {
  if (props.forceShow !== null) return props.forceShow;
  if (!props.featureKey) return false;
  return featureSeen.isNew(props.featureKey);
});

onMounted(() => {
  // Ensure seen-state is loaded so the badge resolves correctly anywhere it's used.
  if (props.forceShow === null) featureSeen.load();
  if (props.markOnMount && props.featureKey) {
    featureSeen.markSeen(props.featureKey);
  }
});
</script>
