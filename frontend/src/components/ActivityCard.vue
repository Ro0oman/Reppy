<template>
   <div 
    :id="'activity-' + activity.user_id + '-' + activity.date"
    class="reddit-card group relative overflow-hidden flex flex-col gap-0 border border-white/10 backdrop-blur-xl transition-all duration-300"
    :class="[
      activity.post_background_css ? 'bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'bg-surface/30 hover:bg-surface/40 hover:border-white/20 shadow-xl',
      highlighted ? 'ring-1 ring-primary-500 shadow-[0_0_20px_rgba(255,69,0,0.2)] scale-[1.01]' : '',
      activity.has_crit ? 'crit-card-glow' : ''
    ]"
    style="border-radius: 20px; margin-bottom: 16px;"
  >
    <!-- Background Enhancement Layer -->
    <div v-if="activity.post_background_css" class="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-[12px]">
      <div class="absolute inset-0 transition-opacity duration-1000 opacity-60" :class="activity.post_background_css"></div>
    </div>

    <!-- Layer A: Header -->
    <div class="px-4 py-3 flex items-center justify-between relative z-10">
      <div class="flex items-center gap-3 min-w-0">
        <div class="relative cursor-pointer hover:scale-105 transition-transform shrink-0" @click="$emit('viewProfile', activity.user_id)">
          <AvatarFrame 
            :src="activity.avatar_url" 
            :border-css="activity.border_css" 
            :avatar-css="activity.avatar_css" 
            :size="36" 
          />
        </div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-foreground tracking-tight truncate leading-tight">{{ activity.user_name }}</span>
            <div v-if="activity.real_streak > 1" 
                 class="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[11px] font-black text-emerald-500 uppercase tracking-tighter shrink-0"
                 :class="activity.real_streak > 5 ? 'animate-streak-fire' : ''">
              {{ activity.real_streak }}🔥
            </div>
          </div>
          <div class="flex items-center gap-2 opacity-60">
             <span class="text-[9px] text-primary-400 font-black uppercase tracking-widest">{{ activity.title_name || 'RECRUIT' }}</span>
             <span class="text-[8px] text-muted font-medium uppercase tracking-widest">• {{ timeAgo }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Quick Compare Button -->
        <button 
          v-if="!isOwn"
          @click="$emit('compare', activity)"
          class="p-2 hover:bg-primary-500/10 rounded-lg transition-all text-muted hover:text-primary-500 hover:scale-110 active:scale-95 group"
          title="Compare Stats"
        >
          <Scan class="w-4 h-4" />
        </button>

        <!-- Edit Button (Only for owner) -->
        <button v-if="isOwn" 
                @click="$emit('edit', activity)"
                class="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-muted/40 hover:text-primary-500 shrink-0">
          <Edit3 class="w-4 h-4" />
        </button>

        <!-- Rank Badge -->
        <div v-if="activity.global_rank" 
             class="px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 border transition-all duration-300"
             :class="rankStyles">
          <Crown v-if="activity.global_rank === 1" class="w-3 h-3 drop-shadow-[0_0_3px_rgba(245,158,11,0.8)]" />
          <Trophy v-else-if="activity.global_rank <= 3" class="w-3 h-3" />
          <TrendingUp v-else class="w-3 h-3 opacity-40" />
          <span class="text-[10px] font-black uppercase tracking-widest italic">#{{ activity.global_rank }}</span>
        </div>
      </div>
    </div>

    <!-- Equipment Row -->
    <div v-if="activity.equipment" class="px-4 py-2 border-y border-white/5 bg-white/[0.02] flex items-center gap-4 overflow-x-auto no-scrollbar relative z-10">
      <template v-for="(item, slot) in activity.equipment" :key="slot">
        <div v-if="item && item.name" 
             class="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap shrink-0">
          <div class="p-1 px-1.5 rounded-lg border flex items-center justify-center transition-all"
               :class="getRarityClass(item.rarity, 'bg')">
            <component :is="getSlotIcon(slot)" class="w-2.5 h-2.5" :class="getRarityClass(item.rarity)" />
          </div>
          <span class="text-[9px] font-bold uppercase tracking-tight" :class="getRarityClass(item.rarity)">
            {{ item.name }}
          </span>
        </div>
      </template>
    </div>

    <!-- Main Content Area -->
    <div class="px-4 pb-4 space-y-3 relative z-10">
      <div class="space-y-1 mt-3">
        <h3 v-if="activity.title" class="text-sm font-bold text-foreground leading-tight">{{ activity.title }}</h3>
        <div v-if="activity.description" class="relative group/desc">
          <p class="text-[13px] text-foreground/80 leading-snug transition-all" :class="isExpanded ? '' : 'line-clamp-2'">{{ activity.description }}</p>
          <button v-if="activity.description.length > 80" @click="isExpanded = !isExpanded" 
                  class="text-[9px] font-black text-primary-500 mt-1 uppercase tracking-[0.2em] hover:text-primary-400 transition-colors">
            {{ isExpanded ? 'RECOGER DATA' : 'LEER MÁS' }}
          </button>
        </div>
      </div>

      <!-- RPG Stats & Boss Context Hero Card -->
      <div class="relative rounded-2xl overflow-hidden border border-border/10 bg-black/40 backdrop-blur-md">
        
        <!-- Critical Overlay Text -->
        <div v-if="activity.has_crit" class="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20">
           <div class="animate-crit-text text-[60px] font-black text-primary-500/20 italic uppercase tracking-tighter select-none rotate-[-5deg]">CRITICAL</div>
        </div>

        <div class="flex items-center divide-x divide-border/20 py-3 relative z-10">
          <!-- Reps -->
          <div class="flex-1 flex flex-col items-center justify-center py-1">
            <p class="text-[10px] font-bold text-muted/60 uppercase tracking-[0.05em] mb-1.5">{{ i18n.t('activity_reps_session') }}</p>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold tabular-nums text-foreground tracking-tight">{{ animatedReps }}</span>
              <Dumbbell class="w-3 h-3 text-muted/20" />
            </div>
          </div>

          <!-- Total Damage + Boss Thumbnail -->
          <div class="flex-[1.5] relative flex flex-col items-center justify-center py-2 bg-primary-500/5 overflow-hidden group/damage">
            
            <!-- Boss Thumbnail Context -->
            <div v-if="activity.boss_image" class="absolute -left-2 top-1/2 -translate-y-1/2 opacity-20 group-hover/damage:opacity-60 transition-opacity">
               <img :src="activity.boss_image" class="w-16 h-16 object-contain grayscale group-hover/damage:grayscale-0 transition-all duration-500" />
            </div>

            <p class="text-[10px] font-black text-primary-500 uppercase tracking-[0.1em] mb-1 flex items-center gap-1.5">
              {{ i18n.t('activity_damage_session') }}
              <Zap v-if="activity.has_crit" class="w-3 h-3 text-amber-500 animate-pulse" />
            </p>

            <div class="flex flex-col items-center relative z-10">
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-black tabular-nums tracking-tight transition-all duration-300"
                      :class="activity.has_crit ? 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-110' : 'text-primary-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]'">
                  {{ animatedDamage }}
                </span>
                <Swords class="w-3.5 h-3.5 text-primary-500 opacity-60" />
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[8px] font-bold text-muted/40 uppercase tracking-tighter">{{ activity.total_base_damage_today || 0 }}B</span>
                <span class="text-[8px] font-bold text-primary-400 uppercase tracking-tighter" v-if="activity.total_gear_bonus_today > 0">+{{ activity.total_gear_bonus_today }}G</span>
                <span class="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter" v-if="activity.total_buff_bonus_today > 0">+{{ activity.total_buff_bonus_today }}B</span>
              </div>
            </div>

            <!-- Boss Name Reveal -->
             <div v-if="activity.boss_name" class="absolute bottom-1 right-2 opacity-0 group-hover/damage:opacity-100 transition-all transform translate-y-1 group-hover/damage:translate-y-0">
               <span class="text-[8px] font-black text-primary-500/60 uppercase italic tracking-widest">VS {{ activity.boss_name }}</span>
             </div>
          </div>
        </div>

        <!-- Personal Best Badge -->
        <div v-if="activity.is_personal_best" class="absolute top-0 right-0 p-2">
          <Flame class="w-4 h-4 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
      </div>

      <!-- Exercise Breakdown Tags -->
      <div class="flex flex-wrap gap-2 pt-1 border-t border-white/5">
        <div v-for="ex in activity.exercises" :key="ex.exercise_type" 
             class="h-6 px-3 rounded-full text-[10px] font-bold flex items-center gap-2 border transition-all shrink-0"
             :class="ex.is_crit ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/5 text-muted hover:bg-white/10'">
          <span class="uppercase tracking-tight">{{ i18n.t(ex.exercise_type) }}</span>
          <span class="tabular-nums">{{ ex.count }}</span>
          <Zap v-if="ex.is_crit" class="w-2.5 h-2.5 text-amber-500 animate-pulse" />
          <Trophy v-else-if="ex.is_pr" class="w-2.5 h-2.5 text-emerald-500" />
        </div>
      </div>
    </div>

    <!-- Footer Action Bar -->
    <div class="px-2 py-1 flex items-center justify-between border-t border-border/10 relative z-10 bg-black/20 h-11">
      <div class="flex items-center h-full">
        <!-- Like Button with author reward feedback -->
        <button @click="toggleLike" class="w-12 h-full flex items-center justify-center transition-all active:scale-90 group/btn" :class="activity.user_has_liked ? 'text-primary-500' : 'text-muted'">
          <div class="relative">
            <div v-if="activity.user_has_liked" class="absolute inset-0 bg-primary-500/20 blur-lg rounded-full animate-pulse"></div>
            <ArrowBigUp class="w-6 h-6 relative z-10" :class="activity.user_has_liked ? 'fill-current' : ''" />
          </div>
          <span class="text-[11px] font-bold ml-1 tabular-nums">{{ activity.like_count }}</span>
        </button>

        <!-- Comments -->
        <button @click="showComments = !showComments" class="w-12 h-full flex items-center justify-center gap-1.5 transition-all text-muted active:scale-95 px-2">
          <MessageSquare class="w-5 h-5" />
          <span class="text-[11px] font-bold tabular-nums">{{ activity.comment_count }}</span>
        </button>

        <!-- Share -->
        <button @click="shareActivity" class="w-12 h-full flex items-center justify-center transition-all text-muted active:scale-95">
          <Share2 class="w-5 h-5" />
        </button>
      </div>

      <div class="flex items-center gap-2 pr-4 opacity-40 scale-90">
        <Swords class="w-4 h-4" />
      </div>
    </div>

    <!-- Comments Section -->
    <div v-if="showComments" class="p-4 pt-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
      <div class="flex gap-3">
        <input 
          v-model="commentText" @keyup.enter="submitComment" :placeholder="i18n.t('activity_comment_hint')" 
          class="flex-1 bg-surface/10 border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-primary-500/50 transition-all font-industrial"
        />
        <button @click="submitComment" class="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center min-w-[40px]" :disabled="!commentText.trim() || submittingComment">
          <Loader2 v-if="submittingComment" class="w-4 h-4 animate-spin" />
          <Send v-else class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          <div v-if="loadingComments" class="flex justify-center py-4">
              <div class="w-5 h-5 border-2 border-primary-500/20 border-t-primary-500 animate-spin rounded-full"></div>
          </div>
          <div v-for="comment in comments" :key="comment.id" class="flex gap-3 items-start group/comment-item">
              <AvatarFrame :src="comment.avatar_url" :border-css="comment.border_css" :size="28" />
              <div class="flex-1 bg-foreground/[0.03] rounded-2xl p-3 border border-border/30 backdrop-blur-md">
                  <p class="text-[10px] font-black text-primary-500 uppercase mb-1">{{ comment.user_name }}</p>
                  <p class="text-xs text-foreground/90 leading-tight font-medium">{{ comment.content }}</p>
              </div>
          </div>
          <p v-if="!loadingComments && comments.length === 0" class="text-[10px] text-center text-muted uppercase tracking-widest py-4 opacity-40">{{ i18n.t('activity_no_records') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import AvatarFrame from './AvatarFrame.vue';
import { 
    Heart, MessageSquare, Share2, Edit3, Send, 
    Swords, ChevronRight, Trophy, Zap, 
    Flame, TrendingUp, Loader2, Dumbbell,
    ArrowBigUp, Crown, Scan,
    Shield, Sword, Footprints, Construction
} from 'lucide-vue-next';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useNotificationStore } from '../stores/notification';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale/es';
import { enUS } from 'date-fns/locale/en-US';

const props = defineProps({
  activity: Object,
  highlighted: Boolean
});

const emit = defineEmits(['toggleLike', 'viewProfile', 'edit', 'commentAdded', 'compare']);

const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const route = useRoute();

const showComments = ref(false);
const isExpanded = ref(false);
const commentText = ref('');
const comments = ref([]);
const loadingComments = ref(false);
const submittingComment = ref(false);

const animatedDamage = ref(0);
const animatedReps = ref(0);

const isOwn = computed(() => props.activity.user_id === authStore.user?.id);

const timeAgo = computed(() => {
  if (!props.activity.date) return '';
  const date = props.activity.created_at ? new Date(props.activity.created_at) : new Date(props.activity.date + 'T12:00:00');
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: i18n.locale === 'es' ? es : enUS 
  });
});

