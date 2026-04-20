<template>
  <div class="max-w-7xl mx-auto w-full px-4 space-y-12 pb-32 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- 1. Codex Header -->
    <header class="flex flex-col gap-2 sm:gap-4 text-center">
      <div class="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 w-fit mx-auto">
        <Sparkles class="w-3 h-3 text-primary-500" />
        <span class="text-[8px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">{{ i18n.t('codex_subtitle') }}</span>
      </div>
      <h1 class="text-4xl sm:text-6xl font-black italic tracking-tighter text-foreground uppercase leading-none">{{ i18n.t('codex_title') }}</h1>
      <p class="hidden sm:block text-muted/60 max-w-xl mx-auto text-sm">{{ i18n.t('codex_subtitle_desc') || 'Your biological evolution, tracked through physical and intellectual effort.' }}</p>
    </header>

    <!-- 2. RPG Attributes Grid -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div v-for="stat in attributes" :key="stat.id" 
           @click="openStatModal(stat.id)"
           class="group relative bg-surface/10 backdrop-blur-xl border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 overflow-hidden transition-all hover:bg-surface/20 hover:border-primary-500/30 cursor-pointer active:scale-[0.98]">
        
        <!-- Background Glow -->
        <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all group-hover:scale-150"
             :style="{ backgroundColor: stat.color }"></div>

        <div class="relative z-10 space-y-6">
          <div class="flex items-start justify-between">
            <div class="p-3 sm:p-4 rounded-2xl border bg-surface/20 shadow-inner transition-transform group-hover:scale-110 duration-500" :style="{ borderColor: `${stat.color}33`, color: stat.color }">
              <component :is="stat.icon" class="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div class="text-right">
              <span class="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-widest block">{{ i18n.t('lb_level') }}</span>
              <span class="text-2xl sm:text-3xl font-black italic text-foreground tracking-tighter leading-none">{{ getStatLevel(stat.id) }}</span>
            </div>
          </div>

          <div class="space-y-1 sm:space-y-2">
            <h3 class="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-foreground leading-none">{{ i18n.t(`codex_${stat.id}_name`) }}</h3>
            <p class="hidden sm:block text-[10px] font-black text-primary-500/80 uppercase tracking-widest italic line-clamp-1">{{ i18n.t(`codex_${stat.id}_quote`) }}</p>
          </div>
          <p class="hidden sm:block text-xs text-muted/80 leading-relaxed line-clamp-2">{{ i18n.t(`codex_${stat.id}_desc`) }}</p>

          <!-- Progress Bar (Desktop Only) -->
          <div class="hidden sm:block space-y-3">
             <div class="flex justify-between items-end">
                <span class="text-[9px] font-black text-muted uppercase tracking-widest">{{ i18n.t('nav_progress') }}</span>
                <span class="text-[10px] font-black text-foreground text-precision">{{ Math.floor((getStatXP(stat.id) / Math.max(getStatXPMax(stat.id), 1)) * 100) }}%</span>
             </div>
             <div class="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                     :style="{ width: `${(getStatXP(stat.id) / Math.max(getStatXPMax(stat.id), 1)) * 100}%`, backgroundColor: stat.color }">
                   <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </div>
             </div>
          </div>

          <!-- FooterRow (Desktop Only) -->
          <div class="hidden sm:flex pt-4 items-center justify-between border-t border-white/5">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full animate-pulse" :style="{ backgroundColor: stat.color }"></div>
              <span class="text-[8px] font-black text-muted uppercase tracking-widest">Protocol Active</span>
            </div>
            <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
              <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest">More Details</span>
              <ChevronRight class="w-2.5 h-2.5 text-primary-500" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Intelligence / Blog Modules (The Knowledge Vault) -->
    <section class="space-y-8 pt-12 border-t border-border">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-500/10 rounded-lg"><Book class="w-4 h-4 text-primary-500" /></div>
            <h2 class="text-3xl font-black tracking-tighter text-foreground italic uppercase leading-none">THE KNOWLEDGE VAULT</h2>
          </div>
          <p class="text-muted/60 text-sm max-w-sm">{{ i18n.t('codex_int_vault_desc') || 'Unlock Intelligence XP by studying calisthenics protocols. Knowledge is the ultimate force multiplier.' }}</p>
        </div>
        
        <div class="bg-surface/10 border border-white/5 px-6 py-4 rounded-2xl flex items-center gap-6">
           <div class="text-center border-r border-border pr-6">
             <span class="text-[9px] font-black text-muted uppercase tracking-widest block mb-1">PROTOCOLS</span>
             <span class="text-xl font-black text-foreground">{{ blogPosts.length }}</span>
           </div>
           <div class="text-center">
             <span class="text-[9px] font-black text-muted uppercase tracking-widest block mb-1">UNLOCKED</span>
             <span class="text-xl font-black text-neon-lime">{{ readPostsCount  -1}}</span>
           </div>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <router-link 
          v-for="post in localizedPosts" 
          :key="post.slug"
          :to="`/${i18n.locale}/blog/${post.slug}`"
          class="group bg-surface/10 border border-white/5 rounded-3xl overflow-hidden hover:bg-surface/20 hover:border-primary-500/30 transition-all flex flex-col min-h-[220px] sm:min-h-0"
        >
          <div class="aspect-video relative overflow-hidden bg-background/50">
            <img 
              :src="post.image" 
              :alt="post.title" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              @error="handleImageError"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
            
            <div v-if="isRead(post.slug)" class="absolute top-4 right-4 bg-neon-lime/20 backdrop-blur-md border border-neon-lime/40 px-3 py-1 rounded-full flex items-center gap-1.5">
               <CheckCircle2 class="w-3.5 h-3.5 text-neon-lime" />
               <span class="text-[8px] font-black text-neon-lime uppercase tracking-widest italic">ACQUIRED</span>
            </div>
            <div v-else class="absolute top-4 right-4 bg-primary-500/20 backdrop-blur-md border border-primary-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
               <ShieldAlert class="w-3.5 h-3.5 text-primary-500" />
               <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest italic">LOCKED</span>
            </div>
          </div>

          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div class="space-y-4">
              <div class="hidden sm:flex items-center justify-between">
                <span class="text-[9px] font-black text-primary-500 uppercase tracking-widest">{{ post.category }}</span>
                <span class="text-[9px] font-black text-muted uppercase tracking-widest">+100 INT XP</span>
              </div>
              <h3 class="text-[10px] sm:text-lg font-black text-foreground group-hover:text-primary-500 transition-colors line-clamp-2 uppercase italic tracking-tighter leading-tight">{{ post.title }}</h3>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Upcoming Protocols Section -->
      <div v-if="upcomingPosts.length > 0" class="pt-20 space-y-8">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-muted/10 rounded-lg"><Timer class="w-4 h-4 text-muted" /></div>
          <h2 class="text-xl font-black tracking-tighter text-muted italic uppercase leading-none">{{ i18n.locale === 'es' ? 'CRÓNICAS EN CAMINO' : 'UPCOMING CHRONICLES' }}</h2>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          <div 
            v-for="post in upcomingPosts" 
            :key="post.slug"
            class="group bg-surface/5 border border-white/5 rounded-[2rem] overflow-hidden pointer-events-none flex flex-col relative aspect-[4/5] sm:aspect-auto"
          >
            <!-- 1. Technical Overlay (Scanlines & Matrix effect) -->
            <div class="absolute inset-0 z-10 pointer-events-none opacity-30 px-4 py-6">
              <div class="w-full h-full border border-white/5 rounded-2xl flex flex-col justify-between p-4">
                <div class="flex justify-between items-start">
                   <div class="w-2 h-2 border-t border-l border-white/40"></div>
                   <div class="w-2 h-2 border-t border-r border-white/40"></div>
                </div>
                <div class="flex justify-between items-end">
                   <div class="w-2 h-2 border-b border-l border-white/40"></div>
                   <div class="w-2 h-2 border-b border-r border-white/40"></div>
                </div>
              </div>
            </div>

            <!-- 2. The Image with Glitch/Blur -->
            <div class="relative h-32 sm:h-48 overflow-hidden grayscale contrast-125 opacity-40">
              <!-- Scanline animation -->
              <div class="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
              
              <img :src="post.image" :alt="post.title" class="w-full h-full object-cover blur-[2px]" />
              <div class="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background"></div>
            </div>

            <!-- 3. Central Lock System -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4 w-full px-4">
              <div class="relative">
                <!-- Glowing Rings -->
                <div class="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                <div class="relative w-12 h-12 sm:w-16 sm:h-16 bg-background/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/5">
                   <Lock class="w-5 h-5 sm:w-6 sm:h-6 text-muted/60" />
                </div>
              </div>
              
              <!-- Countdown Badge -->
              <div class="bg-primary-500/10 backdrop-blur-md border border-primary-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary-500-rgb),0.1)]">
                 <Timer class="w-3 h-3 text-primary-500 animate-pulse" />
                 <span class="text-[8px] sm:text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] whitespace-nowrap">
                   {{ i18n.locale === 'es' ? `T-MINUS ${post.daysLeft}D` : `T-MINUS ${post.daysLeft}D` }}
                 </span>
              </div>
            </div>

            <!-- 4. Footer Info -->
            <div class="p-4 sm:p-6 mt-auto bg-background/40 backdrop-blur-sm border-t border-white/5 space-y-1 sm:space-y-2">
              <span class="text-[7px] sm:text-[9px] font-black text-muted/30 uppercase tracking-[0.3em] block">{{ post.category }}</span>
              <h3 class="text-[10px] sm:text-sm font-black text-muted/50 line-clamp-1 sm:line-clamp-2 uppercase italic tracking-tighter leading-tight">{{ post.title }}</h3>
              
              <div class="flex items-center gap-1.5 pt-2">
                <div class="h-0.5 w-8 bg-white/5 rounded-full overflow-hidden">
                   <div class="h-full bg-primary-500/20 w-1/3"></div>
                </div>
                <span class="text-[6px] font-black text-muted/20 uppercase tracking-widest">{{ i18n.locale === 'es' ? 'ENCRIPTADO' : 'ENCRYPTED' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Attribute Detail Modal -->
    <CodexModal 
      :show="showModal" 
      :initial-tab="activeStatId"
      @close="showModal = false" 
    />
  </div>
</template>

<script setup>
import { 
  Sparkles, 
  Sword, 
  Footprints, 
  Heart, 
  Flame, 
  Brain, 
  Church, 
  Book,
  CheckCircle2, 
  ShieldAlert,
  Info,
  ChevronRight,
  Lock,
  Timer
} from 'lucide-vue-next';
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import blogPosts from '../blogPosts.json';
import CodexModal from './CodexModal.vue';

const authStore = useAuthStore();
const i18n = useI18nStore();

const showModal = ref(false);
const activeStatId = ref('str');

const openStatModal = (statId) => {
  activeStatId.value = statId.toUpperCase();
  showModal.value = true;
};

const attributes = [
  { id: 'str', icon: Sword, color: '#f97316' }, // Orange
  { id: 'dex', icon: Footprints, color: '#3b82f6' }, // Blue
  { id: 'end', icon: Heart, color: '#ef4444' }, // Red
  { id: 'vig', icon: Flame, color: '#eab308' }, // Yellow
  { id: 'int', icon: Brain, color: '#a855f7' }, // Purple
  { id: 'fth', icon: Sparkles, color: '#22c55e' }, // Green
  { id: 'cha', icon: Heart, color: '#ec4899' }  // Pink
];

const getStatLevel = (statId) => {
  return authStore.user?.[`${statId}_lvl`] || 1;
};

const getStatXP = (statId) => {
  return authStore.user?.[`${statId}_xp_into_level`] || 0;
};

const getStatXPMax = (statId) => {
  return authStore.user?.[`${statId}_xp_for_next_level`] || 100;
};

const localizedPosts = computed(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize today to midnight for comparison
  
  return blogPosts
    .filter(post => new Date(post.date) <= now)
    .map(post => ({
      slug: post.slug,
      image: post.image,
      category: post.category,
      title: post.locales[i18n.locale]?.title || post.locales.en.title
    }));
});

const upcomingPosts = computed(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const upcoming = blogPosts
    .filter(post => new Date(post.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
    
  return upcoming.map(post => {
    const releaseDate = new Date(post.date);
    const diffTime = releaseDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      slug: post.slug,
      image: post.image,
      category: post.category,
      title: post.locales[i18n.locale]?.title || post.locales.en.title,
      daysLeft: diffDays
    };
  });
});

const isRead = (slug) => {
  return authStore.user?.read_blogs?.includes(slug);
};

const readPostsCount = computed(() => {
  return blogPosts.filter(p => isRead(p.slug)).length;
});

const handleImageError = (e) => {
  // Production recovery for broken unsplash assets
  e.target.src = 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=1200&q=80';
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchProfile();
  }
});
</script>

<style scoped>
.text-precision { font-family: 'JetBrains Mono', monospace; }
</style>
