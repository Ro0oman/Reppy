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
    // 1. Get ONLY active missions of this type for the user
    // We join with user_missions and require is_active = true
    const activeMissions = await query(`
      SELECT m.id, m.goal_value, um.current_value, um.is_completed
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = $1 AND um.is_active = true AND m.goal_type = $2
    `, [userId, goalType]);

    for (const mission of activeMissions.rows) {
      if (mission.is_completed) continue;

      const newValue = isIncremental ? (mission.current_value + value) : value;
      const isCompleted = newValue >= mission.goal_value;

      await query(`
        UPDATE user_missions SET 
          current_value = $1,
          is_completed = $2,
          last_updated = CURRENT_TIMESTAMP
        WHERE user_id = $3 AND mission_id = $4
      `, [newValue, isCompleted, userId, mission.id]);
      
      if (isCompleted) {
        console.log(`[MISSIONS] User ${userId} completed mission ${mission.id}`);
        // Here we could trigger a "Mission Completed" event to the frontend
      }
    }
  } catch (err) {
    console.error('[MISSIONS] Error updating progress:', err);
  }
};
