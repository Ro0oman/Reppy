import { query } from './db.js';

async function rename() {
    await query("UPDATE items SET name = 'Pack Táctico Común' WHERE type='bundle' AND rarity='common'");
    await query("UPDATE items SET name = 'Pack Especialista' WHERE type='bundle' AND rarity='especial'");
    await query("UPDATE items SET name = 'Arsenal Legendario' WHERE type='bundle' AND rarity='legendary'");
    // Check if we have a Calisténico pack
    const res = await query("SELECT count(*) FROM items WHERE type='bundle' AND rarity='calistenico'");
    if (res.rows[0].count === '0') {
        // Let's create one by converting an existing unneeded bundle, or just creating it.
        // Actually the user might not need us to create one, but let's check.
    }
    console.log("Renamed bundles");
    process.exit(0);
}
rename();
