import { query } from './db.js';
import fs from 'fs';

async function exportMapping() {
    console.log('📤 Exportando mapeo de items a iconos...');
    try {
        const res = await query('SELECT name, svg_key FROM items WHERE svg_key IS NOT NULL ORDER BY name ASC');
        const mapping = {};
        
        res.rows.forEach(row => {
            mapping[row.name] = row.svg_key;
        });

        fs.writeFileSync('./data/item_icon_mapping.json', JSON.stringify(mapping, null, 2));
        console.log(`✅ Mapeo exportado con éxito (${res.rows.length} items) en ./data/item_icon_mapping.json`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error exportando mapeo:', err);
        process.exit(1);
    }
}

exportMapping();
