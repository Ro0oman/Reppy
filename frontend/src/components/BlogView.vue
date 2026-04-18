<template>
  <div class="min-h-screen bg-background selection:bg-primary/30 flex flex-col items-center">
    <!-- Progress Bar -->
    <div class="fixed top-0 left-0 w-full h-1 z-50 bg-surface/50 overflow-hidden">
      <div 
        class="h-full bg-primary transition-all duration-300 ease-out"
        :style="{ width: `${scrollProgress}%` }"
      ></div>
    </div>

    <nav class="w-full max-w-6xl px-6 pt-12 pb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted/40">
      <router-link to="/" class="hover:text-primary transition-colors">{{ i18n.t('nav_home') }}</router-link>
      <ChevronRight class="w-3 h-3 opacity-20" />
      <router-link to="/blog" class="hover:text-primary transition-colors">Blog</router-link>
      <ChevronRight class="w-3 h-3 opacity-20" />
      <span class="text-foreground/60 truncate max-w-[200px] md:max-w-none">{{ post.title }}</span>
    </nav>

    <!-- Hero Header -->
    <header class="relative w-full py-20 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
      <div class="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-50"></div>
      <div class="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div class="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="max-w-4xl w-full space-y-6 relative z-10">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-surface/80 border border-border/40 rounded-full mb-6">
          <Calendar class="w-4 h-4 text-primary" />
          <span class="text-[10px] font-black tracking-widest text-muted uppercase">{{ formattedDate }}</span>
        </div>
        
        <h1 class="text-4xl md:text-7xl font-black text-foreground tracking-tight leading-[1.1] mb-4 animate-in">
          {{ post.title }}
        </h1>

        <!-- Knowledge Acquired Badge -->
        <div v-if="isRead" class="inline-flex items-center gap-2 px-6 py-2 bg-primary/20 border-2 border-primary/40 rounded-2xl animate-pulse shadow-[0_0_30px_rgba(var(--primary-500-rgb),0.2)]">
          <BookOpenCheck class="w-5 h-5 text-primary" />
          <span class="text-[11px] font-black tracking-[0.2em] text-primary uppercase italic">{{ i18n.t('intelecto_adquirido') }}</span>
        </div>

        <div class="flex items-center justify-center gap-4 text-sm text-muted font-medium animate-in-delay">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary">
              <User class="w-4 h-4" />
            </div>
            <span>{{ post.author }}</span>
          </div>
          <span class="opacity-20">|</span>
          <div class="flex items-center gap-1.5">
            <Clock class="w-4 h-4" />
            <span>5 {{ i18n.t('read_time') }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Layout -->
    <div class="max-w-7xl w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 pb-32">
      
      <!-- Article Content -->
      <main class="lg:col-span-8 space-y-16">
        <!-- Feature Image -->
        <div class="relative group animate-in-delay-2">
          <!-- Ambient glow -->
          <div class="absolute inset-0 bg-primary/10 blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div class="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-surface-dark/20 ring-1 ring-white/5 flex items-center justify-center min-h-[300px]">
            <!-- Loading Spinner -->
            <div v-if="!imageLoaded" class="absolute inset-0 flex items-center justify-center">
              <Loader2 class="w-12 h-12 text-primary animate-spin opacity-50" />
            </div>

            <img 
              :src="currentPost.image" 
              :alt="post.title" 
              class="w-full h-auto aspect-video object-cover transform transition-all duration-1000 group-hover:scale-105"
              :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
              @load="imageLoaded = true"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- Post Content -->
        <article class="card-stats !p-8 md:!p-16 !rounded-[3rem] animate-in-delay-2 relative">
          <!-- Table of Contents (Mobile & Inline) -->
          <div v-if="toc.length > 0" class="mb-12 p-8 bg-foreground/5 rounded-3xl border border-border/40">
            <h4 class="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <ListIcon class="w-4 h-4" />
              {{ i18n.t('index_title') || 'En esta guía' }}
            </h4>
            <nav class="space-y-4">
              <a 
                v-for="item in toc" 
                :key="item.id" 
                :href="`#${item.id}`"
                class="block text-sm font-bold text-muted hover:text-primary transition-colors pl-4 border-l-2 border-transparent hover:border-primary"
                :class="{'ml-6 !text-xs !font-medium opacity-80': item.level === 3}"
                @click.prevent="scrollTo(item.id)"
              >
                {{ item.text }}
              </a>
            </nav>
          </div>

          <div class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl" v-html="renderedContent"></div>

          <!-- Dynamic CTA Section -->
          <div v-if="ctaTarget" class="mt-16 p-8 bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl border border-primary/20 text-center space-y-6">
            <h3 class="text-2xl font-black text-foreground">{{ ctaHeader }}</h3>
            <p class="text-muted text-sm max-w-md mx-auto">{{ ctaSub }}</p>
            <button @click="router.push(ctaTarget)" class="btn-reppy !px-12">{{ ctaLabel }}</button>
          </div>
        </article>

        <!-- Post Tags (SEO Keywords) -->
        <div class="flex flex-wrap gap-3 mt-12 animate-in">
          <span v-for="tag in post.keywords" :key="tag" class="px-3 py-1 bg-surface-dark/10 border border-border/40 text-[9px] font-black uppercase tracking-widest text-muted rounded-lg">
            #{{ tag }}
          </span>
        </div>

        <!-- Semantic Internal Linking (Read Pillar) -->
        <div v-if="!currentPost.isPillar && relatedPillar" class="mt-12 p-8 bg-surface border border-border/40 rounded-3xl flex flex-col md:flex-row items-center gap-8 animate-in">
          <div class="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg bg-surface-dark/10 relative flex items-center justify-center">
            <div v-if="!pillarLoaded" class="absolute inset-0 flex items-center justify-center">
              <Loader2 class="w-6 h-6 text-primary animate-spin opacity-40" />
            </div>
            <img 
              :src="relatedPillar.image" 
              class="w-full h-full object-cover transition-opacity duration-500" 
              :class="pillarLoaded ? 'opacity-100' : 'opacity-0'"
              @load="pillarLoaded = true"
            />
          </div>
          <div class="space-y-2 text-center md:text-left">
            <span class="text-[10px] font-black uppercase tracking-widest text-primary">{{ i18n.t('master_guide') || 'Guía Maestra' }}</span>
            <h4 class="text-xl font-bold text-foreground">{{ i18n.t('blog_learn_more') }} {{ (relatedPillar.locales[i18n.locale] || relatedPillar.locales.en).title }}</h4>
            <router-link :to="`/blog/${relatedPillar.slug}`" class="inline-block text-sm font-black text-primary hover:underline">{{ i18n.t('blog_read_ultimate') }} &rarr;</router-link>
          </div>
        </div>
      </main>

      <!-- Sidebar (Internal Linking) -->
      <aside class="lg:col-span-4 space-y-10 animate-in-delay-3">
        <div class="card-stats !p-8 space-y-8 !rounded-3xl border-primary/10">
          <h3 class="text-lg font-black text-foreground uppercase tracking-tight italic border-b border-border/40 pb-4">{{ i18n.t('related_protocols') }}</h3>
          
          <div class="space-y-6">
            <router-link to="/contador-dominadas" class="group block space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{{ i18n.t('exercise_king') }}</span>
                <ArrowUpRight class="w-4 h-4 text-muted group-hover:text-primary transition-all" />
              </div>
              <h4 class="text-md font-bold text-foreground group-hover:text-primary transition-colors">{{ i18n.t('pullup_seo_title') }}</h4>
              <p class="text-xs text-muted/60 leading-relaxed">{{ i18n.t('pullup_seo_desc') }}</p>
            </router-link>

            <router-link to="/contador-flexiones" class="group block space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{{ i18n.t('push_power') }}</span>
                <ArrowUpRight class="w-4 h-4 text-muted group-hover:text-accent transition-all" />
              </div>
              <h4 class="text-md font-bold text-foreground group-hover:text-accent transition-colors">{{ i18n.t('pushup_seo_title') }}</h4>
              <p class="text-xs text-muted/60 leading-relaxed">{{ i18n.t('pushup_seo_desc') }}</p>
            </router-link>

            <router-link to="/app-calistenia" class="group block space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{{ i18n.t('full_ecosystem') }}</span>
                <ArrowUpRight class="w-4 h-4 text-muted group-hover:text-blue-500 transition-all" />
              </div>
              <h4 class="text-md font-bold text-foreground group-hover:text-blue-500 transition-colors">{{ i18n.t('rpg_protocol_title') }}</h4>
              <p class="text-xs text-muted/60 leading-relaxed">{{ i18n.t('rpg_protocol_desc') }}</p>
            </router-link>
          </div>
        </div>

        <!-- Social Share CTA -->
        <div class="card-stats !p-8 bg-primary/5 border-primary/20 !rounded-3xl text-center space-y-4">
          <p class="text-xs font-black text-primary uppercase tracking-widest">{{ i18n.t('share_knowledge') }}</p>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <button 
              @click="sharePost"
              class="w-10 h-10 rounded-full bg-surface border border-border/40 flex items-center justify-center text-muted hover:text-primary transition-all"
              :title="i18n.t('copy_link')"
            >
              <Share2 class="w-4 h-4" />
            </button>
            <button 
              @click="shareTwitter"
              class="w-10 h-10 rounded-full bg-surface border border-border/40 flex items-center justify-center text-muted hover:text-primary transition-all"
              :title="i18n.t('share_x')"
            >
              <Twitter class="w-4 h-4" />
            </button>
            <button 
              @click="shareFacebook"
              class="w-10 h-10 rounded-full bg-surface border border-border/40 flex items-center justify-center text-muted hover:text-primary transition-all"
              :title="i18n.t('share_fb')"
            >
              <Facebook class="w-4 h-4" />
            </button>
            <button 
              @click="shareLinkedin"
              class="w-10 h-10 rounded-full bg-surface border border-border/40 flex items-center justify-center text-muted hover:text-primary transition-all"
              :title="i18n.t('share_li')"
            >
              <Linkedin class="w-4 h-4" />
            </button>
            <button 
              @click="shareWhatsapp"
              class="w-10 h-10 rounded-full bg-surface border border-border/40 flex items-center justify-center text-muted hover:text-primary transition-all"
              :title="i18n.t('share_wa')"
            >
              <MessageCircle class="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- CTA Footer -->
    <section class="max-w-4xl w-full px-6 pb-32">
      <div class="p-12 bg-surface/40 border border-border/40 rounded-[3rem] text-center space-y-8 animate-in">
        <h2 class="text-3xl font-black text-foreground tracking-tight">{{ i18n.t('hero_subtitle') }}</h2>
        <p class="text-muted text-lg max-w-xl mx-auto">{{ i18n.t('hero_subtitle') }}</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button @click="router.push('/login')" class="btn-reppy !px-10">{{ i18n.t('start_free') }}</button>
          <button @click="router.push('/')" class="text-sm font-bold text-muted hover:text-foreground transition-colors">{{ i18n.t('back_to_home') }} &rarr;</button>
        </div>
      </div>
    </section>

    <!-- Footer Mobile Navigation (Optional) -->
    <footer class="py-12 border-t border-border/40 w-full text-center mt-auto">
      <router-link to="/" class="text-xs font-black text-muted hover:text-primary transition-all uppercase tracking-widest">
        &copy; 2026 Reppy Ecosystem
      </router-link>
    </footer>

    <!-- JSON-LD Injection (Hidden) -->
    <div v-html="jsonLdScript" v-if="jsonLdScript"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Calendar, User, Clock, ChevronRight, 
  ArrowUpRight, Share2, Twitter, Facebook, Linkedin, MessageCircle,
  List as ListIcon, Loader2, BookOpenCheck
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
const pillarLoaded = ref(false);

const currentPost = computed(() => {
  const slug = route.params.slug;
  const today = new Date();
  const found = blogPosts.find(p => p.slug === slug);
  
  // If post found but it's in the future, return null or redirect
  if (found && new Date(found.date) > today) {
    router.replace('/blog');
    return blogPosts[0]; // Temporary fallback while redirecting
  }
  
  return found || blogPosts[0];
});

const post = computed(() => {
  return currentPost.value.locales[i18n.locale] || currentPost.value.locales.en;
});

const renderedContent = computed(() => {
  if (!post.value || !post.value.content) return '';
  // Strip the first H1 to avoid redundancy with the header
  let cleanContent = post.value.content.replace(/^# .*\n?/, '');
  
  // Custom Table rendering Enhancement for TOC
  marked.use({
    renderer: {
      heading(token) {
        if (!token.depth) {
            // Fallback for older versions if somehow loaded
            const text = arguments[0];
            const level = arguments[1];
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            return `<h${level} id="${id}">${text}</h${level}>`;
        }
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
      top: el.offsetTop - 100,
      behavior: 'smooth'
    });
  }
};

// Internal Linking (Pillar mapping)
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
    "image": [`https://reppy.vercel.app${post.value.image}`],
    "datePublished": post.value.date,
    "author": [{
      "@type": "Organization",
      "name": "Reppy editorial",
      "url": "https://reppy.vercel.app"
    }]
  };
  return `<script type="application/ld+json">${JSON.stringify(structuredData)}<\/script>`;
});

// Scroll Progress
const scrollProgress = ref(0);
const updateScroll = () => {
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = (winScroll / height) * 100;
};

// Social Functions
const handleImageError = (e) => {
  console.warn('[REPPY_IMAGE_RECOVERY] Local asset not found, switching to production fallback.');
  // High quality calisthenics fallback from Unsplash
  e.target.src = 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=1200&q=80';
};

const sharePost = async () => {
  const url = window.location.href;
  const title = post.value.title;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: post.value.excerpt,
        url,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      alert('¡Enlace copiado al portapapeles!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
};

const shareTwitter = () => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(post.value.title + " via @ReppyApp");
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  window.open(twitterUrl, '_blank');
};

const shareFacebook = () => {
  const url = encodeURIComponent(window.location.href);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  window.open(facebookUrl, '_blank');
};

const shareLinkedin = () => {
  const url = encodeURIComponent(window.location.href);
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  window.open(linkedinUrl, '_blank');
};

const shareWhatsapp = () => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(post.value.title + ": ");
  const whatsappUrl = `https://api.whatsapp.com/send?text=${text}${url}`;
  window.open(whatsappUrl, '_blank');
};

