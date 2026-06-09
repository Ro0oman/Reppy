import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const { default: pool } = await import('./db.js');

const day = (dayNumber, titleKey, focus, minutes, xp, coins, blocks) => ({
  dayNumber,
  titleKey,
  focus,
  minutes,
  xp,
  coins,
  blocks,
});

const pickPhase = (dayNumber, totalDays) => {
  if (dayNumber <= Math.ceil(totalDays / 3)) return 1;
  if (dayNumber <= Math.ceil((totalDays / 3) * 2)) return 2;
  return 3;
};

const progress = (dayNumber, totalDays, start, end) => {
  if (totalDays <= 1) return end;
  const ratio = (dayNumber - 1) / (totalDays - 1);
  return Math.round(start + (end - start) * ratio);
};

const fighterLadder = (topReps, floorReps = 1) =>
  Array.from({ length: 5 }, (_, index) => Math.max(floorReps, topReps - index));

const fighterLadderBlocks = (reps, restSeconds = 90) =>
  reps.map((rep, index) => [
    'strength',
    `Escalera fighter ${index + 1}: ${rep} reps`,
    'Haz este peldano estricto y lejos del fallo. Descansa, repite el mismo patron y no sacrifiques rango.',
    'pullups',
    1,
    rep,
    restSeconds,
  ]);

const buildFirstPullupDays = () => Array.from({ length: 21 }, (_, index) => {
  const n = index + 1;
  const phase = pickPhase(n, 21);
  const cycle = (n - 1) % 4;

  if (n === 21) {
    return day(n, 'guided_day_final_test', 'test_final', 16, 180, 80, [
      ['warmup', 'Activacion escapular', 'Cuelgate activo: hombros abajo, costillas cerradas y codos largos.', 'scapular_pulls', 2, 8, 45],
      ['test', 'Intentos de dominada estricta', 'Empieza desde brazos estirados, tira con dorsales y busca barbilla sobre la barra sin patada.', 'pullups', 5, 1, 120],
      ['backoff', 'Negativas limpias', 'Sube con salto o apoyo y baja en 4-5 segundos manteniendo hombros activos.', 'negative_pullups', 3, 2, 90],
      ['control', 'Dead hang activo', 'Agarre firme, cuello largo y escapulas ligeramente deprimidas. Para si hay dolor.', 'dead_hang', 2, 25, 60],
    ]);
  }

  if (cycle === 0) {
    const assistedReps = phase === 1 ? 2 : phase === 2 ? 3 : 4;
    return day(n, 'guided_day_tech_base', 'base_tecnica', 13 + phase, 90 + n * 4, 35 + phase * 5, [
      ['warmup', 'Scapular pulls', 'Desde colgado, sube y baja las escapulas sin doblar los codos.', 'scapular_pulls', 2 + phase, 6 + phase, 45],
      ['strength', 'Dominada asistida', 'Usa banda, salto suave o apoyo de pies. Manten cuerpo firme y baja controlado.', 'assisted_pullups', 4, assistedReps, 75],
      ['control', 'Dead hang activo', 'Cuelgate con hombros lejos de las orejas y abdomen activo.', 'dead_hang', 2, 10 + phase * 5, 60],
    ]);
  }

  if (cycle === 1) {
    return day(n, 'guided_day_soft_volume', 'volumen_suave', 14 + phase, 100 + n * 4, 40 + phase * 5, [
      ['warmup', 'Dead hang suave', 'Acumula tiempo sin perder agarre ni bloquear la respiracion.', 'dead_hang', 2, 10 + phase * 5, 45],
      ['volume', 'Remos invertidos', 'Pecho hacia la barra, cuerpo recto y codos atras. Ajusta la inclinacion para no llegar al fallo.', 'inverted_rows', Math.min(4, 2 + phase), 6 + phase, 60],
      ['strength', 'Dominadas asistidas', 'Reps limpias con la minima ayuda que permita llegar arriba.', 'assisted_pullups', 3, 2 + phase, 75],
    ]);
  }

  if (cycle === 2) {
    return day(n, 'guided_day_eccentric_control', 'control_excentrico', 15 + phase, 110 + n * 4, 45 + phase * 5, [
      ['warmup', 'Scapular pulls', 'Despierta dorsales antes de las negativas.', 'scapular_pulls', 3, 6 + phase, 45],
      ['strength', 'Negativas controladas', 'Empieza arriba y baja lento. Si caes rapido, usa mas apoyo.', 'negative_pullups', phase === 1 ? 3 : 4, phase === 3 ? 3 : 2, 90],
      ['backoff', 'Remos faciles', 'Termina con traccion horizontal sin quemar el agarre.', 'inverted_rows', 3, 6 + phase, 60],
    ]);
  }

  return day(n, 'guided_day_recovery_skill', 'tecnica_suave', 12, 90 + n * 3, 35 + phase * 5, [
    ['warmup', 'Movilidad de hombros', 'Haz reps lentas, sin dolor y con control total.', 'scapular_pulls', 2, 6 + phase, 45],
    ['skill', 'Dominada asistida facil', 'Practica el camino correcto: pecho hacia barra, piernas quietas, bajada tranquila.', 'assisted_pullups', 3, 2 + phase, 75],
    ['control', 'Plancha abdominal', 'Aprieta gluteos y abdomen para aprender a no balancearte en la barra.', 'plank', 2, 20 + phase * 5, 45],
  ]);
});

