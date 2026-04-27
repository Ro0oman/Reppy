
import { query } from '../backend/db.js';
import sharp from 'sharp';
import fs from 'fs';
import https from 'https';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Users/romai/Documents/GitHub/Reppy/backend/.env' });

const OUTPUT_DIR = 'c:/Users/romai/Documents/GitHub/Reppy/frontend/public/images/bosses';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download: ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    resolve();
                });
            });
            file.on('error', (err) => {
                fs.unlink(dest, () => {});
                reject(err);
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log('Fetching boss list...');
    const bosses = await query('SELECT id, name, image_url FROM boss_fights');
    
    for (const boss of bosses.rows) {
        if (!boss.image_url || !boss.image_url.startsWith('http')) {
            console.log(`Skipping boss ${boss.name} (local or empty URL)`);
            continue;
        }

        console.log(`Processing boss: ${boss.name}...`);
        const slug = boss.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const tempPath = path.join(OUTPUT_DIR, `${slug}_temp`);
        const finalPath = path.join(OUTPUT_DIR, `${slug}.webp`);
        const dbPath = `/images/bosses/${slug}.webp`;

        try {
            console.log(`  Downloading ${boss.image_url}...`);
            await downloadImage(boss.image_url, tempPath);
            
            console.log(`  Optimizing...`);
            const buffer = fs.readFileSync(tempPath);
            await sharp(buffer)
                .resize(512, 512, { fit: 'inside' })
                .webp({ quality: 75 })
                .toFile(finalPath);
            
            fs.unlinkSync(tempPath);
            
            console.log(`  Updating database...`);
            await query('UPDATE boss_fights SET image_url = $1 WHERE id = $2', [dbPath, boss.id]);
            
            const oldSize = fs.statSync(finalPath).size;
            console.log(`  Done! Saved as ${dbPath} (${(oldSize / 1024).toFixed(2)} KB)`);
        } catch (e) {
            console.error(`  Failed to process ${boss.name}:`, e.message);
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
    }
    
    console.log('All bosses processed!');
    process.exit(0);
}

run();
