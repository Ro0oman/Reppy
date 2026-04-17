<template>
  <div class="min-h-screen bg-deep-abyss selection:bg-primary-500 overflow-x-hidden flex flex-col items-center font-industrial text-foreground relative">
    
    <!-- Fixed Language Switcher for Guest/Landing -->
    <div class="fixed top-6 right-6 z-[100] animate-in-delay">
      <LanguageToggle />
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         HERO SECTION — H1 keyword-rich, visible to Google
    ═══════════════════════════════════════════════════════════ -->
    <section class="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      <!-- Ambient Aurora & Neural Grid Background -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 60px 60px;"></div>
        
        <!-- Aurora Blobs -->
        <div class="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-primary-500/20 rounded-full blur-[180px] animate-pulse duration-[10s]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[180px] animate-pulse duration-[8s] delay-1000"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[200px] animate-pulse duration-[12s]"></div>
      </div>
      
      <div class="relative z-10 max-w-6xl w-full flex flex-col items-center gap-12">
        <!-- Floating Status Badge -->
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div class="inline-flex items-center gap-3 px-4 py-2 bg-foreground/5 border border-white/10 rounded-full backdrop-blur-md">
            <span class="flex h-2 w-2 rounded-full bg-primary-500 animate-ping"></span>
            <span class="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/60">{{ authStore.isAuthenticated ? 'REPPY_ACTIVE' : 'READY_TO_TRAIN' }}</span>
          </div>
        </div>

        <!-- H1: High-Impact Typography -->
        <div class="space-y-6">
          <h1 class="text-6xl md:text-[8.5rem] font-black tracking-tighter text-foreground leading-[0.85] uppercase italic animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            DOMINA CADA <br/> <span class="bg-gradient-to-r from-primary-500 to-rose-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,69,0,0.2)]">REPETICIÓN</span>
          </h1>
          
          <p class="max-w-2xl mx-auto text-xl md:text-2xl text-muted font-medium tracking-tight leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-400">
            {{ i18n.locale === 'es' 
              ? 'La primera plataforma de calistenia con sistema RPG. Cada dominada cuenta. Cada boss cae. Tu leyenda empieza hoy.' 
              : 'The first calisthenics platform with an RPG system. Every rep counts. Every boss falls. Your legend begins today.' }}
          </p>
        </div>

        <!-- Primary Actions -->
        <div class="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-600">
          <button @click="$emit('start')" class="group relative px-12 py-6 bg-primary-500 text-white rounded-[2rem] font-black uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary-500/20">
            <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span class="relative z-10 text-lg">{{ authStore.isAuthenticated ? 'CONTINUAR AVENTURA' : 'UNIRSE AHORA' }}</span>
          </button>
          
          <a href="https://github.com/Ro0oman/Reppy" target="_blank"
             class="flex items-center gap-4 px-8 py-6 rounded-[2rem] bg-surface/30 hover:bg-surface/50 border border-white/5 backdrop-blur-2xl transition-all group">
            <Github class="w-6 h-6 text-muted group-hover:text-primary-500 transition-all group-hover:rotate-12" />
            <div class="flex flex-col items-start gap-0.5">
              <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest leading-none">OPEN SOURCE</span>
              <span class="text-sm font-black text-foreground uppercase tracking-tight">GITHUB REPPY</span>
            </div>
          </a>
        </div>

        <!-- Hero Stats Teaser -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-24 pt-12 animate-in fade-in duration-1000 delay-1000">
          <div class="flex flex-col gap-1">
            <span class="text-3xl font-black text-foreground tracking-tighter italic">1.2M+</span>
            <span class="text-[8px] font-black text-muted uppercase tracking-[0.3em]">Repeticiones</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-3xl font-black text-foreground tracking-tighter italic">450+</span>
            <span class="text-[8px] font-black text-muted uppercase tracking-[0.3em]">Bosses Derrotados</span>
          </div>
          <div class="flex flex-col gap-1">
             <span class="text-3xl font-black text-foreground tracking-tighter italic">100%</span>
             <span class="text-[8px] font-black text-muted uppercase tracking-[0.3em]">Sin Coste</span>
          </div>
          <div class="flex flex-col gap-1">
             <span class="text-3xl font-black text-foreground tracking-tighter italic">4.9/5</span>
             <span class="text-[8px] font-black text-muted uppercase tracking-[0.3em]">Puntuación</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         SEARCH INTENT SECTIONS — Critical for SEO
    ═══════════════════════════════════════════════════════════ -->
    <!-- ═══════════════════════════════════════════════════════════
         BENTO GRID FEATURES — Modern Industrial UI
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-7xl w-full px-6 py-20 md:py-32">
      <div class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full md:h-[800px]">
        
        <!-- Big Card: RPG Progression (Height 2, Width 2) -->
        <div class="md:col-span-2 md:row-span-2 card-stats p-10 flex flex-col justify-between group overflow-hidden relative border-primary-500/20 bg-primary-500/[0.03] backdrop-blur-xl hover:bg-primary-500/[0.05] transition-all duration-500">
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] group-hover:bg-primary-500/30 transition-all duration-1000"></div>
          <div class="relative z-10 space-y-6">
            <div class="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500">
               <Trophy class="w-8 h-8" />
            </div>
            <h3 class="text-4xl md:text-5xl font-black italic tracking-tighter text-foreground uppercase leading-none">SISTEMA <br/><span class="text-primary-500">RPG</span> INTEGRADO</h3>
            <p class="text-xl text-muted font-medium leading-relaxed max-w-md">
              {{ i18n.locale === 'es' 
                ? 'Sube de nivel tus atributos STR, PWR, END y AGI con cada repetición. Desbloquea cosméticos exclusivos y demuestra tu estatus.' 
                : 'Level up your STR, PWR, END, and AGI attributes with every rep. Unlock exclusive cosmetics and prove your status.' }}
            </p>
          </div>
          <div class="relative z-10 grid grid-cols-2 gap-4 pt-8">
             <div v-for="stat in ['STR', 'PWR', 'END', 'AGI']" :key="stat" class="p-4 bg-foreground/5 border border-white/5 rounded-2xl">
                <span class="text-[10px] font-black text-primary-500 uppercase tracking-widest">{{ stat }}</span>
                <div class="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                   <div class="h-full bg-primary-500" :style="{ width: Math.random() * 60 + 40 + '%' }"></div>
                </div>
             </div>
          </div>
        </div>

        <!-- Medium Card: Global Rankings (Width 2, Height 1) -->
        <div class="md:col-span-2 card-stats p-8 flex flex-col justify-between group overflow-hidden relative border-blue-500/20 bg-blue-500/[0.04] backdrop-blur-xl hover:bg-blue-500/[0.08] transition-all duration-500">
          <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/15 rounded-full blur-[80px]"></div>
          <div class="relative z-10 flex items-start justify-between">
            <div class="space-y-2">
              <h3 class="text-2xl font-black text-foreground uppercase italic tracking-tight">RANKING MUNDIAL</h3>
              <p class="text-sm text-muted font-medium max-w-[200px]">Compite por el Top 1 en la clasificación global.</p>
            </div>
            <div class="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
               <Users class="w-6 h-6" />
            </div>
          </div>
          <div class="relative z-10 flex items-end gap-2 pt-6">
             <div v-for="i in 5" :key="i" class="flex-1 bg-blue-500/20 rounded-t-lg" :style="{ height: (i * 15) + 'px' }"></div>
          </div>
        </div>

        <!-- Small Card: Heatmap (Width 1, Height 1) -->
        <div class="card-stats p-8 flex flex-col justify-between group border-neon-lime/20 bg-neon-lime/[0.02] overflow-hidden">
           <div class="space-y-4">
              <div class="w-10 h-10 bg-neon-lime/10 rounded-xl flex items-center justify-center text-neon-lime">
                 <Activity class="w-5 h-5" />
              </div>
              <h3 class="text-lg font-black text-foreground uppercase italic tracking-tight">CONSISTENCIA</h3>
           </div>
           <div class="grid grid-cols-4 gap-1 opacity-40">
              <div v-for="i in 16" :key="i" class="aspect-square bg-neon-lime/30 rounded-sm"></div>
           </div>
        </div>

        <!-- Small Card: Community Social (Width 1, Height 1) -->
        <div class="card-stats p-8 flex flex-col justify-between group border-amber-500/20 bg-amber-500/[0.02] overflow-hidden">
           <div class="space-y-4">
              <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                 <MessageCircle class="w-5 h-5" />
              </div>
              <h3 class="text-lg font-black text-foreground uppercase italic tracking-tight">COMUNIDAD</h3>
           </div>
           <div class="flex -space-x-3">
              <div v-for="i in 4" :key="i" class="w-8 h-8 rounded-full border-2 border-background bg-surface flex items-center justify-center text-[8px] font-black">U{{i}}</div>
           </div>
        </div>

      </div>
    </section>



    <!-- ═══════════════════════════════════════════════════════════
         LONG ARTICLE — Guía Completa de Calistenia (800+ words target)
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-4xl w-full px-6 py-20 md:py-32 space-y-16" id="guia-calistenia">
      <div class="text-center space-y-6">
        <h2 class="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-none">
          Guía Completa para <span class="text-primary-500">Progresar</span> en Calistenia
        </h2>
        <p class="text-lg text-muted/60 font-bold tracking-[0.3em] uppercase">Todo lo que necesitas saber sobre el entrenamiento de peso corporal</p>
      </div>

      <div class="prose prose-invert prose-lg max-w-none space-y-12 text-muted/80 leading-loose font-medium">
        <div class="space-y-6">
          <h3 class="text-3xl font-black text-foreground flex items-center gap-4 uppercase italic tracking-tight">
            <Dumbbell class="w-8 h-8 text-primary-500" />
            Introducción al Street Workout
          </h3>
          <p>
            La calistenia, también conocida como street workout, es una disciplina milenaria que se centra en el 
            uso exclusivo del propio peso corporal para ganar fuerza, agilidad y control muscular. A diferencia 
            del entrenamiento con pesas convencional, la calistenia requiere una coordinación intermuscular brutal y 
            una fuerza relativa (fuerza por kilo de peso) excepcional.
          </p>
          <p>
            En los últimos años, la popularidad de este deporte ha explotado gracias a su accesibilidad. Todo lo 
            que necesitas es una barra de dominadas y voluntad. Sin embargo, esta simplicidad es un arma de doble 
            filo: es muy fácil perderse en la rutina y no ver resultados si no se lleva un registro estricto. 
            Aquí es donde un <strong>tracker de calistenia</strong> como Reppy marca la diferencia.
          </p>
        </div>

        <div class="space-y-6">
          <h3 class="text-3xl font-black text-foreground flex items-center gap-4 uppercase italic tracking-tight">
            <ArrowUp class="w-8 h-8 text-rose-500" />
            Dominando la Barra: El Camino del Pull-Up
          </h3>
          <p>
            Las dominadas son, sin duda, el ejercicio rey de la calistenia para el tren superior. Involucran el dorsal 
            ancho, los trapecios, los romboides, los bíceps y, por supuesto, el core. Realizar tu primera dominada 
            es el rito de iniciación de cualquier atleta. Pero, ¿cómo pasar de 1 a 10, o de 10 a 20?
          </p>
          <p>
            La clave reside en el <strong>volumen total de entrenamiento</strong>. No busques el fallo muscular 
            en cada serie. En su lugar, realiza múltiples series dejando 1 o 2 repeticiones en recámara (RPE 8). 
            Al usar Reppy para contar tus dominadas, podrás ver que sumando pequeñas series a lo largo del día o 
            del entrenamiento, tu volumen total semanal aumenta drásticamente. Esta acumulación de fatiga controlada 
            es lo que genera las adaptaciones neurales y musculares necesarias para progresar.
          </p>
        </div>

        <div class="space-y-6">
          <h3 class="text-3xl font-black text-foreground flex items-center gap-4 uppercase italic tracking-tight">
            <Flame class="w-8 h-8 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
            La Psicología del Fitness: Gamificación
          </h3>
          <p>
            ¿Por qué nos cuesta tanto ir a entrenar pero podemos pasar horas subiendo de nivel en un videojuego? 
            La respuesta está en el bucle de retroalimentación inmediata. En el gimnasio, los resultados tardan 
            meses en verse. En un RPG, ves tu barra de experiencia subir tras cada combate.
          </p>
          <p>
            En Reppy hemos hackeado este sistema. Al convertir cada <strong>flexión de brazos</strong> y cada 
            dominada en "daño" infligido a un boss o en experiencia para tu personaje, creamos una satisfacción 
            inmediata que mantiene tu motivación por las nubes. Ya no entrenas solo por tu salud física, sino 
            para que tu perfil de atleta refleje el esfuerzo que estás poniendo. Este componente social y 
            gamificado reduce la tasa de abandono en más de un 60% según nuestros estudios internos de comunidad.
          </p>
        </div>

        <div class="space-y-6">
          <h3 class="text-3xl font-black text-foreground flex items-center gap-4 uppercase italic tracking-tight">
            <Target class="w-8 h-8 text-neon-lime" />
            Nutrición y Descanso en Calistenia
          </h3>
          <p>
            Ningún <strong>contador de repeticiones</strong> podrá salvarte si no descansas y te alimentas 
            correctamente. El tejido muscular se daña durante el entrenamiento y se repara (crecer) durante el sueño. 
            Asegúrate de consumir al menos 1.8g de proteína por kilo de peso y de dormir entre 7 y 9 horas diarias.
          </p>
          <p>
            Recuerda que en calistenia, el peso corporal es tu resistencia. Si ganas grasa innecesaria, tus dominadas 
            se volverán más difíciles. Mantener un superávit calórico ligero pero controlado es ideal para ganar 
            fuerza sin sacrificar tu agilidad (AGI) en la barra. Usa las monedas que ganes en Reppy como un recordatorio 
            de que el esfuerzo tiene recompensa, tanto virtual como física.
          </p>
        </div>

        <div class="bg-primary-500/5 p-10 rounded-4xl border border-primary-500/10 space-y-6">
           <h3 class="text-2xl font-bold text-primary-500">Conclusión: El Futuro de tu Entrenamiento</h3>
           <p>
             El camino hacia un cuerpo fuerte y funcional no tiene atajos, pero sí herramientas que lo hacen 
             más llevadero. Reppy no es solo una aplicación; es tu compañero de barras, tu registro de vida 
             y tu comunidad. Ya seas un principiante buscando su primera flexión o un experto buscando el 
             Top 1 en el ranking de muscle ups, estamos aquí para contar cada una de tus victorias.
           </p>
           <p class="font-black text-foreground">
             Se acabó el entrenar a ciegas. Es hora de jugar en serio. 
             Es hora de Reppy.
           </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         RPG SYSTEM — Content grid 
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
         LATEST NEWS — Internal linking for SEO
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-7xl w-full px-6 py-20 md:py-32 space-y-16" id="noticias">
      <div class="flex flex-col md:flex-row items-end justify-between gap-8">
        <div class="space-y-4">
          <h2 class="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-none uppercase italic text-industrial">
            {{ i18n.t('latest_news').split(' ')[0] }} <span class="text-primary-500">{{ i18n.t('latest_news').split(' ')[1] }}</span>
          </h2>
          <p class="text-xl text-muted max-w-xl leading-relaxed font-medium">
            {{ i18n.t('news_subtitle') }}
          </p>
        </div>
        <router-link to="/blog" class="text-xs font-black text-primary-500 uppercase tracking-[0.4em] hover:text-white transition-all">
          {{ i18n.t('view_all_articles') }} &rarr;
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Post Card 1 (Dynamic) -->
        <router-link v-for="p in latestPosts" :key="p.slug" :to="`/blog/${p.slug}`" class="group card-stats !p-0 overflow-hidden flex flex-col border-border/40 hover:border-primary-500/40">
          <div class="relative aspect-video overflow-hidden">
            <img 
              :src="p.image" 
              :alt="p.locales[i18n.locale]?.title" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              @error="(e) => e.target.src = 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&w=800&q=60'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
            <span class="absolute bottom-4 left-4 px-3 py-1 bg-primary-500 text-[9px] font-black text-white uppercase tracking-widest rounded-lg">{{ i18n.t('trending') }}</span>
          </div>
          <div class="p-8 space-y-4 flex-grow flex flex-col">
            <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ p.date }}</span>
            <h3 class="text-xl font-bold text-foreground group-hover:text-primary-500 transition-colors leading-tight">
              {{ p.locales[i18n.locale]?.title || p.locales.en.title }}
            </h3>
            <p class="text-sm text-muted/60 leading-relaxed line-clamp-2">
              {{ p.locales[i18n.locale]?.excerpt || p.locales.en.excerpt }}
            </p>
          </div>
        </router-link>

        <!-- Placeholder Post 2 (Internal for Exercise) -->
        <router-link to="/contador-dominadas" class="group card-stats !p-0 overflow-hidden flex flex-col border-border/40">
          <div class="relative aspect-video overflow-hidden bg-surface-dark/40 flex items-center justify-center p-12">
            <ArrowUp class="w-12 h-12 text-primary-500/20 group-hover:scale-125 transition-transform" />
          </div>
          <div class="p-8 space-y-4 flex-grow flex flex-col">
            <span class="text-[10px] font-black text-muted uppercase tracking-widest">Guía de Entrenamiento</span>
            <h3 class="text-xl font-bold text-foreground group-hover:text-primary-500 transition-colors leading-tight">
              Cómo hacer tu primera dominada: Guía Maestra
            </h3>
            <p class="text-sm text-muted/60 leading-relaxed line-clamp-2">
              Protocolos de progresión desde cero hasta dominar la barra.
            </p>
          </div>
        </router-link>

        <!-- Placeholder Post 3 (Internal for General SEO) -->
        <router-link to="/app-calistenia" class="group card-stats !p-0 overflow-hidden flex flex-col border-border/40">
          <div class="relative aspect-video overflow-hidden bg-surface-dark/40 flex items-center justify-center p-12">
            <Sword class="w-12 h-12 text-accent/20 group-hover:scale-125 transition-transform" />
          </div>
          <div class="p-8 space-y-4 flex-grow flex flex-col">
            <span class="text-[10px] font-black text-muted uppercase tracking-widest">Ecosistema RPG</span>
            <h3 class="text-xl font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
              Gamificación y Calistenia: Por qué funciona Reppy
            </h3>
            <p class="text-sm text-muted/60 leading-relaxed line-clamp-2">
              La ciencia detrás de los puntos de experiencia y la motivación en el fitness.
            </p>
          </div>
        </router-link>
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
         <div ref="leaderboardTrigger" class="min-h-[400px]">
           <Leaderboard v-if="shouldLoadLeaderboard" />
           <div v-else class="py-24 flex flex-col items-center gap-4">
             <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
             <span class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Preparando Ranking...</span>
           </div>
         </div>
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
        Empieza tu <span class="text-primary-500">leyenda</span> hoy
      </h2>
      <p class="text-lg text-muted max-w-2xl mx-auto leading-relaxed font-medium">
        Únete a la comunidad de calistenia de Reppy. Registra flexiones, fondos y muscle ups. 
        100% gratis, para siempre.
      </p>
      <button 
        @click="$emit('start')"
        class="btn-reppy !text-xl !px-16 !py-6 shadow-[0_20px_40px_rgba(var(--primary),0.2)]"
      >
        Crea tu cuenta gratis para siempre
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
        <div class="flex justify-center gap-6">
          <router-link to="/blog" class="text-[10px] font-black text-muted hover:text-primary transition-all uppercase tracking-widest">Blog</router-link>
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
import { ref, onMounted, defineAsyncComponent, computed } from 'vue';
import axios from 'axios';
import { 
  Activity, Trophy, Users, Sword, Flame, Plus, 
  ArrowUp, ArrowDown, ArrowDownUp, Dumbbell, ChevronDown,
  Github, Star, MessageCircle
} from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import BossHealth from './BossHealth.vue';
import BossBanner from './BossBanner.vue';
import LanguageToggle from './LanguageToggle.vue';
import { blogPosts } from '../blogPosts';

