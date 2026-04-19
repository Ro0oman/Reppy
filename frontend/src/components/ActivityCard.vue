<template>
   <div 
    :id="'activity-' + activity.user_id + '-' + activity.date"
    class="reddit-card group relative overflow-hidden flex flex-col gap-0 border-border/40 backdrop-blur-md transition-all duration-300"
    :class="[
      activity.post_background_css ? 'bg-black border-primary-500/20' : 'bg-[#0b1416] hover:bg-[#121c1f] border-border/20',
      highlighted ? 'ring-1 ring-primary-500 shadow-[0_0_20px_rgba(255,69,0,0.1)]' : ''
    ]"
    style="border-radius: 12px; margin-bottom: 12px;"
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

    <!-- Reddit-style Top Meta Bar -->
    <div class="px-4 py-3 flex items-center gap-2 relative z-10">
      <div class="relative cursor-pointer hover:scale-105 transition-transform" @click="$emit('viewProfile', activity.user_id)">
        <AvatarFrame 
          :src="activity.avatar_url" 
          :border-css="activity.border_css" 
          :avatar-css="activity.avatar_css" 
          :size="28" 
        />
      </div>
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="text-[11px] font-bold text-foreground truncate">{{ activity.user_name }}</span>
      </div>

      <div class="flex-1"></div>
      
      <!-- User Badges (Rank & Streak) moved to the right -->
      <div class="flex items-center gap-1.5 shrink-0">
        <div v-if="activity.global_rank" class="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <span class="text-[8px] font-black text-yellow-500 uppercase">RANKING #{{ activity.global_rank }}</span>
        </div>
        <div v-if="activity.real_streak > 1" class="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-md">
          <span class="text-[8px] font-black text-orange-500 uppercase tracking-tighter">{{ activity.real_streak }} DÍAS DE RACHA</span>
        </div>
      </div>
      <div v-if="isHot" class="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
        <Flame class="w-3 h-3 text-red-500" />
        <span class="text-[9px] font-black text-red-500">HOT</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="px-4 pb-4 space-y-3 relative z-10">
      <!-- Title & Text -->
      <div class="space-y-1">
        <h3 v-if="activity.title" class="text-lg font-bold text-foreground leading-tight">{{ activity.title }}</h3>
        <p v-if="activity.description" class="text-sm text-foreground/80 leading-snug">{{ activity.description }}</p>
      </div>

      <!-- Hero Balanced Stats (The "Media" of the post) -->
      <div class="rounded-xl overflow-hidden border border-border/10 bg-black/20 relative">
        <div class="grid grid-cols-2 divide-x divide-border/10 py-4 relative z-10">
          <!-- Reps -->
          <div class="flex flex-col items-center justify-center">
            <p class="text-[8px] font-black text-muted uppercase tracking-widest mb-0.5">{{ i18n.t('activity_reps_session') || 'REPS' }}</p>
            <div class="flex items-center gap-1.5">
              <span class="text-2xl font-black italic tracking-tighter text-foreground drop-shadow-sm">{{ animatedReps }}</span>
              <Dumbbell class="w-3 h-3 text-primary-500/30" />
            </div>
          </div>
          <!-- Damage -->
          <div class="flex flex-col items-center justify-center">
            <p class="text-[8px] font-black text-primary-500 uppercase tracking-widest mb-0.5">{{ i18n.t('activity_damage_session') }}</p>
            <div class="flex items-center gap-1.5">
              <span class="text-2xl font-black italic tracking-tighter text-foreground drop-shadow-sm">{{ animatedDamage }}</span>
              <Swords class="w-3 h-3 text-primary-500/30" />
            </div>
          </div>
        </div>

        <!-- Personal Best Badge overlayed -->
        <div v-if="activity.is_personal_best" class="flex justify-center pb-2 px-4 relative z-10">
          <div class="px-2 py-0.5 bg-primary-500/10 backdrop-blur-md rounded text-[9px] font-black text-primary-500 border border-primary-500/20 animate-pulse whitespace-nowrap">
            <Flame class="w-2.5 h-2.5 inline mr-1" />
            {{ i18n.t('activity_personal_record') }}
          </div>
        </div>
      </div>

      <!-- Exercise tags HIGHLIGHTED -->
      <div class="flex flex-wrap gap-2">
        <div v-for="ex in activity.exercises" :key="ex.exercise_type" 
             class="px-3 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-2.5 border transition-all"
             :class="ex.is_pr ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-surface border-border/20 text-foreground'"
        >
          <span class="uppercase italic tracking-tighter" :class="ex.is_pr ? 'text-amber-500' : 'text-primary-500'">{{ i18n.t(ex.exercise_type) }}</span>
          <span class="text-sm font-black">{{ ex.count }}</span>
          
          <!-- PR Trophy -->
          <Trophy v-if="ex.is_pr" class="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Reddit-style Action Bar -->
    <div class="px-2 py-2 flex items-center gap-1 border-t border-border/10 relative z-10 h-10">
      <!-- Vote Cluster -->
      <div class="flex items-center bg-foreground/[0.05] rounded-full px-1 mr-2 scale-90 relative transition-all"
           :class="activity.user_has_liked ? 'shadow-[0_0_10px_rgba(255,69,0,0.2)] bg-primary-500/10' : ''">
        <button 
          @click="$emit('toggleLike')"
          class="p-1.5 rounded-full transition-all duration-300"
          :class="activity.user_has_liked ? 'text-primary-500 scale-110' : 'text-muted hover:bg-foreground/10 hover:text-primary-500'"
        >
          <ArrowBigUp class="w-5 h-5" :class="activity.user_has_liked ? 'fill-current' : ''" />
        </button>
        <span class="text-[11px] font-black min-w-[20px] text-center transition-colors" :class="activity.user_has_liked ? 'text-primary-500' : 'text-foreground'">
          {{ activity.like_count }}
        </span>
      </div>

      <!-- Comments Button -->
      <button 
        @click="showComments = !showComments"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-foreground/[0.05] transition-colors"
      >
        <MessageSquare class="w-4 h-4 text-muted" />
        <span class="text-[11px] font-bold text-muted">{{ activity.comment_count }}</span>
      </button>

      <!-- Share Button -->
      <button 
        @click="shareActivity"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-foreground/[0.05] transition-colors"
      >
        <Share2 class="w-4 h-4 text-muted" />
        <span class="text-[11px] font-bold text-muted">{{ i18n.t('activity_share_label') }}</span>
      </button>

      <div class="flex-1"></div>

      <!-- Boss contribution small indicator -->
      <div v-if="totalBossDamage > 0" class="flex items-center gap-2 px-3 opacity-60 scale-75">
        <Swords class="w-3 h-3 text-primary-500" />
      </div>
    </div>

    <!-- Comments Section (Lazy Load / Expandable) -->
    <div v-if="showComments" class="pt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
      <div class="flex gap-3">
        <input 
          v-model="commentText" 
          @keyup.enter="submitComment"
          :placeholder="i18n.t('activity_comment_hint')" 
          class="flex-1 bg-surface/10 border border-border rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:border-primary-500/50 transition-all"
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
    ArrowBigUp
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

const animatedDamage = ref(0);
const animatedReps = ref(0);

onMounted(() => {
    // Animate Damage
    const endDamage = Number(props.activity.total_damage_today) || 0;
    if (endDamage > 0) {
        let startD = 0;
        const timerD = setInterval(() => {
            startD += Math.ceil(endDamage / 30);
            if (startD >= endDamage) {
                animatedDamage.value = endDamage;
                clearInterval(timerD);
            } else {
                animatedDamage.value = startD;
            }
        }, 30);
    }

    // Animate Reps
    const endReps = Number(props.activity.total_reps_today) || 0;
    if (endReps > 0) {
        let startR = 0;
        const timerR = setInterval(() => {
            startR += Math.ceil(endReps / 30);
            if (startR >= endReps) {
                animatedReps.value = endReps;
                clearInterval(timerR);
            } else {
                animatedReps.value = startR;
            }
        }, 30);
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
</style>
