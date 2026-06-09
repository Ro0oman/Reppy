import { query } from './db.js';
import fs from 'fs';

async function exportMapping() {
    console.log('📤 Exportando base de datos de ítems para edición (ID, Nombre, Icono)...');
    try {
        const res = await query('SELECT id, name, svg_key FROM items WHERE type IN (\'head\', \'weapon\', \'armor\', \'boots\', \'consumable\') ORDER BY id ASC');
        
        // Estructura de array para facilitar la edición de nombres e iconos
        const items = res.rows.map(row => ({
            id: row.id,
            name: row.name,
            icon: row.svg_key
        }));

        fs.writeFileSync('./data/editable_items.json', JSON.stringify(items, null, 2));
        console.log(`✅ Archivo generado: ./data/editable_items.json (${items.length} ítems)`);
        console.log('💡 Ahora puedes cambiar el "name" o el "icon" en este JSON.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error exportando:', err);
        process.exit(1);
    }
}

exportMapping();