const buildFivePullupDays = () => Array.from({ length: 21 }, (_, index) => {
  const n = index + 1;
  const phase = pickPhase(n, 21);
  const cycle = (n - 1) % 4;

  if (n === 21) {
    return day(n, 'guided_day_final_test', 'test_final', 16, 190, 85, [
      ['warmup', 'Activacion pull', 'Hangs activos y escapulas controladas antes del intento.', 'scapular_pulls', 2, 8, 45],
      ['test', 'Set de 5 dominadas', 'Haz 5 reps estrictas: brazos largos abajo, barbilla arriba, sin balanceo.', 'pullups', 1, 5, 150],
      ['backoff', 'Series faciles', 'Consolida volumen con reps lejos del fallo.', 'pullups', 3, 2, 90],
      ['finisher', 'Remo invertido', 'Cierra con traccion horizontal limpia.', 'inverted_rows', 3, 8, 60],
    ]);
  }

  if (cycle === 0) {
    return day(n, 'guided_day_strength_build', 'fuerza_submaxima', 14 + phase, 105 + n * 4, 40 + phase * 5, [
      ['warmup', 'Scapular pulls', 'Activa hombros y dorsales antes de tirar fuerte.', 'scapular_pulls', 3, 6 + phase, 45],
      ['strength', 'Dominadas submaximas', 'Deja 1-2 reps en reserva. Si la tecnica cae, usa asistencia.', 'pullups', 5, phase + 1, 90],
      ['backoff', 'Dominadas asistidas', 'Suma reps de calidad manteniendo el mismo recorrido.', 'assisted_pullups', 3, phase + 2, 75],
    ]);
  }

  if (cycle === 1) {
    const emomReps = phase === 1 ? 1 : 2;
    const emomSets = phase === 3 ? 12 : 10;
    return day(n, 'guided_day_density', 'emom_submaximo', 15 + phase, 115 + n * 4, 45 + phase * 5, [
      ['warmup', 'Dead hang activo', 'Agarre firme y hombros estables.', 'dead_hang', 2, 15 + phase * 5, 45],
      ['density', `EMOM ${emomSets}x${emomReps}`, 'Haz cada serie al inicio del minuto. Debe sentirse facil: si pierdes tecnica, usa asistencia o baja 1 rep.', 'pullups', emomSets, emomReps, 60],
      ['finisher', 'Remos invertidos', 'Manten pecho abierto y cuerpo firme.', 'inverted_rows', 3, 8 + phase, 60],
    ]);
  }

  if (cycle === 2) {
    return day(n, 'guided_day_eccentric_control', 'pausas_y_negativas', 15 + phase, 125 + n * 4, 50 + phase * 5, [
      ['warmup', 'Activacion pull', 'Calienta agarre, hombros y dorsal sin fatigar.', 'scapular_pulls', 2, 8, 45],
      ['strength', 'Dominadas con pausa arriba', 'Pausa 1 segundo con barbilla sobre la barra y baja controlado.', 'pullups', 4, phase + 1, 100],
      ['control', 'Negativas lentas', 'Bajada de 4 segundos para reforzar el tramo donde fallas.', 'negative_pullups', 3, 2, 90],
    ]);
  }

  const ladderTop = Math.min(5, phase + 2);
  return day(n, 'guided_day_fighter_ladder', 'escalera_fighter', 15 + phase, 125 + n * 3, 50 + phase * 5, [
    ['warmup', 'Hangs y escapulas', 'Prepara el patron sin cansarte.', 'scapular_pulls', 2, 7 + phase, 45],
    ...fighterLadderBlocks(fighterLadder(ladderTop, 1), phase === 3 ? 75 : 90),
    ['control', 'Dead hang activo', 'Cierra con agarre activo y respiracion tranquila.', 'dead_hang', 1, 20 + phase * 5, 60],
  ]);
});

