<template>
   <div 
    :id="'activity-' + activity.user_id + '-' + activity.date"
    class="rpg-card group relative overflow-hidden flex flex-col gap-0 transition-all duration-500"
    :class="[
      activity.post_background_css ? 'has-custom-bg shadow-[0_20px_60px_rgba(0,0,0,0.8)]' : 'bg-surface/10 hover:bg-surface/20 shadow-2xl',
      highlighted ? 'is-highlighted' : '',
      activity.has_crit ? 'is-critical' : ''
    ]"
  >
    <!-- Background Enhancement Layer -->
    <div v-if="activity.post_background_css" class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute inset-0 transition-opacity duration-1000 opacity-70" :class="activity.post_background_css"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
    </div>

    <!-- Scanline Overlay -->
    <div class="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-grid-white bg-[length:20px_20px]"></div>

    <!-- Floating Feedback Layer -->
    <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-[60] overflow-visible flex justify-center">
       <TransitionGroup name="floating-data">
          <div v-for="fb in feedbacks" :key="fb.id" 
               class="absolute text-[11px] font-black italic uppercase whitespace-nowrap px-4 py-1.5 rounded-sm border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] skew-x-[-10deg]"
               :class="fb.class">
             {{ fb.text }}
          </div>
       </TransitionGroup>
    </div>

    <!-- NEW RECORD INSIGNIA (Refined) -->
    <div v-if="activity.is_personal_best" 
         class="absolute top-6 right-6 z-[55] flex flex-col items-center">
      <div class="relative">
         <Trophy class="w-10 h-10 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-bounce-slow" />
         <div class="absolute inset-0 bg-amber-500/20 blur-xl animate-pulse"></div>
      </div>
      <span class="text-[8px] font-black uppercase tracking-[0.4em] text-amber-500 mt-1">RECORD PERSONAL</span>
    </div>

    <!-- HEADER: Perfil del Héroe -->
    <div class="relative z-20 px-6 py-5 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
      <div class="flex items-center gap-5 min-w-0">
        <!-- Hero Avatar with EXP Ring -->
        <div class="relative shrink-0 group/avatar cursor-pointer" @click="$emit('viewProfile', activity.user_id)">
          <div class="absolute -inset-2 rounded-full border border-white/5 animate-spin-slow"></div>
          <div class="absolute inset-0 rounded-full blur-xl opacity-40 group-hover/avatar:opacity-100 transition-opacity" :class="dominantStatGlow"></div>
          <AvatarFrame 
            :src="activity.avatar_url" 
            :border-css="activity.border_css" 
            :avatar-css="activity.avatar_css" 
            :size="52" 
            class="relative z-10 border-2 border-white/10 p-0.5 bg-black/50"
          />
          <div class="absolute -bottom-1 -right-1 bg-primary-500 text-[8px] font-black px-1.5 py-0.5 rounded-sm border border-white/20 z-20 shadow-lg">
            NIVEL {{ activity.current_level }}
          </div>
        </div>

        <!-- Identity Data -->
        <div class="flex flex-col min-w-0">
          <h2 class="text-sm font-black text-white tracking-widest uppercase italic flex items-center gap-2">
            {{ activity.user_name }}
            <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
          </h2>
          <div class="flex items-center gap-2 mt-0.5">
             <span class="text-[9px] text-primary-400 font-bold uppercase tracking-[0.2em] bg-primary-500/10 px-2 py-0.5 rounded-sm border border-primary-500/20">
               {{ activity.title_name || 'RECLUTA' }}
             </span>
             <span class="text-[9px] text-muted uppercase tracking-tighter opacity-50">{{ timeAgo }}</span>
          </div>
        </div>
      </div>

      <!-- Rank Insignia -->
      <div v-if="activity.global_rank" 
           class="flex flex-col items-end gap-1 relative">
        <p class="text-[6px] font-black text-muted uppercase tracking-[0.3em] opacity-40">Posición Global</p>
        <div class="flex items-center gap-2 px-3 py-1 bg-black/60 border rounded-sm" :class="rankStyles">
           <Crown v-if="activity.global_rank === 1" class="w-3 h-3 text-amber-400" />
           <span class="text-xs font-black italic tracking-tighter">RANK #{{ activity.global_rank }}</span>
        </div>
      </div>
    </div>

    <!-- EQUIPMENT: Compact Tactical Bar -->
    <div v-if="activity.equipment" class="relative z-20 px-6 py-3 border-b border-white/5 bg-black/20 flex items-center justify-center gap-6">
      <div v-for="(item, slot) in activity.equipment" :key="slot" class="flex flex-col items-center group/slot">
        <div v-if="item?.name" 
             class="loot-slot-hud w-10 h-10 border-2" 
             :class="getRarityClass(item.rarity, 'border')"
             :title="item.name">
           <component :is="getSlotIcon(slot)" class="w-5 h-5" :class="getRarityClass(item.rarity)" />
           <div class="rarity-sparkle" v-if="item.rarity === 'legendary'"></div>
        </div>
        <div v-else class="w-10 h-10 flex items-center justify-center rounded-sm border border-dashed border-white/5 bg-black/10 opacity-30">
           <Plus class="w-3 h-3" />
        </div>
        <span class="text-[5px] font-black uppercase mt-1 opacity-30 tracking-widest group-hover/slot:opacity-60 transition-opacity">{{ slot }}</span>
      </div>
    </div>

    <!-- MAIN BODY: Resumen de Combate -->
    <div class="relative z-20 px-6 py-6 space-y-6">
      
      <!-- User Bio/Log Entry -->
      <div v-if="activity.title || activity.description" class="relative pl-6 border-l-2 border-primary-500/30 bg-white/[0.01] py-2">
        <h3 v-if="activity.title" class="text-xs font-black text-white/90 uppercase tracking-[0.2em] mb-1 italic">{{ activity.title || 'BITÁCORA_DE_OPERACIONES' }}</h3>
        <p v-if="activity.description" class="text-[13px] text-muted/80 leading-relaxed font-medium" :class="isExpanded ? '' : 'line-clamp-2'">{{ activity.description }}</p>
        <button v-if="activity.description?.length > 80" @click="isExpanded = !isExpanded" 
                class="text-[8px] font-black text-primary-500 mt-2 uppercase tracking-[0.3em] hover:text-white transition-colors bg-primary-500/5 px-2 py-1 rounded-sm">
          {{ isExpanded ? '[ - COMPRIMIR LOG ]' : '[ + EXPANDIR LOG ]' }}
        </button>
      </div>

      <!-- PERFORMANCE GRID -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 bg-black/40 border border-white/5 rounded-sm p-4 relative overflow-hidden shadow-inner">
        
        <!-- EXERCISE ANALYTICS -->
        <div class="md:col-span-7 space-y-5">
           <div class="flex items-center justify-between pb-3 border-b border-white/5 mb-2">
              <div class="flex flex-col">
                <p class="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Resumen de Ejercicios</p>
                <p class="text-[7px] text-muted uppercase tracking-widest">REGISTRO DE VOLUMEN</p>
              </div>
              <div class="flex items-baseline gap-2">
                 <span class="text-3xl font-black text-white tabular-nums italic drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">{{ animatedReps }}</span>
                 <span class="text-[9px] font-black text-primary-500/60 uppercase tracking-widest">Reps</span>
              </div>
           </div>

           <div class="grid grid-cols-1 gap-3">
               <div v-for="ex in activity.exercises" :key="ex.exercise_type" 
                    class="relative group/ex transition-all hover:bg-white/[0.03] rounded-sm overflow-hidden">
                  <div class="relative px-4 py-3 flex items-center justify-between border-l-2" :class="dominantStatColor(ex.exercise_type, 'border')">
                     <div class="flex items-center gap-3">
                        <div class="p-2 bg-black/40 rounded-sm border border-white/10">
                           <component :is="getExerciseIcon(ex.exercise_type)" class="w-4 h-4" :class="dominantStatColor(ex.exercise_type)" />
                        </div>
                        <div class="flex flex-col">
                           <div class="flex items-center gap-2">
                              <span class="text-[11px] font-black text-white uppercase tracking-wider">{{ i18n.t(`exercise_${ex.exercise_type}`) }}</span>
                              <!-- NEW RECORD BADGE -->
                              <span v-if="ex.is_pr" class="text-[7px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded-full animate-pulse uppercase">Record</span>
                              <!-- ATRIBUTOS RPG -->
                              <span class="text-[8px] font-black text-accent/80 drop-shadow-[0_0_5px_rgba(0,255,136,0.2)]">
                                 +{{ Math.ceil(ex.count / 5) }} {{ getAttributeName(ex.exercise_type) }}
                              </span>
                           </div>
                           <div class="w-32 h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
                              <div class="h-full transition-all duration-1000 ease-out shadow-[0_0_8px_currentColor]" 
                                   :class="dominantStatColor(ex.exercise_type)" 
                                   :style="{ width: Math.min((ex.count / 50) * 100, 100) + '%' }"></div>
                           </div>
                        </div>
                     </div>
                     <div class="flex items-baseline gap-1.5 p-1 bg-black/20 rounded-sm px-3 border border-white/5">
                        <span class="text-xl font-black text-white tabular-nums italic">{{ ex.count }}</span>
                        <span class="text-[8px] font-bold text-muted uppercase opacity-40">Qty</span>
                     </div>
                  </div>
               </div>
            </div>
        </div>

        <!-- IMPACT: Power Level -->
        <div class="md:col-span-5 flex flex-col justify-center items-center p-6 bg-black/40 border border-white/5 rounded-sm relative overflow-hidden shadow-inner group/impact">
           <!-- Subtle Background Glow -->
           <div class="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-50"></div>
           
           <!-- Boss Target Overlay (Cleaner) -->
           <div v-if="activity.boss_image" class="absolute inset-0 pointer-events-none opacity-[0.05] grayscale brightness-200 flex items-center justify-center p-8">
              <img :src="activity.boss_image" class="w-full h-full object-contain" />
           </div>

           <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] mb-8 flex items-center gap-2 relative z-10">
             <Zap class="w-3 h-3 fill-current text-primary-500" />
             Poder de Impacto
           </p>
           
           <div class="relative flex flex-col items-center z-10">
              <div v-if="activity.has_crit" class="absolute -top-12 text-[10px] font-black text-amber-500 animate-bounce italic bg-amber-500/10 px-4 py-1.5 border border-amber-500/20 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.2)]">ATAQUE CRÍTICO</div>
              <div class="text-6xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_30px_hsla(var(--primary)/0.4)]"
                   :class="activity.has_crit ? 'text-amber-500 scale-110 drop-shadow-[0_0_50px_rgba(245,158,11,0.6)]' : 'text-white'">
                {{ animatedDamage || '0000' }}
              </div>
              <p class="text-[8px] font-black text-primary-500 uppercase mt-6 tracking-[0.5em] opacity-40">Dominación</p>
           </div>

           <!-- Resource Gains (Cleaner) -->
           <div class="flex gap-4 mt-12 w-full z-10">
              <div class="flex-1 flex flex-col items-center gap-1 py-3 bg-white/[0.02] border border-white/5 rounded-sm">
                 <Coins class="w-4 h-4 text-amber-500/60" />
                 <span class="text-xs font-black text-white tabular-nums">+{{ activity.exercises.reduce((s, e) => s + (e.count * 2), 0) }}</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-1 py-3 bg-white/[0.02] border border-white/5 rounded-sm">
                 <Activity class="w-4 h-4 text-emerald-500/60" />
                 <span class="text-xs font-black text-white tabular-nums">+{{ activity.exercises.reduce((s, e) => s + (e.count * 15), 0) }} XP</span>
              </div>
        </div>
      </div>
      </div>

      <!-- Protocolo de Persistencia -->
      <div v-if="activity.real_streak > 1" 
           class="flex items-center justify-between px-6 py-3 bg-emerald-500/5 border-l-2 border-emerald-500 rounded-sm relative overflow-hidden group/streak shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent translate-x-[-100%] group-hover/streak:translate-x-[100%] transition-transform duration-1000"></div>
          <div class="flex items-center gap-4">
             <div class="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Flame class="w-5 h-5 text-emerald-500 animate-streak-fire" />
             </div>
             <div class="flex flex-col">
               <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">Racha de Entrenamiento</p>
               <span class="text-[8px] text-emerald-500/60 uppercase font-black mt-1">Consistencia Activa</span>
             </div>
          </div>
          <div class="flex flex-col items-end">
             <span class="text-xl font-black text-white italic leading-none">{{ activity.real_streak }}</span>
             <span class="text-[7px] text-emerald-500 uppercase font-black">Días</span>
          </div>
      </div>
    </div>

    <!-- FOOTER: Consola de Interacción -->
    <div class="relative z-20 px-6 py-4 flex items-center justify-between bg-black/80 border-t border-white/10 backdrop-blur-xl">
      <div class="flex items-center gap-3">
        <!-- Commend (Like) -->
        <button @click="toggleLike" 
                class="tactical-btn h-12 px-6 flex items-center gap-4 group/like"
                :class="activity.user_has_liked ? 'active text-primary-500 border-primary-500/50' : 'text-white/40'">
          <div class="relative">
             <Zap v-if="!activity.user_has_liked" class="w-6 h-6 transition-transform group-hover/like:scale-125" />
             <Flame v-else class="w-6 h-6 fill-current animate-pulse shadow-primary-500" />
          </div>
          <div class="flex flex-col items-start leading-none">
             <span class="text-sm font-black tabular-nums">{{ activity.like_count }}</span>
             <span class="text-[7px] font-black uppercase opacity-60 tracking-widest">Me Gusta</span>
          </div>
        </button>

        <!-- Intel (Comments) -->
        <button @click="showComments = !showComments" 
                class="tactical-btn h-12 px-5 flex items-center gap-4 text-white/40 group/comm"
                :class="showComments ? 'bg-white/10 border-white/40 text-white' : ''">
          <MessageSquare class="w-5 h-5 transition-transform group-hover/comm:translate-y-[-2px]" />
          <div class="flex flex-col items-start leading-none">
             <span class="text-sm font-black tabular-nums">{{ activity.comment_count }}</span>
             <span class="text-[7px] font-black uppercase opacity-60 tracking-widest">Comentarios</span>
          </div>
        </button>

        <!-- Hunters (View count - Mocked if not in data) -->
        <div class="tactical-btn h-12 px-4 opacity-30 flex items-center gap-2 cursor-default border-dashed">
           <Scan class="w-4 h-4" />
           <span class="text-[9px] font-black uppercase tracking-tighter">{{ (activity.summary_id ? activity.summary_id % 100 : 7) }} Vistas</span>
        </div>
      </div>

      <!-- Share Hub -->
      <button @click="shareActivity" 
              class="tactical-btn h-12 w-12 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.05]">
        <Share2 class="w-5 h-5" />
      </button>
    </div>

    <!-- COMMENTS: Canal de Inteligencia -->
    <div v-if="showComments" class="relative z-20 px-6 pb-8 bg-black/60 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
      <!-- Input Header -->
      <div class="flex items-center gap-2 py-4 opacity-40">
         <div class="h-px flex-1 bg-white/10"></div>
         <span class="text-[8px] font-black uppercase tracking-[0.5em]">Hilo de Comentarios</span>
         <div class="h-px flex-1 bg-white/10"></div>
      </div>

      <div class="flex gap-3 mb-8 p-1.5 bg-black/40 border border-white/10 shadow-inner group/input focus-within:border-primary-500/50 transition-colors">
        <input 
          v-model="commentText" @keyup.enter="submitComment" :placeholder="'> TRANSMITIENDO DATOS...'" 
          class="flex-1 bg-transparent px-4 py-3 text-[11px] font-black tracking-[0.2em] text-white outline-none placeholder:text-white/10 uppercase"
        />
        <button @click="submitComment" class="px-8 bg-primary-500 text-black font-black uppercase text-[10px] hover:bg-primary-400 active:scale-95 transition-all disabled:opacity-50 tracking-tighter" :disabled="!commentText.trim() || submittingComment">
          {{ submittingComment ? 'SINCRONIZANDO...' : 'ENVIAR' }}
        </button>
      </div>

      <div class="space-y-5 max-h-80 overflow-y-auto pr-3 custom-scrollbar">
          <div v-for="comment in comments" :key="comment.id" class="flex gap-4 items-start group/comment">
              <div class="relative">
                 <AvatarFrame :src="comment.avatar_url" :border-css="comment.border_css" :size="36" class="grayscale brightness-50 group-hover/comment:grayscale-0 group-hover/comment:brightness-100 transition-all border border-white/5" />
                 <div class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black animate-pulse"></div>
              </div>
              <div class="flex-1 bg-white/[0.03] border-l-2 border-primary-500 p-4 shadow-xl relative overflow-hidden">
                  <div class="absolute top-0 right-0 p-1 opacity-5 select-none text-[20px] font-black italic">REPPY_DATA</div>
                  <div class="flex justify-between items-center mb-2">
                     <p class="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] italic">{{ comment.user_name }}</p>
                     <span class="text-[8px] text-white/30 uppercase font-black tabular-nums">{{ comment.created_at ? 'T+' + formatDistanceToNow(new Date(comment.created_at)) : 'VERIFICADO' }}</span>
                  </div>
                  <p class="text-[13px] text-white/80 leading-relaxed font-medium tracking-wide">{{ comment.content }}</p>
              </div>
          </div>
          <div v-if="!loadingComments && comments.length === 0" class="py-10 text-center border border-dashed border-white/10 rounded-sm bg-white/[0.01]">
             <div class="flex flex-col items-center gap-2 opacity-20 transition-opacity">
                <MessageSquare class="w-8 h-8" />
                <p class="text-[9px] text-white uppercase tracking-[0.5em] italic">Sin transmisiones activas</p>
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
    Heart, MessageSquare, Share2, Edit3, Send, 
    Swords, ChevronRight, Trophy, Zap, 
    Flame, TrendingUp, Loader2, Dumbbell, Plus,
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

