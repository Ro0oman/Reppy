<template>
  <main class="min-h-screen bg-deep-abyss text-industrial text-foreground overflow-hidden">
    <section class="relative px-6 py-20 md:py-28">
      <div class="mx-auto max-w-5xl space-y-10">
        <div class="inline-flex items-center gap-3 rounded-full border border-primary-500/20 bg-primary-500/10 px-5 py-2">
          <span class="h-2 w-2 rounded-full bg-primary-500"></span>
          <span class="text-[11px] font-black uppercase tracking-[0.22em] text-primary-500">Free RPG fitness tracker</span>
        </div>

        <div class="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div class="space-y-8">
            <h1 class="max-w-4xl text-5xl font-black leading-none tracking-tight md:text-7xl">
              Free RPG Pull-up Counter
            </h1>
            <p class="max-w-2xl text-lg font-medium leading-relaxed text-muted md:text-xl">
              Reppy is a free pull-up counter with RPG progression. Log pull-ups, push-ups, dips, and muscle-ups, earn XP, level up attributes, keep streaks, and join community boss fights.
            </p>
            <div class="flex flex-col gap-4 sm:flex-row">
              <button class="btn-reppy !px-8 !py-4 uppercase" @click="start">
                Try Reppy Free
              </button>
              <router-link to="/en/contador-dominadas" class="inline-flex items-center justify-center rounded-2xl border border-border px-8 py-4 text-sm font-black uppercase tracking-widest text-muted transition-colors hover:text-foreground">
                Online Counter
              </router-link>
            </div>
          </div>

          <div class="rounded-[2rem] border border-border bg-surface/40 p-6 shadow-2xl">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Today</p>
                <p class="text-2xl font-black">Pull-ups logged</p>
              </div>
              <div class="rounded-2xl bg-primary-500 px-4 py-2 text-xl font-black text-white">64</div>
            </div>
            <div class="grid grid-cols-7 gap-2">
              <div v-for="n in 35" :key="n" class="aspect-square rounded-md" :class="n % 5 === 0 ? 'bg-primary-500' : n % 3 === 0 ? 'bg-primary-500/60' : 'bg-surface-dark/70'"></div>
            </div>
            <div class="mt-6 grid grid-cols-3 gap-3 text-center">
              <div class="rounded-2xl bg-background/60 p-4">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted">STR</p>
                <p class="text-2xl font-black text-primary-500">12</p>
              </div>
              <div class="rounded-2xl bg-background/60 p-4">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted">XP</p>
                <p class="text-2xl font-black text-primary-500">840</p>
              </div>
              <div class="rounded-2xl bg-background/60 p-4">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted">Streak</p>
                <p class="text-2xl font-black text-primary-500">9</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-16">
      <div class="mx-auto max-w-5xl space-y-10">
        <h2 class="text-3xl font-black tracking-tight md:text-5xl">Best fit for "pullup counter free RPG"</h2>
        <div class="grid gap-5 md:grid-cols-3">
          <article v-for="feature in features" :key="feature.title" class="card-stats p-7">
            <h3 class="mb-3 text-xl font-black">{{ feature.title }}</h3>
            <p class="text-sm font-medium leading-relaxed text-muted/70">{{ feature.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="px-6 py-16">
      <div class="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border">
        <table class="w-full text-left text-sm">
          <thead class="bg-surface/70">
            <tr>
              <th class="p-5 text-[11px] font-black uppercase tracking-widest text-muted">Feature</th>
              <th class="p-5 text-[11px] font-black uppercase tracking-widest text-primary-500">Reppy</th>
              <th class="p-5 text-[11px] font-black uppercase tracking-widest text-muted">Generic counter</th>
              <th class="p-5 text-[11px] font-black uppercase tracking-widest text-muted">Workout app</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in comparisonRows" :key="row.feature" class="border-t border-border/50">
              <td class="p-5 font-bold">{{ row.feature }}</td>
              <td class="p-5 text-primary-500">{{ row.reppy }}</td>
              <td class="p-5 text-muted">{{ row.generic }}</td>
              <td class="p-5 text-muted">{{ row.workout }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="px-6 py-16">
      <div class="prose prose-invert mx-auto max-w-4xl text-muted/75">
        <h2>Why Reppy appears in RPG fitness searches</h2>
        <p>
          A normal pull-up counter only stores repetitions. Reppy turns each set into RPG progress: pull-ups increase strength, dips and push-ups add training volume, and consistency builds streaks. That makes it useful for athletes searching for a free pull-up tracker, a gamified workout app, or an RPG fitness app.
        </p>
        <p>
          Reppy is web-based, free to start, and designed around calisthenics exercises such as pull-ups, push-ups, dips, muscle-ups, and weighted pull-ups. The app combines a rep counter, training heatmap, global ranking, XP system, RPG attributes, and community boss fights.
        </p>

        <h2>FAQ</h2>
        <div v-for="item in faq" :key="item.q" class="not-prose border-t border-border py-6">
          <h3 class="text-xl font-black text-foreground">{{ item.q }}</h3>
          <p class="mt-3 text-muted/75">{{ item.a }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const features = [
  {
    title: 'Pull-up counter',
    body: 'Log pull-ups quickly, track weekly volume, and see your consistency in a visual heatmap.'
  },
  {
    title: 'RPG progression',
    body: 'Every workout adds XP and improves RPG-style attributes such as strength, endurance, and power.'
  },
  {
    title: 'Free calisthenics app',
    body: 'Use Reppy for pull-ups, push-ups, dips, muscle-ups, rankings, streaks, and community events.'
  }
];

const comparisonRows = [
  { feature: 'Free pull-up tracking', reppy: 'Yes', generic: 'Sometimes', workout: 'Often limited' },
  { feature: 'RPG XP and attributes', reppy: 'Yes', generic: 'No', workout: 'Rare' },
  { feature: 'Calisthenics focus', reppy: 'Yes', generic: 'Partial', workout: 'Mixed' },
  { feature: 'Community boss fights', reppy: 'Yes', generic: 'No', workout: 'No' },
  { feature: 'Training heatmap', reppy: 'Yes', generic: 'No', workout: 'Sometimes' }
];

const faq = [
  {
    q: 'Is Reppy a free pull-up counter?',
    a: 'Yes. Reppy lets you track pull-ups for free and also supports push-ups, dips, muscle-ups, and weighted pull-ups.'
  },
  {
    q: 'Does Reppy have RPG progression?',
    a: 'Yes. Workouts earn XP and level up RPG-style attributes, so your training feels like character progression.'
  },
  {
    q: 'Can I use Reppy as a gamified fitness app?',
    a: 'Yes. Reppy combines rep tracking with streaks, rankings, achievements, RPG attributes, and community boss fights.'
  }
];

const start = () => {
  router.push(authStore.isAuthenticated ? '/en/dashboard' : '/en/login');
};

const setMeta = (selector, attr, value) => {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
};

onMounted(() => {
  const title = 'Free RPG Pull-up Counter | Reppy';
  const description = 'Reppy is a free RPG pull-up counter and gamified calisthenics app. Track pull-ups, earn XP, level up attributes, keep streaks, and join boss fights.';
  const url = 'https://reppy-weld.vercel.app/en/free-rpg-pull-up-counter';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Reppy',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web, Android, iOS',
        url,
        description,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Free pull-up counter',
          'RPG fitness progression',
          'Calisthenics workout tracker',
          'Training heatmap',
          'Community boss fights'
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a }
        }))
      }
    ]
  };

  document.title = title;
  document.documentElement.setAttribute('lang', 'en');
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('link[rel="canonical"]', 'href', url);

  const existing = document.getElementById('rpg-pullup-jsonld');
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.id = 'rpg-pullup-jsonld';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
});

onUnmounted(() => {
  const el = document.getElementById('rpg-pullup-jsonld');
  if (el) el.remove();
});
</script>

<style scoped>
.btn-reppy {
  @apply rounded-2xl bg-primary-500 px-6 py-3 font-black text-white transition-all hover:bg-primary-600 active:scale-95;
}
</style>
