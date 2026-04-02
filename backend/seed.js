import { query } from './db.js';

async function seed() {
  console.log('Seeding store and boss...');
  try {
    // 1. Cosmetics
    const items = [
      { name: 'Conejo Veloz', description: 'Título festivo de Pascua', type: 'title', price: 100, css_value: 'text-pink-500' },
      { name: 'El Inquebrantable', description: 'Título legendario', type: 'title', price: 500, css_value: 'text-amber-500 font-black' },
      { name: 'Guardián del Tubo', description: 'Título épico', type: 'title', price: 250, css_value: 'text-emerald-500' },
      { name: 'Aura Neón Rosa', description: 'Borde de avatar festivo', type: 'border', price: 150, css_value: 'ring-4 ring-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]' },
      { name: 'Aura Fuego Ámbar', description: 'Borde legendario', type: 'border', price: 600, css_value: 'ring-4 ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,1)]' }
    ];

    for (const item of items) {
      await query(
        `INSERT INTO cosmetics (name, description, type, price, css_value) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
         [item.name, item.description, item.type, item.price, item.css_value]
      );
    }

    // 2. Spawn Boss
    const usersRes = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = Math.max(1, parseInt(usersRes.rows[0].count));
    const totalHP = totalUsers * 10;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); // Started yesterday
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    // Let's spawn it only if no active exists
    const actRes = await query(`SELECT * FROM boss_fights WHERE status = 'active'`);
    if (actRes.rows.length === 0) {
      await query(
        `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['El Conejo de Acero', 'Evento de Pascua Comunitario de 7 Días', totalHP, totalHP, startDate, endDate]
      );
    }
    
    console.log('Seed terminado.');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

seed();
