<template>
  <div class="space-y-8">


    <!-- Feed Content -->
    <div class="space-y-6 min-h-[600px] relative">
      <TransitionGroup name="stagger">
        <template v-for="activity in feedItems" :key="getFeedItemKey(activity)">
          <article
            v-if="activity.post_type === 'personal_insight'"
            class="personal-insight-card overflow-hidden rounded-2xl border p-4 shadow-2xl shadow-primary-500/5"
            :class="personalInsightToneClass"
          >
            <div class="flex items-start gap-3">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary-500/25 bg-primary-500/10 text-primary-500">
                <Sparkles class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary-500">
                    <Lock class="h-3 w-3" />
                    <span>{{ i18n.locale === 'es' ? 'Solo para ti' : 'Only for you' }}</span>
                  </div>
                  <div class="shrink-0 rounded-full border border-primary-500/25 bg-primary-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-primary-500">
                    {{ personalInsightStatusLabel }}
                  </div>
                </div>
                <h3 class="mt-1 text-base font-black leading-tight text-foreground">
                  {{ personalInsightTitle }}
                </h3>
                <p class="mt-2 text-sm font-bold leading-relaxed text-foreground/85">
                  {{ personalInsightPostLine }}
                </p>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <div
                v-for="stat in personalInsightInlineStats"
                :key="stat.label"
                class="personal-insight-chip"
                :class="stat.class"
              >
                <component :is="stat.icon" class="h-3 w-3" />
                <span>{{ stat.label }}</span>
              </div>
            </div>

            <button
              type="button"
              class="personal-insight-toggle mt-3"
              @click="showPersonalInsightDetails = !showPersonalInsightDetails"
            >
              <span>{{ showPersonalInsightDetails ? (i18n.locale === 'es' ? 'Ver menos' : 'Show less') : (i18n.locale === 'es' ? 'Ampliar stats' : 'Expand stats') }}</span>
              <ChevronDown class="h-3.5 w-3.5 transition-transform" :class="showPersonalInsightDetails ? 'rotate-180' : ''" />
            </button>

            <div v-if="showPersonalInsightDetails" class="mt-4 space-y-3 border-t border-white/10 pt-4">
              <p class="text-sm font-semibold leading-relaxed text-foreground/85">
                {{ personalInsightBody }}
              </p>

              <div class="rounded-xl border border-white/10 bg-black/10 px-3 py-2.5">
                <p class="text-xs font-black leading-relaxed text-foreground">
                  {{ personalInsightCoachLine }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div
                  v-for="metric in personalInsightMetrics"
                  :key="metric.label"
                  class="personal-metric rounded-xl border px-3 py-2"
                  :class="metric.class"
                >
                  <p class="text-[10px] font-black uppercase text-muted/60">{{ metric.label }}</p>
                  <p class="mt-1 text-lg font-black tabular-nums text-foreground">{{ metric.value }}</p>
                  <p class="mt-0.5 truncate text-[10px] font-bold text-muted/55">{{ metric.sub }}</p>
                </div>
              </div>

              <div v-if="personalInsightChips.length" class="flex flex-wrap gap-1.5">
                <div
                  v-for="chip in personalInsightChips"
                  :key="chip.text"
                  class="personal-insight-chip"
                  :class="chip.class"
                >
                  <component :is="chip.icon" class="h-3 w-3" />
                  <span>{{ chip.text }}</span>
                </div>
              </div>
            </div>
          </article>
          <ChallengeActivityCard
            v-else-if="activity.post_type === 'challenge'"
            :activity="activity"
          />
          <ActivityCard
            v-else-if="activity.post_type !== 'pvp'"
            :activity="activity" 
            :highlighted="isHighlighted(activity)"
            @toggleLike="handleLike(activity)"
            @commentAdded="handleComment"
            @viewProfile="$emit('viewProfile', $event)"
            @edit="openEditModal(activity)"
            @compare="openCompareModal(activity)"
            @challenge="openChallengeModal(activity)"
          />
          <PvpActivityCard
            v-else
            :activity="activity"
          />
        </template>
      </TransitionGroup>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-8">
        <ActivitySkeleton v-for="i in 3" :key="'skeleton-' + i" />
      </div>

      <!-- End of Feed -->
      <div v-if="finished && activities.length > 0" class="py-20 text-center space-y-4">
          <div class="w-1 h-20 bg-gradient-to-b from-primary-500/50 to-transparent mx-auto rounded-full"></div>
          <p class="text-xs font-medium text-muted/50">Ya estas al dia. Vuelve luego para ver nuevos entrenamientos.</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && feedItems.length === 0" class="py-24 px-6 text-center bg-surface/5 rounded-3xl border border-dashed border-border/20">
          <ZapOff class="w-12 h-12 text-muted/20 mx-auto mb-5" />
          <h3 class="text-xl font-semibold text-foreground tracking-tight mb-2">Todavia no hay entrenamientos</h3>
          <p class="text-sm text-muted max-w-xs mx-auto font-medium opacity-70">Sigue a mas atletas o registra tu primera serie para empezar a llenar la comunidad.</p>
      </div>

      <!-- Sentinel for Infinite Scroll -->
      <div ref="sentinel" class="h-10 w-full absolute bottom-0 opacity-0 pointer-events-none"></div>
    </div>

    <!-- Edit Modal (Teleported) -->
    <Teleport to="body">
      <div v-if="editingActivity" class="cursor-pointer fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md" @click.self="editingActivity = null">
        <div class="card-stats max-w-xl w-full p-6 md:p-12 border-border space-y-8 relative overflow-y-auto max-h-[90vh]">
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
                    <label class="text-[10px] font-black text-primary-500 uppercase tracking-widest pl-1">TITULO DEL POST</label>
                    <input v-model="editForm.title" type="text" placeholder="Ponle un título a tu entrenamiento..." class="w-full bg-foreground/[0.04] border border-border rounded-2xl px-6 py-4 text-sm font-black uppercase italic focus:outline-none focus:border-primary-500/50 transition-all" />
                </div>

                <div class="space-y-3">
                    <label class="text-[10px] font-black text-primary-500 uppercase tracking-widest pl-1">RESUMEN DE ACTIVIDAD</label>
                    <textarea v-model="editForm.description" rows="4" placeholder="¿Cómo fue el entrenamiento de hoy?" class="w-full bg-foreground/[0.04] border border-border rounded-3xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-primary-500/50 transition-all resize-none"></textarea>
                </div>
             </div>

             <button @click="saveEdit" 
                     class="w-full py-5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-primary-500/20 active:scale-[0.98]">
                UPDATE CORE REGISTRY
             </button>
        </div>
      </div>
    </Teleport>

    <!-- Comparison Modal (Teleported) -->
    <Teleport to="body">
       <UserCompareModal 
         :show="!!comparingUser" 
         :me="authStore.user" 
         :target="comparingUser" 
         @close="comparingUser = null" 
       />
    </Teleport>

    <!-- PvP Config Modal (Teleported) -->
    <Teleport to="body">
       <PvpConfigModal 
         :show="!!challengingUser" 
         :target="challengingUser" 
         @close="challengingUser = null" 
       />
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, reactive, watch } from 'vue';
import axios from 'axios';
import ActivityCard from '@/components/social/ActivityCard.vue';
import ActivitySkeleton from '@/components/social/ActivitySkeleton.vue';
import UserCompareModal from '@/components/modals/UserCompareModal.vue';
import PvpActivityCard from '@/components/social/PvpActivityCard.vue';
import ChallengeActivityCard from '@/components/social/ChallengeActivityCard.vue';
import PvpConfigModal from '@/components/modals/PvpConfigModal.vue';
import MiniActivityHeatmap from '@/components/training/MiniActivityHeatmap.vue';
import { BarChart3, ChevronDown, Flame, Lock, Sparkles, Target, TrendingUp, Trophy, Zap, ZapOff, X } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useI18nStore } from '@/stores/i18n';
import { useRoute } from 'vue-router';

