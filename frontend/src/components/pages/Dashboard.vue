<template>
  <div class="max-w-7xl mx-auto w-full px-4 space-y-4 sm:space-y-6 pt-2 sm:pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
    :class="hasFloatingActions ? 'pb-40 lg:pb-52' : 'pb-24'">

    <!-- ✦ CAMPAMENTO — entrar a la batalla (acceso protagonista) ✦ -->
    <router-link :to="{ name: 'battle', params: { lang: i18n.locale } }"
      class="group relative block overflow-hidden rounded-3xl border border-orange-500/30 p-4 sm:p-5 shadow-lg shadow-orange-900/20 transition-transform active:scale-[0.99]">
      <div class="absolute inset-0 -z-10 bg-gradient-to-br from-[#1a0d09] via-[#2a120a] to-[#0c0705]"></div>
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_85%_-10%,rgba(234,88,12,0.45),transparent_55%)]"></div>
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-orange-300/80">{{ i18n.t('camp_title') }}</p>
            <NewBadge feature-key="battle_view" />
          </div>
          <h2 class="mt-1 text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {{ dayRingPercent > 0 ? i18n.t('camp_resume_adventure') : i18n.t('camp_start_adventure') }}
          </h2>
          <p class="mt-1 text-xs text-orange-100/60">{{ i18n.t('camp_enter_battle_hint') }}</p>
        </div>
        <span class="shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 transition-transform group-active:scale-95 group-hover:scale-105">
          <Sword class="h-7 w-7" />
        </span>
      </div>
    </router-link>

    <!-- ✦ ESTACIONES DEL CAMPAMENTO — gestión entre batallas (rutas existentes) ✦ -->
    <div class="grid grid-cols-4 gap-2 sm:gap-3">
      <router-link v-for="st in campStations" :key="st.id" :to="st.to"
        class="group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-amber-500/15 bg-foreground/[0.03] py-3 transition-all hover:border-amber-500/35 hover:bg-amber-500/[0.06] active:scale-[0.97]">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-105">
          <component :is="st.icon" class="h-[18px] w-[18px]" />
        </span>
        <span class="text-[10px] sm:text-[11px] font-bold text-foreground/80">{{ st.label }}</span>
        <span v-if="st.count > 0"
          class="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-background">
          {{ st.count }}
        </span>
        <span v-else-if="st.dot"
          class="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background"></span>
      </router-link>
    </div>


    <!-- ✦ BOSS LEVEL — tap to open the skill tree (Senda del Boss) ✦ -->
    <div
      class="tap-card relative overflow-hidden rounded-3xl border border-border/60 bg-foreground/[0.03] p-4 sm:p-5"
      role="button"
      tabindex="0"
      @click="skillTreeStore.openModal()"
      @keydown.enter="skillTreeStore.openModal()"
    >
      <ChevronRight class="absolute right-3 top-3 h-4 w-4 text-muted/40" aria-hidden="true" />
      <div class="flex items-center gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-xs font-semibold text-muted">{{ i18n.t('dash_boss_level') }}</p>
            <span
              v-if="skillTreeStore.skillPoints > 0"
              class="rounded-full bg-[hsl(var(--neon))]/15 px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--neon))] glow-neon"
            >{{ i18n.t('skilltree_points_available', { n: skillTreeStore.skillPoints }) }}</span>
          </div>
          <p class="mt-0.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-none">
            {{ i18n.t('comp_level_short') }} {{ userLevel }}
          </p>
          <div class="mt-3 h-2 rounded-full bg-foreground/10 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :style="{ width: bossXpPercent + '%', background: 'linear-gradient(90deg, hsl(var(--neon)), hsl(var(--neon-violet)))' }"
            ></div>
          </div>
          <p class="mt-1.5 text-[11px] text-muted/70 tabular-nums">{{ fmtNum(bossXpInto) }} / {{ fmtNum(bossXpFor) }} XP</p>
        </div>
        <div class="relative shrink-0 grid place-items-center">
          <div class="absolute inset-0 rounded-2xl glow-neon"></div>
          <AvatarFrame
            :src="authStore.user?.avatar_url"
            :border-css="authStore.user?.border_css"
            :size="isMobile ? 58 : 68"
            class="relative rounded-2xl"
          />
        </div>
      </div>
    </div>

    <!-- ✦ TODAY'S PROGRESS — twin neon rings ✦ -->
    <section>
      <h2 class="mb-3 text-xs font-bold uppercase tracking-wide text-muted/70">{{ i18n.t('dash_today_progress') }}</h2>
      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        <!-- Daily goal ring (teal) -->
        <div class="rounded-3xl border border-border/60 bg-foreground/[0.02] p-4 flex flex-col items-center">
          <div class="w-full flex items-center justify-between">
            <span class="text-xs font-semibold text-muted">{{ i18n.t('dash_daily_goal') }}</span>
          </div>
          <RadialProgress :progress="dayRingPercent" :size="ringSize" :stroke-width="9" color="neon" glow gradient class="my-2">
            <Zap class="w-4 h-4 text-[hsl(var(--neon))] mb-0.5" aria-hidden="true" />
            <span class="text-xl font-extrabold tabular-nums leading-none text-foreground">{{ animatedTodayProgress }}</span>
            <span class="mt-0.5 text-[10px] text-muted/70">/ {{ stats.dailyGoal }} {{ i18n.t('dash_pts_short') }}</span>
          </RadialProgress>
          <span class="text-sm font-bold text-[hsl(var(--neon))] tabular-nums">{{ dayRingPercent }}%</span>
        </div>

        <!-- Day streak ring (violet) -->
        <div class="rounded-3xl border border-border/60 bg-foreground/[0.02] p-4 flex flex-col items-center">
          <div class="w-full flex items-center justify-between">
            <span class="text-xs font-semibold text-muted">{{ i18n.t('dash_day_streak') }}</span>
            <span
              v-if="streakTier.label"
              class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-foreground/[0.06] text-muted"
            >{{ streakTier.label }}</span>
          </div>
          <RadialProgress :progress="streakRingPercent" :size="ringSize" :stroke-width="9" color="violet" glow gradient class="my-2">
            <Flame class="w-4 h-4 text-[hsl(var(--neon-violet))] mb-0.5" aria-hidden="true" />
            <span class="text-xl font-extrabold tabular-nums leading-none text-foreground">{{ streakStatus?.streak || 0 }}</span>
            <span class="mt-0.5 text-[10px] text-muted/70">{{ i18n.t('streak_days_unit') }}</span>
          </RadialProgress>
          <span class="text-sm font-bold text-[hsl(var(--neon-violet))] tabular-nums">{{ weeklyBonusProgress }}/{{ weeklyBonusTarget }}</span>
        </div>
      </div>
    </section>

    <!-- ✦ NEXT MILESTONE — XP to the next level + glowing gem ✦ -->
    <div class="relative overflow-hidden rounded-3xl border border-[hsl(var(--neon-violet))]/25 bg-[hsl(var(--neon-violet))]/[0.06] p-4 flex items-center gap-4">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-muted">{{ i18n.t('dash_next_milestone') }}</p>
        <p class="mt-0.5 text-base sm:text-lg font-bold text-foreground truncate">{{ i18n.t('dash_reach_level', { n: nextLevel }) }}</p>
        <p class="text-[11px] text-muted/70 tabular-nums">{{ i18n.t('dash_xp_to_go', { n: fmtNum(xpToGo) }) }}</p>
        <div class="mt-2 h-2 rounded-full bg-foreground/10 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700"
            :style="{ width: bossXpPercent + '%', background: 'linear-gradient(90deg, hsl(var(--neon-violet)), hsl(var(--neon)))' }"
          ></div>
        </div>
      </div>
      <Gem class="h-11 w-11 sm:h-12 sm:w-12 shrink-0 text-[hsl(var(--neon-violet))]" aria-hidden="true" style="filter: drop-shadow(0 0 10px hsl(var(--neon-violet) / 0.6))" />
    </div>

    <!-- Streak at-risk alert (retention: keep the freeze CTA prominent) -->
    <div
      v-if="streakStatus && streakStatus.isAtRisk && !streakStatus.frozenToday"
      class="flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/[0.08] px-4 py-3"
    >
      <Snowflake class="h-5 w-5 text-amber-400 shrink-0" aria-hidden="true" />
      <p class="flex-1 min-w-0 text-xs font-medium text-amber-300">{{ streakStateLabel }}</p>
      <button
        type="button"
        class="shrink-0 rounded-xl border border-amber-500/50 bg-amber-500/15 text-amber-200 px-3 py-2 text-xs font-semibold disabled:opacity-40 active:scale-95 transition-transform"
        :disabled="!streakStatus.canFreeze || freezingStreak"
        @click="freezeStreak"
      >
        {{ freezeButtonLabel }}
      </button>
    </div>

    <!-- Quick log (mobile): register on entry — exercise pre-selected, no scroll -->
    <div
      v-if="isMobile"
      ref="repsInputSectionMobile"
      class="rounded-2xl border border-[hsl(var(--neon))]/30 bg-[hsl(var(--neon))]/[0.05] p-3.5 transition-all duration-500"
      :class="highlightRepsInput ? 'ring-2 ring-[hsl(var(--neon))]/60' : ''"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <Zap class="h-4 w-4 text-[hsl(var(--neon))]" aria-hidden="true" />
          <h2 class="text-xs font-bold uppercase tracking-wide text-muted/70">{{ i18n.t('dash_quick_log') }}</h2>
        </div>
        <span class="text-xs text-muted/70 tabular-nums"><b class="text-[hsl(var(--neon))] font-bold">{{ animatedTodayProgress }}</b> / {{ stats.dailyGoal }} {{ i18n.t('comp_today') }}</span>
      </div>
      <ExerciseSelector v-model="activeExercise" compact hide-overview class="w-full" />
      <RepsInput :exercise-type="logExercise" @updated="refreshAfterLog" class="mt-3" />
    </div>

    <!-- ✦ TODAY'S CHALLENGES — daily missions overview (mockup) ✦ -->
    <section v-if="dailyChallenges.length">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wide text-muted/70">{{ i18n.t('dash_today_challenges') }}</h2>
        <button type="button" class="flex items-center gap-0.5 text-xs font-semibold text-[hsl(var(--neon))]" @click="router.push({ name: 'missions', params: { lang: i18n.locale } })">
          {{ i18n.t('dash_view_all') }}
          <ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <div class="space-y-2.5">
        <button
          v-for="m in dailyChallenges.slice(0, 3)"
          :key="m.id"
          type="button"
          class="tap-card w-full flex items-center gap-3 rounded-2xl border border-border/60 bg-foreground/[0.02] p-3 text-left"
          @click="router.push({ name: 'missions', params: { lang: i18n.locale }, query: { missionId: String(m.id) } })"
        >
          <div
            class="grid place-items-center h-10 w-10 shrink-0 rounded-xl"
            :class="m.is_completed && !m.is_claimed ? 'bg-[hsl(var(--neon))]/15' : 'bg-foreground/[0.05]'"
          >
            <component :is="challengeIcon(m)" class="h-5 w-5" :class="m.is_completed && !m.is_claimed ? 'text-[hsl(var(--neon))]' : 'text-muted'" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-semibold text-foreground truncate">{{ challengeTitle(m) }}</p>
              <span v-if="challengeReward(m)" class="shrink-0 rounded-full bg-[hsl(var(--neon-violet))]/15 px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--neon-violet))] whitespace-nowrap">{{ challengeReward(m) }}</span>
            </div>
            <p class="text-[11px] text-muted/70 truncate">{{ challengeDesc(m) }}</p>
            <div class="mt-1.5 flex items-center gap-2">
              <div class="h-1.5 flex-1 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{ width: challengePct(m) + '%', background: m.is_completed ? 'hsl(var(--neon))' : 'linear-gradient(90deg, hsl(var(--neon)), hsl(var(--neon-violet)))' }"
                ></div>
              </div>
              <span class="shrink-0 text-[10px] tabular-nums text-muted/70">{{ m.current_value || (m.is_completed ? m.goal_value : 0) }}/{{ m.goal_value }}</span>
            </div>
          </div>
        </button>
      </div>
    </section>

    <!-- Boss board (mobile): a friendly challenge, not a war room -->
    <button
      v-if="isMobile && bossData"
      type="button"
      class="w-full flex items-center gap-3 rounded-2xl border border-border/60 bg-foreground/[0.02] px-4 py-3 text-left hover:border-[hsl(var(--neon))]/30 transition-colors active:scale-[0.99]"
      @click="showBossHealth"
    >
      <div class="grid place-items-center h-10 w-10 shrink-0 rounded-xl bg-red-500/10">
        <Sword class="w-5 h-5 text-red-400" aria-hidden="true" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-foreground truncate">{{ i18n.t('comp_boss_taunt', { boss: bossData.name }) }}</p>
        <div class="mt-1.5 h-1.5 rounded-full bg-red-950/40 overflow-hidden">
          <div class="h-full bg-red-500 rounded-full" :style="{ width: `${bossHpPercent}%` }"></div>
        </div>
      </div>
      <ChevronRight class="w-5 h-5 text-muted/50 shrink-0" aria-hidden="true" />
    </button>

    <!-- ✦ SKILL TREE modal (opened from the "Tu nivel" card) ✦ -->
    <SkillTreeModal />

    <!-- Routines / quick-log placeholder: reserves the space of the guided-plan
         area on first load so the real content fills in WITHOUT pushing the rest
         of the page down (static layout, progressive fill). -->
    <div v-if="!guidedTrainingStateLoaded" class="space-y-4 pt-1" aria-hidden="true">
      <div class="h-4 w-28 rounded bg-foreground/10 animate-pulse"></div>
      <div class="h-28 rounded-2xl border border-border/60 bg-foreground/[0.03] animate-pulse"></div>
      <div v-if="!isMobile" class="h-72 rounded-3xl border border-border/60 bg-foreground/[0.03] animate-pulse"></div>
    </div>

    <!-- ===== MIS RUTINAS (rutinas fijas / creadas) ===== -->
    <section v-if="guidedTrainingStateLoaded" class="flex items-center justify-between gap-2 pt-1">
      <div class="flex items-center gap-2">
        <ClipboardList class="h-4 w-4 text-primary-500" aria-hidden="true" />
        <h2 class="text-xs font-bold uppercase tracking-wide text-muted/70">
          {{ i18n.locale === 'es' ? 'Mis rutinas' : 'My routines' }}
        </h2>
      </div>
      <button type="button" class="routine-chip" @click="showRoutineCarousel = true">
        <LayoutGrid class="h-3.5 w-3.5" aria-hidden="true" />
        {{ i18n.locale === 'es' ? 'Explorar' : 'Browse' }}
      </button>
    </section>

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
      class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-border/60 bg-foreground/[0.02] px-4 py-2.5"
    >
      <div class="flex min-w-0 items-center gap-2">
        <span class="text-[10px] font-bold uppercase tracking-widest text-muted/80">{{ i18n.t('dash_active_plan') }}</span>
        <span class="truncate text-sm font-bold text-foreground">{{ i18n.t(trainingStore.activePlan.titleKey) }}</span>
        <span
          v-if="trainingStore.isPlanPaused"
          class="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400"
        >{{ i18n.t('dash_plan_paused') }}</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button v-if="trainingStore.isPlanPaused" type="button" class="plan-action" @click="resumePlan">
          {{ i18n.t('dash_plan_resume') }}
        </button>
        <button v-else type="button" class="plan-action" @click="pausePlan">
          {{ i18n.t('dash_plan_pause') }}
        </button>
        <button type="button" class="plan-action" @click="openPlanPicker">
          {{ i18n.t('dash_plan_change') }}
        </button>
        <button type="button" class="plan-action text-red-300 hover:text-red-200" @click="abandonPlan">
          {{ i18n.t('dash_plan_abandon') }}
        </button>
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

    <!-- Empty state: no active plan -->
    <section
      v-if="guidedTrainingStateLoaded && !shouldShowTodayWorkout && !shouldShowActivePlanCard && !shouldShowPlanPromo"
      class="rounded-2xl border border-dashed border-primary-500/30 bg-primary-500/[0.05] p-5 text-center"
    >
      <Dumbbell class="mx-auto h-7 w-7 text-primary-500/70" aria-hidden="true" />
      <h3 class="mt-2 text-base font-bold text-foreground">
        {{ i18n.locale === 'es' ? 'Aún no tienes una rutina' : 'No routine yet' }}
      </h3>
      <p class="mx-auto mt-1 max-w-md text-sm text-muted/70">
        {{ i18n.locale === 'es'
          ? 'Explora planes guiados para entrenar con estructura.'
          : 'Browse guided plans to train with structure.' }}
      </p>
      <div class="mt-4 flex justify-center">
        <button type="button" class="btn-reppy px-5" @click="showRoutineCarousel = true">
          {{ i18n.locale === 'es' ? 'Explorar rutinas' : 'Browse routines' }}
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

    <!-- ===== REGISTRO RÁPIDO (desktop) — en móvil se muestra bajo el héroe ===== -->
    <section
      v-if="!isMobile && guidedTrainingStateLoaded && (!trainingStore.todayWorkout || showFreeLog)"
      class="space-y-4"
    >
      <div class="flex items-center gap-2">
        <Zap class="h-4 w-4 text-primary-500" aria-hidden="true" />
        <h2 class="text-xs font-bold uppercase tracking-wide text-muted/70">
          {{ i18n.locale === 'es' ? 'Registro rápido' : 'Quick log' }}
        </h2>
      </div>

      <!-- Desktop/tablet: ring/overview + glanceable stats fill the row -->
      <div class="w-full space-y-4">
        <ExerciseSelector v-model="activeExercise" compact hide-overview class="w-full" />

        <!-- Overview mode: no single exercise picked yet -->
        <div v-if="activeExercise === 'all'" class="bg-surface/5 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center p-8 sm:p-10">
          <Globe aria-hidden="true" class="w-10 h-10 text-muted/50 mb-3" />
          <h3 class="text-lg font-bold tracking-tight text-foreground">{{ i18n.t('dash_overview_mode') }}</h3>
          <p class="text-xs text-muted/60 max-w-[320px] mx-auto mt-1.5">{{ i18n.t('dash_overview_hint') }}</p>
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

        <!-- Day ring + glanceable stats (left) and the log counter (fills the row) -->
        <div
          v-else
          ref="repsInputSectionDesktop"
          class="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center transition-all duration-500 rounded-3xl border border-border/60 bg-foreground/[0.02] p-6"
          :class="highlightRepsInput ? 'ring-2 ring-primary-500/60' : ''"
        >
          <div class="flex flex-col items-center gap-4">
            <RadialProgress :progress="dayRingPercent" :size="184" :stroke-width="12">
              <div class="flex flex-col items-center">
                <span class="text-4xl font-bold tabular-nums leading-none text-foreground">{{ animatedTodayProgress }}</span>
                <span class="mt-2 text-xs text-muted/80">{{ i18n.t('dash_ring_of') }} {{ stats.dailyGoal }} · {{ activeExerciseLabel }}</span>
              </div>
            </RadialProgress>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 rounded-xl border border-border/60 bg-foreground/[0.03] px-3 py-2">
                <Sword class="w-3.5 h-3.5 text-primary-500 shrink-0" aria-hidden="true" />
                <span class="text-sm font-bold text-foreground tabular-nums">{{ stats.combatPower.total }}</span>
                <span class="text-[10px] text-muted/80">{{ i18n.t('comp_stat_power') }}</span>
              </div>
            </div>
          </div>

          <!-- Inline counter: fills the remaining width, no dead space -->
          <RepsInput :exercise-type="activeExercise" @updated="refreshAfterLog" class="w-full" />
        </div>
      </div>
    </section>

    <!-- Mission card skeleton: only while the mission slot is the one that will
         render (no guided workout for today) — avoids a placeholder that pops in
         then vanishes once the data says there's no mission card to show. -->
    <div
      v-if="guidedTrainingStateLoaded && !todayMissionStateLoaded && !shouldShowTodayWorkout"
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
          <p class="flex items-center gap-1.5 text-xs font-semibold text-primary-500">
            <Compass class="w-3.5 h-3.5" aria-hidden="true" />
            {{ i18n.t('dash_next_step') }}
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

    <!-- Stats & boss (always visible) -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <!-- Boss Intel -->
      <div ref="bossHealthSection" class="lg:col-span-2 space-y-4 scroll-mt-4">
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
                  <span class="text-[10px] font-semibold text-muted/80 uppercase tracking-wide">{{ i18n.t('ui_dmg_range') }}</span>
                </div>
                <p class="mt-1 text-xs text-muted/80">
                  {{ i18n.t('ui_avg_estimated') }}: <span class="font-semibold text-foreground/80">{{ stats.combatPower.total }}</span>
                  <span class="text-muted/80">
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
                <p class="text-xs text-muted/80 mt-0.5">{{ i18n.t('dash_total_reps') }}</p>
              </div>
            </div>
            <!-- Tonnage -->
            <div class="card-stats">
              <Trophy aria-hidden="true" class="w-4 h-4 text-primary-500" />
              <div class="mt-3">
                <div v-if="isLoading" class="h-7 w-16 bg-foreground/10 rounded-lg animate-pulse"></div>
                <span v-else class="text-2xl font-bold text-foreground tabular-nums">{{ ((stats.totalVolume || 0) / 1000).toFixed(1) }}</span>
                <p class="text-xs text-muted/80 mt-0.5">{{ i18n.t('dash_tons_moved') }}</p>
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
              <p class="text-xs text-muted/80 mt-0.5">{{ i18n.t('missions_subtitle') }}</p>
            </div>
         </button>
      </div>
    </section>

    <!-- Analytics: activity heatmap / history -->
    <section class="space-y-4">
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
            <p class="text-xs text-muted/80 mt-1 max-w-[280px] mx-auto">
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
                <p class="text-xs text-muted/80 mt-0.5">{{ formatDate(rep.date) }}</p>
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
            <p class="text-xs text-muted/80 mt-1 max-w-[260px] mx-auto">
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
    <RoutineCarouselModal
      :show="showRoutineCarousel"
      :active-slug="trainingStore.activePlan?.slug || ''"
      @close="showRoutineCarousel = false"
      @selected="handleGuidedPlanSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import {
  Trophy, Target, Flame, Zap, Activity, Inbox, Globe, Snowflake,
  Check, X, Trash2, Sword, FlaskConical, Coins, ChevronRight, Share2, Pencil,
  ClipboardList, LayoutGrid, Dumbbell, Compass, Sparkles, Gem,
  Gift, Shield, ShoppingBag
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useTrainingStore } from '@/stores/training';
import { useBossStore } from '@/stores/boss';
import { useRouletteStore } from '@/stores/roulette';
import { useSkillTreeStore } from '@/stores/skilltree';
import { useBadgesStore } from '@/stores/badges';
import Heatmap from '@/components/training/Heatmap.vue';
import RadialProgress from '@/components/ui/RadialProgress.vue';
import AvatarFrame from '@/components/ui/AvatarFrame.vue';
import RepsInput from '@/components/training/RepsInput.vue';
import ExerciseSelector from '@/components/training/ExerciseSelector.vue';
import BossHealth from '@/components/boss/BossHealth.vue';
import RPGReleaseModal from '@/components/modals/RPGReleaseModal.vue';
import LivePresence from '@/components/ui/LivePresence.vue';
import QuickStartOnboardingModal from '@/components/modals/QuickStartOnboardingModal.vue';
import GoalOnboardingModal from '@/components/modals/GoalOnboardingModal.vue';
import RoutineCarouselModal from '@/components/modals/RoutineCarouselModal.vue';
import TodayWorkout from '@/components/training/TodayWorkout.vue';
import WeeklyShareCard from '@/components/modals/WeeklyShareCard.vue';
import SkillTreeModal from '@/components/dashboard/SkillTreeModal.vue';
import NewBadge from '@/components/battle/NewBadge.vue';
import { getLocalDateString } from '@/utils/dateUtils.js';
import { buildActiveBoosts } from '@/utils/activeBuffs';

