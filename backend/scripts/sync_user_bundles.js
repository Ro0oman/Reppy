import { query } from '../db.js';

async function syncBundles() {
    console.log('--- STARTING BUNDLE SYNCHRONIZATION PROTOCOL ---');
    
    try {
        // 1. Find all bundle purchases
        const bundlePurchases = await query(`
            SELECT ui.user_id, i.id as bundle_id, i.name as bundle_name, i.bundle_items
            FROM user_items ui
            JOIN items i ON ui.item_id = i.id
            WHERE i.type = 'bundle' AND i.bundle_items IS NOT NULL
        `);

        console.log(`Found ${bundlePurchases.rows.length} bundle purchases to verify.`);

        let totalAdded = 0;

        for (const purchase of bundlePurchases.rows) {
            const { user_id, bundle_id, bundle_name, bundle_items } = purchase;
            const itemIds = bundle_items.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

            console.log(`Checking bundle "${bundle_name}" (ID: ${bundle_id}) for user ${user_id}...`);

            for (const itemId of itemIds) {
                // Check if user already has this specific item
                const exists = await query(
                    'SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = $2',
                    [user_id, itemId]
                );

                if (exists.rows.length === 0) {
                    // Add the missing item
                    await query(
                        'INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE)',
                        [user_id, itemId]
                    );
                    console.log(`  + Added missing item ID ${itemId} to user ${user_id}`);
                    totalAdded++;
                }
            }
        }

        console.log(`--- SYNC COMPLETE. Total items added: ${totalAdded} ---`);
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR DURING SYNC:', error);
        process.exit(1);
    }
}

syncBundles();
