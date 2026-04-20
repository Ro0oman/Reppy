<template>
  <div class="min-h-screen bg-background selection:bg-primary/30 flex flex-col items-center">
    <!-- Progress Bar -->
    <div class="fixed top-0 left-0 w-full h-1 z-50 bg-surface/50 overflow-hidden">
      <div 
        class="h-full bg-primary transition-all duration-300 ease-out"
        :style="{ width: `${scrollProgress}%` }"
      ></div>
    </div>

    <!-- Navigation Breadcrumbs -->
    <nav class="w-full max-w-3xl px-6 pt-12 pb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted/40 animate-in">
      <router-link :to="`/${i18n.locale}`" class="hover:text-primary transition-colors">{{ i18n.t('nav_home') }}</router-link>
      <ChevronRight class="w-3 h-3 opacity-20" />
      <router-link :to="`/${i18n.locale}/codex`" class="hover:text-primary transition-colors uppercase">{{ i18n.t('nav_codex') }}</router-link>
      <ChevronRight class="w-3 h-3 opacity-20" />
      <span class="text-foreground/60 truncate max-w-[200px] md:max-w-none">{{ post.title }}</span>
    </nav>

    <!-- Hero Header (WhatsApp Style) -->
    <header class="w-full max-w-3xl px-6 py-16 flex flex-col items-center text-center space-y-8 animate-in">
      <div class="flex flex-col items-center gap-3">
        <span class="text-[10px] font-black tracking-[0.4em] text-primary uppercase bg-primary/5 px-4 py-1.5 rounded-full ring-1 ring-primary/20">
          {{ currentPost.category }} — {{ formattedDate }}
        </span>
      </div>
      
      <h1 class="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.15] max-w-2xl">
        {{ post.title }}
      </h1>

      <!-- Knowledge Acquired Badge -->
      <div v-if="isRead" class="inline-flex items-center gap-2 px-6 py-2 bg-primary/20 border-2 border-primary/40 rounded-2xl animate-pulse shadow-[0_0_30px_rgba(var(--primary-500-rgb),0.2)]">
        <BookOpenCheck class="w-5 h-5 text-primary" />
        <span class="text-[11px] font-black tracking-[0.2em] text-primary uppercase italic">{{ i18n.t('intelecto_adquirido') }}</span>
      </div>

      <div class="flex items-center justify-center gap-6 text-[11px] font-black uppercase tracking-widest text-muted/60">
        <div class="flex items-center gap-2">
          <User class="w-3.5 h-3.5" />
          <span>{{ currentPost.author }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Clock class="w-3.5 h-3.5" />
          <span>5 {{ i18n.t('read_time') }}</span>
        </div>
      </div>
    </header>

    <!-- Main Content Layout (Single Column) -->
    <main class="w-full max-w-3xl px-6 pb-32 space-y-12">
      <!-- Feature Image (Cinematic) -->
      <div class="relative group animate-in-delay">
        <div class="absolute inset-0 bg-primary/10 blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
        <div class="relative rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-surface-dark/20 aspect-video flex items-center justify-center">
          <div v-if="!imageLoaded" class="absolute inset-0 flex items-center justify-center">
            <Loader2 class="w-12 h-12 text-primary animate-spin opacity-50" />
          </div>
          <img 
            :src="currentPost.image" 
            :alt="post.title" 
            class="w-full h-full object-cover transform transition-all duration-1000 group-hover:scale-105"
            :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
            @load="imageLoaded = true"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Article Content (Centered & Focus) -->
      <article class="relative">
        <!-- Floating Table of Contents (Desktop - Subtle) -->
        <div v-if="toc.length > 0" class="hidden xl:block absolute -left-64 top-0 w-48 space-y-4 animate-in-delay-2 p-6 rounded-3xl bg-surface/40 border border-border/20 backdrop-blur-md">
          <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">{{ i18n.t('index_title') || 'Índice' }}</h4>
          <nav class="space-y-3">
            <a 
              v-for="item in toc" 
              :key="item.id" 
              :href="`#${item.id}`"
              class="block text-[11px] font-bold text-muted/60 hover:text-primary transition-all leading-tight border-l-2 border-transparent hover:border-primary pl-3"
              :class="{'ml-3 !font-medium opacity-50': item.level === 3}"
              @click.prevent="scrollTo(item.id)"
            >
              {{ item.text }}
            </a>
          </nav>
        </div>

        <!-- Content -->
        <div 
          class="prose prose-lg dark:prose-invert max-w-none 
          prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
          prose-p:text-lg prose-p:leading-[1.8] prose-p:text-muted/90 prose-p:font-medium
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-black
          prose-strong:text-foreground prose-strong:font-black
          prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-3xl prose-blockquote:not-italic
          prose-img:rounded-[2rem] prose-img:shadow-xl prose-img:border prose-img:border-white/5" 
          v-html="renderedContent"
        ></div>

        <!-- Social Share Bar (Below Content) -->
        <div class="mt-16 pt-12 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-8 animate-in">
          <div class="flex items-center gap-4">
            <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ i18n.t('share_knowledge') }}</span>
            <div class="flex items-center gap-2">
              <button @click="shareTwitter" class="w-10 h-10 rounded-full bg-surface border border-border/40 flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"><Twitter class="w-4 h-4" /></button>
              <button @click="sharePost" class="w-10 h-10 rounded-full bg-surface border border-border/40 flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"><Share2 class="w-4 h-4" /></button>
              <button @click="shareWhatsapp" class="w-10 h-10 rounded-full bg-surface border border-border/40 flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"><MessageCircle class="w-4 h-4" /></button>
            </div>
          </div>

          <div v-if="tags.length > 0" class="flex flex-wrap gap-2 justify-center">
            <span v-for="tag in tags" :key="tag" class="px-3 py-1 bg-surface-dark/10 border border-border/40 text-[9px] font-black uppercase tracking-widest text-muted/60 rounded-lg">
              #{{ tag }}
            </span>
          </div>
        </div>
      </article>

      <!-- Dynamic CTA Section -->
      <div v-if="ctaTarget" class="p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-[3rem] border border-primary/20 text-center space-y-8 animate-in ring-1 ring-primary/10">
        <div class="space-y-4">
          <h3 class="text-3xl font-black text-foreground tracking-tight">{{ ctaHeader }}</h3>
          <p class="text-muted text-lg max-w-md mx-auto">{{ ctaSub }}</p>
        </div>
        <button @click="router.push(ctaTarget)" class="btn-reppy !px-16 !py-4 !text-base shadow-[0_0_40px_rgba(var(--primary-500-rgb),0.2)] hover:shadow-primary/40">{{ ctaLabel }}</button>
      </div>

      <!-- Related Pillar (Master Guide) -->
      <div v-if="!currentPost.isPillar && relatedPillar" class="p-8 bg-surface/40 hover:bg-surface/60 border border-border/40 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 transition-colors group animate-in">
        <div class="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg bg-surface-dark/10 relative flex items-center justify-center">
          <img :src="relatedPillar.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
        <div class="space-y-2 text-center md:text-left">
          <span class="text-[10px] font-black uppercase tracking-widest text-primary">{{ i18n.t('master_guide') || 'Guía Maestra' }}</span>
          <h4 class="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{{ (relatedPillar.locales[i18n.locale] || relatedPillar.locales.en).title }}</h4>
          <router-link :to="`/blog/${relatedPillar.slug}`" class="inline-flex items-center gap-2 text-sm font-black text-primary hover:underline">
            {{ i18n.t('blog_read_ultimate') }}
            <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>
      </div>
    </main>

    <!-- Footer Mobile Navigation -->
    <footer class="py-20 border-t border-border/10 w-full flex flex-col items-center gap-8 bg-surface-dark/5 mt-auto text-center">
      <router-link :to="`/${i18n.locale}`" class="text-2xl font-black text-foreground flex items-center gap-2 group">
        <div class="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-[12px] text-white">R</div>
        Reppy<span class="text-primary group-hover:translate-x-1 transition-transform">.</span>
      </router-link>
      <div class="flex items-center gap-8">
        <router-link :to="`/${i18n.locale}/codex`" class="text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors">{{ i18n.t('nav_codex') }}</router-link>
        <router-link :to="`/${i18n.locale}/login`" class="text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors text-primary">{{ i18n.t('start_free') }}</router-link>
      </div>
      <p class="text-[9px] font-black text-muted/30 uppercase tracking-[0.4em]">&copy; 2026 Reppy Ecosystem</p>
    </footer>

    <!-- JSON-LD Injection (Hidden) -->
    <div v-html="jsonLdScript" v-if="jsonLdScript"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  User, Clock, ChevronRight, ArrowRight,
  Share2, Twitter, MessageCircle,
  Loader2, BookOpenCheck
} from 'lucide-vue-next';
import { marked } from 'marked';
import { blogPosts } from '../blogPosts';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const i18n = useI18nStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const isRead = computed(() => {
  if (!authStore.user || !authStore.user.read_blogs) return false;
  return authStore.user.read_blogs.includes(route.params.slug);
});

