<template>
  <div class="min-h-screen bg-deep-abyss selection:bg-primary-500 overflow-hidden flex flex-col items-center">
    
    <!-- Hero Section -->
    <section class="relative w-full py-24 md:py-40 px-6 flex flex-col items-center text-center space-y-10">
      <div class="absolute inset-0 pointer-events-none opacity-30">
        <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]"></div>
      </div>

      <!-- Hero Content -->
      <div class="inline-flex items-center gap-3 px-6 py-2 bg-surface border border-border/40 rounded-full mb-8 shadow-sm">
        <div class="w-2 h-2 rounded-full bg-primary-500 animate-ping"></div>
        <span class="text-[11px] font-bold tracking-widest text-muted/60 uppercase">App de Calistenia 100% Gratuita</span>
      </div>

      <h1 class="text-5xl md:text-8xl font-bold tracking-tight text-foreground leading-tight mb-8">
        Contador de <span class="text-primary-500 capitalize">{{ type }}</span> Gratis
      </h1>
      
      <p class="max-w-2xl text-xl md:text-2xl text-muted font-medium mb-12 leading-relaxed">
        La herramienta definitiva para registrar tus <strong class="text-foreground">{{ type }}</strong>. 
        Sube de nivel, gana monedas y compite en el ranking mundial sin pagar nada.
      </p>

      <div class="flex flex-col md:flex-row items-center gap-6 animate-in-delay-2">
        <button @click="start" class="btn-reppy !text-lg !px-12 !py-5 shadow-xl">
          {{ authStore.isAuthenticated ? 'IR AL DASHBOARD' : 'EMPEZAR GRATIS AHORA' }}
        </button>
        <router-link to="/" class="text-sm font-bold text-muted hover:text-foreground transition-colors">
          Explorar otras funciones gratuitas &rarr;
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
                <component :is="content.icon" class="w-6 h-6" />
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
              <p class="text-[10px] font-bold text-muted tracking-wide uppercase">REPETICIONES REGISTRADAS: 14,230</p>
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
        <button @click="start" class="btn-reppy !text-xl !px-16 !py-6 shadow-2xl">
          CREAR CUENTA AHORA
        </button>
        <p class="text-[10px] font-black text-muted/40 uppercase tracking-[0.4em]">100% GRATIS · SIN TARJETAS · CALISTENIA PURA</p>
      </div>
    </section>

    <!-- Footer link back -->
    <footer class="py-20 border-t border-border/40 w-full text-center">
      <router-link to="/" class="text-xs font-black text-primary-500 hover:text-white transition-all uppercase tracking-widest">
        &larr; Volver al Inicio de Reppy
      </router-link>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ArrowUp, ArrowDown, Activity } from 'lucide-vue-next';

const props = defineProps({
  type: {
    type: String,
    required: true
  }
});

const router = useRouter();
const authStore = useAuthStore();

const start = () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
};