const i18n = useI18nStore();

const props = defineProps({
    initialFilter: { type: String, default: 'global' }
});

const emit = defineEmits(['viewProfile']);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();

const activities = ref([]);
const personalInsight = ref(null);
const showPersonalInsightDetails = ref(false);
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

const comparingUser = ref(null);
const challengingUser = ref(null);
const isEs = computed(() => i18n.locale !== 'en');

const feedItems = computed(() => {
    if (!personalInsight.value) return activities.value;
    if (activities.value.length === 0) return [personalInsight.value];
    return [
        activities.value[0],
        personalInsight.value,
        ...activities.value.slice(1)
    ];
});

const getFeedItemKey = (activity) => {
    if (activity.post_type === 'personal_insight') return 'private-insight-' + activity.date + '-' + activity.exerciseType;
    if (activity.post_type === 'pvp') return 'pvp-' + activity.pvp_data.id;
    if (activity.post_type === 'challenge') return 'challenge-' + activity.pvp_data.id;
    return activity.summary_id || 'reps-' + activity.user_id + '-' + activity.date;
};

const safeTranslate = (key) => {
    const translated = i18n.t(key);
    return translated === key ? key : translated;
};

const signedNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
    const numeric = Number(value);
    return numeric > 0 ? `+${numeric}` : `${numeric}`;
};

