<template>
  <div class="max-w-7xl mx-auto px-4 pt-24 pb-32 space-y-12 animate-in relative z-10">
    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div class="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-8">{{ i18nStore.t('profile_decrypting') }}</p>
    </div>
    
    <template v-else>
      <!-- Profile Header Showcase (The Command Center) -->
      <div class="card-stats p-5 md:p-12 relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 text-center md:text-left border-border group overflow-hidden">
        <!-- Background Power Detail -->
        <div class="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary-500/10 transition-colors duration-1000"></div>

        <!-- Avatar Core -->
        <div class="relative group/avatar shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95" @click="showZoom = true">
          <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :avatar-css="user.avatar_css" :size="windowWidth < 768 ? 100 : 160" />
          <button v-if="isOwnProfile" 
                  @click="showAvatarSelector = true" 
                  :title="i18nStore.locale === 'es' ? 'Cambiar Clase/Icono' : 'Change Class/Icon'"
                  class="absolute -bottom-2 -right-2 p-4 bg-primary-500 rounded-2xl cursor-pointer hover:bg-primary-600 shadow-[0_0_20px_rgba(255,69,0,0.3)] text-white z-10 transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-4 focus:ring-offset-background">
            <UserIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Identity & Status -->
        <div class="flex-1 space-y-6">
          <div class="space-y-1">
            <h1 class="text-4xl md:text-7xl font-black text-foreground italic uppercase tracking-tighter leading-none mb-2 drop-shadow-2xl break-words">
              {{ user.name }}
            </h1>
            <div class="flex items-center justify-center md:justify-start gap-3">
              <span class="w-2 h-2 rounded-full bg-neon-lime animate-pulse"></span>
              <p class="text-xs font-black text-muted uppercase tracking-[0.25em] font-tight">{{ user.title_name || i18nStore.t('profile_recruit') }}</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-4">
            <div class="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 bg-surface/5 px-5 py-3 rounded-xl border border-border group/coins">
              <Coins class="w-4 h-4 text-primary-500 transition-transform" />
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl font-black text-precision text-foreground leading-none">{{ user.reppy_coins || 0 }}</span>
                <span class="text-[8px] font-black text-muted uppercase tracking-widest">{{ i18nStore.t('stats_reps') }}</span>
              </div>
            </div>

            <!-- Global Character Level Display -->
            <div class="w-full sm:w-auto flex items-center gap-4 bg-primary-500/5 px-6 py-3 rounded-2xl border border-primary-500/20 group/level shadow-lg shadow-primary-500/5">
              <div class="flex flex-col w-full sm:w-auto">
                <div class="flex items-baseline justify-center sm:justify-start gap-2">
                  <span class="text-[9px] font-black text-primary-500 uppercase tracking-[0.2em]">{{ i18nStore.t('codex_lv_up').toUpperCase() }}</span>
                  <span class="text-3xl font-black text-foreground italic leading-none font-industrial">{{ user.current_level || 1 }}</span>
                </div>
                <!-- XP Needed Info -->
                <div class="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <div class="h-1.5 w-full sm:w-32 bg-foreground/10 rounded-full overflow-hidden border border-border/40">
                    <div class="h-full bg-primary-500 transition-all duration-1000" :style="{ width: `${((user.xp_into_level || 0) / (user.xp_for_next_level || 1000)) * 100}%` }"></div>
                  </div>
                  <span class="text-[8px] font-black text-muted uppercase tracking-tighter shrink-0">
                    {{ (user.xp_for_next_level || 1000) - (user.xp_into_level || 0) }} {{ i18nStore.t('profile_xp_to_next') }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col items-center md:items-start md:border-l md:border-border md:pl-6 p-2 md:p-0">
              <p class="text-[9px] font-black text-neon-lime uppercase tracking-[0.2em] mb-1 italic animate-pulse">{{ i18nStore.t('profile_reward_protocol') }}</p>
              <p class="text-[8px] font-bold text-muted uppercase tracking-widest leading-relaxed max-w-[240px] text-center md:text-left">{{ i18nStore.t('profile_reward_desc') }}</p>
            </div>
          </div>
          
          <!-- RPG Metrics (The Attributes Grid) -->
          <div class="flex flex-col xl:flex-row items-center xl:items-end gap-6 md:gap-10 w-full mt-8">
            <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-3 w-full max-w-4xl">
              <div v-for="attr in attributes" :key="attr.key" 
                  class="p-4 rounded-xl border border-border bg-surface/20 group/attr transition-all"
                  :class="getAttrColor(attr.lvl)">
                <p class="text-[9px] font-black uppercase tracking-[0.2em] mb-2 font-tight" :class="attr.labelColor">{{ attr.key }}</p>
                <div class="flex flex-col leading-none">
                  <div class="flex items-center gap-1.5">
                    <span class="text-2xl font-black text-precision text-foreground">LVL {{ attr.lvl }}</span>
                    <span v-if="attr.bonus > 0" class="text-[10px] font-black text-neon-lime animate-pulse">(+{{ attr.bonus }})</span>
                  </div>
                  <span class="text-[8px] font-bold text-muted mt-1 tabular-nums">{{ attr.xp }} XP</span>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <router-link :to="{ name: 'codex' }" 
                   class="flex items-center gap-3 bg-surface/5 px-4 md:px-6 py-4 rounded-xl border border-border hover:border-primary-500/30 transition-all text-muted hover:text-foreground uppercase text-[9px] font-black tracking-widest h-fit">
              <BookOpen class="w-4 h-4 text-primary-500" />
              {{ i18nStore.t('nav_codex') }}
            </router-link>
            <router-link v-if="isOwnProfile" to="/inventory"
                   class="flex items-center gap-3 bg-primary-500/10 px-4 md:px-6 py-4 rounded-xl border border-primary-500/30 hover:border-primary-500/60 transition-all text-primary-500 hover:text-primary-400 uppercase text-[9px] font-black tracking-widest h-fit">
              <Zap class="w-4 h-4" />
              VER ATRIBUTOS
            </router-link>
            
            <!-- Other User Actions -->
            <template v-else>
              <button @click="challengingUser = user"
                      class="flex items-center gap-3 bg-primary-500 hover:bg-primary-600 text-white px-4 md:px-6 py-4 rounded-xl border border-primary-500/30 transition-all uppercase text-[9px] font-black tracking-widest h-fit shadow-lg shadow-primary-500/20 active:scale-95">
                <Swords class="w-4 h-4" />
                {{ i18nStore.t('pvp_challenge_btn') || 'RETAR A DUELO' }}
              </button>
              <button @click="comparingUser = user"
                      class="flex items-center gap-3 bg-surface/5 px-4 md:px-6 py-4 rounded-xl border border-border hover:border-primary-500/30 transition-all text-muted hover:text-foreground uppercase text-[9px] font-black tracking-widest h-fit active:scale-95">
                <BarChart3 class="w-4 h-4" />
                {{ i18nStore.t('ui_compare') || 'COMPARAR' }}
              </button>
            </template>
          </div>
          </div>
        </div>
        
        <!-- Emergency Operations (Issue 88 Gear) -->
        <div v-if="isOwnProfile" class="md:absolute top-8 right-8 flex gap-3">
          <button @click="showSettingsModal = true" 
                  :title="i18nStore.t('stats_settings')"
                  class="p-4 bg-surface/5 text-muted hover:bg-primary-500 hover:text-white border border-border rounded-2xl transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-primary-500/50">
            <Settings class="w-5 h-5" />
          </button>
          <button @click="handleLogout" 
                  :title="i18nStore.t('sign_out')"
                  class="p-4 bg-red-500/5 text-red-500/60 hover:bg-red-500 hover:text-white border border-red-500/10 rounded-2xl transition-all group/logout active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-500/50">
            <LogOut class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <!-- Dashboard Operational Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- Sidebar Column: Stats & Setup -->
        <div class="lg:col-span-4 space-y-10 order-2 lg:order-1">
           <!-- Analytics Deck -->
           <div class="card-stats border-white/5 space-y-8 bg-surface/5">
              <div class="flex items-center gap-3 border-b border-white/5 pb-6">
                <Activity class="w-5 h-5 text-primary-500" />
                <h3 class="text-sm font-black text-industrial text-foreground tracking-widest uppercase">{{ i18nStore.t('rankings') }}</h3>
              </div>
              
              <div class="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-6">
                <!-- Total Reps Pill -->
                 <div class="group/stat">
                    <p class="text-[9px] font-black text-muted uppercase tracking-wider mb-1">{{ i18nStore.t('stats_effort') }}</p>
                    <div class="flex items-baseline gap-2">
                       <span class="text-3xl md:text-4xl font-black text-precision text-foreground tracking-tighter">{{ stats.totalReps || 0 }}</span>
                       <span class="text-[10px] font-black text-primary-500 uppercase tracking-widest">{{ i18nStore.t('stats_reps') }}</span>
                    </div>
                 </div>

                <!-- Total Volume Pill -->
                 <div class="group/stat">
                    <p class="text-[9px] font-black text-muted uppercase tracking-wider mb-1">{{ i18nStore.t('stats_tonnage') }}</p>
                    <div class="flex items-baseline gap-2">
                       <span class="text-3xl md:text-4xl font-black text-precision text-red-500 tracking-tighter">{{ ((stats.totalVolume || 0) / 1000).toFixed(1) }}</span>
                       <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18nStore.t('stats_tonnage').split(' ')[0] }}</span>
                    </div>
                 </div>
 
                <!-- Streak Pill -->
                 <div class="group/stat">
                    <p class="text-[9px] font-black text-muted uppercase tracking-wider mb-1">{{ i18nStore.t('stats_consistency') }}</p>
                    <div class="flex items-center gap-3">
                       <span class="text-3xl md:text-4xl font-black text-precision text-orange-500 tracking-tighter">{{ stats.streak || 0 }}</span>
                       <Flame class="w-6 h-6 text-orange-500 animate-pulse" />
                    </div>
                 </div>
 
                <!-- Goal Pill -->
                 <div class="group/stat">
                    <p class="text-[9px] font-black text-muted uppercase tracking-wider mb-1">{{ i18nStore.t('stats_protocol_goal') }}</p>
                    <div class="flex items-baseline gap-2">
                       <span class="text-3xl md:text-4xl font-black text-precision text-neon-lime tracking-tighter">{{ user.daily_goal || 0 }}</span>
                       <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18nStore.t('stats_per_day') }}</span>
                    </div>
                 </div>
              </div>

              <!-- Protocol Mastery -->
              <div v-if="stats.breakdown?.length > 0" class="pt-8 border-t border-white/5 space-y-4">
                 <div class="flex items-center gap-2 mb-4">
                   <Trophy class="w-3.5 h-3.5 text-primary-500" />
                   <h4 class="text-[10px] font-black text-foreground uppercase tracking-[0.2em] leading-none">{{ i18nStore.t('protocol_mastery') }}</h4>
                 </div>
                 
                 <div class="space-y-3">
                   <div v-for="item in stats.breakdown" :key="item.type" 
                        class="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group hover:border-primary-500/30 transition-all">
                     <div class="flex items-center gap-3">
                       <div class="w-8 h-8 bg-surface rounded-lg flex items-center justify-center border border-white/5">
                         <component :is="getIconForType(item.type)" class="w-4 h-4 text-primary-500/60" />
                       </div>
                       <div>
                         <p class="text-[9px] font-black text-muted uppercase tracking-wider mb-1">{{ i18nStore.t(item.type) }}</p>
                         <div class="flex items-baseline gap-2">
                           <span class="text-xs font-black text-foreground tabular-nums">{{ item.count }}</span>
                           <span class="text-[7px] font-bold text-zinc-600 uppercase">{{ i18nStore.t('ui_reps') }}</span>
                         </div>
                       </div>
                     </div>
                     <span class="text-[10px] font-black text-red-500/80 font-precision tabular-nums">{{ ((item.volume || 0) / 1000).toFixed(1) }}T</span>
                  </div>
                 </div>
              </div>

              <!-- User Options Overlay (Settings Overlay) -->
              <div v-if="isOwnProfile" class="pt-8 border-t border-white/5 space-y-4">
                 <button @click="showSettingsModal = true" class="btn-reppy w-full !py-3 !text-xs">{{ i18nStore.t('stats_settings').toUpperCase() }}</button>
              </div>
           </div>
        </div>

        <!-- Main Workspace Column: Heatmap & Audit -->
        <div class="lg:col-span-8 space-y-10 order-1 lg:order-2">
           <!-- Heatmap Deck -->
           <div class="space-y-6">
              <ExerciseSelector v-model="activeExercise" class="w-full" />
              <div class="card-stats border-white/5 space-y-8 min-h-[400px] flex flex-col justify-center bg-surface/5">
                 <div class="flex items-center justify-between">
                   <h3 class="text-[10px] font-black text-muted tracking-[0.3em] uppercase">{{ i18nStore.t('feat_heatmap_title') }}</h3>
                   <span class="text-[10px] font-black text-neon-lime tabular-nums uppercase tracking-widest">{{ i18nStore.t('stats_active_days') }}</span>
                 </div>
                 <Heatmap :data="heatmapData" class="flex-1" />
              </div>
           </div>

           <!-- Transaction Audit Log -->
           <div class="card-stats border-border space-y-8 bg-gradient-to-br from-surface/20 to-surface/5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <Coins class="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h4 class="text-m font-black text-industrial text-foreground tracking-tight uppercase">{{ i18nStore.t('profile_activity_audit') }}</h4>
                    <p class="text-[9px] font-black text-muted uppercase tracking-[0.3em] font-tight">{{ i18nStore.t('profile_rc_history') }}</p>
                  </div>
                </div>
                <span class="text-[10px] font-black bg-white/5 border border-white/5 px-3 py-1 rounded-full text-zinc-500 tracking-tighter uppercase font-precision opacity-40">{{ i18nStore.t('ui_enc_chain') }}</span>
              </div>

              <div v-if="transactions?.length > 0" class="space-y-3 font-precision">
                <div v-for="(tx, idx) in transactions" :key="idx"
                  class="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl group hover:border-white/10 transition-all hover:translate-x-1 duration-500">
                  <div class="flex items-center gap-6">
                    <span class="text-[10px] text-zinc-600 tabular-nums uppercase w-20">{{ new Date(tx.created_at).toLocaleDateString() }}</span>
                    <span class="text-xs font-bold text-foreground/90 uppercase tracking-tight">{{ tx.description }}</span>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-black tabular-nums"
                      :class="tx.amount > 0 ? 'text-neon-lime' : 'text-cyan-400'">
                      {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
                    </span>
                    <Coins class="w-3 h-3 text-zinc-600" />
                  </div>
                </div>
                
                <!-- Pagination Protocol -->
                <div v-if="hasMoreTransactions" class="pt-4 border-t border-white/5">
                  <button @click="fetchMoreTransactions" 
                          :disabled="loadingMore"
                          class="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all flex items-center justify-center gap-3">
                    <span v-if="loadingMore" class="animate-spin border-2 border-primary-500 border-t-transparent rounded-full w-3 h-3"></span>
                    {{ loadingMore ? i18nStore.t('profile_loading') : i18nStore.t('profile_load_more') }}
                  </button>
                </div>
              </div>
              
              <div v-else class="text-center py-20 opacity-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">{{ i18nStore.t('profile_no_transactions') }}</p>
              </div>
           </div>
        </div>
      </div>
    </template>

    <!-- RPG Info Modal (The Codex) -->
    <CodexModal :show="showInfoModal" @close="showInfoModal = false" />
    <!-- Issue 88: Settings Modal -->
    <SettingsModal :show="showSettingsModal" :initial-data="settingsForm" @close="showSettingsModal = false" @updated="onProfileUpdated" />

    <!-- PvP and Comparison Modals -->
    <Teleport to="body">
       <PvpConfigModal 
         :show="!!challengingUser" 
         :target="challengingUser" 
         @close="challengingUser = null" 
       />
       <UserCompareModal 
         :show="!!comparingUser" 
         :me="authStore.user" 
         :target="comparingUser" 
         @close="comparingUser = null" 
       />
    </Teleport>

    <!-- NEW: Avatar Selector Modal -->
    <Teleport to="body">
      <div v-if="showAvatarSelector" class="fixed inset-0 z-[1001] flex justify-center items-start overflow-y-auto p-4 md:p-8 bg-background/90 backdrop-blur-md" @click.self="showAvatarSelector = false">
        <div class="card-stats max-w-2xl w-full p-6 md:p-12 border-border space-y-8 md:space-y-10 relative overflow-visible my-auto animate-in">
             <div class="flex items-center justify-between">
                <div class="space-y-1">
                    <h2 class="text-2xl font-black text-industrial text-foreground uppercase italic tracking-tighter">{{ i18nStore.t('ui_select_class') }}<span class="text-primary-500">.</span></h2>
                    <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18nStore.t('ui_choose_protocol') }}</p>
                </div>
                <button @click="showAvatarSelector = false" class="p-2 bg-surface/10 rounded-xl hover:bg-surface/20 transition-all">
                    <XIcon class="w-5 h-5 text-foreground" />
                </button>
             </div>

             <div class="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-surface/5 hover:bg-surface/10 hover:border-primary-500/30 transition-all cursor-pointer group/upload" @click="$refs.fileInput.click()">
                <div class="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center group-hover/upload:scale-110 transition-transform">
                   <Camera class="w-8 h-8 text-primary-500" />
                </div>
                <div class="text-center">
                   <p class="text-xs font-black text-foreground uppercase tracking-widest">{{ i18nStore.t('ui_upload_custom') || 'SUBIR AVATAR PERSONALIZADO' }}</p>
                   <p class="text-[9px] font-bold text-muted uppercase tracking-widest mt-1 opacity-60">{{ i18nStore.t('ui_compressed_info') || 'Se comprimirá automáticamente para optimizar carga' }}</p>
                </div>
                <input type="file" ref="fileInput" hidden accept="image/*" @change="handleCustomAvatar" />
             </div>

             <div class="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                <div v-for="i in [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 14, 16, 17, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]" :key="i" 
                     @click="selectAvatar(`/img/avatars/avatar_${i}.webp`)"
                     class="group relative cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-110 active:scale-95"
                     :class="user.avatar_url === `/img/avatars/avatar_${i}.webp` ? 'border-primary-500 shadow-[0_0_15px_rgba(255,69,0,0.3)]' : 'border-white/5 hover:border-white/20'">
                  <img :src="`/img/avatars/avatar_${i}.webp`" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/10 transition-colors"></div>
                  <!-- Label for Class Type -->
                  <div class="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm py-1">
                     <p class="text-[6px] font-black text-white text-center uppercase tracking-tighter">{{ getClassLabel(i) }}</p>
                  </div>
                </div>
             </div>

             <p class="text-[9px] font-bold text-muted text-center uppercase tracking-widest opacity-40">{{ i18nStore.t('ui_lock_selection') }}</p>
        </div>
      </div>
    </Teleport>
    
    <!-- Avatar Zoom Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showZoom" 
             class="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-xl cursor-zoom-out"
             @click="showZoom = false">
          <div class="relative max-w-4xl w-full aspect-square md:aspect-auto md:h-[80vh] flex items-center justify-center animate-modal-in" @click.stop>
            <div class="absolute -top-12 right-0 md:-right-12">
              <button @click="showZoom = false" class="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                <XIcon class="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            
            <div class="relative group/zoom-image h-full w-full flex items-center justify-center">
              <!-- Frame Decoration -->
              <div class="absolute inset-0 border-2 border-primary-500/30 rounded-[2.5rem] -m-4 md:-m-8 animate-pulse pointer-events-none"></div>
              
              <img :src="user.avatar_url" 
                   class="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10"
                   :style="user.avatar_css" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { Camera, Settings, LogOut, Activity, Flame, Trophy, HelpCircle, X as XIcon, Swords, Zap, Heart, Shield, Coins, Dumbbell, Target, Globe, User as UserIcon, BarChart3, BookOpen } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';
