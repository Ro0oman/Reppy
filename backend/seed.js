import { query } from './db.js';

async function seed() {
  console.log('Seeding store and boss...');
  try {
    // 1. Cosmetics
    const items = [
      { name: 'Conejo Veloz', description: 'Título festivo de Pascua', type: 'title', price: 100, css_value: 'text-pink-500' },
      { name: 'El Inquebrantable', description: 'Título legendario', type: 'title', price: 500, css_value: 'text-amber-500 font-black' },
      { name: 'Guardián del Tubo', description: 'Epic Title. Guardián de la barra.', type: 'title', price: 400, css_value: 'text-emerald-500' },
      { name: 'Aura Neón Rosa', description: 'Rare Border. Neón rosa pulsante.', type: 'border', price: 250, css_value: 'frame-neon-rosa' },
      { name: 'Aura Fuego Ámbar', description: 'Epic Border. Anillo de fuego estático.', type: 'border', price: 800, css_value: 'frame-fuego-ambar' },
      { name: 'Furia Infinita', description: 'Legendary Border. Llamas animadas.', type: 'border', price: 1500, css_value: 'frame-furia' },
      { name: 'Neural Overdrive', description: 'Epic Border. Vibe cyberpunk.', type: 'border', price: 800, css_value: 'frame-cyber' },
      { name: 'Blood Pact', description: 'Rare Border. Constancia tipo latido.', type: 'border', price: 300, css_value: 'frame-blood' },
      { name: 'Brick by Brick', description: 'Common Border. Constancia diaria.', type: 'border', price: 80, css_value: 'frame-brick' },
      { name: 'Built Different', description: 'Legendary Title. Puro status.', type: 'title', price: 1500, css_value: 'text-orange-500 font-black tracking-[0.2em] drop-shadow-[0_0_10px_rgba(249,115,22,0.6)] uppercase' },
      { name: 'Cyber Athlete', description: 'Epic Title. Luces neon, vibe gamer.', type: 'title', price: 800, css_value: 'text-cyan-400 font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' },
      { name: 'Stone Titan', description: 'Epic Title. Fuerza bruta.', type: 'title', price: 700, css_value: 'text-stone-400 font-black drop-shadow-md uppercase tracking-tight' },
      { name: 'Calisthenics Monk', description: 'Rare Title. Disciplina.', type: 'title', price: 300, css_value: 'text-zinc-300 font-light tracking-[0.3em] uppercase' },
      { name: 'No Excuses', description: 'Common Title. Sin excusas.', type: 'title', price: 120, css_value: 'text-white font-bold uppercase tracking-wider' },
      { name: 'Rabbit Slayer', description: 'Vencedor del Conejo de Acero. Título exclusivo de temporada.', type: 'title', price: 0, css_value: 'text-pink-600 font-black tracking-widest uppercase drop-shadow-[0_0_10px_rgba(219,39,119,0.5)]' },
      { name: 'Aura de Pascua', description: 'Borde festivo obtenido en el evento de Pascua de 2026.', type: 'border', price: 0, css_value: 'frame-easter' },
      { name: 'Easter Celebration', description: '¡Huevos y conejos! Edición limitada de Pascua.', type: 'background', price: 0, css_value: 'bg-easter' }
    ];

    for (const item of items) {
      await query(
        `INSERT INTO cosmetics (name, description, type, price, css_value) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, price = EXCLUDED.price, css_value = EXCLUDED.css_value`,
         [item.name, item.description, item.type, item.price, item.css_value]
      );
    }

    // 2. Spawn Boss
    const usersRes = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = Math.max(1, parseInt(usersRes.rows[0].count));
    const totalHP = Math.max(10000, totalUsers * 10);
    
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
