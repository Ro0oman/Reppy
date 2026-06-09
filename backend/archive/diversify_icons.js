import { query } from './db.js';
import fs from 'fs';
import path from 'path';

const iconMapPath = path.resolve('data/game-icons.json');
const iconData = JSON.parse(fs.readFileSync(iconMapPath, 'utf8'));

const icons = {
    head: iconData.head.map(i => `gi:${i.slug}`),
    weapon: iconData.weapon.map(i => `gi:${i.slug}`),
    armor: iconData.armor.map(i => `gi:${i.slug}`),
    boots: iconData.boots.map(i => `gi:${i.slug}`),
    consumable: iconData.consumable.map(i => `gi:${i.slug}`)
};

// Fallback for missing categories
Object.keys(icons).forEach(cat => {
    if (icons[cat].length === 0) {
        icons[cat] = iconData.other.map(i => `gi:${i.slug}`);
    }
});

async function diversify() {
    console.log('🚀 Iniciando diversificación masiva de iconos con Librería Local...');

    try {
        const res = await query("SELECT id, name, type FROM items WHERE type IN ('head', 'weapon', 'armor', 'boots', 'consumable')");
        const items = res.rows;

        console.log(`📦 Procesando ${items.length} items...`);

        for (const item of items) {
            const iconList = icons[item.type] || [];
            if (iconList.length > 0) {
                // Use a stable random based on item ID to keep it consistent if re-run
                const index = item.id % iconList.length;
                const icon = iconList[index];
                
                await query('UPDATE items SET svg_key = $1 WHERE id = $2', [icon, item.id]);
            }
        }

        console.log('✅ Todos los items actualizados con iconos únicos de Game-Icons!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en la diversificación:', err);
        process.exit(1);
    }
}

diversify();
