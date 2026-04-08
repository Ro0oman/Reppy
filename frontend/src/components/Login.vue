<template>
  <div class="flex flex-col items-center justify-center min-h-[90vh] px-4 relative pb-10 bg-deep-abyss">
    <!-- Back Button -->
    <button @click="$emit('back')" class="absolute top-8 left-8 flex items-center gap-2.5 text-muted hover:text-primary-500 transition-colors z-50 group">
      <ChevronLeft class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span class="text-[11px] font-bold tracking-tight">Volver</span>
    </button>

    <div class="w-full max-w-md mt-10 space-y-12 animate-in">
      <!-- Logo & Title -->
      <div class="text-center space-y-4">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-surface border border-border/40 rounded-[1.5rem] mb-4 shadow-xl relative overflow-hidden group">
          <div class="absolute inset-0 bg-primary-500/5 blur-2xl group-hover:bg-primary-500/10 transition-all duration-700"></div>
          <span class="text-4xl font-bold text-foreground relative z-10">R</span>
        </div>
        <div class="space-y-1">
          <h1 class="text-4xl font-bold tracking-tight text-foreground">
            Bienvenido a Reppy<span class="text-primary-500">.</span>
          </h1>
          <p class="text-[11px] font-bold text-muted/60 tracking-tight">ACCESO AL SISTEMA DE ENTRENAMIENTO</p>
        </div>
      </div>

      <!-- Main Auth Card -->
      <div class="card-stats p-8 md:p-10 border-border/40 relative overflow-hidden w-full shadow-2xl">
        <!-- Toggle (Clean Segmented) -->
        <div class="flex p-1 bg-surface border border-border/40 rounded-2xl mb-8">
          <button 
            @click="mode = 'login'" 
            class="flex-1 py-3 text-[11px] font-bold tracking-tight transition-all rounded-xl relative z-10"
            :class="mode === 'login' ? 'text-foreground' : 'text-muted hover:text-foreground'"
          >
            <span v-if="mode === 'login'" class="absolute inset-0 bg-surface border border-border/40 rounded-xl shadow-sm"></span>
            Iniciar Sesión
          </button>
          <button 
            @click="mode = 'signup'" 
            class="flex-1 py-3 text-[11px] font-bold tracking-tight transition-all rounded-xl relative z-10"
            :class="mode === 'signup' ? 'text-foreground' : 'text-muted hover:text-foreground'"
          >
            <span v-if="mode === 'signup'" class="absolute inset-0 bg-surface border border-border/40 rounded-xl shadow-sm"></span>
            Registrarse
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-8 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-shake">
          <AlertCircle class="w-6 h-6 text-red-500 shrink-0" />
          <p class="text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed">
            CRITICAL ERROR: {{ i18n.t(errorMessage) }}
          </p>
        </div>

        <!-- Manual Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6 mb-8">
          <div v-if="mode === 'signup'" class="space-y-2">
            <label class="text-[11px] font-bold text-muted/60 px-1 tracking-tight">Nombre completo</label>
            <input 
              v-model="form.name" 
              type="text" 
              placeholder="Ej: John Doe"
              required
              class="w-full bg-surface border border-border/40 rounded-2xl px-5 py-4 text-foreground font-bold focus:border-primary-500/50 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div class="space-y-2">
            <label class="text-[11px] font-bold text-muted/60 px-1 tracking-tight">Email</label>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="tu@email.com"
              required
              class="w-full bg-surface border border-border/40 rounded-2xl px-5 py-4 text-foreground font-bold focus:border-primary-500/50 outline-none transition-all shadow-sm"
            />
          </div>

          <div class="space-y-2">
            <label class="text-[11px] font-bold text-muted/60 px-1 tracking-tight">Contraseña</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••••"
              required
              class="w-full bg-surface border border-border/40 rounded-2xl px-5 py-4 text-foreground font-bold focus:border-primary-500/50 outline-none transition-all shadow-sm"
            />
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="btn-reppy w-full !py-5 shadow-xl disabled:opacity-20 disabled:grayscale disabled:scale-100 mt-4"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
            <span v-else>{{ mode === 'login' ? 'Identificarse' : 'Crear Cuenta' }}</span>
          </button>
        </form>

        <!-- OR Divider -->
        <div class="relative flex items-center gap-4 mb-10">
          <div class="flex-1 h-px bg-border/40"></div>
          <span class="text-[10px] font-bold text-muted/30 tracking-widest">O CONTINÚA CON</span>
          <div class="flex-1 h-px bg-border/40"></div>
        </div>
        
        <!-- Google Button (Refined Scale) -->
        <div class="flex justify-center py-2 transition-transform">
          <GoogleSignInButton
            @success="handleLoginSuccess"
            @error="handleLoginError"
          />
        </div>
        
        <p class="mt-10 text-[9px] text-center text-zinc-700 font-black uppercase tracking-[0.2em] leading-relaxed italic">
          BY PROCEEDING, YOU AGREE TO OUR <br/>
          <span class="text-zinc-500">TACTICAL TERMS</span> & <span class="text-zinc-500">DATA CRYPT CODES</span>
        </p>
      </div>

      <div class="text-center opacity-20">
        <p class="text-[9px] font-black text-white uppercase tracking-[0.6em] font-tight">
          REPPY CORE SECURITY SYSTEM ONLINE
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

watch(mode, () => { errorMessage.value = ''; });

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    if (mode.value === 'signup') {
      await authStore.signup(form);
    } else {
      await authStore.login({ email: form.email, password: form.password });
    }
    router.push('/profile');
  } catch (error) { errorMessage.value = error.message; }
  finally { loading.value = false; }
};

const handleLoginSuccess = async (response) => {
  try { 
    await authStore.loginWithGoogle(response.credential);
    router.push('/profile');
  }
  catch (error) { console.error('Google link failed:', error); }
};

const handleLoginError = () => { console.error('Google Auth Nullified'); };
</script>

<style scoped>
.font-industrial { font-family: 'Inter Tight', sans-serif; }
.font-tight { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

</style>
