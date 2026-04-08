import { query } from './db.js';

async function fix() {
    try {
        console.log('Starting DB Surgery...');
        
        // 1. Trim all target_id to YYYY-MM-DD
        const res1 = await query("UPDATE notifications SET target_id = LEFT(target_id, 10) WHERE type IN ('LIKE', 'COMMENT')");
        console.log('Date Trimming result:', res1.rowCount, 'rows affected');
        
        // 2. Ensure target_user_id is populated (assume user_id is the owner for older entries if missing)
        const res2 = await query("UPDATE notifications SET target_user_id = user_id WHERE target_user_id IS NULL AND type IN ('LIKE', 'COMMENT')");
        console.log('Target User ID fix result:', res2.rowCount, 'rows affected');
        
        console.log('DATABASE SURGICALLY CLEANED');
    } catch (e) {
        console.error('ERROR during surgery:', e);
    }
    process.exit();
}

fix();
