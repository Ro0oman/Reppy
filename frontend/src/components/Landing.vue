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

      <!-- Active Boss Banner (VISIBLE TO ALL) -->
      <div class="w-full max-w-5xl mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
        <!-- SEO-aware event header -->
        <div class="flex items-center gap-3 mb-6 px-4">
          <span class="px-3 py-1 bg-primary-500/20 text-primary-500 text-[10px] font-black uppercase tracking-widest rounded-full">Evento Gratuito</span>
        </div>

        <!-- NEW Minimalist Boss Banner (Lore-focused) -->
        <BossBanner />

        <div class="flex justify-center mt-8">
           <button @click="$emit('start')" class="btn-reppy !px-12 !py-5 shadow-xl transition-transform hover:scale-105 active:scale-95">
             {{ authStore.isAuthenticated ? 'Ver Batalla' : 'Unirse a la caza gratis' }}
           </button>
        </div>
      </div>



      <!-- H1: PRIMARY SEO KEYWORD TARGET -->
      <h1 class="text-5xl md:text-[8rem] font-bold tracking-tight text-foreground leading-tight animate-in fade-in duration-1000 max-w-6xl">
        Contador de <span class="text-primary-500">Dominadas</span> y Calistenia Gratis – Reppy
      </h1>
      
      <!-- SEO-rich subtitle -->
      <p class="max-w-3xl text-xl md:text-3xl text-muted font-medium tracking-tight leading-snug animate-in fade-in duration-1000 delay-300">
        La mejor herramienta para registrar tus <strong class="text-foreground">dominadas</strong>, <strong class="text-foreground">flexiones</strong> y progresar en <strong class="text-foreground">calistenia</strong> con sistema RPG. 
        Gana experiencia, compite en rankings y derrota bosses con la comunidad.
      </p>

      <!-- Primary Action -->
      <div class="flex flex-col md:flex-row items-center gap-6 animate-in-delay-2">
        <button @click="start" class="btn-reppy !text-lg !px-12 !py-5 shadow-xl">
          {{ authStore.isAuthenticated ? 'IR AL DASHBOARD' : 'EMPEZAR GRATIS AHORA' }}
        </button>
        <div class="flex items-center gap-4">
          <router-link to="/" class="text-sm font-bold text-muted hover:text-foreground transition-colors mr-2">
            Explorar funciones &rarr;
          </router-link>
          
          <a href="https://github.com/Ro0oman/Reppy" target="_blank"
             class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface/40 hover:bg-surface/60 border border-white/10 transition-all group">
            <Github class="w-5 h-5 text-muted group-hover:text-foreground" />
            <div class="flex items-center gap-2">
              <Star class="w-4 h-4 text-primary-500 fill-primary-500 animate-pulse" />
              <span class="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Star the Protocol</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         SEARCH INTENT SECTIONS — Critical for SEO
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-7xl w-full px-6 py-20 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
      <div class="space-y-8">
        <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
          ¿Para qué sirve un <span class="text-primary-500">contador de dominadas</span>?
        </h2>
        <div class="space-y-6 text-lg text-muted leading-relaxed font-medium">
          <p>
            Un contador de dominadas es mucho más que una simple libreta digital. Es la base de la 
            <strong>sobrecarga progresiva</strong> en calistenia. Si no sabes cuántas repeticiones hiciste 
            la semana pasada, no puedes saber si estás mejorando hoy.
          </p>
          <p>
            Reppy permite registrar tus repeticiones diarias de forma instantánea, asignándolas a 
            tus estadísticas de personaje. Esto te permite visualizar tu <strong>volumen total de entrenamiento</strong>, 
            identificar estancamientos y mantener la constancia necesaria para ganar masa muscular y fuerza.
          </p>
          <ul class="space-y-4">
            <li class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
              <span>Seguimiento de volumen semanal automático</span>
            </li>
            <li class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
              <span>Visualización de rachas y consistencia</span>
            </li>
            <li class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
              <span>Motivación intrínseca mediante progresión RPG</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="relative group">
        <div class="absolute inset-0 bg-primary-500/10 blur-3xl group-hover:bg-primary-500/20 transition-all rounded-full"></div>
        <div class="card-stats p-10 border-primary-500/20 relative bg-surface/40 backdrop-blur-3xl overflow-hidden">
           <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl"></div>
           <Activity class="w-12 h-12 text-primary-500 mb-6" />
           <h3 class="text-2xl font-bold text-foreground mb-4">Analítica de Entrenamiento</h3>
           <p class="text-muted/60 text-sm leading-relaxed mb-8">
             Visualiza cada dominada, flexión y fondo en un heatmap interactivo. 
             La constancia es el único secreto del éxito en el street workout.
           </p>
           <div class="h-1.5 w-full bg-surface-dark/10 rounded-full overflow-hidden">
              <div class="h-full bg-primary-500 w-[85%] shadow-[0_0_15px_rgba(var(--primary),0.4)]"></div>
           </div>
        </div>
      </div>
    </section>

    <!-- SECTION: HOW TO IMPROVE -->
    <section class="max-w-7xl w-full px-6 py-20 md:py-32 bg-surface/10 rounded-[4rem] border border-white/5">
      <div class="text-center space-y-12 mb-20">
        <h2 class="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-none">
          Cómo <span class="text-primary-500">mejorar</span> tus dominadas
        </h2>
        <p class="text-xl text-muted max-w-3xl mx-auto leading-relaxed font-medium">
          No se trata de entrenar más fuerte, sino de entrenar de forma más inteligente. 
          Aquí tienes los 3 pilares para reventar tu récord personal.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <article class="card-stats p-10 space-y-6 hover:bg-surface/60 transition-all border-border/40">
          <div class="text-4xl font-black text-primary-500/40">01</div>
          <h3 class="text-2xl font-bold text-foreground tracking-tight">Sobrecarga Progresiva</h3>
          <p class="text-muted/90 text-sm leading-relaxed">
            Trata de aumentar el volumen total (sets x reps) cada semana. 
            Reppy te muestra tu volumen total por ejercicio para que nunca te estanques.
          </p>
        </article>
        <article class="card-stats p-10 space-y-6 hover:bg-surface/60 transition-all border-border/40">
          <div class="text-4xl font-black text-primary-500/40">02</div>
          <h3 class="text-2xl font-bold text-foreground tracking-tight">Frecuencia Semanal</h3>
          <p class="text-muted/90 text-sm leading-relaxed">
            Frecuencia 2 o 3 es ideal para dominadas. Usa el heatmap de Reppy para 
            asegurarte de que estás dejando los días de descanso necesarios pero manteniendo el ritmo.
          </p>
        </article>
        <article class="card-stats p-10 space-y-6 hover:bg-surface/60 transition-all border-border/40">
          <div class="text-4xl font-black text-primary-500/40">03</div>
          <h3 class="text-2xl font-bold text-foreground tracking-tight">Control de Intensidad</h3>
          <p class="text-muted/90 text-sm leading-relaxed">
            Alterna entre días de volumen alto (flexiones, dominadas normales) y 
            días de potencia (muscle ups, dominadas con lastre) para optimizar tus atributos STR y PWR.
          </p>
        </article>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         WHAT IS REPPY — Detailed SEO content
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-5xl w-full px-6 py-20 md:py-32 space-y-8" id="que-es-reppy">
      <div class="text-center space-y-6 mb-16">
        <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
          ¿Qué es <span class="text-primary-500">Reppy</span>?
        </h2>
        <div class="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed font-medium space-y-6">
          <p>
            Reppy es la primera <strong class="text-foreground">app de calistenia gratuita</strong> diseñada para transformar 
            tu entrenamiento en una aventura épica. Creemos que la mayor barrera para el fitness es la falta de 
            motivación constante, por eso hemos aplicado mecánicas de juegos RPG a la barra de dominadas.
          </p>
          <p>
            Cada vez que registras una serie en nuestro <strong>contador de repeticiones</strong>, tu personaje 
            digital gana puntos de experiencia. A medida que subes de nivel, desbloqueas títulos, marcos para 
            tu avatar y efectos visuales que demuestran tu estatus en la comunidad global de calistenia.
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         INTERFACE SHOWCASE — Visual proof of the product
    ═══════════════════════════════════════════════════════════ -->
    <section class="max-w-7xl w-full px-6 py-20 md:py-32 space-y-20" id="interfaz">
      <div class="text-center space-y-6">
        <h2 class="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-none uppercase italic">
          DENTRO DEL <span class="text-primary-500">PROTOCOLO</span>
        </h2>
        <p class="text-xl text-muted max-w-3xl mx-auto leading-relaxed font-medium">
          Explora la interfaz táctica diseñada para el máximo rendimiento. 
          Cada detalle ha sido optimizado para que te centres en lo único que importa: la siguiente repetición.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Dashboard Preview -->
        <div class="group relative space-y-6">
          <div class="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-surface/20 backdrop-blur-3xl p-4 transition-all duration-700 group-hover:border-primary-500/50 group-hover:shadow-[0_0_50px_rgba(var(--primary),0.2)]">
            <img src="/img/showcase/dashboard_preview.png" alt="Panel de Control Reppy" class="w-full rounded-[1.8rem] transition-transform duration-1000 group-hover:scale-[1.02]" />
            <div class="absolute inset-0 bg-gradient-to-t from-deep-abyss via-transparent to-transparent opacity-60"></div>
          </div>
          <div class="px-4 space-y-2">
            <h3 class="text-2xl font-black text-foreground uppercase tracking-tight italic">01. PANEL DE CONTROL</h3>
            <p class="text-muted text-sm leading-relaxed">Gestión centralizada de protocolos, calendario de consistencia y estado del Boss actual.</p>
          </div>
        </div>

        <!-- Social Preview -->
        <div class="group relative space-y-6 md:mt-24">
          <div class="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-surface/20 backdrop-blur-3xl p-4 transition-all duration-700 group-hover:border-blue-500/50 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.2)]">
            <img src="/img/showcase/social_preview.png" alt="Muro Social Reppy" class="w-full rounded-[1.8rem] transition-transform duration-1000 group-hover:scale-[1.02]" />
            <div class="absolute inset-0 bg-gradient-to-t from-deep-abyss via-transparent to-transparent opacity-60"></div>
          </div>
          <div class="px-4 space-y-2">
            <h3 class="text-2xl font-black text-foreground uppercase tracking-tight italic">02. MURO SOCIAL</h3>
            <p class="text-muted text-sm leading-relaxed">Conecta con la comunidad, ve los entrenamientos en tiempo real y personaliza tus publicaciones.</p>
          </div>
        </div>

        <!-- Armory Preview -->
        <div class="group relative space-y-6">
          <div class="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-surface/20 backdrop-blur-3xl p-4 transition-all duration-700 group-hover:border-purple-500/50 group-hover:shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            <img src="/img/showcase/armory_preview.png" alt="Tienda de Cosméticos Reppy" class="w-full rounded-[1.8rem] transition-transform duration-1000 group-hover:scale-[1.02]" />
            <div class="absolute inset-0 bg-gradient-to-t from-deep-abyss via-transparent to-transparent opacity-60"></div>
          </div>
          <div class="px-4 space-y-2">
            <h3 class="text-2xl font-black text-foreground uppercase tracking-tight italic">03. ARMERÍA LEGENDARIA</h3>
            <p class="text-muted text-sm leading-relaxed">Canjea tus Reppy Coins por fondos dinámicos, marcos de avatar y títulos de honor exclusivos.</p>
          </div>
        </div>

        <!-- Profile Preview -->
        <div class="group relative space-y-6 md:mt-24">
          <div class="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-surface/20 backdrop-blur-3xl p-4 transition-all duration-700 group-hover:border-neon-lime/50 group-hover:shadow-[0_0_50px_rgba(191,255,0,0.2)]">
            <img src="/img/showcase/profile_preview.png" alt="Perfil de Atleta RPG" class="w-full rounded-[1.8rem] transition-transform duration-1000 group-hover:scale-[1.02]" />
            <div class="absolute inset-0 bg-gradient-to-t from-deep-abyss via-transparent to-transparent opacity-60"></div>
          </div>
          <div class="px-4 space-y-2">
            <h3 class="text-2xl font-black text-foreground uppercase tracking-tight italic">04. PERFIL DE ATLETA</h3>
            <p class="text-muted text-sm leading-relaxed">Sube de nivel tus atributos STR, PWR, END y AGI. Visualiza tu progresión de fuerza relativa.</p>
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
          <h3 class="text-3xl font-bold text-foreground">Introducción al Street Workout</h3>
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
          <h3 class="text-3xl font-bold text-foreground">Dominando la Barra: El Camino del Pull-Up</h3>
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
          <h3 class="text-3xl font-bold text-foreground">La Psicología del Fitness: Gamificación y Motivación</h3>
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
          <h3 class="text-3xl font-bold text-foreground">Nutrición y Descanso en Calistenia</h3>
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
        <p class="text-[10px] text-muted/20 max-w-lg mx-auto leading-relaxed">
          Reppy es un tracker de calistenia con sistema RPG para registrar dominadas, flexiones, 
          fondos, muscle ups y dominadas con lastre. Disponible en español e inglés.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';
import axios from 'axios';
import { 
  Activity, Trophy, Users, Sword, Flame, Plus, 
  ArrowUp, ArrowDown, ArrowDownUp, Dumbbell, ChevronDown,
  Github, Star
} from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import BossHealth from './BossHealth.vue';
import BossBanner from './BossBanner.vue';

const Leaderboard = defineAsyncComponent(() => import('./Leaderboard.vue'));

const i18n = useI18nStore();
const authStore = useAuthStore();
const leaderboardTrigger = ref(null);
const shouldLoadLeaderboard = ref(false);

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
