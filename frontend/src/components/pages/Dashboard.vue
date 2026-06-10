<template>
  <div class="max-w-7xl mx-auto w-full px-4 space-y-4 sm:space-y-6 pb-24 pt-2 sm:pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header: greeting -->
    <header class="flex items-center justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-bold tracking-tight text-foreground leading-tight truncate">
          {{ greeting }}<span class="text-primary-500">, {{ firstName }}</span>
        </h1>
        <p class="dashboard-daily-quote mt-1 text-xs text-muted/60">{{ dailyQuote }}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-xl border border-primary-500/25 bg-primary-500/10 px-3 py-2 text-xs font-semibold text-primary-400 transition hover:bg-primary-500/20 active:scale-95"
          @click="showWeeklyCard = true"
        >
          <Share2 class="w-3.5 h-3.5" aria-hidden="true" />
          {{ i18n.t('dash_my_week') }}
        </button>
        <button
          v-if="guidedTrainingStateLoaded && !trainingStore.activePlan"
          type="button"
          class="rounded-xl border border-border bg-foreground/[0.03] px-3 py-2 text-xs font-semibold text-muted transition hover:border-primary-500/30 hover:text-foreground active:scale-95"
          @click="openPlanPicker"
        >
          {{ i18n.t('dash_guided_plan') }}
        </button>
      </div>
    </header>

    <!-- The Hero (Momentum): pick exercise → see today's ring → log -->
    <section
      v-if="!trainingStore.todayWorkout || showFreeLog"
      class="max-w-md mx-auto w-full space-y-4"
    >
      <ExerciseSelector v-model="activeExercise" compact class="w-full" />

      <!-- Overview mode: no single exercise picked yet -->
      <div v-if="activeExercise === 'all'" class="bg-surface/5 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-8 sm:p-10">
        <Globe aria-hidden="true" class="w-10 h-10 text-muted/50 mb-3" />
        <h3 class="text-lg font-bold tracking-tight text-foreground">
          {{ i18n.t('dash_overview_mode') }}
        </h3>
        <p class="text-xs text-muted/60 max-w-[320px] mx-auto mt-1.5">
          {{ i18n.t('dash_overview_hint') }}
        </p>
        <div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-md">
          <button
            v-for="option in quickLogOptions"
            :key="option.id"
            @click="activeExercise = option.id"
            class="h-10 rounded-xl border border-border bg-foreground/[0.03] hover:bg-primary-500/10 hover:border-primary-500/30 text-xs font-semibold text-foreground/90 transition-all active:scale-[0.98]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Day ring + log CTA -->
      <div
        v-else
        ref="repsInputSection"
        class="flex flex-col items-center transition-all duration-500 rounded-3xl"
        :class="highlightRepsInput ? 'ring-2 ring-primary-500/60' : ''"
      >
        <RadialProgress :progress="dayRingPercent" :size="208" :stroke-width="14">
          <div class="flex flex-col items-center">
            <span class="text-[2.75rem] font-bold tabular-nums leading-none text-foreground">{{ todayProgress }}</span>
            <span class="mt-2 text-xs text-muted/60">
              {{ i18n.t('dash_ring_of') }} {{ stats.dailyGoal }} · {{ activeExerciseLabel }}
            </span>
          </div>
        </RadialProgress>

        <button
          type="button"
          @click="openLogSheet"
          class="mt-5 w-full max-w-xs flex items-center justify-center gap-2 rounded-2xl bg-primary-500 hover:bg-primary-400 active:bg-primary-600 px-5 py-3.5 text-base font-semibold text-white transition-all active:scale-[0.98] shadow-lg shadow-primary-500/20"
        >
          <Plus aria-hidden="true" class="w-5 h-5" />
          {{ i18n.t('dash_log_reps_cta') }}
        </button>
      </div>
    </section>

    <!-- Streak band skeleton -->
    <div
      v-if="isLoading && !streakStatus"
      class="flex items-center gap-3 rounded-2xl border border-border/60 bg-foreground/[0.02] px-4 py-3 animate-pulse"
    >
      <div class="h-10 w-10 shrink-0 rounded-xl bg-foreground/10"></div>
      <div class="flex-1 space-y-2">
        <div class="h-3 w-28 bg-foreground/10 rounded"></div>
        <div class="h-2 w-40 bg-foreground/5 rounded"></div>
      </div>
    </div>

    <!-- Streak band: one scale (days), amber only when at risk -->
    <div
      v-else-if="streakStatus"
      class="flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors"
      :class="streakStatus.showRisk ? 'border-amber-500/30 bg-amber-500/[0.07]' : 'border-primary-500/20 bg-primary-500/[0.06]'"
    >
      <div
        class="grid place-items-center h-10 w-10 shrink-0 rounded-xl"
        :class="streakStatus.showRisk ? 'bg-amber-500/15' : 'bg-primary-500/15'"
      >
        <Flame aria-hidden="true" class="h-5 w-5" :class="streakStatus.showRisk ? 'text-amber-400' : 'text-primary-400'" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-baseline gap-1.5">
          <span class="text-xl font-bold tabular-nums leading-none text-foreground">{{ streakStatus.streak || 0 }}</span>
          <span class="text-sm font-semibold text-muted/70">{{ i18n.t('streak_days_unit') }}</span>
          <span
            v-if="streakTier.label"
            class="ml-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-foreground/[0.06] text-muted"
          >{{ streakTier.label }}</span>
        </div>
        <p
          class="mt-0.5 text-xs truncate"
          :class="streakStatus.showRisk ? 'text-amber-400 font-medium'
            : streakStatus.jackpotAlreadyAwarded ? 'text-emerald-400 font-medium'
            : 'text-muted/60'"
        >{{ streakStateLabel }}</p>
      </div>

      <!-- Weekly bonus micro-indicator: days trained THIS week toward the jackpot (5/7) -->
      <div class="hidden sm:flex flex-col items-end gap-1 shrink-0">
        <span class="text-[10px] font-medium" :class="streakStatus.jackpotAlreadyAwarded ? 'text-emerald-500/80' : 'text-muted/50'">
          {{ i18n.t('streak_weekly_bonus') }} {{ weeklyBonusProgress }}/{{ weeklyBonusTarget }}
        </span>
        <div class="flex items-center gap-1">
          <span
            v-for="day in weeklyBonusTarget"
            :key="day"
            class="h-1.5 w-3 rounded-full transition-colors"
            :class="day <= weeklyBonusProgress
              ? (streakStatus.jackpotAlreadyAwarded ? 'bg-emerald-500' : 'bg-primary-500')
              : 'bg-foreground/10'"
          />
        </div>
      </div>

      <!-- Freeze CTA (only when at risk) -->
      <button
        v-if="streakStatus.isAtRisk && !streakStatus.frozenToday"
        type="button"
        class="shrink-0 flex items-center gap-1 rounded-xl border px-2.5 py-2 text-xs transition-all active:scale-95 disabled:opacity-40"
        :class="streakStatus.canFreeze
          ? 'border-amber-500/35 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
          : 'border-border bg-foreground/[0.04] text-muted'"
        :disabled="!streakStatus.canFreeze || freezingStreak"
        @click="freezeStreak"
      >
        <Snowflake aria-hidden="true" class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">{{ freezeButtonLabel }}</span>
      </button>
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
  BarChart3, Check, X, Trash2, Globe, Sword, FlaskConical, Coins, Snowflake, ChevronDown, Share2, Pencil, Plus
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useTrainingStore } from '@/stores/training';
import Heatmap from '@/components/training/Heatmap.vue';
import RadialProgress from '@/components/ui/RadialProgress.vue';
import LogSheet from '@/components/training/LogSheet.vue';
import ExerciseSelector from '@/components/training/ExerciseSelector.vue';
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

