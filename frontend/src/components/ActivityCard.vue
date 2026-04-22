<template>
   <div 
    :id="'activity-' + activity.user_id + '-' + activity.date"
    class="reddit-card group relative overflow-hidden flex flex-col gap-0 border border-white/10 backdrop-blur-xl transition-all duration-300"
    :class="[
      activity.post_background_css ? 'bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'bg-surface/30 hover:bg-surface/40 hover:border-white/20 shadow-xl',
      highlighted ? 'ring-1 ring-primary-500 shadow-[0_0_20px_rgba(255,69,0,0.2)] scale-[1.01]' : ''
    ]"
    style="border-radius: 20px; margin-bottom: 16px;"
  >
    <!-- Background Enhancement Layer (Moved to root for full coverage) -->
    <div v-if="activity.post_background_css" class="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-[12px]">
      <div class="absolute inset-0 transition-opacity duration-1000 opacity-60" :class="activity.post_background_css"></div>
      
      <!-- Specialized Overlays (Restored for premium feel) -->
      <div v-if="activity.post_background_css === 'post-bg-matrix'" class="absolute inset-0 z-10 opacity-30">
        <div v-for="i in 15" :key="i" class="matrix-column" :style="{ left: (i-1)*7 + '%', animationDelay: (i*0.2) + 's', height: '100px' }"></div>
      </div>
      <div v-if="activity.post_background_css === 'post-bg-inferno'" class="absolute inset-0 z-10 opacity-30">
        <div v-for="i in 20" :key="i" class="ember" :style="{ left: (Math.sin(i)*50 + 50) + '%', animationDelay: (i*0.2) + 's', width: '2px', height: '2px' }"></div>
      </div>
    </div>

    <!-- Layer A: Header (Fusion & Precision) -->
    <div class="px-4 py-3 flex items-center justify-between relative z-10">
      <div class="flex items-center gap-3 min-w-0">
        <div class="relative cursor-pointer hover:scale-105 transition-transform shrink-0" @click="$emit('viewProfile', activity.user_id)">
          <AvatarFrame 
            :src="activity.avatar_url" 
            :border-css="activity.border_css" 
            :avatar-css="activity.avatar_css" 
            :size="32" 
          />
        </div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-foreground tracking-tight truncate leading-tight">{{ activity.user_name }}</span>
            <div v-if="activity.real_streak > 1" 
                 class="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[11px] font-black text-emerald-500 uppercase tracking-tighter shrink-0"
                 :class="activity.real_streak > 5 ? 'animate-pulse' : ''">
              {{ activity.real_streak }}🔥
            </div>
          </div>
          <span class="text-[9px] text-muted font-medium uppercase tracking-widest opacity-60">{{ timeAgo }}</span>
        </div>
      </div>

      <!-- Rank Badge (Pill Style) -->
      <div v-if="activity.global_rank" 
     class="px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 border transition-all duration-300"
     :class="rankStyles">
  
  <Crown v-if="activity.global_rank === 1" class="w-3 h-3 drop-shadow-[0_0_3px_rgba(245,158,11,0.8)]" />
  <Trophy v-else-if="activity.global_rank <= 3" class="w-3 h-3" />
  <TrendingUp v-else class="w-3 h-3 opacity-40" />
  
  <span class="text-[10px] font-black uppercase tracking-widest italic">
    RANKING #{{ activity.global_rank }}
  </span>
