import { query } from './db.js';
import fs from 'fs';

async function fixDB() {
    try {
        console.log('Reparando original_price y asignando SVGs faltantes...');
        await query('BEGIN');
        
        // 1. Quitar original_price a los items que no son bundles
        await query("UPDATE items SET original_price = NULL WHERE type != 'bundle'");
        
        // 2. Ajustar original_price real a los bundles
        await query("UPDATE items SET original_price = 400 WHERE type = 'bundle' AND rarity = 'common'");
        await query("UPDATE items SET original_price = 1000 WHERE type = 'bundle' AND rarity = 'uncommon'");
        await query("UPDATE items SET original_price = 2400 WHERE type = 'bundle' AND rarity = 'rare'");
        await query("UPDATE items SET original_price = 6000 WHERE type = 'bundle' AND rarity = 'epic'");
        await query("UPDATE items SET original_price = 12000 WHERE type = 'bundle' AND rarity = 'legendary'");
        await query("UPDATE items SET original_price = 20000 WHERE type = 'bundle' AND rarity = 'especial'");

        // 3. Arreglar los SVGs específicos y estacionales
        const fixes = {
            'Obsidiana Cofia del Ender Dragon': 'cowl',
            'Casco del Creepers': 'mc-creeper',
            'Peto Encantado': 'magic-armor',
            'Muspelheim Brazares de Kratos': 'vambrace',
            'Garras de Raiden': 'tiger-claws',
            'Espadón del Abismo': 'greatsword',
            'Tierra Soportes de Johnny Cage': 'shoes',
            'Outworld Hombreras de Johnny Cage': 'shoulder-pads',
            'Infierno Kunai de Shao Kahn': 'kunai',
            'Grebas del Caballero Alaba': 'gaiter',
            'Espada Divino': 'sword-blade'
        };

        for (const [name, svg] of Object.entries(fixes)) {
            await query("UPDATE items SET svg_key = $1 WHERE name = $2", [`gi:${svg}`, name]);
        }

        // Asignar SVGs a los items estacionales que están en NULL
        const seasonalIcons = [
            'gi:present', 'gi:party-popper', 'gi:star-medal', 'gi:trophy', 'gi:crown-coin',
            'gi:polar-star', 'gi:fireworks-rocket', 'gi:gem-pendant', 'gi:ring', 'gi:necklace'
        ];
        
        const seasonal = await query("SELECT id FROM items WHERE is_seasonal = true AND svg_key IS NULL");
        for (let i = 0; i < seasonal.rows.length; i++) {
            const icon = seasonalIcons[i % seasonalIcons.length];
            await query("UPDATE items SET svg_key = $1 WHERE id = $2", [icon, seasonal.rows[i].id]);
        }

        // 4. Regenerar editable_items.json
        const editableRes = await query("SELECT id, name, svg_key FROM items WHERE type IN ('head', 'weapon', 'armor', 'boots', 'consumable') ORDER BY id ASC");
        const editableData = editableRes.rows.map(a => ({ id: a.id, name: a.name, icon: a.svg_key }));
        fs.writeFileSync('./data/editable_items.json', JSON.stringify(editableData, null, 2));

        await query('COMMIT');
        console.log('✅ Correcciones aplicadas.');
        process.exit(0);
    } catch(e) {
        await query('ROLLBACK');
        console.error(e);
        process.exit(1);
    }
}
fixDB();