const bossMotivationQuotes = {
  es: [
    '"Has sobrevivido al tutorial. Ahora sube de nivel."',
    '"Ese boss no te espera: te está guardando sitio."',
    '"Tus límites tienen barra de vida. Bájala hoy."',
    '"El respawn es entrar otra vez y registrar reps."',
    '"No eres el minion del mapa. Eres la raid entera."',
    '"Hoy farmeas fuerza. Mañana desbloqueas leyenda."',
    '"El jefe final también empezó con una repetición."',
    '"Que tiemble el boss: vienes con buff de disciplina."',
  ],
  en: [
    '"You survived the tutorial. Now level up."',
    '"That boss is not waiting. It is saving your slot."',
    '"Your limits have a health bar. Drain it today."',
    '"Respawn means showing up and logging reps."',
    '"You are not a map minion. You are the whole raid."',
    '"Farm strength today. Unlock legend tomorrow."',
    '"The final boss also started with one rep."',
    '"Make the boss shake: discipline buff active."',
  ],
};

const pickRandomQuote = (locale) => {
  const quotes = locale === 'en' ? bossMotivationQuotes.en : bossMotivationQuotes.es;
  return quotes[Math.floor(Math.random() * quotes.length)];
};

const dailyQuote = ref(pickRandomQuote(i18n.locale));

watch(() => i18n.locale, (locale) => {
  dailyQuote.value = pickRandomQuote(locale);
});

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

// Streak milestones: days threshold → tier badge shown next to the streak number
const STREAK_MILESTONES = [
  { days: 7,  labelKey: 'streak_tier_week' },
  { days: 14, labelKey: 'streak_tier_2weeks' },
  { days: 30, labelKey: 'streak_tier_month' },
  { days: 60, labelKey: 'streak_tier_legend' },
];

const streakTier = computed(() => {
  const days = Number(streakStatus.value?.streak || 0);
  // While at risk the amber state takes over; hide the tier badge to keep focus.
  if (streakStatus.value?.showRisk) return { label: null };
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    if (days >= STREAK_MILESTONES[i].days) return { label: i18n.t(STREAK_MILESTONES[i].labelKey) };
  }
  return { label: null };
});

// Weekly jackpot indicator: fed by days trained THIS week (backend weeklyProgress),
// scaled to the real reward threshold (jackpotDaysRequired = 5), not the total streak.
const weeklyBonusTarget = computed(() => Number(streakStatus.value?.jackpotDaysRequired || 5));
const weeklyBonusProgress = computed(() =>
  Math.min(Number(streakStatus.value?.weeklyProgress || 0), weeklyBonusTarget.value)
);

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

const firstName = computed(() =>
  authStore.user?.name?.split(' ')[0] || i18n.t('dash_default_athlete')
);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return i18n.t('greeting_night');
  if (hour < 12) return i18n.t('greeting_morning');
  if (hour < 20) return i18n.t('greeting_afternoon');
  return i18n.t('greeting_evening');
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

.dashboard-daily-quote {
  line-height: 1.2;
  max-width: min(100%, 22rem);
  overflow-wrap: anywhere;
}

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
