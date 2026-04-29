
import sharp from 'sharp';
import fs from 'fs';

const images = [
  'default.gif',
  'forest_temple.gif',
  'steel_dungeon.gif',
  'neon_gym.gif',
  'dark_arena.gif'
];

async function optimize() {
  for (const img of images) {
    const inputPath = `c:/Users/romai/Documents/GitHub/Reppy/frontend/public/images/pvp/${img}`;
    const outputPath = inputPath.replace('.gif', '.webp');
    console.log(`Optimizing ${img}...`);
    try {
      await sharp(inputPath, { animated: true })
        .webp({ quality: 50, effort: 6, smartSubsample: true })
        .toFile(outputPath);
      
      const oldSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      console.log(`Success! Old: ${(oldSize / 1024).toFixed(2)} KB, New: ${(newSize / 1024).toFixed(2)} KB (${((1 - newSize / oldSize) * 100).toFixed(2)}% reduction)`);
    } catch (e) {
      console.error(`Failed to optimize ${img}:`, e.message);
    }
  }
}

optimize();
