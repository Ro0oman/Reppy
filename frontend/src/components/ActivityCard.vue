<template>
  <div class="activity-card-container">
    <div 
      :id="'activity-' + activity.user_id + '-' + activity.date"
      class="social-card group relative flex flex-col transition-all duration-300"
      :class="[
        activity.post_background_css ? 'has-custom-bg' : 'bg-surface/40 dark:bg-card/30 backdrop-blur-md',
        highlighted ? 'ring-2 ring-primary-500/50 shadow-2xl shadow-primary-500/10' : 'border border-border/10',
        activity.has_crit ? 'is-critical' : ''
      ]"
    >
      <!-- Background Enhancement (Premium Effects) -->
      <div v-if="activity.post_background_css" class="absolute inset-0 pointer-events-none overflow-hidden rounded-[1.5rem] z-0">
        <div class="absolute inset-0 opacity-20" :class="activity.post_background_css">
          <!-- Matrix Rain Effect -->
          <template v-if="activity.post_background_css === 'post-bg-matrix'">
            <div v-for="i in 10" :key="i" class="matrix-column" :style="{ 
              left: (i * 10) + '%', 
              animationDelay: (i * 0.5) + 's',
              animationDuration: (1 + Math.random() * 2) + 's'
            }"></div>
          </template>
          
          <!-- Inferno Core Effect -->
          <template v-if="activity.post_background_css === 'post-bg-inferno'">
            <div v-for="i in 12" :key="i" class="ember" :style="{ 
              left: (Math.random() * 100) + '%', 
              animationDelay: (Math.random() * 4) + 's',
              animationDuration: (2 + Math.random() * 3) + 's'
            }"></div>
          </template>
        </div>
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

      <!-- MAIN CONTENT AREA -->
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
              <div class="absolute -bottom-2 -right-2 bg-primary-500 text-[11px] font-black text-white px-2 py-0.5 rounded-lg border-2 border-background shadow-xl z-20 flex items-center justify-center min-w-[24px]">
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
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button v-if="activity.user_id === authStore.user?.id" 
                    @click="$emit('edit', activity)"
                    class="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-500/10 hover:bg-primary-500/20 transition-all flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary-500/20 shadow-sm">
              <Pencil class="w-3.5 h-3.5" />
              <span>{{ i18n.t('ui_edit') || 'EDITAR' }}</span>
            </button>
            <button @click="showDetails = !showDetails" class="text-[9px] font-black uppercase tracking-widest text-muted/40 hover:text-primary-500 transition-colors flex items-center gap-1">
              {{ showDetails ? i18n.t('ui_hide_build') || 'Ocultar build' : i18n.t('ui_show_build') || 'Ver build' }}
              <ChevronRight class="w-3 h-3 transition-transform" :class="showDetails ? 'rotate-90' : ''" />
            </button>
          </div>
        </div>

        <div v-if="activity.title || activity.description" class="mt-1 space-y-1">
          <h3 v-if="activity.title" class="text-base md:text-xl font-black text-foreground uppercase italic tracking-tight leading-tight break-words">
            {{ activity.title }}
          </h3>
          <p v-if="activity.description" class="text-xs text-foreground/80 leading-relaxed font-medium">
            {{ activity.description }}
          </p>
        </div>

        <!-- HIGHLIGHT ROW: Reps & DMG -->
        <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-1">
          <div class="flex items-baseline gap-1.5">
            <span class="text-3xl font-black text-foreground italic tracking-tighter">🔥 {{ activity.total_reps_today }}</span>
            <span class="text-[9px] font-black text-muted/40 uppercase tracking-widest">{{ i18n.t('ui_reps') }}</span>
          </div>
          <div v-if="activity.total_damage_today" class="flex items-baseline gap-1">
            <span class="text-xl font-black text-primary-500 italic tracking-tighter">⚡ {{ animatedDamage }}</span>
            <span class="text-[8px] font-black text-primary-500/40 uppercase tracking-widest">{{ i18n.t('ui_dmg') }}</span>
          </div>
        </div>

        <!-- BADGES & PROGRESS -->
        <div class="flex flex-wrap items-center gap-2">
          <div v-if="activity.is_personal_best" class="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 text-[8px] font-black uppercase tracking-widest">
            <Trophy class="w-2.5 h-2.5" /> {{ i18n.t('ui_pb') }}
          </div>
          <div v-if="activity.real_streak > 1" class="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest">
            <Flame class="w-2.5 h-2.5" /> {{ activity.real_streak }}{{ i18n.t('ui_streak_days') ? ' ' + i18n.t('ui_streak_days') : 'D STREAK' }}
          </div>
          
          <!-- RANKING BADGES -->
          <div v-for="badge in rankingBadges" :key="badge.text" 
               class="flex items-center gap-1 px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest transition-all hover:scale-105"
               :class="badge.class">
            <component :is="badge.icon" class="w-2.5 h-2.5" />
            {{ badge.text }}
          </div>
          <!-- XP GAINS -->
          <div v-for="xp in xpGains" :key="xp.stat" 
               class="flex items-center gap-1 px-2 py-0.5 bg-primary-500/5 text-primary-500/80 rounded border border-primary-500/10 text-[8px] font-black uppercase tracking-widest">
            +{{ xp.amount }} {{ i18n.t('ui_xp') || 'XP' }} {{ xp.stat }}
          </div>
        </div>
        
        <!-- Rivalry context -->
        <div v-if="activity.next_rank_rival" class="mt-1 flex items-center gap-2 text-[10px] text-muted font-bold italic">
           <Swords class="w-3 h-3 text-amber-500" />
           <span>{{ i18n.t('ui_objective') }}: {{ i18n.t('ui_surpassing_rival', { name: activity.next_rank_rival.name, reps: activity.next_rank_rival.reps_diff }) }}</span>
        </div>

        <!-- EXPANDED SECTION -->
        <div v-if="showDetails" class="mt-3 pt-3 border-t border-border/10 space-y-5 animate-in slide-in-from-top-2 duration-300">
          <!-- Detailed Exercises Breakdown -->
          <div class="space-y-4">
             <div class="flex items-center justify-between">
                <h4 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                  {{ i18n.t('ui_detailed_ops') }}
                </h4>
             </div>

             <div v-if="activity.surpassing_rival_name" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-between group-hover:bg-amber-500/20 transition-all duration-500">
              <div class="flex items-center gap-3">
                <Trophy class="w-5 h-5" />
                <p class="text-xs font-black uppercase tracking-widest italic">
                  {{ i18n.t('ui_surpassing_rival', { name: props.activity.surpassing_rival_name, reps: props.activity.surpassing_rival_reps }) }}
                </p>
              </div>
              <div class="text-[9px] font-black tracking-[0.2em] uppercase opacity-50">{{ i18n.t('ui_objective') }}</div>
            </div>

             <div class="space-y-4">
                <div v-for="ex in activity.exercises" :key="ex.exercise_type" 
                     class="grid grid-cols-2 gap-4 py-2 border-b border-border/5 last:border-0">
                    <div class="flex flex-col gap-1">
                       <span class="text-[10px] font-black uppercase tracking-wider text-foreground">{{ i18n.t(ex.exercise_type) }}</span>
                       <span class="text-[9px] font-bold" :class="dominantStatColor(getAttributeName(ex.exercise_type).toLowerCase())">
                          +{{ Math.ceil(ex.count / 5) }} {{ getAttributeName(ex.exercise_type) }} {{ i18n.t('ui_xp') || 'XP' }}
                       </span>
                       <div v-if="ex.active_multiplier > 1" class="text-[8px] font-black text-amber-500 flex items-center gap-1">
                          <Zap class="w-2.5 h-2.5" /> {{ i18n.t('ui_mult') || 'Multiplicador' }} x{{ ex.active_multiplier }}
                       </div>
                    </div>
                    <div class="flex flex-col items-end justify-center">
                       <span class="text-xl font-black italic text-foreground tracking-tighter">{{ ex.count }} <span class="text-[8px] text-muted not-italic uppercase tracking-widest ml-1">{{ i18n.t('ui_reps') }}</span></span>
                       <span class="text-[10px] font-black text-primary-500 tracking-tight">{{ ex.boss_damage }} {{ i18n.t('ui_dmg') }}</span>
                    </div>
                </div>
             </div>
          </div>

          <!-- LOADOUT -->
          <div class="space-y-2">
             <p class="text-[8px] font-black text-muted/40 uppercase tracking-[0.3em]">{{ i18n.t('ui_loadout_active') }}</p>
             <div class="flex flex-wrap gap-2">
                <div v-for="(item, slot) in activity.equipment" :key="slot" 
                     @click="item?.name ? openItemDetails(item) : null"
                     class="w-10 h-10 flex items-center justify-center rounded-lg bg-tactical border-2 relative group/item cursor-pointer"
                     :class="item?.name ? getRarityClass(item.rarity, 'border') : 'border-dashed border-border/10 opacity-20'">
                   <component :is="getSlotIcon(slot)" class="w-5 h-5" :class="item?.name ? getRarityClass(item.rarity) : ''" />
                   <div v-if="item?.name" class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary-500 shadow-sm ring-2 ring-background"></div>
                </div>
             </div>
          </div>
        </div>

        <!-- ACTION BAR -->
        <div class="mt-2 pt-3 border-t border-border/10 flex flex-col gap-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <button @click="toggleLike" 
                      class="flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all hover:bg-foreground/5"
                      :class="activity.user_has_liked ? 'text-amber-500' : 'text-muted/60'">
                <BicepsFlexed class="w-4 h-4" :class="{ 'fill-current': activity.user_has_liked }" />
                <span class="text-[10px] font-black tabular-nums">{{ activity.like_count }}</span>
              </button>
              <button @click="showComments = !showComments" 
                      class="flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all hover:bg-foreground/5 text-muted/60">
                <MessageSquare class="w-4 h-4" />
                <span class="text-[10px] font-black tabular-nums">{{ activity.comment_count }}</span>
              </button>
              <button @click="$emit('challenge', activity)" class="flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all hover:bg-foreground/5 text-muted/60 hover:text-amber-500">
                <Swords class="w-4 h-4" />
                <span class="text-[10px] font-black uppercase tracking-tighter">{{ i18n.t('ui_challenge') || 'Retar' }}</span>
              </button>
              <button @click="sharePost" class="flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all hover:bg-foreground/5 text-muted/60 hover:text-blue-500">
                <Share2 class="w-4 h-4" />
                <span class="text-[10px] font-black uppercase tracking-tighter">{{ i18n.t('ui_share') || 'Compartir' }}</span>
              </button>
            </div>

            <button @click="$emit('viewProfile', activity.user_id)" class="shrink-0 p-2 text-muted/30 hover:text-foreground transition-colors">
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
              v-model="commentText" @keyup.enter="submitComment" :placeholder="i18n.t('ui_comment_placeholder') || 'Comentar...'" 
              class="flex-1 bg-foreground/5 border-none rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 ring-primary-500/20"
            />
            <button @click="submitComment" class="text-[10px] font-black uppercase text-primary-500 disabled:opacity-30" :disabled="!commentText.trim()">
              {{ i18n.t('ui_submit') || 'Ok' }}
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

    <!-- Teleport to body to keep the modal outside of card's overflow -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showItemModal && selectedItem" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/90 backdrop-blur-2xl" @click="showItemModal = false"></div>
          
          <!-- Modal Content -->
          <div class="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)] animate-modal-in flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="p-6 md:p-8 pb-4 flex items-center justify-between shrink-0 relative z-10">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                  <Package class="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p class="text-[9px] font-black text-primary-500 uppercase tracking-[0.3em] leading-none mb-1.5">{{ i18n.t('inv_artifact_detail') }}</p>
                  <h3 class="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{{ selectedItem.name }}</h3>
                </div>
              </div>
              <button @click="showItemModal = false" class="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
                <X class="w-5 h-5 text-muted" />
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="p-6 md:p-8 pt-0 space-y-8 flex-1 overflow-y-auto no-scrollbar relative z-10">
              
              <!-- Loading State -->
              <div v-if="loadingItem" class="py-20 flex flex-col items-center justify-center gap-4">
                <div class="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                <p class="text-[10px] font-black text-muted uppercase tracking-widest animate-pulse">Syncing Nexus Data...</p>
              </div>

              <template v-else>
                <!-- Visual Preview Area -->
                <div class="aspect-video bg-black/40 rounded-[22px] border border-white/5 flex items-center justify-center relative overflow-hidden group shadow-inner">
                   <!-- Background Glow -->
                   <div class="absolute inset-0 blur-3xl opacity-20 pointer-events-none" :class="getRarityClass(selectedItem.rarity).split(' ')[0].replace('text-', 'bg-')"></div>
                   
                   <div class="transform group-hover:scale-110 transition-transform duration-1000">
                      <ItemIcon v-if="['head', 'weapon', 'armor', 'boots'].includes(selectedItem.type)" :name="selectedItem.svg_key" :type="selectedItem.type" class-name="w-24 h-24 sm:w-32 sm:h-32 text-primary-500 drop-shadow-2xl" />
                      <FlaskConical v-else-if="selectedItem.type === 'consumable'" class="w-24 h-24 sm:w-32 sm:h-32 text-primary-500 animate-pulse drop-shadow-2xl" />
                      <div v-else-if="selectedItem.type === 'title'" class="text-xl sm:text-4xl font-black uppercase italic tracking-tighter text-center px-6 leading-tight" :class="selectedItem.css_value">{{ selectedItem.name }}</div>
                      <AvatarFrame v-else-if="selectedItem.type === 'border'" :src="activity.avatar_url" :border-css="selectedItem.css_value" :size="windowWidth < 640 ? 120 : 180" />
                      <div v-else-if="selectedItem.type === 'background' || selectedItem.type === 'post_background'" class="w-40 h-40 sm:w-56 sm:h-56 rounded-[22px] overflow-hidden border border-white/10 relative shadow-2xl">
                         <BackgroundEffect v-if="selectedItem.type === 'background'" :background-css="selectedItem.css_value" is-preview class="!absolute !inset-0 !w-full !h-full" />
                         <div v-else :class="selectedItem.css_value" class="absolute inset-0"></div>
                      </div>
                      <ChestIcon v-else class-name="w-24 h-24 text-primary-500" />
                   </div>
                </div>

                <!-- Info & Stats -->
                <div class="space-y-6">
                  <div v-if="selectedItem.description" class="p-6 bg-white/5 rounded-[22px] border border-white/5">
                    <p class="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-2 opacity-60">{{ i18n.t('inv_artifact_description') }}</p>
                    <p class="text-sm font-bold text-zinc-300 leading-relaxed">{{ selectedItem.description }}</p>
                  </div>

                  <div v-if="selectedItem.stats && Object.keys(selectedItem.stats).length > 0" class="space-y-4">
                     <h4 class="text-[9px] font-black text-muted uppercase tracking-[0.3em] flex items-center gap-3">
                       {{ i18n.t('shop_combat_analysis') }}
                       <div class="h-px flex-1 bg-white/5"></div>
                     </h4>
                     <div class="grid grid-cols-2 gap-4">
                      <div v-for="(val, key) in selectedItem.stats" :key="key" class="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                        <p class="text-[8px] font-black text-primary-500/60 uppercase tracking-widest">{{ statLabels[key] || key.replace('_', ' ') }}</p>
                        <p class="text-xl font-black text-white italic tabular-nums">
                          {{ key === 'multiplier' ? 'x' : '+' }}{{ val }}{{ key.includes('percent') || key.includes('chance') ? '%' : '' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Rarity Section -->
                  <div class="flex items-center justify-between p-6 bg-white/5 rounded-[22px] border border-white/5">
                    <div class="flex items-center gap-3">
                      <Sparkles class="w-4 h-4 text-muted" />
                      <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18n.t('inv_artifact_rarity') }}</span>
                    </div>
                    <span class="px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-lg" :class="getRarityClass(selectedItem.rarity)">
                      {{ getRarityLabel(selectedItem.rarity) }}
                    </span>
                  </div>
                </div>
              </template>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 md:p-8 bg-black/60 border-t border-white/10 shrink-0 relative z-10">
              <button @click="showItemModal = false" class="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[22px] text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all active:scale-95">
                {{ i18n.t('inv_close') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import AvatarFrame from './AvatarFrame.vue';
import { 
    BicepsFlexed, MessageSquare, Share2, 
    Swords, ChevronRight, Trophy, Zap, 
    Flame, TrendingUp, Dumbbell, 
    ArrowBigUp, Crown, Scan, 
    Shield, Sword, Footprints,
    CircleDot, Ghost, Gem, Hammer,
    Medal, Award, Pencil, X, FlaskConical, Sparkles,
    Package
} from 'lucide-vue-next';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { enUS } from 'date-fns/locale/en-US';
import { useNotificationStore } from '../stores/notification';
import ItemIcon from './ItemIcon.vue';
import BackgroundEffect from './BackgroundEffect.vue';
import ChestIcon from './ChestIcon.vue';

const props = defineProps({
    activity: { type: Object, required: true },
    highlighted: { type: Boolean, default: false }
});

const emit = defineEmits(['toggleLike', 'viewProfile', 'commentAdded', 'compare', 'challenge', 'edit']);

const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const handleResize = () => { windowWidth.value = window.innerWidth; };
onMounted(() => { window.addEventListener('resize', handleResize); });
onUnmounted(() => { window.removeEventListener('resize', handleResize); });

const showComments = ref(false);
const commentText = ref('');
const comments = ref([]);
const loadingComments = ref(false);
const animatedDamage = ref(0);
const feedbacks = ref([]);
const showDetails = ref(false);
const showItemModal = ref(false);
const selectedItem = ref(null);
const loadingItem = ref(false);

const statLabels = {
  str: 'Fuerza',
  pwr: 'Potencia',
  end: 'Resistencia',
  agi: 'Agilidad',
  vig: 'Vigor',
  dex: 'Destreza',
  int: 'Inteligencia',
  fth: 'Fe',
  cha: 'Carisma',
  multiplier: 'Multiplicador',
  crit_chance: 'Prob. Crítica',
  crit_damage: 'Daño Crítico',
  duration: 'Duración'
};

const openItemDetails = async (item) => {
  if (!item || !item.name) return;
  
  // Set data immediately. With the new feed backend, this should already contain stats and description.
  selectedItem.value = { ...item };
  showItemModal.value = true;
  
  // Only fetch if we're missing crucial info (like description or stats)
  if (!item.description || !item.stats) {
    loadingItem.value = true;
    try {
      const itemId = item.id || item.item_id;
      if (itemId) {
        const res = await axios.get(`/api/shop/item/${itemId}`);
        selectedItem.value = res.data;
      }
    } catch (e) {
      console.error('Error fetching full item details:', e);
    } finally {
      loadingItem.value = false;
    }
  } else {
    loadingItem.value = false;
  }
};

const getRarityLabel = (rarity) => {
  const r = rarity?.toLowerCase();
  switch (r) {
    case 'calistenico': return i18n.t('rarity_calisthenic');
    case 'legendary': return i18n.t('rarity_legendary');
    case 'epic':
    case 'especial': return i18n.t('rarity_special');
    case 'rare': return i18n.t('rarity_rare');
    default: return i18n.t('rarity_common');
  }
};

const timeAgo = computed(() => {
    try {
        const date = props.activity.created_at ? new Date(props.activity.created_at) : new Date(props.activity.date);
        return formatDistanceToNow(date, { addSuffix: true, locale: i18n.locale === 'es' ? es : enUS });
    } catch (e) { return ''; }
});

const sharePost = async () => {
  const text = `Check out this training by ${props.activity.user_name} on Reppy!`;
  const url = `${window.location.origin}/social?user=${props.activity.user_id}&date=${props.activity.date}`;
  
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Reppy Activity', text, url });
    } catch (e) { console.log('Share failed', e); }
  } else {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      notificationStore.addNotification({ type: 'success', message: i18n.t('ui_link_copied') || 'Link copiado!' });
    } catch (e) { console.log('Copy failed', e); }
  }
};

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

const rankingBadges = computed(() => {
    const badges = [];
    if (props.activity.global_rank) {
        badges.push({
            icon: Trophy,
            text: i18n.t('ui_rank_global', { rank: props.activity.global_rank }),
            class: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        });
    }
    if (props.activity.exercise_ranks) {
        props.activity.exercise_ranks.forEach(r => {
            if (badges.length < 3) {
                badges.push({
                    icon: Medal,
                    text: i18n.t('ui_rank_exercise', { rank: r.rank, exercise: i18n.t(r.exercise_type) }),
                    class: 'bg-primary-500/10 text-primary-500 border-primary-500/20'
                });
            }
        });
    }
    return badges.slice(0, 3);
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
  color: white !important;
}

.has-custom-bg .text-foreground,
.has-custom-bg [class*="text-foreground/"] {
  color: white !important;
}

.has-custom-bg .text-muted,
.has-custom-bg [class*="text-muted/"] {
  color: rgba(255, 255, 255, 0.6) !important;
}

.has-custom-bg .text-primary-500 {
  color: hsl(var(--primary)) !important;
}
</style>
