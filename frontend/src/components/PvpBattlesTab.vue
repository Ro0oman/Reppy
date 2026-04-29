<template>
  <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    <!-- Loading -->
    <div v-if="loading" class="py-20 flex flex-col items-center justify-center gap-4">
      <div class="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 animate-spin rounded-full"></div>
      <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.t('pvp_scanning') }}</p>
    </div>

    <template v-else>
      <!-- Pending Challenges (waiting for me to accept) -->
      <section v-if="pending.length > 0" class="space-y-4">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
          <h3 class="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">{{ i18n.t('pvp_incoming_challenges') }}</h3>
          <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-[8px] font-black text-amber-500 border border-amber-500/30">{{ pending.length }}</span>
        </div>
        <div v-for="fight in pending" :key="fight.id" 
          class="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex items-center justify-between gap-4 hover:bg-amber-500/10 transition-all">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Swords class="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p class="text-sm font-black text-white uppercase italic tracking-tighter">{{ fight.challenger_name }}</p>
              <p class="text-[9px] text-muted uppercase tracking-widest font-bold">{{ i18n.t('pvp_challenge_received') }}</p>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[7px] text-muted font-black uppercase">{{ fight.battlefield }}</span>
                <span class="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[7px] text-muted font-black uppercase">{{ fight.max_hp }} HP</span>
                <span class="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[7px] text-muted font-black uppercase">{{ fight.time_limit }}s</span>
              </div>
            </div>
          </div>
          <button @click="goToBattle(fight.id)"
            class="shrink-0 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95">
            {{ i18n.t('pvp_accept') }}
          </button>
        </div>
      </section>

      <!-- Active Fights (Combatting now) -->
      <section v-if="active.length > 0" class="space-y-4">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          <h3 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">{{ i18n.t('pvp_active_fights') }}</h3>
          <span class="px-2 py-0.5 rounded-full bg-primary-500/20 text-[8px] font-black text-primary-500 border border-primary-500/30">{{ active.length }}</span>
        </div>
        <div v-for="fight in active" :key="fight.id"
          @click="goToBattle(fight.id)"
          class="bg-primary-500/5 border border-primary-500/20 rounded-3xl p-6 flex items-center justify-between gap-4 hover:bg-primary-500/10 transition-all cursor-pointer group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
              <Swords class="w-5 h-5 text-primary-500 group-hover:animate-pulse" />
            </div>
            <div>
              <p class="text-sm font-black text-white uppercase italic tracking-tighter">
                {{ fight.challenger_name }} <span class="text-primary-500/60">vs</span> {{ fight.challenged_name }}
              </p>
              <p class="text-[9px] text-muted uppercase tracking-widest font-bold mt-0.5">{{ fight.battlefield }}</p>
              <div class="flex items-center gap-3 mt-2">
                <div class="space-y-0.5">
                  <p class="text-[7px] text-muted uppercase tracking-widest">{{ fight.challenger_name }}</p>
                  <div class="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: (fight.hp1 / fight.max_hp * 100) + '%' }"></div>
                  </div>
                </div>
                <div class="space-y-0.5">
                  <p class="text-[7px] text-muted uppercase tracking-widest">{{ fight.challenged_name }}</p>
                  <div class="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: (fight.hp2 / fight.max_hp * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="px-3 py-1 bg-primary-500/20 border border-primary-500/40 rounded-full text-[8px] font-black text-primary-500 uppercase tracking-widest">{{ i18n.t('pvp_live') }}</span>
            <ChevronRight class="w-4 h-4 text-muted/30 group-hover:text-primary-500 transition-colors" />
          </div>
        </div>
      </section>

      <!-- Sent Pending Challenges -->
      <section v-if="sent.length > 0" class="space-y-4">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-white/20"></div>
          <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.t('pvp_sent_challenges') }}</h3>
          <span class="px-2 py-0.5 rounded-full bg-white/5 text-[8px] font-black text-muted border border-white/10">{{ sent.length }}</span>
        </div>
        <div v-for="fight in sent" :key="fight.id"
          @click="goToBattle(fight.id)"
          class="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-all cursor-pointer group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Swords class="w-5 h-5 text-muted/40" />
            </div>
            <div>
              <p class="text-sm font-black text-white/60 uppercase italic tracking-tighter">
                {{ fight.challenged_name }}
              </p>
              <p class="text-[9px] text-muted/40 uppercase tracking-widest font-bold mt-0.5">{{ fight.battlefield }}</p>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-muted uppercase tracking-widest">{{ i18n.t('pvp_pending') }}</span>
            <ChevronRight class="w-4 h-4 text-muted/30 group-hover:text-primary-500 transition-colors" />
          </div>
        </div>
      </section>

      <!-- Empty State: no current fights -->
      <div v-if="pending.length === 0 && active.length === 0 && !loading"
        class="py-16 text-center space-y-4 bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
        <Swords class="w-10 h-10 text-muted/20 mx-auto" />
        <p class="text-xs font-black text-muted uppercase tracking-widest">{{ i18n.t('pvp_no_fights') }}</p>
        <p class="text-[9px] text-muted/50">{{ i18n.t('pvp_no_fights_desc') }}</p>
      </div>

      <!-- History -->
      <section v-if="history.length > 0" class="space-y-4">
        <div class="flex items-center gap-2">
          <History class="w-3.5 h-3.5 text-muted/50" />
          <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.t('pvp_history') }}</h3>
        </div>
        <div v-for="fight in history" :key="fight.id"
          @click="goToBattle(fight.id)"
          class="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-all cursor-pointer group opacity-70 hover:opacity-100">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="fight.winner_id === authStore.user?.id ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5 border border-white/10'">
              <Trophy v-if="fight.winner_id === authStore.user?.id" class="w-4 h-4 text-amber-500" />
              <Swords v-else class="w-4 h-4 text-muted/40" />
            </div>
            <div>
              <p class="text-xs font-black text-white uppercase italic tracking-tighter">
                {{ fight.challenger_name }} <span class="text-muted/50">vs</span> {{ fight.challenged_name }}
              </p>
              <p class="text-[8px] text-muted uppercase tracking-widest font-bold mt-0.5">{{ fight.battlefield }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-[8px] font-black uppercase tracking-widest"
              :class="fight.winner_id === authStore.user?.id ? 'text-amber-500' : (fight.winner_id === null ? 'text-muted' : 'text-red-400')">
              {{ fight.winner_id === authStore.user?.id ? i18n.t('pvp_victory') : (fight.winner_id === null ? i18n.t('pvp_draw') : i18n.t('pvp_defeat')) }}
            </p>
            <p class="text-[7px] text-muted/40 uppercase tracking-widest mt-1">{{ fight.damage1 }} / {{ fight.damage2 }} DMG</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { Swords, Trophy, ChevronRight, History } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';

const i18n = useI18nStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const loading = ref(true);
const pending = ref([]);  // challenges I need to accept
const active = ref([]);   // strictly active fights
const sent = ref([]);     // challenges I sent but are still pending
const history = ref([]);  // completed

const fetchMyFights = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/pvp/my-fights');
    const fights = res.data;
    pending.value = fights.filter(f => f.status === 'pending' && f.challenged_id === authStore.user?.id);
    active.value = fights.filter(f => f.status === 'active');
    sent.value = fights.filter(f => f.status === 'pending' && f.challenger_id === authStore.user?.id);
    history.value = fights.filter(f => f.status === 'completed');
  } catch (e) {
    console.error('Error fetching fights:', e);
  } finally {
    loading.value = false;
  }
};

const goToBattle = (id) => {
  const lang = route.params.lang || i18n.locale || 'es';
  router.push(`/${lang}/pvp/${id}`);
};

onMounted(fetchMyFights);
</script>