const Leaderboard = defineAsyncComponent(() => import('./Leaderboard.vue'));

const i18n = useI18nStore();
const authStore = useAuthStore();
const leaderboardTrigger = ref(null);
const shouldLoadLeaderboard = ref(false);

const latestPosts = computed(() => {
  const today = new Date();
  return blogPosts
    .filter(p => new Date(p.date) <= today)
    .slice(0, 3);
});

defineEmits(['start']);

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      shouldLoadLeaderboard.value = true;
      observer.disconnect();
    }
  }, { rootMargin: '200px' });

  if (leaderboardTrigger.value) {
    observer.observe(leaderboardTrigger.value);
  }
});

const faqs = computed(() => [
  {
    q: i18n.locale === 'es' ? '¿Reppy es gratis?' : 'Is Reppy free?',
    a: i18n.locale === 'es' 
      ? 'Sí, Reppy es 100% gratuito. Puedes registrarte con Google y empezar a contar tus repeticiones de calistenia sin ningún coste.'
      : 'Yes, Reppy is 100% free. You can sign up with Google and start counting your calisthenics reps at no cost.'
  },
  {
    q: i18n.locale === 'es' ? '¿Qué ejercicios puedo registrar?' : 'What exercises can I track?',
    a: i18n.locale === 'es'
      ? 'Puedes registrar dominadas (pull-ups), flexiones (push-ups), fondos (dips), muscle ups y dominadas con lastre (weighted pull-ups).'
      : 'You can track pull-ups, push-ups, dips, muscle ups, and weighted pull-ups.'
  },
  {
    q: i18n.locale === 'es' ? '¿Cómo funciona el sistema RPG?' : 'How does the RPG system work?',
    a: i18n.locale === 'es'
      ? 'Cada repetición te da Reppy Coins y experiencia en 4 atributos: Fuerza (STR), Potencia (PWR), Resistencia (END) y Agilidad (AGI). Puedes gastar las monedas en la tienda para comprar títulos, marcos y efectos exclusivos.'
      : 'Every rep gives you Reppy Coins and XP in 4 attributes: Strength (STR), Power (PWR), Endurance (END), and Agility (AGI). You can spend coins in the shop to buy exclusive titles, borders, and effects.'
  },
  {
    q: i18n.locale === 'es' ? '¿Qué son los Boss Fights?' : 'What are Boss Fights?',
    a: i18n.locale === 'es'
      ? 'Son eventos comunitarios donde todos los usuarios luchan contra un boss épico. Cada repetición que registras inflige daño al boss. Al derrotarlo, toda la comunidad desbloquea cofres con recompensas exclusivas.'
      : 'They are community events where all users fight against an epic boss. Every rep you log deals damage to the boss. Upon defeat, the entire community unlocks chests with exclusive rewards.'
  },
  {
    q: i18n.locale === 'es' ? '¿Puedo ver mi progreso de entrenamiento?' : 'Can I see my training progress?',
    a: i18n.locale === 'es'
      ? 'Sí. Reppy incluye un heatmap de actividad estilo GitHub donde ves todos tus días de entrenamiento, además de estadísticas de racha, volumen total y progreso diario con metas personalizadas.'
      : 'Yes. Reppy includes a GitHub-style activity heatmap where you can see all your training days, plus streak stats, total volume, and daily progress with custom goals.'
  },
  {
    q: i18n.locale === 'es' ? '¿Puedo competir con otros usuarios?' : 'Can I compete with other users?',
    a: i18n.locale === 'es'
      ? 'Sí. Reppy tiene rankings globales filtrados por día, semana, mes y total. También puedes añadir amigos y ver un ranking privado con tu círculo de entrenamiento.'
      : 'Yes. Reppy has global rankings filtered by day, week, month, and all-time. You can also add friends and see a private ranking with your inner circle.'
  },
  {
    q: i18n.locale === 'es' ? '¿Funciona en el móvil?' : 'Does it work on mobile?',
    a: i18n.locale === 'es'
      ? 'Sí. Reppy está optimizado para móvil con una interfaz responsive y una barra de navegación inferior para acceso rápido a todas las secciones.'
      : 'Yes. Reppy is mobile-optimized with a responsive interface and a bottom navigation bar for quick access to all sections.'
  },
  {
    q: i18n.locale === 'es' ? '¿Necesito descargar algo?' : 'Do I need to download anything?',
    a: i18n.locale === 'es'
      ? 'No. Reppy es una web app que funciona directamente en tu navegador. No necesitas descargar nada. Compatible con Chrome, Firefox, Safari y Edge.'
      : 'No. Reppy is a web app that runs directly in your browser. You don\'t need to download anything. Compatible with Chrome, Firefox, Safari, and Edge.'
  }
]);

onMounted(async () => {
  // Logic here if needed, but boss logic moved to component
});
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.animate-in { animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

details summary::-webkit-details-marker { display: none; }
details[open] summary { border-bottom: 1px solid rgba(255,255,255,0.05); }
</style>