const stablePick = (lines) => {
    const insight = personalInsight.value;
    if (!insight || !lines.length) return '';
    const seed = `${insight.exerciseType}-${insight.date}-${insight.count}-${insight.historyCount}`;
    const score = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return lines[score % lines.length];
};

const personalInsightExerciseLabel = computed(() => {
    const insight = personalInsight.value;
    if (!insight) return '';
    return safeTranslate(insight.titleKey || insight.exerciseType);
});

const personalInsightToneClass = computed(() => {
    const type = personalInsight.value?.insightType;
    return {
        record: 'personal-insight-record',
        above_average: 'personal-insight-strong',
        beat_previous: 'personal-insight-strong',
        trend_up: 'personal-insight-trend',
        steady: 'personal-insight-steady',
        baseline: 'personal-insight-baseline',
    }[type] || 'personal-insight-baseline';
});

const personalInsightStatusLabel = computed(() => {
    const type = personalInsight.value?.insightType;
    const labels = {
        record: isEs.value ? 'Record' : 'Record',
        above_average: isEs.value ? 'Buff' : 'Buff',
        beat_previous: isEs.value ? 'Mejora' : 'Upgrade',
        trend_up: isEs.value ? 'Tendencia' : 'Trend',
        steady: isEs.value ? 'Coach' : 'Coach',
        baseline: isEs.value ? 'Base' : 'Base',
    };
    return labels[type] || labels.baseline;
});

const personalInsightTitle = computed(() => {
    const insight = personalInsight.value;
    if (!insight) return '';
    if (insight.insightType === 'record') {
        return isEs.value
            ? `Nuevo record en ${personalInsightExerciseLabel.value}`
            : `New record in ${personalInsightExerciseLabel.value}`;
    }
    if (insight.insightType === 'above_average') {
        return isEs.value
            ? `Has superado tu media en ${personalInsightExerciseLabel.value}`
            : `You beat your average in ${personalInsightExerciseLabel.value}`;
    }
    if (insight.insightType === 'beat_previous') {
        return isEs.value
            ? `Mejor que tu ultimo intento en ${personalInsightExerciseLabel.value}`
            : `Better than your last ${personalInsightExerciseLabel.value} run`;
    }
    if (insight.insightType === 'trend_up') {
        return isEs.value
            ? `La tendencia sube en ${personalInsightExerciseLabel.value}`
            : `${personalInsightExerciseLabel.value} trend is rising`;
    }
    return isEs.value
        ? `${personalInsightExerciseLabel.value}: progreso registrado`
        : `${personalInsightExerciseLabel.value}: progress logged`;
});

