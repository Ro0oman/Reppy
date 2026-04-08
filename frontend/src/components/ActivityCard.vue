<template>
  <div 
    :id="'activity-' + activity.user_id + '-' + activity.date"
    class="card-stats group relative overflow-hidden flex flex-col gap-6 p-6 sm:p-8 border-border backdrop-blur-md transition-all duration-700"
    :class="[
      activity.post_background_css ? 'bg-black' : 'bg-surface/20',
      highlighted ? 'ring-2 ring-primary-500 shadow-[0_0_30px_rgba(255,69,0,0.15)] bg-primary-500/[0.05] border-primary-500/50 scale-[1.01]' : 'hover:border-primary-500/30 hover:shadow-[0_0_40px_rgba(255,69,0,0.05)]'
    ]"
  >
    <!-- Background Enhancement Layer -->
    <div v-if="activity.post_background_css" class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute inset-0 transition-opacity duration-1000" :class="activity.post_background_css"></div>
      
      <!-- Specialized Overlays for specific backgrounds -->
      <div v-if="activity.post_background_css === 'post-bg-matrix'" class="absolute inset-0 matrix-columns">
        <div v-for="i in 10" :key="i" class="matrix-column" :style="{ left: (i-1)*10 + '%', animationDelay: (i*0.5) + 's' }"></div>
      </div>
      <div v-if="activity.post_background_css === 'post-bg-inferno'" class="absolute inset-0">
        <div v-for="i in 15" :key="i" class="ember" :style="{ left: Math.random()*100 + '%', animationDelay: Math.random()*5 + 's' }"></div>
      </div>
    </div>
    
    <!-- Header: User & Info -->
    <div class="flex items-start justify-between gap-4 relative z-10 p-4 rounded-2xl"
         :class="activity.post_background_css ? 'bg-background/20 backdrop-blur-sm' : ''">
      <div class="flex items-center gap-4">
        <div class="relative cursor-pointer hover:scale-105 transition-transform" @click="$emit('viewProfile', activity.user_id)">
          <AvatarFrame 
            :src="activity.avatar_url" 
            :border-css="activity.border_css" 
            :avatar-css="activity.avatar_css" 
            :size="60" 
          />
          <div class="absolute -bottom-1 -right-1 bg-background border border-border px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
            <span class="text-[7px] font-black text-primary-500 uppercase tracking-widest">LVL</span>
            <span class="text-[9px] font-black italic">{{ activity.current_level }}</span>
          </div>
        </div>
        <div>
          <h4 class="text-lg font-black text-foreground uppercase tracking-tight leading-none flex items-center gap-2">
            {{ activity.user_name }}
            <span class="text-[10px] font-normal text-muted lowercase tracking-normal bg-foreground/5 px-2 py-0.5 rounded-full">{{ timeAgo }}</span>
          </h4>
        </div>
      </div>

      <!-- Action: Edit Title/Desc (Only if own) -->
      <button v-if="isOwn" @click="$emit('edit')" class="p-2.5 rounded-xl bg-surface/5 hover:bg-primary-500/10 border border-border transition-all">
        <Edit3 class="w-4 h-4 text-muted hover:text-primary-500" />
      </button>
    </div>

    <!-- Content: Stats & Badges -->
    <div class="space-y-6 relative z-10 p-4 rounded-2xl"
         :class="activity.post_background_css ? 'bg-background/20 backdrop-blur-sm' : ''">
      <div v-if="activity.title || activity.description" class="space-y-2">
        <h3 v-if="activity.title" class="text-xl font-black text-foreground tracking-tight italic uppercase">{{ activity.title }}</h3>
        <p v-if="activity.description" class="text-sm text-muted/80 leading-relaxed font-medium">{{ activity.description }}</p>
      </div>

      <!-- Milestones (if any) -->
      <div v-if="milestones.length > 0" class="flex flex-wrap gap-2">
        <div v-for="m in milestones" :key="m.type + m.value" 
             class="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 animate-bounce-subtle">
          <Trophy class="w-3 h-3 text-yellow-500" />
          <span class="text-[9px] font-black text-foreground uppercase tracking-wider">{{ m.label }}</span>
        </div>
      </div>

      <!-- Grid of Exercises -->
      <div class="grid gap-3" :class="activity.exercises.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'">
        <div v-for="ex in activity.exercises" :key="ex.exercise_type" 
             class="p-4 bg-foreground/[0.03] border border-border/50 rounded-2xl flex flex-col gap-1 group/item hover:bg-foreground/[0.05] transition-all">
          <span class="text-[8px] font-black text-primary-500 uppercase tracking-[0.2em]">{{ i18n.t(ex.exercise_type) }}</span>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-black text-foreground leading-none">{{ ex.count }}</span>
            <span class="text-[10px] font-black text-muted uppercase">REPS</span>
          </div>
        </div>
      </div>

      <!-- Boss Damage Callout (if any) -->
      <div v-if="totalBossDamage > 0" 
           class="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-between group/boss cursor-pointer overflow-hidden relative"
           @click="$router.push('/dashboard')">
        <div class="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent translate-x-[-100%] group-hover/boss:translate-x-[0%] transition-transform duration-1000"></div>
        <div class="flex items-center gap-3 relative z-10">
          <div class="p-2 bg-primary-500 rounded-lg shadow-lg shadow-primary-500/20">
            <Swords class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none">BOSS ASSAULT</p>
            <p class="text-sm font-black text-foreground uppercase tracking-tight mt-1">
              {{ isOwn ? 'Has infligido' : activity.user_name + ' ha infligido' }} 
              <span class="text-primary-500">{{ totalBossDamage }}</span> de daño
            </p>
          </div>
        </div>
        <ChevronRight class="w-4 h-4 text-primary-500 group-hover/boss:translate-x-1 transition-transform" />
      </div>
    </div>

    <!-- Interactions Footer -->
    <div class="flex items-center justify-between pt-4 border-t border-border/40 relative z-10 p-4 -mx-4 rounded-b-2xl"
         :class="activity.post_background_css ? 'bg-background/20 backdrop-blur-sm' : ''">
      <div class="flex items-center gap-6">
        <button 
          @click="$emit('toggleLike')"
          class="flex items-center gap-2 group/like outline-none focus:ring-2 focus:ring-primary-500/20 rounded-lg py-1"
        >
          <div class="p-2 rounded-xl transition-all" :class="activity.user_has_liked ? 'bg-red-500/10 text-red-500' : 'bg-surface/5 text-muted group-hover/like:text-red-500 group-hover/like:bg-red-500/5'">
            <Heart class="w-5 h-5 transition-transform" :class="activity.user_has_liked ? 'fill-current scale-110' : 'group-active/like:scale-125'" />
          </div>
          <span class="text-xs font-black" :class="activity.user_has_liked ? 'text-foreground' : 'text-muted'">{{ activity.like_count }}</span>
        </button>

        <button @click="showComments = !showComments" class="flex items-center gap-2 group/comment outline-none py-1">
          <div class="p-2 rounded-xl bg-surface/5 text-muted group-hover/comment:text-primary-500 group-hover/comment:bg-primary-500/5 transition-all">
            <MessageSquare class="w-5 h-5" />
          </div>
          <span class="text-xs font-black text-muted group-hover/comment:text-foreground transition-colors">{{ activity.comment_count }}</span>
        </button>
      </div>

      <div class="flex -space-x-2">
        <button @click="shareActivity" class="w-8 h-8 rounded-full bg-surface/5 border border-border flex items-center justify-center hover:bg-primary-500/10 hover:border-primary-500/30 transition-all">
            <Share2 class="w-4 h-4 text-muted hover:text-primary-500" />
        </button>
      </div>
    </div>

    <!-- Comments Section (Lazy Load / Expandable) -->
    <div v-if="showComments" class="pt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
      <div class="flex gap-3">
        <input 
          v-model="commentText" 
          @keyup.enter="submitComment"
          placeholder="Escribe un comentario operativo..." 
          class="flex-1 bg-surface/10 border border-border rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:border-primary-500/50 transition-all"
        />
        <button @click="submitComment" class="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50" :disabled="!commentText.trim()">
          <Send class="w-4 h-4" />
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
          <p v-if="!loadingComments && comments.length === 0" class="text-[10px] text-center text-muted uppercase tracking-widest py-4 opacity-40">No records yet</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import AvatarFrame from './AvatarFrame.vue';
