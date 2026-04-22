import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:\\Users\\romai\\.gemini\\antigravity\\brain\\3d32cb06-9343-4b9b-9360-523b5461281c';
const targetDir = 'c:\\Users\\romai\\Documents\\GitHub\\Reppy\\frontend\\public\\img\\avatars';

const originalIcons = [
    'avatar_1_warrior_1776844045199.png',
    'avatar_2_mage_1776844063267.png',
    'avatar_3_rogue_1776844078934.png',
    'avatar_4_paladin_1776844115463.png',
    'avatar_5_ranger_archer_1776844133051.png',
    'avatar_6_necromancer_1776844147094.png',
    'avatar_7_barbarian_1776844167724.png',
    'avatar_8_monk_1776844182639.png',
    'avatar_9_druid_1776844199183.png',
    'avatar_10_valkyrie_1776844218340.png'
];

async function restoreOriginals() {
    console.log('Restoring 10 original icons to slots 31-40...');
    for (let i = 0; i < originalIcons.length; i++) {
        const srcPath = path.join(artifactsDir, originalIcons[i]);
        const destPath = path.join(targetDir, `avatar_${31 + i}.webp`);
        
        await sharp(srcPath)
            .resize(128, 128, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(destPath);
        
        console.log(`Restored: ${originalIcons[i]} -> avatar_${31 + i}.webp`);
    }
}

restoreOriginals().catch(console.error);