const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const trainingStore = useTrainingStore();
const bossStore = useBossStore();
const rouletteStore = useRouletteStore();
const skillTreeStore = useSkillTreeStore();
const badgesStore = useBadgesStore();

// Camp "stations": quick access to the RPG-loop destinations that are NOT in the
// bottom nav. Counts come from the shared badges store (fetched in App init).
const campStations = computed(() => [
  { id: 'missions', icon: ClipboardList, label: i18n.t('camp_station_missions'),
    to: { name: 'missions', params: { lang: i18n.locale } }, count: badgesStore.missions_claimable },
  { id: 'chests', icon: Gift, label: i18n.t('camp_station_chests'),
    to: { name: 'inventory', params: { lang: i18n.locale }, query: { cat: 'chests' } }, count: badgesStore.chests_total },
  { id: 'gear', icon: Shield, label: i18n.t('camp_station_gear'),
    to: { name: 'inventory', params: { lang: i18n.locale }, query: { tab: 'customization' } }, dot: badgesStore.inventory_new },
  { id: 'shop', icon: ShoppingBag, label: i18n.t('camp_station_shop'),
    to: { name: 'shop', params: { lang: i18n.locale } } },
]);

// Mirrors App.vue's floating-roulette visibility: when a wheel button (available
// or on cooldown) is shown bottom-right, reserve bottom space so it never traps
// the last metrics cards under it (issue #278).
const hasFloatingActions = computed(() =>
  authStore.isAuthenticated && (
    rouletteStore.canSpin || rouletteStore.dailyCanSpin ||
    !!rouletteStore.nextSpinAt || !!rouletteStore.dailyNextSpinAt
  )
);
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
const bossHealthSection = ref(null);
const isLoading = ref(false);
const activeYear = ref(new Date().getFullYear());
const showRPGModal = ref(false);
const showQuickStartModal = ref(false);
const showGoalOnboarding = ref(false);
const showRoutineCarousel = ref(false);
const showFreeLog = ref(false);
const activeTab = ref('heatmap');
const unclaimedMissions = ref(0);
const highlightRepsInput = ref(false);
const repsInputSectionMobile = ref(null);
const repsInputSectionDesktop = ref(null);
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < 768 : true);
const quickStartEvaluated = ref(false);
const showWeeklyCard = ref(false);
const suppressRPGModal = ref(false);
const todayMission = ref(null);
const dailyChallenges = ref([]); // daily missions list for the "Today's Challenges" card
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
const FIRST_REP_CELEBRATED_PREFIX = 'reppy_first_rep_celebrated_v1';

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