const personalInsightBody = computed(() => {
    const insight = personalInsight.value;
    if (!insight) return '';
    if (insight.historyCount === 0) {
        return isEs.value
            ? `Primer registro de ${personalInsightExerciseLabel.value}: ${insight.count} reps. El tutorial ya esta hecho; ahora empieza la build.`
            : `First ${personalInsightExerciseLabel.value} log: ${insight.count} reps. Tutorial cleared; now the build begins.`;
    }
    if (insight.insightType === 'record') {
        const previousBit = insight.previousDelta
            ? (isEs.value ? ` Tambien son ${signedNumber(insight.previousDelta)} vs tu ultima sesion.` : ` That is also ${signedNumber(insight.previousDelta)} vs your last session.`)
            : '';
        return isEs.value
            ? `Tu mejor marca anterior era ${insight.previousBest}. Hoy hiciste ${insight.count}.${previousBit} El boss acaba de mirar la barra de vida con miedo.`
            : `Your previous best was ${insight.previousBest}. Today you hit ${insight.count}.${previousBit} The boss just checked its health bar.`;
    }
    if (insight.insightType === 'above_average') {
        const percent = insight.percentOverAverage ? ` (${insight.percentOverAverage}% mas)` : '';
        return isEs.value
            ? `Hiciste ${insight.count} reps; tu media es ${insight.averageCount}. +${insight.delta}${percent} por encima de tu version habitual.`
            : `You hit ${insight.count} reps; your average is ${insight.averageCount}. +${insight.delta}${percent} above your usual self.`;
    }
    if (insight.insightType === 'beat_previous') {
        return isEs.value
            ? `La media de este ejercicio sigue en ${insight.averageCount}, pero ganaste el duelo contra tu ultimo intento: ${insight.previousCount} -> ${insight.count}.`
            : `Your average is still ${insight.averageCount}, but you beat your last run: ${insight.previousCount} -> ${insight.count}.`;
    }
    if (insight.insightType === 'trend_up') {
        return isEs.value
            ? `No fue record, pero tu media de las ultimas ${insight.recentSample} sesiones era ${insight.recentAverage}. Hoy empujaste ${signedNumber(insight.recentDelta)} por encima de esa linea.`
            : `Not a record, but your last ${insight.recentSample}-session average was ${insight.recentAverage}. Today you pushed ${signedNumber(insight.recentDelta)} above that line.`;
    }
    return isEs.value
        ? `Hiciste ${insight.count} reps. Media: ${insight.averageCount}; mejor previa: ${insight.previousBest}. No todo progreso rompe records: algunos dias construyen la base.`
        : `You hit ${insight.count} reps. Average: ${insight.averageCount}; previous best: ${insight.previousBest}. Not every gain breaks records; some days build the base.`;
});

const personalInsightPostLine = computed(() => {
    const insight = personalInsight.value;
    if (!insight) return '';
    if (insight.historyCount === 0) {
        return isEs.value
            ? `${insight.count} reps registradas. Ya tienes una sombra que superar.`
            : `${insight.count} reps logged. You now have a shadow to beat.`;
    }
    if (insight.insightType === 'record') {
        return isEs.value
            ? `${insight.count} reps. Record anterior: ${insight.previousBest}.`
            : `${insight.count} reps. Previous record: ${insight.previousBest}.`;
    }
    if (insight.delta > 0) {
        return isEs.value
            ? `${insight.count} reps, ${signedNumber(insight.delta)} sobre tu media.`
            : `${insight.count} reps, ${signedNumber(insight.delta)} over your average.`;
    }
    if (insight.previousDelta > 0) {
        return isEs.value
            ? `${insight.count} reps, ${signedNumber(insight.previousDelta)} contra tu ultimo intento.`
            : `${insight.count} reps, ${signedNumber(insight.previousDelta)} against your last run.`;
    }
    return isEs.value
        ? `${insight.count} reps. Partida viva, XP sumada.`
        : `${insight.count} reps. Run alive, XP added.`;
});

