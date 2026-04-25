<template>
  <div 
    :id="'activity-' + activity.user_id + '-' + activity.date"
    class="social-card group relative flex flex-col transition-all duration-300"
    :class="[
      activity.post_background_css ? 'has-custom-bg' : 'bg-surface/40 dark:bg-card/30 backdrop-blur-md',
      highlighted ? 'ring-2 ring-primary-500/50 shadow-2xl shadow-primary-500/10' : 'border border-border/10',
      activity.has_crit ? 'is-critical' : ''
    ]"
  >
    <!-- Background Enhancement (Subtle) -->
    <div v-if="activity.post_background_css" class="absolute inset-0 pointer-events-none overflow-hidden rounded-[1.5rem] z-0">
      <div class="absolute inset-0 opacity-10" :class="activity.post_background_css"></div>
    </div>

    <!-- Feedback Popups -->
    <div class="absolute inset-x-0 top-1/4 pointer-events-none z-[60] flex justify-center">
       <TransitionGroup name="floating-data">
          <div v-for="fb in feedbacks" :key="fb.id" 
               class="absolute text-[10px] font-black italic uppercase px-3 py-1 rounded-full border shadow-xl"
               :class="fb.class">
             {{ fb.text }}
          </div>
       </TransitionGroup>
    </div>

    <!-- MAIN CONTAINER -->
    <div class="relative z-10 p-4 md:p-5 flex flex-col gap-3">
      
      <!-- TOP ROW: Identity -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="relative cursor-pointer" @click="$emit('viewProfile', activity.user_id)">
            <AvatarFrame 
              :src="activity.avatar_url" 
              :border-css="activity.border_css" 
              :size="40" 
              class="ring-1 ring-border/20 shadow-sm"
            />
            <div class="absolute -bottom-1 -right-1 bg-background text-[8px] font-bold text-foreground px-1 py-0.5 rounded border border-border/50 shadow-sm">
              {{ activity.current_level }}
            </div>
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <h4 class="text-xs font-bold text-foreground tracking-tight truncate">{{ activity.user_name }}</h4>
              <span v-if="activity.global_rank === 1">👑</span>
            </div>
            <div class="flex items-center gap-1 text-[9px] font-medium text-muted/60 uppercase tracking-widest">
              {{ timeAgo }}
              <template v-if="activity.dominant_stat">
                <span class="opacity-30 mx-1">•</span>
                <span :class="dominantStatColor(activity.dominant_stat)">{{ activity.dominant_stat.toUpperCase() }} {{ calculateStatLevel(activity[`${activity.dominant_stat}_xp`]) }}</span>
              </template>
            </div>
          </div>
        </div>
        
        <button @click="showDetails = !showDetails" class="text-[9px] font-black uppercase tracking-widest text-muted/40 hover:text-primary-500 transition-colors flex items-center gap-1">
          {{ showDetails ? 'Ocultar build' : 'Ver build' }}
          <ChevronRight class="w-3 h-3 transition-transform" :class="showDetails ? 'rotate-90' : ''" />
        </button>
      </div>

      <!-- HIGHLIGHT ROW: Reps & DMG -->
      <div class="flex items-baseline gap-4 py-1">
        <div class="flex items-baseline gap-1.5">
          <span class="text-3xl font-black text-foreground italic tracking-tighter">🔥 {{ activity.total_reps_today }}</span>
          <span class="text-[9px] font-black text-muted/40 uppercase tracking-widest">REPS</span>
        </div>
        <div v-if="activity.total_damage_today" class="flex items-baseline gap-1">
          <span class="text-xl font-black text-primary-500 italic tracking-tighter">⚡ {{ animatedDamage }}</span>
          <span class="text-[8px] font-black text-primary-500/40 uppercase tracking-widest">DMG</span>
        </div>
      </div>

      <!-- BADGES & PROGRESS -->
      <div class="flex flex-wrap items-center gap-2">
        <div v-if="activity.is_personal_best" class="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 text-[8px] font-black uppercase tracking-widest">
          <Trophy class="w-2.5 h-2.5" /> PB
        </div>
        <div v-if="activity.real_streak > 1" class="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest">
          <Flame class="w-2.5 h-2.5" /> {{ activity.real_streak }}D STREAK
        </div>
        <!-- XP GAINS -->
        <div v-for="xp in xpGains" :key="xp.stat" class="text-[8px] font-black text-primary-500/60 uppercase tracking-widest">
          +{{ xp.amount }} XP {{ xp.stat }}
        </div>
      </div>

      <!-- CAPTION -->
      <div v-if="activity.description" class="mt-1">
        <p class="text-xs text-foreground/70 leading-relaxed font-medium line-clamp-2" :class="{ 'line-clamp-none': showDetails }">
          {{ activity.description }}
        </p>
      </div>

      <!-- EXPANDED SECTION -->
      <div v-if="showDetails" class="mt-3 pt-3 border-t border-border/10 space-y-5 animate-in slide-in-from-top-2 duration-300">
        
        <!-- Rivalry context -->
        <div v-if="activity.next_rank_rival" class="flex items-center gap-2 text-[10px] text-muted font-bold italic">
           <Swords class="w-3 h-3 text-amber-500" />
           <span>Superando a <span class="text-foreground">{{ activity.next_rank_rival.name }}</span> en {{ activity.next_rank_rival.reps_diff }} reps</span>
        </div>

        <!-- Mini Exercises -->
        <div class="grid grid-cols-2 gap-2">
           <div v-for="ex in activity.exercises" :key="ex.exercise_type" class="flex items-center gap-2 p-2 bg-foreground/5 rounded-lg border border-border/5">
              <component :is="getExerciseIcon(ex.exercise_type)" class="w-3.5 h-3.5" :class="dominantStatColor(getAttributeName(ex.exercise_type).toLowerCase())" />
              <div class="flex flex-col min-w-0">
                 <span class="text-[9px] font-black text-foreground uppercase truncate">{{ i18n.t(`exercise_${ex.exercise_type}`) }}</span>
                 <span class="text-[8px] text-muted font-bold">{{ ex.count }} reps • {{ ex.boss_damage }} dmg</span>
              </div>
           </div>
        </div>

        <!-- LOADOUT: Real icons -->
        <div class="space-y-2">
           <p class="text-[8px] font-black text-muted/40 uppercase tracking-[0.3em]">Loadout Activo</p>
           <div class="flex gap-2">
              <div v-for="(item, slot) in activity.equipment" :key="slot" 
                   class="w-10 h-10 flex items-center justify-center rounded-lg bg-black/40 border-2 relative group/item"
                   :class="item?.name ? getRarityClass(item.rarity, 'border') : 'border-dashed border-border/10 opacity-20'">
                 <component :is="getSlotIcon(slot)" class="w-5 h-5" :class="item?.name ? getRarityClass(item.rarity) : ''" />
                 <div v-if="item?.name" class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary-500 shadow-sm ring-2 ring-background"></div>
              </div>
           </div>
        </div>
      </div>

      <!-- ACTION BAR & COMMENTS PREVIEW -->
      <div class="mt-2 pt-3 border-t border-border/10 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <button @click="toggleLike" 
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:bg-foreground/5"
                    :class="activity.user_has_liked ? 'text-primary-500' : 'text-muted/60'">
              <Heart class="w-4 h-4" :class="{ 'fill-current': activity.user_has_liked }" />
              <span class="text-[10px] font-black tabular-nums">{{ activity.like_count }}</span>
            </button>
            <button @click="showComments = !showComments" 
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:bg-foreground/5 text-muted/60">
              <MessageSquare class="w-4 h-4" />
              <span class="text-[10px] font-black tabular-nums">{{ activity.comment_count }}</span>
            </button>
            <button @click="$emit('compare', activity)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:bg-foreground/5 text-muted/60 hover:text-amber-500">
              <Swords class="w-4 h-4" />
              <span class="text-[10px] font-black uppercase tracking-tighter">Retar</span>
            </button>
          </div>

          <button @click="$emit('viewProfile', activity.user_id)" class="p-2 text-muted/30 hover:text-foreground transition-colors">
            <Scan class="w-4 h-4" />
          </button>
        </div>

        <!-- COMMENT PREVIEW -->
        <div v-if="!showComments && activity.comment_count > 0 && latestComment" class="px-2 py-1.5 bg-foreground/[0.02] rounded-lg border border-border/5 flex gap-2 items-center">
           <AvatarFrame :src="latestComment.avatar_url" :size="18" class="shrink-0" />
           <p class="text-[10px] truncate flex-1">
             <span class="font-bold text-primary-500">{{ latestComment.user_name }}:</span> 
             <span class="text-muted ml-1">{{ latestComment.content }}</span>
           </p>
        </div>
      </div>

      <!-- FULL COMMENTS (Collapsible) -->
      <div v-if="showComments" class="mt-1 space-y-4 animate-in slide-in-from-top-2">
        <div class="flex gap-2">
          <input 
            v-model="commentText" @keyup.enter="submitComment" placeholder="Comentar..." 
            class="flex-1 bg-foreground/5 border-none rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 ring-primary-500/20"
          />
          <button @click="submitComment" class="text-[10px] font-black uppercase text-primary-500 disabled:opacity-30" :disabled="!commentText.trim()">
            Ok
          </button>
        </div>
        <div class="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
            <div v-for="comment in comments" :key="comment.id" class="flex gap-2 items-start">
                <AvatarFrame :src="comment.avatar_url" :size="24" class="shrink-0" />
                <div class="flex-1 min-w-0">
                    <p class="text-[10px] font-bold text-primary-500">{{ comment.user_name }}</p>
                    <p class="text-[11px] text-foreground/80 leading-snug">{{ comment.content }}</p>
                </div>
            </div>
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
    Heart, MessageSquare, Share2, 
    Swords, ChevronRight, Trophy, Zap, 
    Flame, TrendingUp, Dumbbell, 
    ArrowBigUp, Crown, Scan, 
    Shield, Sword, Footprints,
    CircleDot, Ghost, Gem, Hammer
} from 'lucide-vue-next';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useNotificationStore } from '../stores/notification';

