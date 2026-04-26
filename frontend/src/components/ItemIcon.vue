<template>
  <div :class="className" class="flex items-center justify-center">
    <!-- DARK SOULS THEME -->
    <svg v-if="name === 'ds_sword'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full">
      <path d="M14.5 17.5L3 6V3H6L17.5 14.5M14.5 17.5L13 19L11 17L12.5 15.5M14.5 17.5L19 13L17.5 11.5L13 16" />
      <path d="M13 19L15 21L18 18L16 16" />
    </svg>
    <svg v-else-if="name === 'ds_helmet'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full">
      <path d="M12 1L4.5 5v5.5C4.5 16.5 7.5 21 12 23c4.5-2 7.5-6.5 7.5-12.5V5L12 1zm0 2.1l6 3.6v4.8c0 4.8-2.3 8.3-6 10-3.7-1.7-6-5.2-6-10V6.7l6-3.6z" />
      <path d="M9 10h6v1H9zM10 13h4v1h-4zM12 2v2" />
    </svg>

    <!-- MINECRAFT THEME -->
    <svg v-else-if="name === 'mc_pickaxe'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full">
      <path d="M14.5 9.5L21 3M14.5 9.5L13 11L11 9L12.5 7.5M14.5 9.5L16 8M3 21L9.5 14.5M9.5 14.5L11 13L13 15L11.5 16.5M9.5 14.5L8 16" />
      <path d="M18 6L21 3L18 0M6 18L3 21L0 18" />
    </svg>
    <svg v-else-if="name === 'mc_sword'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full">
      <rect x="10" y="2" width="4" height="14" rx="1" />
      <rect x="6" y="14" width="12" height="2" rx="1" />
      <rect x="11" y="16" width="2" height="6" rx="1" />
    </svg>

    <!-- GOD OF WAR THEME -->
    <svg v-else-if="name === 'gow_axe'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full">
      <path d="M12 3V21M12 3C12 3 18 5 18 10C18 15 12 17 12 17M12 3C12 3 6 5 6 10C6 15 12 17 12 17" />
      <path d="M9 7H15M9 13H15" />
    </svg>

    <!-- MORTAL KOMBAT THEME -->
    <svg v-else-if="name === 'mk_dragon'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" />
      <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 12 16 12 16C12 16 16 12.21 16 10C16 7.79 14.21 6 12 6Z" />
    </svg>

    <!-- FALLBACKS BY TYPE -->
    <svg v-if="type === 'head'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full">
      <path d="M12 1L4.5 5v5.5C4.5 16.5 7.5 21 12 23c4.5-2 7.5-6.5 7.5-12.5V5L12 1zm0 2.1l6 3.6v4.8c0 4.8-2.3 8.3-6 10-3.7-1.7-6-5.2-6-10V6.7l6-3.6z" />
      <path d="M9 10h6v1H9zM10 13h4v1h-4zM12 2v2" />
    </svg>
    <svg v-else-if="type === 'armor'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full">
      <path d="M20 10C20 10 19 3 12 3C5 3 4 10 4 10C4 10 3 18 5 21H19C21 18 20 10 20 10Z" />
      <path d="M12 3v18M4 10h16M8 3v3M16 3v3M8 21v-3h8v3" />
    </svg>
    <svg v-else-if="type === 'boots'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-full h-full">
      <path d="M4 16L6 10L10 3h4l4 7l2 6l-2 5H6l-2-5z" />
      <path d="M6 10h12M10 3v7M14 3v7M4 16h16M7 21l-2 2h14l-2-2" />
    </svg>
    <component v-else :is="fallbackComponent" class="w-full h-full" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Sword, Shield, Construction, Footprints, LayoutGrid, Sparkles, FlaskConical } from 'lucide-vue-next';

const props = defineProps({
  name: { type: String, default: '' },
  type: { type: String, default: 'weapon' },
  className: { type: String, default: 'w-6 h-6' }
});

const fallbackComponent = computed(() => {
  switch (props.type) {
    case 'head': return Construction;
    case 'weapon': return Sword;
    case 'armor': return Shield;
    case 'boots': return Footprints;
    case 'consumable': return FlaskConical;
    case 'bundle': return LayoutGrid;
    default: return Sparkles;
  }
});
</script>

<style scoped>
svg {
  display: block;
}
</style>