const personalInsightInlineStats = computed(() => {
    const insight = personalInsight.value;
    if (!insight) return [];
    const stats = [
        {
            label: `${insight.count} ${isEs.value ? 'reps' : 'reps'}`,
            icon: Flame,
            class: 'chip-primary',
        },
    ];

    if (insight.isPersonalRecord) {
        stats.push({
            label: isEs.value ? 'nuevo record' : 'new record',
            icon: Trophy,
            class: 'chip-record',
        });
    } else if (insight.delta > 0) {
        stats.push({
            label: `${signedNumber(insight.delta)} ${isEs.value ? 'vs media' : 'vs avg'}`,
            icon: TrendingUp,
            class: 'chip-good',
        });
    } else if (insight.previousDelta > 0) {
        stats.push({
            label: `${signedNumber(insight.previousDelta)} ${isEs.value ? 'vs anterior' : 'vs previous'}`,
            icon: Target,
            class: 'chip-good',
        });
    } else if (insight.averageCount) {
        stats.push({
            label: `${insight.averageCount} ${isEs.value ? 'media' : 'avg'}`,
            icon: BarChart3,
            class: 'chip-muted',
        });
    }

    if (insight.percentile) {
        stats.push({
            label: `P${insight.percentile}`,
            icon: BarChart3,
            class: insight.percentile >= 75 ? 'chip-good' : 'chip-muted',
        });
    } else if (insight.dayDamage > 0) {
        stats.push({
            label: `${insight.dayDamage} dmg`,
            icon: Zap,
            class: 'chip-primary',
        });
    }

    return stats.slice(0, 3);
});

const personalInsightCoachLine = computed(() => {
    const type = personalInsight.value?.insightType || 'baseline';
    const lines = {
        record: isEs.value
            ? [
                'El boss acaba de descubrir que tenias segunda fase.',
                'Eso no fue una serie: fue un parche de poder aplicado en directo.',
                'Tu yo anterior puso el record. Tu yo de hoy lo convirtio en tutorial.',
              ]
            : [
                'The boss just learned you had a second phase.',
                'That was not a set; that was a live power patch.',
                'Your old self set the record. Today you turned it into the tutorial.',
              ],
        above_average: isEs.value
            ? [
                'Tu version media acaba de perder el PvP contra ti.',
                'La barra subio porque tu estandar subio.',
                'No fue suerte: tu linea base se esta moviendo.',
              ]
            : [
                'Your average self just lost the PvP against you.',
                'The bar moved because your standard moved.',
                'Not luck: your baseline is shifting.',
              ],
        beat_previous: isEs.value
            ? [
                'No fue record global; fue algo mejor: victoria contra tu ultimo intento.',
                'La build no siempre explota. A veces sube un punto y cambia todo.',
                'Tu ultimo fantasma acaba de quedarse atras.',
              ]
            : [
                'Not an all-time record; something better: a win over your last attempt.',
                'The build does not always explode. Sometimes one point changes everything.',
                'Your last ghost just fell behind.',
              ],
        trend_up: isEs.value
            ? [
                'La curva apunta arriba. Si repites esto, el record empieza a temblar.',
                'Tendencia verde: pequeno buff hoy, gran desbloqueo despues.',
                'Tus ultimas sesiones ya estan avisando: viene subida.',
              ]
            : [
                'The curve points up. Repeat this and the record starts shaking.',
                'Green trend: small buff today, big unlock later.',
                'Your last sessions are already warning us: a climb is coming.',
              ],
        steady: isEs.value
            ? [
                'Hoy no fue cinematica de record. Fue forja, y la forja cuenta.',
                'Mantener la partida viva tambien es habilidad.',
                'La constancia es el item legendario que no se ve hasta que miras atras.',
              ]
            : [
                'Today was not a record cutscene. It was forging, and forging counts.',
                'Keeping the run alive is also a skill.',
                'Consistency is the legendary item you only see when you look back.',
              ],
        baseline: isEs.value
            ? [
                'Primer dato guardado. Ahora tienes una sombra que superar.',
                'Base creada. La siguiente carga ya tiene objetivo.',
                'Tutorial completado: a partir de aqui todo suma build.',
              ]
            : [
                'First data saved. Now you have a shadow to beat.',
                'Base created. The next load has a target now.',
                'Tutorial cleared: from here, every rep builds the character.',
              ],
    };
    return stablePick(lines[type] || lines.baseline);
});

