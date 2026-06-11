<template>
  <div class="max-w-7xl mx-auto w-full px-4 space-y-4 sm:space-y-6 pb-24 pt-2 sm:pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- ░ FRONTLINE — the home is the battle ░ -->
    <div class="max-w-md mx-auto w-full">

      <!-- Slim top actions -->
      <div class="flex items-center justify-end gap-2 mb-4">
        <button type="button" class="fl-action" @click="showWeeklyCard = true">
          <Share2 class="w-3.5 h-3.5" aria-hidden="true" />
          {{ i18n.t('dash_my_week') }}
        </button>
        <button
          v-if="guidedTrainingStateLoaded && !trainingStore.activePlan"
          type="button"
          class="fl-action"
          @click="openPlanPicker"
        >
          {{ i18n.t('dash_guided_plan') }}
        </button>
      </div>

      <!-- 01 — COMBAT: the community boss, alive at the top -->
      <button
        v-if="bossData"
        type="button"
        class="w-full text-left block group"
        @click="showAdvancedStats = true"
      >
        <div class="flex items-center justify-between mb-2.5">
          <span class="fl-index">01 — {{ i18n.t('fl_sec_combat') }}</span>
          <span class="fl-mono text-[10px] tracking-[0.12em] text-red-400 border border-red-500/40 px-1.5 py-0.5">{{ bossTag }}</span>
        </div>
        <h2 class="text-2xl sm:text-[1.7rem] font-bold uppercase tracking-tight text-foreground leading-none group-hover:text-primary-400 transition-colors">{{ bossData.name }}</h2>
        <p class="fl-mono text-[10.5px] tracking-[0.14em] text-muted/60 mt-1.5">{{ i18n.t('fl_boss_global') }}</p>
        <div class="flex gap-0.5 mt-3 h-2.5">
          <div class="bg-red-500" :style="{ flexGrow: bossHpPercent }"></div>
          <div class="bg-red-950/50" :style="{ flexGrow: 100 - bossHpPercent }"></div>
        </div>
        <div class="flex justify-between mt-2">
          <span class="fl-mono text-[11px] text-primary-400">{{ i18n.t('fl_boss_damage_today') }} · {{ formatCompact(bossDailyDamage) }}</span>
          <span class="fl-mono text-[11px] text-muted/60">{{ formatCompact(bossHpRemaining) }} {{ i18n.t('fl_boss_hp_left') }}</span>
        </div>
      </button>

      <div v-if="bossData" class="fl-rule my-4"></div>

      <!-- 02 — ATTACK: pick exercise, see today, log -->
      <section
        v-if="!trainingStore.todayWorkout || showFreeLog"
        ref="repsInputSection"
        class="transition-all duration-500"
        :class="highlightRepsInput ? 'ring-2 ring-primary-500/60' : ''"
      >
        <span class="fl-index">02 — {{ i18n.t('fl_sec_attack') }}</span>

        <!-- Exercise switcher -->
        <div class="flex items-center justify-between gap-2 mt-3 mb-3.5">
          <button type="button" class="text-muted/40 hover:text-foreground active:scale-90 transition-colors" :aria-label="i18n.t('fl_prev_exercise')" @click="switchExercise(-1)">
            <ChevronLeft class="w-6 h-6" />
          </button>
          <span class="flex-1 min-w-0 text-center text-[1.7rem] font-bold uppercase tracking-tight text-foreground leading-none truncate">{{ activeExerciseLabel }}</span>
          <button type="button" class="text-muted hover:text-foreground active:scale-90 transition-colors" :aria-label="i18n.t('fl_next_exercise')" @click="switchExercise(1)">
            <ChevronRight class="w-6 h-6" />
          </button>
        </div>

        <!-- Typographic day progress (no ring) -->
        <div class="flex items-baseline gap-2">
          <span class="fl-mono text-[2rem] font-bold leading-none text-foreground tabular-nums">{{ todayProgress }}</span>
          <span class="fl-mono text-sm font-semibold text-muted/60">/ {{ stats.dailyGoal }} {{ i18n.t('fl_today') }}</span>
        </div>
        <div class="flex gap-0.5 mt-2 mb-4 h-[3px]">
          <div class="bg-primary-500" :style="{ flexGrow: dayRingPercent }"></div>
          <div class="bg-foreground/10" :style="{ flexGrow: 100 - dayRingPercent }"></div>
        </div>

        <!-- Attack CTA (square, brutalist) -->
        <button
          type="button"
          @click="openLogSheet"
          class="w-full flex items-center justify-between bg-primary-500 hover:bg-primary-400 active:bg-primary-600 px-5 py-4 text-white transition-colors active:scale-[0.99]"
        >
          <span class="text-[15px] font-bold uppercase tracking-[0.04em]">{{ i18n.t('dash_log_reps_cta') }}</span>
          <ArrowRight class="w-5 h-5" />
        </button>
      </section>

      <div class="fl-rule my-4"></div>

      <!-- 03 — LOADOUT: cockpit stats -->
      <section>
        <span class="fl-index">03 — {{ i18n.t('fl_sec_loadout') }}</span>
        <div class="flex mt-3">
          <div class="flex-1 min-w-0 pr-3">
            <div class="fl-mono text-[9.5px] tracking-[0.16em] text-muted/60">{{ i18n.t('fl_stat_power') }}</div>
            <div class="fl-mono text-2xl font-bold text-foreground mt-1 tabular-nums truncate">{{ formatCompact(stats.combatPower.total) }}</div>
          </div>
          <div class="fl-divider"></div>
          <div class="flex-1 min-w-0 px-3">
            <div class="fl-mono text-[9.5px] tracking-[0.16em] text-muted/60">{{ i18n.t('fl_stat_streak') }}</div>
            <div class="fl-mono text-2xl font-bold text-primary-400 mt-1 tabular-nums">{{ streakStatus?.streak || 0 }}<span class="text-sm text-muted/60"> {{ i18n.t('fl_days_short') }}</span></div>
          </div>
          <div class="fl-divider"></div>
          <div class="flex-1 min-w-0 pl-3">
            <div class="fl-mono text-[9.5px] tracking-[0.16em] text-muted/60">{{ i18n.t('fl_stat_volume') }}</div>
            <div class="fl-mono text-2xl font-bold text-foreground mt-1 tabular-nums truncate">{{ ((stats.totalVolume || 0) / 1000).toFixed(1) }}</div>
          </div>
        </div>
      </section>

      <!-- Streak at-risk alert (retention: keep the freeze CTA prominent) -->
      <div
        v-if="streakStatus && streakStatus.isAtRisk && !streakStatus.frozenToday"
        class="mt-4 flex items-center gap-3 border border-amber-500/40 bg-amber-500/[0.08] px-4 py-3"
      >
        <Flame class="h-5 w-5 text-amber-400 shrink-0" aria-hidden="true" />
        <p class="flex-1 min-w-0 text-xs font-medium text-amber-300">{{ streakStateLabel }}</p>
        <button
          type="button"
          class="fl-mono shrink-0 text-[11px] uppercase tracking-wide border border-amber-500/50 bg-amber-500/15 text-amber-200 px-3 py-2 disabled:opacity-40 active:scale-95 transition-transform"
          :disabled="!streakStatus.canFreeze || freezingStreak"
          @click="freezeStreak"
        >
          {{ freezeButtonLabel }}
        </button>
      </div>
    </div>

    <TodayWorkout
      v-if="shouldShowTodayWorkout"
      :workout="trainingStore.todayWorkout"
      :completed-today="trainingStore.completedToday"
      :next-workout-preview="trainingStore.nextWorkoutPreview"
      :active-plan="trainingStore.activePlan"
      @completed="handleGuidedWorkoutCompleted"
    />

    <section
      v-if="shouldShowActivePlanCard"
      class="rounded-2xl border border-border/60 bg-foreground/[0.02] p-3 sm:p-4"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="text-xs font-semibold text-muted">
            {{ i18n.t('dash_active_plan') }}
          </p>
          <p class="mt-1 text-sm font-bold text-foreground">
            {{ i18n.t(trainingStore.activePlan.titleKey) }}
            <span v-if="trainingStore.isPlanPaused" class="text-amber-400">· {{ i18n.t('dash_plan_paused') }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="trainingStore.isPlanPaused"
            type="button"
            class="plan-action"
            @click="resumePlan"
          >
            {{ i18n.t('dash_plan_resume') }}
          </button>
          <button
            v-else
            type="button"
            class="plan-action"
            @click="pausePlan"
          >
            {{ i18n.t('dash_plan_pause') }}
          </button>
          <button type="button" class="plan-action" @click="openPlanPicker">
            {{ i18n.t('dash_plan_change') }}
          </button>
          <button type="button" class="plan-action text-red-300 hover:text-red-200" @click="abandonPlan">
            {{ i18n.t('dash_plan_abandon') }}
          </button>
        </div>
      </div>
    </section>

    <section
      v-else-if="shouldShowPlanPromo"
      class="relative rounded-2xl border border-primary-500/30 bg-primary-500/[0.07] p-4 sm:p-5"
    >
      <button
        type="button"
        class="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg border border-border bg-foreground/[0.04] text-muted transition hover:text-foreground active:scale-95"
        :aria-label="i18n.t('dash_plan_promo_hide')"
        @click="dismissPlanPromo"
      >
        <X aria-hidden="true" class="h-4 w-4" />
      </button>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0 pr-8 sm:pr-0">
          <p class="text-xs font-semibold text-primary-500">
            {{ i18n.t('dash_plan_promo_kicker') }}
          </p>
          <h3 class="mt-1.5 text-xl font-bold tracking-tight leading-tight text-foreground">
            {{ i18n.t('dash_plan_promo_title') }}
          </h3>
          <p class="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted/75">
            {{ i18n.t('dash_plan_promo_desc') }}
          </p>
        </div>
        <button type="button" class="btn-reppy w-full px-5 sm:w-auto" @click="openPlanPicker">
          {{ i18n.t('dash_plan_promo_cta') }}
        </button>
      </div>
    </section>

    <div v-if="shouldShowFreeLogToggle" class="flex justify-center">
      <button
        type="button"
        class="rounded-xl border border-border bg-foreground/[0.03] px-4 py-2 text-xs font-semibold text-muted transition hover:border-primary-500/30 hover:text-foreground active:scale-95"
        @click="showFreeLog = !showFreeLog"
      >
        {{ i18n.t('today_free_log') }}
      </button>
    </div>

    <!-- Mission card skeleton -->
    <div
      v-if="isLoading && !todayMissionStateLoaded"
      class="w-full rounded-2xl border border-primary-500/25 bg-primary-500/10 p-4 sm:p-6 animate-pulse"
    >
      <div class="space-y-3">
        <div class="h-2 w-20 bg-foreground/10 rounded"></div>
        <div class="h-6 w-3/4 bg-foreground/10 rounded-lg"></div>
        <div class="h-2 w-full bg-foreground/5 rounded"></div>
        <div class="h-2 w-2/3 bg-foreground/5 rounded"></div>
        <div class="h-2 w-full bg-foreground/10 rounded-full mt-4"></div>
      </div>
    </div>

    <section
      v-else-if="shouldShowTodayMissionCard"
      class="w-full rounded-2xl border p-4 sm:p-5 transition-all duration-500"
      :class="missionCompletionPulse ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-primary-500/25 bg-primary-500/[0.07]'"
    >
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="flex-1 min-w-0 space-y-2">
          <p class="text-xs font-semibold text-primary-500">
            {{ i18n.t('dash_today_mission') }}
          </p>
          <h3 class="text-lg font-bold tracking-tight text-foreground leading-tight">
            {{ todayMissionTitle }}
          </h3>
          <p class="text-xs text-muted/70 leading-relaxed">
            {{ todayMissionHowTo }}
          </p>
          <div class="space-y-1.5 pt-1">
            <div class="flex items-center justify-between text-xs font-medium">
              <span class="text-muted">{{ todayMissionProgressLabel }}</span>
              <span :class="isDailyObjectiveDone ? 'text-emerald-500' : 'text-primary-500'">{{ todayMissionPercent }}%</span>
            </div>
            <div class="h-2 rounded-full bg-foreground/10 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="isDailyObjectiveDone ? 'bg-emerald-500' : 'bg-primary-500'"
                :style="{ width: `${todayMissionPercent}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 lg:flex-col lg:items-end lg:justify-center">
          <div class="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Coins aria-hidden="true" class="w-4 h-4 text-primary-500 shrink-0" />
            <span>{{ todayMissionRewardLabel }}</span>
          </div>
          <button
            @click="handleTodayMissionAction"
            class="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95"
            :class="isDailyObjectiveDone ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-primary-500 hover:bg-primary-400'"
          >
            {{ todayMissionActionLabel }}
          </button>
        </div>
      </div>
    </section>

    <!-- Disclosure: heavy progress + boss section, collapsed by default (Momentum: home stays light) -->
    <div>
      <button
        @click="showAdvancedStats = !showAdvancedStats"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.05] text-sm font-semibold text-muted hover:text-foreground transition-all active:scale-[0.98]"
      >
        <BarChart3 aria-hidden="true" class="w-4 h-4" />
        {{ showAdvancedStats ? i18n.t('dash_stats_hide') : i18n.t('dash_stats_boss_toggle') }}
        <ChevronDown aria-hidden="true" class="w-4 h-4 transition-transform duration-200" :class="showAdvancedStats ? 'rotate-180' : ''" />
      </button>
    </div>

    <!-- Stats & boss (collapsed until toggled, all breakpoints) -->
    <section v-show="showAdvancedStats" class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <!-- Boss Intel -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center gap-2 px-1">
          <Zap aria-hidden="true" class="w-4 h-4 text-primary-500" />
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted/70">{{ i18n.t('dash_boss_status') }}</h3>
        </div>

        <LivePresence class="mb-2" />

        <BossHealth ref="bossHealthRef" />
      </div>

      <!-- Metrics -->
      <div class="space-y-4">
         <!-- Combat Power (condensed) -->
         <div class="card-stats">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-primary-500">{{ i18n.t('ui_combat_power') }}</span>
              <Sword aria-hidden="true" class="w-4 h-4 text-primary-500" />
            </div>

            <div class="mt-3">
              <div v-if="isLoading" class="h-9 w-32 bg-foreground/10 rounded-xl animate-pulse"></div>
              <template v-else>
                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-bold text-foreground tabular-nums">{{ stats.combatPower.minDamage }}–{{ stats.combatPower.maxDamage }}</span>
                  <span class="text-[10px] font-semibold text-muted/60 uppercase tracking-wide">{{ i18n.t('ui_dmg_range') }}</span>
                </div>
                <p class="mt-1 text-xs text-muted/60">
                  {{ i18n.t('ui_avg_estimated') }}: <span class="font-semibold text-foreground/80">{{ stats.combatPower.total }}</span>
                  <span class="text-muted/60">
                    · {{ i18n.t('dash_base_skill') }} {{ stats.combatPower.base }} · {{ i18n.t('dash_gear_bonus') }} +{{ stats.combatPower.gear }}<template v-if="stats.combatPower.buff > 0"> · {{ i18n.t('dash_active_buffs') }} +{{ stats.combatPower.buff }}</template>
                  </span>
                </p>
              </template>
            </div>

            <!-- Active potion timer (sober) -->
            <div v-for="boost in activePotions" :key="boost.type" class="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
              <div class="flex items-center gap-2 min-w-0">
                <FlaskConical aria-hidden="true" class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span class="text-xs font-semibold text-emerald-500 truncate">{{ boost.label }} {{ boost.value }}</span>
              </div>
              <span class="text-[10px] font-semibold text-foreground tabular-nums shrink-0">{{ boost.timeLeft }}</span>
            </div>
         </div>

         <div class="grid grid-cols-2 gap-4">
            <!-- Total reps -->
            <div class="card-stats">
              <Activity aria-hidden="true" class="w-4 h-4 text-primary-500" />
              <div class="mt-3">
                <div v-if="isLoading" class="h-7 w-16 bg-foreground/10 rounded-lg animate-pulse"></div>
                <span v-else class="text-2xl font-bold text-foreground tabular-nums">{{ totalReps }}</span>
                <p class="text-xs text-muted/60 mt-0.5">{{ i18n.t('dash_total_reps') }}</p>
              </div>
            </div>
            <!-- Tonnage -->
            <div class="card-stats">
              <Trophy aria-hidden="true" class="w-4 h-4 text-primary-500" />
              <div class="mt-3">
                <div v-if="isLoading" class="h-7 w-16 bg-foreground/10 rounded-lg animate-pulse"></div>
                <span v-else class="text-2xl font-bold text-foreground tabular-nums">{{ ((stats.totalVolume || 0) / 1000).toFixed(1) }}</span>
                <p class="text-xs text-muted/60 mt-0.5">{{ i18n.t('dash_tons_moved') }}</p>
              </div>
            </div>
         </div>

         <!-- Missions Entry Point -->
         <button
          type="button"
          @click="router.push({ name: 'missions', params: { lang: i18n.locale } })"
          class="card-stats w-full text-left !bg-indigo-500/10 hover:!border-indigo-500/40 transition-all active:scale-[0.99]"
         >
            <div class="flex items-center justify-between">
              <Target aria-hidden="true" class="w-4 h-4 text-indigo-400" />
              <span v-if="unclaimedMissions > 0" class="px-2 py-0.5 bg-indigo-500 text-[10px] font-bold text-white uppercase rounded-full animate-pulse">
                {{ unclaimedMissions }} {{ i18n.t('missions_available') || 'READY' }}
              </span>
            </div>
            <div class="mt-3">
              <span class="text-lg font-bold tracking-tight text-foreground">{{ i18n.t('nav_missions') }}</span>
              <p class="text-xs text-muted/60 mt-0.5">{{ i18n.t('missions_subtitle') }}</p>
            </div>
         </button>
      </div>
    </section>

    <!-- Analytics: activity heatmap / history (follows disclosure) -->
    <section v-show="showAdvancedStats" class="space-y-4">
      <div class="flex items-center gap-1 p-1 bg-foreground/[0.04] border border-border/60 rounded-xl w-fit mx-auto">
        <button
          @click="activeTab = 'heatmap'"
          class="px-5 py-2 rounded-lg text-xs font-semibold transition-all"
          :class="activeTab === 'heatmap' ? 'bg-primary-500 text-white shadow-sm' : 'text-muted hover:text-foreground'"
        >
          {{ i18n.t('activity_stream') }}
        </button>
        <button
          @click="activeTab = 'history'"
          class="px-5 py-2 rounded-lg text-xs font-semibold transition-all"
          :class="activeTab === 'history' ? 'bg-primary-500 text-white shadow-sm' : 'text-muted hover:text-foreground'"
        >
          {{ i18n.t('dash_history_title') }}
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="activeTab === 'heatmap'" key="heatmap" class="bg-surface/5 border border-border/60 rounded-2xl p-4 sm:p-6">
          <!-- Cold start: a new user sees guidance instead of an empty grid -->
          <div v-if="!isLoading && !totalReps && !heatmapData.length" class="py-10 px-6 text-center">
            <Flame aria-hidden="true" class="w-10 h-10 mx-auto mb-3 text-muted/30" />
            <p class="text-sm font-semibold text-foreground">{{ i18n.t('dash_heatmap_empty_title') }}</p>
            <p class="text-xs text-muted/60 mt-1 max-w-[280px] mx-auto">
              {{ i18n.t('dash_heatmap_empty_desc') }}
            </p>
            <button
              type="button"
              @click="scrollToRepsInput"
              class="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-400 px-4 py-2 text-xs font-semibold text-white active:scale-95 transition-all"
            >
              {{ i18n.t('dash_log_reps_cta') }}
            </button>
          </div>
          <Heatmap
            v-else
            :data="heatmapData"
            :key="`${activeExercise}-${activeYear}`"
            :loading="isLoading"
            :selected-year="activeYear"
            :exercise-label="activeExerciseLabel"
            class="transition-opacity duration-300"
            :class="isLoading ? 'opacity-50' : 'opacity-100'"
          />
        </div>

        <div v-else key="history" class="bg-surface/5 border border-border/60 rounded-2xl overflow-hidden">
          <ul v-if="reps.length" class="divide-y divide-border/40">
            <li
              v-for="rep in reps"
              :key="rep.id"
              class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 hover:bg-foreground/[0.02] transition-colors"
            >
              <div class="min-w-0">
                <p class="text-sm font-semibold text-foreground tabular-nums">{{ rep.count }} {{ i18n.t('ui_reps') }}</p>
                <p class="text-xs text-muted/60 mt-0.5">{{ formatDate(rep.date) }}</p>
              </div>
              <div v-if="editingId === rep.id" class="flex items-center gap-2 shrink-0">
                <input v-model.number="editValue" type="number"
                  class="w-20 bg-surface/60 border border-primary-500/40 rounded-lg px-2 py-1.5 text-right font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  @keyup.enter="saveEdit(rep.id)" />
                <button
                  @click="saveEdit(rep.id)"
                  class="grid place-items-center h-9 w-9 rounded-lg bg-primary-500/15 text-primary-500 active:scale-95 transition-transform"
                  :aria-label="i18n.t('dash_save')"
                ><Check aria-hidden="true" class="w-4 h-4" /></button>
              </div>
              <div v-else class="flex items-center gap-1 shrink-0">
                <button
                  @click="startEdit(rep)"
                  class="grid place-items-center h-9 w-9 rounded-lg text-muted/60 hover:text-primary-500 hover:bg-foreground/[0.04] active:scale-95 transition-colors"
                  :aria-label="i18n.t('dash_edit_entry')"
                ><Pencil aria-hidden="true" class="w-4 h-4" /></button>
                <button
                  @click="confirmDelete(rep.id)"
                  class="grid place-items-center h-9 w-9 rounded-lg text-muted/60 hover:text-red-500 hover:bg-foreground/[0.04] active:scale-95 transition-colors"
                  :aria-label="i18n.t('dash_delete_entry')"
                ><Trash2 aria-hidden="true" class="w-4 h-4" /></button>
              </div>
            </li>
          </ul>
          <div v-else class="py-16 px-6 text-center">
            <Inbox aria-hidden="true" class="w-10 h-10 mx-auto mb-3 text-muted/30" />
            <p class="text-sm font-semibold text-foreground">{{ i18n.t('dash_history_empty_title') }}</p>
            <p class="text-xs text-muted/60 mt-1 max-w-[260px] mx-auto">
              {{ i18n.t('dash_history_empty_desc') }}
            </p>
            <button
              type="button"
              @click="scrollToRepsInput"
              class="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-400 px-4 py-2 text-xs font-semibold text-white active:scale-95 transition-all"
            >
              {{ i18n.t('dash_log_reps_cta') }}
            </button>
          </div>
        </div>
      </transition>
    </section>

    <!-- RPG Release Welcome Modal -->
    <RPGReleaseModal
      :show="showRPGModal"
      @close="handleCloseRPGModal"
    />
    <QuickStartOnboardingModal
      :show="showQuickStartModal"
      :locale="i18n.locale"
      @close="handleCloseQuickStartModal"
      @start="handleStartQuickStart"
    />
    <GoalOnboardingModal
      :show="showGoalOnboarding"
      @close="handleGoalOnboardingClose"
      @selected="handleGuidedPlanSelected"
    />
    <WeeklyShareCard :open="showWeeklyCard" @close="showWeeklyCard = false" />
    <LogSheet
      :open="showLogSheet"
      :exercise-type="activeExercise"
      @close="showLogSheet = false"
      @updated="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import {
  Trophy, Target, Flame, Zap, Activity, Inbox,
  BarChart3, Check, X, Trash2, Sword, FlaskConical, Coins, ChevronDown, Share2, Pencil,
  ChevronLeft, ChevronRight, ArrowRight
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useTrainingStore } from '@/stores/training';
import { useBossStore } from '@/stores/boss';
import Heatmap from '@/components/training/Heatmap.vue';
import LogSheet from '@/components/training/LogSheet.vue';
import BossHealth from '@/components/boss/BossHealth.vue';
import RPGReleaseModal from '@/components/modals/RPGReleaseModal.vue';
import LivePresence from '@/components/ui/LivePresence.vue';
import QuickStartOnboardingModal from '@/components/modals/QuickStartOnboardingModal.vue';
import GoalOnboardingModal from '@/components/modals/GoalOnboardingModal.vue';
import TodayWorkout from '@/components/training/TodayWorkout.vue';
import WeeklyShareCard from '@/components/modals/WeeklyShareCard.vue';
import { getLocalDateString } from '@/utils/dateUtils.js';
import { buildActiveBoosts } from '@/utils/activeBuffs';

