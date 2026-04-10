<template>
  <div class="min-h-screen bg-background selection:bg-primary/30 flex flex-col items-center">
    <!-- Progress Bar -->
    <div class="fixed top-0 left-0 w-full h-1 z-50 bg-surface/50 overflow-hidden">
      <div 
        class="h-full bg-primary transition-all duration-300 ease-out"
        :style="{ width: `${scrollProgress}%` }"
      ></div>
    </div>

    <!-- Hero Header -->
    <header class="relative w-full py-20 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
      <div class="absolute inset-0 pointer-events-none opacity-20">
        <div class="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div class="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]"></div>
      </div>

      <div class="max-w-4xl w-full space-y-6 relative z-10">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-surface/80 border border-border/40 rounded-full mb-6">
          <Calendar class="w-4 h-4 text-primary" />
          <span class="text-[10px] font-black tracking-widest text-muted uppercase">{{ formattedDate }}</span>
        </div>
        
        <h1 class="text-4xl md:text-7xl font-black text-foreground tracking-tight leading-[1.1] mb-8 animate-in">
          {{ post.title }}
        </h1>

        <div class="flex items-center justify-center gap-4 text-sm text-muted font-medium animate-in-delay">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary">
              <User class="w-4 h-4" />
            </div>
            <span>{{ post.author }}</span>
          </div>
          <span class="opacity-20">|</span>
          <span>5 min de lectura</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl w-full px-6 pb-32">
      <!-- Feature Image -->
      <div class="relative group mb-16 animate-in-delay-2">
        <div class="absolute inset-0 bg-primary/20 blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div class="relative rounded-[2.5rem] overflow-hidden border border-border/40 shadow-2xl">
          <img :src="post.image" :alt="post.title" class="w-full h-auto aspect-video object-cover transform transition-transform duration-1000 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
        </div>
      </div>

      <!-- Post Content -->
      <article class="card-stats !p-8 md:!p-16 !rounded-[3rem] animate-in-delay-2">
        <div class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl" v-html="renderedContent"></div>
      </article>

      <!-- CTA Footer -->
      <section class="mt-24 p-12 bg-surface/40 border border-border/40 rounded-[3rem] text-center space-y-8 animate-in">
        <h2 class="text-3xl font-black text-foreground tracking-tight">¿Quieres registrar tus propios límites?</h2>
        <p class="text-muted text-lg max-w-xl mx-auto">Únete a la legión de atletas que usan Reppy para gamificar su entrenamiento de calistenia.</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button @click="router.push('/login')" class="btn-reppy !px-10">EMPEZAR GRATIS</button>
          <button @click="router.push('/')" class="text-sm font-bold text-muted hover:text-foreground transition-colors">Volver a inicio &rarr;</button>
        </div>
      </section>
    </main>

    <!-- Footer Mobile Navigation (Optional) -->
    <footer class="py-12 border-t border-border/40 w-full text-center mt-auto">
      <router-link to="/" class="text-xs font-black text-muted hover:text-primary transition-all uppercase tracking-widest">
        &copy; 2026 Reppy Ecosystem
      </router-link>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Calendar, User, Clock } from 'lucide-vue-next';
import { marked } from 'marked';
import { blogPosts } from '../blogPosts';

const route = useRoute();
const router = useRouter();

const post = computed(() => {
  const slug = route.params.slug;
  return blogPosts.find(p => p.slug === slug) || blogPosts[0];
});

const renderedContent = computed(() => {
  if (!post.value) return '';
  return marked(post.value.content);
});

const formattedDate = computed(() => {
  if (!post.value) return '';
  const date = new Date(post.value.date);
  return new Intl.DateTimeFormat('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
});

// Scroll Progress
const scrollProgress = ref(0);
const updateScroll = () => {
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = (winScroll / height) * 100;
};

onMounted(() => {
  window.addEventListener('scroll', updateScroll);
  // Set SEO tags manually if needed, or let router handle it
  document.title = `${post.value.title} | Reppy Blog`;
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

/* Custom Markdown Styling (Prose subset for premium look) */
:deep(.prose) h2 { @apply text-3xl font-black mt-12 mb-6 text-foreground; }
:deep(.prose) h3 { @apply text-2xl font-bold mt-8 mb-4 text-foreground/90; }
:deep(.prose) p { @apply text-lg text-muted/80 leading-relaxed mb-6 font-medium; }
:deep(.prose) a { @apply text-primary font-bold transition-all; }
:deep(.prose) strong { @apply text-foreground font-black; }
</style>
