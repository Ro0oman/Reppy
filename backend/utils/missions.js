import { query } from '../db.js';

/**
 * Updates user mission progress based on an action.
 * @param {string} userId - The user ID.
 * @param {string} goalType - The type of goal ('reps', 'streak', 'damage').
 * @param {number} value - The value to add/set.
 * @param {boolean} isIncremental - If true, adds to current value. If false, sets it.
 */
export const updateMissionProgress = async (userId, goalType, value, isIncremental = true) => {
  try {
    // 1. Get active missions of this type for the user
    const missions = await query(`
      SELECT m.id, m.goal_value, COALESCE(um.current_value, 0) as current_value, um.is_completed
      FROM missions m
      LEFT JOIN user_missions um ON m.id = um.mission_id AND um.user_id = $1
      WHERE m.goal_type = $2
    `, [userId, goalType]);

    for (const mission of missions.rows) {
      if (mission.is_completed) continue;

      const newValue = isIncremental ? (mission.current_value + value) : value;
      const isCompleted = newValue >= mission.goal_value;

      await query(`
        INSERT INTO user_missions (user_id, mission_id, current_value, is_completed, last_updated)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, mission_id) 
        DO UPDATE SET 
          current_value = EXCLUDED.current_value,
          is_completed = EXCLUDED.is_completed,
          last_updated = EXCLUDED.last_updated
      `, [userId, mission.id, newValue, isCompleted]);
      
      if (isCompleted && !mission.is_completed) {
        console.log(`[MISSIONS] User ${userId} completed mission ${mission.id}`);
        // Optionally create a notification here
      }
    }
  } catch (err) {
    console.error('[MISSIONS] Error updating progress:', err);
  }
};
