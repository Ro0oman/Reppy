<template>
  <div class="max-w-7xl mx-auto w-full px-4 space-y-4 sm:space-y-6 pb-24 pt-2 sm:pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header: greeting + exercise selector inline -->
    <header class="flex flex-col gap-3">
      <!-- Top row: greeting left, plans button right -->
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="dashboard-daily-quote text-[11px] font-black uppercase tracking-[0.08em] text-primary-500/90">{{ dailyQuote }}</p>
          <h2 class="text-xl font-bold tracking-tight text-foreground leading-tight mt-0.5">
            {{ authStore.user?.name?.split(' ')[0] || (i18n.locale === 'es' ? 'Atleta' : 'Athlete') }}
          </h2>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-xl border border-primary-500/25 bg-primary-500/10 px-3 py-2 text-xs font-semibold text-primary-400 transition hover:bg-primary-500/20 active:scale-95"
            @click="showWeeklyCard = true"
          >
            <Share2 class="w-3.5 h-3.5" />
            {{ i18n.locale === 'es' ? 'Mi semana' : 'My week' }}
          </button>
          <button
            v-if="guidedTrainingStateLoaded && !trainingStore.activePlan"
            type="button"
            class="rounded-xl border border-border bg-foreground/[0.03] px-3 py-2 text-xs font-semibold text-muted transition hover:border-primary-500/30 hover:text-foreground active:scale-95"
            @click="openPlanPicker"
          >
            {{ i18n.locale === 'es' ? 'Plan guiado' : 'Guided plan' }}
          </button>
        </div>
      </div>
      <!-- Exercise selector: compact pills -->
      <ExerciseSelector v-model="activeExercise" compact class="w-full md:hidden" />
    </header>

    <!-- 2. The Hero: Active Session -->
    <section
      v-if="!trainingStore.todayWorkout || showFreeLog"
      ref="repsInputSection"
      class="max-w-4xl mx-auto w-full transition-all duration-500 rounded-2xl"
      :class="highlightRepsInput ? 'ring-2 ring-primary-500/60 shadow-[0_0_30px_hsl(var(--primary) / 0.25)]' : ''"
    >
      <div v-if="activeExercise === 'all'" class="bg-surface/10 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-8 sm:p-12">
        <Globe class="w-12 h-12 text-muted mb-4" />
        <h3 class="text-xl font-bold tracking-tight">
          {{ i18n.locale === 'es' ? 'Modo resumen activo' : 'Overview mode active' }}
        </h3>
        <p class="text-xs text-muted/60 max-w-[340px] mx-auto mt-2">
          {{ i18n.locale === 'es' ? 'Elige un ejercicio para registrar reps ahora.' : 'Pick an exercise below to log reps now.' }}
        </p>
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl">
          <button
            v-for="option in quickLogOptions"
            :key="option.id"
            @click="activeExercise = option.id"
            class="h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-primary-500/10 hover:border-primary-500/30 text-[10px] font-bold tracking-wide text-foreground/90 transition-all active:scale-[0.98]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      <RepsInput v-else :exercise-type="activeExercise" @updated="fetchData" class="w-full" />
    </section>

    <!-- Streak card skeleton -->
    <div
      v-if="isLoading && !streakStatus"
      class="rounded-2xl border border-primary-500/20 bg-primary-500/10 px-4 py-3 space-y-4 animate-pulse"
    >
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 shrink-0 rounded-xl bg-foreground/10"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 w-32 bg-foreground/10 rounded"></div>
          <div class="h-2 w-24 bg-foreground/5 rounded"></div>
        </div>
      </div>
      <div class="space-y-1">
        <div class="flex gap-1">
          <div v-for="i in 7" :key="i" class="h-2 flex-1 rounded-full bg-foreground/10"></div>
        </div>
        <div class="h-2 w-28 bg-foreground/5 rounded"></div>
      </div>
    </div>

    <!-- Streak card: racha + progreso semanal + jackpot -->
    <div
      v-else-if="streakStatus"
      class="rounded-2xl border overflow-hidden transition-all duration-300"
      :class="streakTier.cardClass"
    >
      <!-- Hero section: big flame + number -->
      <div class="px-4 pt-4 pb-3 flex items-center gap-4">
        <!-- Animated flame icon, scales with tier -->
        <div class="relative shrink-0 flex items-center justify-center"
          :class="streakTier.iconWrapClass">
          <Flame :class="streakTier.iconClass" />
          <!-- glow ring for high tiers -->
          <div v-if="streakTier.level >= 3"
            class="absolute inset-0 rounded-full blur-md opacity-40"
            :class="streakTier.glowClass" />
        </div>

        <!-- Streak number + label -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2">
            <span class="tabular-nums font-black leading-none" :class="streakTier.numberClass">
              {{ streakStatus.streak || 0 }}
            </span>
            <span class="text-xs font-semibold text-muted/70 uppercase tracking-widest">
              {{ i18n.locale === 'es' ? 'días' : 'days' }}
            </span>
          </div>
          <!-- tier badge -->
          <div class="mt-1 flex items-center gap-2">
            <span v-if="streakTier.label" class="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
              :class="streakTier.badgeClass">
              {{ streakTier.label }}
            </span>
            <p class="text-[11px] truncate"
              :class="streakStatus.showRisk ? 'text-amber-300 font-semibold'
                : streakStatus.jackpotAlreadyAwarded ? 'text-emerald-400 font-semibold'
                : 'text-muted/60'">
              {{ streakStateLabel }}
            </p>
          </div>
        </div>

        <!-- Freeze CTA -->
        <button
          v-if="streakStatus.isAtRisk && !streakStatus.frozenToday"
          type="button"
          class="shrink-0 flex items-center gap-1 rounded-xl border px-3 py-2 text-xs transition-all active:scale-95 disabled:opacity-40"
          :class="streakStatus.canFreeze
            ? 'border-amber-500/35 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
            : 'border-border bg-foreground/[0.04] text-muted'"
          :disabled="!streakStatus.canFreeze || freezingStreak"
          @click="freezeStreak"
        >
          <Snowflake class="h-3.5 w-3.5" />
          <span>{{ freezeButtonLabel }}</span>
        </button>
      </div>

      <!-- Streak progress bar (streak capped at 7, toward jackpot) -->
      <div class="px-4 pb-1 space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-semibold text-muted/60">
            {{ i18n.locale === 'es' ? 'Racha' : 'Streak' }}
          </span>
          <span class="text-[10px] font-bold"
            :class="streakStatus.jackpotAlreadyAwarded ? 'text-emerald-400'
              : streakDays7 >= streakStatus.jackpotDaysRequired ? 'text-emerald-400'
              : 'text-muted/60'">
            {{ Math.min(streakStatus.streak, 7) }}/7
            <span v-if="streakStatus.jackpotAlreadyAwarded"> 🎉</span>
            <span v-else-if="streakDays7 >= streakStatus.jackpotDaysRequired"> ✓</span>
          </span>
        </div>
        <div class="flex items-center gap-1">
          <div
            v-for="day in 7"
            :key="day"
            class="h-1.5 flex-1 rounded-full transition-all duration-500"
            :class="day <= streakDays7
              ? streakStatus.jackpotAlreadyAwarded
                ? 'bg-emerald-500'
                : day <= streakStatus.jackpotDaysRequired
                  ? streakTier.barClass
                  : streakTier.barClass + ' opacity-60'
              : day === streakDays7 + 1 && !streakStatus.activeToday
                ? 'bg-foreground/20 ring-1 ring-white/10'
                : 'bg-foreground/8'"
          />
        </div>
      </div>

      <!-- Next milestone hint / jackpot -->
      <div class="px-4 pb-3 pt-1">
        <p v-if="!streakStatus.jackpotAlreadyAwarded" class="text-[10px] text-muted/40">
          {{ i18n.locale === 'es'
            ? `${streakStatus.jackpotDaysRequired} días = +${streakStatus.jackpotReward} RC bonus`
            : `${streakStatus.jackpotDaysRequired} days = +${streakStatus.jackpotReward} RC bonus` }}
          <span v-if="streakNextMilestone" class="ml-2 opacity-70">
            · {{ i18n.locale === 'es' ? `Próximo hito: ${streakNextMilestone.days}d` : `Next tier: ${streakNextMilestone.days}d` }}
            (+{{ streakNextMilestone.bonus }} RC/day)
          </span>
        </p>
        <p v-else class="text-[10px] text-emerald-400 font-semibold">
          {{ i18n.locale === 'es' ? '¡Bonus semanal reclamado! +75 RC' : 'Weekly bonus claimed! +75 RC' }}
        </p>
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
      class="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-muted">
            {{ i18n.locale === 'es' ? 'Plan activo' : 'Active plan' }}
          </p>
          <p class="mt-1 text-sm font-black text-foreground">
            {{ i18n.t(trainingStore.activePlan.titleKey) }}
            <span v-if="trainingStore.isPlanPaused" class="text-amber-400">· {{ i18n.locale === 'es' ? 'Pausado' : 'Paused' }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="trainingStore.isPlanPaused"
            type="button"
            class="plan-action"
            @click="resumePlan"
          >
            {{ i18n.locale === 'es' ? 'Reanudar' : 'Resume' }}
          </button>
          <button
            v-else
            type="button"
            class="plan-action"
            @click="pausePlan"
          >
            {{ i18n.locale === 'es' ? 'Pausar' : 'Pause' }}
          </button>
          <button type="button" class="plan-action" @click="openPlanPicker">
            {{ i18n.locale === 'es' ? 'Cambiar plan' : 'Change plan' }}
          </button>
          <button type="button" class="plan-action text-red-300 hover:text-red-200" @click="abandonPlan">
            {{ i18n.locale === 'es' ? 'Abandonar' : 'Abandon' }}
          </button>
        </div>
      </div>
    </section>

    <section
      v-else-if="shouldShowPlanPromo"
      class="rounded-[1.5rem] border border-primary-500/35 bg-primary-500/10 p-4 shadow-[0_0_35px_hsl(var(--primary) / 0.08)] sm:p-5"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-start justify-between gap-3">
            <p class="text-[10px] font-black uppercase tracking-[0.22em] text-primary-500">
              {{ i18n.locale === 'es' ? 'Empieza tu progresion' : 'Start your progression' }}
            </p>
            <button
              type="button"
              class="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition hover:text-foreground active:scale-95"
              :aria-label="i18n.locale === 'es' ? 'Ocultar bloque de plan guiado' : 'Hide guided plan block'"
              @click="dismissPlanPromo"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <h3 class="mt-2 text-2xl font-bold uppercase leading-tight text-foreground">
            {{ i18n.locale === 'es' ? 'Elige un plan guiado' : 'Choose a guided plan' }}
          </h3>
          <p class="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-muted/75">
            {{ i18n.locale === 'es' ? 'Reppy te dira que entrenar hoy, bloqueara el siguiente dia hasta manana y convertira tus reps en progreso real.' : 'Reppy will tell you what to train today, lock the next day until tomorrow, and turn your reps into real progress.' }}
          </p>
        </div>
        <button type="button" class="btn-reppy w-full !py-4 px-5 sm:w-auto" @click="openPlanPicker">
          {{ i18n.locale === 'es' ? 'Ver planes' : 'View plans' }}
        </button>
      </div>
    </section>

    <div v-if="shouldShowFreeLogToggle" class="flex justify-center">
      <button
        type="button"
        class="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted transition hover:border-primary-500/30 hover:text-foreground active:scale-95"
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
      class="w-full rounded-2xl border p-4 sm:p-6 transition-all duration-500"
      :class="missionCompletionPulse ? 'border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_35px_rgba(16,185,129,0.2)]' : 'border-primary-500/25 bg-primary-500/10'"
    >
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="flex-1 min-w-0 space-y-2">
          <p class="text-xs font-semibold text-primary-500">
            {{ i18n.locale === 'es' ? 'Misión de hoy' : "Today's mission" }}
          </p>
          <h3 class="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-tight">
            {{ todayMissionTitle }}
          </h3>
          <p class="text-[11px] font-semibold text-muted/75 leading-relaxed">
            {{ todayMissionHowTo }}
          </p>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span class="text-muted">{{ todayMissionProgressLabel }}</span>
              <span :class="isDailyObjectiveDone ? 'text-emerald-500' : 'text-primary-500'">{{ todayMissionPercent }}%</span>
            </div>
            <div class="h-2 rounded-full bg-white/10 border border-white/10 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="isDailyObjectiveDone ? 'bg-emerald-500' : 'bg-primary-500'"
                :style="{ width: `${todayMissionPercent}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Compact reward + CTA row (streak shown above separately) -->
        <div class="flex flex-wrap items-center gap-2 mt-2">
          <div class="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Coins class="w-3.5 h-3.5 text-primary-500 shrink-0" />
            <span>{{ todayMissionRewardLabel }}</span>
          </div>
          <button
            @click="handleTodayMissionAction"
            class="ml-auto rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95"
            :class="isDailyObjectiveDone ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-primary-500 hover:bg-primary-400 text-white'"
          >
            {{ todayMissionActionLabel }}
          </button>
        </div>
      </div>
    </section>

    <ExerciseSelector v-model="activeExercise" class="w-full hidden md:block" />

    <!-- Mobile toggle: show advanced stats on demand -->
    <div class="lg:hidden">
      <button
        @click="showAdvancedStats = !showAdvancedStats"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.05] text-sm font-semibold text-muted hover:text-foreground transition-all active:scale-[0.98]"
      >
        <BarChart3 class="w-4 h-4" />
        {{ showAdvancedStats ? (i18n.locale === 'es' ? 'Ocultar estadísticas' : 'Hide stats') : (i18n.locale === 'es' ? 'Ver estadísticas y boss' : 'Stats & boss') }}
        <ChevronDown class="w-4 h-4 transition-transform duration-200" :class="showAdvancedStats ? 'rotate-180' : ''" />
      </button>
    </div>

    <!-- 3. Global Intel & Metrics (hidden on mobile until toggled) -->
    <section v-show="showAdvancedStats || isDesktop" class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
      <!-- Boss Intel -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center gap-3 px-2">
          <Zap class="w-4 h-4 text-primary-500" />
          <h3 class="text-xs font-black uppercase tracking-widest text-muted/60">{{ i18n.t('dash_boss_status') }}</h3>
        </div>
        
        <!-- Live Battle Presence -->
        <LivePresence class="mb-4" />

        <BossHealth ref="bossHealthRef" />
      </div>

      <!-- Quick Metrics Bento -->
      <div class="grid grid-cols-1 gap-4 h-full">
         <!-- Combat Power (New Breakdown Card) -->
         <div class="bg-gradient-to-br from-primary-500/10 to-surface/5 border border-primary-500/20 rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Sword class="w-32 h-32 text-primary-500" />
            </div>
            
            <div class="flex items-center justify-between relative z-10">
              <span class="text-[10px] font-black text-primary-500 uppercase tracking-widest">{{ i18n.t('ui_combat_power') }}</span>
              <Sword class="w-4 h-4 text-primary-500" />
            </div>

            <div class="mt-4 relative z-10">
              <div class="flex items-baseline gap-2">
                <template v-if="isLoading">
                  <div class="h-10 w-28 bg-foreground/10 rounded-xl animate-pulse"></div>
                </template>
                <template v-else>
                  <span class="text-4xl font-bold text-foreground italic tracking-tighter">
                    {{ stats.combatPower.minDamage }}
                  </span>
                  <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18n.t('ui_dmg_range') }}</span>
                </template>
              </div>
              <div class="text-xs font-bold text-primary-500/60 uppercase tracking-[0.2em] mt-1 italic">
                <template v-if="isLoading">
                  <div class="h-3 w-20 bg-foreground/5 rounded animate-pulse mt-1"></div>
                </template>
                <template v-else>
                  {{ i18n.t('ui_avg_estimated') }}: {{ stats.combatPower.total }}
                </template>
              </div>
              
              <!-- Detailed Breakdown -->
              <div class="grid grid-cols-1 gap-2 mt-6 pt-6 border-t border-white/5">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-muted/60 uppercase">{{ i18n.t('dash_base_skill') }}</span>
                  <div v-if="isLoading" class="h-3 w-10 bg-foreground/10 rounded animate-pulse"></div>
                  <span v-else class="text-xs font-black text-foreground italic">{{ stats.combatPower.base }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-primary-400 uppercase">⚔️ {{ i18n.t('dash_gear_bonus') }}</span>
                  <div v-if="isLoading" class="h-3 w-10 bg-foreground/10 rounded animate-pulse"></div>
                  <span v-else class="text-xs font-black text-primary-400 italic">+{{ stats.combatPower.gear }}</span>
                </div>
                <div class="flex justify-between items-center" v-if="stats.combatPower.buff > 0">
                  <span class="text-xs font-bold text-neon-lime uppercase">🧪 {{ i18n.t('dash_active_buffs') }}</span>
                  <span class="text-xs font-black text-neon-lime italic">+{{ stats.combatPower.buff }}</span>
                </div>

                <!-- Contribution Bar -->
                <div class="mt-4 space-y-1.5" v-if="stats.combatPower.buff > 0">
                  <div class="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-neon-lime shadow-[0_0_10px_rgba(183,255,0,0.4)] transition-all duration-1000" 
                         :style="{ width: Math.min(100, (stats.combatPower.buff / stats.combatPower.total) * 100) + '%' }"></div>
                  </div>
                  <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted/40">
                    <span>{{ i18n.t('dash_potion_impact') }}</span>
                    <span class="text-neon-lime">{{ Math.round((stats.combatPower.buff / stats.combatPower.total) * 100) }}% {{ i18n.t('dash_of_total') }}</span>
                  </div>
                </div>
                
                <!-- Active Potion Timer (Real-time) -->
                <div v-for="boost in activePotions" :key="boost.type" class="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <FlaskConical class="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                    <span class="text-xs font-black text-emerald-500 uppercase tracking-widest">{{ boost.label }} {{ boost.value }}</span>
                  </div>
                  <span class="text-[10px] font-black text-foreground font-mono">{{ boost.timeLeft }}</span>
                </div>
              </div>
            </div>
         </div>

         <div class="grid grid-cols-2 gap-4">
            <!-- Total reps -->
            <div class="bg-surface/10 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
              <Activity class="w-3.5 h-3.5 text-primary-500 mb-4" />
              <div>
                <div v-if="isLoading" class="h-8 w-20 bg-foreground/10 rounded-xl animate-pulse mb-1"></div>
                <span v-else class="text-3xl font-bold text-foreground tabular-nums">{{ totalReps }}</span>
                <p class="text-xs font-semibold text-muted/60 mt-1">{{ i18n.locale === 'es' ? 'Reps totales' : 'Total reps' }}</p>
              </div>
            </div>
            <!-- Tonnage -->
            <div class="bg-surface/10 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
              <Trophy class="w-3.5 h-3.5 text-primary-500 mb-4" />
              <div>
                <div v-if="isLoading" class="h-8 w-20 bg-foreground/10 rounded-xl animate-pulse mb-1"></div>
                <span v-else class="text-3xl font-bold text-foreground tabular-nums">{{ ((stats.totalVolume || 0) / 1000).toFixed(1) }}</span>
                <p class="text-xs font-semibold text-muted/60 mt-1">{{ i18n.t('dash_tons_moved') }}</p>
              </div>
            </div>
         </div>

         <!-- Missions Entry Point -->
         <div 
          @click="router.push({ name: 'missions', params: { lang: i18n.locale } })"
          class="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-between group cursor-pointer transition-all active:scale-95"
         >
            <div class="flex items-center justify-between">
              <Target class="w-4 h-4 text-indigo-400" />
              <div v-if="unclaimedMissions > 0" class="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500 text-[10px] font-black text-foreground uppercase rounded-full animate-pulse">
                {{ unclaimedMissions }} {{ i18n.t('missions_available') || 'READY' }}
              </div>
            </div>
            <div class="mt-4">
              <span class="text-xl font-black text-foreground  tracking-tighter ">{{ i18n.t('nav_missions') }}</span>
              <p class="text-xs font-black text-indigo-400/60 uppercase tracking-widest mt-1">{{ i18n.t('missions_subtitle') }}</p>
            </div>
         </div>
      </div>
    </section>

    <!-- 4. Combat Analytics (Tabbed, also follows mobile toggle) -->
    <section v-show="showAdvancedStats || isDesktop" class="space-y-6">
      <div class="flex items-center justify-center p-1 bg-surface/20 border border-white/5 rounded-2xl w-fit mx-auto">
        <button 
          @click="activeTab = 'heatmap'"
          class="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          :class="activeTab === 'heatmap' ? 'bg-primary-500 text-foreground shadow-lg shadow-primary-500/20' : 'text-muted/40 hover:text-foreground'"
        >
          {{ i18n.t('activity_stream') }}
        </button>
        <button 
          @click="activeTab = 'history'"
          class="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          :class="activeTab === 'history' ? 'bg-primary-500 text-foreground shadow-lg shadow-primary-500/20' : 'text-muted/40 hover:text-foreground'"
        >
          {{ i18n.t('dash_history_title') }}
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="activeTab === 'heatmap'" key="heatmap" class="bg-surface/5 border border-white/5 rounded-2xl p-6 sm:p-10">
          <Heatmap 
            :data="heatmapData" 
            :key="`${activeExercise}-${activeYear}`" 
            :loading="isLoading"
            :selected-year="activeYear"
            :exercise-label="activeExerciseLabel"
            class="transition-opacity duration-300"
            :class="isLoading ? 'opacity-50' : 'opacity-100'"
          />
        </div>

        <div v-else key="history" class="bg-surface/5 border border-white/5 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-muted/40 text-xs uppercase font-black tracking-[0.3em] border-b border-white/5">
                  <th class="px-10 py-6">{{ i18n.t('ui_timestamp') }}</th>
                  <th class="px-10 py-6 text-right">{{ i18n.t('ui_magnitude') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.02]">
                <tr v-for="rep in reps" :key="rep.id" class="group hover:bg-white/[0.02] transition-colors">
                  <td class="px-10 py-6">
                    <span class="text-xs font-bold text-muted/60 group-hover:text-foreground transition-colors uppercase tracking-tight">
                      {{ formatDate(rep.date) }}
                    </span>
                  </td>
                  <td class="px-10 py-6 text-right">
                    <div v-if="editingId === rep.id" class="flex items-center justify-end gap-3">
                      <input v-model.number="editValue" type="number"
                        class="w-20 bg-surface/60 border border-primary-500/30 rounded-xl px-2 py-1.5 text-right font-black italic focus:outline-none text-foreground"
                        @keyup.enter="saveEdit(rep.id)" />
                      <button @click="saveEdit(rep.id)" class="text-primary-500"><Check class="w-4 h-4" /></button>
                    </div>
                    <div v-else class="flex items-center justify-end gap-6">
                      <span @click="startEdit(rep)" class="text-2xl font-bold italic tracking-tighter text-foreground cursor-pointer hover:text-primary-500 transition-colors">
                        {{ rep.count }}
                      </span>
                      <button @click="confirmDelete(rep.id)" class="opacity-0 group-hover:opacity-100 text-muted/20 hover:text-red-500 transition-all">
                        <Trash2 class="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="reps.length === 0">
                  <td colspan="2" class="py-24 text-center">
                    <Inbox class="w-12 h-12 mx-auto mb-4 text-muted/20" />
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-muted/20">{{ i18n.t('dash_protocol_null') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import {
  Trophy, Target, Flame, Zap, Activity, History, Inbox,
  BarChart3, Check, X, Trash2, Globe, Sword, Swords, FlaskConical, Coins, Snowflake, ChevronDown, Share2
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useTrainingStore } from '@/stores/training';
import Heatmap from '@/components/training/Heatmap.vue';
import RepsInput from '@/components/training/RepsInput.vue';
import ExerciseSelector from '@/components/training/ExerciseSelector.vue';
import BossHealth from '@/components/boss/BossHealth.vue';
import RadialProgress from '@/components/ui/RadialProgress.vue';
import RPGReleaseModal from '@/components/modals/RPGReleaseModal.vue';
import LivePresence from '@/components/ui/LivePresence.vue';
import QuickStartOnboardingModal from '@/components/modals/QuickStartOnboardingModal.vue';
import GoalOnboardingModal from '@/components/modals/GoalOnboardingModal.vue';
import TodayWorkout from '@/components/training/TodayWorkout.vue';
import WeeklyShareCard from '@/components/modals/WeeklyShareCard.vue';
import { getLocalDateString } from '@/utils/dateUtils.js';
import { buildActiveBoosts } from '@/utils/activeBuffs';

const emit = defineEmits(['viewProfile', 'start']);
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
const activeYear = ref(2026);
const showRPGModal = ref(false);
const showQuickStartModal = ref(false);
const showGoalOnboarding = ref(false);
const showFreeLog = ref(false);
const activeTab = ref('heatmap');
const showAdvancedStats = ref(false);
const isDesktop = computed(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
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
    '"Ese boss no te espera: te esta guardando sitio."',
    '"Tus limites tienen barra de vida. Bajala hoy."',
    '"El respawn es entrar otra vez y registrar reps."',
    '"No eres el minion del mapa. Eres la raid entera."',
    '"Hoy farmeas fuerza. Manana desbloqueas leyenda."',
    '"El jefe final tambien empezo con una repeticion."',
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

const streakDaysLabel = computed(() => {
  const days = Number(streakStatus.value?.streak || 0);
  if (i18n.locale === 'es') return days === 1 ? 'dia activo' : `Racha de ${days} dias `;
  return days === 1 ? 'active day' : 'active days';
});

// Streak milestones: days threshold → bonus RC per day label and visual tier
const STREAK_MILESTONES = [
  { days: 7,  bonus: 10,  level: 1, label: i18n.locale === 'es' ? 'SEMANA' : 'WEEK',   cardClass: 'border-orange-500/30 bg-orange-500/8',   iconWrapClass: 'w-14 h-14', iconClass: 'h-8 w-8 text-orange-400', glowClass: 'bg-orange-500', numberClass: 'text-4xl text-orange-300', badgeClass: 'bg-orange-500/20 text-orange-300', barClass: 'bg-orange-500' },
  { days: 14, bonus: 25,  level: 2, label: i18n.locale === 'es' ? '2 SEMANAS' : '2 WEEKS', cardClass: 'border-red-500/30 bg-red-500/8',      iconWrapClass: 'w-16 h-16', iconClass: 'h-9 w-9 text-red-400',    glowClass: 'bg-red-500',    numberClass: 'text-4xl text-red-300',    badgeClass: 'bg-red-500/20 text-red-300',    barClass: 'bg-red-500' },
  { days: 30, bonus: 50,  level: 3, label: i18n.locale === 'es' ? 'MES' : 'MONTH',      cardClass: 'border-purple-500/30 bg-purple-500/8',  iconWrapClass: 'w-16 h-16', iconClass: 'h-10 w-10 text-purple-400',glowClass: 'bg-purple-500', numberClass: 'text-5xl text-purple-300', badgeClass: 'bg-purple-500/20 text-purple-300',barClass: 'bg-purple-500' },
  { days: 60, bonus: 100, level: 4, label: i18n.locale === 'es' ? 'LEYENDA' : 'LEGEND',  cardClass: 'border-yellow-400/40 bg-yellow-500/8',  iconWrapClass: 'w-18 h-18', iconClass: 'h-11 w-11 text-yellow-300',glowClass: 'bg-yellow-400', numberClass: 'text-5xl text-yellow-200', badgeClass: 'bg-yellow-400/20 text-yellow-300',barClass: 'bg-yellow-400' },
];

const DEFAULT_TIER = { level: 0, label: null, cardClass: 'border-primary-500/20 bg-primary-500/8', iconWrapClass: 'w-12 h-12', iconClass: 'h-7 w-7 text-primary-400', glowClass: '', numberClass: 'text-3xl text-foreground', badgeClass: '', barClass: 'bg-primary-500' };

const streakTier = computed(() => {
  const days = Number(streakStatus.value?.streak || 0);
  if (streakStatus.value?.showRisk) {
    return { ...DEFAULT_TIER, cardClass: 'border-amber-500/30 bg-amber-500/8', iconClass: 'h-7 w-7 text-amber-400', numberClass: 'text-3xl text-amber-300', barClass: 'bg-amber-500' };
  }
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    if (days >= STREAK_MILESTONES[i].days) return STREAK_MILESTONES[i];
  }
  return DEFAULT_TIER;
});

const streakNextMilestone = computed(() => {
  const days = Number(streakStatus.value?.streak || 0);
  return STREAK_MILESTONES.find(m => m.days > days) || null;
});

const streakDays7 = computed(() => Math.min(Number(streakStatus.value?.streak || 0), 7));

const streakStateLabel = computed(() => {
  const status = streakStatus.value;
  if (!status) return '';
  if (status.trainedToday) return i18n.locale === 'es' ? 'Protegida: ya entrenaste hoy.' : 'Protected: you trained today.';
  if (status.frozenToday) return i18n.locale === 'es' ? 'Protegida con congelacion hasta manana.' : 'Protected with a freeze until tomorrow.';
  if (status.isAtRisk) {
    return i18n.locale === 'es'
      ? `En riesgo`
      : `At risk: ${status.hoursLeftToday} h left to save it.`;
  }
  return i18n.locale === 'es' ? 'Entrena hoy para empezar o subir tu racha.' : 'Train today to start or grow your streak.';
});

const freezeButtonLabel = computed(() => {
  const cost = Number(streakStatus.value?.freezeCost || 0);
  if (freezingStreak.value) return i18n.locale === 'es' ? 'Congelando...' : 'Freezing...';
  return i18n.locale === 'es' ? `Congelar por ${cost}` : `Freeze for ${cost} coins`;
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
    console.log('Fetched streak status:', res.data);
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
    notificationStore.notify(
      i18n.locale === 'es' ? 'Racha congelada hasta manana' : 'Streak frozen until tomorrow',
      'success'
    );
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || (i18n.locale === 'es' ? 'No se pudo congelar la racha' : 'Could not freeze streak'), 'error');
  } finally {
    freezingStreak.value = false;
  }
};