// RPG Attributes mapping
const getAttributeName = (type) => {
  const t = type.toLowerCase();
  if (['pullups', 'weighted_pullups', 'muscleups'].includes(t)) return 'STR';
  if (['pushups', 'dips'].includes(t)) return 'PWR';
  if (['squats', 'lunges', 'running'].includes(t)) return 'END';
  return 'AGI';
};

// RPG Logic: Dominant Stat Glow
const dominantStatGlow = computed(() => {
  const stat = props.activity.dominant_stat || 'str';
  switch (stat) {
    case 'str': return 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]';
    case 'end': return 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]';
    case 'dex': return 'bg-accent shadow-[0_0_20px_rgba(0,255,136,0.5)]';
    default: return 'bg-primary-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]';
  }
});

const dominantStatColor = (type, mode = 'text') => {
  let cls = 'text-red-500';
  let borderCls = 'border-red-500';

  if (['pullups', 'weighted_pullups', 'muscleups'].includes(type)) {
     cls = 'text-red-500';
     borderCls = 'border-red-500';
  } else if (['pushups', 'dips'].includes(type)) {
     cls = 'text-amber-500';
     borderCls = 'border-amber-500';
  } else if (props.activity.total_reps_today > 50 || props.activity.has_crit) {
     cls = 'text-blue-500';
     borderCls = 'border-blue-500';
  }

  return mode === 'border' ? borderCls : cls;
};

