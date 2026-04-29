import { query } from './db.js';

const missions = [
  // TIER I: DIARIAS / FÁCILES (20-100 reps)
  { title: 'Calentamiento Dinámico', desc: 'Realiza 20 repeticiones totales.', type: 'reps', value: 20, xp: 30, gems: 2, coins: 40, daily: true, tier: 1 },
  { title: 'Ritmo de Combate', desc: 'Realiza 50 repeticiones totales.', type: 'reps', value: 50, xp: 60, gems: 4, coins: 80, daily: true, tier: 1 },
  { title: 'Esfuerzo del Día', desc: 'Realiza 100 repeticiones totales.', type: 'reps', value: 100, xp: 120, gems: 6, coins: 150, daily: true, tier: 1 },
  { title: 'Primeros Auxilios', desc: 'Usa una poción en combate.', type: 'use_consumable', value: 1, xp: 40, gems: 2, coins: 50, daily: true, tier: 1 },
  { title: 'Explorador de la Armería', desc: 'Compra cualquier objeto.', type: 'buy_any', value: 1, xp: 50, gems: 3, coins: 60, daily: true, tier: 1 },
  { title: 'Pulso Social', desc: 'Dale "Me gusta" a 3 publicaciones.', type: 'social_likes', value: 3, xp: 30, gems: 2, coins: 30, daily: true, tier: 1 },
  { title: 'Cazador de Sombras', desc: 'Inflige 500 de daño a un boss.', type: 'damage', value: 500, xp: 50, gems: 3, coins: 70, daily: true, tier: 1 },
  { title: 'Sesión Nocturna', desc: 'Registra reps después de las 22:00.', type: 'night_owl', value: 1, xp: 60, gems: 4, coins: 90, daily: true, tier: 1 },

  // TIER II: MEDIAS / ESPECIALES (250-1000 reps)
  { title: 'Veterano de la Barra', desc: 'Acumula 250 repeticiones.', type: 'reps', value: 250, xp: 300, gems: 15, coins: 400, daily: false, tier: 2 },
  { title: 'Guerrero Consistente', desc: 'Acumula 500 repeticiones.', type: 'reps', value: 500, xp: 600, gems: 25, coins: 800, daily: false, tier: 2 },
  { title: 'Titán de Acero', desc: 'Acumula 1000 repeticiones.', type: 'reps', value: 1000, xp: 1200, gems: 50, coins: 1500, daily: false, tier: 2 },
  { title: 'Semana de Hierro', desc: 'Mantén una racha de 7 días.', type: 'streak', value: 7, xp: 500, gems: 20, coins: 600, daily: false, tier: 2 },
  { title: 'Coleccionista de Élite', desc: 'Posee 10 objetos en tu inventario.', type: 'own_items', value: 10, xp: 400, gems: 15, coins: 500, daily: false, tier: 2 },
  { title: 'Verdugo de Bosses', desc: 'Inflige 5000 de daño total.', type: 'damage', value: 5000, xp: 700, gems: 30, coins: 1000, daily: false, tier: 2 },
  { title: 'Influencer del Calisténico', desc: 'Consigue 5 amigos.', type: 'social_friends', value: 5, xp: 300, gems: 10, coins: 400, daily: false, tier: 2 },
  { title: 'Sabiduría Aplicada', desc: 'Lee 5 artículos del blog.', type: 'read_blog', value: 5, xp: 200, gems: 8, coins: 250, daily: false, tier: 2 },

  // TIER III: DIFÍCILES / ÉPICAS (2500-10000 reps)
  { title: 'Deidad de las Barras', desc: 'Acumula 2500 repeticiones.', type: 'reps', value: 2500, xp: 3000, gems: 100, coins: 5000, daily: false, tier: 3 },
  { title: 'Leyenda Viviente', desc: 'Acumula 5000 repeticiones.', type: 'reps', value: 5000, xp: 7000, gems: 250, coins: 12000, daily: false, tier: 3 },
  { title: 'El Elegido de Reppy', desc: 'Acumula 10000 repeticiones.', type: 'reps', value: 10000, xp: 15000, gems: 600, coins: 30000, daily: false, tier: 3 },
  { title: 'Disciplina Inquebrantable', desc: 'Mantén una racha de 30 días.', type: 'streak', value: 30, xp: 2000, gems: 150, coins: 5000, daily: false, tier: 3 },
  { title: 'Calamidad de Bosses', desc: 'Inflige 50,000 de daño total.', type: 'damage', value: 50000, xp: 5000, gems: 300, coins: 10000, daily: false, tier: 3 },
  { title: 'Magnate Supremo', desc: 'Gasta 50,000 Reppy Coins.', type: 'spend_coins', value: 50000, xp: 4000, gems: 200, coins: 0, daily: false, tier: 3 },

  // MISIONES ULTRA SATISFACTORIAS (The "Engage" category)
  { title: 'Rompiendo Límites', desc: 'Supera tu récord personal de repeticiones en un día.', type: 'personal_record', value: 1, xp: 200, gems: 15, coins: 300, daily: true, tier: 2 },
  { title: 'Tríada de Barras', desc: 'Registra repeticiones durante 3 días seguidos.', type: 'streak_3_days', value: 3, xp: 150, gems: 10, coins: 200, daily: false, tier: 1 },
  { title: 'Golpe de Gracia', desc: 'Sé el jugador que dé el golpe final a un boss.', type: 'boss_last_hit', value: 1, xp: 1000, gems: 100, coins: 2000, daily: false, tier: 3 },
  { title: 'Legado Legendario', desc: 'Compra un objeto de rareza Legendaria o Calisténica.', type: 'buy_legendary', value: 1, xp: 500, gems: 50, coins: 1000, daily: false, tier: 3 },
  { title: 'Doble Ascensión', desc: 'Sube 2 niveles en un solo día.', type: 'level_up_2', value: 1, xp: 1000, gems: 40, coins: 1000, daily: true, tier: 3 },
  { title: 'Maestro de Jornada', desc: 'Completa las 3 misiones activas de hoy.', type: 'complete_3_missions', value: 1, xp: 500, gems: 25, coins: 500, daily: true, tier: 2 },
  { title: 'Perfeccionista', desc: 'Completa 5 misiones en total hoy.', type: 'complete_5_missions', value: 1, xp: 800, gems: 40, coins: 800, daily: true, tier: 3 }
];

