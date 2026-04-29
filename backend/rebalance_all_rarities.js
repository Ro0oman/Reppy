import { query } from './db.js';

const statTotalByRarity = {
    'common': 2,
    'rare': 5,
    'especial': 10,
    'legendary': 16,
    'calistenico': 25
};

const priceByRarity = {
    'common': 100,
    'rare': 400,
    'especial': 1000,
    'legendary': 3000,
    'calistenico': 10000
};

const bundlePriceByRarity = {
    'common': 350,       // 4*100 = 400
    'rare': 1400,        // 4*400 = 1600
    'especial': 3500,    // 4*1000 = 4000
    'legendary': 10000,  // 4*3000 = 12000
    'calistenico': 35000 // 4*10000 = 40000
};

const bundleOriginalPriceByRarity = {
    'common': 400,
    'rare': 1600,
    'especial': 4000,
    'legendary': 12000,
    'calistenico': 40000
};

async function rebalanceAll() {
    console.log('🌟 Aplicando escala de rarezas estricta (Común -> Raro -> Especial -> Legendario -> Calisténico)...');
    
    try {
        await query('BEGIN');

        // 1. Convert 'epic' to 'especial' in the entire database
        await query("UPDATE items SET rarity = 'especial' WHERE rarity = 'epic'");
        
        // 2. Convert 'uncommon' to 'rare' since we skip uncommon
        await query("UPDATE items SET rarity = 'rare' WHERE rarity = 'uncommon'");

        // 3. Fix specific items that should be 'calistenico' if any. 
        // "Items de rareza calistenia son los mejores". Let's upgrade 'Espadón del Abismo', 'Muspelheim Brazares de Kratos', etc.
        // Actually, we already have some calistenico items like Espadón del Abismo! Wait, in the screenshot Espadón del Abismo IS 'calisténico'.
        
        const res = await query("SELECT id, name, type, rarity, stats FROM items WHERE type IN ('head', 'weapon', 'armor', 'boots', 'consumable', 'bundle') AND (is_seasonal = false OR is_seasonal IS NULL)");
        
        for (const item of res.rows) {
            const r = item.rarity ? item.rarity.toLowerCase() : 'common';
            
            if (item.type === 'bundle') {
                const newPrice = bundlePriceByRarity[r] || 500;
                const newOrig = bundleOriginalPriceByRarity[r] || 600;
                await query('UPDATE items SET price = $1, original_price = $2 WHERE id = $3', [newPrice, newOrig, item.id]);
            } else if (item.type === 'consumable') {
                // Keep the consumable stats proportional
                const newPrice = priceByRarity[r] || 100;
                let newStats = item.stats;
                if (newStats) {
                    const total = statTotalByRarity[r] || 2;
                    for (const k in newStats) {
                        if (k !== 'duration' && k !== 'multiplier') {
                            newStats[k] = total; // Consumables Usually have all their weight in one stat
                        }
                    }
                }
                await query('UPDATE items SET price = $1, original_price = NULL, stats = $2 WHERE id = $3', [newPrice, newStats, item.id]);
            } else {
                const newPrice = priceByRarity[r] || 100;
                // Escalar stats manteniendo proporción actual
                let newStats = item.stats;
                if (newStats) {
                    const totalTarget = statTotalByRarity[r] || 2;
                    const keys = Object.keys(newStats).filter(k => k !== 'duration' && k !== 'multiplier');
                    let currentTotal = 0;
                    keys.forEach(k => currentTotal += newStats[k]);
                    
                    if (currentTotal > 0) {
                        let remaining = totalTarget;
                        keys.forEach(k => {
                            const val = Math.max(1, Math.floor(totalTarget * (newStats[k] / currentTotal)));
                            newStats[k] = val;
                            remaining -= val;
                        });
                        // Add remainder to highest stat
                        if (remaining > 0 && keys.length > 0) {
                            let highest = keys[0];
                            keys.forEach(k => { if (newStats[k] > newStats[highest]) highest = k; });
                            newStats[highest] += remaining;
                        }
                    } else {
                        // fallback distribution
                        newStats = { str: totalTarget };
                    }
                }
                await query('UPDATE items SET price = $1, original_price = NULL, stats = $2 WHERE id = $3', [newPrice, newStats, item.id]);
            }
        }

        await query('COMMIT');
        console.log('✅ Rebalanceo y escala de rarezas aplicados correctamente.');
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error(err);
        process.exit(1);
    }
}

rebalanceAll();
