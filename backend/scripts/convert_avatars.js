import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceDir = 'C:\\Users\\romai\\.gemini\\antigravity\\brain\\3d32cb06-9343-4b9b-9360-523b5461281c';
const targetDir = 'c:\\Users\\romai\\Documents\\GitHub\\Reppy\\frontend\\public\\img\\avatars';

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 7 Pixelart icons available.
// Mapping 8, 9, 10 to clones of 1, 2, 3 to keep style consistent.
const files = [
    { src: 'pixel_avatar_1_warrior_1776844411280.png', dest: 'avatar_1.webp' },
    { src: 'pixel_avatar_2_mage_1776844429197.png', dest: 'avatar_2.webp' },
    { src: 'pixel_avatar_3_rogue_1776844443677.png', dest: 'avatar_3.webp' },
    { src: 'pixel_avatar_4_paladin_1776844458331.png', dest: 'avatar_4.webp' },
    { src: 'pixel_avatar_5_ranger_1776844474238.png', dest: 'avatar_5.webp' },
    { src: 'pixel_avatar_6_necro_1776844488244.png', dest: 'avatar_6.webp' },
    { src: 'pixel_avatar_7_barbarian_1776844504363.png', dest: 'avatar_7.webp' },
    // Clones
    { src: 'pixel_avatar_1_warrior_1776844411280.png', dest: 'avatar_8.webp' },
    { src: 'pixel_avatar_2_mage_1776844429197.png', dest: 'avatar_9.webp' },
    { src: 'pixel_avatar_3_rogue_1776844443677.png', dest: 'avatar_10.webp' }
];

async function convert() {
    for (const file of files) {
        const srcPath = path.join(sourceDir, file.src);
        const destPath = path.join(targetDir, file.dest);
        
        if (fs.existsSync(srcPath)) {
            console.log(`Converting ${file.src} to ${file.dest}...`);
            await sharp(srcPath)
                .resize(128, 128)
                .webp({ quality: 85 })
                .toFile(destPath);
            console.log(`Done: ${destPath}`);
        } else {
            console.warn(`File not found: ${srcPath}`);
        }
    }
}

convert().catch(console.error);