const buildTenPullupDays = () => Array.from({ length: 28 }, (_, index) => {
  const n = index + 1;
  const phase = pickPhase(n, 28);
  const cycle = (n - 1) % 4;
  const workingReps = progress(n, 28, 3, 5);
  const topSet = progress(n, 28, 6, 10);

  if (n === 28) {
    return day(n, 'guided_day_final_test', 'test_final', 18, 220, 100, [
      ['warmup', 'Activacion pull', 'Calienta hombros, agarre y dorsal con reps faciles.', 'scapular_pulls', 2, 10, 45],
      ['test', 'Set de 10 dominadas', 'Un solo set limpio. No sacrifiques rango por perseguir el numero.', 'pullups', 1, 10, 180],
      ['backoff', 'Backoff tecnico', 'Reps suaves para cerrar sin reventar codos.', 'pullups', 3, 4, 120],
      ['finisher', 'Remos invertidos', 'Pecho hacia barra y escapulas atras.', 'inverted_rows', 3, 10, 75],
    ]);
  }

  if (cycle === 0) {
    const strengthReps = progress(n, 28, 4, 6);
    return day(n, 'guided_day_strength_build', 'fuerza_submaxima', 16 + phase, 120 + n * 4, 50 + phase * 5, [
      ['warmup', 'Scapular pulls', 'Activa hombros antes de acumular volumen.', 'scapular_pulls', 3, 8 + phase, 45],
      ['strength', 'Dominadas fuerza 4-6', 'Si ya puedes 6+ limpias, usa lastre ligero. Si no, usa tempo: 3 segundos de bajada. Nunca al fallo.', 'pullups', 4, strengthReps, 150],
      ['backoff', 'Backoff tecnico', 'Reps faciles, mismo rango y hombros activos para sumar volumen sin castigar codos.', 'pullups', 3, Math.max(3, workingReps - 1), 120],
    ]);
  }

  if (cycle === 1) {
    const ladderTop = progress(n, 28, 5, 8);
    return day(n, 'guided_day_fighter_ladder', 'escalera_fighter', 18 + phase, 135 + n * 4, 55 + phase * 5, [
      ['warmup', 'Dead hang activo', 'Estabiliza agarre y hombros.', 'dead_hang', 2, 20 + phase * 5, 45],
      ...fighterLadderBlocks(fighterLadder(ladderTop, 2), 90),
      ['finisher', 'Remos invertidos', 'Compensa con traccion horizontal y pecho abierto.', 'inverted_rows', 3, 10 + phase, 60],
    ]);
  }

  if (cycle === 2) {
    const densityReps = phase === 1 ? 2 : 3;
    const densitySets = phase === 1 ? 10 : phase === 2 ? 10 : 10;
    const densityRest = phase === 3 ? Math.max(20, progress(n, 28, 30, 20)) : 60;
    const densityTitle = phase === 3 ? '10x3 rest reduction' : `EMOM ${densitySets}x${densityReps}`;
    return day(n, 'guided_day_density', 'densidad', 16 + phase, 140 + n * 4, 60 + phase * 5, [
      ['warmup', 'Activacion pull', 'Entra en calor sin llegar a fatiga.', 'scapular_pulls', 2, 10, 45],
      ['density', densityTitle, 'Acumula muchas series pequenas. En EMOM empieza cada set al inicio del minuto; en 10x3 reduce descanso solo si todas las reps son limpias.', 'pullups', densitySets, densityReps, densityRest],
      ['control', 'Dead hang final', 'Cierra con agarre activo y respiracion controlada.', 'dead_hang', 2, 20 + phase * 5, 60],
    ]);
  }

  return day(n, 'guided_day_control_test', 'test_controlado', 14 + phase, 135 + n * 3, 55 + phase * 5, [
    ['warmup', 'Hangs y movilidad', 'Prepara hombros y codos antes del set fuerte.', 'dead_hang', 2, 20, 45],
    ['test', 'Set controlado', 'Busca tu mejor set limpio del dia, sin balanceo ni media repeticion.', 'pullups', 1, topSet, 180],
    ['backoff', 'Backoff tecnico', 'Dos o tres reps menos que el test, pero perfectas.', 'pullups', 3, Math.max(3, workingReps), 120],
  ]);
});

