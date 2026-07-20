<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | quiet | danger
  disabled: { type: Boolean, default: false },
  // Un disabled debe explicar por qué (p. ej. "REQUIERE NV. 12")
  disabledReason: { type: String, default: '' },
})
</script>

<template>
  <button
    class="os-command"
    :class="{
      'os-command--secondary': variant === 'secondary',
      'os-command--quiet': variant === 'quiet',
      'os-command--danger': variant === 'danger',
    }"
    :disabled="disabled"
  >
    <template v-if="disabled && disabledReason">{{ disabledReason }}</template>
    <slot v-else />
  </button>
</template>
