import { query } from './db.js';
import fs from 'fs';

async function importChanges() {
    console.log('📥 Sincronizando cambios desde editable_items.json a la base de datos...');
    try {
        const data = JSON.parse(fs.readFileSync('./data/editable_items.json', 'utf8'));
        
        await query('BEGIN');
        
        for (const item of data) {
            await query(
                'UPDATE items SET name = $1, svg_key = $2 WHERE id = $3',
                [item.name, item.icon, item.id]
            );
        }
        
        await query('COMMIT');
        console.log(`✅ Sincronización completada. Se han actualizado ${data.length} ítems.`);
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error('❌ Error importando cambios:', err);
        process.exit(1);
    }
}

importChanges();