const personalInsightMetrics = computed(() => {
    const insight = personalInsight.value;
    if (!insight) return [];
    return [
        {
            label: isEs.value ? 'Ultimo' : 'Latest',
            value: insight.count,
            sub: personalInsightExerciseLabel.value,
            class: 'metric-primary',
        },
        {
            label: isEs.value ? 'Tu media' : 'Average',
            value: insight.averageCount || '-',
            sub: insight.historyCount ? `${insight.historyCount} ${isEs.value ? 'registros' : 'logs'}` : (isEs.value ? 'sin historial' : 'no history'),
            class: insight.delta > 0 ? 'metric-good' : 'metric-neutral',
        },
        {
            label: isEs.value ? 'Mejor previa' : 'Prev best',
            value: insight.previousBest || '-',
            sub: insight.isPersonalRecord ? (isEs.value ? 'superada' : 'beaten') : (isEs.value ? 'marca a batir' : 'target'),
            class: insight.isPersonalRecord ? 'metric-record' : 'metric-neutral',
        },
        {
            label: isEs.value ? 'Percentil' : 'Percentile',
            value: insight.percentile ? `P${insight.percentile}` : 'Base',
            sub: insight.isPersonalRecord
                ? (isEs.value ? 'mejor personal' : 'personal best')
                : (insight.historyCount >= 5 && insight.topPercent ? `Top ${insight.topPercent}%` : (insight.historyCount ? `${insight.historyCount + 1} ${isEs.value ? 'muestras' : 'samples'}` : (isEs.value ? 'primer dato' : 'first data'))),
            class: insight.percentile >= 75 ? 'metric-good' : 'metric-neutral',
        },
    ];
});

const personalInsightChips = computed(() => {
    const insight = personalInsight.value;
    if (!insight) return [];
    const chips = [];

    if (insight.historyCount === 0) {
        chips.push({
            text: isEs.value ? 'primer registro' : 'first log',
            icon: Sparkles,
            class: 'chip-primary',
        });
    }

    if (insight.delta > 0) {
        chips.push({
            text: `${signedNumber(insight.delta)} ${isEs.value ? 'vs media' : 'vs avg'}`,
            icon: TrendingUp,
            class: 'chip-good',
        });
    }

    if (insight.percentOverAverage > 0) {
        chips.push({
            text: `+${insight.percentOverAverage}% ${isEs.value ? 'sobre media' : 'over avg'}`,
            icon: BarChart3,
            class: 'chip-good',
        });
    }

    if (insight.previousDelta !== null && insight.previousDelta !== undefined && insight.previousCount > 0) {
        chips.push({
            text: `${signedNumber(insight.previousDelta)} ${isEs.value ? 'vs anterior' : 'vs previous'}`,
            icon: Target,
            class: insight.previousDelta > 0 ? 'chip-good' : 'chip-muted',
        });
    }

    if (insight.recentDelta !== null && insight.recentDelta !== undefined && insight.recentSample >= 3) {
        chips.push({
            text: `${signedNumber(insight.recentDelta)} ${isEs.value ? `vs ult. ${insight.recentSample}` : `vs last ${insight.recentSample}`}`,
            icon: BarChart3,
            class: insight.recentDelta > 0 ? 'chip-good' : 'chip-muted',
        });
    }

    if (insight.dayDamage > 0) {
        chips.push({
            text: `${insight.dayDamage} ${isEs.value ? 'dmg hoy' : 'dmg today'}`,
            icon: Zap,
            class: 'chip-primary',
        });
    }

    if (insight.dayTotalReps > insight.count) {
        chips.push({
            text: `${insight.dayTotalReps} ${isEs.value ? 'reps hoy' : 'reps today'}`,
            icon: Flame,
            class: 'chip-primary',
        });
    }

    if (insight.daysSincePrevious > 2) {
        chips.push({
            text: isEs.value ? `respawn ${insight.daysSincePrevious}d` : `${insight.daysSincePrevious}d respawn`,
            icon: Trophy,
            class: 'chip-muted',
        });
    }

    return chips.slice(0, 5);
});