</div>


    </div>

    <!-- Equipment Loadout (Impact Visibility) -->
    <div v-if="activity.equipment" class="px-4 py-2 border-y border-white/5 bg-white/[0.02] flex items-center gap-4 overflow-x-auto no-scrollbar relative z-10">
      <div v-for="(item, slot) in activity.equipment" :key="slot" 
           class="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap shrink-0"
           v-if="item && item.name">
        <div class="p-1.5 rounded-lg border flex items-center justify-center transition-all"
             :class="getRarityClass(item.rarity, 'bg')">
          <component :is="getSlotIcon(slot)" 
                     class="w-3 h-3" 
                     :class="getRarityClass(item.rarity)" />
        </div>
        <span class="text-[9px] font-bold uppercase tracking-tight"
              :class="getRarityClass(item.rarity)">
          {{ item.name }}
        </span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="px-4 pb-4 space-y-3 relative z-10">
      <!-- Title & Text (Truncated) -->
      <div class="space-y-1">
        <h3 v-if="activity.title" class="text-sm font-bold text-foreground leading-tight">{{ activity.title }}</h3>
        <div v-if="activity.description" class="relative group/desc">
          <p class="text-[13px] text-foreground/80 leading-snug transition-all" :class="isExpanded ? '' : 'line-clamp-2'">{{ activity.description }}</p>
          <button v-if="activity.description.length > 80" @click="isExpanded = !isExpanded" 
                  class="text-[9px] font-black text-primary-500 mt-1 uppercase tracking-[0.2em] hover:text-primary-400 transition-colors">
            {{ isExpanded ? 'RECOGER DATA' : 'LEER MÁS' }}
          </button>
        </div>
      </div>

      <!-- Layer B: El "Hero" de Datos (Split View) -->
      <div class="rounded-2xl overflow-hidden border border-border/10 bg-black/40 relative backdrop-blur-md">
        <div class="flex items-center divide-x divide-border/20 py-3 relative z-10">
          <!-- Reps -->
          <div class="flex-1 flex flex-col items-center justify-center py-1">
            <p class="text-[10px] font-bold text-muted/60 uppercase tracking-[0.05em] mb-1.5">{{ i18n.t('activity_reps_session') }}</p>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold tabular-nums text-foreground tracking-tight">{{ animatedReps }}</span>
              <Dumbbell class="w-3 h-3 text-muted/20" />
            </div>
          </div>
          <!-- Damage (Dato Rey) -->
          <div class="flex-1 flex flex-col items-center justify-center py-1 bg-primary-500/5 overflow-hidden">
            <p class="text-[10px] font-bold text-primary-500 uppercase tracking-[0.05em] mb-1.5">{{ i18n.t('activity_damage_session') }}</p>
            <div class="flex flex-col items-center">
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-bold tabular-nums text-primary-500 tracking-tight drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]">{{ animatedDamage }}</span>
                <Swords class="w-3.5 h-3.5 text-primary-500 opacity-60" />
              </div>
              <!-- Breakdown -->
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[8px] font-bold text-muted/40 uppercase tracking-tighter">
                  {{ activity.total_base_damage_today || 0 }}B
                </span>
                <span class="text-[8px] font-bold text-primary-400 uppercase tracking-tighter" v-if="activity.total_gear_bonus_today > 0">
                  +{{ activity.total_gear_bonus_today }}G
                </span>
                <span class="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter" v-if="activity.total_buff_bonus_today > 0">
                  +{{ activity.total_buff_bonus_today }}B
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Best Badge overlayed -->
        <div v-if="activity.is_personal_best" class="absolute top-0 right-0 p-2">
          <Flame class="w-4 h-4 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
      </div>

      <!-- Layer C: Tags (Compact & Wrap) -->
      <div class="flex flex-wrap gap-2 pt-1 border-t border-white/5">
        <div v-for="ex in activity.exercises" :key="ex.exercise_type" 
             class="h-6 px-3 rounded-full text-[11px] font-medium flex items-center gap-2 border transition-all shrink-0"
             :class="ex.is_pr ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/5 text-muted hover:bg-white/10'"
        >
          <span class="uppercase tracking-tight">{{ i18n.t(ex.exercise_type) }}</span>
          <span class="font-bold tabular-nums">{{ ex.count }}</span>
          <Trophy v-if="ex.is_pr" class="w-2.5 h-2.5 text-amber-500" />
        </div>
      </div>
    </div>

    <!-- Footer Action Bar (Thumb-Friendly 44px) -->
    <div class="px-2 py-1 flex items-center justify-between border-t border-border/10 relative z-10 bg-black/20 h-11">
      <div class="flex items-center h-full">
        <!-- Like -->
        <button 
          @click="toggleLike"
          class="w-12 h-full flex items-center justify-center transition-all active:scale-90 group/btn"
          :class="activity.user_has_liked ? 'text-primary-500' : 'text-muted'"
        >
          <div class="relative">
            <div v-if="activity.user_has_liked" class="absolute inset-0 bg-primary-500/20 blur-lg rounded-full animate-pulse"></div>
            <ArrowBigUp class="w-6 h-6 relative z-10" :class="activity.user_has_liked ? 'fill-current' : ''" />
          </div>
          <span class="text-[11px] font-bold ml-1 tabular-nums">{{ activity.like_count }}</span>
        </button>

        <!-- Comments -->
        <button 
          @click="showComments = !showComments"
          class="w-12 h-full flex items-center justify-center gap-1.5 transition-all text-muted active:scale-95 px-2"
        >
          <MessageSquare class="w-5 h-5" />
          <span class="text-[11px] font-bold tabular-nums">{{ activity.comment_count }}</span>
        </button>

        <!-- Share -->
        <button 
          @click="shareActivity"
          class="w-12 h-full flex items-center justify-center transition-all text-muted active:scale-95"
        >
          <Share2 class="w-5 h-5" />
        </button>
      </div>

      <div class="flex items-center gap-2 pr-4 opacity-40 scale-90">
        <Swords class="w-4 h-4" />
      </div>
    </div>

    <!-- Comments Section (Lazy Load / Expandable) -->
    <div v-if="showComments" class="pt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
      <div class="flex gap-3">
        <input 
          v-model="commentText" 
          @keyup.enter="submitComment"
          :placeholder="i18n.t('activity_comment_hint')" 
          class="flex-1 bg-surface/10 border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-primary-500/50 transition-all"
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
              <div class="flex-1 bg-foreground/[0.03] rounded-2xl p-3 border border-border/30">
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
    ArrowBigUp, Crown,
    Shield, Sword, Footprints, Construction // Construction as placeholder for Armor/Helmet
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



