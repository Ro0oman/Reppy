<template>
  <div class="min-h-screen bg-deep-abyss selection:bg-primary-500 overflow-hidden flex flex-col items-center text-industrial">

    <!-- Hero -->
    <section class="relative w-full py-24 md:py-40 px-6 flex flex-col items-center text-center space-y-10">
      <div class="absolute inset-0 pointer-events-none opacity-30">
        <div class="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div class="inline-flex items-center gap-3 px-6 py-2 bg-surface border border-border/40 rounded-full mb-8 shadow-sm">
        <div class="w-2 h-2 rounded-full bg-primary-500 animate-ping"></div>
        <span class="text-[11px] font-bold tracking-widest text-muted/60 uppercase">{{ isEs ? 'Comparativa Objetiva' : 'Honest Comparison' }}</span>
      </div>

      <h1 class="text-5xl md:text-8xl font-bold tracking-tight text-foreground leading-tight mb-8">
        <span class="text-primary-500">Reppy</span> {{ isEs ? 'vs Otras Apps' : 'vs Other Apps' }}
      </h1>

      <p class="max-w-2xl text-xl md:text-2xl text-muted font-medium mb-12 leading-relaxed">
        {{ isEs
          ? '¿Cuál es la mejor app de calistenia? Comparamos Reppy con las alternativas más populares en seguimiento de dominadas, flexiones y fondos.'
          : 'What\'s the best calisthenics app? We compare Reppy to the most popular alternatives for tracking pull-ups, push-ups, and dips.' }}
      </p>

      <div class="flex flex-col md:flex-row items-center gap-6">
        <button @click="start" class="btn-reppy !text-lg !px-12 !py-5 shadow-xl uppercase">
          {{ authStore.isAuthenticated ? i18n.t('nav_go_dashboard') : (isEs ? 'PROBAR REPPY GRATIS' : 'TRY REPPY FREE') }}
        </button>
        <router-link :to="`/${i18n.locale}`" class="text-sm font-bold text-muted hover:text-foreground transition-colors">
          {{ i18n.t('back_to_home') }} &rarr;
        </router-link>
      </div>
    </section>

    <!-- Comparison table -->
    <section class="max-w-5xl w-full px-6 py-20 space-y-12 mb-16">
      <h2 class="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight text-center">
        {{ isEs ? 'Comparativa de Funciones' : 'Feature Comparison' }}
      </h2>

      <div class="overflow-x-auto rounded-3xl border border-border/40">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border/40">
              <th class="text-left p-5 text-muted/60 font-black uppercase tracking-widest text-xs">{{ isEs ? 'Función' : 'Feature' }}</th>
              <th class="p-5 text-primary-500 font-black uppercase tracking-widest text-xs">Reppy</th>
              <th class="p-5 text-muted/50 font-black uppercase tracking-widest text-xs">Freeletics</th>
              <th class="p-5 text-muted/50 font-black uppercase tracking-widest text-xs">Madbarz</th>
              <th class="p-5 text-muted/50 font-black uppercase tracking-widest text-xs">Google Fit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in tableRows" :key="i" class="border-b border-border/20 hover:bg-surface/10 transition-colors">
              <td class="p-5 text-foreground font-medium">{{ isEs ? row.featureEs : row.featureEn }}</td>
              <td class="p-5 text-center text-lg">{{ row.reppy }}</td>
              <td class="p-5 text-center text-lg">{{ row.freeletics }}</td>
              <td class="p-5 text-center text-lg">{{ row.madbarz }}</td>
              <td class="p-5 text-center text-lg">{{ row.googleFit }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Why Reppy wins -->
    <section class="max-w-5xl w-full px-6 py-20 bg-surface/20 rounded-[3rem] border border-white/5 backdrop-blur-3xl space-y-16 mb-32">
      <h2 class="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight text-center">
        {{ isEs ? '¿Por qué Reppy gana para calistenia?' : 'Why Reppy wins for calisthenics?' }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="(point, i) in points" :key="i" class="card-stats p-8 text-left space-y-4">
          <div class="text-3xl font-black text-primary-500/20">0{{ i + 1 }}</div>
          <h3 class="text-xl font-bold text-foreground">{{ isEs ? point.titleEs : point.titleEn }}</h3>
          <p class="text-sm text-muted/60 leading-relaxed font-medium">{{ isEs ? point.bodyEs : point.bodyEn }}</p>
        </div>
      </div>
    </section>

    <!-- Long-form SEO article -->
    <section class="max-w-4xl w-full px-6 py-20 prose prose-invert font-medium">
      <h2 class="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-12 text-center">
        {{ isEs ? 'La mejor app de calistenia en 2025' : 'The best calisthenics app in 2025' }}
      </h2>
      <div class="space-y-10 text-muted/70 leading-loose text-lg" v-html="article"></div>
    </section>

    <!-- CTA -->
    <section class="w-full py-32 bg-gradient-to-b from-transparent to-primary-500/5 text-center px-6">
      <div class="max-w-3xl mx-auto space-y-10">
        <h2 class="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
          {{ isEs ? 'Prueba Reppy gratis hoy' : 'Try Reppy free today' }}
        </h2>
        <button @click="start" class="btn-reppy !text-xl !px-16 !py-6 shadow-2xl uppercase">
          {{ i18n.t('el_cta_btn') }}
        </button>
        <p class="text-[10px] font-black text-muted/40 uppercase tracking-[0.4em]">{{ i18n.t('el_cta_footer') }}</p>
      </div>
    </section>

    <footer class="py-20 border-t border-border/40 w-full text-center">
      <router-link :to="`/${i18n.locale}`" class="text-xs font-black text-primary-500 hover:text-white transition-all uppercase tracking-widest">
        &larr; {{ i18n.t('el_back_home') }}
      </router-link>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const i18n = useI18nStore();

const isEs = computed(() => i18n.locale === 'es');

const tableRows = [
  { featureEs: 'Contador de dominadas', featureEn: 'Pull-up counter', reppy: '✅', freeletics: '✅', madbarz: '✅', googleFit: '⚠️' },
  { featureEs: 'Contador de flexiones', featureEn: 'Push-up counter', reppy: '✅', freeletics: '✅', madbarz: '✅', googleFit: '⚠️' },
  { featureEs: 'Contador de fondos', featureEn: 'Dips counter', reppy: '✅', freeletics: '✅', madbarz: '✅', googleFit: '❌' },
  { featureEs: 'Progresión RPG / XP', featureEn: 'RPG progression / XP', reppy: '✅', freeletics: '❌', madbarz: '❌', googleFit: '❌' },
  { featureEs: 'Ranking global', featureEn: 'Global ranking', reppy: '✅', freeletics: '✅', madbarz: '⚠️', googleFit: '❌' },
  { featureEs: 'Boss fights comunitarios', featureEn: 'Community boss fights', reppy: '✅', freeletics: '❌', madbarz: '❌', googleFit: '❌' },
  { featureEs: 'Heatmap de entrenamiento', featureEn: 'Training heatmap', reppy: '✅', freeletics: '❌', madbarz: '❌', googleFit: '❌' },
  { featureEs: '100% gratuito sin límites', featureEn: '100% free no limits', reppy: '✅', freeletics: '❌', madbarz: '⚠️', googleFit: '✅' },
  { featureEs: 'Open source', featureEn: 'Open source', reppy: '✅', freeletics: '❌', madbarz: '❌', googleFit: '❌' },
  { featureEs: 'Sin anuncios', featureEn: 'No ads', reppy: '✅', freeletics: '❌', madbarz: '❌', googleFit: '✅' },
];

const points = [
  {
    titleEs: 'Diseñado para calistenia',
    titleEn: 'Built for calisthenics',
    bodyEs: 'Reppy no es una app genérica de fitness. Está construida exclusivamente para dominadas, flexiones, fondos y muscle-ups. Cada función existe para este tipo de entrenamiento.',
    bodyEn: 'Reppy is not a generic fitness app. It\'s built exclusively for pull-ups, push-ups, dips, and muscle-ups. Every feature exists for this type of training.'
  },
  {
    titleEs: 'Gamificación real',
    titleEn: 'Real gamification',
    bodyEs: 'Otras apps añaden puntos de forma cosmética. En Reppy, el sistema RPG con atributos (STR, DEX, END) cambia cómo ves tu progreso y aumenta la retención a largo plazo.',
    bodyEn: 'Other apps add points cosmetically. In Reppy, the RPG attribute system (STR, DEX, END) changes how you see your progress and increases long-term retention.'
  },
  {
    titleEs: 'Comunidad activa',
    titleEn: 'Active community',
    bodyEs: 'El boss mensual crea un objetivo colectivo. Toda la comunidad aporta reps para derrotarlo. Es la diferencia entre entrenar solo y entrenar junto a miles de atletas.',
    bodyEn: 'The monthly boss creates a collective goal. The entire community contributes reps to defeat it. It\'s the difference between training alone and training alongside thousands of athletes.'
  }
];

const article = computed(() => isEs.value ? `
  <h3>El problema de las apps de fitness genéricas para calistenia</h3>
  <p>Freeletics, Nike Training Club o Google Fit son buenas apps para un público general. Pero si practicas <strong>calistenia</strong>, sus sistemas de seguimiento son insuficientes. No distinguen entre dominadas pronas y supinas, no calculan el volumen semanal en pull-ups de forma específica, y su gamificación es superficial.</p>

  <h3>Lo que necesita un atleta de calistenia en su app</h3>
  <p>Un atleta serio de calistenia necesita: (1) registro rápido de series y repeticiones sin fricciones, (2) historial visual para detectar tendencias, (3) motivación a largo plazo para mantener la consistencia, y (4) una comunidad que entienda el mismo tipo de entrenamiento. Reppy está diseñado desde cero para cumplir estos cuatro requisitos.</p>

  <h3>Reppy vs Freeletics</h3>
  <p>Freeletics es más completo en cuanto a planes de entrenamiento dirigidos, pero su modelo de negocio requiere suscripción para la mayoría de funciones premium. Reppy es 100% gratuito y su especialización en calistenia de fuerza lo hace más preciso para quien entrena pull-ups y dips como ejercicios principales.</p>

  <h3>Reppy vs Madbarz</h3>
  <p>Madbarz tiene seguimiento de ejercicios similar al de Reppy, pero carece de sistema RPG y comunidad de boss fights. Para atletas que buscan motivación a través de la gamificación, Reppy ofrece una experiencia significativamente más envolvente.</p>

  <h3>Veredicto</h3>
  <p>Si tu entrenamiento gira en torno a dominadas, flexiones y fondos, <strong>Reppy es la mejor app de calistenia</strong> disponible de forma gratuita. La combinación de seguimiento preciso, progresión RPG y comunidad activa no tiene equivalente en el mercado.</p>
` : `
  <h3>The problem with generic fitness apps for calisthenics</h3>
  <p>Freeletics, Nike Training Club, or Google Fit are good apps for a general audience. But if you practice <strong>calisthenics</strong>, their tracking systems are insufficient. They don't distinguish between prone and supine pull-ups, they don't calculate pull-up weekly volume specifically, and their gamification is superficial.</p>

  <h3>What a calisthenics athlete needs in their app</h3>
  <p>A serious calisthenics athlete needs: (1) quick set and rep logging without friction, (2) visual history to detect trends, (3) long-term motivation to maintain consistency, and (4) a community that understands the same type of training. Reppy is designed from scratch to meet all four requirements.</p>

  <h3>Reppy vs Freeletics</h3>
  <p>Freeletics is more complete in terms of guided training plans, but its business model requires a subscription for most premium features. Reppy is 100% free and its specialization in strength calisthenics makes it more precise for those who train pull-ups and dips as their main exercises.</p>

  <h3>Reppy vs Madbarz</h3>
  <p>Madbarz has exercise tracking similar to Reppy, but lacks an RPG system and boss fight community. For athletes who seek motivation through gamification, Reppy offers a significantly more immersive experience.</p>

  <h3>Verdict</h3>
  <p>If your training revolves around pull-ups, push-ups, and dips, <strong>Reppy is the best calisthenics app</strong> available for free. The combination of precise tracking, RPG progression, and active community has no equivalent on the market.</p>
`);

const updateMeta = () => {
  const isEnglish = i18n.locale === 'en';
  const title = isEnglish ? 'Reppy vs Other Calisthenics Apps | Comparison' : 'Reppy vs Otras Apps de Calistenia | Comparativa';
  const description = isEnglish
    ? 'How does Reppy compare to Freeletics, Madbarz, and Google Fit? See why gamified RPG tracking beats generic fitness apps for pull-ups, push-ups, and dips.'
    : 'Como se compara Reppy con Freeletics, Madbarz y Google Fit? Descubre por que el seguimiento RPG gamificado supera a las apps de fitness genericas para calistenia.';
  const url = `https://reppy.romandev.app${route.path}`;

  document.title = title;
  const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('link[rel="canonical"]', 'href', url);
};

onMounted(updateMeta);
watch(() => i18n.locale, updateMeta);

const start = () => {
  if (authStore.isAuthenticated) {
    router.push(`/${i18n.locale}/dashboard`);
  } else {
    router.push(`/${i18n.locale}/login`);
  }
};
</script>

<style scoped>
.btn-reppy {
  @apply bg-primary-500 text-white font-black rounded-3xl transition-all active:scale-95 hover:shadow-2xl hover:shadow-primary-500/30 px-8 py-4;
}
</style>
