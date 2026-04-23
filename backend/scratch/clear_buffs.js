import { query } from '../db.js';

const clearBuffs = async (email) => {
    try {
        const res = await query(
            "UPDATE users SET damage_multiplier = 1.0, damage_multiplier_expiry = NULL, dex_bonus = 0, dex_bonus_expiry = NULL WHERE email = $1",
            [email]
        );
        console.log(`Successfully cleared buffs for ${email}. Rows affected: ${res.rowCount}`);
    } catch (err) {
        console.error('Error clearing buffs:', err);
    } finally {
        process.exit();
    }
};

const email = process.argv[2] || 'romainot99@gmai.com';
clearBuffs(email);
