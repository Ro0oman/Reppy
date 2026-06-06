<template>
  <article class="relative overflow-hidden rounded-2xl border border-red-500/30 bg-[#0d0608] shadow-2xl shadow-red-900/20">
    <!-- Background boss image -->
    <div v-if="d.boss_image" class="absolute inset-0 pointer-events-none">
      <img :src="d.boss_image" alt="" role="presentation" class="w-full h-full object-cover opacity-10 scale-110 blur-sm" loading="lazy" />
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
    </div>

    <!-- Red glow top -->
    <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-red-600/20 blur-3xl pointer-events-none" />

    <div class="relative z-10 p-4 space-y-4">
      <!-- Header -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1">
          <span class="text-xs">☠️</span>
          <span class="text-[10px] font-black tracking-widest uppercase text-red-400">
            {{ i18n.locale === 'es' ? 'Boss derrotado' : 'Boss defeated' }}
          </span>
        </div>
        <span class="ml-auto text-[10px] text-white/30">{{ timeAgo }}</span>
      </div>

      <!-- Boss name -->
      <div class="text-center py-2">
        <p class="text-[10px] font-bold tracking-widest text-red-400/60 uppercase mb-1">
          {{ i18n.locale === 'es' ? 'ha caído' : 'has fallen' }}
        </p>
        <h2 class="text-2xl font-black tracking-tight text-white">{{ d.boss_name }}</h2>
      </div>

      <!-- Last hit -->
      <div class="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 flex items-center gap-3">
        <span class="text-2xl">⚔️</span>
        <div>
          <p class="text-[9px] font-bold tracking-widest uppercase text-amber-400/60">
            {{ i18n.locale === 'es' ? 'Último golpe' : 'Last hit' }}
          </p>
          <p class="text-sm font-black text-amber-300">{{ d.killer_name }}</p>
        </div>
        <span class="ml-auto text-xl">👑</span>
      </div>

      <!-- Top 3 -->
      <div v-if="top3.length" class="space-y-2">
        <p class="text-[9px] font-bold tracking-widest uppercase text-white/30 px-1">
          {{ i18n.locale === 'es' ? 'Top daño infligido' : 'Top damage dealers' }}
        </p>
        <div class="space-y-1.5">
          <div
            v-for="(player, idx) in top3"
            :key="player.id"
            class="flex items-center gap-3 rounded-xl border bg-white/[0.03] px-3 py-2.5"
            :class="idx === 0 ? 'border-amber-500/30' : 'border-white/[0.07]'"
          >
            <span class="text-lg shrink-0 w-7 text-center">{{ medals[idx] }}</span>
            <img
              v-if="player.avatar_url"
              :src="player.avatar_url"
              :alt="player.name"
              class="h-7 w-7 rounded-full object-cover border border-white/10 shrink-0"
              loading="lazy"
            />
            <div v-else class="h-7 w-7 rounded-full bg-white/10 shrink-0 grid place-items-center text-xs font-black text-white/60">
              {{ (player.name || '?')[0].toUpperCase() }}
            </div>
            <span class="flex-1 text-sm font-bold text-white/90 truncate">{{ player.name }}</span>
            <span class="text-sm font-black tabular-nums" :class="idx === 0 ? 'text-amber-400' : 'text-white/60'">
              {{ Number(player.damage_dealt).toLocaleString() }}
            </span>
            <span class="text-[9px] text-white/30 uppercase font-bold">dmg</span>
          </div>
        </div>
      </div>

      <!-- Share button -->
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/[0.08] py-3 text-sm font-bold text-red-300 hover:bg-red-500/15 transition-colors active:scale-[0.98]"
        :disabled="generating"
        @click="handleShare"
      >
        <Share2 class="w-4 h-4" />
        <span v-if="generating">{{ i18n.locale === 'es' ? 'Generando…' : 'Generating…' }}</span>
        <span v-else>{{ i18n.locale === 'es' ? 'Compartir victoria' : 'Share victory' }}</span>
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Share2 } from 'lucide-vue-next';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';

const props = defineProps({ activity: { type: Object, required: true } });

const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const generating = ref(false);

const d = computed(() => props.activity.pvp_data || {});
const top3 = computed(() => {
  const raw = d.value.top3;
  if (!raw) return [];
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
  return Array.isArray(raw) ? raw : [];
});
const medals = ['🥇', '🥈', '🥉'];

const timeAgo = computed(() => {
  const date = new Date(d.value.created_at || props.activity.created_at);
  const diff = Math.floor((Date.now() - date) / 60000);
  if (diff < 1) return i18n.locale === 'es' ? 'ahora' : 'just now';
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
});

async function handleShare() {
  if (generating.value) return;
  generating.value = true;
  try {
    const { useBossKillShare } = await import('@/composables/useBossKillShare.js');
    const { share } = useBossKillShare();
    await share(d.value, top3.value);
  } catch {
    notificationStore.notify(
      i18n.locale === 'es' ? 'No se pudo generar la imagen' : 'Could not generate image',
      'error'
    );
  } finally {
    generating.value = false;
  }
}
</script>