import { useThemeStore } from '../stores/theme';
import Heatmap from './Heatmap.vue';
import AvatarFrame from './AvatarFrame.vue';
import ExerciseSelector from './ExerciseSelector.vue';
import CodexModal from './CodexModal.vue';
import SettingsModal from './SettingsModal.vue';
import PvpConfigModal from './PvpConfigModal.vue';
import UserCompareModal from './UserCompareModal.vue';
import axios from 'axios';
import { Moon, Sun, Monitor } from 'lucide-vue-next';

const props = defineProps({
  userId: { type: String, default: null }
});

const authStore = useAuthStore();
const i18nStore = useI18nStore();
const emit = defineEmits(['start', 'viewProfile']);
const notificationStore = useNotificationStore();
const themeStore = useThemeStore();

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const handleResize = () => { windowWidth.value = window.innerWidth; };

const user = ref({ avatar_url: '', border_css: '', avatar_css: '', name: '', total_xp: 0, current_level: 1 });

onMounted(() => {
  fetchProfile();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
const stats = ref({});
const heatmapData = ref([]);
const transactions = ref([]);
const loading = ref(true);
const activeExercise = ref('all');
const showInfoModal = ref(false);
const showSettingsModal = ref(false);
const showAvatarSelector = ref(false);
const showZoom = ref(false);
const challengingUser = ref(null);
const comparingUser = ref(null);
const fileInput = ref(null);

const handleCustomAvatar = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 256;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/webp', 0.8);

      try {
        const res = await axios.post('/api/users/avatar', { 
          avatar_url: compressedBase64,
          is_custom: true 
        });
        const finalUrl = res.data?.user?.avatar_url || res.data?.avatar_url;
        user.value.avatar_url = finalUrl;
        authStore.user.avatar_url = finalUrl;
        notificationStore.notify(i18nStore.t('profile_updated'), 'success');
        showAvatarSelector.value = false;
      } catch (err) {
        notificationStore.notify('Error uploading avatar', 'error');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Pagination State
const transactionsPage = ref(1);
const hasMoreTransactions = ref(true);
const loadingMore = ref(false);

const getIconForType = (type) => {
  const icons = {
    pullups: Dumbbell,
    pushups: Flame,
    muscleups: Zap,
    dips: Target,
    weighted_pullups: Trophy,
    all: Globe
  };
  return icons[type] || Dumbbell;
};

const itemBonuses = computed(() => {
  const bonuses = { STR: 0, DEX: 0, END: 0, VIG: 0, INT: 0, FTH: 0, CHA: 0 };
  const slots = ['head', 'weapon', 'armor', 'boots'];
  slots.forEach(slot => {
    const stats = user.value[`${slot}_stats`] || {};
    Object.keys(stats).forEach(key => {
      const upperKey = key.toUpperCase();
      if (bonuses[upperKey] !== undefined) {
        bonuses[upperKey] += stats[key];
      }
    });
  });
  return bonuses;
});

const attributes = computed(() => [
  { key: 'STR', xp: user.value.str_xp || 0, lvl: user.value.str_lvl || 1, labelColor: 'text-orange-500', bonus: itemBonuses.value.STR },
  { key: 'DEX', xp: user.value.dex_xp || 0, lvl: user.value.dex_lvl || 1, labelColor: 'text-cyan-400', bonus: itemBonuses.value.DEX },
  { key: 'END', xp: user.value.end_xp || 0, lvl: user.value.end_lvl || 1, labelColor: 'text-emerald-500', bonus: itemBonuses.value.END },
  { key: 'VIG', xp: user.value.vig_xp || 0, lvl: user.value.vig_lvl || 1, labelColor: 'text-red-500', bonus: itemBonuses.value.VIG },
  { key: 'INT', xp: user.value.int_xp || 0, lvl: user.value.int_lvl || 1, labelColor: 'text-blue-400', bonus: itemBonuses.value.INT },
  { key: 'FTH', xp: user.value.fth_xp || 0, lvl: user.value.fth_lvl || 1, labelColor: 'text-yellow-400', bonus: itemBonuses.value.FTH },
  { key: 'CHA', xp: user.value.cha_xp || 0, lvl: user.value.cha_lvl || 1, labelColor: 'text-pink-400', bonus: itemBonuses.value.CHA },
]);

const getAttrColor = (lvl) => {
  if (lvl >= 31) return 'border-orange-500/30 bg-orange-500/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]';
  if (lvl >= 16) return 'border-primary-500/20 bg-primary-500/5';
  return 'border-white/5';
};

const isOwnProfile = computed(() => !props.userId || props.userId === authStore.user?.id);

const settingsForm = ref({ name: '', daily_goal: 0, body_weight: 0 });

const selectAvatar = async (url) => {
  try {
    const res = await axios.post('/api/users/avatar', { avatar_url: url });
    const finalUrl = res.data?.user?.avatar_url || url;
    user.value.avatar_url = finalUrl;
    authStore.user.avatar_url = finalUrl;
    notificationStore.notify(i18nStore.t('profile_updated'), 'success');
    showAvatarSelector.value = false;
  } catch (err) {
    notificationStore.notify('Error updating avatar protocol', 'error');
  }
};

const getClassLabel = (i) => {
  const classes = [
    'Artorias', 'Solaire', 'Scorpion', 'Subzero', 'Steve', 'Creeper', 'Kratos', 'Atreus', 'Melina', 'Malenia', 
    'Hunter', 'Link', 'Zelda', 'Geralt', 'Ciri', 'Chief', 'Doom', 'Ryu', 'ChunLi', 'Kazuya', 
    'Cloud', 'Sephiroth', 'Leon', 'Snake', 'Aloy', 'Drake', 'Arthur', 'Ellie', 'Mario', 'Pikachu',
    'Warrior', 'Mage', 'Rogue', 'Paladin', 'Ranger', 'Necro', 'Barbarian', 'Monk', 'Druid', 'Valkyrie'
  ];
  return classes[i-1] || 'Recruit';
};

const onProfileUpdated = (updatedUser) => {
  user.value = { ...user.value, ...updatedUser };
  settingsForm.value = { 
    name: updatedUser.name, 
    daily_goal: updatedUser.daily_goal, 
    body_weight: updatedUser.body_weight 
  };
};

const handleLogout = () => {
    authStore.logout();
    window.location.href = '/';
};

const fetchProfile = async () => {
  loading.value = true;
  transactionsPage.value = 1;
  hasMoreTransactions.value = true;
  try {
    const targetId = props.userId || authStore.user?.id;
    const res = await axios.get(`/api/profile/${targetId}`, {
      params: { type: activeExercise.value }
    });
    user.value = res.data.user;
    stats.value = res.data.stats;
    heatmapData.value = res.data.heatmap;
    transactions.value = res.data.transactions || [];
    
    // Check if there might be more based on default limit (20)
    hasMoreTransactions.value = (res.data.transactions || []).length === 20;

    if (isOwnProfile.value) {
      settingsForm.value = { name: user.value.name, daily_goal: user.value.daily_goal, body_weight: user.value.body_weight };
      // Sync global header
      await authStore.fetchProfile();
    }
  } catch (err) { notificationStore.notify('Profile sync failed', 'error'); }
  finally { loading.value = false; }
};

const fetchMoreTransactions = async () => {
  if (loadingMore.value || !hasMoreTransactions.value) return;
  loadingMore.value = true;
  try {
    const targetId = props.userId || authStore.user?.id;
    const nextPage = transactionsPage.value + 1;
    const res = await axios.get(`/api/profile/${targetId}/transactions`, {
      params: { page: nextPage, limit: 20 }
    });
    
    if (res.data.transactions && res.data.transactions.length > 0) {
      transactions.value.push(...res.data.transactions);
      transactionsPage.value = nextPage;
      hasMoreTransactions.value = res.data.hasMore;
    } else {
      hasMoreTransactions.value = false;
    }
  } catch (err) {
    notificationStore.notify('Error loading more transactions', 'error');
  } finally {
    loadingMore.value = false;
  }
};

watch(activeExercise, fetchProfile);
watch(() => props.userId, fetchProfile);
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; backdrop-filter: blur(0px); }

.animate-modal-in { animation: modalZoom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes modalZoom { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
