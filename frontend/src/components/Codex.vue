<template>
  <div class="min-h-screen bg-background selection:bg-primary-500/30 overflow-x-hidden">
    
    <!-- ═══════════════════════════════════════════════════════════
         HERO SECTION — Conversion Focused
    ═══════════════════════════════════════════════════════════ -->
    <section class="relative pt-12 pb-24 px-4 overflow-hidden border-b border-white/5">
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
         WHY REPPY? — Value Props
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-7xl mx-auto px-4 py-24">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
        <div v-for="feature in features" :key="feature.title" 
             class="card-stats p-10 flex flex-col gap-6 group hover:border-primary-500/30 transition-all">
          <div class="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 transition-transform group-hover:scale-110">
            <component :is="feature.icon" class="w-7 h-7" />
          </div>
          <div class="space-y-3">
            <h3 class="text-2xl font-black text-foreground uppercase italic tracking-tight">{{ feature.title }}</h3>
            <p class="text-muted/60 font-medium leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         BLOG SECTION — SEO Knowledge Vault
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-7xl mx-auto px-4 py-24 space-y-12">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div class="space-y-3">
          <h2 class="text-4xl md:text-6xl font-black italic tracking-tighter text-foreground uppercase leading-none">
            {{ i18n.locale === 'es' ? 'APRENDE Y MEJORA' : 'LEARN & IMPROVE' }}
          </h2>
          <p class="text-muted/60 text-lg font-medium">{{ i18n.t('codex_int_vault_desc') || 'Unlock Intelligence XP by studying calisthenics protocols.' }}</p>
        </div>
        <div class="flex items-center gap-4 bg-surface/10 border border-white/5 p-2 rounded-2xl">
           <div class="px-6 py-3 border-r border-white/5 text-center">
             <span class="text-[9px] font-black text-muted uppercase tracking-widest block mb-1">PROTOCOLS</span>
             <span class="text-xl font-black text-foreground tabular-nums">{{ blogPosts.length }}</span>
           </div>
           <div class="px-6 py-3 text-center">
             <span class="text-[9px] font-black text-muted uppercase tracking-widest block mb-1">UNLOCKED</span>
             <span class="text-xl font-black text-neon-lime tabular-nums">{{ readPostsCount }}</span>
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
            
            <div v-if="isRead(post.slug)" class="absolute top-4 right-4 bg-neon-lime/20 backdrop-blur-md border border-neon-lime/40 px-4 py-1.5 rounded-full flex items-center gap-2">
               <CheckCircle2 class="w-4 h-4 text-neon-lime" />
               <span class="text-[9px] font-black text-neon-lime uppercase tracking-widest">ACQUIRED</span>
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

      <!-- Conversion Block Inside Blog Grid -->
      <div class="card-stats !p-0 overflow-hidden relative border-primary-500/20 bg-primary-500/[0.03] animate-pulse-slow">
        <div class="grid grid-cols-1 md:grid-cols-2 items-center">
          <div class="p-10 md:p-16 space-y-8">
            <div class="space-y-4">
              <h3 class="text-3xl md:text-5xl font-black italic tracking-tighter text-foreground uppercase leading-none">
                {{ i18n.locale === 'es' ? '¿ENTRENAS DOMINADAS?' : 'TRAIN PULL-UPS?' }}
              </h3>
              <p class="text-lg text-muted font-medium leading-relaxed">
                {{ i18n.locale === 'es' 
                  ? 'Registra cada repetición en Reppy y mira tu progreso real con nuestro heatmap estilo GitHub y ranking mundial.' 
                  : 'Track every rep in Reppy and see your real progress with our GitHub-style heatmap and world ranking.' }}
              </p>
            </div>
            <ul class="grid grid-cols-2 gap-4">
              <li v-for="item in ['Heatmap', 'Ranking', 'RPG', '100% Free']" :key="item" class="flex items-center gap-3 text-xs font-black text-foreground uppercase tracking-widest">
                <CheckCircle2 class="w-4 h-4 text-neon-lime" />
                {{ item }}
              </li>
            </ul>
            <button @click="onStartAction" class="btn-reppy !px-10 !py-5">
              {{ i18n.locale === 'es' ? 'EMPIEZA AHORA GRATIS' : 'START NOW FOR FREE' }}
            </button>
          </div>
          <div class="hidden md:block relative h-full bg-surface/10 overflow-hidden">
             <img src="/assets/dashboard_mockup.png" alt="Reppy App" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-auto rotate-12 scale-110 opacity-40 group-hover:rotate-0 transition-all duration-1000" />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         FINAL CTA
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-4xl mx-auto px-4 py-32 text-center space-y-12">
      <h2 class="text-4xl md:text-7xl font-black italic tracking-tighter text-foreground uppercase leading-none">
        {{ i18n.locale === 'es' ? 'TU LEYENDA EMPIEZA HOY' : 'YOUR LEGEND STARTS TODAY' }}
      </h2>
      <p class="text-xl md:text-2xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
        {{ i18n.locale === 'es' 
          ? 'Deja de entrenar a ciegas. Cuenta cada repetición, compite con la comunidad y alcanza el nivel de un atleta de élite.' 
          : 'Stop training in the dark. Count every rep, compete with the community, and reach elite athlete level.' }}
      </p>
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
  </div>
</template>

<script setup>
import { 
  Sparkles, 
  Activity, 
  Trophy, 
  Target,
  ChevronRight,
  CheckCircle2,
  Book,
  Zap,
  LayoutDashboard,
  Users
} from 'lucide-vue-next';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import blogPosts from '../blogPosts.json';

const authStore = useAuthStore();
const i18n = useI18nStore();
const router = useRouter();

const onStartAction = () => {
  if (authStore.isAuthenticated) {
    router.push(`/${i18n.locale}/social`);
  } else {
    router.push(`/${i18n.locale}/login`);
  }
};

const features = computed(() => [
  {
    icon: Activity,
    title: i18n.locale === 'es' ? 'MEJORA MÁS RÁPIDO' : 'IMPROVE FASTER',
    desc: i18n.locale === 'es' ? 'Mide tus dominadas reales y progreso semanal con datos precisos.' : 'Track your real pull-ups and weekly progress with precise data.'
  },
  {
    icon: Zap,
    title: i18n.locale === 'es' ? 'ENTRENA CON MOTIVACIÓN' : 'TRAIN MOTIVATED',
    desc: i18n.locale === 'es' ? 'Cada repetición suma XP, monedas y nivel en tu perfil RPG.' : 'Every rep adds XP, coins, and level to your RPG profile.'
  },
  {
    icon: Trophy,
    title: i18n.locale === 'es' ? 'COMPITE CON OTROS' : 'COMPETE WITH OTHERS',
    desc: i18n.locale === 'es' ? 'Ranking global en vivo y eventos de Boss comunitarios.' : 'Live global ranking and community Boss fight events.'
  }
]);

const localizedPosts = computed(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return blogPosts
    .filter(post => new Date(post.date) <= now)
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

const isRead = (slug) => {
  return authStore.user?.read_blogs?.includes(slug);
};

const readPostsCount = computed(() => {
  return blogPosts.filter(p => isRead(p.slug)).length;
});

const handleImageError = (e) => {
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
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-pulse-slow { animation: pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulseSlow { 0%, 100% { opacity: 1; border-color: rgba(var(--primary), 0.2); } 50% { opacity: 0.8; border-color: rgba(var(--primary), 0.4); } }
</style>

