<template>
  <div class="flex flex-col items-center justify-center min-h-[90vh] px-4 relative pb-10">
    <!-- Back Button -->
    <button @click="$emit('back')" class="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors z-50">
      <ChevronLeft class="w-3 h-3 md:w-4 md:h-4" />
      <span class="hidden xs:inline">{{ i18n.t('login_back') }}</span>
    </button>

    <div class="w-full max-w-md mt-10 space-y-10 animate-fade-in-up">
      <!-- Logo & Title -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-16 h-16 glass rounded-2xl mb-4 shadow-2xl relative overflow-hidden group">
          <div class="absolute inset-0 bg-primary-500/20 blur-xl group-hover:bg-primary-500/40 transition-all duration-700"></div>
          <span class="text-3xl font-black italic text-zinc-900 dark:text-white relative z-10">R</span>
        </div>
        <h1 class="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">{{ i18n.t('login_title') }}</h1>
        <p class="text-zinc-400 dark:text-zinc-500 font-medium text-sm">{{ i18n.t('login_subtitle') }}</p>
      </div>

      <!-- Main Auth Card -->
      <div class="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border-zinc-200 dark:border-white/5 relative overflow-hidden w-full">
        <!-- Toggle -->
        <div class="flex p-1 bg-black/5 dark:bg-black/40 rounded-xl mb-8 border border-zinc-200 dark:border-white/5">
          <button 
            @click="mode = 'login'" 
            class="flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg"
            :class="mode === 'login' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-lg' : 'text-zinc-400 dark:text-zinc-500'"
          >
            {{ i18n.t('login_btn') }}
          </button>
          <button 
            @click="mode = 'signup'" 
            class="flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg"
            :class="mode === 'signup' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-lg' : 'text-zinc-400 dark:text-zinc-500'"
          >
            {{ i18n.t('signup_btn') }}
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-shake">
          <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
          <p class="text-[11px] font-bold text-red-500 uppercase tracking-tight leading-relaxed">
            {{ i18n.t(errorMessage) }}
          </p>
        </div>

        <!-- Manual Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4 mb-8">
          <div v-if="mode === 'signup'" class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1">{{ i18n.t('name_placeholder') }}</label>
            <input 
              v-model="form.name" 
              type="text" 
              required
              class="w-full bg-black/5 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm focus:border-primary-500/50 outline-none transition-all"
            />
          </div>
          
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1">{{ i18n.t('email') }}</label>
            <input 
              v-model="form.email" 
              type="email" 
              required
              class="w-full bg-black/5 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm focus:border-primary-500/50 outline-none transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1">{{ i18n.t('password') }}</label>
            <input 
              v-model="form.password" 
              type="password" 
              required
              class="w-full bg-black/5 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm focus:border-primary-500/50 outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-zinc-900 dark:text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-xl shadow-primary-900/20 transition-all flex items-center justify-center gap-2"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            {{ mode === 'login' ? i18n.t('login_btn') : i18n.t('signup_btn') }}
          </button>
        </form>

        <!-- OR Divider -->
        <div class="relative flex items-center gap-4 mb-8">
          <div class="flex-1 h-px bg-white/5"></div>
          <span class="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Protocol OR Google</span>
          <div class="flex-1 h-px bg-white/5"></div>
        </div>
        
        <!-- Google Button -->
        <div class="flex justify-center py-2 scale-110">
          <GoogleSignInButton
            @success="handleLoginSuccess"
            @error="handleLoginError"
          />
        </div>
        
        <p class="mt-8 text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
          By proceeding, you agree to our <br/>
          <span class="text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Tactical Terms</span> & <span class="text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Data Crypt</span>
        </p>
      </div>

      <div class="text-center opacity-40">
        <p class="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.5em]">
          &copy; 2026 REPPY CORE - MODERN PROTOCOL
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { GoogleSignInButton } from 'vue3-google-signin';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-vue-next';

const authStore = useAuthStore();
const i18n = useI18nStore();
const emit = defineEmits(['back']);

const mode = ref('login');
const loading = ref(false);
const errorMessage = ref('');
const form = reactive({
  name: '',
  email: '',
  password: ''
});

// Clear error when switching modes
watch(mode, () => {
  errorMessage.value = '';
});

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    if (mode.value === 'signup') {
      await authStore.signup(form);
    } else {
      await authStore.login({ email: form.email, password: form.password });
    }
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
};

const handleLoginSuccess = async (response) => {
  try {
    await authStore.loginWithGoogle(response.credential);
  } catch (error) {
    console.error('Google Auth Success but Backend Failed:', error);
  }
};

const handleLoginError = () => {
  console.error('Google Login Error');
};
</script>