const props = defineProps({
    activity: { type: Object, required: true },
    highlighted: { type: Boolean, default: false }
});

const emit = defineEmits(['toggleLike', 'viewProfile', 'commentAdded', 'compare']);

const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const showComments = ref(false);
const commentText = ref('');
const comments = ref([]);
const loadingComments = ref(false);
const animatedDamage = ref(0);
const feedbacks = ref([]);
const showDetails = ref(false);

const timeAgo = computed(() => {
    try {
        const date = props.activity.created_at ? new Date(props.activity.created_at) : new Date(props.activity.date);
        return formatDistanceToNow(date, { addSuffix: true, locale: i18n.locale === 'es' ? es : enUS });
    } catch (e) { return ''; }
});

const calculateStatLevel = (xp) => {
    if (!xp) return 1;
    return Math.floor(Math.sqrt(xp / 50)) + 1;
};

const xpGains = computed(() => {
    const gains = [];
    if (!props.activity.exercises) return gains;
    
    const stats = { str: 0, end: 0, agi: 0 };
    props.activity.exercises.forEach(ex => {
        const stat = getAttributeName(ex.exercise_type).toLowerCase();
        stats[stat] += Math.ceil(ex.count / 5);
    });
    
    Object.entries(stats).forEach(([stat, amount]) => {
        if (amount > 0) gains.push({ stat: stat.toUpperCase(), amount });
    });
    return gains;
});

