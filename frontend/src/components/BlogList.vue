<template>
  <div class="min-h-screen bg-deep-abyss selection:bg-primary-500 overflow-x-hidden flex flex-col items-center font-industrial text-foreground relative">
    
    <!-- Fixed Navigation Replacement (Aesthetic) -->
    <nav class="w-full max-w-7xl px-6 py-10 flex items-center justify-between z-10">
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/20 transition-transform group-hover:scale-110">R</div>
        <span class="text-xl font-bold tracking-tight text-foreground">Reppy<span class="text-primary-500">.</span></span>
      </router-link>
      <LanguageToggle />
    </nav>

    <!-- Header -->
    <header class="max-w-7xl w-full px-6 py-20 text-left space-y-6">
      <h1 class="text-5xl md:text-8xl font-black tracking-tight text-foreground leading-none uppercase italic">
        {{ i18n.t('blog_list_title').split(' ')[0] }} <span class="text-primary-500">{{ i18n.t('blog_list_title').split(' ').slice(1).join(' ') }}</span>
      </h1>
      <p class="text-xl text-muted max-w-2xl leading-relaxed font-medium">
        {{ i18n.t('blog_list_subtitle') }}
      </p>
    </header>

    <!-- Blog Grid -->
    <section class="max-w-7xl w-full px-6 pb-32">
      <div v-if="paginatedPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <router-link 
          v-for="post in paginatedPosts" 
          :key="post.slug" 
          :to="`/blog/${post.slug}`" 
          class="group card-stats !p-0 overflow-hidden flex flex-col border-border/40 hover:border-primary-500/40"
        >
          <div class="relative aspect-video overflow-hidden bg-surface-dark/20 flex items-center justify-center">
            <!-- Loading Spinner -->
            <div v-if="!loadedImages[post.slug]" class="absolute inset-0 flex items-center justify-center">
              <Loader2 class="w-8 h-8 text-primary-500/40 animate-spin" />
            </div>

            <img 
              :src="post.image" 
              :alt="post.locales[i18n.locale]?.title" 
              class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
              :class="loadedImages[post.slug] ? 'opacity-100' : 'opacity-0'"
              @load="loadedImages[post.slug] = true"
              @error="(e) => { 
                loadedImages[post.slug] = true;
                e.target.src = 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=800&q=60';
              }"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
          </div>
          <div class="p-8 space-y-4 flex-grow flex flex-col">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ post.date }}</span>
              <span class="text-[9px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2 py-0.5 rounded-md">{{ i18n.t('trending') }}</span>
            </div>
            <h3 class="text-xl font-bold text-foreground group-hover:text-primary-500 transition-colors leading-tight">
              {{ post.locales[i18n.locale]?.title || post.locales.en.title }}
            </h3>
            <p class="text-sm text-muted/60 leading-relaxed line-clamp-3">
              {{ post.locales[i18n.locale]?.excerpt || post.locales.en.excerpt }}
            </p>

            <!-- Knowledge Acquired Badge -->
            <div v-if="isRead(post.slug)" class="pt-4 mt-auto border-t border-primary-500/10 flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
              <span class="text-[9px] font-black text-primary-500 uppercase tracking-[0.2em] italic">
                {{ i18n.t('intelecto_adquirido') }}
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-20 flex flex-col items-center gap-6">
        <div class="flex items-center gap-4">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="p-4 rounded-2xl bg-surface border border-border/40 text-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          
          <div class="flex gap-2">
            <span 
              v-for="p in totalPages" 
              :key="p"
              class="w-2 h-2 rounded-full transition-all"
              :class="currentPage === p ? 'bg-primary-500 w-8' : 'bg-border/40'"
            ></span>
          </div>

          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="p-4 rounded-2xl bg-surface border border-border/40 text-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
        </div>
        <p class="text-[10px] font-black text-muted uppercase tracking-[0.3em]">
          {{ i18n.t('nav_social').split(' ')[0] }} {{ currentPage }} / {{ totalPages }}
        </p>
      </div>
    </section>

    <!-- Footer link back -->
    <footer class="py-20 border-t border-border/40 w-full text-center">
      <router-link to="/" class="text-xs font-black text-primary-500 hover:text-white transition-all uppercase tracking-widest">
        &larr; {{ i18n.t('el_back_home') }}
      </router-link>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { blogPosts } from '../blogPosts';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-vue-next';
import LanguageToggle from './LanguageToggle.vue';

const i18n = useI18nStore();
const authStore = useAuthStore();

const isRead = (slug) => {
  if (!authStore.user || !authStore.user.read_blogs) return false;
  return authStore.user.read_blogs.includes(slug);
};

const currentPage = ref(1);
const postsPerPage = 10;
const loadedImages = reactive({});

const sortedPosts = computed(() => {
  const today = new Date();
  return blogPosts
    .filter(post => new Date(post.date) <= today)
    .sort((a, b) => {
      // Prioritize pillar posts (How to do my first X)
      if (a.isPillar && !b.isPillar) return -1;
      if (!a.isPillar && b.isPillar) return 1;
      // Then sort by date
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
</script>

<style scoped>
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
