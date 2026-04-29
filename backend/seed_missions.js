import { query } from './db.js';

const seed = async () => {
  try {
    console.log('Seeding Missions...');
    
    const missions = [
      {
        title_key: 'mission_daily_reps_title',
        description_key: 'mission_daily_reps_desc',
        goal_type: 'reps',
        goal_value: 50,
        reward_xp: 100,
        reward_gems: 5,
        reward_coins: 100,
        is_daily: true
      },
      {
        title_key: 'mission_daily_streak_title',
        description_key: 'mission_daily_streak_desc',
        goal_type: 'streak',
        goal_value: 1,
        reward_xp: 50,
        reward_gems: 2,
        reward_coins: 50,
        is_daily: true
      },
      {
        title_key: 'mission_boss_damage_title',
        description_key: 'mission_boss_damage_desc',
        goal_type: 'damage',
        goal_value: 10000,
        reward_xp: 200,
        reward_gems: 10,
        reward_coins: 200,
        is_daily: false
      }
    ];

    for (const m of missions) {
      await query(`
        INSERT INTO missions (title_key, description_key, goal_type, goal_value, reward_xp, reward_gems, reward_coins, is_daily)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (title_key) DO UPDATE SET 
          goal_value = EXCLUDED.goal_value,
          reward_xp = EXCLUDED.reward_xp,
          reward_gems = EXCLUDED.reward_gems,
          reward_coins = EXCLUDED.reward_coins,
          is_daily = EXCLUDED.is_daily
      `, [m.title_key, m.description_key, m.goal_type, m.goal_value, m.reward_xp, m.reward_gems, m.reward_coins, m.is_daily]);
    }

    console.log('Seeding successful.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