const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const trainingStore = useTrainingStore();
const bossStore = useBossStore();
const router = useRouter();
const route = useRoute();

const reps = ref([]);
const heatmapData = ref([]);
const totalReps = ref(0);
const activeExercise = ref('pullups');
const editingId = ref(null);
const editValue = ref(0);
const deletingRepIds = ref(new Set());
const bossHealthRef = ref(null);
const isLoading = ref(false);
const activeYear = ref(new Date().getFullYear());
const showRPGModal = ref(false);
const showQuickStartModal = ref(false);
const showGoalOnboarding = ref(false);
const showFreeLog = ref(false);
const showLogSheet = ref(false);
const activeTab = ref('heatmap');
const showAdvancedStats = ref(false);
const unclaimedMissions = ref(0);
const highlightRepsInput = ref(false);
const repsInputSection = ref(null);
const quickStartEvaluated = ref(false);
const showWeeklyCard = ref(false);
const suppressRPGModal = ref(false);
const todayMission = ref(null);
const todayMissionStateLoaded = ref(false);
const missionCompletionPulse = ref(false);
const missionCompletionStateReady = ref(false);
const guidedTrainingStateLoaded = ref(false);
const planPromoDismissed = ref(false);
const streakStatus = ref(null);
const freezingStreak = ref(false);
const QUICKSTART_SEEN_PREFIX = 'reppy_quickstart_seen_v1';
const GOAL_ONBOARDING_DISMISSED_PREFIX = 'reppy_goal_onboarding_dismissed_v1';
const PLAN_PROMO_DISMISSED_PREFIX = 'reppy_plan_promo_dismissed_v1';
const STREAK_CELEBRATED_PREFIX = 'reppy_streak_celebrated_v1';

