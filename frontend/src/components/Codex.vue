<template>
  <div class="codex-root-wrapper">
    <div class="min-h-screen bg-background selection:bg-primary-500/30 overflow-x-hidden">
    
    <!-- ═══════════════════════════════════════════════════════════
         HERO SECTION — Conversion Focused (Only for Guests)
    ═══════════════════════════════════════════════════════════ -->
    <section v-if="!authStore.isAuthenticated" class="  relative pt-12 pb-24 px-4 overflow-hidden border-b border-white/5">
      <!-- Ambient Glows -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto relative z-10 text-center space-y-10">
        <!-- Badge -->
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div class="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <span class="text-[9px] sm:text-[10px] font-black text-muted uppercase tracking-[0.3em]">BLOG CÓDICE BY <span class="text-primary-500">REPPY</span></span>
          </div>
        </div>

        <!-- Headline -->
        <div class="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <h1 class="text-5xl md:text-8xl font-black italic tracking-tighter text-foreground uppercase leading-[0.85] drop-shadow-2xl">
            {{ i18n.locale === 'es' ? 'DOMINA CADA' : 'MASTER EVERY' }} <br/>
            <span class="bg-gradient-to-r from-primary-500 via-blue-400 to-emerald-500 bg-clip-text text-transparent">
              {{ i18n.locale === 'es' ? 'REPETICIÓN' : 'REPETITION' }}
            </span>
          </h1>
          <p class="text-lg md:text-2xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
            {{ i18n.locale === 'es' 
              ? 'La app gratuita de calistenia donde registras repeticiones, subes de nivel y compites con otros atletas.' 
              : 'The free calisthenics app to track your reps, level up your attributes, and compete globally.' }}
          </p>
        </div>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-400">
          <button @click="onStartAction" class="w-full sm:w-auto btn-reppy !py-5 !px-12 !text-lg shadow-2xl shadow-primary-500/20">
            {{ i18n.t('btn_join_now').toUpperCase() }}
          </button>
          <router-link :to="`/${i18n.locale}/social`" class="w-full sm:w-auto px-10 py-5 bg-surface/30 hover:bg-surface/50 border border-white/10 rounded-[2rem] font-black uppercase tracking-widest transition-all">
            {{ i18n.t('rankings').toUpperCase() }}
          </router-link>
        </div>

        <!-- Social Proof -->
        <div class="pt-8 flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 animate-in fade-in duration-1000 delay-600">
           <div class="flex flex-col items-center gap-1">
             <span class="text-2xl font-black italic text-foreground tracking-tighter">1.2M+</span>
             <span class="text-[8px] font-black uppercase tracking-widest text-muted">REPETICIONES</span>
           </div>
           <div class="flex flex-col items-center gap-1">
             <span class="text-2xl font-black italic text-foreground tracking-tighter">450+</span>
             <span class="text-[8px] font-black uppercase tracking-widest text-muted">BOSSES DERROTADOS</span>
           </div>
           <div class="flex flex-col items-center gap-1">
             <span class="text-2xl font-black italic text-foreground tracking-tighter">100%</span>
             <span class="text-[8px] font-black uppercase tracking-widest text-muted">GRATIS</span>
           </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         AUTHENTICATED HEADER (Only for Users)
    ═══════════════════════════════════════════════════════════ -->
    <header v-if="authStore.isAuthenticated" class="max-w-7xl mx-auto px-4 pt-12">
      <div class="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
        <div class="w-1.5 h-8 bg-primary-500 rounded-full"></div>
        <div class="space-y-1">
          <h2 class="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">{{ i18n.t('CODEX_DASHBOARD') }}<span class="text-primary-500"></span></h2>
          <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.locale === 'es' ? 'ATRIBUTOS ACTIVOS' : 'ATTRIBUTE PROTOCOL ACTIVE' }}</p>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════════
         STATS SECTION — User Attributes
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-7xl mx-auto px-4 py-24 ">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div v-for="stat in attributeDescriptions" :key="stat.key" 
             @click="openStatModal(stat.key)"
             class="card-stats p-8 flex flex-col gap-6 group hover:border-primary-500/30 transition-all cursor-pointer">
          
          <div class="flex items-center justify-between">
            <div class="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" :class="stat.iconColor">
              <component :is="stat.icon" class="w-7 h-7" />
            </div>
            <div class="text-right">
              <span class="text-[10px] font-black text-muted uppercase tracking-widest block">{{ i18n.t('ui_level') || 'NIVEL' }}</span>
              <span class="text-2xl font-black italic tracking-tighter text-foreground">{{ getStatLevel(stat.key) }}</span>
            </div>
          </div>

          <div class="space-y-1 sm:space-y-2">
            <h3 class="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-foreground leading-none">{{ i18n.t(`codex_${stat.key.toLowerCase()}_name`) }}</h3>
            <p class="text-[10px] font-black text-primary-500/80 uppercase tracking-widest italic line-clamp-1 opacity-60">{{ i18n.t(`codex_${stat.key.toLowerCase()}_quote`) || stat.key }}</p>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-3">
             <div class="flex justify-between items-end">
                <span class="text-[9px] font-black text-muted uppercase tracking-widest">{{ i18n.t('nav_progress') }}</span>
                <span class="text-[10px] font-black text-foreground text-precision">{{ Math.floor((getStatXP(stat.key) / Math.max(getStatXPMax(stat.key), 1)) * 100) }}%</span>
             </div>
             <div class="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                     :style="{ width: `${(getStatXP(stat.key) / Math.max(getStatXPMax(stat.key), 1)) * 100}%`, backgroundColor: stat.hex }">
                   <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </div>
             </div>
          </div>

          <!-- FooterRow -->
          <div class="flex pt-4 items-center justify-between border-t border-white/5">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full animate-pulse" :style="{ backgroundColor: stat.hex }"></div>
              <span class="text-[8px] font-black text-muted uppercase tracking-widest">{{ i18n.t('ui_protocol_active') || 'ACTIVE' }}</span>
            </div>
            <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
              <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest">{{ i18n.t('ui_more_details') || 'DETAILS' }}</span>
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
            <h2 class="text-3xl font-black tracking-tighter text-foreground italic uppercase leading-none">{{ i18n.t('ui_knowledge_vault') }}</h2>
          </div>
          <p class="text-muted/60 text-sm max-w-sm">{{ i18n.t('codex_int_vault_desc') || 'Unlock Intelligence XP by studying calisthenics guides. Knowledge is the ultimate force multiplier.' }}</p>
        </div>
        
        <div class="bg-surface/10 border border-white/5 px-6 py-4 rounded-2xl flex items-center gap-6">
           <div class="text-center border-r border-border pr-6">
             <span class="text-[9px] font-black text-muted uppercase tracking-widest block mb-1">{{ i18n.t('ui_protocols') || 'Guías' }}</span>
             <span class="text-xl font-black text-foreground">{{ blogPosts.length }}</span>
           </div>
           <div class="text-center">
             <span class="text-[9px] font-black text-muted uppercase tracking-widest block mb-1">{{ i18n.t('ui_unlocked') || 'Desbloqueados' }}</span>
             <span class="text-xl font-black text-neon-lime">{{ readPostsCount}}</span>
           </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <router-link 
          v-for="post in localizedPosts" 
          :key="post.slug"
          :to="`/${i18n.locale}/blog/${post.slug}`"
          class="group flex flex-col bg-surface/10 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-surface/20 hover:border-primary-500/30 transition-all shadow-xl hover:shadow-primary-500/5"
        >
          <div class="aspect-video relative overflow-hidden bg-background">
            <img 
              :src="post.image" 
              :alt="post.title" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              @error="handleImageError"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
            
            <div v-if="isRead(post.slug)" class="absolute top-4 right-4 bg-neon-lime/20 backdrop-blur-md border border-neon-lime/40 px-3 py-1 rounded-full flex items-center gap-1.5">
               <CheckCircle2 class="w-3.5 h-3.5 text-neon-lime" />
               <span class="text-[8px] font-black text-neon-lime uppercase tracking-widest italic">{{ i18n.t('ui_acquired') || 'ACQUIRED' }}</span>
            </div>
            <div v-else class="absolute top-4 right-4 bg-primary-500/20 backdrop-blur-md border border-primary-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
               <ShieldAlert class="w-3.5 h-3.5 text-primary-500" />
               <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest italic">{{ i18n.t('ui_locked') || 'LOCKED' }}</span>
            </div>
            <span class="absolute bottom-4 left-6 px-3 py-1 bg-primary-500 text-[9px] font-black text-white uppercase tracking-widest rounded-lg">{{ post.category }}</span>
          </div>

          <div class="p-8 flex-1 flex flex-col justify-between space-y-6">
            <h3 class="text-xl font-black text-foreground group-hover:text-primary-500 transition-colors uppercase italic tracking-tighter leading-tight">{{ post.title }}</h3>
            
            <div class="flex items-center justify-between pt-6 border-t border-white/5">
              <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ post.date }}</span>
              <div class="flex items-center gap-2 text-primary-500 group-hover:translate-x-2 transition-transform">
                <span class="text-[10px] font-black uppercase tracking-widest">{{ i18n.locale === 'es' ? 'LEER GUÍA' : 'READ GUIDE' }}</span>
                <ChevronRight class="w-4 h-4" />
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Upcoming Guides Section -->
      <div v-if="upcomingPosts.length > 0" class="pt-20 space-y-8">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-muted/10 rounded-lg"><Timer class="w-4 h-4 text-muted" /></div>
          <h2 class="text-xl font-black tracking-tighter text-muted italic uppercase leading-none">{{ i18n.t('ui_upcoming_chronicles') || 'Próximas Crónicas' }}</h2>
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
          <div class="hidden md:block relative h-full bg-surface/10 overflow-hidden rounded-[2rem] border border-white/5">
             <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80" alt="Reppy App" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-auto rotate-12 scale-110 opacity-20 group-hover:rotate-0 transition-all duration-1000" />
             <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         FINAL CTA (Only for Guests)
    ═══════════════════════════════════════════════════════════ -->
    <section v-if="!authStore.isAuthenticated" class="max-w-4xl mx-auto px-4 py-32 text-center space-y-12">
      <h2 class="text-4xl md:text-7xl font-black italic tracking-tighter text-foreground uppercase leading-none">
        {{ i18n.locale === 'es' ? 'TU LEYENDA EMPIEZA HOY' : 'YOUR LEGEND STARTS TODAY' }}
      </h2>
      <p class="text-xl md:text-2xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
        {{ i18n.locale === 'es' 
          ? 'Deja de entrenar a ciegas. Cuenta cada repetición, compite con la comunidad y alcanza el nivel de un atleta de élite.' 
          : 'Stop training in the dark. Count every rep, compete with the community, and reach elite athlete level.' }}
      </p>
      <ul class="flex flex-wrap justify-center gap-8 py-8">
        <li v-for="item in ['Heatmap', 'Ranking', 'RPG', '100% Free']" :key="item" class="flex items-center gap-3 text-sm font-black text-foreground uppercase tracking-widest">
          <CheckCircle2 class="w-5 h-5 text-neon-lime" />
          {{ item }}
        </li>
      </ul>
      <button @click="onStartAction" class="btn-reppy !text-xl !px-16 !py-8 shadow-[0_20px_50px_rgba(var(--primary),0.3)]">
        {{ i18n.t('btn_create_account_free').toUpperCase() }}
      </button>
      <p class="text-[10px] font-black text-muted uppercase tracking-[0.5em] pt-4">LOGIN_SECURE_PROTOCOL_ACTIVE // GOOGLE_OAUTH</p>
    </section>

    <!-- Sticky Bottom CTA (Mobile Only) -->
    <div v-if="!authStore.isAuthenticated" 
         class="md:hidden fixed bottom-6 left-4 right-4 z-[100] animate-in slide-in-from-bottom-20 duration-1000 delay-1000">
       <button @click="onStartAction" class="w-full btn-reppy !py-5 shadow-[0_20px_50px_rgba(255,69,0,0.4)]">
         🚀 {{ i18n.locale === 'es' ? 'EMPIEZA GRATIS' : 'START FREE' }}
       </button>
    </div>

    <!-- Footer Space -->
    <footer class="py-24 border-t border-white/5 text-center">
       <div class="flex items-center justify-center gap-8 opacity-20">
         <span class="text-[11px] font-bold tracking-[0.4em] uppercase">© REPPY_CORE_2026</span>
         <span class="text-[11px] font-bold tracking-[0.4em] uppercase">EST. ATHLETE_V2</span>
       </div>
    </footer>
    <!-- Codex Modal -->
    <CodexModal 
      :show="showCodexModal" 
      :initialTab="selectedStat"
      @close="showCodexModal = false"
    />
  </div>
