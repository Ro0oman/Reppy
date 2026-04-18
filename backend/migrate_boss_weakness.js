import { query } from './db.js';

async function migrate() {
  try {
    console.log('Starting Stat/Weakness migration...');

    // 0. Ensure column exists
    await query("ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS weakness_stat VARCHAR(50) DEFAULT 'str'");
    console.log('Ensured weakness_stat column exists.');

    // 1. Update existing bosses with weaknesses
    await query("UPDATE boss_fights SET weakness_stat = 'dex' WHERE name = 'El Conejo de Acero'");
    await query("UPDATE boss_fights SET weakness_stat = 'str' WHERE name ILIKE '%Titan%'");
    await query("UPDATE boss_fights SET weakness_stat = 'fth' WHERE name ILIKE '%Espectro%'");
    await query("UPDATE boss_fights SET weakness_stat = 'int' WHERE name ILIKE '%Cerebro%' OR name ILIKE '%Neural%'");
    await query("UPDATE boss_fights SET weakness_stat = 'end' WHERE name ILIKE '%Maratón%'");
    await query("UPDATE boss_fights SET weakness_stat = 'vig' WHERE name ILIKE '%Guerrero%'");
    
    // Set default weaknesses for the rest
    const weaknesses = ['str', 'dex', 'end', 'vig', 'int', 'fth'];
    const bossesRes = await query("SELECT id, name FROM boss_fights WHERE weakness_stat IS NULL OR weakness_stat = 'str'");
    
    for (const boss of bossesRes.rows) {
        // If it's not the ones we specifically matched above
        if (!['El Conejo de Acero'].includes(boss.name)) {
            const randomWeakness = weaknesses[Math.floor(Math.random() * weaknesses.length)];
            await query("UPDATE boss_fights SET weakness_stat = $1 WHERE id = $2", [randomWeakness, boss.id]);
            console.log(`Assigned ${randomWeakness} to boss ${boss.name}`);
        }
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