const buildTwentyPushupDays = () => Array.from({ length: 14 }, (_, index) => {
  const n = index + 1;
  const phase = pickPhase(n, 14);
  const cycle = (n - 1) % 4;
  const workingReps = progress(n, 14, 5, 10);
  const topSet = progress(n, 14, 8, 20);

  if (n === 14) {
    return day(n, 'guided_day_final_test', 'test_final', 15, 160, 70, [
      ['warmup', 'Push-up escapular', 'Empuja el suelo, separa escapulas y manten codos estirados.', 'scapular_pushups', 2, 10, 30],
      ['test', 'Set de 20 flexiones', 'Cuerpo en linea, codos a unos 45 grados y pecho cerca del suelo.', 'pushups', 1, 20, 150],
      ['backoff', 'Flexiones inclinadas', 'Termina con rango completo usando una inclinacion que mantenga buena forma.', 'incline_pushups', 3, 8, 60],
      ['control', 'Plancha', 'Cierra con abdomen y gluteos activos.', 'plank', 2, 30, 45],
    ]);
  }

  if (cycle === 0) {
    return day(n, 'guided_day_tech_base', 'base_tecnica', 11 + phase, 80 + n * 4, 30 + phase * 5, [
      ['warmup', 'Push-up escapular', 'Mueve solo escapulas: no dobles codos ni hundas pecho.', 'scapular_pushups', 2, 8 + phase, 30],
      ['strength', 'Flexiones tecnicas', 'Manos bajo hombros, abdomen duro, codos en diagonal y pecho baja con control.', 'pushups', 4, workingReps, 60],
      ['control', 'Plancha alta', 'Bloquea abdomen y gluteos como si fueras una tabla.', 'plank', 2, 20 + phase * 5, 45],
    ]);
  }

  if (cycle === 1) {
    return day(n, 'guided_day_soft_volume', 'volumen_suave', 12 + phase, 90 + n * 4, 35 + phase * 5, [
      ['warmup', 'Movilidad de munecas', 'Carga peso poco a poco y manten dedos abiertos.', 'scapular_pushups', 2, 8, 30],
      ['volume', 'Flexiones inclinadas', 'Usa mesa, banco o pared baja. Baja el apoyo con el tiempo para hacerlo mas dificil.', 'incline_pushups', 4 + phase, workingReps + 2, 60],
      ['strength', 'Flexiones limpias', 'Pocas reps perfectas, sin hundir cadera.', 'pushups', 3, Math.max(4, workingReps - 2), 75],
    ]);
  }

  if (cycle === 2) {
    return day(n, 'guided_day_eccentric_control', 'tempo_y_core', 12 + phase, 100 + n * 4, 40 + phase * 5, [
      ['warmup', 'Plancha alta', 'Empuja el suelo y aleja hombros de las orejas.', 'plank', 2, 20 + phase * 5, 45],
      ['strength', 'Flexion lenta', 'Baja en 3 segundos, pausa breve abajo y sube sin perder linea corporal.', 'pushups', 4, Math.max(4, workingReps - 1), 75],
      ['backoff', 'Flexiones inclinadas', 'Acumula reps con rango completo y respiracion constante.', 'incline_pushups', 3, workingReps + 1, 60],
    ]);
  }

  return day(n, 'guided_day_control_test', 'test_controlado', 11 + phase, 100 + n * 3, 40 + phase * 5, [
    ['warmup', 'Push-up escapular', 'Activa serrato y hombros antes del set fuerte.', 'scapular_pushups', 2, 10, 30],
    ['test', 'Set tecnico del dia', 'Haz un set limpio y para antes de arquear la espalda.', 'pushups', 1, topSet, 120],
    ['backoff', 'Series faciles', 'Reps solidas para consolidar volumen.', 'pushups', 3, Math.max(5, workingReps - 1), 75],
  ]);
});

const plans = [
  {
    slug: 'first_pullup_21d',
    titleKey: 'plan_first_pullup_title',
    descriptionKey: 'plan_first_pullup_desc',
    goalType: 'first_pullup',
    durationDays: 21,
    difficulty: 'beginner',
    days: buildFirstPullupDays(),
  },
  {
    slug: 'five_pullups_21d',
    titleKey: 'plan_five_pullups_title',
    descriptionKey: 'plan_five_pullups_desc',
    goalType: 'five_pullups',
    durationDays: 21,
    difficulty: 'beginner',
    days: buildFivePullupDays(),
  },
  {
    slug: 'ten_pullups_28d',
    titleKey: 'plan_ten_pullups_title',
    descriptionKey: 'plan_ten_pullups_desc',
    goalType: 'ten_pullups',
    durationDays: 28,
    difficulty: 'intermediate',
    days: buildTenPullupDays(),
  },
  {
    slug: 'twenty_pushups_14d',
    titleKey: 'plan_twenty_pushups_title',
    descriptionKey: 'plan_twenty_pushups_desc',
    goalType: 'twenty_pushups',
    durationDays: 14,
    difficulty: 'beginner',
    days: buildTwentyPushupDays(),
  },
];

