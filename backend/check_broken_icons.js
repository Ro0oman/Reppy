import { query } from './db.js';
import fs from 'fs';
import path from 'path';

const ICONS_DIR = 'c:/Users/romai/Documents/GitHub/Reppy/frontend/public/game-icons';

async function checkBrokenIcons() {
    try {
        const res = await query("SELECT id, name, svg_key FROM items WHERE svg_key LIKE 'gi:%'");
        const broken = [];
        
        for (const row of res.rows) {
            const slug = row.svg_key.substring(3);
            const file = path.join(ICONS_DIR, `${slug}.svg`);
            if (!fs.existsSync(file)) {
                broken.push({ id: row.id, name: row.name, slug });
            }
        }
        
        console.log('Broken icons:', broken);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBrokenIcons();