</div>
</template>

<script setup>
import { 
  Activity, 
  ChevronRight,
  CheckCircle2,
  Book,
  ShieldAlert,
  Timer,
  Lock,
  Sword, 
  Heart, 
  Shield, 
  Dumbbell, 
  Brain, 
  Church 
} from 'lucide-vue-next';
import CodexModal from './CodexModal.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import blogPosts from '../blogPosts.json';

const authStore = useAuthStore();
const i18n = useI18nStore();
const router = useRouter();

const showCodexModal = ref(false);
const selectedStat = ref('STR');

const attributeDescriptions = [
  { 
    key: 'STR', 
    icon: Dumbbell, 
    iconColor: 'text-orange-500', 
    hex: '#f97316'
  },
  { 
    key: 'DEX', 
    icon: Sword, 
    iconColor: 'text-cyan-400', 
    hex: '#22d3ee'
  },
  { 
    key: 'END', 
    icon: Activity, 
    iconColor: 'text-green-400', 
    hex: '#4ade80'
  },
  { 
    key: 'VIG', 
    icon: Heart, 
    iconColor: 'text-red-500', 
    hex: '#ef4444'
  },
  { 
    key: 'INT', 
    icon: Brain, 
    iconColor: 'text-blue-400', 
    hex: '#60a5fa'
  },
  { 
    key: 'FTH', 
    icon: Church, 
    iconColor: 'text-yellow-400', 
    hex: '#facc15'
  },
  { 
    key: 'CHA', 
    icon: Heart, 
    iconColor: 'text-pink-400', 
    hex: '#f472b6'
  }
];

