<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[140] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-background/90 backdrop-blur-md"
      @click.self="closeModal"
    >
      <div class="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-surface/90 shadow-2xl overflow-hidden">
        <div class="relative p-6 sm:p-8">
          <div class="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-primary-500/10 blur-[90px] pointer-events-none"></div>

          <div class="flex items-start justify-between gap-4 relative z-10">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.24em] text-primary-500">
                {{ isEs ? 'Onboarding Express' : 'Express Onboarding' }}
              </p>
              <h3 class="mt-2 text-2xl sm:text-3xl font-black italic tracking-tight text-foreground">
                {{ isEs ? 'Tu primer wow en 60 segundos' : 'Your first wow in 60 seconds' }}
              </h3>
            </div>
            <button
              @click="closeModal"
              class="shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              :aria-label="isEs ? 'Cerrar' : 'Close'"
            >
              <X class="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div class="mt-6 flex items-center gap-2">
            <div
              v-for="n in 3"
              :key="n"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="step >= n - 1 ? 'bg-primary-500 w-16' : 'bg-white/10 w-10'"
            />
          </div>

          <section class="mt-6 min-h-[160px] relative z-10">
            <div v-if="step === 0" class="space-y-3">
              <p class="text-base font-bold text-foreground">
                {{ isEs ? '1) Entrena rapido, sin friccion' : '1) Train fast, zero friction' }}
              </p>
              <p class="text-sm text-muted leading-relaxed">
                {{
                  isEs
                    ? 'Aqui no hay pantallas eternas. Tu foco hoy es una sola accion: registrar reps y ganar progreso real.'
                    : 'No endless screens here. Your only focus today is one action: log reps and earn real progress.'
                }}
              </p>
            </div>

            <div v-else-if="step === 1" class="space-y-3">
              <p class="text-base font-bold text-foreground">
                {{ isEs ? '2) Haz tap en +1, +5 o +10' : '2) Tap +1, +5 or +10' }}
              </p>
              <p class="text-sm text-muted leading-relaxed">
                {{
                  isEs
                    ? 'Cada serie suma experiencia, dano al boss y avance de mision. Veras feedback al instante.'
                    : 'Each set adds experience, boss damage and mission progress. You get instant feedback.'
                }}
              </p>
            </div>

            <div v-else class="space-y-3">
              <p class="text-base font-bold text-foreground">
                {{ isEs ? '3) Completa tu mision de hoy' : '3) Complete your mission today' }}
              </p>
              <p class="text-sm text-muted leading-relaxed">
                {{
                  isEs
                    ? 'Tu objetivo diario esta a la vista. Terminarlo hoy te acerca a racha, monedas y estatus.'
                    : 'Your daily objective is visible. Finishing it today gets you closer to streaks, coins and status.'
                }}
              </p>
            </div>
          </section>

          <div class="mt-6 flex items-center justify-between gap-3 relative z-10">
            <button
              v-if="step > 0"
              @click="step--"
              class="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-wider text-foreground transition-colors"
            >
              {{ isEs ? 'Atras' : 'Back' }}
            </button>
            <div v-else />

            <div class="flex items-center gap-2">
              <button
                @click="closeModal"
                class="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-wider text-muted transition-colors"
              >
                {{ isEs ? 'Saltar' : 'Skip' }}
              </button>
              <button
                v-if="step < 2"
                @click="step++"
                class="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-[11px] font-black uppercase tracking-wider transition-colors"
              >
                {{ isEs ? 'Siguiente' : 'Next' }}
              </button>
              <button
                v-else
                @click="startNow"
                class="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-[11px] font-black uppercase tracking-wider transition-colors"
              >
                {{ isEs ? 'Registrar primeras reps' : 'Log first reps' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  locale: {
    type: String,
    default: 'es',
  },
});

const emit = defineEmits(['close', 'start']);
const step = ref(0);

const isEs = computed(() => props.locale !== 'en');

watch(
  () => props.show,
  (isVisible) => {
    if (isVisible) {
      step.value = 0;
    }
  }
);

const closeModal = () => emit('close');
const startNow = () => emit('start');
</script>
