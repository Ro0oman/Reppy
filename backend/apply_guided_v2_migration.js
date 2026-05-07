import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const { default: pool } = await import('./db.js');

const exercisesSeed = [
  {
    slug: 'pullups',
    title_key: 'ex_pullups_std',
    description_key: 'Dominada estricta para fuerza de traccion vertical: dorsales, biceps, agarre y core trabajando como una sola pieza.',
    technique_key: 'Empieza colgado con brazos largos y hombros activos. Aprieta abdomen y gluteos, tira llevando el pecho hacia la barra y sube hasta que la barbilla pase la barra. Baja controlado hasta extender los codos sin perder tension. Evita patadas, balanceo y reps parciales.',
    unit: 'reps',
    difficulty_multiplier: 1.0,
    coin_multiplier: 1.0,
  },
  {
    slug: 'assisted_pullups',
    title_key: 'Dominadas Asistidas',
    description_key: 'Regresion principal de la dominada: permite practicar el mismo recorrido usando banda, apoyo de pies o salto suave.',
    technique_key: 'Usa solo la ayuda necesaria para llegar arriba con control. Manten hombros lejos de las orejas, abdomen firme y bajada lenta. Reduce la asistencia cuando puedas completar todas las series sin perder rango.',
    unit: 'reps',
    difficulty_multiplier: 0.8,
    coin_multiplier: 1.0,
  },
  {
    slug: 'pushups',
    title_key: 'ex_pushups_std',
    description_key: 'Flexion estandar para fuerza de empuje: pecho, hombros, triceps, serrato y core.',
    technique_key: 'Manos bajo hombros o un poco mas abiertas, cuerpo en linea de cabeza a talones. Baja con codos a unos 45 grados, pecho cerca del suelo y abdomen apretado. Sube empujando el suelo sin hundir cadera ni abrir codos en T.',
    unit: 'reps',
    difficulty_multiplier: 1.0,
    coin_multiplier: 1.0,
  },
  {
    slug: 'incline_pushups',
    title_key: 'Flexiones Inclinadas',
    description_key: 'Regresion de flexion completa: mantiene el patron tecnico usando pared, mesa o banco para reducir carga.',
    technique_key: 'Coloca las manos en un apoyo estable. Manten una linea recta de cabeza a talones, baja el pecho al apoyo y sube sin perder abdomen. Progresion: usa apoyos cada vez mas bajos hasta llegar al suelo.',
    unit: 'reps',
    difficulty_multiplier: 0.7,
    coin_multiplier: 1.0,
  },
  {
    slug: 'scapular_pushups',
    title_key: 'Push-up Escapular',
    description_key: 'Activacion de serrato y estabilidad de hombro para que las flexiones no carguen mal la articulacion.',
    technique_key: 'En plancha alta, manten codos estirados. Deja que el pecho baje ligeramente juntando escapulas y luego empuja el suelo para separarlas. No dobles los codos ni arquees la espalda.',
    unit: 'reps',
    difficulty_multiplier: 0.6,
    coin_multiplier: 1.0,
  },
  {
    slug: 'dips',
    title_key: 'ex_dips_std',
    description_key: 'Fondos en paralelas para empuje vertical: pecho bajo, triceps y hombro anterior.',
    technique_key: 'Empieza arriba con codos extendidos y hombros deprimidos. Baja hasta una profundidad comoda, idealmente cerca de 90 grados de codo, y sube con control. No rebotes abajo ni dejes que los hombros se vayan hacia las orejas.',
    unit: 'reps',
    difficulty_multiplier: 1.2,
    coin_multiplier: 2.0,
  },
  {
    slug: 'muscleups',
    title_key: 'ex_muscle_ups',
    description_key: 'Movimiento avanzado que une traccion explosiva, transicion sobre la barra y empuje final.',
    technique_key: 'Tira alto llevando la barra hacia el pecho bajo, manten core firme y pasa rapido los codos sobre la barra antes del fondo final. Entrenalo solo si tienes dominadas estrictas solidas y hombros sin dolor.',
    unit: 'reps',
    difficulty_multiplier: 2.0,
    coin_multiplier: 5.0,
  },
  {
    slug: 'weighted_pullups',
    title_key: 'ex_weighted_pullups',
    description_key: 'Dominada con carga externa para desarrollar fuerza maxima cuando ya dominas varias reps estrictas.',
    technique_key: 'Usa cinturon, chaleco o mochila estable. Manten el mismo rango que en la dominada estricta y evita balancear el peso. Sube carga solo si puedes hacer todas las reps limpias.',
    unit: 'reps',
    difficulty_multiplier: 1.5,
    coin_multiplier: 3.0,
  },
  {
    slug: 'legs',
    title_key: 'ex_legs',
    description_key: 'Trabajo de tren inferior: sentadillas, zancadas o variantes de pierna con peso corporal.',
    technique_key: 'Pies estables, rodillas siguiendo la linea de los dedos y torso firme. Baja con control hasta una profundidad comoda sin colapsar rodillas hacia dentro.',
    unit: 'reps',
    difficulty_multiplier: 1.0,
    coin_multiplier: 1.0,
  },
  {
    slug: 'scapular_pulls',
    title_key: 'Escapulares en Barra',
    description_key: 'Activacion de escapulas y dorsales; ensena a iniciar la dominada desde hombros fuertes y estables.',
    technique_key: 'Cuelgate con brazos estirados. Sin doblar codos, baja los hombros lejos de las orejas y eleva ligeramente el pecho; vuelve controlado al hang. Movimiento pequeno, lento y sin dolor.',
    unit: 'reps',
    difficulty_multiplier: 0.8,
    coin_multiplier: 1.0,
  },
  {
    slug: 'dead_hang',
    title_key: 'Dead Hang Activo',
    description_key: 'Aguante estatico en barra para agarre, tolerancia de hombro y control corporal.',
    technique_key: 'Cuelgate con agarre firme, cuello largo y hombros ligeramente activos. Respira sin encoger trapecios. Si notas dolor punzante en hombro o codo, baja y reduce tiempo.',
    unit: 'seconds',
    difficulty_multiplier: 0.5,
    coin_multiplier: 1.0,
  },
  {
    slug: 'negative_pullups',
    title_key: 'Negativas de Dominada',
    description_key: 'Trabajo excentrico de traccion para ganar fuerza cuando aun faltan reps completas.',
    technique_key: 'Sube con salto, caja o asistencia hasta quedar con barbilla sobre la barra. Baja en 3-5 segundos manteniendo pecho alto y hombros activos. La rep termina con codos extendidos y control, no cayendo.',
    unit: 'reps',
    difficulty_multiplier: 0.9,
    coin_multiplier: 1.0,
  },
  {
    slug: 'inverted_rows',
    title_key: 'Remos Invertidos',
    description_key: 'Traccion horizontal que fortalece espalda y prepara volumen para dominadas sin tanta carga vertical.',
    technique_key: 'Cuerpo recto, talones apoyados y pecho hacia la barra. Tira llevando codos atras y junta escapulas sin subir hombros. Hazlo mas facil elevando la barra o doblando rodillas.',
    unit: 'reps',
    difficulty_multiplier: 0.8,
    coin_multiplier: 1.0,
  },
  {
    slug: 'plank',
    title_key: 'Plancha Abdominal',
    description_key: 'Core anti-extension para mantener cuerpo firme en flexiones, dominadas y fondos.',
    technique_key: 'Codos u hombros bajo apoyo, costillas cerradas, gluteos apretados y pelvis neutra. El cuerpo debe formar una linea recta. Para antes de hundir la zona lumbar.',
    unit: 'seconds',
    difficulty_multiplier: 0.5,
    coin_multiplier: 1.0,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE user_active_plans
      ADD COLUMN IF NOT EXISTS last_completed_date DATE,
      ADD COLUMN IF NOT EXISTS last_completed_day INTEGER;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        slug VARCHAR(80) PRIMARY KEY,
        title_key VARCHAR(120) NOT NULL,
        description_key TEXT NOT NULL,
        technique_key TEXT,
        unit VARCHAR(20) DEFAULT 'reps',
        difficulty_multiplier DECIMAL(5,2) DEFAULT 1.0,
        coin_multiplier DECIMAL(5,2) DEFAULT 1.0,
        is_active BOOLEAN DEFAULT TRUE,
        image_url TEXT
      );
    `);
    await client.query(`
      ALTER TABLE exercises ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE exercises ADD COLUMN IF NOT EXISTS technique_key TEXT;
      ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty_multiplier DECIMAL(5,2) DEFAULT 1.0;
      ALTER TABLE exercises ADD COLUMN IF NOT EXISTS coin_multiplier DECIMAL(5,2) DEFAULT 1.0;
      ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_favorite_exercises (
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        exercise_slug VARCHAR(80) REFERENCES exercises(slug) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        PRIMARY KEY (user_id, exercise_slug)
      );
    `);

    for (const ex of exercisesSeed) {
      await client.query(`
        INSERT INTO exercises (slug, title_key, description_key, technique_key, unit, difficulty_multiplier, coin_multiplier, is_active, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, '')
        ON CONFLICT (slug)
        DO UPDATE SET
          title_key = EXCLUDED.title_key,
          description_key = EXCLUDED.description_key,
          technique_key = EXCLUDED.technique_key,
          unit = EXCLUDED.unit,
          difficulty_multiplier = EXCLUDED.difficulty_multiplier,
          coin_multiplier = EXCLUDED.coin_multiplier,
          is_active = TRUE;
      `, [ex.slug, ex.title_key, ex.description_key, ex.technique_key, ex.unit, ex.difficulty_multiplier, ex.coin_multiplier]);
    }

    await client.query(`
      UPDATE training_plan_blocks SET exercise_type = 'scapular_pulls' WHERE title ILIKE '%escapular%' OR title ILIKE '%scapular%';
      UPDATE training_plan_blocks SET exercise_type = 'dead_hang' WHERE title ILIKE '%dead hang%' OR title ILIKE '%hang%';
      UPDATE training_plan_blocks SET exercise_type = 'negative_pullups' WHERE title ILIKE '%negativas%';
      UPDATE training_plan_blocks SET exercise_type = 'plank' WHERE title ILIKE '%plancha%';
    `);

    await client.query('COMMIT');
    console.log('Migration V2 completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration V2 failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
