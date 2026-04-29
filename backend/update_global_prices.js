import { query } from './db.js';

const priceByRarity = {
    'common': 100,
    'uncommon': 250,
    'rare': 600,
    'epic': 1500,
    'legendary': 3000,
    'especial': 5000
};

const bundlePriceByRarity = {
    'common': 350,       // 4 items * 100 = 400 -> discount
    'uncommon': 900,     // 4 items * 250 = 1000 -> discount
    'rare': 2100,        // 4 items * 600 = 2400 -> discount
    'epic': 5000,        // 4 items * 1500 = 6000 -> discount
    'legendary': 10000,  // 4 items * 3000 = 12000 -> discount
    'especial': 15000
};

async function updateGlobalPrices() {
    console.log('🏷️ Iniciando estandarización global de precios en la tienda...');
    
    try {
        const res = await query('SELECT id, name, type, rarity, price FROM items WHERE is_seasonal = false OR is_seasonal IS NULL');
        const items = res.rows;
        
        await query('BEGIN');
        
        let count = 0;
        
        for (const item of items) {
            // Fix Pack Élite Épico rarity if it's currently 'rare'
            if (item.name === 'Pack Élite Épico' && item.rarity === 'rare') {
                item.rarity = 'epic';
                await query('UPDATE items SET rarity = $1 WHERE id = $2', ['epic', item.id]);
            }

            let newPrice = 0;
            const rarity = item.rarity ? item.rarity.toLowerCase() : 'common';
            
            if (item.type === 'bundle') {
                newPrice = bundlePriceByRarity[rarity] || 500;
            } else {
                newPrice = priceByRarity[rarity] || 100;
            }
            
            // Si el item es un cosmético por defecto (precio 0 históricamente) 
            // The prompt says "Analiza todos y dales un precio en base a su rareza". 
            // So we strictly apply the price.
            
            await query(
                'UPDATE items SET price = $1, original_price = $1 WHERE id = $2',
                [newPrice, item.id]
            );
            count++;
        }
        
        await query('COMMIT');
        console.log(`✅ Precios actualizados y estandarizados para ${count} ítems no de temporada.`);
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error('❌ Error actualizando precios:', err);
        process.exit(1);
    }
}

updateGlobalPrices();
