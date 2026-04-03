import { query } from './db.js';

async function seed() {
  console.log('Seeding store and boss...');
  try {
    // 1. Cosmetics
    const items = [
      { name: 'Conejo Veloz', description: 'Título festivo de Pascua', type: 'title', price: 100, css_value: 'text-pink-500' },
      { name: 'El Inquebrantable', description: 'Título legendario', type: 'title', price: 500, css_value: 'text-amber-500 font-black' },
      { name: 'Guardián del Tubo', description: 'Título épico', type: 'title', price: 250, css_value: 'text-emerald-500' },
      { name: 'Aura Neón Rosa', description: 'Borde de avatar festivo', type: 'border', price: 150, css_value: 'ring-[3px] ring-pink-500 ring-offset-4 ring-offset-[#09090b] shadow-[0_0_30px_rgba(236,72,153,1)]' },
      { name: 'Aura Fuego Ámbar', description: 'Borde legendario', type: 'border', price: 600, css_value: 'ring-[4px] ring-amber-500 ring-offset-2 ring-offset-[#09090b] shadow-[0_0_25px_rgba(245,158,11,1)] animate-pulse' },
      { name: 'Furia Infinita', description: 'Legendary Border. Llamas animadas.', type: 'border', price: 1500, css_value: 'ring-[4px] ring-orange-500 ring-offset-4 ring-offset-[#09090b] shadow-[0_0_25px_rgba(249,115,22,1)] animate-pulse' },
      { name: 'Neural Overdrive', description: 'Epic Border. Vibe cyberpunk.', type: 'border', price: 800, css_value: 'ring-[3px] border-[3px] border-dashed border-zinc-900 ring-cyan-400 ring-offset-2 ring-offset-[#09090b] shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse' },
      { name: 'Blood Pact', description: 'Rare Border. Constancia tipo latido.', type: 'border', price: 300, css_value: 'ring-[4px] ring-red-600/80 ring-offset-2 ring-offset-[#09090b] shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-pulse' },
      { name: 'Brick by Brick', description: 'Common Border. Constancia diaria.', type: 'border', price: 100, css_value: 'ring-[4px] ring-orange-950 border border-orange-800' },
      { name: 'Built Different', description: 'Legendary Title. Puro status.', type: 'title', price: 1500, css_value: 'text-orange-500 font-black tracking-[0.2em] drop-shadow-[0_0_10px_rgba(249,115,22,0.6)] uppercase' },
      { name: 'Cyber Athlete', description: 'Epic Title. Luces neon, vibe gamer.', type: 'title', price: 800, css_value: 'text-cyan-400 font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' },
      { name: 'Stone Titan', description: 'Epic Title. Fuerza bruta.', type: 'title', price: 600, css_value: 'text-stone-400 font-black drop-shadow-md uppercase tracking-tight' },
      { name: 'Calisthenics Monk', description: 'Rare Title. Disciplina.', type: 'title', price: 300, css_value: 'text-zinc-300 font-light tracking-[0.3em] uppercase' },
      { name: 'No Excuses', description: 'Common Title.', type: 'title', price: 150, css_value: 'text-white font-bold uppercase tracking-wider' },
      { name: 'Marca del Slayer', description: 'Epic Title. Constancia en eventos.', type: 'title', price: 1000, css_value: 'text-red-500 font-black tracking-widest uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' }
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
