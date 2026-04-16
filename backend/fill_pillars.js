import fs from 'fs';
import path from 'path';

const backendFile = path.join(process.cwd(), 'blogData.json');
const frontendFile = path.join(process.cwd(), '../frontend/src/blogPosts.json');

const files = [backendFile, frontendFile];

const pillarsMap = {
  'guia-definitiva-dominadas': {
    es: `
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
`,
    en: `
# Ultimate Pull-up Guide: 0 to 20 Reps

Master the king of calisthenics exercises. Pull-ups not only build a V-shaped back but are the foundation for advanced skills like the Muscle-up or Front Lever. In this guide, we break down everything you need to know.

## 1. The Biomechanics of a Perfect Pull-up
Many fail because they "pull with their arms." For an efficient pull-up:
- **Scapular Retraction**: Squeeze your shoulder blades together before pulling.
- **Solid Grip**: Wrap the bar tightly, don't just hang.
- **Full Range of Motion**: Chin over the bar and full extension at the bottom.

## 2. 8-Week Progression Routine
If you're stuck, follow this progressive overload cycle.

| Phase | Duration | Goal | Key Workout |
| :--- | :--- | :--- | :--- |
| **Adaptation** | Weeks 1-2 | Endurance | 5 sets of Dead Hangs (to failure) |
| **Base Strength** | Weeks 3-4 | Volume | 5 sets of Negative Pull-ups (5s descent) |
| **Explosion** | Weeks 5-6 | Power | 4 sets of Chest-to-bar (max speed) |
| **Peaking** | Weeks 7-8 | Maxes | 1 rep max test every 3 days |

## 3. Common Mistakes Ruining Your Progress
1. **Kipping**: Swinging your body to get up. It doesn't build real strength.
2. **Flared Elbows**: Causes shoulder injuries. Keep them at 45 degrees.
3. **Lack of Core**: If your legs swing, you lose energy.

## 4. Frequently Asked Questions (FAQ)
- **Can I train pull-ups daily?** Not recommended for max strength. Leave 48h of rest.
- **Which grip is better?** Pronated (palms facing away) is the most complete.

[Ready to measure your progress? Use the Reppy pull-up counter here](/contador-dominadas)
`
  },
  'manual-inicio-calistenia': {
    es: `
# Manual Maestro de Calistenia: De 0 a Pro

La calistenia seduce por su sencillez: tu cuerpo es el gimnasio. Pero sin un plan, es fácil lesionarse o abandonar. Este manual te llevará desde tu primer día hasta dominar tu peso corporal.

## Los 3 Pilares del Principiante
1. **Empuje (Push)**: Flexiones y Fondos. Desarrollan pecho, tríceps y hombros.
2. **Tirón (Pull)**: Remos y Dominadas. Construyen una espalda fuerte y bíceps funcionales.
3. **Core**: Planchas y Elevaciones de piernas. El centro de transferencia de fuerza.

## El Equipo Mínimo Necesario
No necesitas nada para empezar, pero esto te dará un 200% más de resultados a largo plazo:
- **Barra de dominadas** (imprescindible).
- **Paralelas bajas** (para cuidar tus muñecas).
- **Bandas elásticas** (para asistirte al principio).

## Tu Primera Rutina (La de los 20 minutos)
Realiza este circuito 3 veces por semana, descansando un día entre sesiones:
- 10 Flexiones (o inclinadas adaptadas a tu nivel).
- 5 Dominadas (o dominadas negativas).
- 15 Sentadillas clásicas.
- 30 segundos de Plancha abdominal sólida.
Descansa 90 segundos y repite 4 veces.

[Regístrate en Reppy para gamificar tu entrenamiento](/dashboard)
`,
    en: `
# Master Calisthenics Manual: How to Start from 0

Calisthenics seduces with its simplicity: your body is the gym. But without a plan, it's easy to get injured or quit. This manual will take you from day one to mastering your body weight.

## The 3 Beginner Pillars
1. **Push**: Push-ups and Dips. Develop chest, triceps, and shoulders.
2. **Pull**: Rows and Pull-ups. Build a strong back and functional biceps.
3. **Core**: Planks and Leg Raises. The center of force transfer.

## Minimal Equipment Needed
You don't need anything to start, but this will give you 200% more results long term:
- **Pull-up Bar** (essential).
- **Low Parallettes** (to protect your wrists).
- **Resistance Bands** (to assist you at the beginning).

## Your First Routine (The 20-minute Workout)
Do this circuit 3 times a week, resting a day between sessions:
- 10 Push-ups (or incline push-ups adapted to your level).
- 5 Pull-ups (or negative pull-ups).
- 15 Classic Squats.
- 30 seconds of solid abdominal Plank.
Rest 90 seconds and repeat 4 times.

[Sign up at Reppy Dashboard to gamify your training](/dashboard)
`
  },
  'gamificacion-fitness-ciencia': {
    es: `
# La Ciencia de la Gamificación: Por qué funciona

¿Alguna vez te has preguntado por qué te enganchan los videojuegos pero te cuesta ir a entrenar de forma consistente? La respuesta neurológica está en la **Retroalimentación Inmediata**.

## 1. El Bucle de la Dopamina
En un RPG, cuando derrotas a un monstruo, subes de nivel instantáneamente o consigues oro. El cerebro recibe una inyección de dopamina que refuerza el hábito. En el gimnasio convencional, el "nivel" (ganancia muscular o pérdida de grasa corporal) tarda semanas o incluso meses en hacerse visible en el espejo. El cerebro primitivo se desmotiva por la falta de recompensa a corto plazo.

## 2. Cómo lo soluciona Reppy
Al registrar tus repeticiones en la plataforma Reppy, cerramos de golpe la brecha de retroalimentación:
- **Boss Fights**: Tus flexiones y dominadas hacen daño real a un jefe comunitario en tiempo real.
- **Economía Virtual**: Ganas recompensas tangibles (monedas) que puedes gastar en la tienda para conseguir cosméticos para tu perfil.
- **Progreso Visual**: Tu barra de experiencia sube de color y porcentaje con cada serie completada.

## 3. Convirtiendo la Disciplina en Juego
Cuando el entrenamiento se convierte en una misión heroica, la fricción mental inicial desaparece. Ya no entrenas por obligación social, lo haces por la recompensa intrínseca de formar parte del juego y escalar en la clasificación mundial.

[Entra en la arena y derrota al Boss de hoy](/dashboard)
`,
    en: `
# Gaming your Fitness: The Science of Motivation

Have you ever wondered why you get hooked on video games but struggle to go to the gym consistently? The neurological answer lies in **Immediate Feedback**.

## 1. The Dopamine Loop
In an RPG, when you defeat a monster, you level up instantly or get gold. The brain receives a hit of dopamine that reinforces the habit. In a conventional gym, the "level up" (muscle gain or body fat loss) takes weeks or even months to become visible in the mirror. The primitive brain loses motivation due to the lack of short-term rewards.

## 2. How Reppy Solves It
By logging your reps on the Reppy platform, we close the feedback gap instantly:
- **Boss Fights**: Your push-ups and pull-ups deal real damage to a community boss in real-time.
- **Virtual Economy**: You earn tangible rewards (coins) that you can spend in the shop to get cosmetics for your profile.
- **Visual Progress**: Your experience bar levels up in color and percentage with every completed set.

## 3. Turning Discipline into a Game
When training becomes a heroic quest, the initial mental friction disappears. You no longer train out of obligation, you do it for the intrinsic reward of being part of the game and climbing the global leaderboard.

[Enter the arena and defeat today's Boss](/dashboard)
`
  }
};

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let data = JSON.parse(fs.readFileSync(file, 'utf8'));

  data.forEach(post => {
    if (pillarsMap[post.slug]) {
      const pillar = pillarsMap[post.slug];
      if (post.locales) {
          if (post.locales.es && pillar.es) post.locales.es.content = pillar.es.trim();
          if (post.locales.en && pillar.en) post.locales.en.content = pillar.en.trim();
      }
    }
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
});

console.log('Successfully updated Pillar posts with full content in JSON files.');
