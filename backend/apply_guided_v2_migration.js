import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import pool from './db.js';

const exercisesSeed = [
  { slug: 'pullups', title_key: 'ex_pullups_std', description_key: 'Dominadas estándar para fuerza tracción.', technique_key: 'Sube barbilla por encima de la barra.', unit: 'reps', difficulty_multiplier: 1.0, coin_multiplier: 1.0 },
  { slug: 'pushups', title_key: 'ex_pushups_std', description_key: 'Flexiones estándar para fuerza de empuje.', technique_key: 'Mantén cuerpo firme y toca el suelo con el pecho.', unit: 'reps', difficulty_multiplier: 1.0, coin_multiplier: 1.0 },
  { slug: 'dips', title_key: 'ex_dips_std', description_key: 'Fondos en paralelas.', technique_key: 'Baja a 90 grados y sube con control.', unit: 'reps', difficulty_multiplier: 1.2, coin_multiplier: 2.0 },
  { slug: 'muscleups', title_key: 'ex_muscle_ups', description_key: 'Transición explosiva desde tracción a empuje.', technique_key: 'Tira fuerte y pasa el pecho por encima.', unit: 'reps', difficulty_multiplier: 2.0, coin_multiplier: 5.0 },
  { slug: 'weighted_pullups', title_key: 'ex_weighted_pullups', description_key: 'Dominadas con peso extra.', technique_key: 'Usa cinturón de lastre o chaleco.', unit: 'reps', difficulty_multiplier: 1.5, coin_multiplier: 3.0 },
  { slug: 'legs', title_key: 'ex_legs', description_key: 'Sentadillas o trabajo de tren inferior.', technique_key: 'Rompe el paralelo y mantén la espalda recta.', unit: 'reps', difficulty_multiplier: 1.0, coin_multiplier: 1.0 },
  { slug: 'scapular_pulls', title_key: 'Escapulares', description_key: 'Activación y fuerza de hombros.', technique_key: 'Sube y baja escápulas sin flexionar codos.', unit: 'reps', difficulty_multiplier: 0.8, coin_multiplier: 1.0 },
  { slug: 'dead_hang', title_key: 'Dead Hang', description_key: 'Aguante estático en barra.', technique_key: 'Cuelgate con hombros activos y respira.', unit: 'seconds', difficulty_multiplier: 0.5, coin_multiplier: 1.0 },
  { slug: 'negative_pullups', title_key: 'Negativas de Dominada', description_key: 'Fuerza excéntrica de tracción.', technique_key: 'Sube con salto y baja lentamente en 3-5 segundos.', unit: 'reps', difficulty_multiplier: 0.9, coin_multiplier: 1.0 },
  { slug: 'inverted_rows', title_key: 'Remos Invertidos', description_key: 'Fuerza horizontal de tracción.', technique_key: 'Tira hacia el pecho manteniendo el cuerpo firme.', unit: 'reps', difficulty_multiplier: 0.8, coin_multiplier: 1.0 },
  { slug: 'plank', title_key: 'Plancha Abdominal', description_key: 'Fuerza estática de core.', technique_key: 'Mantén el cuerpo recto como una tabla.', unit: 'seconds', difficulty_multiplier: 0.5, coin_multiplier: 1.0 }
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Add columns to user_active_plans
    await client.query(`
      ALTER TABLE user_active_plans 
      ADD COLUMN IF NOT EXISTS last_completed_date DATE,
      ADD COLUMN IF NOT EXISTS last_completed_day INTEGER;
    `);

    // Drop old table to avoid schema conflicts
    await client.query(`DROP TABLE IF EXISTS exercises CASCADE;`);

    // 2. Create exercises table
    await client.query(`
      CREATE TABLE exercises (
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

    // 3. Create user_favorite_exercises table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_favorite_exercises (
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        exercise_slug VARCHAR(80) REFERENCES exercises(slug) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        PRIMARY KEY (user_id, exercise_slug)
      );
    `);

    // 4. Seed exercises
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
          coin_multiplier = EXCLUDED.coin_multiplier;
      `, [ex.slug, ex.title_key, ex.description_key, ex.technique_key, ex.unit, ex.difficulty_multiplier, ex.coin_multiplier]);
    }

    // 5. Update any existing training blocks with real exercise slugs
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