// Scroll lock when modals are active
watch([showRPGModal, showQuickStartModal, showGoalOnboarding], ([rpgModal, quickStartModal, goalOnboarding]) => {
  if (rpgModal || quickStartModal || goalOnboarding) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

const getQuickStartStorageKey = () => `${QUICKSTART_SEEN_PREFIX}:${authStore.user?.id || 'guest'}`;
const getGoalOnboardingDismissedKey = () => `${GOAL_ONBOARDING_DISMISSED_PREFIX}:${authStore.user?.id || 'guest'}`;
const getPlanPromoDismissedKey = () => `${PLAN_PROMO_DISMISSED_PREFIX}:${authStore.user?.id || 'guest'}`;
const getStreakCelebratedKey = () => `${STREAK_CELEBRATED_PREFIX}:${authStore.user?.id || 'guest'}`;

const hasSeenQuickStart = () => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(getQuickStartStorageKey()) === '1';
};

const markQuickStartSeen = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getQuickStartStorageKey(), '1');
};

const shouldShowQuickStart = (totalRepsCount) => {
  if (!authStore.user) return false;
  // "Al grano": brand-new users (incl. the guided-onboarding cohort) log FIRST.
  // The guided-plan choice is offered later, not as the first gate.
  if (trainingStore.onboardingCompleted) return false;
  if (hasSeenQuickStart()) return false;
  return Number(totalRepsCount || 0) <= 20;
};

