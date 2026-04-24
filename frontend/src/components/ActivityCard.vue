<template>
   <div 
    :id="'activity-' + activity.user_id + '-' + activity.date"
    class="reddit-card group relative overflow-hidden flex flex-col gap-0 border border-white/10 backdrop-blur-xl transition-all duration-300"
    :class="[
      activity.post_background_css ? 'bg-black/60 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' : 'bg-surface/30 hover:bg-surface/40 hover:border-white/20 shadow-xl',
      highlighted ? 'ring-1 ring-primary-500 shadow-[0_0_20px_rgba(255,69,0,0.2)] scale-[1.01]' : '',
      activity.has_crit ? 'crit-card-glow' : ''
    ]"
    style="border-radius: 24px; margin-bottom: 20px;"
  >
    <!-- Background Enhancement Layer -->
    <div v-if="activity.post_background_css" class="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-[20px]">
      <div class="absolute inset-0 transition-opacity duration-1000 opacity-60" :class="activity.post_background_css"></div>
    </div>

    <!-- Floating Feedback Layer -->
    <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-50 overflow-visible flex justify-center">
       <TransitionGroup name="floating-data">
          <div v-for="fb in feedbacks" :key="fb.id" 
               class="absolute text-[10px] font-black italic uppercase whitespace-nowrap px-3 py-1 rounded-full border shadow-lg"
               :class="fb.class">
             {{ fb.text }}
          </div>
       </TransitionGroup>
    </div>

    <!-- Layer A: Header (RPG Identity) -->
    <div class="px-5 py-4 flex items-center justify-between relative z-10">
      <div class="flex items-center gap-4 min-w-0">
        <div class="relative cursor-pointer hover:scale-105 transition-transform shrink-0 group/avatar" @click="$emit('viewProfile', activity.user_id)">
          <!-- Dominant Attribute Aura -->
          <div class="absolute inset-0 rounded-full blur-md opacity-40 group-hover/avatar:opacity-100 transition-opacity animate-pulse"
               :class="dominantStatGlow"></div>
          <AvatarFrame 
            :src="activity.avatar_url" 
            :border-css="activity.border_css" 
            :avatar-css="activity.avatar_css" 
            :size="44" 
            class="relative z-10"
          />
        </div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-black text-foreground tracking-tight truncate leading-tight uppercase italic">{{ activity.user_name }}</span>
            <!-- Level Tag -->
            <span class="text-[9px] px-1.5 py-0.5 bg-white/10 rounded font-bold text-muted-foreground tabular-nums">LVL {{ activity.current_level }}</span>
          </div>
          <div class="flex items-center gap-2">
             <span class="text-[10px] text-primary-400 font-bold uppercase tracking-[0.1em] italic">{{ activity.title_name || 'RECRUIT' }}</span>
             <span class="text-[8px] text-muted font-medium uppercase tracking-widest opacity-40">• {{ timeAgo }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Quick Compare Button -->
        <button 
          v-if="!isOwn"
          @click="$emit('compare', activity)"
          class="p-2.5 bg-white/5 hover:bg-primary-500/10 rounded-xl transition-all text-muted hover:text-primary-500 hover:scale-110 active:scale-95 group"
          title="Tactical Sync"
        >
          <Scan class="w-4 h-4" />
        </button>

        <!-- Rank Badge -->
        <div v-if="activity.global_rank" 
             class="px-3 py-1.5 rounded-xl flex items-center gap-2 shrink-0 border transition-all duration-300"
             :class="rankStyles">
          <Crown v-if="activity.global_rank === 1" class="w-3.5 h-3.5" />
          <span class="text-[10px] font-black uppercase tracking-widest italic">Rank #{{ activity.global_rank }}</span>
        </div>
      </div>
    </div>

    <!-- Equipment Insight Bar (Minimalist) -->
    <div v-if="activity.equipment" class="px-5 py-2 border-y border-white/5 bg-black/20 flex items-center gap-4 overflow-x-auto no-scrollbar relative z-10">
      <template v-for="(item, slot) in activity.equipment" :key="slot">
        <div v-if="item && item.name" 
             class="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all shrink-0">
          <div class="p-1 rounded-md border" :class="getRarityClass(item.rarity, 'bg')">
            <component :is="getSlotIcon(slot)" class="w-2.5 h-2.5" :class="getRarityClass(item.rarity)" />
          </div>
          <span class="text-[8px] font-black uppercase tracking-widest" :class="getRarityClass(item.rarity)">
            {{ item.name }}
          </span>
        </div>
      </template>
    </div>

    <!-- Body: The Impact (Damage & Volume) -->
    <div class="px-5 pb-5 space-y-4 relative z-10 pt-4">
      <div v-if="activity.title || activity.description" class="space-y-1 bg-white/[0.02] p-4 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-inner">
        <h3 v-if="activity.title" class="text-sm font-black text-foreground uppercase tracking-tight italic">{{ activity.title }}</h3>
        <p v-if="activity.description" class="text-[13px] text-foreground/70 leading-relaxed transition-all" :class="isExpanded ? '' : 'line-clamp-2'">{{ activity.description }}</p>
        <button v-if="activity.description?.length > 80" @click="isExpanded = !isExpanded" 
                class="text-[9px] font-black text-primary-500 mt-2 uppercase tracking-[0.2em] hover:text-primary-400 transition-colors">
          {{ isExpanded ? 'COLLAPSE_LOG' : 'READ_BIO_MARK' }}
        </button>
      </div>

      <!-- Hero Stat Card (The Log Hero) -->
      <div class="relative rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl group/impact">
        
        <!-- CRTICAL GLITCH Overlay -->
        <div v-if="activity.has_crit" class="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
           <div class="animate-crit-text text-[60px] font-black text-primary-500/10 italic uppercase tracking-tighter select-none rotate-[-5deg]">CRITICAL_HIT</div>
        </div>

        <div class="grid grid-cols-2 divide-x divide-white/5 relative z-10">
          <!-- Left: Volume Metrics -->
          <div class="p-5 flex flex-col justify-center gap-4">
            <div class="space-y-0.5">
               <p class="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Volume_Protocol</p>
               <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-black tabular-nums text-foreground italic">{{ animatedReps }}</span>
                  <span class="text-[10px] font-bold text-muted lowercase">reps</span>
               </div>
            </div>

            <!-- Attribute Mini-Icons Bar -->
            <div class="flex items-center gap-2">
               <div v-for="ex in activity.exercises" :key="ex.exercise_type" 
                    class="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2 hover:bg-white/10 transition-colors">
                  <component :is="getExerciseIcon(ex.exercise_type)" class="w-3 h-3" :class="dominantStatColor(ex.exercise_type)" />
                  <span class="text-[10px] font-black tabular-nums">{{ ex.count }}</span>
               </div>
            </div>
          </div>

          <!-- Right: Damage (Impact) -->
          <div class="p-5 flex flex-col justify-center items-center relative overflow-hidden bg-white/[0.01] hover:bg-primary-500/[0.03] transition-colors group/dmg-hero">
            
            <!-- Scaling Formula Shadow Hint -->
            <p class="absolute top-2 right-2 text-[7px] font-black text-white/5 tracking-[0.2em] uppercase origin-top-right rotate-90">Reps x STR x CritM = Impact</p>

            <div v-if="activity.boss_image" class="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
               <img :src="activity.boss_image" class="w-24 h-24 object-contain grayscale" />
            </div>

            <p class="text-[9px] font-black text-primary-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
              <Zap class="w-3 h-3 fill-primary-500" />
              Impact_Stored
            </p>

            <div class="flex flex-col items-center relative z-10">
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-black tabular-nums tracking-tighter transition-all duration-300"
                      :class="activity.has_crit ? 'text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110 rotate-[-2deg]' : 'text-primary-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]'">
                  {{ animatedDamage }}
                </span>
                <Swords class="w-4 h-4 text-primary-500 opacity-60" />
              </div>
              
              <!-- Total Stats Breakdown (Gains) -->
              <div class="flex items-center gap-3 mt-3 px-3 py-1 bg-white/5 rounded-full border border-white/10 shadow-inner">
                <div class="flex items-center gap-1">
                  <Coins class="w-2.5 h-2.5 text-amber-400" />
                  <span class="text-[9px] font-black text-white tabular-nums">+{{ activity.exercises.reduce((s, e) => s + (e.count * 2), 0) }}</span>
                </div>
                <div class="w-px h-2 bg-white/10"></div>
                <div class="flex items-center gap-1">
                  <Activity class="w-2.5 h-2.5 text-emerald-400" />
                  <span class="text-[9px] font-black text-white tabular-nums">+{{ activity.exercises.reduce((s, e) => s + (e.count * 15), 0) }} XP</span>
                </div>
              </div>
            </div>

            <!-- Boss context if present -->
            <p v-if="activity.boss_name" class="mt-4 text-[9px] font-black text-primary-400/60 uppercase italic tracking-widest border-t border-primary-500/10 pt-2 w-full text-center">
              Engagement Sector: {{ activity.boss_name }}
            </p>
          </div>
        </div>

        <!-- Success/Hito/PB Indicator -->
        <div v-if="activity.is_personal_best || activity.has_crit" class="absolute top-0 right-0 p-3">
          <div class="p-2 bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full animate-bounce">
             <Trophy v-if="activity.is_personal_best" class="w-4 h-4 text-white" />
             <Zap v-else class="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

       <!-- Activity Streak & Variety Insight -->
       <div v-if="activity.real_streak > 1" class="flex items-center justify-center gap-3 py-2 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mt-2 overflow-hidden relative">
          <div class="absolute left-0 inset-y-0 w-1 bg-emerald-500"></div>
          <p class="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2 italic">
             <Flame class="w-3 h-3" /> 
             Operational Consistency: {{ activity.real_streak }} Days Active
          </p>
       </div>
    </div>

    <!-- Footer: Social Interactions (Premium Glass Action) -->
    <div class="px-5 py-2 flex items-center justify-between border-t border-white/5 relative z-10 bg-white/[0.02] h-14">
      <div class="flex items-center h-full gap-2">
        <!-- Like -->
        <button @click="toggleLike" class="h-10 px-4 rounded-2xl flex items-center gap-2.5 transition-all active:scale-95 group/btn border border-transparent hover:border-white/10"
                :class="activity.user_has_liked ? 'bg-primary-500/10 text-primary-500' : 'text-muted-foreground hover:bg-white/5'">
          <div class="relative">
            <ArrowBigUp class="w-6 h-6 relative z-10" :class="activity.user_has_liked ? 'fill-current' : ''" />
          </div>
          <span class="text-xs font-black tabular-nums">{{ activity.like_count }}</span>
        </button>

        <!-- Comments -->
        <button @click="showComments = !showComments" class="h-10 px-4 rounded-2xl flex items-center gap-2.5 transition-all text-muted-foreground hover:bg-white/5 border border-transparent hover:border-white/10 active:scale-95">
          <MessageSquare class="w-5 h-5 flex-shrink-0" />
          <span class="text-xs font-black tabular-nums">{{ activity.comment_count }}</span>
        </button>

        <!-- Share -->
        <button @click="shareActivity" class="h-10 w-10 flex items-center justify-center rounded-2xl transition-all text-muted-foreground hover:bg-white/5 border border-transparent hover:border-white/10 active:scale-95">
          <Share2 class="w-5 h-5" />
        </button>
      </div>

      <div class="flex items-center gap-3 pr-2">
         <div class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 opacity-40">
            <Swords class="w-4 h-4" />
         </div>
      </div>
    </div>

    <!-- Comments Interface -->
    <div v-if="showComments" class="p-5 pt-0 space-y-4 animate-in slide-in-from-top-4 duration-500">
      <div class="flex gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
        <input 
          v-model="commentText" @keyup.enter="submitComment" :placeholder="i18n.t('activity_comment_hint')" 
          class="flex-1 bg-transparent px-4 py-2 text-sm font-bold focus:outline-none placeholder:text-muted/40 font-industrial"
        />
        <button @click="submitComment" class="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center min-w-[48px]" :disabled="!commentText.trim() || submittingComment">
          <Loader2 v-if="submittingComment" class="w-5 h-5 animate-spin" />
          <Send v-else class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="comment in comments" :key="comment.id" class="flex gap-4 items-start group/comment-item">
              <AvatarFrame :src="comment.avatar_url" :border-css="comment.border_css" :size="32" class="mt-1" />
              <div class="flex-1 bg-white/[0.04] rounded-[1.5rem] p-4 border border-white/5 backdrop-blur-3xl shadow-xl">
                  <div class="flex justify-between items-center mb-1">
                     <p class="text-[10px] font-black text-primary-500 uppercase italic tracking-wider">{{ comment.user_name }}</p>
                     <span class="text-[8px] text-muted uppercase opacity-40">Verified_Intel</span>
                  </div>
                  <p class="text-[13px] text-foreground/90 leading-relaxed font-medium">{{ comment.content }}</p>
              </div>
          </div>
          <div v-if="!loadingComments && comments.length === 0" class="py-8 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
             <MessageSquare class="w-8 h-8 text-muted/10 mx-auto mb-2" />
             <p class="text-[10px] text-muted uppercase tracking-[0.4em] italic">{{ i18n.t('activity_no_records') }}</p>
          </div>
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
    ArrowBigUp, Crown, Scan, Activity, Coins,
    Shield, Sword, Footprints, Construction, RotateCcw
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
const feedbacks = ref([]);

const animatedDamage = ref(0);
const animatedReps = ref(0);

const isOwn = computed(() => props.activity.user_id === authStore.user?.id);

// RPG Logic: Dominant Stat Glow
const dominantStatGlow = computed(() => {
  const stat = props.activity.dominant_stat || 'str';
  switch (stat) {
    case 'str': return 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]';
    case 'end': return 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]';
    case 'dex': return 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
    default: return 'bg-primary-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]';
  }
});