const emit = defineEmits(['toggleLike', 'viewProfile', 'edit', 'commentAdded']);

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

const isOwn = computed(() => props.activity.user_id === authStore.user?.id);

const milestones = computed(() => {
  const list = [];
  if (!props.activity.exercises) return list;
  
  props.activity.exercises.forEach(ex => {
    const total = ex.historical_total;
    const added = ex.count;
    const previous = total - added;
    
    // Thresholds
    [100, 500, 1000, 5000, 10000].forEach(threshold => {
      if (previous < threshold && total >= threshold) {
        list.push({
          type: ex.exercise_type,
          value: threshold,
          label: i18n.t('activity_milestone_msg', { 
            threshold, 
            exercise: i18n.t(ex.exercise_type) 
          })
        });
      }
    });
  });
  return list;
});

const totalBossDamage = computed(() => {
  return props.activity.exercises.reduce((sum, ex) => sum + (ex.boss_damage || 0), 0);
});

const hasActiveBoost = computed(() => {
  return props.activity.exercises.some(ex => parseFloat(ex.active_multiplier) > 1.0);
});

const activeMultiplierDisplay = computed(() => {
  const multipliers = props.activity.exercises
    .map(ex => parseFloat(ex.active_multiplier) || 1.0)
    .filter(m => m > 1.0);
  return multipliers.length > 0 ? Math.max(...multipliers).toFixed(1) : '1.0';
});

const timeAgo = computed(() => {
  // Append a time to avoid timezone shift issues with date-only strings
  const date = new Date(props.activity.date + 'T12:00:00'); 
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: i18n.locale === 'es' ? es : enUS 
  });
});

const formattedShortDate = computed(() => {
    if (!props.activity.date) return '';
    const date = new Date(props.activity.date + 'T12:00:00');
    return date.toLocaleDateString(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
        day: 'numeric',
        month: 'short'
    }).toUpperCase();
});


const bossContribution = computed(() => {
    // Simulated contribution % based on damage
    return Math.min(10, Math.ceil(totalBossDamage.value / 500)).toFixed(1);
});

const isHot = computed(() => props.activity.like_count >= 5 || props.activity.comment_count >= 3);
const isRecord = computed(() => milestones.value.length > 0);