const hasDismissedGoalOnboarding = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getGoalOnboardingDismissedKey()) === '1';
};

const markGoalOnboardingDismissed = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getGoalOnboardingDismissedKey(), '1');
};

const clearGoalOnboardingDismissed = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getGoalOnboardingDismissedKey());
};

const dismissPlanPromo = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getPlanPromoDismissedKey(), '1');
  planPromoDismissed.value = true;
};

const clearPlanPromoDismissed = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getPlanPromoDismissedKey());
  planPromoDismissed.value = false;
};

const streakStateLabel = computed(() => {
  const status = streakStatus.value;
  if (!status) return '';
  if (status.trainedToday) return i18n.t('streak_protected_trained');
  if (status.frozenToday) return i18n.t('streak_protected_frozen');
  if (status.isAtRisk) return i18n.t('streak_at_risk', { hours: status.hoursLeftToday });
  return i18n.t('streak_start_hint');
});

const freezeButtonLabel = computed(() => {
  const cost = Number(streakStatus.value?.freezeCost || 0);
  if (freezingStreak.value) return i18n.t('streak_freezing');
  return i18n.t('streak_freeze_for', { cost });
});

const maybeCelebrateStreak = async (status) => {
  if (typeof window === 'undefined' || !status?.trainedToday) return;
  const today = getLocalDateString();
  const key = getStreakCelebratedKey();
  if (localStorage.getItem(key) === today) return;
  localStorage.setItem(key, today);
  if (status.streak <= 0) return;

  const { default: confetti } = await import('canvas-confetti');
  confetti({
    particleCount: 34,
    spread: 44,
    startVelocity: 24,
    scalar: 0.75,
    origin: { y: 0.18 },
    colors: ['#3b82f6', '#60a5fa', '#ffffff']
  });
};