const latestComment = computed(() => {
    if (comments.value.length > 0) return comments.value[0];
    return null;
});

const dominantStatColor = (stat) => {
    switch(stat) {
        case 'str': return 'text-red-500';
        case 'end': return 'text-blue-500';
        case 'agi': return 'text-emerald-500';
        default: return 'text-primary-500';
    }
};

const getAttributeName = (type) => {
    const types = {
        pullups: 'STR', chinups: 'STR', weighted_pullups: 'STR', muscleups: 'STR',
        pushups: 'END', squats: 'END', lunges: 'END',
        dips: 'AGI', handstand: 'AGI', legraises: 'AGI'
    };
    return types[type] || 'STR';
};

const getExerciseIcon = (type) => {
    const t = type.toLowerCase();
    if (['pullups', 'weighted_pullups', 'chinups', 'muscleups'].includes(t)) return ArrowBigUp;
    if (['pushups', 'squats', 'lunges'].includes(t)) return Shield;
    if (['dips', 'handstand', 'legraises'].includes(t)) return Footprints;
    return Dumbbell;
};

const getSlotIcon = (slot) => {
    switch(slot) {
        case 'head': return Crown;
        case 'weapon': return Sword;
        case 'armor': return Shield;
        case 'boots': return Footprints;
        default: return Scan;
    }
};

