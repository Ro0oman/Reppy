import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const { default: pool } = await import('./db.js');

const plans = [
  {
    slug: 'first_pullup_21d',
    titleKey: 'plan_first_pullup_title',
    descriptionKey: 'plan_first_pullup_desc',
    goalType: 'first_pullup',
    durationDays: 21,
    difficulty: 'beginner',
    days: [
      {
        dayNumber: 1,
        titleKey: 'guided_day_tech_base',
        focus: 'base_tecnica',
        minutes: 12,
        xp: 90,
        coins: 35,
        blocks: [
          ['warmup', 'Activacion escapular', 'Respira, cuelgate suave y prepara hombros.', 'pullups', 2, 5, 45],
          ['strength', 'Dominada asistida', 'Usa banda, salto o apoyo. Baja controlado.', 'pullups', 4, 2, 75],
          ['control', 'Dead hang', 'Cuelgate con hombros activos.', 'pullups', 2, 1, 60],
        ],
      },
      {
        dayNumber: 2,
        titleKey: 'guided_day_soft_volume',
        focus: 'volumen_suave',
        minutes: 14,
        xp: 105,
        coins: 45,
        blocks: [
          ['warmup', 'Scapular pulls', 'Sube y baja escapulas sin flexionar codos.', 'pullups', 3, 5, 45],
          ['strength', 'Negativas controladas', 'Salta arriba y baja en 3 segundos.', 'pullups', 5, 2, 90],
          ['finisher', 'Remo invertido o asistido', 'Busca reps limpias, lejos del fallo.', 'pullups', 3, 6, 60],
        ],
      },
      {
        dayNumber: 3,
        titleKey: 'guided_day_control_test',
        focus: 'test_control',
        minutes: 10,
        xp: 120,
        coins: 50,
        blocks: [
          ['warmup', 'Calentamiento pull', 'Movilidad de hombro y 2 hangs suaves.', 'pullups', 2, 4, 45],
          ['test', 'Intentos de dominada', 'Prueba reps limpias sin romper tecnica.', 'pullups', 4, 1, 90],
          ['control', 'Dead hang final', 'Aguanta con buena posicion.', 'pullups', 2, 1, 60],
        ],
      },
    ],
  },
  {
    slug: 'five_pullups_21d',
    titleKey: 'plan_five_pullups_title',
    descriptionKey: 'plan_five_pullups_desc',
    goalType: 'five_pullups',
    durationDays: 21,
    difficulty: 'beginner',
    days: [
      {
        dayNumber: 1,
        titleKey: 'guided_day_tech_base',
        focus: 'base_tecnica',
        minutes: 13,
        xp: 100,
        coins: 40,
        blocks: [
          ['warmup', 'Scapular pulls', 'Activa hombros antes de tirar.', 'pullups', 3, 5, 45],
          ['strength', 'Dominadas submaximas', 'Para con 1 o 2 reps en reserva.', 'pullups', 5, 2, 90],
          ['control', 'Dead hang', 'Controla respiracion y agarre.', 'pullups', 2, 1, 60],
        ],
      },
      {
        dayNumber: 2,
        titleKey: 'guided_day_soft_volume',
        focus: 'volumen_suave',
        minutes: 15,
        xp: 115,
        coins: 50,
        blocks: [
          ['warmup', 'Hangs activos', 'Mantente estable y sin dolor.', 'pullups', 2, 3, 45],
          ['strength', 'Series cortas de dominadas', 'Repite calidad, no busques fallo.', 'pullups', 6, 2, 75],
          ['finisher', 'Negativas lentas', 'Bajada controlada de 3 a 4 segundos.', 'pullups', 3, 2, 90],
        ],
      },
      {
        dayNumber: 3,
        titleKey: 'guided_day_control_test',
        focus: 'test_control',
        minutes: 11,
        xp: 125,
        coins: 55,
        blocks: [
          ['warmup', 'Activacion pull', 'Calienta agarre, hombros y dorsal.', 'pullups', 2, 5, 45],
          ['test', 'Set tecnico maximo', 'Haz un set limpio, para antes de romper forma.', 'pullups', 1, 5, 120],
          ['backoff', 'Series faciles', 'Completa volumen con reps seguras.', 'pullups', 3, 2, 75],
        ],
      },
    ],
  },
  {
    slug: 'ten_pullups_28d',
    titleKey: 'plan_ten_pullups_title',
    descriptionKey: 'plan_ten_pullups_desc',
    goalType: 'ten_pullups',
    durationDays: 28,
    difficulty: 'intermediate',
    days: [
      {
        dayNumber: 1,
        titleKey: 'guided_day_tech_base',
        focus: 'base_tecnica',
        minutes: 15,
        xp: 120,
        coins: 50,
        blocks: [
          ['warmup', 'Scapular pulls', 'Prepara hombros y dorsales.', 'pullups', 3, 6, 45],
          ['strength', 'Dominadas tecnicas', 'Series lejos del fallo para acumular calidad.', 'pullups', 5, 3, 90],
          ['control', 'Pausa arriba', 'Mantente un segundo arriba en cada rep.', 'pullups', 3, 2, 90],
        ],
      },
      {
        dayNumber: 2,
        titleKey: 'guided_day_soft_volume',
        focus: 'volumen_suave',
        minutes: 17,
        xp: 135,
        coins: 60,
        blocks: [
          ['warmup', 'Hangs y movilidad', 'Suaviza hombros y agarre.', 'pullups', 2, 5, 45],
          ['volume', 'Escalera 2-3-4', 'Acumula reps sin llegar al fallo.', 'pullups', 3, 9, 120],
          ['finisher', 'Negativas', 'Baja controlado y deja reps buenas.', 'pullups', 2, 3, 90],
        ],
      },
      {
        dayNumber: 3,
        titleKey: 'guided_day_control_test',
        focus: 'test_control',
        minutes: 12,
        xp: 150,
        coins: 65,
        blocks: [
          ['warmup', 'Activacion pull', 'Entra en calor sin fatigar.', 'pullups', 2, 6, 45],
          ['test', 'Set controlado', 'Busca tu mejor set limpio.', 'pullups', 1, 8, 150],
          ['backoff', 'Backoff tecnico', 'Dos series suaves para consolidar.', 'pullups', 2, 3, 90],
        ],
      },
    ],
  },
  {
    slug: 'twenty_pushups_14d',
    titleKey: 'plan_twenty_pushups_title',
    descriptionKey: 'plan_twenty_pushups_desc',
    goalType: 'twenty_pushups',
    durationDays: 14,
    difficulty: 'beginner',
    days: [
      {
        dayNumber: 1,
        titleKey: 'guided_day_tech_base',
        focus: 'base_tecnica',
        minutes: 10,
        xp: 80,
        coins: 30,
        blocks: [
          ['warmup', 'Plancha alta', 'Bloquea abdomen y hombros.', 'pushups', 2, 1, 45],
          ['strength', 'Flexiones tecnicas', 'Pecho abajo, cuerpo firme.', 'pushups', 4, 6, 60],
          ['control', 'Flexion lenta', 'Baja en 3 segundos.', 'pushups', 2, 4, 60],
        ],
      },
      {
        dayNumber: 2,
        titleKey: 'guided_day_soft_volume',
        focus: 'volumen_suave',
        minutes: 12,
        xp: 95,
        coins: 40,
        blocks: [
          ['warmup', 'Movilidad de munecas', 'Prepara apoyo y hombros.', 'pushups', 2, 5, 30],
          ['volume', 'Series faciles', 'Suma reps con forma estable.', 'pushups', 5, 8, 60],
          ['finisher', 'Plancha', 'Cierra con abdomen firme.', 'pushups', 2, 1, 45],
        ],
      },
      {
        dayNumber: 3,
        titleKey: 'guided_day_control_test',
        focus: 'test_control',
        minutes: 10,
        xp: 110,
        coins: 45,
        blocks: [
          ['warmup', 'Activacion push', 'Hombros, munecas y core.', 'pushups', 2, 5, 30],
          ['test', 'Set maximo tecnico', 'Busca reps limpias sin hundir cadera.', 'pushups', 1, 20, 120],
          ['backoff', 'Serie facil', 'Termina con control.', 'pushups', 2, 6, 60],
        ],
      },
    ],
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
