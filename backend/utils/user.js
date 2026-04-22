import { query } from '../db.js';
import { augmentUserWithLevels } from './stats.js';

/**
 * Fetches a user with all equipped item stats joined.
 */
export const getUserWithGear = async (userId) => {
  const result = await query(`
    SELECT u.*,
           iHead.stats as head_stats,
           iWeapon.stats as weapon_stats,
           iArmor.stats as armor_stats,
           iBoots.stats as boots_stats
    FROM users u
    LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
    LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
    LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
    LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
    WHERE u.id = $1
  `, [userId]);

  if (result.rows.length === 0) return null;
  
  return augmentUserWithLevels(result.rows[0]);
};