// SUSTITUYE LAS DOS VERSIONES DE rankStyles POR ESTA SOLA:
const rankStyles = computed(() => {
  const rank = props.activity.global_rank;
  if (!rank) return 'bg-white/5 border-white/10 text-muted';

  switch (rank) {
    case 1: // ORO SOLIDO PREMIUM
      return 'bg-[#F59E0B] text-black border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    case 2: // PLATA
      return 'bg-[#E2E8F0] text-black border-[#E2E8F0] shadow-[0_0_15px_rgba(226,232,240,0.3)]';
    case 3: // BRONCE
      return 'bg-[#B45309] text-white border-[#B45309] shadow-[0_0_15px_rgba(180,83,9,0.3)]';
    default: // RESTO DE RANKINGS
      return 'bg-white/5 border-white/10 text-muted/60';
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
  if (prefix === 'bg') return `bg-rarity-${r}`;
  return `rarity-${r}${r === 'legendary' ? ' glow-legendary' : ''}`;
};

const animatedDamage = ref(0);
const animatedReps = ref(0);

const toggleLike = () => {
  if (navigator.vibrate) navigator.vibrate(10);
  emit('toggleLike');
};

onMounted(() => {
    // Animate Damage (300ms duration, easeOutExpo feel)
    const endDamage = Number(props.activity.total_damage_today) || 0;
    if (endDamage > 0) {
        let currentD = 0;
        const duration = 400; // ms
        const startTime = Date.now();
        
        const animateD = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutExpo: 1 - 2^(-10 * x)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            animatedDamage.value = Math.floor(endDamage * easeProgress);
            
            if (progress < 1) requestAnimationFrame(animateD);
            else animatedDamage.value = endDamage;
        };
        requestAnimationFrame(animateD);
    }

    // Animate Reps
    const endReps = Number(props.activity.total_reps_today) || 0;
    if (endReps > 0) {
        let currentR = 0;
        const duration = 400;
        const startTime = Date.now();
        
        const animateR = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            animatedReps.value = Math.floor(endReps * easeProgress);
            
            if (progress < 1) requestAnimationFrame(animateR);
            else animatedReps.value = endReps;
        };
        requestAnimationFrame(animateR);
    }
});


const shareActivity = async () => {
    try {
        const baseUrl = window.location.origin + '/social';
        // Deep link: activity-USERID-DATE
        const shareUrl = `${baseUrl}?user=${props.activity.user_id}&date=${props.activity.date}`;
        
        const shareData = {
            title: i18n.t('activity_share_title'),
            text: i18n.t('activity_share_msg').replace('{name}', props.activity.user_name),
            url: shareUrl
        };

        if (navigator.share) {
            await navigator.share(shareData);
            notificationStore.notify(i18n.t('activity_shared'), 'success');
        } else {
            await navigator.clipboard.writeText(shareUrl);
            notificationStore.notify(i18n.t('activity_copied'), 'success');
        }
    } catch (e) {
        if (e.name !== 'AbortError') {
            console.error('Error sharing:', e);
            notificationStore.notify(i18n.t('activity_error_share'), 'error');
        }
    }
};

const fetchComments = async () => {
    if (!props.activity.summary_id) {
        comments.value = [];
        return;
    }
    loadingComments.value = true;
    try {
        const res = await axios.get(`/api/social-feed/comments/${props.activity.summary_id}`);
        comments.value = res.data;
    } catch (e) {
        console.error('Error fetching comments:', e);
    } finally {
        loadingComments.value = false;
    }
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

watch(showComments, (val) => {
    if (val && comments.value.length === 0) {
        fetchComments();
    }
});

// Auto-expand comments if deep-linked via comment action
watch(() => props.highlighted, (newVal) => {
    if (newVal && route.query.action === 'comment') {
        showComments.value = true;
        // The watch on showComments will call fetchComments() if needed, 
        // but we call it here to ensure it's fresh for the notification.
        fetchComments();
    }
}, { immediate: true });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--primary-500-rgb), 0.2);
  border-radius: 10px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
