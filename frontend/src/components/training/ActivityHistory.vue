<template>
  <section class="rounded-2xl border border-border bg-foreground/[0.02] overflow-hidden">
    <header class="px-4 pt-4 pb-3 sm:px-5">
      <h3 class="text-sm font-semibold text-foreground">{{ i18n.t('hist_title') }}</h3>
      <p class="mt-1 text-xs text-muted/80 leading-relaxed">{{ i18n.t('hist_hint') }}</p>
    </header>

    <div v-if="loading" class="px-4 pb-6 space-y-2" aria-hidden="true">
      <div v-for="n in 3" :key="n" class="h-12 rounded-xl bg-foreground/10 animate-pulse"></div>
    </div>

    <ul v-else-if="reps.length" class="divide-y divide-border/40 border-t border-border/40">
      <li
        v-for="rep in visible"
        :key="rep.id"
        class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 hover:bg-foreground/[0.02] transition-colors"
      >
        <div class="min-w-0">
          <p class="text-sm font-semibold text-foreground tabular-nums">
            {{ rep.count }} {{ i18n.t('ui_reps') }}
            <span class="font-normal text-muted/80">· {{ exerciseLabel(rep.exercise_type) }}</span>
          </p>
          <p class="text-xs text-muted/80 mt-0.5">{{ formatDate(rep.date) }}</p>
        </div>

        <div v-if="editingId === rep.id" class="flex items-center gap-2 shrink-0">
          <input
            v-model.number="editValue"
            type="number"
            min="0"
            :aria-label="i18n.t('hist_edit_label')"
            class="w-20 min-h-[44px] bg-surface/60 border border-primary-500/40 rounded-lg px-2 text-right font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            @keyup.enter="saveEdit(rep.id)"
          />
          <button
            type="button"
            @click="saveEdit(rep.id)"
            class="grid place-items-center h-11 w-11 rounded-lg bg-primary-500/15 text-primary-500 active:scale-95 transition-transform"
            :aria-label="i18n.t('dash_save')"
          ><Check aria-hidden="true" class="w-4 h-4" /></button>
        </div>
        <div v-else class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            @click="startEdit(rep)"
            class="grid place-items-center h-11 w-11 rounded-lg text-muted/70 hover:text-primary-500 hover:bg-foreground/[0.04] active:scale-95 transition-colors"
            :aria-label="i18n.t('dash_edit_entry')"
          ><Pencil aria-hidden="true" class="w-4 h-4" /></button>
          <button
            type="button"
            @click="confirmDelete(rep.id)"
            class="grid place-items-center h-11 w-11 rounded-lg text-muted/70 hover:text-red-500 hover:bg-foreground/[0.04] active:scale-95 transition-colors"
            :aria-label="i18n.t('dash_delete_entry')"
          ><Trash2 aria-hidden="true" class="w-4 h-4" /></button>
        </div>
      </li>
      <li v-if="reps.length > shown" class="px-4 py-3 sm:px-5">
        <button type="button" @click="shown += PAGE" class="min-h-[44px] text-sm font-semibold text-primary-500 hover:underline">
          {{ i18n.t('hist_show_more', { n: reps.length - shown }) }}
        </button>
      </li>
    </ul>

    <div v-else class="py-12 px-6 text-center border-t border-border/40">
      <Inbox aria-hidden="true" class="w-10 h-10 mx-auto mb-3 text-muted/30" />
      <p class="text-sm font-semibold text-foreground">{{ i18n.t('dash_history_empty_title') }}</p>
      <p class="text-xs text-muted/80 mt-1 max-w-[260px] mx-auto">{{ i18n.t('dash_history_empty_desc') }}</p>
      <router-link
        :to="{ name: 'dashboard', params: { lang: i18n.locale } }"
        class="mt-4 inline-flex items-center min-h-[44px] rounded-xl bg-primary-500 hover:bg-primary-400 px-4 text-sm font-semibold text-white active:scale-95 transition-all"
      >
        {{ i18n.t('dash_log_reps_cta') }}
      </router-link>
    </div>
  </section>
</template>

<script setup>
// Historial de entradas: cada fila es el TOTAL de un ejercicio en un día (el modelo
// de datos no guarda series sueltas), así que «deshacer» es corregir ese total o
// borrarlo. Antes vivía en el panel; aquí solo se muestra en el perfil propio.
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { Check, Inbox, Pencil, Trash2 } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';

const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const PAGE = 20;
const reps = ref([]);
const loading = ref(true);
const shown = ref(PAGE);
const editingId = ref(null);
const editValue = ref(0);
const deleting = ref(new Set());

const visible = computed(() => reps.value.slice(0, shown.value));

const exerciseLabel = (type) => {
  const label = i18n.t(type);
  return label === type ? String(type || '').replace(/_/g, ' ') : label;
};

const formatDate = (dateStr) => {
  // '/' en vez de '-' para que un YYYY-MM-DD se interprete en hora local.
  const normalized = typeof dateStr === 'string' ? dateStr.replace(/-/g, '/') : dateStr;
  return new Date(normalized).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const load = async () => {
  try {
    const res = await axios.get('/api/reps', { params: { type: 'all', t: Date.now() } });
    reps.value = res.data;
  } catch (error) {
    console.error('Error loading history:', error);
  } finally {
    loading.value = false;
  }
};

// Tras corregir o borrar, se refresca la lista y el perfil global (totales, racha).
const refresh = async () => {
  await load();
  authStore.fetchProfile(true).catch(() => {});
};

const startEdit = (rep) => {
  editingId.value = rep.id;
  editValue.value = rep.count;
};

const saveEdit = async (id) => {
  try {
    await axios.put(`/api/reps/${id}`, { count: editValue.value });
    editingId.value = null;
    notificationStore.notify(i18n.t('dash_entry_updated'), 'success');
    await refresh();
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || i18n.t('dash_update_failed'), 'error');
  }
};

const confirmDelete = (id) => {
  if (deleting.value.has(id)) return;
  notificationStore.confirm(
    i18n.t('dash_delete_title'),
    i18n.t('dash_delete_confirm'),
    async () => {
      try {
        deleting.value.add(id);
        await axios.delete(`/api/reps/${id}`);
        notificationStore.notify(i18n.t('dash_entry_deleted'), 'success');
        await refresh();
      } catch (error) {
        if (error?.response?.status === 404) {
          reps.value = reps.value.filter(r => r.id !== id);
          notificationStore.notify(i18n.t('dash_entry_already_removed'), 'info');
          return;
        }
        notificationStore.notify(i18n.t('dash_delete_failed'), 'error');
      } finally {
        deleting.value.delete(id);
      }
    }
  );
};

onMounted(load);
</script>
