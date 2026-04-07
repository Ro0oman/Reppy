<template>
  <div class="min-h-screen flex flex-col items-center bg-deep-abyss selection:bg-primary-500 overflow-hidden">
    
    <!-- ═══════════════════════════════════════════════════════════
         HERO SECTION — H1 keyword-rich, visible to Google
    ═══════════════════════════════════════════════════════════ -->
    <section class="relative w-full py-32 md:py-48 px-4 flex flex-col items-center text-center space-y-12">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-40">
        <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-neon-lime/5 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <!-- Active Boss Banner -->
      <div v-if="hasActiveEvent && activeBoss" class="w-full max-w-5xl bg-surface/40 backdrop-blur-3xl border border-primary-500/20 p-10 rounded-[2.5rem] animate-in fade-in slide-in-from-top-10 duration-1000 shadow-xl mb-16 relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-r from-primary-500/[0.03] via-transparent to-primary-500/[0.03] opacity-50"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-10 text-left">
           <div class="p-5 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/20">
              <Sword class="w-10 h-10 text-white" />
           </div>
           <div class="flex-1">
              <h2 class="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-none mb-3">
                {{ activeBoss.name }} <span class="text-primary-500">detectado</span>
              </h2>
              <p class="text-muted/60 font-medium text-sm md:text-lg tracking-tight max-w-2xl">{{ activeBoss.description }}</p>
           </div>
           <button @click="$emit('start')" class="btn-reppy !px-12 !py-5 shadow-xl transition-transform">
             Unirse a la caza
           </button>
        </div>
      </div>

      <!-- Branding Eyebrow -->
      <div class="inline-flex items-center gap-3 px-6 py-2 bg-surface border border-border/40 rounded-full mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-sm">
        <div class="w-2 h-2 rounded-full bg-primary-500 animate-ping"></div>
        <span class="text-[11px] font-bold tracking-widest text-muted/60 uppercase">Contador de Calistenia Gratuito</span>
      </div>

      <!-- H1: PRIMARY SEO KEYWORD TARGET -->
      <h1 class="text-7xl md:text-[12rem] font-bold tracking-tight text-foreground leading-none animate-in fade-in duration-1000">
        REPPY<span class="text-primary-500">.</span>
      </h1>
      
      <!-- SEO-rich subtitle (visible, not hidden) -->
      <p class="max-w-3xl text-xl md:text-3xl text-muted font-medium tracking-tight leading-snug animate-in fade-in duration-1000 delay-300">
        Contador de <strong class="text-foreground">dominadas</strong>, <strong class="text-foreground">flexiones</strong> y <strong class="text-foreground">calistenia</strong> con sistema RPG. 
        Registra repeticiones, compite en rankings y sube de nivel.
      </p>

      <!-- Primary Action -->
      <div class="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
        <button 
          @click="$emit('start')"
          class="btn-reppy !text-xl !px-16 !py-6 shadow-[0_20px_40px_rgba(var(--primary),0.2)]"
        >
          {{ authStore.isAuthenticated ? 'IR AL DASHBOARD' : 'EMPEZAR GRATIS' }}
        </button>
        <span class="text-[10px] font-bold text-muted/30 tracking-widest uppercase">100% Gratuito · Sin tarjeta de crédito</span>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         WHAT IS REPPY — Real SEO content, H2 structure
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-5xl w-full px-6 py-20 md:py-32 space-y-8" id="que-es-reppy">
      <div class="text-center space-y-6 mb-16">
        <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
          ¿Qué es <span class="text-primary-500">Reppy</span>?
        </h2>
        <p class="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed font-medium">
          Reppy es una <strong class="text-foreground">app gratuita de calistenia</strong> que convierte tu entrenamiento en un juego RPG. 
          Cuenta tus <strong class="text-foreground">dominadas</strong>, <strong class="text-foreground">flexiones</strong>, 
          <strong class="text-foreground">fondos</strong>, <strong class="text-foreground">muscle ups</strong> y 
          <strong class="text-foreground">dominadas con lastre</strong>. 
          Cada repetición te da monedas, experiencia y te acerca al Top 1 del ranking global.
        </p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         EXERCISES — Individual keyword targets
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-6xl w-full px-6 py-16 md:py-24" id="ejercicios">
      <div class="text-center mb-16 space-y-4">
        <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
          Ejercicios que puedes <span class="text-primary-500">registrar</span>
        </h2>
        <p class="text-muted/60 font-bold tracking-[0.2em] text-[11px] uppercase">Trackea cada repetición de tu entrenamiento</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Pull-ups -->
        <article class="card-stats p-8 space-y-5 group transition-all duration-500 border-border/40 hover:bg-surface/60">
          <div class="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
            <ArrowUp class="w-7 h-7" />
          </div>
          <h3 class="text-xl font-bold text-foreground tracking-tight">Contador de Dominadas</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Registra tus <strong>dominadas</strong> (pull-ups) diarias. 
            Visualiza tu progreso con un heatmap y mantén tu racha de entrenamiento activa.
          </p>
        </article>

        <!-- Push-ups -->
        <article class="card-stats p-8 space-y-5 group transition-all duration-500 border-border/40 hover:bg-surface/60">
          <div class="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <ArrowDown class="w-7 h-7" />
          </div>
          <h3 class="text-xl font-bold text-foreground tracking-tight">Contador de Flexiones</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Lleva la cuenta de tus <strong>flexiones</strong> (push-ups). 
            Establece metas diarias y compite con la comunidad en los rankings globales.
          </p>
        </article>

        <!-- Dips -->
        <article class="card-stats p-8 space-y-5 group transition-all duration-500 border-border/40 hover:bg-surface/60">
          <div class="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <ArrowDownUp class="w-7 h-7" />
          </div>
          <h3 class="text-xl font-bold text-foreground tracking-tight">Contador de Fondos</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Trackea tus <strong>fondos</strong> (dips) en paralelas o barras. 
            Gana el doble de monedas por cada repetición registrada.
          </p>
        </article>

        <!-- Muscle Ups -->
        <article class="card-stats p-8 space-y-5 group transition-all duration-500 border-border/40 hover:bg-surface/60">
          <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
            <Flame class="w-7 h-7" />
          </div>
          <h3 class="text-xl font-bold text-foreground tracking-tight">Contador de Muscle Ups</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Registra tus <strong>muscle ups</strong> y gana 5 monedas por repetición. 
            El ejercicio premium de la calistenia avanzada.
          </p>
        </article>

        <!-- Weighted Pull-ups -->
        <article class="card-stats p-8 space-y-5 group transition-all duration-500 border-border/40 hover:bg-surface/60">
          <div class="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
            <Dumbbell class="w-7 h-7" />
          </div>
          <h3 class="text-xl font-bold text-foreground tracking-tight">Dominadas con Lastre</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Trackea tus <strong>dominadas con lastre</strong> (weighted pull-ups). 
            Registra el peso añadido y gana 3 monedas por rep.
          </p>
        </article>

        <!-- All exercises CTA -->
        <article class="card-stats p-8 space-y-5 flex flex-col items-center justify-center text-center border-primary-500/20 bg-primary-500/5 cursor-pointer hover:bg-primary-500/10 transition-all" @click="$emit('start')">
          <div class="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-500">
            <Plus class="w-7 h-7" />
          </div>
          <h3 class="text-xl font-bold text-primary-500 tracking-tight">Empieza Ahora</h3>
          <p class="text-muted/60 font-medium text-sm">
            Regístrate gratis y empieza a contar tus repeticiones hoy mismo.
          </p>
        </article>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         FEATURES — H2/H3 content grid 
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-7xl w-full px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-8" id="funcionalidades">
      <article class="card-stats p-10 space-y-8 group transition-all duration-500 border-border/40 hover:bg-surface/60">
        <div class="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 shadow-sm shadow-primary-500/5">
          <Activity class="w-8 h-8" />
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-bold text-foreground tracking-tight">Heatmap de Actividad</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Visualiza tu consistencia de entrenamiento con un gráfico estilo GitHub. 
            Ve de un vistazo qué días entrenaste <strong>dominadas</strong>, <strong>flexiones</strong> o <strong>fondos</strong>. 
            Filtra por ejercicio y año completo.
          </p>
        </div>
        <div class="h-1.5 w-full bg-surface-dark/10 rounded-full overflow-hidden">
           <div class="h-full bg-primary-500 w-2/3 shadow-[0_0_10px_rgba(var(--primary),0.3)]"></div>
        </div>
      </article>

      <article class="card-stats p-10 space-y-8 group transition-all duration-500 border-border/40 hover:bg-surface/60">
        <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-sm shadow-accent/5">
          <Trophy class="w-8 h-8" />
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-bold text-foreground tracking-tight">Rankings Globales</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Compite en el <strong>ranking mundial de dominadas</strong> y calistenia. 
            Filtra por hoy, semana, mes o total. Sube de posición y demuestra quién es el mejor.
          </p>
        </div>
        <div class="h-1.5 w-full bg-surface-dark/10 rounded-full overflow-hidden">
           <div class="h-full bg-accent w-1/2 shadow-[0_0_10px_rgba(var(--accent),0.3)]"></div>
        </div>
      </article>

      <article class="card-stats p-10 space-y-8 group transition-all duration-500 border-border/40 hover:bg-surface/60">
        <div class="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shadow-blue-500/5">
          <Users class="w-8 h-8" />
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-bold text-foreground tracking-tight">Comunidad Social</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Añade amigos, visita sus perfiles públicos y compara tu progreso de <strong>calistenia</strong>. 
            Crea tu círculo de entrenamiento y mantén la motivación.
          </p>
        </div>
        <div class="h-1.5 w-full bg-surface-dark/10 rounded-full overflow-hidden">
           <div class="h-full bg-blue-500 w-3/4 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
        </div>
      </article>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         RPG SYSTEM — Long-form content section
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-5xl w-full px-6 py-16 md:py-24 space-y-16" id="sistema-rpg">
      <div class="text-center space-y-6">
        <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
          Sistema <span class="text-primary-500">RPG</span> de Fitness
        </h2>
        <p class="text-lg text-muted max-w-3xl mx-auto leading-relaxed font-medium">
          Reppy no es un simple contador de repeticiones. Cada dominada que haces te da experiencia 
          en 4 atributos de personaje, como en un videojuego RPG.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card-stats p-8 space-y-4 border-border/40">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
              <span class="text-red-500 font-black text-lg">STR</span>
            </div>
            <h3 class="text-xl font-bold text-foreground">Fuerza (Strength)</h3>
          </div>
          <p class="text-muted/60 text-sm leading-relaxed">
            Sube con cada set de <strong>dominadas</strong> y <strong>flexiones</strong>. 
            Refleja tu volumen total y consistencia de entrenamiento.
          </p>
        </div>

        <div class="card-stats p-8 space-y-4 border-border/40">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <span class="text-orange-500 font-black text-lg">PWR</span>
            </div>
            <h3 class="text-xl font-bold text-foreground">Potencia (Power)</h3>
          </div>
          <p class="text-muted/60 text-sm leading-relaxed">
            Se gana con ejercicios de alta intensidad: <strong>muscle ups</strong> y <strong>dominadas con lastre</strong>. 
            Para los atletas más serios.
          </p>
        </div>

        <div class="card-stats p-8 space-y-4 border-border/40">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <span class="text-green-500 font-black text-lg">END</span>
            </div>
            <h3 class="text-xl font-bold text-foreground">Resistencia (Endurance)</h3>
          </div>
          <p class="text-muted/60 text-sm leading-relaxed">
            Mide tu capacidad de mantener volumen de <strong>calistenia</strong> en el tiempo. 
            Más repeticiones sostenidas = más resistencia.
          </p>
        </div>

        <div class="card-stats p-8 space-y-4 border-border/40">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <span class="text-blue-500 font-black text-lg">AGI</span>
            </div>
            <h3 class="text-xl font-bold text-foreground">Agilidad (Agility)</h3>
          </div>
          <p class="text-muted/60 text-sm leading-relaxed">
            Se recompensa por la constancia diaria y rachas de entrenamiento. 
            Entrena todos los días para subir tu agilidad al máximo.
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         BOSS FIGHTS — Content section
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-5xl w-full px-6 py-16 md:py-24 space-y-12" id="boss-fights">
      <div class="text-center space-y-6">
        <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
          Boss Fights <span class="text-primary-500">Comunitarios</span>
        </h2>
        <p class="text-lg text-muted max-w-3xl mx-auto leading-relaxed font-medium">
          Participa en eventos globales donde toda la comunidad lucha contra un boss épico. 
          Cada <strong>dominada</strong>, <strong>flexión</strong> o <strong>fondo</strong> que registras 
          inflige daño al boss. Cuando la comunidad lo derrota, todos ganan cofres con recompensas legendarias.
        </p>
      </div>

      <div class="card-stats p-10 md:p-14 border-primary-500/20 space-y-8 text-center bg-gradient-to-b from-primary-500/[0.03] to-transparent">
        <div class="flex flex-col items-center gap-4">
          <div class="p-4 bg-primary-500/10 rounded-2xl">
            <Sword class="w-10 h-10 text-primary-500" />
          </div>
          <h3 class="text-2xl font-bold text-foreground">¿Cómo funcionan?</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div class="space-y-3">
            <span class="text-4xl font-black text-primary-500">01</span>
            <h4 class="text-foreground font-bold">Aparece un Boss</h4>
            <p class="text-muted/60 text-sm leading-relaxed">
              Un boss con miles de puntos de vida aparece durante un evento temporal. 
              Toda la comunidad puede participar.
            </p>
          </div>
          <div class="space-y-3">
            <span class="text-4xl font-black text-primary-500">02</span>
            <h4 class="text-foreground font-bold">Registra Repeticiones</h4>
            <p class="text-muted/60 text-sm leading-relaxed">
              Cada dominada, flexión o fondo que haces inflige daño al boss.
              Ve la barra de vida bajar en tiempo real.
            </p>
          </div>
          <div class="space-y-3">
            <span class="text-4xl font-black text-primary-500">03</span>
            <h4 class="text-foreground font-bold">Gana Recompensas</h4>
            <p class="text-muted/60 text-sm leading-relaxed">
              Cuando el boss cae, todos los participantes desbloquean cofres 
              con títulos, marcos de avatar y efectos exclusivos.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         HOW TO USE — Step by step (FAQish long-form)
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-5xl w-full px-6 py-16 md:py-24 space-y-12" id="como-funciona">
      <div class="text-center space-y-6">
        <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
          Cómo <span class="text-primary-500">funciona</span>
        </h2>
        <p class="text-lg text-muted max-w-2xl mx-auto leading-relaxed font-medium">
          Empieza a contar tus dominadas y flexiones en 3 pasos
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="card-stats p-8 space-y-5 border-border/40 text-center">
          <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
            <span class="text-3xl font-black text-white">1</span>
          </div>
          <h3 class="text-lg font-bold text-foreground">Regístrate con Google</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Sin contraseña, sin complicaciones. Un clic con tu cuenta de Google y ya estás dentro.
          </p>
        </div>

        <div class="card-stats p-8 space-y-5 border-border/40 text-center">
          <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
            <span class="text-3xl font-black text-white">2</span>
          </div>
          <h3 class="text-lg font-bold text-foreground">Registra tus Repeticiones</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Selecciona dominadas, flexiones, fondos o muscle ups. Pon el número y dale a añadir. Ya cuentan.
          </p>
        </div>

        <div class="card-stats p-8 space-y-5 border-border/40 text-center">
          <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
            <span class="text-3xl font-black text-white">3</span>
          </div>
          <h3 class="text-lg font-bold text-foreground">Compite y Sube de Nivel</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">
            Gana monedas, sube tu ranking global, compra cosméticos en la tienda y derrota bosses con la comunidad.
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         FAQ — Real questions for SEO + structured data match
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-4xl w-full px-6 py-16 md:py-24 space-y-12" id="preguntas-frecuentes">
      <div class="text-center space-y-4">
        <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
          Preguntas <span class="text-primary-500">Frecuentes</span>
        </h2>
      </div>

      <div class="space-y-4">
        <details v-for="faq in faqs" :key="faq.q" class="card-stats border-border/40 group open:border-primary-500/30 transition-all">
          <summary class="p-6 md:p-8 cursor-pointer flex items-center justify-between text-foreground font-bold text-lg hover:text-primary-500 transition-colors list-none">
            {{ faq.q }}
            <ChevronDown class="w-5 h-5 text-muted group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
          </summary>
          <div class="px-6 md:px-8 pb-6 md:pb-8 text-muted font-medium text-sm leading-relaxed -mt-2">
            {{ faq.a }}
          </div>
        </details>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         LIVE LEADERBOARD — Social proof 
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-5xl w-full px-6 py-16 md:py-32 space-y-16" id="ranking">
      <div class="text-center space-y-4">
        <h2 class="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-none">Clasificación Global</h2>
        <p class="text-muted/40 font-bold tracking-[0.2em] text-[11px] uppercase">Ranking de dominadas y calistenia en tiempo real</p>
      </div>
      
      <div class="card-stats !p-0 overflow-hidden border-white/5">
         <div class="p-8 bg-white/5 border-b border-white/5">
            <span class="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">LIVE RANKING</span>
         </div>
         <Leaderboard />
      </div>
      
      <div class="text-center pt-8">
        <button 
          @click="$emit('start')"
          class="text-xs font-black text-primary-500 uppercase tracking-[0.5em] hover:text-white transition-all group"
        >
          UNIRSE AL RANKING <span class="inline-block group-hover:translate-x-2 transition-transform">&rarr;</span>
        </button>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         FINAL CTA
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-4xl w-full px-6 py-20 md:py-32 text-center space-y-10">
      <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
        Empieza a contar tus <span class="text-primary-500">dominadas</span> hoy
      </h2>
      <p class="text-lg text-muted max-w-2xl mx-auto leading-relaxed font-medium">
        Únete a la comunidad de calistenia de Reppy. Registra flexiones, fondos y muscle ups. 
        100% gratis, para siempre.
      </p>
      <button 
        @click="$emit('start')"
        class="btn-reppy !text-xl !px-16 !py-6 shadow-[0_20px_40px_rgba(var(--primary),0.2)]"
      >
        CREAR CUENTA GRATIS
      </button>
    </section>

    <!-- Footer -->
    <footer class="w-full py-24 border-t border-border/40 text-center space-y-8">
      <div class="max-w-5xl mx-auto px-6 space-y-6">
        <div class="flex flex-col md:flex-row justify-center items-center gap-10 text-muted/30">
          <span class="text-[11px] font-bold tracking-[0.4em] uppercase">REPPY © 2026</span>
          <div class="w-1 h-1 bg-border/40 rounded-full hidden md:block"></div>
          <span class="text-[11px] font-bold tracking-[0.4em] uppercase">App de Calistenia Gratuita</span>
          <div class="w-1 h-1 bg-border/40 rounded-full hidden md:block"></div>
          <span class="text-[11px] font-bold tracking-[0.4em] uppercase">Dominadas · Flexiones · Fondos</span>
        </div>
        <p class="text-[10px] text-muted/20 max-w-lg mx-auto leading-relaxed">
          Reppy es un tracker de calistenia con sistema RPG para registrar dominadas, flexiones, 
          fondos, muscle ups y dominadas con lastre. Disponible en español e inglés.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { 
  Activity, Trophy, Users, Sword, Flame, Plus, 
  ArrowUp, ArrowDown, ArrowDownUp, Dumbbell, ChevronDown 
} from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import Leaderboard from './Leaderboard.vue';

