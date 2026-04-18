<template>
  <div class="space-y-12">
    <!-- Feed Tabs & Controls -->
    <div class="flex items-center justify-between border-b border-border/40 pb-6">
      <div class="flex gap-4">
        <button 
          @click="filter = 'global'; resetFeed()"
          class="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          :class="filter === 'global' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface/5 text-muted hover:bg-surface/10'"
        >
          GLOBAL.PROTOCOLS
        </button>
        <button 
          @click="filter = 'following'; resetFeed()"
          class="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          :class="filter === 'following' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface/5 text-muted hover:bg-surface/10'"
        >
          FOLLOWING.ONLY
        </button>
      </div>

      <div class="hidden sm:flex items-center gap-2">
         <div class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
         <span class="text-[9px] font-black text-muted uppercase tracking-[0.3em]">LIVE DATA STREAM</span>
      </div>
    </div>

    <!-- Feed Content -->
    <div class="space-y-8 min-h-[600px] relative">
      <TransitionGroup name="stagger">
        <ActivityCard 
          v-for="activity in activities" 
          :key="activity.user_id + activity.date"
          :activity="activity"
          :highlighted="isHighlighted(activity)"
          @toggleLike="handleLike(activity)"
          @viewProfile="$emit('viewProfile', $event)"
          @edit="openEditModal(activity)"
        />
      </TransitionGroup>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-8">
        <ActivitySkeleton v-for="i in 3" :key="'skeleton-' + i" />
      </div>

      <!-- End of Feed -->
      <div v-if="finished && activities.length > 0" class="py-20 text-center space-y-4">
          <div class="w-1 h-20 bg-gradient-to-b from-primary-500/50 to-transparent mx-auto rounded-full"></div>
          <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em] opacity-40 italic">You've reached the bottom of the registry</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && activities.length === 0" class="py-32 text-center card-stats border-dashed bg-transparent">
          <ZapOff class="w-12 h-12 text-muted/20 mx-auto mb-6" />
          <h3 class="text-xl font-black text-foreground uppercase italic tracking-tighter mb-2">Registry Silent</h3>
          <p class="text-sm text-muted/60 max-w-xs mx-auto">No activity detected in this sector. Follow more athletes to populate your inner circle.</p>
      </div>

      <!-- Sentinel for Infinite Scroll -->
      <div ref="sentinel" class="h-10 w-full absolute bottom-0 opacity-0 pointer-events-none"></div>
    </div>

    <!-- Edit Modal (Teleported) -->
    <Teleport to="body">
      <div v-if="editingActivity" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md" @click.self="editingActivity = null">
        <div class="card-stats max-w-xl w-full p-8 md:p-12 border-border space-y-10 relative overflow-hidden">
             <div class="flex items-center justify-between">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black text-industrial text-foreground uppercase italic tracking-tighter">DATA<span class="text-primary-500">.</span>OVERRIDE</h2>
                    <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Set your mission objective for {{ editingActivity.date }}</p>
                </div>
                <button @click="editingActivity = null" class="p-2 bg-surface/10 rounded-xl hover:bg-surface/20 transition-all">
                    <X class="w-5 h-5 text-foreground" />
                </button>
             </div>

             <div class="space-y-6">
                <div class="space-y-3">
                    <label class="text-[10px] font-black text-primary-500 uppercase tracking-widest pl-1">Mission Title</label>
                    <input v-model="editForm.title" placeholder="E.g. Morning Grind, Road to 1000..." class="w-full bg-foreground/[0.04] border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-primary-500/50 transition-all font-industrial" />
                </div>
                <div class="space-y-3">
                    <label class="text-[10px] font-black text-primary-500 uppercase tracking-widest pl-1">Protocol Briefing</label>
                    <textarea v-model="editForm.description" rows="4" placeholder="How was the workout today?" class="w-full bg-foreground/[0.04] border border-border rounded-3xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-primary-500/50 transition-all resize-none"></textarea>
                </div>
             </div>

             <button @click="saveEdit" 
                     class="w-full py-5 bg-primary-500 hover:bg-primary-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-primary-500/20 active:scale-[0.98]">
                UPDATE CORE REGISTRY
             </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue';
import axios from 'axios';
import ActivityCard from './ActivityCard.vue';
import ActivitySkeleton from './ActivitySkeleton.vue';
import { ZapOff, X } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { useRoute } from 'vue-router';

