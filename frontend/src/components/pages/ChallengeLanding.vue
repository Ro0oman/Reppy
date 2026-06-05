<template>
  <div class="min-h-screen bg-deep-abyss selection:bg-primary-500 overflow-hidden flex flex-col items-center text-industrial">

    <!-- Hero -->
    <section class="relative w-full py-24 md:py-40 px-6 flex flex-col items-center text-center space-y-10">
      <div class="absolute inset-0 pointer-events-none opacity-30">
        <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div class="inline-flex items-center gap-3 px-6 py-2 bg-surface border border-border/40 rounded-full mb-8 shadow-sm">
        <div class="w-2 h-2 rounded-full bg-primary-500 animate-ping"></div>
        <span class="text-[11px] font-bold tracking-widest text-muted/60 uppercase">{{ isEs ? 'Reto Activo — Únete Gratis' : 'Active Challenge — Join Free' }}</span>
      </div>

      <h1 class="text-5xl md:text-8xl font-bold tracking-tight text-foreground leading-tight mb-8">
        {{ isEs ? 'Reto' : '30-Day' }} <span class="text-primary-500">{{ isEs ? 'Calistenia' : 'Calisthenics' }}</span> {{ isEs ? '30 Días' : 'Challenge' }}
      </h1>

      <p class="max-w-2xl text-xl md:text-2xl text-muted font-medium mb-12 leading-relaxed">
        {{ isEs
          ? 'Dominadas, flexiones y fondos cada día durante 30 días. Sigue tu progreso con RPG, gana XP y derrota bosses con la comunidad. Gratis, siempre.'
          : 'Pull-ups, push-ups, and dips every day for 30 days. Track progress with RPG stats, earn XP, and take down community bosses. Free, always.' }}
      </p>

      <div class="flex flex-col md:flex-row items-center gap-6">
        <button @click="start" class="btn-reppy !text-lg !px-12 !py-5 shadow-xl uppercase">
          {{ authStore.isAuthenticated ? i18n.t('nav_go_dashboard') : (isEs ? 'EMPEZAR EL RETO' : 'START THE CHALLENGE') }}
        </button>
        <router-link :to="`/${i18n.locale}`" class="text-sm font-bold text-muted hover:text-foreground transition-colors">
          {{ i18n.t('back_to_home') }} &rarr;
        </router-link>
      </div>
    </section>

    <!-- 30-day plan preview -->
    <section class="max-w-5xl w-full px-6 py-20 space-y-16 mb-16">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
          {{ isEs ? 'El Plan Día a Día' : 'The Day-by-Day Plan' }}
        </h2>
        <p class="text-muted/70 max-w-xl mx-auto font-medium">
          {{ isEs ? 'Progresión semanal. Cada semana aumenta el volumen. Reppy lo registra todo automáticamente.' : 'Weekly progression. Each week volume increases. Reppy logs everything automatically.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div v-for="week in weeks" :key="week.num" class="card-stats p-8 space-y-4 text-left">
          <div class="text-3xl font-black text-primary-500/20">{{ isEs ? `Semana ${week.num}` : `Week ${week.num}` }}</div>
          <h3 class="text-xl font-bold text-foreground">{{ isEs ? week.titleEs : week.titleEn }}</h3>
          <ul class="space-y-2 text-sm text-muted/70 font-medium">
            <li v-for="item in week.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section class="max-w-5xl w-full px-6 py-20 bg-surface/20 rounded-[3rem] border border-white/5 backdrop-blur-3xl space-y-16 mb-32">
      <h2 class="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight text-center">
        {{ isEs ? '¿Por qué hacerlo con Reppy?' : 'Why do it with Reppy?' }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="(b, i) in benefits" :key="i" class="card-stats p-8 text-left space-y-4">
          <div class="text-3xl font-black text-primary-500/20">0{{ i + 1 }}</div>
          <h3 class="text-xl font-bold text-foreground">{{ isEs ? b.titleEs : b.titleEn }}</h3>
          <p class="text-sm text-muted/60 leading-relaxed font-medium">{{ isEs ? b.bodyEs : b.bodyEn }}</p>
        </div>
      </div>
    </section>

    <!-- Long-form SEO content -->
    <section class="max-w-4xl w-full px-6 py-20 prose prose-invert font-medium">
      <h2 class="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-12 text-center">
        {{ isEs ? 'Todo sobre el reto de calistenia de 30 días' : 'Everything about the 30-day calisthenics challenge' }}
      </h2>
      <div class="space-y-10 text-muted/70 leading-loose text-lg" v-html="article"></div>
    </section>

    <!-- CTA -->
    <section class="w-full py-32 bg-gradient-to-b from-transparent to-primary-500/5 text-center px-6">
      <div class="max-w-3xl mx-auto space-y-10">
        <h2 class="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
          {{ isEs ? '¿Listo para el reto?' : 'Ready for the challenge?' }}
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

const weeks = [
  {
    num: 1,
    titleEs: 'Activación',
    titleEn: 'Activation',
    items: ['3×5 dominadas / pull-ups', '3×10 flexiones / push-ups', '3×8 fondos / dips']
  },
  {
    num: 2,
    titleEs: 'Construcción',
    titleEn: 'Building',
    items: ['4×6 dominadas', '4×12 flexiones', '4×10 fondos']
  },
  {
    num: 3,
    titleEs: 'Intensidad',
    titleEn: 'Intensity',
    items: ['5×7 dominadas', '5×15 flexiones', '5×12 fondos']
  },
  {
    num: 4,
    titleEs: 'Test Final',
    titleEn: 'Final Test',
    items: ['Max dominadas', 'Max flexiones', 'Max fondos']
  }
];

const benefits = [
  {
    titleEs: 'Progresión RPG',
    titleEn: 'RPG Progression',
    bodyEs: 'Cada ejercicio registrado suma XP y sube tus atributos. Verás tu nivel crecer día a día durante el reto.',
    bodyEn: 'Every logged exercise adds XP and raises your attributes. Watch your level grow day by day through the challenge.'
  },
  {
    titleEs: 'Boss Comunitario',
    titleEn: 'Community Boss',
    bodyEs: 'Tus reps contribuyen al boss mensual de la comunidad. El reto de 30 días se convierte en una misión colectiva.',
    bodyEn: 'Your reps contribute to the monthly community boss. The 30-day challenge becomes a collective mission.'
  },
  {
    titleEs: 'Heatmap de Racha',
    titleEn: 'Streak Heatmap',
    bodyEs: 'Visualiza cada día del reto en tu heatmap estilo GitHub. Completar los 30 días se vuelve un objetivo visual irresistible.',
    bodyEn: 'Visualize every challenge day on your GitHub-style heatmap. Completing all 30 days becomes an irresistible visual goal.'
  }
];

const article = computed(() => isEs.value ? `
  <h3>¿Qué es un reto de calistenia de 30 días?</h3>
  <p>Un <strong>reto de calistenia de 30 días</strong> es un programa estructurado donde entrenas con ejercicios de peso corporal —dominadas, flexiones y fondos— de forma progresiva durante un mes. El objetivo no es hacer un maratón de repeticiones el día 1, sino construir consistencia y mejorar semana a semana.</p>

  <h3>¿Funciona realmente en 30 días?</h3>
  <p>La ciencia del entrenamiento confirma que 4 semanas son suficientes para ver mejoras neurológicas significativas: mejor técnica, más eficiencia muscular y mayor control corporal. No ganarás masa muscular visible en 30 días, pero al final del reto harás más dominadas, más flexiones y más fondos que al principio, de forma garantizada si eres consistente.</p>

  <h3>¿Por qué Reppy lo hace diferente?</h3>
  <p>La mayoría de retos se abandonan en la segunda semana por falta de motivación. Reppy soluciona esto convirtiendo cada entrenamiento en puntos de experiencia RPG. Ver tu personaje subir de nivel mientras completas el reto crea un bucle de recompensa que te mantiene enganchado más tiempo que cualquier hoja de Excel o app genérica.</p>

  <h3>¿Quién puede hacer este reto?</h3>
  <p>El reto está diseñado para ser escalable. Si no puedes hacer una dominada estricta, empieza con dominadas australianas. Si no llegas a 10 flexiones, empieza inclinado. Reppy cuenta todas las variantes por igual. Lo importante es el hábito, no el número.</p>
` : `
  <h3>What is a 30-day calisthenics challenge?</h3>
  <p>A <strong>30-day calisthenics challenge</strong> is a structured program where you train with bodyweight exercises — pull-ups, push-ups, and dips — progressively over a month. The goal is not to do a rep marathon on day 1, but to build consistency and improve week by week.</p>

  <h3>Does it really work in 30 days?</h3>
  <p>Training science confirms that 4 weeks are enough to see significant neurological improvements: better technique, greater muscular efficiency, and improved body control. You won't gain visible muscle mass in 30 days, but by the end of the challenge you will do more pull-ups, push-ups, and dips than at the start — guaranteed if you're consistent.</p>

  <h3>Why does Reppy make it different?</h3>
  <p>Most challenges are abandoned in the second week due to lack of motivation. Reppy solves this by converting every workout into RPG experience points. Watching your character level up as you complete the challenge creates a reward loop that keeps you hooked far longer than any Excel sheet or generic app.</p>

  <h3>Who can do this challenge?</h3>
  <p>The challenge is designed to be scalable. If you can't do a strict pull-up, start with Australian pull-ups. If you can't reach 10 push-ups, start inclined. Reppy counts all variations equally. The habit matters more than the number.</p>
`);

const updateMeta = () => {
  const isEnglish = i18n.locale === 'en';
  const title = isEnglish ? '30-Day Calisthenics Challenge | Reppy' : 'Reto Calistenia 30 Días | Reppy';
  const description = isEnglish
    ? 'Take the 30-day calisthenics challenge. Daily pull-ups, push-ups, and dips tracked with RPG progression and community boss fights. Free and beginner-friendly.'
    : 'Acepta el reto de calistenia de 30 dias. Dominadas, flexiones y fondos diarios con progresion RPG y boss fights comunitarios. Gratis y para principiantes.';
  const url = `https://reppy-weld.vercel.app${route.path}`;

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
