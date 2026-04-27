<template>
  <div class="min-h-screen bg-background selection:bg-primary/30 overflow-x-hidden flex flex-col items-center text-foreground relative">
    
    <!-- Navigation -->
    <nav class="w-full max-w-7xl px-6 py-10 flex items-center justify-between z-10 animate-in">
      <router-link :to="`/${i18n.locale}`" class="flex items-center gap-3 group">
        <div class="w-8 h-8 bg-primary rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">R</div>
        <span class="text-xl font-black tracking-tight text-foreground">Reppy<span class="text-primary group-hover:translate-x-0.5 transition-transform">.</span></span>
      </router-link>
      <LanguageToggle />
    </nav>

    <!-- Header (Large & Clean) -->
    <header class="max-w-7xl w-full px-6 py-20 text-center space-y-8 animate-in">
      <h1 class="text-5xl md:text-[10rem] font-black tracking-tighter text-foreground leading-none uppercase italic border-b-8 border-primary/20 pb-4 inline-block">
        {{ i18n.t('nav_codex') }}
      </h1>
      <p class="text-xl md:text-2xl text-muted max-w-3xl mx-auto leading-relaxed font-medium">
        {{ i18n.t('blog_list_subtitle') }}
      </p>
    </header>

    <!-- Blog Grid (Focused) -->
    <section class="max-w-7xl w-full px-6 pb-40">
      <div v-if="paginatedPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        <router-link 
          v-for="post in paginatedPosts" 
          :key="post.slug" 
          :to="`/${i18n.locale}/blog/${post.slug}`" 
          class="group flex flex-col space-y-8 animate-in"
        >
          <div class="relative aspect-video overflow-hidden rounded-[2.5rem] bg-surface-dark/10 flex items-center justify-center border border-white/5 shadow-2xl transition-all duration-500 group-hover:shadow-primary/10">
            <!-- Loading Spinner -->
            <div v-if="!loadedImages[post.slug]" class="absolute inset-0 flex items-center justify-center">
              <Loader2 class="w-8 h-8 text-primary/40 animate-spin" />
            </div>

            <img 
              :src="post.image" 
              :alt="post.locales[i18n.locale]?.title" 
              class="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" 
              :class="loadedImages[post.slug] ? 'opacity-100' : 'opacity-0'"
              @load="loadedImages[post.slug] = true"
              @error="(e) => { 
                loadedImages[post.slug] = true;
                e.target.src = 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=800&q=60';
              }"
            />
            
            <!-- Read Indicator Overlay -->
            <div 
              v-if="isRead(post.slug)" 
              class="absolute top-6 right-6 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-2 border-white/20 z-20 backdrop-blur-sm"
            >
              <CheckCircle2 class="w-6 h-6 text-white" />
            </div>
          </div>

          <div class="space-y-4 px-4">
            <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
              <span class="bg-primary/5 px-3 py-1 rounded-full ring-1 ring-primary/20">{{ post.category }}</span>
              <span class="opacity-30">•</span>
              <span>{{ post.date }}</span>
            </div>
            
            <h3 class="text-3xl md:text-4xl font-black text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight">
              {{ post.locales[i18n.locale]?.title || post.locales.en.title }}
            </h3>
            
            <p class="text-lg text-muted/60 leading-relaxed font-medium line-clamp-2 max-w-xl">
              {{ post.locales[i18n.locale]?.excerpt || post.locales.en.excerpt }}
            </p>

            <div class="pt-4 flex items-center gap-3 text-primary group-hover:gap-5 transition-all">
              <span class="text-xs font-black uppercase tracking-widest">{{ i18n.locale === 'es' ? 'Leer Guía' : 'Read Guide' }}</span>
              <ArrowRight class="w-5 h-5" />
            </div>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-else class="py-40 text-center space-y-6">
        <Rocket class="w-16 h-16 text-primary/20 mx-auto animate-bounce" />
        <p class="text-muted font-bold text-xl">{{ i18n.t('no_posts_found') || 'No se han encontrado guías.' }}</p>
      </div>

      <!-- Pagination (Modern Minimal) -->
      <div v-if="totalPages > 1" class="mt-32 flex flex-col items-center gap-10">
        <div class="flex items-center gap-4">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="p-6 rounded-full bg-surface border border-border/20 text-muted hover:text-foreground disabled:opacity-10 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          
          <div class="flex gap-3">
            <span 
              v-for="p in totalPages" 
              :key="p"
              @click="currentPage = p"
              class="w-3 h-3 rounded-full cursor-pointer transition-all duration-500"
              :class="currentPage === p ? 'bg-primary w-12' : 'bg-muted/20 hover:bg-muted/40'"
            ></span>
          </div>

          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="p-6 rounded-full bg-surface border border-border/40 text-muted hover:text-foreground disabled:opacity-10 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>

    <!-- Footer link back -->
    <footer class="py-20 border-t border-border/10 w-full flex flex-col items-center gap-8 bg-surface-dark/5">
      <router-link :to="`/${i18n.locale}`" class="text-xs font-black text-muted hover:text-primary transition-all uppercase tracking-widest flex items-center gap-2 group">
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
        {{ i18n.t('el_back_home') }}
      </router-link>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { blogPosts } from '../blogPosts';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, ArrowRight, ArrowLeft, Rocket } from 'lucide-vue-next';
import LanguageToggle from './LanguageToggle.vue';

const i18n = useI18nStore();
const authStore = useAuthStore();

const isRead = (slug) => {
  if (!authStore.user || !authStore.user.read_blogs) return false;
  return authStore.user.read_blogs.includes(slug);
};

const currentPage = ref(1);
const postsPerPage = 6; // Fewer posts per page for better focus
const loadedImages = reactive({});

const sortedPosts = computed(() => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  return blogPosts
    .filter(post => post.date <= todayStr)
    .sort((a, b) => {
      if (a.isPillar && !b.isPillar) return -1;
      if (!a.isPillar && b.isPillar) return 1;
      return new Date(b.date) - new Date(a.date);
    });
});

const totalPages = computed(() => Math.ceil(sortedPosts.value.length / postsPerPage));

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage;
  const end = start + postsPerPage;
  return sortedPosts.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<style scoped>
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* Ensure the background matches the Reppy theme but cleaner */
.bg-background {
  background-color: #0c0d0d; /* Reppy's deep abyss */
}
</style>