const dominantStatColor = (type) => {
  if (['muscleups', 'weighted_pullups'].includes(type)) return 'text-amber-500';
  if (['pullups', 'pushups'].includes(type) && props.activity.total_reps_today > 50) return 'text-blue-500';
  return 'text-red-500';
};

const timeAgo = computed(() => {
  if (!props.activity.date) return '';
  const date = props.activity.created_at ? new Date(props.activity.created_at) : new Date(props.activity.date + 'T12:00:00');
  return formatDistanceToNow(date, { addSuffix: true, locale: i18n.locale === 'es' ? es : enUS });
});

const rankStyles = computed(() => {
  const rank = props.activity.global_rank;
  if (!rank) return 'bg-white/5 border-white/10 text-muted';
  if (rank === 1) return 'bg-amber-400 text-black border-amber-500 shadow-lg shadow-amber-400/20';
  if (rank <= 3) return 'bg-slate-200 text-black border-white shadow-md';
  return 'bg-white/5 border-white/10 text-muted-foreground';
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

const getExerciseIcon = (type) => {
    if (type === 'muscleups') return Zap;
    if (type === 'weighted_pullups') return Dumbbell;
    return Activity;
};

const getRarityClass = (rarity, prefix = '') => {
  const r = rarity?.toLowerCase() || 'common';
  let finalR = r === 'epic' ? 'especial' : r;
  if (prefix === 'bg') return `bg-rarity-${finalR}`;
  return `rarity-${finalR} ${finalR === 'legendary' ? 'glow-legendary' : ''}`;
};

const addFeedback = (text, type = 'coins') => {
  const id = Date.now();
  const cls = type === 'coins' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-primary-500/20 border-primary-500/50 text-primary-500';
  feedbacks.value.push({ id, text, class: cls });
  setTimeout(() => {
    feedbacks.value = feedbacks.value.filter(f => f.id !== id);
  }, 1500);
};

const toggleLike = () => {
  if (navigator.vibrate) navigator.vibrate(12);
  if (!props.activity.user_has_liked) addFeedback('+5 REPPY COINS', 'coins');
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
        addFeedback('+20 CHA XP', 'xp');
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
      const duration = 800;
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
        if (navigator.share) await navigator.share({ title: 'Reppy Activity Log', url: shareUrl });
        else {
            await navigator.clipboard.writeText(shareUrl);
            notificationStore.notify('ENLACE_COPIADO', 'success');
        }
    } catch (e) {}
};
</script>

<style scoped>
.crit-card-glow {
  border-color: rgba(245, 158, 11, 0.4) !important;
  box-shadow: 0 0 50px rgba(245, 158, 11, 0.15) !important;
}

@keyframes crit-text-pop {
  0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 0.3; }
  100% { transform: scale(1) rotate(-5deg); opacity: 0.2; }
}
.animate-crit-text { animation: crit-text-pop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

.floating-data-enter-active { animation: float-up 1.5s ease-out forwards; }
@keyframes float-up {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-100px); opacity: 0; }
}

@keyframes streak-fire {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.1); filter: brightness(1.4) drop-shadow(0 0 8px orange); }
}
.animate-streak-fire { animation: streak-fire 1.5s ease-in-out infinite; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