const fetchPersonalInsight = async () => {
    if (!authStore.isAuthenticated) return;
    try {
        const res = await axios.get('/api/social-feed/personal-insight');
        personalInsight.value = res.data ? { ...res.data, post_type: 'personal_insight' } : null;
        showPersonalInsightDetails.value = false;
    } catch (e) {
        console.error('Error fetching personal insight:', e);
    }
};

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

        if (res.data.liked) {
            notificationStore.notify('🔥 +5 CARISMA XP', 'success');
            authStore.fetchProfile();
        }
    } catch (e) {
        console.error('Error liking:', e);
    }
};

const handleComment = (activity) => {
    notificationStore.notify('💬 COMENTARIO REGISTRADO', 'success');
    authStore.fetchProfile(); // Charisma XP update
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
        notificationStore.notify('Failed to update registry', 'error');
    }
};

const openCompareModal = async (activity) => {
    // If we only have basic info from the card, we might want to fetch full stats
    // But ActivityCard already has most stats from the query update in social_feed.js
    comparingUser.value = activity;
};

const openChallengeModal = (activity) => {
    challengingUser.value = activity;
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
    fetchPersonalInsight();

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

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated) {
        fetchPersonalInsight();
    } else {
        personalInsight.value = null;
    }
});

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

.personal-insight-card {
  position: relative;
  border-color: hsl(var(--primary) / 0.28);
  background:
    linear-gradient(135deg, hsl(var(--primary) / 0.16), rgb(16 185 129 / 0.08)),
    hsl(var(--surface) / 0.5);
}

.personal-insight-record {
  border-color: rgb(245 158 11 / 0.5);
  background:
    linear-gradient(135deg, rgb(245 158 11 / 0.16), hsl(var(--primary) / 0.12)),
    hsl(var(--surface) / 0.55);
}

.personal-insight-strong {
  border-color: rgb(16 185 129 / 0.35);
  background:
    linear-gradient(135deg, hsl(var(--primary) / 0.16), rgb(16 185 129 / 0.11)),
    hsl(var(--surface) / 0.55);
}

.personal-insight-trend {
  border-color: rgb(56 189 248 / 0.34);
  background:
    linear-gradient(135deg, rgb(56 189 248 / 0.12), hsl(var(--primary) / 0.11)),
    hsl(var(--surface) / 0.55);
}

.personal-insight-steady,
.personal-insight-baseline {
  border-color: hsl(var(--primary) / 0.25);
}

.personal-insight-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent, hsl(var(--primary) / 0.12), transparent);
  opacity: 0.45;
}

.personal-insight-card > * {
  position: relative;
  z-index: 1;
}

.personal-metric {
  background: rgb(255 255 255 / 0.04);
  border-color: rgb(255 255 255 / 0.1);
}

.metric-primary {
  border-color: hsl(var(--primary) / 0.28);
  background: hsl(var(--primary) / 0.1);
}

.metric-good {
  border-color: rgb(16 185 129 / 0.28);
  background: rgb(16 185 129 / 0.1);
}

.metric-record {
  border-color: rgb(245 158 11 / 0.35);
  background: rgb(245 158 11 / 0.11);
}

.metric-neutral {
  border-color: rgb(255 255 255 / 0.1);
}

.personal-insight-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 0.65rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(255 255 255 / 0.04);
  padding: 0.35rem 0.5rem;
  color: hsl(var(--muted));
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.chip-good {
  border-color: rgb(16 185 129 / 0.28);
  background: rgb(16 185 129 / 0.1);
  color: rgb(110 231 183);
}

.chip-record {
  border-color: rgb(245 158 11 / 0.35);
  background: rgb(245 158 11 / 0.12);
  color: rgb(252 211 77);
}

.chip-primary {
  border-color: hsl(var(--primary) / 0.28);
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.chip-muted {
  border-color: rgb(255 255 255 / 0.1);
  color: hsl(var(--muted) / 0.8);
}

.personal-insight-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 0.65rem;
  border: 1px solid hsl(var(--primary) / 0.22);
  background: hsl(var(--primary) / 0.08);
  padding: 0.45rem 0.65rem;
  color: hsl(var(--primary));
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.personal-insight-toggle:hover {
  border-color: hsl(var(--primary) / 0.38);
  background: hsl(var(--primary) / 0.12);
}

.personal-insight-toggle:active {
  transform: scale(0.97);
}
</style>