const props = defineProps({
    initialFilter: { type: String, default: 'global' }
});

const emit = defineEmits(['viewProfile']);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();

const activities = ref([]);
const filter = ref(props.initialFilter);
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const sentinel = ref(null);
let observer = null;

const lastScrolledTarget = ref(null); // Pattern: user-date

const editingActivity = ref(null);
const editForm = reactive({
    title: '',
    description: ''
});

const fetchFeed = async () => {
    if (loading.value || finished.value) return;
    loading.value = true;
    try {
        const res = await axios.get('/api/social-feed/feed', {
            params: { filter: filter.value, page: page.value }
        });
        
        if (res.data.length < 10) finished.value = true;
        
        // Deduplicate or just append if pagination is strictly unique
        activities.value.push(...res.data);
        page.value++;

        // After fetching, check for highlights
        checkAndScrollToHighlight();
    } catch (e) {
        console.error('Error fetching feed:', e);
    } finally {
        loading.value = false;
    }
};

const resetFeed = () => {
    activities.value = [];
    page.value = 1;
    finished.value = false;
    fetchFeed();
};

const handleLike = async (activity) => {
    try {
        const res = await axios.post('/api/social-feed/like', {
            userId: activity.user_id,
            date: activity.date
        });
        
        // Fix #101: like_count from SQL COUNT(*) is bigint (string in JS), cast to Number first
        activity.user_has_liked = res.data.liked;
        activity.like_count = Number(activity.like_count) + (res.data.liked ? 1 : -1);
    } catch (e) {
        console.error('Error liking:', e);
    }
};

const openEditModal = (activity) => {
    editingActivity.value = activity;
    editForm.title = activity.title || '';
    editForm.description = activity.description || '';
};

const saveEdit = async () => {
    try {
        await axios.put('/api/social-feed/summary', {
            date: editingActivity.value.date,
            title: editForm.title,
            description: editForm.description
        });
        
        // Update local state
        editingActivity.value.title = editForm.title;
        editingActivity.value.description = editForm.description;
        
        notificationStore.notify('Status updated in the core registry', 'success');
        editingActivity.value = null;
    } catch (e) {
        console.error('Error saving edit:', e);
        notificationStore.notify('Failed to update protocol', 'error');
    }
};

const normalizeDate = (d) => {
    if (!d) return '';
    return typeof d === 'string' ? d.substring(0, 10) : d;
};

const isHighlighted = (activity) => {
    return normalizeDate(route.query.date) === normalizeDate(activity.date) && 
           route.query.user === activity.user_id;
};

const checkAndScrollToHighlight = () => {
    if (!route.query.date || !route.query.user) return;

    const qDate = normalizeDate(route.query.date);
    const qUser = route.query.user;
    const currentTarget = `${qUser}-${qDate}`;

    // Avoid repeated scrolling to the same target
    if (lastScrolledTarget.value === currentTarget) return;

    // Small delay to ensure DOM is rendered
    setTimeout(() => {
        // Find activity by checking normalized dates
        const activity = activities.value.find(a => normalizeDate(a.date) === qDate && a.user_id === qUser);
        
        if (activity) {
            const id = `activity-${activity.user_id}-${activity.date}`;
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                lastScrolledTarget.value = currentTarget; // Mark as done
            }
        }
    }, 500);
};

onMounted(() => {
    fetchFeed();

    // Setup Intersection Observer for infinite scroll
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !loading.value && !finished.value) {
            fetchFeed();
        }
    }, { threshold: 0.1 });

    if (sentinel.value) observer.observe(sentinel.value);
});

// Watch for route changes (deep-linking while already on the page)
watch(() => route.query, () => {
    checkAndScrollToHighlight();
}, { deep: true });

// Also watch activities to ensure we scroll even if loading was slow
watch(() => activities.value, (newVal) => {
    if (newVal.length > 0 && route.query.date) {
        checkAndScrollToHighlight();
    }
}, { deep: true });

onUnmounted(() => {
    if (observer) observer.disconnect();
});
</script>

<style scoped>
.stagger-move,
.stagger-enter-active,
.stagger-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.stagger-enter-from,
.stagger-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
}

.stagger-leave-active {
  position: absolute;
}
</style>
