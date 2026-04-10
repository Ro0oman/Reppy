<template>
  <div class="min-h-screen bg-deep-abyss selection:bg-primary-500 overflow-hidden flex flex-col items-center text-industrial">
    
    <!-- Hero Section -->
    <section class="relative w-full py-24 md:py-40 px-6 flex flex-col items-center text-center space-y-10">
      <div class="absolute inset-0 pointer-events-none opacity-30">
        <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]"></div>
      </div>

      <!-- Hero Content -->
      <div class="inline-flex items-center gap-3 px-6 py-2 bg-surface border border-border/40 rounded-full mb-8 shadow-sm">
        <div class="w-2 h-2 rounded-full bg-primary-500 animate-ping"></div>
        <span class="text-[11px] font-bold tracking-widest text-muted/60 uppercase">{{ content.eyebrow }}</span>
      </div>

      <h1 class="text-5xl md:text-8xl font-bold tracking-tight text-foreground leading-tight mb-8">
        {{ content.h1_start }} <span class="text-primary-500 capitalize">{{ i18n.t(type === 'dominadas' ? 'pullups' : 'pushups') }}</span> {{ content.h1_end }}
      </h1>
      
      <p class="max-w-2xl text-xl md:text-2xl text-muted font-medium mb-12 leading-relaxed">
        {{ content.subtext }}
      </p>

      <div class="flex flex-col md:flex-row items-center gap-6 animate-in-delay-2">
        <button @click="start" class="btn-reppy !text-lg !px-12 !py-5 shadow-xl uppercase">
          {{ authStore.isAuthenticated ? i18n.t('nav_go_dashboard') : i18n.t('btn_start') }}
        </button>
        <router-link to="/" class="text-sm font-bold text-muted hover:text-foreground transition-colors">
          {{ i18n.t('back_to_home') }} &rarr;
        </router-link>
      </div>
    </section>

    <!-- Search Intent Blocks -->
    <section class="max-w-5xl w-full px-6 py-20 bg-surface/20 rounded-[3rem] border border-white/5 backdrop-blur-3xl space-y-24 mb-32">
      <!-- What is it? -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div class="space-y-6 text-left">
          <h2 class="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            {{ content.section1_h2 }}
          </h2>
          <div class="space-y-4 text-muted/80 leading-relaxed font-medium" v-html="content.section1_body"></div>
        </div>
        <div class="relative group">
          <div class="absolute inset-0 bg-primary-500/20 blur-3xl group-hover:bg-primary-500/30 transition-all duration-500 rounded-full"></div>
          <div class="relative bg-deep-abyss/80 border border-border/40 p-8 rounded-3xl overflow-hidden shadow-2xl">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500">
                <component :is="type === 'dominadas' ? ArrowUp : ArrowDown" class="w-6 h-6" />
              </div>
              <div>
                <p class="text-xs font-black text-muted uppercase tracking-widest">{{ content.card_label }}</p>
                <p class="text-lg font-bold text-foreground">{{ content.card_title }}</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="h-2 w-full bg-surface-dark/20 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500 w-3/4 animate-pulse"></div>
              </div>
              <p class="text-[10px] font-bold text-muted tracking-wide uppercase">{{ i18n.t('stats_total') }}: 14,230</p>
            </div>
          </div>
        </div>
      </div>

      <!-- How to improve? -->
      <div class="space-y-12 text-center">
        <h2 class="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
          {{ content.section2_h2 }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(tip, i) in content.tips" :key="i" class="card-stats p-8 text-left space-y-4">
            <div class="text-3xl font-black text-primary-500/20">0{{ i + 1 }}</div>
            <h3 class="text-xl font-bold text-foreground">{{ tip.title }}</h3>
            <p class="text-sm text-muted/60 leading-relaxed font-medium">{{ tip.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Long-form content section (The SEO Powerhouse) -->
    <section class="max-w-4xl w-full px-6 py-20 prose prose-invert font-medium">
      <h2 class="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-12 text-center">
        {{ content.guide_h2 }}
      </h2>
      <div class="space-y-10 text-muted/70 leading-loose text-lg" v-html="content.long_article"></div>
    </section>

    <!-- CTA Section -->
    <section class="w-full py-32 bg-gradient-to-b from-transparent to-primary-500/5 text-center px-6">
      <div class="max-w-3xl mx-auto space-y-10">
        <h2 class="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
          {{ content.cta_h2 }}
        </h2>
        <button @click="start" class="btn-reppy !text-xl !px-16 !py-6 shadow-2xl uppercase">
          {{ i18n.t('el_cta_btn') }}
        </button>
        <p class="text-[10px] font-black text-muted/40 uppercase tracking-[0.4em]">{{ i18n.t('el_cta_footer') }}</p>
      </div>
    </section>

    <!-- Footer link back -->
    <footer class="py-20 border-t border-border/40 w-full text-center">
      <router-link to="/" class="text-xs font-black text-primary-500 hover:text-white transition-all uppercase tracking-widest">
        &larr; {{ i18n.t('el_back_home') }}
      </router-link>
      <div class="mt-4">
        <router-link to="/blog" class="text-[10px] font-black text-muted/40 hover:text-primary transition-all uppercase tracking-widest">{{ i18n.t('el_latest_blog') }}</router-link>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { ArrowUp, ArrowDown } from 'lucide-vue-next';

const props = defineProps({
  type: {
    type: String,
    required: true
  }
});

const router = useRouter();
const authStore = useAuthStore();
const i18n = useI18nStore();

const start = () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
};

const content = computed(() => {
  const prefix = props.type === 'dominadas' ? 'el_pullup' : 'el_pushup';
  
  return {
    eyebrow: i18n.t(`${prefix}_eyebrow`),
    h1_start: i18n.locale === 'es' ? 'Contador de' : 'Free Online',
    h1_end: i18n.locale === 'es' ? 'Gratis' : 'Counter',
    subtext: i18n.t(`${prefix}_subtext`),
    card_label: i18n.t(`${prefix}_card_label`),
    card_title: i18n.t(`${prefix}_card_title`),
    section1_h2: i18n.t(`${prefix}_section1_h2`),
    section1_body: i18n.t(`${prefix}_section1_body`),
    section2_h2: i18n.t(`${prefix}_section2_h2`),
    tips: [
      { title: i18n.t(`${prefix}_tip1_title`), body: i18n.t(`${prefix}_tip1_body`) },
      { title: i18n.t(`${prefix}_tip2_title`), body: i18n.t(`${prefix}_tip2_body`) },
      { title: i18n.t(`${prefix}_tip3_title`), body: i18n.t(`${prefix}_tip3_body`) }
    ],
    guide_h2: i18n.t(`${prefix}_guide_h2`),
    long_article: i18n.t(`${prefix}_article`),
    cta_h2: i18n.t('el_cta_h2')
  };
});
</script>

<style scoped>
.btn-reppy {
  @apply bg-primary-500 text-white font-black rounded-3xl transition-all active:scale-95 hover:shadow-2xl hover:shadow-primary-500/30 px-8 py-4;
}
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-in-delay { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
.animate-in-delay-2 { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