const i18n = useI18nStore();
const authStore = useAuthStore();
defineEmits(['start']);

const hasActiveEvent = ref(false);
const activeBoss = ref(null);

const faqs = [
  {
    q: '¿Reppy es gratis?',
    a: 'Sí, Reppy es 100% gratuito. Puedes registrarte con Google y empezar a contar tus repeticiones de calistenia sin ningún coste.'
  },
  {
    q: '¿Qué ejercicios puedo registrar?',
    a: 'Puedes registrar dominadas (pull-ups), flexiones (push-ups), fondos (dips), muscle ups y dominadas con lastre (weighted pull-ups).'
  },
  {
    q: '¿Cómo funciona el sistema RPG?',
    a: 'Cada repetición te da Reppy Coins y experiencia en 4 atributos: Fuerza (STR), Potencia (PWR), Resistencia (END) y Agilidad (AGI). Puedes gastar las monedas en la tienda para comprar títulos, marcos y efectos exclusivos.'
  },
  {
    q: '¿Qué son los Boss Fights?',
    a: 'Son eventos comunitarios donde todos los usuarios luchan contra un boss épico. Cada repetición que registras inflige daño al boss. Al derrotarlo, toda la comunidad desbloquea cofres con recompensas exclusivas.'
  },
  {
    q: '¿Puedo ver mi progreso de entrenamiento?',
    a: 'Sí. Reppy incluye un heatmap de actividad estilo GitHub donde ves todos tus días de entrenamiento, además de estadísticas de racha, volumen total y progreso diario con metas personalizadas.'
  },
  {
    q: '¿Puedo competir con otros usuarios?',
    a: 'Sí. Reppy tiene rankings globales filtrados por día, semana, mes y total. También puedes añadir amigos y ver un ranking privado con tu círculo de entrenamiento.'
  },
  {
    q: '¿Funciona en el móvil?',
    a: 'Sí. Reppy está optimizado para móvil con una interfaz responsive y una barra de navegación inferior para acceso rápido a todas las secciones.'
  },
  {
    q: '¿Necesito descargar algo?',
    a: 'No. Reppy es una web app que funciona directamente en tu navegador. No necesitas descargar nada. Compatible con Chrome, Firefox, Safari y Edge.'
  }
];

onMounted(async () => {
  try {
    const res = await axios.get('/api/boss/active');
    if (res.data && res.data.boss) {
      hasActiveEvent.value = true;
      activeBoss.value = res.data.boss;
    }
  } catch (e) {
    console.error('Landing sync error:', e);
  }
});
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.animate-in { animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

details summary::-webkit-details-marker { display: none; }
details[open] summary { border-bottom: 1px solid rgba(255,255,255,0.05); }
</style>