const copy = {
  dominadas: {
    eyebrow: 'App de Dominadas Gratuita',
    h1: 'Contador de Dominadas Online con Progresión RPG',
    subtext: 'Registra tus pull-ups, visualiza tu consistencia con heatmaps y compite en el ranking global de calistenia.',
    icon: ArrowUp,
    card_label: 'ESTADÍSTICA PULL-UP',
    card_title: 'Volumen Mensual',
    section1_h2: '¿Para qué sirve un contador de dominadas?',
    section1_body: '<p>Tener un registro exacto de cuántas dominadas haces cada día es la única forma real de asegurar una <strong>sobrecarga progresiva</strong>. Nuestro contador automático no solo guarda el número, sino que lo asigna a tus atributos de Fuerza y Potencia.</p><p>Olvídate de las notas del móvil. Con Reppy tienes un historial visual estilo GitHub que te motiva a no dejar huecos en blanco.</p>',
    section2_h2: 'Cómo mejorar tus dominadas',
    tips: [
      { title: 'Volumen Semanal', body: 'No busques solo el máximo en un set. Registra el volumen total semanal y trata de aumentarlo un 5% cada mes.' },
      { title: 'Variedad de Agarre', body: 'Combina dominadas pronas, supinas y neutras. Reppy cuenta todas por igual para tu progresión de nivel.' },
      { title: 'Constancia sobre Intensidad', body: 'Es mejor hacer 50 dominadas 5 días a la semana que un solo día de 200. El heatmap te ayudará a verlo.' }
    ],
    guide_h2: 'Guía Completa para Dominadas Perfectas',
    long_article: `
      <h3>La importancia del seguimiento en calistenia</h3>
      <p>Muchos atletas de calistenia se estancan porque no saben exactamente cuánto volumen están manejando. Un <strong>contador de dominadas</strong> serio es el primer paso para salir del estancamiento. Al registrar cada serie, puedes observar tendencias, detectar sobreentrenamiento o, por el contrario, darte cuenta de que no estás entrenando con la frecuencia suficiente.</p>
      
      <h3>Técnica y Calidad</h3>
      <p>Hacer una dominada no es solo subir la barbilla por encima de la barra. Se trata de control escapular, evitar el balanceo (kipping) y completar el rango de movimiento. En Reppy, fomentamos la calidad. Cada repetición que añades al contador debería ser una repetición "limpia".</p>
      
      <h3>¿Por qué elegir Reppy para tus pull-ups?</h3>
      <p>A diferencia de otras aplicaciones de fitness genéricas, Reppy está diseñado por y para personas que practican <strong>street workout</strong>. Entendemos que el progreso en el peso corporal es lento pero muy gratificante. Por eso hemos gamificado la experiencia: cada entrenamiento contribuye a tu nivel global, permitiéndote desbloquear cosméticos y competir con otros atletas de todo el mundo.</p>
      
      <h3>El camino al Top 1</h3>
      <p>Nuestra clasificación no solo mide quién es el más fuerte hoy, sino quién es el más constante. El algoritmo de ranking tiene en cuenta tus rachas de entrenamiento. Si quieres aparecer en la cima del leaderboard de dominadas, tendrás que ser un asiduo a la barra.</p>
    `,
    cta_h2: '¿Listo para dominar la barra de dominadas?'
  },
  flexiones: {
    eyebrow: 'App de Flexiones Gratuita',
    h1: 'Contador de Flexiones Online y Tracker de Proyectos',
    subtext: 'Lleva la cuenta de tus push-ups, sube de nivel tus atributos y mantén tu rendimiento al máximo con analíticas avanzadas.',
    icon: ArrowDown,
    card_label: 'ESTADÍSTICA PUSH-UP',
    card_title: 'Resistencia Total',
    section1_h2: '¿Por qué usar un contador de flexiones?',
    section1_body: '<p>Las flexiones son el ejercicio base de cualquier rutina de empuje. Sin un <strong>contador de flexiones</strong>, es fácil perder la cuenta en series de alto volumen o "mentirse" a uno mismo sobre el progreso real.</p><p>Registrar tus series te permite ver si estás mejorando en resistencia (endurance) o si necesitas pasar a variantes más difíciles para seguir ganando fuerza.</p>',
    section2_h2: 'Cómo hacer más flexiones',
    tips: [
      { title: 'Frecuencia Alta', body: 'Al ser un ejercicio con menos peso relativo, puedes entrenarlo con más frecuencia. Reppy te ayuda a mantener la racha diaria.' },
      { title: 'Variantes de Empuje', body: 'Registra desde flexiones diamante hasta flexiones a una mano. Todas contribuyen a tu atributo de Fuerza (STR).' },
      { title: 'Control del Core', body: 'Una flexión es una plancha en movimiento. No olvides mantener el abdomen tenso para proteger tu espalda.' }
    ],
    guide_h2: 'Guía Maestra de Flexiones y Variantes',
    long_article: `
      <h3>Del principiante al experto</h3>
      <p>Cualquiera puede empezar a usar un <strong>contador de flexiones</strong>. Si no puedes hacer una flexión estándar, registra tus inclinadas. El objetivo es que el número en tu dashboard suba día a tras día. La progresión es el corazón de la calistenia.</p>
      
      <h3>Entrenamiento gamificado</h3>
      <p>Imagina que cada flexión es un golpe a un enemigo en un RPG. Esa es la filosofía de Reppy. Al convertir el esfuerzo físico en experiencia digital (XP) y monedas, reducimos la fricción mental de empezar un entrenamiento. Ya no es "tengo que entrenar", es "tengo que subir de nivel".</p>
      
      <h3>Social y Comparativa</h3>
      <p>¿Crees que haces muchas flexiones? Compruébalo en nuestro ranking. Ver a otros atletas registrar cientos de repeticiones te motivará a no saltarte ni un set. Añade amigos y crea tu propia comunidad de entrenamiento.</p>
    `,
    cta_h2: 'Empieza a contar tus flexiones hoy mismo'
  }
};

const content = computed(() => copy[props.type] || copy.dominadas);

onMounted(() => {
  // Any SEO or tracking logic
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
