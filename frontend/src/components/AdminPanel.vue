<template>
  <div class="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
      <div>
        <h1 class="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">
          {{ i18n.t('admin_title_start') }} <span class="text-primary-600">{{ i18n.t('admin_title_end') }}</span>
        </h1>
        <p class="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">{{ i18n.t('admin_subtitle') }}</p>
      </div>
      
      <div class="flex p-1 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 self-start">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          :class="activeTab === tab.id ? 'bg-white dark:bg-zinc-800 text-primary-600 shadow-xl shadow-primary-600/10 border border-primary-600/20' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'">
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- Tab: Cosmetics -->
    <div v-if="activeTab === 'cosmetics'" class="space-y-8">
      <div class="glass p-8 rounded-[2.5rem] border-white/10">
        <div class="space-y-1.5 mb-6">
          <label class="text-[10px] uppercase font-black text-zinc-500 tracking-widest">{{ editingCosmeticId ? i18n.t('admin_edit_cosmetic') : i18n.t('admin_new_cosmetic') }}</label>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-primary-500" />
            {{ editingCosmeticId ? i18n.t('admin_update_cosmetic') : i18n.t('admin_create_cosmetic') }}
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">Nombre</label>
            <input v-model="newCosmetic.name" type="text" class="input-tactical" placeholder="Ej: Aura de Fuego">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">Tipo</label>
            <select v-model="newCosmetic.type" class="select-tactical">
              <option value="title">Título</option>
              <option value="border">Marco</option>
              <option value="background">Fondo</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">Precio (Coins)</label>
            <input v-model.number="newCosmetic.price" type="number" class="input-tactical">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">Rareza</label>
            <select v-model="newCosmetic.rarity" class="select-tactical">
              <option value="common">Común</option>
              <option value="rare">Raro</option>
              <option value="epic">Épico</option>
              <option value="legendary">Legendario</option>
            </select>
          </div>
          <div class="md:col-span-2 space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">Descripción</label>
            <input v-model="newCosmetic.description" type="text" class="input-tactical" placeholder="Descripción breve...">
          </div>
          <div class="md:col-span-3 space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">CSS / Estilo (Clases o código raw)</label>
            <textarea v-model="newCosmetic.css_value" rows="4" class="input-tactical font-mono text-xs" placeholder="Ej: bg-neural-grid  o  body { background: ... }"></textarea>
          </div>
          <div class="flex items-center gap-3 pt-6">
            <input v-model="newCosmetic.is_seasonal" type="checkbox" id="is_seasonal" class="w-5 h-5 rounded border-white/10 bg-white/5 text-primary-600 focus:ring-primary-500/50">
            <label for="is_seasonal" class="text-xs font-bold text-white uppercase tracking-wider cursor-pointer">Objeto de Temporada (Solo Boss)</label>
          </div>
        </div>
        <div class="flex gap-4 mt-8">
          <button @click="createCosmetic" class="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-xl shadow-primary-600/20">
            {{ editingCosmeticId ? i18n.t('admin_update_cosmetic') : i18n.t('admin_save_cosmetic') }}
          </button>
          <button v-if="editingCosmeticId" @click="cancelEditCosmetic" class="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10">
            {{ i18n.t('admin_cancel') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in cosmetics" :key="item.id" class="glass p-6 rounded-3xl border-white/5 group hover:border-primary-500/30 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-full text-zinc-400 border border-white/10">{{ item.type }}</span>
                <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border" :class="getRarityBadgeClass(item.rarity)">{{ item.rarity }}</span>
                <span v-if="item.is_seasonal" class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 rounded-full text-amber-500 border border-amber-500/20">TEMPORAL</span>
              </div>
              <h3 class="text-lg font-bold text-white mt-1">{{ item.name }}</h3>
            </div>
            <div class="flex gap-2">
              <button @click="editCosmetic(item)" class="p-2 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all">
                <Edit2 class="w-4 h-4" />
              </button>
              <button @click="deleteCosmetic(item.id)" class="p-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-500 transition-all">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
          <p class="text-sm text-zinc-500 mb-4">{{ item.description }}</p>
          <div class="flex items-center justify-between">
            <span class="text-amber-500 font-bold">{{ item.price }} 🪙</span>
            <code class="text-[10px] bg-black/40 px-2 py-1 rounded-lg text-zinc-400 border border-white/5">{{ item.css_value }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Bosses -->
    <div v-if="activeTab === 'bosses'" class="space-y-8">
      <div class="glass p-8 rounded-[2.5rem] border-white/10">
        <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target class="w-5 h-5 text-primary-500" />
          {{ i18n.t('admin_new_boss') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">Nombre del Boss</label>
            <input v-model="newBoss.name" type="text" class="input-tactical" placeholder="Ej: Titán del Acero">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">HP Total</label>
            <input v-model.number="newBoss.total_hp" type="number" class="input-tactical">
          </div>
          <div class="md:col-span-2 space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">Descripción / Lore</label>
            <textarea v-model="newBoss.description" rows="2" class="input-tactical" placeholder="Historia del boss..."></textarea>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">Fecha Inicio</label>
            <input v-model="newBoss.start_date" type="datetime-local" class="input-tactical">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">Fecha Fin</label>
            <input v-model="newBoss.end_date" type="datetime-local" class="input-tactical">
          </div>
          <div class="md:col-span-2 space-y-1.5">
            <label class="text-[10px] uppercase font-black text-muted tracking-widest px-1">URL Imagen (.png transparente)</label>
            <input v-model="newBoss.image_url" type="text" class="input-tactical" placeholder="https://...">
          </div>
        </div>
        <button @click="createBoss" class="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl w-full md:w-auto transition-all shadow-xl shadow-indigo-600/20">
          {{ i18n.t('admin_schedule_event') }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div v-for="boss in bosses" :key="boss.id" class="glass p-6 rounded-3xl border-white/5 flex flex-col md:flex-row items-center gap-6">
          <div class="w-24 h-24 bg-black/40 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
            <img v-if="boss.image_url" :src="boss.image_url" :alt="boss.name" class="w-full h-full object-contain">
            <Target v-else class="w-8 h-8 text-zinc-700" />
          </div>
          <div class="flex-1 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h3 class="text-xl font-bold text-white">{{ boss.name }}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest" :class="getBossStatusClass(boss)">{{ getBossStatus(boss) }}</span>
            </div>
            <p class="text-sm text-zinc-400 line-clamp-1 mb-2">{{ boss.description }}</p>
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-[10px] text-zinc-500 font-bold uppercase">
              <span>HP: <span class="text-white">{{ boss.total_hp }}</span></span>
              <span>📅 <span class="text-zinc-400">{{ formatDate(boss.start_date) }}</span> - <span class="text-zinc-400">{{ formatDate(boss.end_date) }}</span></span>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="editBoss(boss)" class="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all">
              <Edit2 class="w-5 h-5" />
            </button>
            <button @click="deleteBoss(boss.id)" class="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-500 transition-all">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Sparkles, Target, Trash2, Edit2, Calendar } from 'lucide-vue-next';
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';

const i18n = useI18nStore();

const notificationStore = useNotificationStore();
const activeTab = ref('cosmetics');
const tabs = [
  { id: 'cosmetics', name: 'Tienda Goggins' },
  { id: 'bosses', name: 'Eventos Globales' }
];

// Cosmetics State
const cosmetics = ref([]);
const editingCosmeticId = ref(null);
const newCosmetic = ref({ name: '', description: '', type: 'title', price: 0, css_value: '', is_seasonal: false, rarity: 'common' });

// Bosses State
const bosses = ref([]);
const editingBossId = ref(null);
const newBoss = ref({ name: '', description: '', total_hp: 1000, start_date: '', end_date: '', image_url: '' });

const fetchCosmetics = async () => {
  try {
    const res = await axios.get('/api/shop/cosmetics');
    cosmetics.value = res.data;
  } catch (e) {}
};

const createCosmetic = async () => {
  try {
    if (editingCosmeticId.value) {
      await axios.put(`/api/admin/cosmetics/${editingCosmeticId.value}`, newCosmetic.value);
      notificationStore.notify('Cosmético actualizado correctamente', 'success');
    } else {
      await axios.post('/api/admin/cosmetics', newCosmetic.value);
      notificationStore.notify('Cosmético creado correctamente', 'success');
    }
    cancelEditCosmetic();
    fetchCosmetics();
  } catch (e) {
    notificationStore.notify('Error al procesar cosmético', 'error');
  }
};

const editCosmetic = (item) => {
  editingCosmeticId.value = item.id;
  newCosmetic.value = { ...item };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEditCosmetic = () => {
  editingCosmeticId.value = null;
  newCosmetic.value = { name: '', description: '', type: 'title', price: 0, css_value: '', is_seasonal: false, rarity: 'common' };
};

const deleteCosmetic = async (id) => {
  if (!confirm('¿Seguro que quieres eliminar este objeto?')) return;
  try {
    await axios.delete(`/api/admin/cosmetics/${id}`);
    fetchCosmetics();
    notificationStore.notify('Eliminado', 'success');
  } catch (e) {}
};

const getRarityBadgeClass = (rarity) => {
  switch (rarity) {
    case 'legendary': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'epic': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    case 'rare': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
  }
};

// Boss Logic
const fetchBosses = async () => {
  try {
    const res = await axios.get('/api/admin/bosses');
    bosses.value = res.data;
  } catch (e) {}
};

const createBoss = async () => {
  try {
    if (editingBossId.value) {
      await axios.put(`/api/admin/bosses/${editingBossId.value}`, newBoss.value);
      notificationStore.notify('Evento actualizado', 'success');
    } else {
      await axios.post('/api/admin/bosses', newBoss.value);
      notificationStore.notify('Evento programado', 'success');
    }
    cancelEditBoss();
    fetchBosses();
  } catch (e) {
    notificationStore.notify('Error al procesar boss', 'error');
  }
};

const editBoss = (boss) => {
  editingBossId.value = boss.id;
  newBoss.value = { 
    name: boss.name, 
    description: boss.description, 
    total_hp: boss.total_hp, 
    start_date: boss.start_date.slice(0, 16), 
    end_date: boss.end_date.slice(0, 16), 
    image_url: boss.image_url 
  };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEditBoss = () => {
  editingBossId.value = null;
  newBoss.value = { name: '', description: '', total_hp: 1000, start_date: '', end_date: '', image_url: '' };
};

const deleteBoss = async (id) => {
  if (!confirm('¿Eliminar evento permanentemente? Esta acción no se puede deshacer.')) return;
  try {
    await axios.delete(`/api/admin/bosses/${id}`);
    fetchBosses();
    notificationStore.notify('Evento eliminado', 'success');
  } catch (e) {
    notificationStore.notify('Error al eliminar', 'error');
  }
};


const getBossStatus = (boss) => {
  const now = new Date();
  const start = new Date(boss.start_date);
  const end = new Date(boss.end_date);
  if (now < start) return i18n.t('admin_status_upcoming');
  if (now > end) return i18n.t('admin_status_finished');
  return i18n.t('admin_status_active');
};

const getBossStatusClass = (boss) => {
  const status = getBossStatus(boss);
  if (status === 'Activo') return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
  if (status === 'Próximamente') return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
  return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20';
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(i18n.locale === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchCosmetics();
  fetchBosses();
});
</script>
