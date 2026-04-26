import { query } from './db.js';
import fs from 'fs';
import path from 'path';

const ICONS_DIR = 'c:/Users/romai/Documents/GitHub/Reppy/frontend/public/game-icons';
const JSON_PATH = 'c:/Users/romai/Documents/GitHub/Reppy/backend/data/game-icons.json';

async function cleanUnusedIcons() {
    console.log('🧹 Analizando uso de SVGs en la base de datos...');
    
    try {
        // Obtener todos los svg_key usados actualmente en cualquier item
        const res = await query('SELECT DISTINCT svg_key FROM items WHERE svg_key IS NOT NULL AND svg_key LIKE \'gi:%\'');
        
        // Extraer los nombres de archivo (ej. gi:barbute -> barbute.svg)
        const usedSlugs = new Set();
        res.rows.forEach(row => {
            const slug = row.svg_key.substring(3); // quitar 'gi:'
            usedSlugs.add(`${slug}.svg`);
        });

        // Asegurar que guardamos mc-creeper.svg si existe (ya que lo creamos manualmente)
        usedSlugs.add('mc-creeper.svg');

        console.log(`📊 Se han encontrado ${usedSlugs.size} iconos distintos en uso en la tienda.`);

        // Leer todos los archivos del directorio
        const allFiles = fs.readdirSync(ICONS_DIR);
        let deletedCount = 0;
        const keptIcons = [];

        for (const file of allFiles) {
            if (file.endsWith('.svg')) {
                if (!usedSlugs.has(file)) {
                    // Borrar el SVG si no está en la lista de usados
                    fs.unlinkSync(path.join(ICONS_DIR, file));
                    deletedCount++;
                } else {
                    // Guardar para el nuevo JSON
                    const slug = file.replace('.svg', '');
                    const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    keptIcons.push({ slug, name });
                }
            }
        }

        console.log(`🗑️ Se han eliminado ${deletedCount} archivos SVG que no se estaban utilizando.`);
        
        // Actualizar el game-icons.json para que las futuras expansiones
        // de la armería solo usen los iconos que realmente existen.
        const newJsonData = {
            head: [], weapon: [], armor: [], boots: [], consumable: [], other: []
        };
        
        // Asignar rápidamente todos a "other" ya que son pocos, o podemos mantener la categorización
        keptIcons.forEach(icon => {
            newJsonData.other.push(icon);
        });

        fs.writeFileSync(JSON_PATH, JSON.stringify(newJsonData, null, 2));
        console.log('📝 Archivo game-icons.json actualizado para reflejar la librería reducida.');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error limpiando iconos:', err);
        process.exit(1);
    }
}

cleanUnusedIcons();
