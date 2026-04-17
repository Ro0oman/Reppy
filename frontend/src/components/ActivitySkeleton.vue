<template>
  <div class="card-stats animate-skeleton flex flex-col gap-6 p-6 sm:p-8 border-border bg-surface/5 backdrop-blur-md opacity-60">
    <!-- Header Skeleton -->
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-[60px] h-[60px] rounded-full bg-foreground/10"></div>
        <div class="space-y-2">
          <div class="h-4 w-32 bg-foreground/10 rounded-lg"></div>
          <div class="h-3 w-16 bg-foreground/5 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Content Skeleton -->
    <div class="space-y-6">
      <div class="space-y-2">
        <div class="h-6 w-3/4 bg-foreground/10 rounded-xl"></div>
        <div class="h-4 w-full bg-foreground/5 rounded-lg"></div>
        <div class="h-4 w-2/3 bg-foreground/5 rounded-lg"></div>
      </div>

      <!-- Exercise Grid Skeleton -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div v-for="i in 3" :key="i" class="h-24 bg-foreground/[0.03] border border-border/50 rounded-2xl"></div>
      </div>
    </div>

    <!-- Footer Skeleton -->
    <div class="flex items-center justify-between pt-4 border-t border-border/40">
      <div class="flex gap-6">
        <div class="h-8 w-12 bg-foreground/5 rounded-xl"></div>
        <div class="h-8 w-12 bg-foreground/5 rounded-xl"></div>
      </div>
      <div class="h-8 w-8 rounded-full bg-foreground/5"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
.animate-skeleton {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
