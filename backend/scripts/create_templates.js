import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const targetDir = 'c:\\Users\\romai\\Documents\\GitHub\\Reppy\\frontend\\public\\img\\avatars';

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

async function createTemplates() {
    console.log(`Generating 30 PNG templates in ${targetDir}...`);
    for (let i = 1; i <= 30; i++) {
        const destPath = path.join(targetDir, `avatar_${i}.png`);
        
        // Create a 128x128 placeholder with a semi-transparent dark background
        // and a small border so the user can see the slots in the grid.
        await sharp({
            create: {
                width: 128,
                height: 128,
                channels: 4,
                background: { r: 30, g: 30, b: 30, alpha: 0.5 }
            }
        })
        .png()
        .toFile(destPath);
        
        console.log(`Created: avatar_${i}.png`);
    }
}

createTemplates().catch(console.error);
