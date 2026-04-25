<template>
  <div class="social-card-skeleton animate-skeleton p-6 flex flex-col gap-6 bg-surface/20 dark:bg-card/20 border border-border/20">
    <!-- Header Skeleton -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-full bg-foreground/10 ring-2 ring-background"></div>
        <div class="space-y-3">
          <div class="h-3 w-32 bg-foreground/10 rounded-lg"></div>
          <div class="flex flex-col gap-1.5">
            <div class="h-2 w-16 bg-primary-500/10 rounded-lg"></div>
            <div class="flex gap-1">
               <div v-for="i in 3" :key="i" class="h-3 w-8 bg-foreground/5 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="h-2 w-12 bg-foreground/5 rounded-full"></div>
    </div>

    <!-- Content Skeleton -->
    <div class="space-y-5">
      <div class="flex items-baseline gap-3">
        <div class="h-10 w-36 bg-foreground/10 rounded-xl"></div>
        <div class="h-6 w-20 bg-foreground/5 rounded-lg"></div>
      </div>
      
      <!-- Achievement Badges -->
      <div class="flex gap-2">
        <div class="h-5 w-24 bg-amber-500/5 rounded-full"></div>
        <div class="h-5 w-20 bg-primary-500/5 rounded-full"></div>
      </div>

      <!-- Progressive Depth Toggle Skeleton -->
      <div class="h-10 w-full bg-foreground/5 rounded-2xl"></div>

      <!-- Caption -->
      <div class="space-y-2 border-l-2 border-primary-500/10 pl-4">
        <div class="h-3 w-full bg-foreground/5 rounded-lg"></div>
        <div class="h-3 w-2/3 bg-foreground/5 rounded-lg"></div>
      </div>
    </div>

    <!-- Footer Skeleton -->
    <div class="flex items-center justify-between pt-4 border-t border-border/10">
      <div class="flex gap-3">
        <div class="h-10 w-20 bg-foreground/5 rounded-2xl"></div>
        <div class="h-10 w-20 bg-foreground/5 rounded-2xl"></div>
        <div class="h-10 w-20 bg-foreground/5 rounded-2xl"></div>
      </div>
      <div class="h-10 w-10 bg-foreground/5 rounded-2xl"></div>
    </div>
  </div>
</template>

<style scoped>
.social-card-skeleton {
  border-radius: 2.5rem;
  overflow: hidden;
  position: relative;
}

@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
.animate-skeleton {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