async function run() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS onboarding_mode VARCHAR(30),
      ADD COLUMN IF NOT EXISTS goal_onboarding_completed BOOLEAN DEFAULT FALSE
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS training_plans (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(80) UNIQUE NOT NULL,
        title_key VARCHAR(120) NOT NULL,
        description_key VARCHAR(120) NOT NULL,
        goal_type VARCHAR(80) NOT NULL,
        duration_days INTEGER NOT NULL,
        difficulty VARCHAR(40) DEFAULT 'beginner',
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS training_plan_days (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER REFERENCES training_plans(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        title_key VARCHAR(120) NOT NULL,
        focus VARCHAR(80) NOT NULL,
        estimated_minutes INTEGER DEFAULT 12,
        reward_xp INTEGER DEFAULT 100,
        reward_coins INTEGER DEFAULT 50,
        UNIQUE(plan_id, day_number)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS training_plan_blocks (
        id SERIAL PRIMARY KEY,
        plan_day_id INTEGER REFERENCES training_plan_days(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        block_type VARCHAR(40) NOT NULL,
        title VARCHAR(120) NOT NULL,
        instructions TEXT,
        exercise_type VARCHAR(50),
        target_sets INTEGER DEFAULT 1,
        target_reps INTEGER DEFAULT 1,
        rest_seconds INTEGER DEFAULT 60
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_active_plans (
        user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES training_plans(id) ON DELETE CASCADE,
        started_at DATE DEFAULT CURRENT_DATE,
        current_day INTEGER DEFAULT 1,
        days_per_week INTEGER DEFAULT 3,
        baseline JSONB DEFAULT '{}'::jsonb,
        equipment JSONB DEFAULT '{}'::jsonb,
        last_completed_date DATE,
        last_completed_day INTEGER,
        status VARCHAR(30) DEFAULT 'active'
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES training_plans(id),
        plan_day_id INTEGER REFERENCES training_plan_days(id),
        status VARCHAR(30) DEFAULT 'started',
        total_reps INTEGER DEFAULT 0,
        total_damage INTEGER DEFAULT 0,
        reward_xp INTEGER DEFAULT 0,
        reward_coins INTEGER DEFAULT 0,
        completion_rate INTEGER DEFAULT 0,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS workout_set_logs (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES workout_sessions(id) ON DELETE CASCADE,
        block_id INTEGER REFERENCES training_plan_blocks(id),
        set_index INTEGER NOT NULL,
        exercise_type VARCHAR(50),
        target_reps INTEGER DEFAULT 0,
        actual_reps INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE
      )
    `);

    for (const plan of plans) {
      const planResult = await client.query(
        `INSERT INTO training_plans (slug, title_key, description_key, goal_type, duration_days, difficulty, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)
         ON CONFLICT (slug)
         DO UPDATE SET
           title_key = EXCLUDED.title_key,
           description_key = EXCLUDED.description_key,
           goal_type = EXCLUDED.goal_type,
           duration_days = EXCLUDED.duration_days,
           difficulty = EXCLUDED.difficulty,
           is_active = TRUE
         RETURNING id`,
        [plan.slug, plan.titleKey, plan.descriptionKey, plan.goalType, plan.durationDays, plan.difficulty]
      );

      const planId = planResult.rows[0].id;

      for (const day of plan.days) {
        const dayResult = await client.query(
          `INSERT INTO training_plan_days (plan_id, day_number, title_key, focus, estimated_minutes, reward_xp, reward_coins)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (plan_id, day_number)
           DO UPDATE SET
             title_key = EXCLUDED.title_key,
             focus = EXCLUDED.focus,
             estimated_minutes = EXCLUDED.estimated_minutes,
             reward_xp = EXCLUDED.reward_xp,
             reward_coins = EXCLUDED.reward_coins
           RETURNING id`,
          [planId, day.dayNumber, day.titleKey, day.focus, day.minutes, day.xp, day.coins]
        );

        const dayId = dayResult.rows[0].id;
        await client.query('DELETE FROM training_plan_blocks WHERE plan_day_id = $1', [dayId]);

        for (let index = 0; index < day.blocks.length; index += 1) {
          const [blockType, title, instructions, exerciseType, targetSets, targetReps, restSeconds] = day.blocks[index];
          await client.query(
            `INSERT INTO training_plan_blocks (
              plan_day_id, order_index, block_type, title, instructions, exercise_type, target_sets, target_reps, rest_seconds
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [dayId, index + 1, blockType, title, instructions, exerciseType, targetSets, targetReps, restSeconds]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log('Guided training migration applied.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Guided training migration failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
