<template>
  <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in-0 duration-200">
    <div class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-deep-abyss/95 p-6 shadow-[0_0_50px_rgba(255,69,0,0.2)] backdrop-blur-xl flex flex-col max-h-[85vh] z-10">
      
      <!-- Close Button -->
      <button @click="close" class="absolute top-4 right-4 text-muted hover:text-foreground transition active:scale-95 z-30">
        <X class="w-5 h-5" />
      </button>

      <div class="flex items-center gap-3 mb-4">
        <div class="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
          <Star class="w-6 h-6 fill-amber-500" />
        </div>
        <div>
          <h3 class="text-xl font-black text-foreground uppercase tracking-tight">Editar Favoritos</h3>
          <p class="text-[10px] font-bold text-muted/80 tracking-wide mt-0.5">
            Elige hasta 6 ejercicios para tu acceso rápido. {{ selectedCount }}/6 seleccionados.
          </p>
        </div>
      </div>

      <!-- Loading/Error -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-3 min-h-[250px]">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
        <p class="text-xs font-black uppercase tracking-wider text-muted/60">Cargando catálogo...</p>
      </div>

      <!-- Catalogue Selection List -->
      <div v-else class="flex flex-col flex-1 gap-2 overflow-y-auto pr-1">
        <div 
          v-for="ex in exercises" 
          :key="ex.slug" 
          @click="toggleFavorite(ex.slug)"
          class="flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none"
          :class="isFavorite(ex.slug) 
            ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15' 
            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'"
        >
          <div class="min-w-0">
            <h4 class="text-sm font-black text-foreground uppercase tracking-wide leading-tight">
              {{ ex.title_key?.startsWith('ex_') ? i18n.t(ex.title_key) : ex.title_key }}
            </h4>
            <p class="text-[9px] font-bold text-muted mt-0.5">
              {{ ex.description_key }}
            </p>
          </div>
          <div class="shrink-0">
            <div 
              class="w-5 h-5 rounded-full border flex items-center justify-center transition active:scale-95"
              :class="isFavorite(ex.slug)
                ? 'border-amber-500 bg-amber-500 text-deep-abyss'
                : 'border-white/20 bg-white/5'"
            >
              <Check v-if="isFavorite(ex.slug)" class="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        </div>

        <!-- New Custom Exercise Form/Btn -->
        <div class="mt-4 p-3 border border-dashed border-white/20 bg-white/[0.01] rounded-xl flex flex-col gap-3">
          <h5 class="text-xs font-black uppercase tracking-wide text-foreground flex items-center justify-between">
            <span>Crear Ejercicio Personalizado</span>
            <button
              v-if="!showForm"
              @click="showForm = !showForm"
              class="text-[10px] bg-primary-500/20 text-primary-500 border border-primary-500/30 px-2 py-1 rounded-lg font-black uppercase tracking-widest transition active:scale-95"
            >
              Nuevo
            </button>
          </h5>
          <div v-if="showForm" class="space-y-3">
            <div>
              <label class="text-[9px] font-black text-muted uppercase tracking-wider block mb-1">Nombre</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Ej. Pullups"
                class="w-full bg-deep-abyss border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary-500"
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[9px] font-black text-muted uppercase tracking-wider block mb-1">Unidad</label>
                <select
                  v-model="form.unit"
                  class="w-full bg-deep-abyss border border-white/10 rounded-xl px-2 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary-500"
                >
                  <option value="reps">Reps</option>
                  <option value="seconds">Segundos (seconds)</option>
                </select>
              </div>
              <div>
                <label class="text-[9px] font-black text-muted uppercase tracking-wider block mb-1">Dificultad</label>
                <select
                  v-model.number="form.difficulty_multiplier"
                  class="w-full bg-deep-abyss border border-white/10 rounded-xl px-2 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary-500"
                >
                  <option :value="0.75">Fácil </option>
                  <option :value="1">Medio </option>
                  <option :value="1.5">Difícil </option>
                </select>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="showForm = false"
                class="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                @click="createExercise"
                class="flex-1 btn-reppy !py-2 text-[10px]"
                :disabled="creating"
              >
                <Loader2 v-if="creating" class="w-3.5 h-3.5 animate-spin text-white" />
                <span v-else>Crear</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-5 shrink-0 flex items-center gap-3">
        <button @click="close" class="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-foreground transition active:scale-95">
          Cancelar
        </button>
        <button @click="save" :disabled="saving" class="flex-1 btn-reppy !py-3 flex items-center justify-center gap-2">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin text-white" />
          <span v-else>Guardar Favoritos</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { X, Star, Loader2, Check } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';

const props = defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'saved']);

const authStore = useAuthStore();
const i18n = useI18nStore();

const exercises = ref([]);
const favorites = ref([]);
const loading = ref(false);
const saving = ref(false);

const showForm = ref(false);
const creating = ref(false);
const form = ref({
  title: '',
  unit: 'reps',
  difficulty_multiplier: 1,
  coin_multiplier: 1
});

const createExercise = async () => {
  if (!form.value.title || !form.value.unit) return;
  creating.value = true;
  try {
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(form.value)
    });
    if (res.ok) {
      const newEx = await res.json();
      exercises.value.push(newEx);
      form.value = { title: '', unit: 'reps', difficulty_multiplier: 1, coin_multiplier: 1 };
      showForm.value = false;
    }
  } catch (error) {
    console.error('Error creating exercise:', error);
  } finally {
    creating.value = false;
  }
};

const selectedCount = computed(() => favorites.value.length);

const isFavorite = (slug) => favorites.value.includes(slug);

const toggleFavorite = (slug) => {
  if (favorites.value.includes(slug)) {
    favorites.value = favorites.value.filter(s => s !== slug);
  } else {
    if (favorites.value.length >= 6) return;
    favorites.value.push(slug);
  }
};

const close = () => {
  emit('close');
};

const loadCatalogueAndFavorites = async () => {
  if (!props.isOpen) return;
  loading.value = true;
  try {
    const [exRes, favRes] = await Promise.all([
      fetch('/api/exercises', { headers: { 'Authorization': `Bearer ${authStore.token}` } }),
      fetch('/api/exercises/favorites', { headers: { 'Authorization': `Bearer ${authStore.token}` } })
    ]);
    if (exRes.ok) {
      exercises.value = await exRes.json();
    }
    if (favRes.ok) {
      const favData = await favRes.json();
      favorites.value = favData.map(f => f.slug);
    }
  } catch (error) {
    console.error('Error loading catalogue and favorites:', error);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  saving.value = true;
  try {
    const res = await fetch('/api/exercises/favorites', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ slugs: favorites.value })
    });
    if (res.ok) {
      emit('saved');
      close();
    }
  } catch (error) {
    console.error('Error saving favorites:', error);
  } finally {
    saving.value = false;
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadCatalogueAndFavorites();
  }
});
</script>

<style scoped>
.bg-deep-abyss\/95 {
  background-color: rgba(5, 5, 10, 0.95);
}
</style>
