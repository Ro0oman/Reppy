<template>
  <div class="max-w-7xl mx-auto w-full px-4 space-y-12 pb-32 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- 1. Codex Header -->
    <header class="flex flex-col gap-4 text-center">
      <div class="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 w-fit mx-auto">
        <Sparkles class="w-3.5 h-3.5 text-primary-500" />
        <span class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">{{ i18n.t('codex_subtitle') }}</span>
      </div>
      <h1 class="text-6xl font-black italic tracking-tighter text-foreground uppercase italic leading-none">{{ i18n.t('codex_title') }}</h1>
      <p class="text-muted/60 max-w-xl mx-auto text-sm">{{ i18n.t('codex_subtitle_desc') || 'Your biological evolution, tracked through physical and intellectual effort.' }}</p>
    </header>

    <!-- 2. RPG Attributes Grid -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="stat in attributes" :key="stat.id" 
           class="group relative bg-surface/10 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 overflow-hidden transition-all hover:bg-surface/20 hover:border-primary-500/30">
        
        <!-- Background Glow -->
        <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all group-hover:scale-150"
             :style="{ backgroundColor: stat.color }"></div>

        <div class="relative z-10 space-y-6">
          <div class="flex items-start justify-between">
            <div class="p-4 rounded-2xl border bg-surface/20" :style="{ borderColor: `${stat.color}33`, color: stat.color }">
              <component :is="stat.icon" class="w-6 h-6" />
            </div>
            <div class="text-right">
              <span class="text-[10px] font-black text-muted uppercase tracking-widest block">{{ i18n.t('lb_level') }}</span>
              <span class="text-3xl font-black italic text-foreground tracking-tighter leading-none">{{ getStatLevel(stat.id) }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="text-2xl font-black tracking-tighter uppercase italic text-foreground leading-none">{{ i18n.t(`codex_${stat.id}_name`) }}</h3>
            <p class="text-[10px] font-black text-primary-500/80 uppercase tracking-widest italic">{{ i18n.t(`codex_${stat.id}_quote`) }}</p>
          </div>

          <p class="text-xs text-muted/80 leading-relaxed min-h-[3rem]">{{ i18n.t(`codex_${stat.id}_desc`) }}</p>

          <div class="space-y-3">
             <div class="flex justify-between items-end">
                <span class="text-[9px] font-black text-muted uppercase tracking-widest">{{ i18n.t('nav_progress') }}</span>
                <span class="text-[10px] font-black text-foreground text-precision">{{ getStatXP(stat.id) }} / 100 XP</span>
             </div>
             <div class="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div class="h-full transition-all duration-1000 ease-out"
                     :style="{ width: `${(getStatXP(stat.id) / 100) * 100}%`, backgroundColor: stat.color }"></div>
             </div>
          </div>

          <div class="pt-4 flex items-center gap-2 group/action cursor-help">
            <Info class="w-3.5 h-3.5 text-muted/40 group-hover/action:text-primary-500 transition-colors" />
            <span class="text-[9px] font-black text-muted/60 uppercase tracking-widest group-hover/action:text-foreground transition-colors">
              {{ i18n.t(`codex_${stat.id}_action`) }}
            </span>
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
             <span class="text-xl font-black text-neon-lime">{{ readPostsCount }}</span>
           </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link 
          v-for="post in localizedPosts" 
          :key="post.slug"
          :to="`/${i18n.locale}/blog/${post.slug}`"
          class="group bg-surface/10 border border-white/5 rounded-3xl overflow-hidden hover:bg-surface/20 hover:border-primary-500/30 transition-all flex flex-col"
        >
          <div class="aspect-video relative overflow-hidden">
            <img :src="post.image" :alt="post.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-black text-primary-500 uppercase tracking-widest">{{ post.category }}</span>
                <span class="text-[9px] font-black text-muted uppercase tracking-widest">+100 INT XP</span>
              </div>
              <h3 class="text-lg font-black text-foreground group-hover:text-primary-500 transition-colors line-clamp-2 uppercase italic tracking-tighter leading-tight">{{ post.title }}</h3>
            </div>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { 
  Sword, 
  Footprints, 
  Flame, 
  Brain, 
  Heart, 
  Sparkles, 
  Book, 
  CheckCircle2, 
  ShieldAlert,
  Info 
} from 'lucide-vue-next';
import blogPosts from '../blogPosts.json';

const authStore = useAuthStore();
const i18n = useI18nStore();

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
  return authStore.user?.stats?.[`${statId}_level`] || 1;
};

const getStatXP = (statId) => {
  return authStore.user?.stats?.[`${statId}_xp`] || 0;
};

const localizedPosts = computed(() => {
  return blogPosts.map(post => ({
    slug: post.slug,
    image: post.image,
    category: post.category,
    title: post.locales[i18n.locale]?.title || post.locales.en.title
  }));
});

const isRead = (slug) => {
  return authStore.user?.read_blogs?.includes(slug);
};

const readPostsCount = computed(() => {
  return blogPosts.filter(p => isRead(p.slug)).length;
});

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchProfile();
  }
});
</script>

<style scoped>
.text-precision { font-family: 'JetBrains Mono', monospace; }
</style>
