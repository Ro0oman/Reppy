import { query } from '../db.js';

/** Suelo de HP del boss comunitario: lo que valía antes de escalar por comunidad. */
export const BASE_BOSS_HP = 50000;
/** HP que aporta cada usuario activo (reps en los últimos 7 días). */
export const HP_PER_ACTIVE_USER = 400;

/** HP base del boss comunitario para un número dado de usuarios activos. */
export function bossHpForActiveUsers(activeUsers) {
  const n = Number(activeUsers);
  const safe = Number.isFinite(n) && n > 0 ? n : 0;
  return Math.max(BASE_BOSS_HP, Math.round(safe * HP_PER_ACTIVE_USER));
}

/**
 * Recalculates the total HP for all bosses from the number of active users in the
 * last 7 days: `max(50.000, activos × 400)`, then ×8 for legendary / ×3 for epic.
 *
 * El boss sigue SIEMPRE activo — sin ventanas programadas ni cron (decidido
 * 2026-07-27). Sólo se recalcula el HP; `start_date`/`end_date` siguen sin uso.
 * Un boss ya dañado conserva su `current_hp`: subir el techo no le devuelve vida,
 * para no invalidar el daño que la comunidad ya le hizo.
 */
export async function syncBossHealth() {
  try {
    console.log('[BOSS_SYNC] Starting health recalculation...');
    
    // 1. Get count of active users (users who submitted reps in the last 7 days)
    const activeUsersRes = await query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM reps 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    const activeUsers = parseInt(activeUsersRes.rows[0]?.count) || 0;

    // El HP escala con la comunidad para que un veterano no funda el boss solo
    // (decidido 2026-07-27). El suelo de 50.000 mantiene el valor histórico
    // mientras la base sea pequeña: sólo empieza a subir por encima de ~125
    // activos semanales. Los multiplicadores is_legendary (×8) / is_epic (×3)
    // se aplican encima, en el UPDATE de abajo.
    const newTotalHp = bossHpForActiveUsers(activeUsers);

    console.log(`[BOSS_SYNC] ${activeUsers} usuarios activos (7d) → ${newTotalHp} HP base.`);

    // 2. Update bosses total_hp and current_hp with rarity-based scaling
    // We apply scaling if the boss hasn't been defeated yet
    // `current_hp` sólo se rellena a tope si el boss estaba intacto; uno ya dañado
    // conserva su vida para no invalidar el daño que la comunidad ya le hizo.
    // El LEAST es necesario ahora que el techo es dinámico: si la base de activos
    // baja, el nuevo total puede quedar por debajo del current_hp de un boss a
    // medias y la barra se pintaría por encima del 100%.
    await query(`
      UPDATE boss_fights
      SET total_hp = scaled.hp,
          current_hp = CASE
            WHEN boss_fights.current_hp >= boss_fights.total_hp THEN scaled.hp
            ELSE LEAST(boss_fights.current_hp, scaled.hp)
          END
      FROM (
        SELECT id,
               CASE
                 WHEN is_legendary THEN $1 * 8
                 WHEN is_epic THEN $1 * 3
                 ELSE $1
               END AS hp
        FROM boss_fights
        WHERE status != 'defeated'
      ) AS scaled
      WHERE boss_fights.id = scaled.id
    `, [newTotalHp]);

    console.log('[BOSS_SYNC] Successfully updated boss health templates.');
    return { activeUsers, newTotalHp };
  } catch (error) {
    console.error('[BOSS_SYNC] Error sincronizando vida del boss:', error);
    throw error;
  }
}