const timeAgo = computed(() => {
  if (!props.activity.date) return '';
  const date = props.activity.created_at ? new Date(props.activity.created_at) : new Date(props.activity.date + 'T12:00:00');
  return formatDistanceToNow(date, { addSuffix: true, locale: i18n.locale === 'es' ? es : enUS });
});

const rankStyles = computed(() => {
  const rank = props.activity.global_rank;
  if (!rank) return 'bg-white/5 border-white/10 text-muted';
  if (rank === 1) return 'bg-amber-400/20 text-amber-400 border-amber-500 shadow-[inset_0_0_15px_rgba(245,158,11,0.2)]';
  if (rank <= 3) return 'bg-slate-300/20 text-slate-100 border-white shadow-md';
  return 'bg-white/5 border-white/20 text-muted-foreground';
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

const getRarityClass = (rarity, mode = 'color') => {
  const r = rarity?.toLowerCase() || 'common';
  let finalR = r === 'epic' ? 'especial' : r;
  
  if (mode === 'bg') return `bg-rarity-${finalR}`;
  if (mode === 'border') return `border-rarity-${finalR}`;
  return `rarity-${finalR} ${finalR === 'legendary' ? 'glow-legendary' : ''}`;
};

const addFeedback = (text, type = 'coins') => {
  const id = Date.now();
  const cls = type === 'coins' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-primary-500/20 border-primary-500/50 text-primary-500 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]';
  feedbacks.value.push({ id, text, class: cls });
  setTimeout(() => {
    feedbacks.value = feedbacks.value.filter(f => f.id !== id);
  }, 1500);
};

const toggleLike = () => {
  if (navigator.vibrate) navigator.vibrate(12);
  if (!props.activity.user_has_liked) addFeedback('+5 CRÉDITOS', 'coins');
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
        addFeedback('+20 XP CARISMA', 'xp');
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
      const duration = 1200;
      const startTime = Date.now();
      const run = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // OutQuart
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
.rpg-card {
  background: linear-gradient(135deg, rgba(15, 15, 20, 0.98) 0%, rgba(5, 5, 8, 1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  position: relative;
  margin-bottom: 32px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.rpg-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
}

.rpg-card::before, .rpg-card::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid hsla(var(--primary) / 0.5);
  pointer-events: none;
  z-index: 30;
}

.rpg-card::before { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
.rpg-card::after { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }

/* Corner Brackets for the other two corners */
.rpg-card > div:first-child::before, .rpg-card > div:first-child::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
  z-index: 30;
}

.is-highlighted {
  border: 2px solid hsla(var(--primary) / 0.8) !important;
  box-shadow: 0 0 40px hsla(var(--primary) / 0.2) !important;
}

.is-critical {
  border: 2px solid #f59e0b !important;
  outline: 4px solid rgba(245, 158, 11, 0.1);
}

.loot-slot {
  @apply relative cursor-help shrink-0;
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.tactical-btn {
  @apply bg-white/[0.03] border border-white/5 rounded-sm transition-all duration-300 
         uppercase text-[10px] font-black tracking-widest active:scale-95 flex items-center justify-center;
}
.tactical-btn:hover {
  @apply bg-white/[0.08] border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)];
}
.tactical-btn.active {
  @apply bg-primary-500/10 border-primary-500/40 shadow-[inset_0_0_20px_hsla(var(--primary)/0.1)];
}

.loot-slot-hud {
  @apply relative w-10 h-10 flex items-center justify-center rounded-sm border-2 shadow-lg bg-black/60 transition-all cursor-crosshair;
}
.loot-slot-hud:hover {
  @apply scale-110 -translate-y-0.5 border-white/40 bg-black/80;
}
.loot-slot-hud-empty {
  @apply w-12 h-12 flex items-center justify-center rounded-sm border border-dashed border-white/10 bg-black/20;
}
.rarity-border {
  @apply border-2;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow { animation: spin-slow 20s linear infinite; }

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); filter: brightness(1); }
  50% { transform: translateY(-5px); filter: brightness(1.3); }
}
.animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }

.floating-data-enter-active { animation: rpg-float-up 1.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
@keyframes rpg-float-up {
  0% { transform: translateY(0) scale(0.8) rotate(-10deg); opacity: 0; }
  20% { opacity: 1; transform: translateY(-20px) scale(1.1) rotate(0deg); }
  100% { transform: translateY(-160px) scale(1) rotate(10deg); opacity: 0; }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: hsla(var(--primary) / 0.3); border-radius: 0; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsla(var(--primary) / 0.6); }

.no-scrollbar::-webkit-scrollbar { display: none; }

.rarity-sparkle {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);
  background-size: 200% 200%;
  animation: sparkle-move 3s linear infinite;
}

@keyframes sparkle-move {
  0% { background-position: -100% -100%; }
  100% { background-position: 100% 100%; }
}
</style>