const fetchStreakStatus = async () => {
  try {
    const res = await axios.get('/api/streak/status', { params: { t: Date.now() } });
    streakStatus.value = res.data;
    await maybeCelebrateStreak(res.data);
  } catch (error) {
    console.error('Error fetching streak status:', error);
  }
};

const freezeStreak = async () => {
  if (!streakStatus.value?.canFreeze || freezingStreak.value) return;
  freezingStreak.value = true;
  try {
    const res = await axios.post('/api/streak/freeze');
    streakStatus.value = res.data;
    await authStore.fetchProfile(true);
    notificationStore.notify(i18n.t('streak_frozen_notify'), 'success');
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || i18n.t('streak_freeze_error'), 'error');
  } finally {
    freezingStreak.value = false;
  }
};

// Opens the log sheet (Momentum's primary gesture). Ensures a concrete exercise
// is selected first, briefly highlights the ring, and surfaces it into view.
const openLogSheet = async () => {
  if (activeExercise.value === 'all') {
    activeExercise.value = 'pullups';
  }
  showFreeLog.value = true;
  await nextTick();
  repsInputSection.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  highlightRepsInput.value = true;
  setTimeout(() => { highlightRepsInput.value = false; }, 1200);
  showLogSheet.value = true;
};

// Back-compat: existing callers (empty states, ?log=1 intent) now open the sheet.
const scrollToRepsInput = openLogSheet;

const handleCloseQuickStartModal = () => {
  markQuickStartSeen();
  suppressRPGModal.value = true;
  showRPGModal.value = false;
  showQuickStartModal.value = false;
};