const recordBlogRead = async () => {
  const slug = route.params.slug;
  if (!slug) return;
  try {
    const response = await axios.post('/api/blog-tracking/read', { slug });
    if (response.data.isFirstRead) {
      console.log('[REPPY_RPG] INT XP awarded for reading:', slug);
      notificationStore.notify(i18n.t('blog_xp_gained'), 'success');
      await authStore.fetchProfile();
    }
  } catch (error) {
    // Silently fail if not logged in or already read
  }
};

onMounted(() => {
  window.addEventListener('scroll', updateScroll);
  
  // RPG: Track Blog Read
  recordBlogRead();

  // Set SEO tags manually
  document.title = `${post.value.title} | Reppy Blog`;
  
  // Add Meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = post.value.excerpt;

  // Add OG tags
  const addOg = (property, content) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.content = content;
  };

  addOg('og:title', post.value.title);
  addOg('og:description', post.value.excerpt);
  addOg('og:image', post.value.image);
  addOg('og:type', 'article');
});

// Watch for slug changes to record reads on navigation
watch(() => route.params.slug, () => {
  recordBlogRead();
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll);
});
</script>

<style scoped>
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-in-delay { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
.animate-in-delay-2 { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
.animate-in-delay-3 { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; opacity: 0; }
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* Custom Markdown Styling */
:deep(.prose) h2 { @apply text-3xl font-black mt-12 mb-6 text-foreground tracking-tight border-l-4 border-primary pl-6; }
:deep(.prose) h3 { @apply text-2xl font-bold mt-8 mb-4 text-foreground/90; }
:deep(.prose) p { @apply text-lg text-muted/80 leading-relaxed mb-6 font-medium; }
:deep(.prose) a { @apply text-primary font-bold transition-all border-b border-primary/20 hover:border-primary/60; }
:deep(.prose) strong { @apply text-foreground font-black; }
:deep(.prose) ul { @apply list-disc list-inside space-y-4 mb-8 text-muted/80; }
:deep(.prose) li { @apply leading-relaxed; }
</style>