const imageLoaded = ref(false);

const currentPost = computed(() => {
  const slug = route.params.slug;
  const found = blogPosts.find(p => p.slug === slug);
  return found || blogPosts[0];
});

const post = computed(() => {
  return currentPost.value.locales[i18n.locale] || currentPost.value.locales.en;
});

const tags = computed(() => post.value.keywords || []);

const renderedContent = computed(() => {
  if (!post.value || !post.value.content) return '';
  // Strip the first H1 to avoid redundancy
  let cleanContent = post.value.content.replace(/^# .*\n?/, '');
  
  marked.use({
    renderer: {
      heading(token) {
        const text = this.parser.parseInline(token.tokens);
        const id = token.text.toLowerCase().replace(/[^\w]+/g, '-');
        return `<h${token.depth} id="${id}">${text}</h${token.depth}>`;
      }
    }
  });

  return marked.parse(cleanContent);
});

// TOC Generation
const toc = computed(() => {
  if (!post.value || !post.value.content) return [];
  const lines = post.value.content.split('\n');
  const items = [];
  
  lines.forEach(line => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      items.push({ id, text, level });
    }
  });
  
  return items;
});

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    window.scrollTo({
      top: el.offsetTop - 40,
      behavior: 'smooth'
    });
  }
};

const relatedPillar = computed(() => {
  if (currentPost.value.isPillar) return null;
  return blogPosts.find(p => p.isPillar && p.category === currentPost.value.category);
});

