<template>
  <div class="min-h-screen bg-background selection:bg-primary/30 overflow-x-hidden flex flex-col items-center text-foreground relative">
    <!-- Navigation -->
    <nav class="w-full max-w-7xl px-6 py-8 flex items-center justify-between z-50 animate-in">
      <router-link :to="`/${i18n.locale}`" class="flex items-center gap-3 group">
        <div class="w-8 h-8 bg-primary rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">R</div>
        <span class="text-xl font-black tracking-tight text-foreground uppercase italic">Reppy</span>
      </router-link>
      <div class="flex items-center gap-6">
        <router-link :to="`/${i18n.locale}/login`" class="hidden md:block text-xs font-black uppercase tracking-widest text-muted hover:text-primary transition-colors">
          {{ i18n.locale === 'es' ? 'ENTRAR' : 'LOG IN' }}
        </router-link>
        <LanguageToggle />
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative w-full pt-12 pb-24 px-6 overflow-hidden border-b border-white/5">
      <!-- Ambient Glows -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto relative z-10 text-center space-y-10">
        <!-- Badge -->
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div class="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <span class="text-[9px] sm:text-[10px] font-black text-muted uppercase tracking-[0.3em]">REPPY <span class="text-primary-500">MISIONES</span> DIARIAS</span>
          </div>
        </div>

        <!-- Headline -->
        <div class="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <h1 class="text-5xl md:text-8xl font-black italic tracking-tighter text-foreground uppercase leading-[0.85] drop-shadow-2xl">
            {{ i18n.locale === 'es' ? 'CONSTRUYE TU' : 'BUILD YOUR' }} <br/>
            <span class="bg-gradient-to-r from-primary-500 via-blue-400 to-emerald-500 bg-clip-text text-transparent">
              {{ i18n.locale === 'es' ? 'MEJOR VERSIÓN' : 'BEST VERSION' }}
            </span>
          </h1>
          <p class="text-lg md:text-2xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
            {{ i18n.locale === 'es' 
                ? 'Aprende a entrenar, sube de nivel y conviértete en un héroe de la calistenia.' 
                : 'Learn to train, level up, and become a calisthenics hero.' 
            }}
          </p>
        </div>

        <!-- Hero Stats/FOMO -->
        <div class="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-8 opacity-60 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div class="text-center">
            <div class="text-2xl font-black text-foreground">1.2M+</div>
            <div class="text-[9px] font-bold text-muted uppercase tracking-widest">{{ i18n.locale === 'es' ? 'REPETICIONES' : 'REPETITIONS' }}</div>
          </div>
          <div class="w-px h-8 bg-white/10 hidden sm:block"></div>
          <div class="text-center">
            <div class="text-2xl font-black text-foreground">+5,400</div>
            <div class="text-[9px] font-bold text-muted uppercase tracking-widest">{{ i18n.locale === 'es' ? 'ATLETAS ACTIVOS' : 'ACTIVE ATHLETES' }}</div>
          </div>
          <div class="w-px h-8 bg-white/10 hidden sm:block"></div>
          <div class="text-center">
            <div class="text-2xl font-black text-foreground">100%</div>
            <div class="text-[9px] font-bold text-muted uppercase tracking-widest">{{ i18n.locale === 'es' ? 'GRATIS' : 'FREE' }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <main class="max-w-7xl w-full px-6 py-24 space-y-32">
      
      <!-- Hero Post -->
      <div v-if="featuredPost" class="animate-in">
        <router-link 
          :to="`/${i18n.locale}/blog/${featuredPost.slug}`"
          class="relative group block w-full aspect-[21/9] md:aspect-[3/1] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-surface-dark/10"
        >
          <img 
            :src="featuredPost.image" 
            class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            @load="loadedImages[featuredPost.slug] = true"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-8 md:p-16 space-y-4 max-w-3xl">
            <div class="flex items-center gap-4">
              <span class="px-3 py-1 bg-primary text-[9px] font-black uppercase tracking-widest rounded-full">{{ featuredPost.category }}</span>
              <span class="text-[10px] font-bold text-white/60 uppercase tracking-widest">{{ i18n.locale === 'es' ? 'APRENDER' : 'LEARN' }}</span>
            </div>
            <h2 class="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none group-hover:text-primary transition-colors">
              {{ featuredPost.locales[i18n.locale]?.title || featuredPost.locales.en.title }}
            </h2>
            <p class="text-lg text-white/70 font-medium line-clamp-2 max-w-xl">
              {{ featuredPost.locales[i18n.locale]?.excerpt || featuredPost.locales.en.excerpt }}
            </p>
          </div>
        </router-link>
      </div>

      <!-- Blog Grid -->
      <div v-if="gridPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
        <template v-for="(post, index) in gridPosts" :key="post.slug">
          <!-- Inject Conversion Card in the middle of the first page -->
          <div v-if="currentPage === 1 && index === 2" class="col-span-full md:col-span-2 py-12">
            <div class="relative p-12 md:p-20 rounded-[3rem] overflow-hidden border border-white/10 bg-surface-dark/40 group">
              <div class="absolute inset-0 bg-primary/5 blur-[100px] -translate-x-1/2"></div>
              <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div class="space-y-6 text-center md:text-left">
                  <h3 class="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                    {{ i18n.locale === 'es' ? '¿QUIERES MÁS FUERZA?' : 'WANT MORE STRENGTH?' }}
                  </h3>
                  <p class="text-xl text-muted font-medium max-w-md">
                    {{ i18n.locale === 'es' 
                        ? 'Entrena con misiones RPG, sube de nivel y compite con la comunidad.' 
                        : 'Train with RPG missions, level up, and compete with the community.' 
                    }}
                  </p>
                </div>
                <button @click="router.push(`/${i18n.locale}/login`)" class="btn-reppy !px-16 !py-5 !text-lg shadow-[0_20px_60px_rgba(255,69,0,0.3)] transform hover:scale-110 active:scale-95 transition-all">
                  {{ i18n.locale === 'es' ? 'JUGAR GRATIS' : 'PLAY FREE' }}
                </button>
              </div>
            </div>
          </div>

          <router-link 
            :to="`/${i18n.locale}/blog/${post.slug}`" 
            class="group space-y-8 animate-in"
          >
            <div class="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 bg-surface-dark/10 shadow-2xl">
              <img 
                :src="post.image" 
                class="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" 
                :class="loadedImages[post.slug] ? 'opacity-100' : 'opacity-0'"
                @load="loadedImages[post.slug] = true"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div class="space-y-4 px-2">
              <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                <span>{{ post.category }}</span>
                <span class="opacity-20">•</span>
                <span class="text-muted">{{ post.date }}</span>
              </div>
              <h3 class="text-3xl font-black text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight uppercase italic">
                {{ post.locales[i18n.locale]?.title || post.locales.en.title }}
              </h3>
              <p class="text-lg text-muted/60 leading-relaxed font-medium line-clamp-2">
                {{ post.locales[i18n.locale]?.excerpt || post.locales.en.excerpt }}
              </p>
              <div class="pt-4 flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest group-hover:gap-4 transition-all">
                {{ i18n.locale === 'es' ? 'APRENDER' : 'LEARN MORE' }}
                <ArrowRight class="w-4 h-4" />
              </div>
            </div>
          </router-link>
        </template>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pt-24 flex items-center justify-center gap-8">
        <button 
          @click="prevPage" :disabled="currentPage === 1"
          class="p-4 rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-20 transition-all"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>
        <span class="text-[10px] font-black tracking-[0.5em] text-muted uppercase">PÁGINA {{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="nextPage" :disabled="currentPage === totalPages"
          class="p-4 rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-20 transition-all"
        >
          <ChevronRight class="w-6 h-6" />
        </button>
      </div>

    </main>

    <!-- Final conversion section -->
    <section class="w-full py-32 border-t border-white/5 bg-surface-dark/5 text-center">
      <div class="max-w-4xl mx-auto px-6 space-y-12">
        <div class="space-y-6">
          <h2 class="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            {{ i18n.locale === 'es' ? 'EL PRÓXIMO HIT ES EL TUYO' : 'THE NEXT HIT IS YOURS' }}
          </h2>
          <p class="text-xl text-muted font-medium max-w-xl mx-auto">
            {{ i18n.locale === 'es' 
                ? 'Únete a miles de atletas y convierte cada sesión en una misión legendaria.' 
                : 'Join thousands of athletes and turn every session into a legendary mission.' 
            }}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button @click="router.push(`/${i18n.locale}/login`)" class="w-full sm:w-auto btn-reppy !px-16 !py-5 !text-lg">
            {{ i18n.locale === 'es' ? 'EMPEZAR AHORA' : 'START NOW' }}
          </button>
          <router-link :to="`/${i18n.locale}`" class="text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-colors">
            {{ i18n.locale === 'es' ? 'VER LANDING' : 'VIEW LANDING' }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Sticky Bottom CTA (Mobile Only for Guests) -->
    <div v-if="!authStore.isAuthenticated" 
         class="md:hidden fixed bottom-6 left-4 right-4 z-[100] animate-in slide-in-from-bottom-20 duration-1000 delay-1000">
       <button @click="router.push(`/${i18n.locale}/login`)" class="w-full btn-reppy !py-5 shadow-[0_20px_50px_rgba(255,69,0,0.4)]">
         🚀 {{ i18n.locale === 'es' ? 'EMPIEZA GRATIS' : 'START FREE' }}
       </button>
    </div>

    <!-- Footer link back -->
    <footer class="py-12 w-full flex flex-col items-center gap-8 opacity-40">
      <div class="text-[10px] font-black uppercase tracking-[0.5em] text-muted">REPPY ECOSYSTEM &copy; 2026</div>
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
  return blogPosts
    .sort((a, b) => {
      if (a.isPillar && !b.isPillar) return -1;
      if (!a.isPillar && b.isPillar) return 1;
      return new Date(b.date) - new Date(a.date);
    });
});

const featuredPost = computed(() => sortedPosts.value[0]);

const gridPosts = computed(() => {
  const all = [...sortedPosts.value];
  if (all.length === 0) return [];
  
  // If we are on page 1, skip the first post (featured)
  if (currentPage.value === 1) {
    const remaining = all.slice(1);
    return remaining.slice(0, postsPerPage);
  } else {
    const start = (currentPage.value - 1) * postsPerPage;
    return all.slice(start, start + postsPerPage);
  }
});

const totalPages = computed(() => {
  if (sortedPosts.value.length <= 1) return 1;
  // Subtract the featured post from the count for the first page
  return Math.ceil((sortedPosts.value.length - 1) / postsPerPage);
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
