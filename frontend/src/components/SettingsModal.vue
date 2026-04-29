<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
    <div v-if="show" class="fixed inset-0 z-[2000] flex justify-center items-start overflow-y-auto overscroll-contain p-4 md:p-8 bg-background/90 backdrop-blur-xl" @click.self="$emit('close')">
        <div class="glass max-w-xl w-full p-8 md:p-12 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden flex flex-col max-h-none md:max-h-[85vh] animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 mt-4 md:my-auto">
          <!-- Background Detail -->
          <div class="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <!-- Close Button -->
          <button @click="$emit('close')" class="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group z-20">
             <X class="w-6 h-6 text-muted group-hover:text-foreground" />
          </button>

          <!-- Header -->
          <div class="mb-10 pr-12">
            <h2 class="text-2xl md:text-3xl font-black italic tracking-tighter text-foreground uppercase leading-tight">
              {{ i18n.t('settings_title') }}<span class="text-primary-500">.</span>MOD
            </h2>
            <p class="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-3">Interface & System Override</p>
          </div>

          <div class="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar pb-24 md:pb-4">
            <!-- Identity Section -->
            <div class="space-y-4">
              <h3 class="text-[10px] font-black uppercase text-primary-500 tracking-[0.3em]">CORE IDENTITY</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[8px] font-black uppercase text-muted tracking-widest px-1">{{ i18n.t('profile_name') }}</label>
                  <input v-model="form.name" type="text" class="input-tactical w-full h-12" :placeholder="i18n.t('name_placeholder')" />
                </div>
                <div class="space-y-2">
                  <label class="text-[8px] font-black uppercase text-muted tracking-widest px-1">{{ i18n.t('daily_goal') }}</label>
                  <input v-model.number="form.daily_goal" type="number" class="input-tactical w-full h-12" />
                </div>
              </div>
            </div>

            <!-- Interface Section -->
            <div class="space-y-4">
              <h3 class="text-[10px] font-black uppercase text-primary-500 tracking-[0.3em]">VISUAL INTERFACE</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div class="space-y-3">
                  <label class="text-[8px] font-black uppercase text-muted tracking-widest px-1">THEME_ENGINE</label>
                  <div class="flex items-center bg-surface/40 border border-border rounded-xl p-1 h-12">
                    <button v-for="m in ['light', 'dark', 'system']" :key="m" @click="themeStore.setTheme(m)"
                      class="flex-1 flex items-center justify-center h-full rounded-lg transition-all"
                      :class="themeStore.theme === m ? 'bg-primary-500 text-white shadow-lg' : 'text-muted hover:bg-surface/10'">
                      <component :is="m === 'light' ? Sun : m === 'dark' ? Moon : Monitor" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="space-y-3">
                  <label class="text-[8px] font-black uppercase text-muted tracking-widest px-1">LANGUAGE_PACK</label>
                  <div class="flex items-center bg-surface/40 border border-border rounded-xl p-1 h-12">
                     <button @click="i18n.setLocale('en')" 
                             class="flex-1 h-full rounded-lg text-[10px] font-black transition-all"
                             :class="i18n.locale === 'en' ? 'bg-primary-500 text-white' : 'text-muted'">EN</button>
                     <button @click="i18n.setLocale('es')" 
                             class="flex-1 h-full rounded-lg text-[10px] font-black transition-all"
                             :class="i18n.locale === 'es' ? 'bg-primary-500 text-white' : 'text-muted'">ES</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Risk Actions -->
            <div class="pt-8 border-t border-white/5 space-y-4">
               <button @click="handleLogout" class="flex items-center justify-between w-full p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl group transition-all">
                  <div class="flex items-center gap-4">
                     <div class="p-2 bg-red-500/10 rounded-xl"><LogOut class="w-4 h-4 text-red-500" /></div>
                     <span class="text-[10px] font-black text-red-500 uppercase tracking-widest">{{ i18n.t('sign_out') }}</span>
                  </div>
                  <ChevronRight class="w-4 h-4 text-red-500/40 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mt-auto pt-8 border-t border-border flex gap-4">
            <button @click="$emit('close')" class="flex-1 px-4 py-4 bg-surface/20 border border-border rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-surface/30 transition-all">
              {{ i18n.t('btn_cancel') }}
            </button>
            <button @click="save" :disabled="saving" class="btn-reppy flex-[2] !py-4 !text-[9px]">
              {{ saving ? i18n.t('profile_loading') : i18n.t('btn_save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { X, Sun, Moon, Monitor, LogOut, ChevronRight } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useThemeStore } from '../stores/theme';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import axios from 'axios';

const props = defineProps({
  show: Boolean,
  initialData: Object
});

const emit = defineEmits(['close', 'updated']);

const i18n = useI18nStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const form = ref({ ...props.initialData });
const saving = ref(false);

watch(() => props.initialData, (newVal) => {
  form.value = { ...newVal };
}, { deep: true });

// Fix #99: Prevent background scroll when modal is open
watch(() => props.show, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
}, { immediate: true });

onUnmounted(() => {
  document.body.style.overflow = '';
});

const save = async () => {
  saving.value = true;
  try {
    const res = await axios.patch('/api/users/profile', form.value);
    
    // Auth Store Sync
    if (res.data.user) {
      Object.assign(authStore.user, res.data.user);
    } else {
      Object.assign(authStore.user, res.data); // Fallback
    }

    notificationStore.notify(i18n.t('settings_success') || 'Profile Updated', 'success');
    emit('updated', res.data.user || res.data);
    emit('close');
  } catch (error) {
    notificationStore.notify(i18n.t('ERR_SERVER'), 'error');
  } finally {
    saving.value = false;
  }
};

const handleLogout = () => {
  authStore.logout();
  window.location.href = '/';
};
</script>