import { Heart, MessageSquare, Share2, Edit3, Send, Swords, ChevronRight, Trophy } from 'lucide-vue-next';
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
          label: i18n.locale === 'es' 
            ? `¡${threshold} ${i18n.t(ex.exercise_type)} totales!` 
            : `${threshold} total ${i18n.t(ex.exercise_type)}!`
        });
      }
    });
  });
  return list;
});

const totalBossDamage = computed(() => {
  return props.activity.exercises.reduce((sum, ex) => sum + (ex.boss_damage || 0), 0);
});

const timeAgo = computed(() => {
  // Append a time to avoid timezone shift issues with date-only strings
  const date = new Date(props.activity.date + 'T12:00:00'); 
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: i18n.locale === 'es' ? es : enUS 
  });
});

const shareActivity = async () => {
    try {
        const baseUrl = window.location.origin + '/social';
        // Deep link: activity-USERID-DATE
        const shareUrl = `${baseUrl}?user=${props.activity.user_id}&date=${props.activity.date}`;
        
        const shareData = {
            title: 'Reppy - Protocolo de Entrenamiento',
            text: i18n.locale === 'es' 
                ? `Echa un vistazo al entrenamiento de ${props.activity.user_name} en Reppy` 
                : `Check out ${props.activity.user_name}'s workout on Reppy`,
            url: shareUrl
        };

        if (navigator.share) {
            await navigator.share(shareData);
            notificationStore.notify(i18n.locale === 'es' ? '¡Compartido con éxito!' : 'Shared successfully!', 'success');
        } else {
            await navigator.clipboard.writeText(shareUrl);
            notificationStore.notify(i18n.locale === 'es' ? '¡Enlace de entrenamiento copiado!' : 'Workout link copied!', 'success');
        }
    } catch (e) {
        if (e.name !== 'AbortError') {
            console.error('Error sharing:', e);
            notificationStore.notify(i18n.locale === 'es' ? 'Error al compartir' : 'Error sharing', 'error');
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
    if (!commentText.value.trim()) return;
    try {
        const res = await axios.post('/api/social-feed/comment', {
            targetUserId: props.activity.user_id,
            date: props.activity.date,
            content: commentText.value
        });
        comments.value.push(res.data);
        commentText.value = '';
        emit('commentAdded');
    } catch (e) {
        console.error('Error adding comment:', e);
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