// Deterministic per local day: the quote stays stable across reloads/visits
// within the same day (less noisy than a fresh random pick every mount).
const pickDailyQuote = (locale) => {
  const quotes = locale === 'en' ? bossMotivationQuotes.en : bossMotivationQuotes.es;
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return quotes[dayOfYear % quotes.length];
};

const dailyQuote = ref(pickDailyQuote(i18n.locale));

watch(() => i18n.locale, (locale) => {
  dailyQuote.value = pickDailyQuote(locale);
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
const getFirstRepCelebratedKey = () => `${FIRST_REP_CELEBRATED_PREFIX}:${authStore.user?.id || 'guest'}`;

// One-shot celebration the very first time a user goes from 0 → first logged rep.
// Bigger confetti than the streak beat + a dedicated toast, marking the start of
// their journey. Guarded per-user in localStorage so it never fires twice.
const maybeCelebrateFirstRep = async () => {
  if (typeof window === 'undefined') return;
  const key = getFirstRepCelebratedKey();
  if (localStorage.getItem(key) === '1') return;
  localStorage.setItem(key, '1');

  notificationStore.notify(i18n.t('dash_first_rep_celebrate'), 'success');
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (reduceMotion) return;
  try {
    const { default: confetti } = await import('canvas-confetti');
    confetti({
      particleCount: 110,
      spread: 90,
      startVelocity: 38,
      origin: { y: 0.55 },
      colors: ['#3b82f6', '#60a5fa', '#34d399', '#fbbf24', '#ffffff']
    });
  } catch (_) {}
};

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

// Surfaces the inline rep counter into view (single logging surface — no modal).
// Ensures a concrete exercise is selected, reveals the desktop section if it was
// hidden by a guided workout, scrolls to it and briefly highlights it.
const scrollToRepsInput = async () => {
  if (activeExercise.value === 'all') {
    activeExercise.value = 'pullups';
  }
  showFreeLog.value = true;
  await nextTick();
  const target = isMobile.value ? repsInputSectionMobile.value : repsInputSectionDesktop.value;
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  highlightRepsInput.value = true;
  setTimeout(() => { highlightRepsInput.value = false; }, 1200);
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
  dailyGoal: 50,
  totalVolume: 0,
  combatPower: { total: 0, base: 0, gear: 0, buff: 0, critChance: 0, critMultiplier: 1, minDamage: 0, maxDamage: 0 }
});

const activeExerciseLabel = computed(() => {
  return i18n.t(activeExercise.value);
});

// The exercise the inline counter logs to. The "all" overview isn't loggable,
// so it falls back to pull-ups — keeps mobile quick-log always actionable.
const logExercise = computed(() =>
  activeExercise.value === 'all' ? 'pullups' : activeExercise.value
);

const firstName = computed(() =>
  authStore.user?.name?.split(' ')[0] || i18n.t('dash_default_athlete')
);

const userLevel = computed(() => authStore.user?.current_level || 1);

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

// Day aura fill: today's reps for the selected exercise vs the daily goal.
const dayRingPercent = computed(() => {
  const goal = Math.max(1, Number(stats.dailyGoal) || 0);
  return Math.min(100, Math.round((todayProgress.value / goal) * 100));
});

// Today's Progress ring sizing — slightly smaller on mobile so two fit side-by-side.
const ringSize = computed(() => (isMobile.value ? 116 : 132));

// Character-level XP (Boss Level + Next Milestone cards). Augmented by /users/me.
const bossXpInto = computed(() => Math.max(0, Number(authStore.user?.xp_into_level) || 0));
const bossXpFor = computed(() => Math.max(1, Number(authStore.user?.xp_for_next_level) || 1));
const bossXpPercent = computed(() => Math.min(100, Math.round((bossXpInto.value / bossXpFor.value) * 100)));
const nextLevel = computed(() => userLevel.value + 1);
const xpToGo = computed(() => Math.max(0, bossXpFor.value - bossXpInto.value));
const fmtNum = (n) => Number(n || 0).toLocaleString(i18n.locale === 'es' ? 'es-ES' : 'en-US');

// Day-streak ring fill: days trained this week toward the weekly jackpot.
const streakRingPercent = computed(() => {
  const target = Math.max(1, weeklyBonusTarget.value);
  return Math.min(100, Math.round((weeklyBonusProgress.value / target) * 100));
});

// Count-up: the ring number tweens to the new total after logging instead of
// snapping, giving the primary action a small celebratory beat. The ring stroke
// already animates via CSS; this just animates the displayed figure.
const animatedTodayProgress = ref(0);
let progressRaf = null;
watch(todayProgress, (to, from) => {
  if (typeof window === 'undefined') { animatedTodayProgress.value = to; return; }
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  // When hidden, rAF is paused — set directly so the figure never stays stale.
  if (reduceMotion || document.hidden) { animatedTodayProgress.value = to; return; }
  const start = Number(from) || 0;
  const startTime = performance.now();
  const duration = 600;
  cancelAnimationFrame(progressRaf);
  const step = (now) => {
    const p = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    animatedTodayProgress.value = Math.round(start + (to - start) * eased);
    if (p < 1) progressRaf = requestAnimationFrame(step);
  };
  progressRaf = requestAnimationFrame(step);
}, { immediate: true });

// ── Companion: the fighter's personality + the community boss as a friendly foe ──
const companionMood = computed(() => {
  const remaining = Math.max(0, (Number(stats.dailyGoal) || 0) - todayProgress.value);
  if (streakStatus.value?.isAtRisk && !streakStatus.value?.frozenToday) {
    return { icon: Flame, color: 'text-amber-400', text: i18n.t('comp_mood_risk') };
  }
  if (isDailyObjectiveDone.value) {
    return { icon: Check, color: 'text-emerald-500', text: i18n.t('comp_mood_done') };
  }
  if (todayProgress.value <= 0) {
    return { icon: Sword, color: 'text-primary-500', text: i18n.t('comp_mood_start') };
  }
  return { icon: Flame, color: 'text-primary-500', text: i18n.t('comp_mood_close', { n: remaining }) };
});

const bossData = computed(() => bossStore.activeBoss?.boss || null);
const bossHpPercent = computed(() => {
  const b = bossData.value;
  if (!b || !b.total_hp) return 0;
  return Math.max(0, Math.min(100, (b.current_hp / b.total_hp) * 100));
});

// Scroll to the boss-health component (always visible now).
const showBossHealth = async () => {
  await nextTick();
  bossHealthSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// ── Today's Challenges helpers (per-mission, reuse mission fields) ──
const challengePct = (m) => {
  if (m.is_completed) return 100;
  const goal = Math.max(1, Number(m.goal_value) || 1);
  return Math.max(0, Math.min(100, Math.round((Number(m.current_value || 0) / goal) * 100)));
};
const challengeReward = (m) => {
  if (Number(m.reward_xp) > 0) return `+${m.reward_xp} XP`;
  if (Number(m.reward_gems) > 0) return `+${m.reward_gems} G`;
  if (Number(m.reward_coins) > 0) return `+${m.reward_coins} RC`;
  return '';
};
const challengeTitle = (m) => (m.title_key ? i18n.t(m.title_key) : i18n.t('dash_mission_default_title'));
const challengeDesc = (m) => (m.goal_type ? i18n.t(`goal_howto_${m.goal_type}`, { v: m.goal_value }) : '');
const challengeIcon = (m) => {
  const t = m.goal_type || '';
  if (t === 'streak') return Flame;
  if (t === 'social_likes') return Share2;
  if (t === 'buy_any' || t === 'buy_legendary') return Coins;
  if (t === 'use_consumable') return FlaskConical;
  if (t.startsWith('xp_') || t === 'reps') return Dumbbell;
  return Trophy;
};

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
  if (goalType === 'buy_any' || goalType === 'buy_legendary') return i18n.t('dash_mission_go_shop');
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

const KNOWN_GOAL_TYPES = ['reps', 'damage', 'streak', 'xp_str', 'xp_pwr', 'xp_end', 'xp_agi', 'social_likes', 'buy_any', 'buy_legendary', 'use_consumable', 'night_owl', 'personal_record'];

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

// The 1s tick only exists to count down / expire active buffs. Run it solely
// while there are buffs, so an idle dashboard doesn't re-render every second.
// activePotions also reacts to authStore.user, so activating a buff (a user
// update) restarts the timer even while it's frozen. See issue #277.
const startEffectTimer = () => {
  if (timerInterval) return;
  currentTime.value = new Date();
  timerInterval = setInterval(() => { currentTime.value = new Date(); }, 1000);
};
const stopEffectTimer = () => {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
};

// Drive the timer off active-buff count, and refresh combat stats on expiry.
watch(() => activePotions.value.length, (newLen, oldLen = 0) => {
  if (newLen > 0) startEffectTimer();
  else stopEffectTimer();
  if (newLen < oldLen) refreshAfterLog();
}, { immediate: true });

const fetchGlobalData = async () => {
  // Don't reset `todayMissionStateLoaded` here — on the first load it starts
  // false (ref init) and flips true once; on later refreshes it stays true so
  // the mission card never unmounts/remounts (no flicker).
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
    // "Today's Challenges": all active missions (not yet claimed-and-done), with
    // claim-ready first, then daily, then the rest — so the card always has content.
    dailyChallenges.value = missionList
      .filter(m => !(m.is_completed && m.is_claimed))
      .sort((a, b) => {
        const score = (m) => (m.is_completed && !m.is_claimed ? 0 : 1) + (m.is_daily ? 0 : 0.1);
        return score(a) - score(b);
      });
    todayMissionStateLoaded.value = true;
  } catch (err) {
    console.error('Error fetching global dashboard data:', err);
    todayMission.value = null;
  }
};

// Exercise-scoped data only: reps history, heatmap and stats for the selected
// exercise. This is the ONLY thing that changes when you switch exercise — it
// must NOT touch missions, the guided plan or the streak (they're global).
// `silent` skips the loading skeletons: data is swapped in place without
// unmounting anything. Used after logging reps so the scroll position and DOM
// stay put — only the numbers change.
const fetchExerciseData = async ({ silent = false } = {}) => {
  if (!silent) isLoading.value = true;
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
    if (!silent) isLoading.value = false;
  }
};

