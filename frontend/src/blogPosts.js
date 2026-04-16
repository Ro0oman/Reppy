// Source of Truth for Blog Posts (Frontend Static Bundle)
// Sync with backend/blogData.js

export const blogPosts = [
  // =========================================================================
  // PILLAR 1: FUERZA Y TÉCNICA (Cluster Pilllar)
  // =========================================================================
  {
    slug: 'guia-definitiva-dominadas',
    date: '2026-04-16',
    author: 'Reppy Editorial',
    image: 'https://images.unsplash.com/photo-1598971639058-aba3c3933f7c?auto=format&fit=crop&w=1200&q=80',
    category: 'dominadas',
    isPillar: true,
    locales: {
      es: {
        title: 'Guía Definitiva de Dominadas: De 0 a 20 repeticiones (Manual Completo)',
        excerpt: 'La biblia de las dominadas. Técnica biomecánica, rutinas de progresión de 8 semanas y consejos para evitar lesiones.',
        keywords: ['guía dominadas', 'rutina dominadas', 'calistenia fuerza'],
        content: `
# Guía Definitiva de Dominadas: De 0 a 20 repeticiones

Las dominadas son el ejercicio rey de la calistenia. No solo construyen una espalda en forma de V, sino que son la base para trucos avanzados como el Muscle-up o el Front Lever. En esta guía, desglosamos todo lo que necesitas saber.

## 1. La Biomecánica de una Dominada Perfecta
Muchos fallan porque "tiran con los brazos". Para una dominada eficiente:
- **Retracción Escapular**: Juntar las escápulas atrás antes de subir.
- **Agarre Sólido**: Envuelve la barra con fuerza, no solo cuelgues.
- **Rango Completo**: Barbilla sobre la barra y extensión total abajo.

## 2. Rutina de Progresión de 8 Semanas
Si estás estancado, sigue este ciclo de carga progresiva.

| Fase | Duración | Objetivo | Entrenamiento Clave |
| :--- | :--- | :--- | :--- |
| **Adaptación** | Semanas 1-2 | Resistencia | 5 sets de Dead Hangs (al fallo) |
| **Fuerza Base** | Semanas 3-4 | Volumen | 5 sets de Dominadas Negativas (5s bajada) |
| **Explosión** | Semanas 5-6 | Potencia | 4 sets de Dominadas al pecho (máxima velocidad) |
| **Peaking** | Semanas 7-8 | Máximas | Test de 1 set máximo cada 3 días |

## 3. Errores Comunes que destruyen tu progreso
1. **Kiiping**: Balancear el cuerpo para subir. No construye fuerza real.
2. **Codos abiertos**: Provoca lesiones de hombro. Mantenlos a 45 grados.
3. **Falta de core**: Si tus piernas bailan, pierdes energía.

## 4. Preguntas Frecuentes (FAQ)
- **¿Puedo entrenar dominadas diario?** No se recomienda para fuerza máxima. Deja 48h de descanso.
- **¿Qué agarre es mejor?** El prono (palmas al frente) es el más completo.

[¿Listo para medir tu progreso? Usa el contador de dominadas Reppy aquí](/contador-dominadas)
`
      },
      en: {
        title: 'Ultimate Pull-up Guide: From 0 to 20 reps (Complete Manual)',
        excerpt: 'The pull-up bible. Biomechanics, 8-week routines, and injury prevention tips.',
        keywords: ['pull-up guide', 'pull-up routine', 'calisthenics strength'],
        content: `
# Ultimate Pull-up Guide: 0 to 20 Reps

Master the king of calisthenics exercises...
`
      }
    }
  },

  // =========================================================================
  // PILLAR 2: PRINCIPIANTES (Cluster Pilllar)
  // =========================================================================
  {
    slug: 'manual-inicio-calistenia',
    date: '2026-04-18',
    author: 'Reppy Editorial',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    category: 'principiantes',
    isPillar: true,
    locales: {
      es: {
        title: 'Manual Maestro de Calistenia: Cómo empezar de 0 a Pro',
        excerpt: 'Todo lo que necesitas saber para empezar tu transformación física con calistenia: equipo, nutrición y los 3 pilares básicos.',
        keywords: ['empezar calistenia', 'guía principiantes calistenia', 'rutina básica'],
        content: `
# Manual Maestro de Calistenia: De 0 a Pro

La calistenia seduce por su sencillez: tu cuerpo es el gimnasio.

## Los 3 Pilares del Principiante
1. **Empuje (Push)**: Flexiones y Fondos.
2. **Tirón (Pull)**: Remos y Dominadas.
3. **Core**: Planchas y Elevaciones de piernas.

[Regístrate en Reppy para gamificar tu entrenamiento](/dashboard)
`
      },
      en: {
        title: 'Master Calisthenics Manual: How to Start from 0',
        excerpt: 'Everything you need to know to start your transformation.',
        keywords: ['start calisthenics', 'beginner guide'],
        content: `# Master Calisthenics Manual...`
      }
    }
  },

  // =========================================================================
  // PILLAR 3: GAMIFICACIÓN (Cluster Pilllar)
  // =========================================================================
  {
    slug: 'gamificacion-fitness-ciencia',
    date: '2026-04-20',
    author: 'Reppy Editorial',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    category: 'rpg',
    isPillar: true,
    locales: {
      es: {
        title: 'La Ciencia de la Gamificación: Cómo hackear tu cerebro para entrenar',
        excerpt: 'Descubre cómo Reppy usa la dopamina para que nunca faltes a tu entreno.',
        keywords: ['gamificación fitness', 'psicología deporte', 'hábitos saludables'],
        content: `
# Gamificación en el Fitness: Por qué funciona

## 1. El Bucle de la Dopamina
En un RPG, cuando matas a un monstruo, subes de nivel...

[Entra en la arena y derrota al Boss de hoy](/dashboard)
`
      },
      en: {
        title: 'Gaming your Fitness: The Science of Motivation',
        excerpt: 'Learn how Reppy uses dopamine to keep you training.',
        keywords: ['gamification', 'fitness motivation'],
        content: `# Gamification in Fitness...`
      }
    }
  },

  // Satellites Sync
  {
    slug: 'dolor-codo-dominadas',
    date: '2026-04-22',
    author: 'Reppy Editorial',
    category: 'dominadas',
    locales: {
      es: {
        title: '¿Te duele el codo al hacer dominadas? Aquí la solución',
        excerpt: 'Aprende a distinguir entre fatiga y epicondilitis.',
        content: `# Dolor de Codo... Si quieres evitar que esto vuelva a pasar, lee nuestra sección de técnica en la [Guía Definitiva de Dominadas](/blog/guia-definitiva-dominadas).`
      },
      en: { title: 'Elbow Pain During Pull-ups?', content: '# Elbow Pain Guide...' }
    }
  },
  {
    slug: 'error-mas-dominadas',
    date: '2026-04-24',
    author: 'Reppy Editorial',
    category: 'dominadas',
    locales: {
      es: {
        title: 'El error maestro que te impide pasar de 5 dominadas',
        excerpt: 'Falla tu retracción escapular.',
        content: `# Retracción Escapular... Dominar esto es el primer paso de nuestra [Guía Definitiva de Dominadas](/blog/guia-definitiva-dominadas).`
      },
      en: { title: 'The #1 Mistake Stopping Your Pull-up Progress', content: `# Fix your scapular retraction.` }
    }
  },
  {
    slug: 'flexiones-perfectas-errores',
    date: '2026-04-26',
    author: 'Reppy Editorial',
    category: 'flexiones',
    locales: {
       es: { title: 'Flexiones Perfectas: Guía de Pecho y Tríceps', content: '# Flexiones Perfectas...' },
       en: { title: 'Perfect Push-ups Guide', content: '# Perfect Push-ups...' }
    }
  },
  {
    slug: 'nutricion-calistenia',
    date: '2026-04-28',
    author: 'Reppy Editorial',
    category: 'nutricion',
    locales: {
      es: { title: 'Nutrición para Calistenia: Qué comer para rendir', content: '# Nutrición Calisténica...' },
      en: { title: 'Calisthenics Nutrition Guide', content: '# Nutrition...' }
    }
  },
  {
    slug: 'rutina-calistenia-david-goggins',
    date: '2026-04-10',
    author: 'Reppy Editorial',
    locales: {
      es: { title: 'La Rutina Secreta de David Goggins', content: '# David Goggins...' },
      en: { title: 'David Goggins\' Secret Routine', content: '# David Goggins...' }
    }
  },
  {
    slug: 'fitness-rpg-boss-fights',
    date: '2026-04-12',
    author: 'Reppy Editorial',
    locales: {
      es: { title: 'Fitness RPG: Derrotar bosses con sudor', content: '# Boss Fights...' },
      en: { title: 'Fitness RPG: Defeat Bosses', content: '# Boss Fights...' }
    }
  },
  {
    slug: 'prevencion-lesiones-muneca',
    date: '2026-04-30',
    author: 'Reppy Editorial',
    category: 'principiantes',
    locales: {
      es: { title: 'Evita el dolor de muñeca en calistenia', content: '# Salud de Muñecas...' },
      en: { title: 'Avoid wrist pain in calisthenics', content: '# Wrist health...' }
    }
  },
  {
    slug: 'sentadillas-potencia-pierna',
    date: '2026-05-02',
    author: 'Reppy Editorial',
    category: 'principiantes',
    locales: {
      es: { title: 'Sentadillas: Explota tu tren inferior', content: '# Sentadillas...' },
      en: { title: 'Squats: Explode your legs', content: '# Squats...' }
    }
  },
  {
    slug: 'verdad-sobre-el-fallo',
    date: '2026-05-04',
    author: 'Reppy Editorial',
    category: 'fuerza',
    locales: {
      es: { title: 'Entrenar al fallo: ¿Es necesario?', content: '# Fallo Muscular...' },
      en: { title: 'Training to failure: Is it needed?', content: '# Muscle Failure...' }
    }
  },
  {
     slug: 'descanso-entre-series',
     date: '2026-05-06',
     author: 'Reppy Editorial',
     category: 'fuerza',
     locales: {
       es: { title: 'Cuánto descansar entre series para fuerza', content: '# Descanso...' },
       en: { title: 'Rest periods for strength', content: '# Rest periods...' }
     }
  },
  {
     slug: 'calistenia-vs-pesas',
     date: '2026-05-08',
     author: 'Reppy Editorial',
     category: 'principiantes',
     locales: {
       es: { title: 'Calistenia vs Pesas: Cuál elegir', content: '# Comparativa...' },
       en: { title: 'Calisthenics vs Weights', content: '# Comparison...' }
     }
  },
  {
     slug: 'mejorar-hora-para-entrenar',
     date: '2026-05-10',
     author: 'Reppy Editorial',
     category: 'habitos',
     locales: {
       es: { title: '¿Cuál es la mejor hora para entrenar?', content: '# Hormonas y Entrenamiento...' },
       en: { title: 'When is the best time to workout?', content: '# Training Time...' }
     }
  },
  {
     slug: 'ayuno-intermitente-calistenia',
     date: '2026-05-12',
     author: 'Reppy Editorial',
     category: 'nutricion',
     locales: {
       es: { title: 'Ayuno intermitente y Calistenia', content: '# Ayuno y Deporte...' },
       en: { title: 'Intermittent fasting and calisthenics', content: '# Fasting...' }
     }
  },
  {
     slug: 'suplementos-que-valen-la-pena',
     date: '2026-05-14',
     author: 'Reppy Editorial',
     category: 'nutricion',
     locales: {
       es: { title: 'Suplementos: Los únicos 3 que funcionan', content: '# Suplementación...' },
       en: { title: 'Supplements: The only 3 that work', content: '# Supplements...' }
     }
  },
  {
     slug: 'calistenia-viajando-sin-gym',
     date: '2026-05-16',
     author: 'Reppy Editorial',
     category: 'habitos',
     locales: {
       es: { title: 'Calistenia en hoteles: Entrenar viajando', content: '# Viajar y Entrenar...' },
       en: { title: 'Hotel workouts: Training while traveling', content: '# Travel Fitness...' }
     }
  },
  {
     slug: 'psicologia-del-muscle-up',
     date: '2026-05-18',
     author: 'Reppy Editorial',
     category: 'fuerza',
     locales: {
       es: { title: 'La psicología del Muscle-up', content: '# Mente y Muscle-up...' },
       en: { title: 'Psychology of the Muscle-up', content: '# Muscle-up mindset...' }
     }
  },
  {
     slug: 'rutina-pike-pushups',
     date: '2026-05-20',
     author: 'Reppy Editorial',
     category: 'flexiones',
     locales: {
       es: { title: 'Pike Pushups: Hombros de acero', content: '# Flexiones de Pica...' },
       en: { title: 'Pike Pushups: Shoulder strength', content: '# Pike Pushups...' }
     }
  },
  {
     slug: 'plancha-abdominal-errores',
     date: '2026-05-22',
     author: 'Reppy Editorial',
     category: 'core',
     locales: {
       es: { title: 'Planchas: 3 errores que te quitan el core', content: '# Plancha Perfecta...' },
       en: { title: 'Planks: 3 mistakes killing your core', content: '# Perfect Plank...' }
     }
  },
  {
     slug: 'como-dormir-para-progresar',
     date: '2026-05-24',
     author: 'Reppy Editorial',
     category: 'habitos',
     locales: {
       es: { title: 'Higiene del sueño para deportistas', content: '# Sueño y Recupearción...' },
       en: { title: 'Sleep hygiene for athletes', content: '# Sleep and Recovery...' }
     }
  },
  {
     slug: 'beneficios-de-colgarse',
     date: '2026-05-26',
     author: 'Reppy Editorial',
     category: 'principiantes',
     locales: {
       es: { title: 'Por qué deberías colgarte de la barra a diario', content: '# Dead Hangs...' },
       en: { title: 'Why you should hang from a bar every day', content: '# Dead Hangs...' }
     }
  },
  {
     slug: 'calistenia-despues-de-los-40',
     date: '2026-05-28',
     author: 'Reppy Editorial',
     category: 'habitos',
     locales: {
       es: { title: 'Calistenia después de los 40', content: '# Longevidad...' },
       en: { title: 'Calisthenics after 40', content: '# Longevity...' }
     }
  },
  {
     slug: 'hollow-body-core-maestro',
     date: '2026-05-30',
     author: 'Reppy Editorial',
     category: 'core',
     locales: {
       es: { title: 'Hollow Body: La clave de todo truco', content: '# Hollow Body...' },
       en: { title: 'Hollow Body: The key to every trick', content: '# Hollow Body...' }
     }
  },
  {
     slug: 'entrenar-con-frio-calistenia',
     date: '2026-06-01',
     author: 'Reppy Editorial',
     category: 'habitos',
     locales: {
       es: { title: 'Entrenar calistenia en invierno', content: '# Frío y Calistenia...' },
       en: { title: 'Calisthenics in winter', content: '# Winter Training...' }
     }
  },
  {
     slug: 'progresion-fondos-paralelas',
     date: '2026-06-03',
     author: 'Reppy Editorial',
     category: 'fuerza',
     locales: {
       es: { title: 'Guía de Fondos en Paralelas', content: '# Fondos Guide...' },
       en: { title: 'Dips Guide: Parallel bars', content: '# Dips Guide...' }
     }
  },
  {
     slug: 'calistenia-y-correr',
     date: '2026-06-05',
     author: 'Reppy Editorial',
     category: 'habitos',
     locales: {
       es: { title: '¿Combinar Calistenia y Running?', content: '# Calistenia y Running...' },
       en: { title: 'Calisthenics and Running?', content: '# Calisthenics and Running...' }
     }
  }
];