// Generar más misiones variadas para llegar a ~50
const additionalMissions = [];
const types = ['reps', 'damage', 'xp_str', 'xp_pwr', 'xp_end', 'xp_agi', 'social_likes'];
for (let i = 1; i <= 20; i++) {
  const type = types[i % types.length];
  const tier = (i % 3) + 1;
  const isDaily = tier === 1;
  const value = tier * 100 * (i % 5 + 1);
  
  const typeLabels = {
    'reps': 'repeticiones',
    'damage': 'puntos de daño al boss',
    'xp_str': 'puntos de XP de Fuerza',
    'xp_pwr': 'puntos de XP de Potencia',
    'xp_end': 'puntos de XP de Resistencia',
    'xp_agi': 'puntos de XP de Agilidad',
    'social_likes': 'likes a otros usuarios'
  };

  additionalMissions.push({
    title: `Desafío Táctico ${i}`,
    desc: `Consigue ${value} ${typeLabels[type] || type} para completar este objetivo.`,
    type: type,
    value: value,
    xp: tier * 100,
    gems: tier * 5,
    coins: tier * 100,
    daily: isDaily,
    tier: tier
  });
}

const allMissions = [...missions, ...additionalMissions];

async function seed() {
  try {
    console.log('Cleaning old missions...');
    await query('TRUNCATE missions CASCADE');
    
    console.log(`Seeding ${allMissions.length} balanced and tiered missions...`);
    
    for (const m of allMissions) {
      const normalizedTitle = m.title.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/ /g, '_')
        .replace(/[^\w]/g, ''); // Remove non-alphanumeric
      
      const titleKey = `mission_${normalizedTitle}_title`;
      const descKey = `mission_${normalizedTitle}_desc`;
      
      await query(`
        INSERT INTO missions (title_key, description_key, goal_type, goal_value, reward_xp, reward_gems, reward_coins, is_daily, tier)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (title_key) DO UPDATE SET 
          description_key = EXCLUDED.description_key,
          goal_type = EXCLUDED.goal_type,
          goal_value = EXCLUDED.goal_value,
          reward_xp = EXCLUDED.reward_xp,
          reward_gems = EXCLUDED.reward_gems,
          reward_coins = EXCLUDED.reward_coins,
          is_daily = EXCLUDED.is_daily,
          tier = EXCLUDED.tier
      `, [titleKey, descKey, m.type, m.value, m.xp, m.gems, m.coins, m.daily, m.tier]);
    }
    
    console.log('Seeding successful.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
