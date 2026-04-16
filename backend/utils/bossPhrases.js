const bossPhrases = {
  'Artorias the Abysswalker': [
    "¡Tus dominadas son un abismo de errores!",
    "Incluso con un brazo roto haría más reps que tú.",
    "Sif tiene mejor técnica de Front Lever que tú.",
    "¡Tiembla ante el Caballero que nunca saltó el Leg Day!",
    "Soy el caminante del abismo, y tú el caminante hacia el fallo muscular."
  ],
  'The Ender Dragon': [
    "¡Tu rango de movimiento es tan corto como mi aliento!",
    "Vuelve al Overworld a entrenar dominadas explosivas.",
    "¡Incluso un Enderman tiene más agarre que tú!",
    "¡Ni con cristales de curación repararás tus dorsales!",
    "¡Te lanzaré al vacío si vuelves a hacer una rep parcial!"
  ],
  'Malenia, Espada de Miquella': [
    "Soy Malenia, y nunca he conocido la derrota... ni una serie mal hecha.",
    "¡Bébete la creatina y vuelve a intentarlo!",
    "¡Entrené mil años para este momento, tú no aguantas ni 5 minutos!",
    "¡Ni con Pasos de Sabueso esquivarás las agujetas!",
    "Ríndete ante la Diosa de la Constancia."
  ],
  'Diablo': [
    "¡En el infierno solo hacemos dominadas con lastre!",
    "Tu alma es tan débil como tu agarre.",
    "¡Si no tocas la barbilla, tu alma será mía!",
    "¡Bienvenido a mi gimnasio, pecador de las repeticiones a medias!",
    "¡Quema tus excusas en mi fuego!"
  ],
  'Arthas, El Rey Exánime': [
    "¡Tus dominadas están tan muertas como mi ejército!",
    "Empuño la Agonía de Escarcha para enfriar mis batidos.",
    "¡Ni con mil almas harías un muscle-up limpio!",
    "¡No hay redención para los que no hacen rango completo!",
    "¡Invisibles son tus progresos, como mi caballo Invencible!"
  ],
  'Sephiroth': [
    "¿Llamas a eso un Pull-up? ¡Mi Masamune tiene más recorrido!",
    "El Ángel de una Sola Ala... porque el otro dorsal se desgarró.",
    "¡Supernova! Eso es lo que sentirán tus músculos mañana.",
    "¡Tus dorsales son pétalos cayendo ante mi espada!",
    "¡Siente la desesperación de una serie infinita!"
  ],
  'Baldur': [
    "¡No siento nada! Ni tus golpes, ni tus dominadas a medias.",
    "¡Pégame más fuerte, como si hicieras dominadas con 40kg!",
    "¡Soy Baldur, y mi ego es más pesado que tu RM!",
    "¡Ni todo el Fimbulwinter enfriará mis músculos!",
    "¡Soy hijo de Odín y de la sobrecarga progresiva!"
  ],
  'Rathalos': [
    "¡Rey de los cielos y de las dominadas explosivas!",
    "Vuelo porque no aguanto mi propio ego en la barra.",
    "¡Tu fuego es tan débil como tus tríceps!",
    "¡Rugido de potencia! ¡Eso es lo que te falta!",
    "¡Ni con una mega-poción curarás este entrenamiento!"
  ],
  'Calamity Ganon': [
    "La maldad pura nació porque alguien usó mi rack para hacer curls.",
    "¡Asolaré tus dorsales como asolé Hyrule!",
    "¡Ni el Héroe del Tiempo salva tus dominadas!",
    "¡Ganon no descansa, tú tampoco deberías!",
    "¡Dominio total de la barra!"
  ],
  'The Nameless King': [
    "Perdí mi nombre en una apuesta sobre planchas isométricas.",
    "¡Ni el Rey de la Tormenta respeta tus reps parciales!",
    "¡Rayo en tus músculos! ¡Eso es potencia!",
    "¡Baja del dragón y toca el suelo haciendo pushups!",
    "¡Forjado en la batalla y en la barra!"
  ],
  'El Conejo de Acero': [
    "¡Salto más alto que tus metas de entrenamiento!",
    "¡Huevos de acero para dorsales de hierro!",
    "¡No hay zanahoria que te salve de mis series!",
    "¡Tu racha es tan tierna como un gazapo!",
    "¡Zarpazo de fuerza en cada repetición!"
  ]
};

export const getRandomPhrase = (bossName) => {
  const phrases = bossPhrases[bossName];
  if (!phrases || phrases.length === 0) return "¡Sigue entrenando!";
  return phrases[Math.floor(Math.random() * phrases.length)];
};