// Dynamic CTAs
const ctaTarget = computed(() => {
  const cat = currentPost.value.category;
  if (cat === 'dominadas') return '/contador-dominadas';
  if (cat === 'flexiones') return '/contador-flexiones';
  if (cat === 'principiantes' || cat === 'rpg' || cat === 'habitos') return '/app-calistenia';
  return '/dashboard';
});

const ctaHeader = computed(() => {
  const cat = currentPost.value.category;
  if (cat === 'dominadas') return '¿Fuerza máxima?';
  if (cat === 'flexiones') return '¿Pecho de acero?';
  return 'Sube de nivel';
});

const ctaSub = computed(() => {
  const cat = currentPost.value.category;
  if (cat === 'dominadas') return 'Registra tus dominadas y compite contra el resto del mundo.';
  if (cat === 'flexiones') return 'Mide cada repetición y derriba a los jefes de calistenia.';
  return 'Entra en el ecosistema Reppy y gamifica tu entrenamiento hoy mismo.';
});

const ctaLabel = computed(() => {
  const cat = currentPost.value.category;
  if (cat === 'dominadas') return 'Contar Dominadas';
  if (cat === 'flexiones') return 'Contar Flexiones';
  return 'Empezar RPG';
});

const formattedDate = computed(() => {
  if (!currentPost.value) return '';
  const date = new Date(currentPost.value.date);
  return new Intl.DateTimeFormat(i18n.locale === 'es' ? 'es-ES' : 'en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
});

// JSON-LD for SEO
const jsonLdScript = computed(() => {
  if (!post.value) return '';
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.value.title,
    "description": post.value.excerpt,
    "image": [`https://reppy.fit${currentPost.value.image}`],
    "datePublished": currentPost.value.date,
    "author": [{
      "@type": "Person",
      "name": currentPost.value.author
    }]
  };
  return `<script type="application/ld+json">${JSON.stringify(structuredData)}<\/script>`;
});

// Dynamic SEO Tags
const updateSEOMeta = () => {
  if (!post.value) return;
  document.title = `${post.value.title} | Reppy`;
};

watch(() => i18n.locale, updateSEOMeta);
watch(() => route.params.slug, updateSEOMeta);

// Scroll Progress
const scrollProgress = ref(0);
const updateScroll = () => {
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = (winScroll / height) * 100;
};

// Social Functions
const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=1200&q=80';
};

const sharePost = async () => {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: post.value.title, url });
    } catch (err) { console.error(err); }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      notificationStore.notify('¡Enlace copiado!', 'success');
    } catch (err) { console.error(err); }
  }
};

const shareTwitter = () => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(post.value.title);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
};

const shareWhatsapp = () => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(post.value.title + ": ");
  window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank');
};

const recordBlogRead = async () => {
  const slug = route.params.slug;
  if (!slug) return;
  try {
    const response = await axios.post('/api/blog-tracking/read', { slug });
    if (response.data.isFirstRead) {
      notificationStore.notify(i18n.t('blog_xp_gained'), 'success');
      await authStore.fetchProfile();
    }
  } catch (error) {}
};

onMounted(() => {
  window.addEventListener('scroll', updateScroll);
  recordBlogRead();
  updateSEOMeta();
  window.scrollTo(0, 0);
});

watch(() => route.params.slug, () => {
  recordBlogRead();
  window.scrollTo(0, 0);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll);
});
</script>

<style scoped>
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-in-delay { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
.animate-in-delay-2 { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }

@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* Typography Enhancements */
:deep(.prose) h2 { @apply text-4xl font-black mt-16 mb-8 text-foreground tracking-tight; }
:deep(.prose) h3 { @apply text-2xl font-bold mt-10 mb-6 text-foreground/90; }
:deep(.prose) p { @apply text-lg text-muted/90 leading-[1.8] mb-8 font-medium; }
:deep(.prose) a { @apply text-primary font-black transition-all border-b-2 border-primary/20 hover:border-primary; }
:deep(.prose) strong { @apply text-foreground font-black; }
:deep(.prose) ul { @apply list-none space-y-4 mb-8; }
:deep(.prose) li { @apply relative pl-8 text-lg text-muted/90 leading-relaxed font-medium; }
:deep(.prose) li::before { content: '→'; @apply absolute left-0 text-primary font-black; }
</style>
