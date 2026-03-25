<template>
  <div class="min-h-screen bg-[#030303] text-zinc-100 selection:bg-primary-500/30">
    <!-- Animated background -->
    <div class="bg-glow">
      <div class="blob top-[-10%] left-[-10%]"></div>
      <div class="blob bottom-[-10%] right-[-10%] animation-delay-2000" style="animation-duration: 25s; opacity: 0.5;"></div>
    </div>

    <nav v-if="authStore.isAuthenticated" class="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold italic text-white">R</div>
          <span class="text-xl font-bold tracking-tight">Reppy</span>
        </div>
        <div class="flex items-center gap-6">
          <button 
            @click="view = 'dashboard'"
            class="text-sm font-medium transition-colors"
            :class="view === 'dashboard' ? 'text-white' : 'text-zinc-400 hover:text-white'"
          >
            Dashboard
          </button>
          <button 
            @click="view = 'social'"
            class="text-sm font-medium transition-colors"
            :class="view === 'social' ? 'text-white' : 'text-zinc-400 hover:text-white'"
          >
            Social
          </button>
        </div>
      </div>
    </nav>

    <main class="py-12">
      <template v-if="authStore.isAuthenticated">
        <Dashboard v-if="view === 'dashboard'" />
        <Social v-if="view === 'social'" />
      </template>
      <Login v-else />
    </main>

    <footer class="mt-auto py-8 border-t border-zinc-900">
      <div class="max-w-6xl mx-auto px-4 text-center text-zinc-600 text-sm">
        &copy; 2026 Reppy - Modern Pull-up Tracking
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import Social from './components/Social.vue'

const authStore = useAuthStore();
const view = ref('dashboard');

onMounted(() => {
  authStore.init();
});
</script>