const scrollToRepsInput = async () => {
  if (activeExercise.value === 'all') {
    activeExercise.value = 'pullups';
  }
  await nextTick();
  repsInputSection.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  highlightRepsInput.value = true;
  setTimeout(() => {
    highlightRepsInput.value = false;
  }, 1500);
};

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
  topMonth: 'N/A',
  topMonthCount: 0,
  dailyGoal: 50,
  totalVolume: 0,
  bodyWeight: 75,
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
  return i18n.locale === 'es' ? 'Completa tu objetivo diario de reps' : 'Complete your daily reps objective';
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
  if (!todayMission.value) {
    return i18n.locale === 'es' ? '+50 RC' : '+50 RC';
  }
  const coins = Number(todayMission.value.reward_coins || 0);
  const gems = Number(todayMission.value.reward_gems || 0);
  const xp = Number(todayMission.value.reward_xp || 0);
  const parts = [];
  if (coins > 0) parts.push(`+${coins} RC`);
  if (gems > 0) parts.push(`+${gems} G`);
  if (xp > 0) parts.push(`+${xp} XP`);
  return parts.length ? parts.join(' · ') : (i18n.locale === 'es' ? 'Recompensa activa' : 'Active reward');
});

const todayMissionActionLabel = computed(() => {
  if (todayMission.value?.is_completed && !todayMission.value?.is_claimed) {
    return i18n.locale === 'es' ? 'Reclamar en Misiones' : 'Claim in Missions';
  }
  if (isDailyObjectiveDone.value) {
    return i18n.locale === 'es' ? 'Objetivo completado' : 'Objective completed';
  }
  const goalType = todayMission.value?.goal_type;
  if (goalType === 'social_likes') return i18n.locale === 'es' ? 'Ir a Social' : 'Go to Social';
  if (goalType === 'buy_any') return i18n.locale === 'es' ? 'Ir a Tienda' : 'Go to Shop';
  if (goalType === 'use_consumable') return i18n.locale === 'es' ? 'Ir a Inventario' : 'Go to Inventory';
  return i18n.locale === 'es' ? 'Registrar reps ahora' : 'Log reps now';
});