const rankStyles = computed(() => {
  const rank = props.activity.global_rank;
  if (!rank) return 'bg-white/5 border-white/10 text-muted';
  switch (rank) {
    case 1: return 'bg-[#F59E0B] text-black border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    case 2: return 'bg-[#E2E8F0] text-black border-[#E2E8F0] shadow-[0_0_15px_rgba(226,232,240,0.3)]';
    case 3: return 'bg-[#B45309] text-white border-[#B45309] shadow-[0_0_15px_rgba(180,83,9,0.3)]';
    default: return 'bg-white/5 border-white/10 text-muted/60';
  }
});

const getSlotIcon = (slot) => {
  switch (slot) {
    case 'head': return Construction;
    case 'weapon': return Sword;
    case 'armor': return Shield;
    case 'boots': return Footprints;
    default: return Sword;
  }
};

const getRarityClass = (rarity, prefix = '') => {
  const r = rarity?.toLowerCase() || 'common';
  let finalR = r === 'epic' ? 'especial' : r;
  if (prefix === 'bg') return `bg-rarity-${finalR}`;
  return `rarity-${finalR} ${finalR === 'legendary' ? 'glow-legendary' : ''} ${finalR === 'calistenico' ? 'glow-calistenico' : ''}`;
};

const toggleLike = () => {
  if (navigator.vibrate) navigator.vibrate(10);
  emit('toggleLike');
};

const submitComment = async () => {
    if (!commentText.value.trim() || submittingComment.value) return;
    submittingComment.value = true;
    try {
        const res = await axios.post('/api/social-feed/comment', {
            targetUserId: props.activity.user_id,
            date: props.activity.date,
            content: commentText.value
        });
        comments.value.push(res.data);
        commentText.value = '';
        props.activity.comment_count = (Number(props.activity.comment_count) || 0) + 1;
        notificationStore.notify('🔥 +20 CARISMA XP', 'success');
        authStore.fetchProfile();
        emit('commentAdded');
    } catch (e) {
        console.error('Error adding comment:', e);
    } finally {
        submittingComment.value = false;
    }
};

const fetchComments = async () => {
    if (!props.activity.summary_id) return;
    loadingComments.value = true;
    try {
        const res = await axios.get(`/api/social-feed/comments/${props.activity.summary_id}`);
        comments.value = res.data;
    } catch (e) { console.error('Error:', e); }
    finally { loadingComments.value = false; }
};

watch(showComments, (val) => {
    if (val && comments.value.length === 0) fetchComments();
});

onMounted(() => {
    const endDamage = Number(props.activity.total_damage_today) || 0;
    const endReps = Number(props.activity.total_reps_today) || 0;
    
    const animate = (targetRef, targetValue) => {
      const duration = 500;
      const startTime = Date.now();
      const run = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const ease = 1 - Math.pow(2, -10 * progress);
        targetRef.value = Math.floor(targetValue * ease);
        if (progress < 1) requestAnimationFrame(run);
        else targetRef.value = targetValue;
      };
      requestAnimationFrame(run);
    };

    if (endDamage > 0) animate(animatedDamage, endDamage);
    if (endReps > 0) animate(animatedReps, endReps);
});

const shareActivity = async () => {
    const shareUrl = `${window.location.origin}/social?user=${props.activity.user_id}&date=${props.activity.date}`;
    try {
        if (navigator.share) await navigator.share({ title: 'Reppy Activity', url: shareUrl });
        else {
            await navigator.clipboard.writeText(shareUrl);
            notificationStore.notify(i18n.t('activity_copied'), 'success');
        }
    } catch (e) {}
};
</script>

<style scoped>
.crit-card-glow {
  border-color: rgba(245, 158, 11, 0.4) !important;
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.15), inset 0 0 20px rgba(245, 158, 11, 0.05) !important;
}

@keyframes crit-text-pop {
  0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 0.3; }
  100% { transform: scale(1) rotate(-5deg); opacity: 0.2; }
}

.animate-crit-text {
  animation: crit-text-pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes streak-fire {
  0% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.1); filter: brightness(1.3) drop-shadow(0 0 5px orange); }
  100% { transform: scale(1); filter: brightness(1); }
}

.animate-streak-fire {
  animation: streak-fire 1s ease-in-out infinite;
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