const handleStartQuickStart = async (payload = null) => {
  markQuickStartSeen();
  suppressRPGModal.value = true;
  showRPGModal.value = false;
  showQuickStartModal.value = false;
  if (payload?.exerciseType) {
    activeExercise.value = payload.exerciseType;
  }
  await fetchData();
  await scrollToRepsInput();
};

const handleLogQueryIntent = async () => {
  if (route.query.log !== '1') return;
  await nextTick();
  await scrollToRepsInput();
};

const stats = reactive({
  streak: 0,
  dailyGoal: 50,
  totalVolume: 0,
  combatPower: { total: 0, base: 0, gear: 0, buff: 0, critChance: 0, critMultiplier: 1, minDamage: 0, maxDamage: 0 }
});

const activeExerciseLabel = computed(() => {
  return i18n.t(activeExercise.value);
});

const quickLogOptions = computed(() => [
  { id: 'pullups', label: i18n.t('pullups') },
  { id: 'pushups', label: i18n.t('pushups') },
  { id: 'dips', label: i18n.t('dips') },
  { id: 'muscleups', label: i18n.t('muscleups') },
  { id: 'legs', label: i18n.t('legs') },
]);

const todayProgress = computed(() => {
  const today = getLocalDateString();
  return reps.value
    .filter(r => getLocalDateString(r.date) === today)
    .reduce((acc, curr) => acc + Number(curr.count), 0);
});

// Day ring fill: today's reps for the selected exercise vs the daily goal.
const dayRingPercent = computed(() => {
  const goal = Math.max(1, Number(stats.dailyGoal) || 0);
  return Math.min(100, Math.round((todayProgress.value / goal) * 100));
});

// ── Frontline: community boss band (fed by the shared boss store) ──
const bossData = computed(() => bossStore.activeBoss?.boss || null);
const bossDailyDamage = computed(() => Number(bossStore.activeBoss?.daily_damage || 0));
const bossHpRemaining = computed(() => Number(bossData.value?.current_hp || 0));
const bossHpPercent = computed(() => {
  const b = bossData.value;
  if (!b || !b.total_hp) return 0;
  return Math.max(0, Math.min(100, (b.current_hp / b.total_hp) * 100));
});
const bossTag = computed(() => {
  if (bossData.value?.is_legendary) return i18n.t('fl_boss_legendary');
  if (bossData.value?.is_epic) return i18n.t('fl_boss_epic');
  return i18n.t('fl_boss_active');
});

// Compact number formatter for tactical readouts: 14210 -> "14.2K".
const formatCompact = (n) => {
  const v = Number(n) || 0;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.round(v));
};

// Frontline exercise switcher: cycle through the concrete log options.
const switchExercise = (dir) => {
  const list = quickLogOptions.value;
  if (!list.length) return;
  const i = list.findIndex((o) => o.id === activeExercise.value);
  const next = ((i < 0 ? 0 : i) + dir + list.length) % list.length;
  activeExercise.value = list[next].id;
};

const isDailyObjectiveDone = computed(() => {
  // If there is an active daily mission from backend, trust that source of truth.
  if (todayMission.value) return !!todayMission.value.is_completed;
  // Fallback only when there is no mission payload.
  return todayProgress.value >= stats.dailyGoal;
});

const todayMissionPercent = computed(() => {
  if (isDailyObjectiveDone.value) return 100;
  if (todayMission.value?.goal_value) {
    const pct = Math.round((Number(todayMission.value.current_value || 0) / Number(todayMission.value.goal_value || 1)) * 100);
    return Math.max(0, Math.min(100, pct));
  }
  const fallbackPct = Math.round((todayProgress.value / Math.max(1, stats.dailyGoal)) * 100);
  return Math.max(0, Math.min(100, fallbackPct));
});

const todayMissionTitle = computed(() => {
  if (todayMission.value?.title_key) return i18n.t(todayMission.value.title_key);
  return i18n.t('dash_mission_default_title');
});

const todayMissionProgressLabel = computed(() => {
  const goalLabel = getGoalTypeLabel(todayMission.value?.goal_type);
  if (isDailyObjectiveDone.value) {
    if (todayMission.value?.goal_value) {
      return `${todayMission.value.goal_value} / ${todayMission.value.goal_value}${goalLabel ? ` ${goalLabel}` : ''}`;
    }
    return `${stats.dailyGoal} / ${stats.dailyGoal}${goalLabel ? ` ${goalLabel}` : ''}`;
  }
  if (todayMission.value?.goal_value) {
    return `${todayMission.value.current_value || 0} / ${todayMission.value.goal_value}${goalLabel ? ` ${goalLabel}` : ''}`;
  }
  return `${todayProgress.value} / ${stats.dailyGoal}${goalLabel ? ` ${goalLabel}` : ''}`;
});

const todayMissionRewardLabel = computed(() => {
  if (!todayMission.value) return '+50 RC';
  const coins = Number(todayMission.value.reward_coins || 0);
  const gems = Number(todayMission.value.reward_gems || 0);
  const xp = Number(todayMission.value.reward_xp || 0);
  const parts = [];
  if (coins > 0) parts.push(`+${coins} RC`);
  if (gems > 0) parts.push(`+${gems} G`);
  if (xp > 0) parts.push(`+${xp} XP`);
  return parts.length ? parts.join(' · ') : i18n.t('dash_mission_reward_active');
});

const todayMissionActionLabel = computed(() => {
  if (todayMission.value?.is_completed && !todayMission.value?.is_claimed) {
    return i18n.t('dash_mission_claim');
  }
  if (isDailyObjectiveDone.value) {
    return i18n.t('dash_mission_done');
  }
  const goalType = todayMission.value?.goal_type;
  if (goalType === 'social_likes') return i18n.t('dash_mission_go_social');
  if (goalType === 'buy_any') return i18n.t('dash_mission_go_shop');
  if (goalType === 'use_consumable') return i18n.t('dash_mission_go_inventory');
  return i18n.t('dash_mission_log_now');
});

const shouldShowTodayMissionCard = computed(() => {
  if (!todayMissionStateLoaded.value) return false;
  if (!guidedTrainingStateLoaded.value) return false;
  if (trainingStore.todayWorkout || trainingStore.completedToday) return false;
  return !isDailyObjectiveDone.value;
});

