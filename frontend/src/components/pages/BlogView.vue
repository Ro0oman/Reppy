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
      
      <h1 class="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.15] max-w-2xl">
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
    <main class="w-full max-w-3xl px-6 pb-24 space-y-6">
      <!-- Feature Image (Cinematic) -->
      <div class="relative group animate-in-delay">
        <div class="absolute inset-0 bg-primary/10 blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
        <div class="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-surface-dark/20 aspect-video flex items-center justify-center">
          <div v-if="!imageLoaded" class="absolute inset-0 flex items-center justify-center">
            <Loader2 class="w-12 h-12 text-primary animate-spin opacity-50" />
          </div>
          <img
            :src="currentPost.image"
            :alt="post.title"
            class="w-full h-full object-cover transform transition-all duration-1000 group-hover:scale-105"
            :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
            loading="eager"
            fetchpriority="high"
            width="1200"
            height="675"
            @load="imageLoaded = true"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Article Content (Centered & Focus) -->
      <article class="relative">
        <!-- Floating Table of Contents (Desktop - Subtle) -->
        <div v-if="toc.length > 0" class="hidden xl:block absolute -left-64 top-0 w-48 space-y-4 animate-in-delay-2 p-6 rounded-3xl bg-surface/40 border border-border/20 backdrop-blur-md">
          <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">{{ i18n.locale === 'en' ? 'Index' : 'Índice' }}</h4>
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
          prose-img:rounded-xl prose-img:shadow-xl prose-img:border prose-img:border-white/5" 
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
            <span v-for="tag in tags" :key="tag" class="px-3 py-1 bg-surface-dark/10 border border-border/40 text-xs font-black uppercase tracking-widest text-muted/60 rounded-lg">
              #{{ tag }}
            </span>
          </div>
        </div>
      </article>

      <!-- Dynamic CTA Section (Conversion Engine) -->
      <div v-if="ctaTarget" class="relative group p-8 md:p-16 rounded-2xl overflow-hidden border border-white/10 animate-in">
        <!-- Background accents -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-50"></div>
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
        
        <div class="relative z-10 text-center space-y-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
            <Sparkles class="w-3 h-3" />
            {{ i18n.locale === 'es' ? 'MEJORA MÁS RÁPIDO' : 'LEVEL UP FASTER' }}
          </div>
          
          <div class="space-y-4">
            <h3 class="text-3xl md:text-5xl font-bold text-foreground tracking-tighter   leading-none">
              {{ ctaHeader }}
            </h3>
            <p class="text-muted text-lg max-w-md mx-auto font-medium leading-relaxed">
              {{ ctaSub }}
            </p>
          </div>

          <div class="flex flex-col items-center gap-6">
            <button @click="router.push(ctaTarget)" class="btn-reppy !px-16 !py-5 !text-lg shadow-[0_20px_50px_hsl(var(--primary) / 0.3)] hover:shadow-primary/50 transition-all transform hover:scale-105 active:scale-95">
              {{ ctaLabel }}
            </button>
            
            <div class="flex items-center gap-3 opacity-60">
              <div class="flex -space-x-2">
                <img v-for="i in 3" :key="i" :src="`https://ui-avatars.com/api/?name=User+${i}&background=random&color=fff`" alt="" aria-hidden="true" class="w-6 h-6 rounded-full border-2 border-background" />
              </div>
              <span class="text-[10px] font-bold text-muted uppercase tracking-wider">
                {{ i18n.locale === 'es' ? '+5,420 atletas ya compiten hoy' : '+5,420 athletes competing today' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Pillar (Master Guide) -->
      <div v-if="!currentPost.isPillar && relatedPillar" class="p-8 bg-surface/40 hover:bg-surface/60 border border-border/40 rounded-2xl flex flex-col md:flex-row items-center gap-8 transition-colors group animate-in">
        <div class="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg bg-surface-dark/10 relative flex items-center justify-center">
          <img :src="relatedPillar.image" :alt="(relatedPillar.locales[i18n.locale] || relatedPillar.locales.en).title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" width="400" height="300" />
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
      <router-link :to="`/${i18n.locale}`" class="text-2xl font-bold text-foreground flex items-center gap-2 group">
        <div class="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-[12px] text-white">R</div>
        Reppy<span class="text-primary group-hover:translate-x-1 transition-transform">.</span>
      </router-link>
      <div class="flex items-center gap-8">
        <router-link :to="`/${i18n.locale}/codex`" class="text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors">{{ i18n.t('nav_codex') }}</router-link>
        <router-link :to="`/${i18n.locale}/login`" class="text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors text-primary">{{ i18n.t('start_free') }}</router-link>
      </div>
      <p class="text-xs font-black text-muted/30 uppercase tracking-[0.4em]">&copy; 2026 Reppy Ecosystem</p>
    </footer>

    <!-- JSON-LD Injection (Hidden) -->
    <div v-html="jsonLdScript" v-if="jsonLdScript"></div>

    <!-- Sticky Bottom CTA (Mobile Only for Guests) -->
    <div v-if="!authStore.isAuthenticated" 
         class="md:hidden fixed bottom-6 left-4 right-4 z-[100] animate-in slide-in-from-bottom-20 duration-1000 delay-1000">
       <button @click="router.push('/login')" class="w-full btn-reppy !py-5 shadow-[0_20px_50px_hsl(var(--primary) / 0.4)]">
         🚀 {{ i18n.locale === 'es' ? 'JUGAR Y GANAR XP' : 'PLAY & EARN XP' }}
       </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  User, Clock, ChevronRight, ArrowRight,
  Share2, Twitter, MessageCircle,
  Loader2, BookOpenCheck, Sparkles
} from 'lucide-vue-next';
import { marked } from 'marked';
import { blogPosts } from '@/blogPosts';
import { useI18nStore } from '@/stores/i18n';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
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

// ── Branded SVG Infographics ────────────────────────────────────────────────
const INFOGRAPHICS = {
  'pullup-steps-es': `<a href="/es/contador-dominadas" style="display:block;text-decoration:none;margin:2rem 0"><svg viewBox="0 0 820 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Técnica de dominada en 4 pasos - Contador de dominadas gratis en Reppy" style="width:100%;border-radius:16px;background:#0d0d16"><rect width="820" height="300" fill="#0d0d16" rx="16"/><rect x="0" y="0" width="820" height="52" fill="#0a0a12" rx="16"/><rect x="0" y="36" width="820" height="16" fill="#0a0a12"/><text x="410" y="33" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="13" font-weight="800" letter-spacing="3">TÉCNICA DE DOMINADA EN 4 PASOS · REPPY.APP</text><rect x="18" y="66" width="183" height="196" rx="12" fill="#13131f" stroke="#2f80ed" stroke-width="1.5" stroke-opacity="0.6"/><circle cx="109" cy="100" r="22" fill="#2f80ed"/><text x="109" y="107" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">1</text><text x="109" y="136" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">CUELGUE ACTIVO</text><line x1="69" y1="145" x2="149" y2="145" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="109" y="162" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Agarra la barra a</text><text x="109" y="178" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">anchura de hombros.</text><text x="109" y="197" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Brazos extendidos,</text><text x="109" y="213" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">cuerpo recto.</text><rect x="59" y="232" width="100" height="20" rx="10" fill="#2f80ed" fill-opacity="0.15"/><text x="109" y="246" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="10" font-weight="700">30 seg de cuelgue</text><polygon points="422,159 432,164 422,169" fill="#2f80ed" opacity="0.5"/><rect x="228" y="66" width="183" height="196" rx="12" fill="#13131f" stroke="#2f80ed" stroke-width="1.5" stroke-opacity="0.6"/><circle cx="319" cy="100" r="22" fill="#2f80ed"/><text x="319" y="107" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">2</text><text x="319" y="136" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">RETRACCIÓN</text><text x="319" y="150" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">ESCAPULAR</text><line x1="279" y1="159" x2="359" y2="159" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="319" y="176" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Empuja los hombros</text><text x="319" y="192" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">hacia abajo y atrás.</text><text x="319" y="211" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Activa el dorsal</text><text x="319" y="227" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">antes de tirar.</text><rect x="269" y="242" width="100" height="20" rx="10" fill="#2f80ed" fill-opacity="0.15"/><text x="319" y="256" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="10" font-weight="700">Clave para la fuerza</text><polygon points="632,159 642,164 632,169" fill="#2f80ed" opacity="0.5"/><rect x="438" y="66" width="183" height="196" rx="12" fill="#13131f" stroke="#2f80ed" stroke-width="1.5" stroke-opacity="0.6"/><circle cx="529" cy="100" r="22" fill="#2f80ed"/><text x="529" y="107" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">3</text><text x="529" y="136" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">TIRAR Y SUBIR</text><line x1="489" y1="145" x2="569" y2="145" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="529" y="162" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Codos hacia abajo</text><text x="529" y="178" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">y al cuerpo. No</text><text x="529" y="197" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">te balancees.</text><text x="529" y="213" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Core tenso.</text><rect x="479" y="232" width="100" height="20" rx="10" fill="#2f80ed" fill-opacity="0.15"/><text x="529" y="246" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="10" font-weight="700">Movimiento limpio</text><rect x="648" y="66" width="155" height="196" rx="12" fill="#13131f" stroke="#2f80ed" stroke-width="2" stroke-opacity="0.9"/><circle cx="725" cy="100" r="22" fill="#2f80ed"/><text x="725" y="107" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">4</text><text x="725" y="136" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">BARBILLA ARRIBA</text><line x1="685" y1="145" x2="765" y2="145" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="725" y="162" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Barbilla por encima</text><text x="725" y="178" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">de la barra. Baja</text><text x="725" y="197" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">lento y controlado</text><text x="725" y="213" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">hasta extenderte.</text><rect x="675" y="232" width="100" height="20" rx="10" fill="#2f80ed"/><text x="725" y="246" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="800">¡1 REPETICIÓN!</text><text x="410" y="288" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="11" font-weight="700">→ Registra tus dominadas gratis en Reppy ←</text></svg></a>`,

  'pullup-steps-en': `<a href="/en/pull-up-counter" style="display:block;text-decoration:none;margin:2rem 0"><svg viewBox="0 0 820 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pull-up technique in 4 steps - Free pull-up counter at Reppy" style="width:100%;border-radius:16px;background:#0d0d16"><rect width="820" height="300" fill="#0d0d16" rx="16"/><rect x="0" y="0" width="820" height="52" fill="#0a0a12" rx="16"/><rect x="0" y="36" width="820" height="16" fill="#0a0a12"/><text x="410" y="33" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="13" font-weight="800" letter-spacing="3">PULL-UP TECHNIQUE IN 4 STEPS · REPPY.APP</text><rect x="18" y="66" width="183" height="196" rx="12" fill="#13131f" stroke="#2f80ed" stroke-width="1.5" stroke-opacity="0.6"/><circle cx="109" cy="100" r="22" fill="#2f80ed"/><text x="109" y="107" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">1</text><text x="109" y="136" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">DEAD HANG</text><line x1="69" y1="145" x2="149" y2="145" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="109" y="162" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Grip the bar at</text><text x="109" y="178" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">shoulder width.</text><text x="109" y="197" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Arms fully extended,</text><text x="109" y="213" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">body straight.</text><rect x="59" y="232" width="100" height="20" rx="10" fill="#2f80ed" fill-opacity="0.15"/><text x="109" y="246" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="10" font-weight="700">Hold 30 seconds</text><polygon points="422,159 432,164 422,169" fill="#2f80ed" opacity="0.5"/><rect x="228" y="66" width="183" height="196" rx="12" fill="#13131f" stroke="#2f80ed" stroke-width="1.5" stroke-opacity="0.6"/><circle cx="319" cy="100" r="22" fill="#2f80ed"/><text x="319" y="107" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">2</text><text x="319" y="136" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">SCAPULAR</text><text x="319" y="150" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">RETRACTION</text><line x1="279" y1="159" x2="359" y2="159" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="319" y="176" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Push shoulders</text><text x="319" y="192" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">down and back.</text><text x="319" y="211" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Activate lats</text><text x="319" y="227" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">before pulling.</text><rect x="269" y="242" width="100" height="20" rx="10" fill="#2f80ed" fill-opacity="0.15"/><text x="319" y="256" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="10" font-weight="700">Key for strength</text><polygon points="632,159 642,164 632,169" fill="#2f80ed" opacity="0.5"/><rect x="438" y="66" width="183" height="196" rx="12" fill="#13131f" stroke="#2f80ed" stroke-width="1.5" stroke-opacity="0.6"/><circle cx="529" cy="100" r="22" fill="#2f80ed"/><text x="529" y="107" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">3</text><text x="529" y="136" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">PULL AND RISE</text><line x1="489" y1="145" x2="569" y2="145" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="529" y="162" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Elbows down</text><text x="529" y="178" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">toward body.</text><text x="529" y="197" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">No swinging.</text><text x="529" y="213" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Core tight.</text><rect x="479" y="232" width="100" height="20" rx="10" fill="#2f80ed" fill-opacity="0.15"/><text x="529" y="246" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="10" font-weight="700">Clean movement</text><rect x="648" y="66" width="155" height="196" rx="12" fill="#13131f" stroke="#2f80ed" stroke-width="2" stroke-opacity="0.9"/><circle cx="725" cy="100" r="22" fill="#2f80ed"/><text x="725" y="107" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">4</text><text x="725" y="136" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="800">CHIN OVER BAR</text><line x1="685" y1="145" x2="765" y2="145" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="725" y="162" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Chin clears the bar.</text><text x="725" y="178" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">Lower slowly and</text><text x="725" y="197" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">controlled back</text><text x="725" y="213" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">to dead hang.</text><rect x="675" y="232" width="100" height="20" rx="10" fill="#2f80ed"/><text x="725" y="246" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="800">1 FULL REP!</text><text x="410" y="288" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="11" font-weight="700">→ Track your pull-ups free at Reppy ←</text></svg></a>`,

  'progression-es': `<a href="/es/contador-dominadas" style="display:block;text-decoration:none;margin:2rem 0"><svg viewBox="0 0 820 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Progresion de dominadas en 8 semanas de 0 a 10 repeticiones" style="width:100%;border-radius:16px;background:#0d0d16"><rect width="820" height="160" fill="#0d0d16" rx="16"/><rect x="0" y="0" width="820" height="40" fill="#0a0a12" rx="16"/><rect x="0" y="24" width="820" height="16" fill="#0a0a12"/><text x="410" y="26" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="12" font-weight="800" letter-spacing="3">PROGRESIÓN DE 8 SEMANAS · DE 0 A 10 DOMINADAS</text><rect x="10" y="50" width="88" height="90" rx="8" fill="#13131f" stroke="#333355" stroke-width="1"/><text x="54" y="75" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="10" font-weight="700">SEM 1-2</text><text x="54" y="115" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Base</text><rect x="108" y="50" width="88" height="90" rx="8" fill="#13131f" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="152" y="75" text-anchor="middle" fill="#4488cc" font-family="system-ui,sans-serif" font-size="10" font-weight="700">SEM 3-4</text><text x="152" y="97" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="28" font-weight="800">1</text><text x="152" y="128" text-anchor="middle" fill="#4488cc" font-family="system-ui,sans-serif" font-size="9">1ª dominada</text><rect x="206" y="44" width="88" height="96" rx="8" fill="#13131f" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.6"/><text x="250" y="69" text-anchor="middle" fill="#6699dd" font-family="system-ui,sans-serif" font-size="10" font-weight="700">SEM 5-6</text><text x="250" y="93" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="28" font-weight="800">3-5</text><text x="250" y="126" text-anchor="middle" fill="#6699dd" font-family="system-ui,sans-serif" font-size="9">Nivel C</text><rect x="304" y="36" width="88" height="104" rx="8" fill="#13131f" stroke="#2f80ed" stroke-width="1.5" stroke-opacity="0.8"/><text x="348" y="62" text-anchor="middle" fill="#88bbff" font-family="system-ui,sans-serif" font-size="10" font-weight="700">SEM 7-8</text><text x="348" y="88" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="28" font-weight="800">8-10</text><text x="348" y="126" text-anchor="middle" fill="#88bbff" font-family="system-ui,sans-serif" font-size="9">Nivel D</text><rect x="410" y="36" width="400" height="104" rx="12" fill="#0d1a2e" stroke="#2f80ed" stroke-width="2"/><circle cx="460" cy="88" r="30" fill="#2f80ed" fill-opacity="0.2"/><text x="460" y="95" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="28">🏆</text><text x="620" y="65" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">10 DOMINADAS</text><text x="620" y="88" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">en 8 semanas de trabajo honesto</text><rect x="510" y="118" width="220" height="16" rx="8" fill="#2f80ed"/><text x="620" y="130" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="800">Registra tu progreso en Reppy →</text></svg></a>`,

  'progression-en': `<a href="/en/pull-up-counter" style="display:block;text-decoration:none;margin:2rem 0"><svg viewBox="0 0 820 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pull-up progression 8 weeks from 0 to 10 reps" style="width:100%;border-radius:16px;background:#0d0d16"><rect width="820" height="160" fill="#0d0d16" rx="16"/><rect x="0" y="0" width="820" height="40" fill="#0a0a12" rx="16"/><rect x="0" y="24" width="820" height="16" fill="#0a0a12"/><text x="410" y="26" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="12" font-weight="800" letter-spacing="3">8-WEEK PROGRESSION · FROM 0 TO 10 PULL-UPS</text><rect x="10" y="50" width="88" height="90" rx="8" fill="#13131f" stroke="#333355" stroke-width="1"/><text x="54" y="75" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="10" font-weight="700">WK 1-2</text><text x="54" y="115" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Base</text><rect x="108" y="50" width="88" height="90" rx="8" fill="#13131f" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="152" y="75" text-anchor="middle" fill="#4488cc" font-family="system-ui,sans-serif" font-size="10" font-weight="700">WK 3-4</text><text x="152" y="97" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="28" font-weight="800">1</text><text x="152" y="128" text-anchor="middle" fill="#4488cc" font-family="system-ui,sans-serif" font-size="9">First rep!</text><rect x="206" y="44" width="88" height="96" rx="8" fill="#13131f" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.6"/><text x="250" y="69" text-anchor="middle" fill="#6699dd" font-family="system-ui,sans-serif" font-size="10" font-weight="700">WK 5-6</text><text x="250" y="93" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="28" font-weight="800">3-5</text><text x="250" y="126" text-anchor="middle" fill="#6699dd" font-family="system-ui,sans-serif" font-size="9">Level C</text><rect x="304" y="36" width="88" height="104" rx="8" fill="#13131f" stroke="#2f80ed" stroke-width="1.5" stroke-opacity="0.8"/><text x="348" y="62" text-anchor="middle" fill="#88bbff" font-family="system-ui,sans-serif" font-size="10" font-weight="700">WK 7-8</text><text x="348" y="88" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="28" font-weight="800">8-10</text><text x="348" y="126" text-anchor="middle" fill="#88bbff" font-family="system-ui,sans-serif" font-size="9">Level D</text><rect x="410" y="36" width="400" height="104" rx="12" fill="#0d1a2e" stroke="#2f80ed" stroke-width="2"/><circle cx="460" cy="88" r="30" fill="#2f80ed" fill-opacity="0.2"/><text x="460" y="95" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="28">🏆</text><text x="620" y="65" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="20" font-weight="800">10 PULL-UPS</text><text x="620" y="88" text-anchor="middle" fill="#9090b0" font-family="system-ui,sans-serif" font-size="11">in 8 weeks of honest work</text><rect x="510" y="118" width="220" height="16" rx="8" fill="#2f80ed"/><text x="620" y="130" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="800">Track progress on Reppy →</text></svg></a>`,

  'weekly-plan-es': `<a href="/es/app-calistenia" style="display:block;text-decoration:none;margin:2rem 0"><svg viewBox="0 0 820 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rutina de calistenia semanal completa - 4 dias de entrenamiento en Reppy" style="width:100%;border-radius:16px;background:#0d0d16"><rect width="820" height="200" fill="#0d0d16" rx="16"/><rect x="0" y="0" width="820" height="44" fill="#0a0a12" rx="16"/><rect x="0" y="28" width="820" height="16" fill="#0a0a12"/><text x="410" y="28" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="12" font-weight="800" letter-spacing="3">TU SEMANA DE CALISTENIA · REPPY.APP</text><rect x="18" y="56" width="100" height="128" rx="10" fill="#13131f" stroke="#2f80ed" stroke-width="1.5"/><text x="68" y="80" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="11" font-weight="800">LUN</text><text x="68" y="100" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="700">TREN SUP A</text><text x="68" y="116" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Flexiones</text><text x="68" y="130" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Remos</text><text x="68" y="144" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Fondos</text><rect x="28" y="164" width="80" height="14" rx="7" fill="#2f80ed" fill-opacity="0.2"/><text x="68" y="175" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="9" font-weight="700">45-60 min</text><rect x="128" y="56" width="100" height="128" rx="10" fill="#0f0f1a" stroke="#333355" stroke-width="1"/><text x="178" y="80" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="11" font-weight="800">MAR</text><text x="178" y="130" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Descanso</text><text x="178" y="144" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">/ Movilidad</text><rect x="238" y="56" width="100" height="128" rx="10" fill="#13131f" stroke="#2f80ed" stroke-width="1.5"/><text x="288" y="80" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="11" font-weight="800">MIÉ</text><text x="288" y="100" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="700">TREN INF</text><text x="288" y="116" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Sentadillas</text><text x="288" y="130" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Zancadas</text><text x="288" y="144" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Core</text><rect x="248" y="164" width="80" height="14" rx="7" fill="#2f80ed" fill-opacity="0.2"/><text x="288" y="175" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="9" font-weight="700">45-55 min</text><rect x="348" y="56" width="100" height="128" rx="10" fill="#0f0f1a" stroke="#333355" stroke-width="1"/><text x="398" y="80" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="11" font-weight="800">JUE</text><text x="398" y="130" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Descanso</text><text x="398" y="144" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Completo</text><rect x="458" y="56" width="100" height="128" rx="10" fill="#13131f" stroke="#2f80ed" stroke-width="1.5"/><text x="508" y="80" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="11" font-weight="800">VIE</text><text x="508" y="100" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="700">TREN SUP B</text><text x="508" y="116" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Dominadas</text><text x="508" y="130" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Fondos</text><text x="508" y="144" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Remos</text><rect x="468" y="164" width="80" height="14" rx="7" fill="#2f80ed" fill-opacity="0.2"/><text x="508" y="175" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="9" font-weight="700">45-60 min</text><rect x="568" y="56" width="100" height="128" rx="10" fill="#13131f" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="618" y="80" text-anchor="middle" fill="#4488cc" font-family="system-ui,sans-serif" font-size="11" font-weight="800">SÁB</text><text x="618" y="100" text-anchor="middle" fill="#aaaacc" font-family="system-ui,sans-serif" font-size="10" font-weight="700">CARDIO</text><text x="618" y="116" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Correr suave</text><text x="618" y="130" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">o habilidades</text><rect x="578" y="164" width="80" height="14" rx="7" fill="#2f80ed" fill-opacity="0.1"/><text x="618" y="175" text-anchor="middle" fill="#4488cc" font-family="system-ui,sans-serif" font-size="9" font-weight="700">20-40 min</text><rect x="688" y="56" width="114" height="128" rx="10" fill="#0f0f1a" stroke="#333355" stroke-width="1"/><text x="745" y="80" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="11" font-weight="800">DOM</text><text x="745" y="130" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Descanso</text><text x="745" y="144" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Completo</text></svg></a>`,

  'weekly-plan-en': `<a href="/en/calisthenics-app" style="display:block;text-decoration:none;margin:2rem 0"><svg viewBox="0 0 820 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Complete weekly calisthenics routine - 4 training days at Reppy" style="width:100%;border-radius:16px;background:#0d0d16"><rect width="820" height="200" fill="#0d0d16" rx="16"/><rect x="0" y="0" width="820" height="44" fill="#0a0a12" rx="16"/><rect x="0" y="28" width="820" height="16" fill="#0a0a12"/><text x="410" y="28" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="12" font-weight="800" letter-spacing="3">YOUR CALISTHENICS WEEK · REPPY.APP</text><rect x="18" y="56" width="100" height="128" rx="10" fill="#13131f" stroke="#2f80ed" stroke-width="1.5"/><text x="68" y="80" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="11" font-weight="800">MON</text><text x="68" y="100" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="700">UPPER A</text><text x="68" y="116" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Push-ups</text><text x="68" y="130" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Rows</text><text x="68" y="144" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Dips</text><rect x="28" y="164" width="80" height="14" rx="7" fill="#2f80ed" fill-opacity="0.2"/><text x="68" y="175" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="9" font-weight="700">45-60 min</text><rect x="128" y="56" width="100" height="128" rx="10" fill="#0f0f1a" stroke="#333355" stroke-width="1"/><text x="178" y="80" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="11" font-weight="800">TUE</text><text x="178" y="130" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Rest</text><rect x="238" y="56" width="100" height="128" rx="10" fill="#13131f" stroke="#2f80ed" stroke-width="1.5"/><text x="288" y="80" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="11" font-weight="800">WED</text><text x="288" y="100" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="700">LOWER + CORE</text><text x="288" y="116" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Squats</text><text x="288" y="130" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Lunges</text><text x="288" y="144" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Core</text><rect x="248" y="164" width="80" height="14" rx="7" fill="#2f80ed" fill-opacity="0.2"/><text x="288" y="175" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="9" font-weight="700">45-55 min</text><rect x="348" y="56" width="100" height="128" rx="10" fill="#0f0f1a" stroke="#333355" stroke-width="1"/><text x="398" y="80" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="11" font-weight="800">THU</text><text x="398" y="130" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Rest</text><rect x="458" y="56" width="100" height="128" rx="10" fill="#13131f" stroke="#2f80ed" stroke-width="1.5"/><text x="508" y="80" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="11" font-weight="800">FRI</text><text x="508" y="100" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="10" font-weight="700">UPPER B</text><text x="508" y="116" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Pull-ups</text><text x="508" y="130" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Dips</text><text x="508" y="144" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Rows</text><rect x="468" y="164" width="80" height="14" rx="7" fill="#2f80ed" fill-opacity="0.2"/><text x="508" y="175" text-anchor="middle" fill="#2f80ed" font-family="system-ui,sans-serif" font-size="9" font-weight="700">45-60 min</text><rect x="568" y="56" width="100" height="128" rx="10" fill="#13131f" stroke="#2f80ed" stroke-width="1" stroke-opacity="0.4"/><text x="618" y="80" text-anchor="middle" fill="#4488cc" font-family="system-ui,sans-serif" font-size="11" font-weight="800">SAT</text><text x="618" y="100" text-anchor="middle" fill="#aaaacc" font-family="system-ui,sans-serif" font-size="10" font-weight="700">CARDIO</text><text x="618" y="116" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">Easy run or</text><text x="618" y="130" text-anchor="middle" fill="#7070a0" font-family="system-ui,sans-serif" font-size="9">skills practice</text><rect x="578" y="164" width="80" height="14" rx="7" fill="#2f80ed" fill-opacity="0.1"/><text x="618" y="175" text-anchor="middle" fill="#4488cc" font-family="system-ui,sans-serif" font-size="9" font-weight="700">20-40 min</text><rect x="688" y="56" width="114" height="128" rx="10" fill="#0f0f1a" stroke="#333355" stroke-width="1"/><text x="745" y="80" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="11" font-weight="800">SUN</text><text x="745" y="130" text-anchor="middle" fill="#555577" font-family="system-ui,sans-serif" font-size="9">Rest</text></svg></a>`,
};

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

  let html = marked.parse(cleanContent, { breaks: false });

  // Inject infographics — markers in the JSON content are replaced here (SSG-safe)
  Object.entries(INFOGRAPHICS).forEach(([key, svg]) => {
    html = html.replace(new RegExp(`&lt;!--INFOGRAPHIC:${key}--&gt;|<!--INFOGRAPHIC:${key}-->`, 'g'), svg);
  });

  return html;
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
  const BASE = 'https://reppy-weld.vercel.app';
  const img = currentPost.value.image
    ? (currentPost.value.image.startsWith('http') ? currentPost.value.image : `${BASE}${currentPost.value.image}`)
    : `${BASE}/og-image.png`;
  const pageUrl = `${BASE}/${i18n.locale}/blog/${currentPost.value.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.value.title,
    "description": post.value.excerpt,
    "image": [img],
    "datePublished": currentPost.value.date,
    "dateModified": currentPost.value.date,
    "inLanguage": i18n.locale,
    "keywords": (post.value.keywords || []).join(', '),
    "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
    "author": [{
      "@type": "Person",
      "name": currentPost.value.author
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Reppy",
      "logo": { "@type": "ImageObject", "url": `${BASE}/og-image.png` }
    }
  };
  return `<script type="application/ld+json">${JSON.stringify(structuredData)}<\/script>`;
});

// Dynamic SEO Tags
const updateSEOMeta = () => {
  if (!post.value) return;
  const title = `${post.value.title} | Reppy`;
  const description = post.value.excerpt || post.value.title;
  const image = currentPost.value.image
    ? (currentPost.value.image.startsWith('http') ? currentPost.value.image : `https://reppy-weld.vercel.app${currentPost.value.image}`)
    : 'https://reppy-weld.vercel.app/og-image.png';
  const url = `https://reppy-weld.vercel.app${route.path}`;

  document.title = title;

  const setMeta = (selector, attr, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  };

  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:image"]', 'content', image);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('meta[name="twitter:image"]', 'content', image);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', url);
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
      notificationStore.notify(i18n.locale === 'es' ? '¡Enlace copiado!' : 'Link copied!', 'success');
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
  if (!authStore.isAuthenticated) return;
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
  updateSEOMeta();
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
:deep(.prose) h2 { @apply text-4xl font-bold mt-16 mb-8 text-foreground tracking-tight; }
:deep(.prose) h3 { @apply text-2xl font-bold mt-10 mb-6 text-foreground/90; }
:deep(.prose) p { @apply text-lg text-muted/90 leading-[1.8] mb-8 font-medium; }
:deep(.prose) a { @apply text-primary font-bold transition-all border-b-2 border-primary/20 hover:border-primary; }
:deep(.prose) strong { @apply text-foreground font-black; }
:deep(.prose) ul { @apply list-none space-y-4 mb-8; }
:deep(.prose) li { @apply relative pl-8 text-lg text-muted/90 leading-relaxed font-medium; }
:deep(.prose) li::before { content: '→'; @apply absolute left-0 text-primary font-black; }
</style>
