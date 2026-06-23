<template>
  <div class="min-h-screen bg-deep-abyss text-industrial">

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-screen gap-4">
      <div class="w-10 h-10 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
      <p class="text-xs text-muted uppercase tracking-widest">{{ locale === 'es' ? 'Cargando atleta…' : 'Loading athlete…' }}</p>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
      <p class="text-6xl">⚔️</p>
      <h1 class="text-2xl font-black text-foreground">{{ locale === 'es' ? 'Atleta no encontrado' : 'Athlete not found' }}</h1>
      <p class="text-sm text-muted max-w-sm">{{ locale === 'es' ? 'Este perfil es privado o no existe.' : 'This profile is private or does not exist.' }}</p>
      <router-link :to="`/${locale}`" class="btn-reppy text-sm px-6 py-3">
        {{ locale === 'es' ? 'Ir a Reppy' : 'Go to Reppy' }}
      </router-link>
    </div>

    <!-- Profile -->
    <div v-else-if="profile" class="max-w-3xl mx-auto px-4 py-12 space-y-8">

      <!-- Header -->
      <header class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div class="relative shrink-0">
          <img
            v-if="profile.user.avatar_url"
            :src="profile.user.avatar_url"
            :alt="profile.user.name"
            class="w-24 h-24 rounded-2xl object-cover border-2 border-primary-500/30"
          />
          <div v-else class="w-24 h-24 rounded-2xl bg-primary-500/10 border border-primary-500/20 grid place-items-center text-4xl font-black text-primary-500">
            {{ (profile.user.name || '?')[0].toUpperCase() }}
          </div>
          <div class="absolute -bottom-2 -right-2 bg-surface border border-border rounded-xl px-2 py-1 text-[10px] font-black text-primary-400">
            Nv. {{ profile.user.current_level }}
          </div>
        </div>

        <div class="flex-1 min-w-0 text-center sm:text-left space-y-1">
          <p v-if="profile.user.title_name" class="text-[10px] font-black tracking-widest uppercase text-primary-500/70">
            {{ profile.user.title_name }}
          </p>
          <h1 class="text-3xl font-black text-foreground tracking-tight">{{ profile.user.name }}</h1>
          <p class="text-xs text-muted/60">@{{ username }}</p>

          <!-- Quick stats -->
          <div class="flex flex-wrap justify-center sm:justify-start gap-4 pt-3">
            <div class="text-center">
              <p class="text-2xl font-black tabular-nums text-foreground">{{ profile.stats.totalReps.toLocaleString() }}</p>
              <p class="text-[9px] font-bold uppercase tracking-widest text-muted/50">{{ locale === 'es' ? 'Reps' : 'Reps' }}</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-black tabular-nums text-foreground">{{ profile.stats.streak }}</p>
              <p class="text-[9px] font-bold uppercase tracking-widest text-muted/50">{{ locale === 'es' ? 'Racha' : 'Streak' }}</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-black tabular-nums text-foreground">{{ profile.user.current_level }}</p>
              <p class="text-[9px] font-bold uppercase tracking-widest text-muted/50">{{ locale === 'es' ? 'Nivel' : 'Level' }}</p>
            </div>
            <div v-if="globalRank" class="text-center">
              <p class="text-2xl font-black tabular-nums text-amber-400">#{{ globalRank }}</p>
              <p class="text-[9px] font-bold uppercase tracking-widest text-muted/50">{{ locale === 'es' ? 'Ranking' : 'Rank' }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- RPG Attributes -->
      <section class="rounded-2xl border border-border/40 bg-surface/10 p-5 space-y-3">
        <h2 class="text-xs font-black tracking-widest uppercase text-muted/50">
          {{ locale === 'es' ? 'Atributos RPG' : 'RPG Attributes' }}
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="attr in attributes" :key="attr.key" class="rounded-xl border border-border/30 bg-black/20 px-3 py-2.5 text-center">
            <p class="text-base">{{ attr.icon }}</p>
            <p class="text-[10px] font-black tracking-widest uppercase text-muted/50 mt-0.5">{{ attr.key }}</p>
            <p class="text-lg font-black text-foreground tabular-nums">{{ attr.level }}</p>
          </div>
        </div>
      </section>

      <!-- Star exercise + gear -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4 space-y-2">
          <p class="text-[9px] font-black tracking-widest uppercase text-amber-400/60">
            {{ locale === 'es' ? 'Ejercicio favorito' : 'Favourite exercise' }}
          </p>
          <p class="text-xl font-black text-amber-300">{{ exerciseName(profile.stats.favExercise) }}</p>
        </div>
        <div v-if="profile.user.weapon_name" class="rounded-2xl border border-border/30 bg-surface/10 p-4 space-y-2">
          <p class="text-[9px] font-black tracking-widest uppercase text-muted/50">
            {{ locale === 'es' ? 'Arma equipada' : 'Equipped weapon' }}
          </p>
          <p class="text-sm font-bold text-foreground">🗡️ {{ profile.user.weapon_name }}</p>
          <p class="text-[10px]" :style="{ color: rarityColor(profile.user.weapon_rarity) }">
            {{ rarityLabel(profile.user.weapon_rarity) }}
          </p>
        </div>
      </section>

      <!-- Heatmap -->
      <section class="space-y-3">
        <h2 class="text-xs font-black tracking-widest uppercase text-muted/50">
          {{ locale === 'es' ? 'Historial de entrenamiento' : 'Training history' }}
        </h2>
        <Heatmap :data="profile.heatmap" class="w-full" />
      </section>

      <!-- Exercise breakdown -->
      <section v-if="profile.stats.breakdown?.length" class="rounded-2xl border border-border/40 bg-surface/10 p-5 space-y-3">
        <h2 class="text-xs font-black tracking-widest uppercase text-muted/50">
          {{ locale === 'es' ? 'Desglose por ejercicio' : 'Exercise breakdown' }}
        </h2>
        <div class="space-y-2">
          <div
            v-for="ex in profile.stats.breakdown.slice(0, 5)"
            :key="ex.type"
            class="flex items-center gap-3"
          >
            <p class="w-28 text-xs font-bold text-foreground/70 truncate shrink-0">{{ exerciseName(ex.type) }}</p>
            <div class="flex-1 h-1.5 bg-border/30 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-500 rounded-full"
                :style="{ width: `${Math.min(100, (ex.count / maxBreakdownCount) * 100)}%` }"
              />
            </div>
            <p class="text-xs font-black tabular-nums text-muted/60 w-16 text-right shrink-0">
              {{ ex.count.toLocaleString() }}
            </p>
          </div>
        </div>
      </section>

      <!-- CTA for visitors -->
      <section
        v-if="!isAuthenticated"
        class="rounded-2xl border border-primary-500/30 bg-primary-500/[0.07] p-8 text-center space-y-4"
      >
        <p class="text-xs font-black tracking-widest uppercase text-primary-400/70">
          {{ locale === 'es' ? 'Únete a Reppy' : 'Join Reppy' }}
        </p>
        <h2 class="text-2xl font-black text-foreground">
          {{ locale === 'es'
            ? `¿Puedes superar a ${profile.user.name}?`
            : `Can you beat ${profile.user.name}?` }}
        </h2>
        <p class="text-sm text-muted max-w-md mx-auto">
          {{ locale === 'es'
            ? 'Registra tus reps, sube de nivel y compite en el ranking global. Gratis, siempre.'
            : 'Log your reps, level up, and compete in the global ranking. Free, always.' }}
        </p>
        <router-link :to="`/${locale}/login`" class="btn-reppy inline-block text-base px-10 py-4">
          {{ locale === 'es' ? 'CREAR CUENTA GRATIS' : 'CREATE FREE ACCOUNT' }}
        </router-link>
      </section>

      <!-- Footer -->
      <footer class="pt-4 border-t border-border/20 text-center">
        <router-link :to="`/${locale}`" class="text-xs font-black text-primary-500 hover:text-white transition-colors uppercase tracking-widest">
          ← Reppy
        </router-link>
      </footer>
    </div>

    <!-- JSON-LD injected server-side for SSG, also set client-side -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import Heatmap from '@/components/training/Heatmap.vue';

const props = defineProps({ username: { type: String, required: true } });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const i18n = useI18nStore();
const locale = computed(() => i18n.locale);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const profile = ref(null);
const loading = ref(true);
const notFound = ref(false);
const globalRank = ref(null);

const RARITY_COLORS = {
  common: '#9ca3af', rare: '#60a5fa', especial: '#a78bfa',
  legendary: '#f59e0b', calistenico: '#34d399', cosmico: '#f472b6',
};
// Single source of truth: the shared rarity_* i18n keys (same as Shop/Inventory).
const RARITY_KEYS = { common: 'rarity_common', rare: 'rarity_rare', especial: 'rarity_special', legendary: 'rarity_legendary', calistenico: 'rarity_calisthenic', cosmico: 'rarity_cosmico' };

function rarityColor(r) { return RARITY_COLORS[r] || '#9ca3af'; }
function rarityLabel(r) { return RARITY_KEYS[r] ? i18n.t(RARITY_KEYS[r]) : (r || ''); }

const EXERCISE_NAMES = {
  es: { pullups: 'Dominadas', pushups: 'Flexiones', dips: 'Fondos', muscleups: 'Muscle-Ups', weighted_pullups: 'Dom. con Lastre', squats: 'Sentadillas', situps: 'Abdominales' },
  en: { pullups: 'Pull-ups', pushups: 'Push-ups', dips: 'Dips', muscleups: 'Muscle-Ups', weighted_pullups: 'Weighted Pull-ups', squats: 'Squats', situps: 'Sit-ups' },
};
function exerciseName(slug) { return (EXERCISE_NAMES[locale.value] || EXERCISE_NAMES.es)[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '—'); }

const attributes = computed(() => {
  if (!profile.value) return [];
  const u = profile.value.user;
  return [
    { key: 'STR', icon: '⚔️', level: u.str_lvl || 1 },
    { key: 'DEX', icon: '🎯', level: u.dex_lvl || 1 },
    { key: 'END', icon: '🛡️', level: u.end_lvl || 1 },
    { key: 'VIG', icon: '❤️', level: u.vig_lvl || 1 },
    { key: 'INT', icon: '🧠', level: u.int_lvl || 1 },
    { key: 'FTH', icon: '✨', level: u.fth_lvl || 1 },
    { key: 'CHA', icon: '👑', level: u.cha_lvl || 1 },
  ];
});

const maxBreakdownCount = computed(() => {
  if (!profile.value?.stats?.breakdown?.length) return 1;
  return Math.max(...profile.value.stats.breakdown.map(e => e.count), 1);
});

async function fetchProfile() {
  loading.value = true;
  notFound.value = false;
  try {
    // Resolve username → id
    const resolveRes = await axios.get(`/api/profile/u/${props.username}`);
    const userId = resolveRes.data.id;

    // Fetch full profile
    const profileRes = await axios.get(`/api/profile/${userId}?type=all`);
    profile.value = profileRes.data;

    // Global rank
    try {
      const rankRes = await axios.get(`/api/leaderboard/global?type=all`);
      const idx = rankRes.data.findIndex(u => u.id === userId);
      globalRank.value = idx >= 0 ? idx + 1 : null;
    } catch {}

    updateMeta();
  } catch (e) {
    if (e?.response?.status === 404) notFound.value = true;
  } finally {
    loading.value = false;
  }
}

function updateMeta() {
  if (!profile.value) return;
  const u = profile.value.user;
  const s = profile.value.stats;
  const isEs = locale.value === 'es';
  const title = isEs
    ? `${u.name} — Atleta Reppy Nv.${u.current_level} | ${s.totalReps.toLocaleString()} reps`
    : `${u.name} — Reppy Athlete Lv.${u.current_level} | ${s.totalReps.toLocaleString()} reps`;
  const description = isEs
    ? `Perfil de ${u.name} en Reppy: ${s.totalReps.toLocaleString()} repeticiones totales, racha de ${s.streak} días, nivel ${u.current_level}. Ejercicio favorito: ${exerciseName(s.favExercise)}.`
    : `${u.name}'s Reppy profile: ${s.totalReps.toLocaleString()} total reps, ${s.streak}-day streak, level ${u.current_level}. Favourite: ${exerciseName(s.favExercise)}.`;
  const url = `https://reppy-weld.vercel.app${route.path}`;

  document.title = title;
  const sm = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  sm('meta[name="description"]', 'content', description);
  sm('meta[property="og:title"]', 'content', title);
  sm('meta[property="og:description"]', 'content', description);
  sm('meta[property="og:url"]', 'content', url);
  if (u.avatar_url) sm('meta[property="og:image"]', 'content', u.avatar_url);
  sm('meta[name="twitter:title"]', 'content', title);
  sm('meta[name="twitter:description"]', 'content', description);
  sm('link[rel="canonical"]', 'href', url);

  // Person schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: u.name,
    url,
    image: u.avatar_url || undefined,
    description: description,
    memberOf: { '@type': 'Organization', name: 'Reppy', url: 'https://reppy-weld.vercel.app' },
  };
  let el = document.getElementById('athlete-jsonld');
  if (!el) {
    el = document.createElement('script');
    el.id = 'athlete-jsonld';
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

onMounted(fetchProfile);
watch(() => props.username, fetchProfile);
watch(locale, updateMeta);
</script>

<style scoped>
.btn-reppy {
  @apply bg-primary-500 text-white font-black rounded-2xl transition-all active:scale-95 hover:shadow-xl hover:shadow-primary-500/25 px-8 py-3;
}
</style>
