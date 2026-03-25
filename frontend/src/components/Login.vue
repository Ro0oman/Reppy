<template>
  <div class="flex flex-col items-center justify-center min-h-[80vh] px-4 relative">
    <button @click="$emit('back')" class="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs font-bold uppercase tracking-widest transition-colors z-50">
      <ChevronLeft class="w-4 h-4" />
      {{ i18n.t('login_back') }}
    </button>
    <div class="w-full max-w-md space-y-12 animate-fade-in-up">
      <div class="text-center space-y-4">
        <div class="inline-flex items-center justify-center w-20 h-20 glass rounded-3xl mb-4 shadow-2xl relative overflow-hidden group">
          <div class="absolute inset-0 bg-primary-500/20 blur-xl group-hover:bg-primary-500/40 transition-all duration-700"></div>
          <span class="text-4xl font-black italic text-white relative z-10">R</span>
        </div>
        <h1 class="text-6xl font-black tracking-tighter text-white sm:text-7xl">{{ i18n.t('login_title') }}</h1>
        <p class="text-zinc-500 font-medium tracking-wide">{{ i18n.t('login_subtitle') }}</p>
      </div>

      <div class="glass p-10 rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border-white/5 relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <div class="space-y-8 relative z-10">
          <div class="space-y-2 text-center">
            <h2 class="text-2xl font-black text-white tracking-tight">Welcome back</h2>
            <p class="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em]">Identify yourself to continue</p>
          </div>
          
          <div class="flex justify-center py-4 scale-110">
            <GoogleSignInButton
              @success="handleLoginSuccess"
              @error="handleLoginError"
              class="w-full shadow-2xl shadow-primary-500/10 hover:shadow-primary-500/20 transition-all duration-500"
            />
          </div>
          
          <p class="text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
            By proceeding, you agree to our <br/>
            <span class="text-zinc-400">Tactical Terms</span> & <span class="text-zinc-400">Data Crypt</span>
          </p>
        </div>
      </div>

      <div class="text-center">
        <p class="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] leading-relaxed">
          &copy; 2026 REPPY CORE - MODERN PROTOCOL
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { GoogleSignInButton } from 'vue3-google-signin';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { ChevronLeft } from 'lucide-vue-next';

const authStore = useAuthStore();
const i18n = useI18nStore();
const emit = defineEmits(['back']);

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
