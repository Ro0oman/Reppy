<template>
  <div v-if="authStore.isAuthenticated" class="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
    <div 
      class="flex items-center justify-between mb-4 cursor-pointer group/title"
      @click="showModal = true"
    >
      <div class="flex items-center gap-2">
        <div class="relative">
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <div class="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
        </div>
        <h3 class="text-[10px] font-black tracking-[0.25em] text-emerald-500 uppercase">
          {{ i18n.t('live_operatives') }}
        </h3>
      </div>
      <span class="text-[9px] font-bold text-white/40 group-hover/title:text-emerald-400 transition-colors uppercase tracking-widest flex items-center gap-1">
        {{ displayOperatives.length }} <Users class="w-3 h-3" />
      </span>
    </div>
    
    <div class="flex -space-x-2 overflow-hidden p-1">
      <div 
        v-for="user in displayOperatives.slice(0, 8)" 
        :key="user.id"
        class="relative group"
        @click="showModal = true"
      >
        <div class="w-9 h-9 rounded-full border-2 border-background bg-surface/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:z-10 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer">
          <img 
            :src="user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`" 
            :alt="user.name"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <!-- More indicator -->
      <div 
        v-if="displayOperatives.length > 8"
        class="w-9 h-9 rounded-full border-2 border-background bg-surface/80 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-white/60 cursor-pointer hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
        @click="showModal = true"
      >
        +{{ displayOperatives.length - 8 }}
      </div>
    </div>

    <!-- Active Operatives Modal -->
    <Transition name="fade">
      <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="showModal = false"></div>
          
          <!-- Modal Content -->
          <div class="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <!-- Modal Header -->
            <div class="p-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent flex items-center justify-between">
              <div>
                <h2 class="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                  <Users class="w-5 h-5 text-emerald-500" />
                  {{ i18n.t('live_operatives') }}
                </h2>
                <p class="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] mt-1">
                  {{ displayOperatives.length }} LEGENDS SYNCHRONIZED
                </p>
              </div>
              <button @click="showModal = false" class="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X class="w-5 h-5 text-white/40" />
              </button>
            </div>

            <!-- User List -->
            <div class="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              <div class="grid gap-3">
                <div 
                  v-for="user in displayOperatives" 
                  :key="user.id"
                  class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group"
                >
                  <div class="flex items-center gap-4">
                    <div class="relative">
                      <div class="w-12 h-12 rounded-full border-2 border-emerald-500/20 overflow-hidden bg-black/40">
                        <img :src="user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`" class="w-full h-full object-cover" />
                      </div>
                      <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0a0a0a] shadow-lg">
                        <span class="text-[8px] font-black text-white">{{ user.level || 1 }}</span>
                      </div>
                    </div>
                    <div>
                      <h4 class="font-bold text-white group-hover:text-emerald-400 transition-colors">{{ user.name }}</h4>
                      <div class="flex items-center gap-2 mt-1">
                        <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span class="text-[9px] font-black text-white/40 uppercase tracking-widest">Active Now</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    @click="goToProfile(user.id)"
                    class="px-3 py-1.5 bg-white/5 hover:bg-emerald-500/20 rounded-lg border border-white/10 hover:border-emerald-500/40 text-[9px] font-black text-white/60 hover:text-emerald-400 transition-all uppercase tracking-widest"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-4 bg-black/40 border-t border-white/5 text-center">
              <p class="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
                REPPY LIVE SYNCHRONIZATION v1.0
              </p>
            </div>
          </div>
        </div>
      </Teleport>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSocketStore } from '../stores/socket';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { useRouter } from 'vue-router';
import { Users, X } from 'lucide-vue-next';

const socketStore = useSocketStore();
const authStore = useAuthStore();
const router = useRouter();
const i18n = useI18nStore();
const showModal = ref(false);

const displayOperatives = computed(() => {
  const ops = [...socketStore.activeOperatives];
  // If user is authenticated but not in the list, add them as a fallback
  if (authStore.user && !ops.find(o => o.id === authStore.user.id)) {
    ops.unshift({
      id: authStore.user.id,
      name: authStore.user.name,
      avatar_url: authStore.user.avatar_url,
      level: authStore.user.current_level || 1
    });
  }
  return ops;
});

const goToProfile = (userId) => {
  showModal.value = false;
  router.push({ name: 'profile', params: { userId } });
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.4);
}
</style>