const shouldShowTodayMissionCard = computed(() => {
  if (!todayMissionStateLoaded.value) return false;
  if (!guidedTrainingStateLoaded.value) return false;
  if (trainingStore.todayWorkout || trainingStore.completedToday) return false;
  if (isDailyObjectiveDone.value) return false;
  return !['Objetivo completado', 'Objective completed'].includes(todayMissionActionLabel.value);
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

const getGoalTypeLabel = (goalType) => {
  const labels = {
    reps: i18n.locale === 'es' ? 'REPS' : 'REPS',
    damage: i18n.locale === 'es' ? 'DAÑO' : 'DAMAGE',
    streak: i18n.locale === 'es' ? 'DÍAS' : 'DAYS',
    xp_str: i18n.locale === 'es' ? 'XP FUERZA' : 'XP STRENGTH',
    xp_pwr: i18n.locale === 'es' ? 'XP POTENCIA' : 'XP POWER',
    xp_end: i18n.locale === 'es' ? 'XP RESISTENCIA' : 'XP ENDURANCE',
    xp_agi: i18n.locale === 'es' ? 'XP AGILIDAD' : 'XP AGILITY',
    social_likes: i18n.locale === 'es' ? 'LIKES' : 'LIKES',
    buy_any: i18n.locale === 'es' ? 'COMPRAS' : 'PURCHASES',
    use_consumable: i18n.locale === 'es' ? 'USOS' : 'USES',
    night_owl: i18n.locale === 'es' ? 'SESIÓN NOCTURNA' : 'NIGHT SESSION',
    personal_record: i18n.locale === 'es' ? 'RÉCORD' : 'RECORD',
  };
  return labels[goalType] || '';
};

const todayMissionHowTo = computed(() => {
  const mission = todayMission.value;
  const goalType = mission?.goal_type;
  const v = mission?.goal_value;
  if (!goalType) return i18n.locale === 'es' ? 'Registra entrenamiento para avanzar.' : 'Log training to progress.';

  const mapEs = {
    reps:            `Registra ${v} repeticiones (cualquier ejercicio).`,
    damage:          `Inflige ${v} de daño al boss registrando reps.`,
    streak:          `Mantén una racha de ${v} días seguidos.`,
    xp_str:          `Consigue ${v} XP de Fuerza (volumen y lastre).`,
    xp_pwr:          `Consigue ${v} XP de Potencia (muscle-ups, lastrado).`,
    xp_end:          `Consigue ${v} XP de Resistencia (muchas reps totales).`,
    xp_agi:          `Consigue ${v} XP de Agilidad (técnica/explosivo).`,
    social_likes:    `Da ${v} likes a publicaciones en Social.`,
    buy_any:         `Compra ${v} objeto${v > 1 ? 's' : ''} en la Tienda.`,
    use_consumable:  `Usa ${v} consumible${v > 1 ? 's' : ''} desde el Inventario.`,
    night_owl:       `Registra reps después de las 22:00.`,
    personal_record: `Supera tu récord personal de repeticiones en un día.`,
  };

  const mapEn = {
    reps:            `Log ${v} reps (any exercise).`,
    damage:          `Deal ${v} damage to the boss by logging reps.`,
    streak:          `Keep a ${v}-day streak.`,
    xp_str:          `Earn ${v} Strength XP (volume and weighted work).`,
    xp_pwr:          `Earn ${v} Power XP (muscle-ups, weighted pull-ups).`,
    xp_end:          `Earn ${v} Endurance XP (high total reps).`,
    xp_agi:          `Earn ${v} Agility XP (technical/explosive work).`,
    social_likes:    `Like ${v} posts in Social.`,
    buy_any:         `Buy ${v} item${v > 1 ? 's' : ''} in the Shop.`,
    use_consumable:  `Use ${v} consumable${v > 1 ? 's' : ''} from Inventory.`,
    night_owl:       `Log reps after 22:00.`,
    personal_record: `Beat your daily reps personal record.`,
  };

  return i18n.locale === 'es'
    ? (mapEs[goalType] || `Completa la misión desde la pantalla Misiones.`)
    : (mapEn[goalType] || `Complete the mission from the Missions screen.`);
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

const fetchData = async () => {
  isLoading.value = true;
  guidedTrainingStateLoaded.value = false;
  try {
    const params = { 
      type: activeExercise.value,
      year: activeYear.value 
    };
    const t = Date.now();
    const [repsRes, heatmapRes, statsRes] = await Promise.all([
      axios.get('/api/reps', { params: { ...params, t } }),
      axios.get('/api/reps/heatmap', { params: { ...params, t } }),
      axios.get('/api/reps/stats', { params: { ...params, t } }),
      fetchStreakStatus()
    ]);

    reps.value = repsRes.data;
    heatmapData.value = heatmapRes.data;
    totalReps.value = statsRes.data.totalReps;
    stats.streak = statsRes.data.streak;
    stats.topMonth = statsRes.data.topMonth;
    stats.topMonthCount = statsRes.data.topMonthCount;
    stats.dailyGoal = statsRes.data.dailyGoal || 50;
    stats.totalVolume = statsRes.data.totalVolume || 0;
    stats.bodyWeight = statsRes.data.bodyWeight || 75;
    stats.combatPower = statsRes.data.combatPower || { total: 0, base: 0, gear: 0, buff: 0 };
    await Promise.all([
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
  } finally {
    isLoading.value = false;
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
    notificationStore.notify('Entry updated', 'success');
    fetchData();
  } catch (err) {
    notificationStore.notify('Update failed', 'error');
  }
};

// Update data when exercise type changes
watch(activeExercise, () => {
  fetchData();
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
    'Delete Log',
    'Are you sure you want to delete this entry?',
    async () => {
      try {
        deletingRepIds.value.add(id);
        await axios.delete(`/api/reps/${id}`);
        notificationStore.notify('Entry deleted', 'success');
        fetchData();
      } catch (err) {
        if (err?.response?.status === 404) {
          // Already deleted or stale client state: update UI silently
          reps.value = reps.value.filter(r => r.id !== id);
          notificationStore.notify('Entry already removed', 'info');
          return;
        }
        notificationStore.notify('Delete failed', 'error');
      } finally {
        deletingRepIds.value.delete(id);
      }
    }
  );
};

let refreshInterval = null;

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
    notificationStore.notify(i18n.locale === 'es' ? 'Plan pausado' : 'Plan paused', 'success');
    await fetchData();
  } catch (error) {
    notificationStore.notify(i18n.locale === 'es' ? 'No se pudo pausar el plan' : 'Could not pause plan', 'error');
  }
};

const resumePlan = async () => {
  try {
    await trainingStore.resumePlan();
    notificationStore.notify(i18n.locale === 'es' ? 'Plan reanudado' : 'Plan resumed', 'success');
    await fetchData();
  } catch (error) {
    notificationStore.notify(i18n.locale === 'es' ? 'No se pudo reanudar el plan' : 'Could not resume plan', 'error');
  }
};

const abandonPlan = async () => {
  notificationStore.confirm(
    i18n.locale === 'es' ? 'Abandonar plan' : 'Abandon plan',
    i18n.locale === 'es' ? 'Podras elegir otro plan despues.' : 'You can choose another plan afterwards.',
    async () => {
      try {
        await trainingStore.abandonPlan();
        notificationStore.notify(i18n.locale === 'es' ? 'Plan abandonado' : 'Plan abandoned', 'success');
        await fetchData();
      } catch (error) {
        notificationStore.notify(i18n.locale === 'es' ? 'No se pudo abandonar el plan' : 'Could not abandon plan', 'error');
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
  // Auto-refresh removed to save Supabase/Vercel resources. 
  // Real-time events via Socket.io handle the live feel.
  // refreshInterval = setInterval(fetchData, 60000);
  
  // Timer for active effects
  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
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
      notificationStore.notify(
        i18n.locale === 'es' ? 'Mision diaria completada' : 'Daily mission completed',
        'success'
      );
      setTimeout(() => {
        missionCompletionPulse.value = false;
      }, 1800);
    }
  }
);
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.plan-action {
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(255 255 255 / 0.04);
  padding: 0.55rem 0.75rem;
  color: rgb(255 255 255 / 0.78);
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.plan-action:hover {
  border-color: rgb(255 69 0 / 0.35);
  color: rgb(255 255 255 / 0.95);
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