const shouldShowTodayWorkout = computed(() => {
  if (!guidedTrainingStateLoaded.value) return false;
  return !!trainingStore.todayWorkout || !!trainingStore.completedToday;
});

const shouldShowActivePlanCard = computed(() => {
  if (!guidedTrainingStateLoaded.value) return false;
  return !!trainingStore.activePlan;
});

const shouldShowPlanPromo = computed(() => {
  if (!guidedTrainingStateLoaded.value) return false;
  if (trainingStore.activePlan) return false;
  return !planPromoDismissed.value;
});

const shouldShowFreeLogToggle = computed(() => {
  if (!guidedTrainingStateLoaded.value) return false;
  return !!trainingStore.todayWorkout;
});

const KNOWN_GOAL_TYPES = ['reps', 'damage', 'streak', 'xp_str', 'xp_pwr', 'xp_end', 'xp_agi', 'social_likes', 'buy_any', 'use_consumable', 'night_owl', 'personal_record'];

const getGoalTypeLabel = (goalType) => {
  if (!KNOWN_GOAL_TYPES.includes(goalType)) return '';
  return i18n.t(`goal_label_${goalType}`);
};

const todayMissionHowTo = computed(() => {
  const mission = todayMission.value;
  const goalType = mission?.goal_type;
  if (!goalType) return i18n.t('dash_mission_fallback_hint');
  if (!KNOWN_GOAL_TYPES.includes(goalType)) return i18n.t('goal_howto_fallback');
  return i18n.t(`goal_howto_${goalType}`, { v: mission?.goal_value });
});

const currentTime = ref(new Date());
let timerInterval = null;

const activePotions = computed(() => buildActiveBoosts(authStore.user, currentTime.value, i18n));

// Watch for potion expiry to refresh combat stats
watch(() => activePotions.value.length, (newLen, oldLen) => {
  if (newLen < oldLen) {
    fetchData();
  }
});

const fetchGlobalData = async () => {
  todayMissionStateLoaded.value = false;
  try {
    const t = Date.now();
    const [missionsRes] = await Promise.all([
      axios.get('/api/missions', { params: { t } }),
      authStore.fetchProfile()
    ]);
    const missionList = missionsRes.data.missions || [];
    unclaimedMissions.value = missionList.filter(m => m.is_completed && !m.is_claimed).length;
    const dailyMissions = missionList.filter(m => m.is_daily);
    const completedUnclaimedDaily = dailyMissions.find(m => m.is_completed && !m.is_claimed);
    todayMission.value = completedUnclaimedDaily || dailyMissions.find(m => !m.is_completed) || dailyMissions[0] || null;
    todayMissionStateLoaded.value = true;
  } catch (err) {
    console.error('Error fetching global dashboard data:', err);
    todayMission.value = null;
  }
};

// Exercise-scoped data only: reps history, heatmap and stats for the selected
// exercise. This is the ONLY thing that changes when you switch exercise — it
// must NOT touch missions, the guided plan or the streak (they're global).
const fetchExerciseData = async () => {
  isLoading.value = true;
  try {
    const params = { type: activeExercise.value, year: activeYear.value };
    const t = Date.now();
    const [repsRes, heatmapRes, statsRes] = await Promise.all([
      axios.get('/api/reps', { params: { ...params, t } }),
      axios.get('/api/reps/heatmap', { params: { ...params, t } }),
      axios.get('/api/reps/stats', { params: { ...params, t } }),
    ]);

    reps.value = repsRes.data;
    heatmapData.value = heatmapRes.data;
    totalReps.value = statsRes.data.totalReps;
    stats.streak = statsRes.data.streak;
    stats.dailyGoal = statsRes.data.dailyGoal || 50;
    stats.totalVolume = statsRes.data.totalVolume || 0;
    stats.combatPower = statsRes.data.combatPower || { total: 0, base: 0, gear: 0, buff: 0 };
    return statsRes;
  } finally {
    isLoading.value = false;
  }
};

// Full refresh: exercise data + global state (streak, missions, guided plan,
// boss) + first-run onboarding. Use on mount and after a mutation that changes
// global state (logging reps, editing/deleting entries) — NOT on exercise switch.
const fetchData = async () => {
  guidedTrainingStateLoaded.value = false;
  try {
    const statsRes = await fetchExerciseData();
    await Promise.all([
      fetchStreakStatus(),
      fetchGlobalData(),
      trainingStore.fetchMine()
    ]);
    guidedTrainingStateLoaded.value = true;

    if (bossHealthRef.value) bossHealthRef.value.refresh();

    if (!quickStartEvaluated.value) {
      quickStartEvaluated.value = true;
      if (shouldShowQuickStart(statsRes.data.totalReps)) {
        // Log-first activation: pick exercise → log first set, immediate reward.
        showQuickStartModal.value = true;
        suppressRPGModal.value = true;
      } else if (trainingStore.canShowOnboarding && !hasDismissedGoalOnboarding()) {
        // Returning new user who already logged → now offer a guided plan.
        showGoalOnboarding.value = true;
        suppressRPGModal.value = true;
      }
    }

    // Check for update modal only if quick-start onboarding was not shown
    if (!suppressRPGModal.value && authStore.user && !authStore.user.has_seen_rpg_release) {
      showRPGModal.value = true;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    guidedTrainingStateLoaded.value = true;
  }
};

const formatDate = (dateStr) => {
  // Use '/' instead of '-' to force local timezone parsing if it's a YYYY-MM-DD string
  const normalizedDate = typeof dateStr === 'string' ? dateStr.replace(/-/g, '/') : dateStr;
  return new Date(normalizedDate).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
  });
};

const startEdit = (rep) => {
  editingId.value = rep.id;
  editValue.value = rep.count;
};

const saveEdit = async (id) => {
  try {
    await axios.put(`/api/reps/${id}`, { count: editValue.value });
    editingId.value = null;
    notificationStore.notify(i18n.t('dash_entry_updated'), 'success');
    fetchData();
  } catch (err) {
    notificationStore.notify(i18n.t('dash_update_failed'), 'error');
  }
};

// Switching exercise only refetches exercise-scoped data — missions, the guided
// plan and the streak stay put (they don't depend on the selected exercise).
watch(activeExercise, () => {
  fetchExerciseData();
});

watch(
  () => route.query.log,
  () => {
    handleLogQueryIntent();
  }
);