const getRarityClass = (rarity, part = 'text') => {
    const r = rarity?.toLowerCase();
    if (part === 'border') {
        if (r === 'legendary') return 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
        if (r === 'epic') return 'border-purple-500/50';
        if (r === 'rare') return 'border-blue-500/50';
        return 'border-border/20';
    }
    if (r === 'legendary') return 'text-amber-500';
    if (r === 'epic') return 'text-purple-500';
    if (r === 'rare') return 'text-blue-500';
    return 'text-muted/60';
};

const hasActiveBuffs = (exercises) => {
    if (!exercises) return false;
    return exercises.some(ex => ex.active_multiplier > 1) || props.activity.has_crit;
};

const getMaxMultiplier = (exercises) => {
    if (!exercises) return 1;
    return Math.max(...exercises.map(ex => ex.active_multiplier || 1));
};

const addFeedback = (text, type = 'xp') => {
  const id = Date.now();
  const cls = type === 'coins' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-primary-500/20 border-primary-500/50 text-primary-500';
  feedbacks.value.push({ id, text, class: cls });
  setTimeout(() => {
    feedbacks.value = feedbacks.value.filter(f => f.id !== id);
  }, 1000);
};

const toggleLike = () => {
  if (navigator.vibrate) navigator.vibrate(8);
  if (!props.activity.user_has_liked) addFeedback('+5 CRÉDITOS', 'coins');
  emit('toggleLike');
};

const submitComment = async () => {
    if (!commentText.value.trim()) return;
    try {
        const res = await axios.post('/api/social-feed/comment', {
            targetUserId: props.activity.user_id,
            date: props.activity.date,
            content: commentText.value
        });
        comments.value.unshift(res.data);
        commentText.value = '';
        props.activity.comment_count = (Number(props.activity.comment_count) || 0) + 1;
        addFeedback('+20 XP CARISMA', 'xp');
        authStore.fetchProfile();
        emit('commentAdded');
    } catch (e) {
        console.error('Error adding comment:', e);
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
    const duration = 1000;
    const startTime = Date.now();
    const run = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        animatedDamage.value = Math.floor(endDamage * ease);
        if (progress < 1) requestAnimationFrame(run);
    };
    if (endDamage > 0) requestAnimationFrame(run);
    
    // Auto-fetch latest comment preview
    fetchComments();
});
</script>

<style scoped>
.social-card {
  border-radius: 1.5rem;
  overflow: hidden;
  position: relative;
}

.is-critical {
  border-color: rgba(245, 158, 11, 0.4) !important;
}

.floating-data-enter-active {
  animation: float-up-fade 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

@keyframes float-up-fade {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-60px); opacity: 0; }
}

.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: hsla(var(--muted) / 0.1); border-radius: 10px; }

.has-custom-bg {
  background: rgba(0, 0, 0, 0.9) !important;
}
</style>
