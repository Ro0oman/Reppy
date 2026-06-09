import { query } from './db.js';

const migrate = async () => {
  try {
    console.log('Adding stat_type column to exercises...');
    await query(`ALTER TABLE exercises ADD COLUMN IF NOT EXISTS stat_type VARCHAR(20) DEFAULT 'end_xp'`);

    // Map known built-in exercises to correct stat
    const knownMap = [
      ['pullups',          'str_xp'],
      ['pushups',          'end_xp'],
      ['dips',             'str_xp'],
      ['weighted_pullups', 'pwr_xp'],
      ['muscleups',        'pwr_xp'],
      ['legs',             'end_xp'],
    ];
    for (const [slug, stat] of knownMap) {
      await query(`UPDATE exercises SET stat_type = $1 WHERE slug = $2`, [stat, slug]);
    }

    // Hevy exercises: weighted ones → str_xp, unweighted → end_xp
    await query(`
      UPDATE exercises e
      SET stat_type = CASE
        WHEN hem.is_weighted = true THEN 'str_xp'
        ELSE 'end_xp'
      END
      FROM hevy_exercise_map hem
      WHERE hem.reppy_exercise_type = e.slug
        AND e.slug LIKE 'hevy_%'
    `);

    console.log('Migration complete: stat_type column added and populated.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