const confirmDelete = (id) => {
  if (deletingRepIds.value.has(id)) return;
  notificationStore.confirm(
    i18n.t('dash_delete_title'),
    i18n.t('dash_delete_confirm'),
    async () => {
      try {
        deletingRepIds.value.add(id);
        await axios.delete(`/api/reps/${id}`);
        notificationStore.notify(i18n.t('dash_entry_deleted'), 'success');
        fetchData();
      } catch (err) {
        if (err?.response?.status === 404) {
          // Already deleted or stale client state: update UI silently
          reps.value = reps.value.filter(r => r.id !== id);
          notificationStore.notify(i18n.t('dash_entry_already_removed'), 'info');
          return;
        }
        notificationStore.notify(i18n.t('dash_delete_failed'), 'error');
      } finally {
        deletingRepIds.value.delete(id);
      }
    }
  );
};

const handleCloseRPGModal = () => {
  showRPGModal.value = false;
  if (authStore.user) {
    authStore.user.has_seen_rpg_release = true;
  }
};

const handleTodayMissionAction = async () => {
  if (isDailyObjectiveDone.value) {
    const targetMissionId = todayMission.value?.id;
    router.push({
      name: 'missions',
      params: { lang: i18n.locale },
      query: targetMissionId ? { missionId: String(targetMissionId) } : {}
    });
    return;
  }
  const goalType = todayMission.value?.goal_type;
  if (goalType === 'social_likes') {
    router.push({ name: 'social', params: { lang: i18n.locale } });
    return;
  }
  if (goalType === 'buy_any') {
    router.push({ name: 'shop', params: { lang: i18n.locale } });
    return;
  }
  if (goalType === 'use_consumable') {
    router.push({ name: 'inventory', params: { lang: i18n.locale } });
    return;
  }
  await scrollToRepsInput();
};

const handleGuidedWorkoutCompleted = async () => {
  showFreeLog.value = false;
  await fetchData();
};

const handleGuidedPlanSelected = async () => {
  clearGoalOnboardingDismissed();
  clearPlanPromoDismissed();
  showFreeLog.value = false;
  await fetchData();
};

const handleGoalOnboardingClose = (payload = {}) => {
  showGoalOnboarding.value = false;

  if (
    payload?.reason === 'dismissed' &&
    trainingStore.canShowOnboarding &&
    !trainingStore.activePlan
  ) {
    markGoalOnboardingDismissed();
  }
};

const openPlanPicker = () => {
  clearGoalOnboardingDismissed();
  clearPlanPromoDismissed();
  showGoalOnboarding.value = true;
};

const pausePlan = async () => {
  try {
    await trainingStore.pausePlan();
    notificationStore.notify(i18n.t('dash_plan_paused_notify'), 'success');
    await fetchData();
  } catch (error) {
    notificationStore.notify(i18n.t('dash_plan_pause_error'), 'error');
  }
};

const resumePlan = async () => {
  try {
    await trainingStore.resumePlan();
    notificationStore.notify(i18n.t('dash_plan_resumed_notify'), 'success');
    await fetchData();
  } catch (error) {
    notificationStore.notify(i18n.t('dash_plan_resume_error'), 'error');
  }
};

const abandonPlan = async () => {
  notificationStore.confirm(
    i18n.t('dash_plan_abandon_title'),
    i18n.t('dash_plan_abandon_confirm'),
    async () => {
      try {
        await trainingStore.abandonPlan();
        notificationStore.notify(i18n.t('dash_plan_abandoned_notify'), 'success');
        await fetchData();
      } catch (error) {
        notificationStore.notify(i18n.t('dash_plan_abandon_error'), 'error');
      }
    }
  );
};

onMounted(async () => {
  // Check for exercise pre-selection from query params
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseParam = urlParams.get('exercise');
  if (exerciseParam) {
    activeExercise.value = exerciseParam;
  }

  await trainingStore.fetchPlans();
  guidedTrainingStateLoaded.value = false;
  await trainingStore.fetchMine();
  guidedTrainingStateLoaded.value = true;
  planPromoDismissed.value = typeof window !== 'undefined' && localStorage.getItem(getPlanPromoDismissedKey()) === '1';
  // "Al grano": don't gate brand-new users behind the guided-plan question.
  // If they still qualify for the log-first QuickStart, let that run instead;
  // the plan question returns on a later visit (once QuickStart has been seen).
  showGoalOnboarding.value = trainingStore.canShowOnboarding && !hasDismissedGoalOnboarding() && !shouldShowQuickStart(totalReps.value);
  if (showGoalOnboarding.value) {
    suppressRPGModal.value = true;
  }

  fetchData();
  handleLogQueryIntent();
  // Frontline boss band (deduped; BossHealth in the disclosure shares this store).
  bossStore.fetchActiveBoss().catch(() => {});

  // Timer for active effects
  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

watch(
  () => !!todayMission.value && !!todayMission.value.is_completed,
  (isCompleted) => {
    if (!missionCompletionStateReady.value) {
      missionCompletionStateReady.value = true;
      return;
    }
    if (isCompleted) {
      missionCompletionPulse.value = true;
      notificationStore.notify(i18n.t('dash_mission_completed_notify'), 'success');
      setTimeout(() => {
        missionCompletionPulse.value = false;
      }, 1800);
    }
  }
);
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.plan-action {
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  background: hsla(var(--foreground) / 0.04);
  padding: 0.5rem 0.75rem;
  color: hsl(var(--muted));
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  transition: border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.plan-action:hover {
  border-color: hsl(var(--primary) / 0.35);
  color: hsl(var(--foreground));
}

.plan-action:active {
  transform: scale(0.97);
}

/* ── Frontline visual system ── */
.fl-mono { font-family: 'JetBrains Mono', monospace; }

.fl-index {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.22em;
  color: hsl(var(--muted) / 0.6);
}

.fl-rule { height: 1px; background: hsl(var(--border)); }
.fl-divider { width: 1px; background: hsl(var(--border)); }

.fl-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid hsl(var(--border));
  background: transparent;
  padding: 0.4rem 0.7rem;
  color: hsl(var(--muted));
  font-size: 0.72rem;
  font-weight: 600;
  transition: border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}
.fl-action:hover { border-color: hsl(var(--primary) / 0.35); color: hsl(var(--foreground)); }
.fl-action:active { transform: scale(0.97); }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