// Lightweight refresh after a rep mutation (log/edit/delete) or a potion expiry.
// Updates exercise data + global state IN PLACE, without flipping
// `guidedTrainingStateLoaded` (which unmounts half the dashboard) or re-running
// onboarding — that's what used to cause the jarring scroll jump.
const refreshAfterLog = async () => {
  try {
    // Capture the historical-total BEFORE the refresh to detect the very first rep.
    const hadNoRepsBefore = Number(totalReps.value || 0) === 0;
    await fetchExerciseData({ silent: true });
    await Promise.all([
      fetchStreakStatus(),
      fetchGlobalData(),
      trainingStore.fetchMine()
    ]);
    if (bossHealthRef.value) bossHealthRef.value.refresh();
    // 0 → first ever rep: celebrate the start of the journey (once per user).
    if (hadNoRepsBefore && Number(totalReps.value || 0) > 0) {
      maybeCelebrateFirstRep();
    }
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
  }
};

// Full load: exercise data + global state (streak, missions, guided plan, boss)
// + first-run onboarding. Used on mount and after a plan mutation.
// IMPORTANT: it never flips `guidedTrainingStateLoaded` back to false. Once the
// layout is up it stays mounted; only the data inside refreshes. Flipping it off
// mid-load is what made the cards appear → disappear → reappear on every reload.
// `skipFetchMine`: on initial mount, onMounted already calls fetchMine() to
// reveal the layout early, so fetchData skips it to avoid a duplicate
// GET /api/training/me. Mutation-triggered calls keep the default (refresh it).
const fetchData = async ({ skipFetchMine = false } = {}) => {
  try {
    const statsRes = await fetchExerciseData();
    await Promise.all([
      fetchStreakStatus(),
      fetchGlobalData(),
      ...(skipFetchMine ? [] : [trainingStore.fetchMine()])
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
    refreshAfterLog();
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
        refreshAfterLog();
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
  if (goalType === 'buy_any' || goalType === 'buy_legendary') {
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

// Companion (mobile) vs Momentum (desktop/tablet) layout switch
const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(async () => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
  // Populate the skill-point pill on the "Tu nivel" card (modal refetches on open).
  skillTreeStore.fetchTree();

  // Check for exercise pre-selection from query params
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseParam = urlParams.get('exercise');
  if (exerciseParam) {
    activeExercise.value = exerciseParam;
  }

  // Don't let a single endpoint hiccup blank the whole dashboard.
  await trainingStore.fetchPlans().catch((e) => console.error('fetchPlans failed:', e));
  await trainingStore.fetchMine().catch((e) => console.error('fetchMine failed:', e));
  // Reveal the layout once, as soon as the plan/workout shape is known. From here
  // it stays mounted; the heavier per-exercise data fills in below without
  // unmounting anything (static layout, progressive load).
  guidedTrainingStateLoaded.value = true;
  planPromoDismissed.value = typeof window !== 'undefined' && localStorage.getItem(getPlanPromoDismissedKey()) === '1';
  // Onboarding-modal choice lives in a single place (fetchData → quickStart
  // evaluation), decided once on real data. Deciding here too — on a stale
  // totalReps of 0 — was the fragile bit that risked two modals stacking.

  fetchData({ skipFetchMine: true });
  handleLogQueryIntent();
  // The active-effects timer is started on demand by the activePotions watcher,
  // so an idle dashboard with no buffs never ticks every second (issue #277).
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (progressRaf) cancelAnimationFrame(progressRaf);
  window.removeEventListener('resize', updateIsMobile);
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

.routine-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  border: 1px solid hsl(var(--primary) / 0.25);
  background: hsl(var(--primary) / 0.1);
  padding: 0.375rem 0.75rem;
  color: hsl(var(--primary));
  font-size: 0.7rem;
  font-weight: 700;
  transition: background 0.15s ease, transform 0.15s ease;
}
.routine-chip:hover { background: hsl(var(--primary) / 0.18); }
.routine-chip:active { transform: scale(0.96); }

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
