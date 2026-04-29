
import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'c:/Users/romai/Documents/GitHub/Reppy/frontend/public/images/pvp/dark_arena.gif';
const outputPath = 'c:/Users/romai/Documents/GitHub/Reppy/frontend/public/images/pvp/dark_arena.webp';

async function optimize() {
  console.log('Optimizing dark_arena.gif...');
  try {
    await sharp(inputPath, { animated: true })
      .webp({ quality: 60, effort: 6 })
      .toFile(outputPath);
    
    const oldSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    console.log(`Success!`);
    console.log(`Old size: ${(oldSize / 1024).toFixed(2)} KB`);
    console.log(`New size: ${(newSize / 1024).toFixed(2)} KB`);
    console.log(`Reduction: ${((1 - newSize / oldSize) * 100).toFixed(2)}%`);
  } catch (e) {
    console.error('Failed to optimize:', e.message);
  }
}

optimize();