const openStatModal = (key) => {
  selectedStat.value = key;
  showCodexModal.value = true;
};

const getStatLevel = (key) => authStore.user?.[`${key.toLowerCase()}_lvl`] || 1;
const getStatXP = (key) => authStore.user?.[`${key.toLowerCase()}_xp_into_level`] || 0;
const getStatXPMax = (key) => authStore.user?.[`${key.toLowerCase()}_xp_for_next_level`] || 100;

const onStartAction = () => {
  if (authStore.isAuthenticated) {
    router.push(`/${i18n.locale}/social`);
  } else {
    router.push(`/${i18n.locale}/login`);
  }
};

const localizedPosts = computed(() => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  return blogPosts
    .filter(post => post.date <= todayStr)
    .map(post => ({
      ...post,
      title: post.locales[i18n.locale]?.title || post.locales.en.title
    }))
    .sort((a, b) => {
      if (a.isPillar && !b.isPillar) return -1;
      if (!a.isPillar && b.isPillar) return 1;
      return new Date(b.date) - new Date(a.date);
    });
});

const upcomingPosts = computed(() => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const upcoming = blogPosts
    .filter(post => post.date > todayStr)
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
  e.target.src = 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=1200&q=80';
};

const emit = defineEmits(['start', 'viewProfile']);

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchProfile();
  }
});
</script>

<style scoped>
.text-precision { font-family: 'JetBrains Mono', monospace; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-pulse-slow { animation: pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulseSlow { 0%, 100% { opacity: 1; border-color: rgba(var(--primary), 0.2); } 50% { opacity: 0.8; border-color: rgba(var(--primary), 0.4); } }
</style>
