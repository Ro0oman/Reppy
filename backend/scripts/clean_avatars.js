import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const avatarsDir = 'c:\\Users\\romai\\Documents\\GitHub\\Reppy\\frontend\\public\\img\\avatars';

// Mapping: filename to avatar index
const mapping = {
  // Dark Souls
  'dark-souls-artorias-of-the-abyss-armour-drawing-fan-art-dark-souls-thumbnail-removebg-preview.png': 1,
  '417-4174592_dark-souls-solaire-transparent-png-solaire-dark-souls.png': 2,
  
  // Mortal Kombat
  '516-5166278_thumb-image-scorpion-mortal-kombat-x-png-transparent.png': 3,
  '481-4815477_thumb-image-sub-zero-mortal-kombat-characters-hd.png': 4,
  
  // Minecraft
  'steve-of-minecraft-png-clipart-thumbnail-removebg-preview.png': 5,
  'Creeper_(Minecraft).png': 6,
  
  // God of War
  'Portrait.kratos.png': 7,
  
  // Elden Ring
  'Malenia_la_Cercenada.webp': 10,
  
  // Bloodborne
  'Hunter34r5trfg.webp': 11,
  
  // Witcher
  'Rivyalı_Geralt.png': 14,
  
  // Halo
  'Master_Chief_-_Outfit_-_Fortnite.webp': 16,
  
  // Doom
  'Portrait.doomslayer.png': 17,
  
  // RDR2
  'arthur-morgan-rugged-cowboy-in-western-style-cLTXR9Cv_t-removebg-preview.png': 27,
  
  // The Last of Us
  'ellie_the_last_of_us_2013.webp': 28,
  'joel_miller_2013.webp': 29
};

async function processImages() {
  const files = fs.readdirSync(avatarsDir);
  
  for (const file of files) {
    const filePath = path.join(avatarsDir, file);
    
    // 1. Process specific mappings
    if (mapping[file]) {
      const index = mapping[file];
      const targetPath = path.join(avatarsDir, `avatar_${index}.webp`);
      console.log(`Processing: ${file} -> avatar_${index}.webp`);
      
      try {
        await sharp(filePath).resize(128, 128, { fit: 'cover' }).webp({ quality: 80 }).toFile(targetPath);
        setTimeout(() => { try { fs.unlinkSync(filePath); } catch(e){} }, 100);
      } catch (err) { console.error(`Error processing ${file}:`, err); }
    } 
    // 2. Convert remaining placeholder PNGs to WebP for consistency
    else if (file.startsWith('avatar_') && file.endsWith('.png')) {
      const index = file.match(/\d+/)[0];
      const targetPath = path.join(avatarsDir, `avatar_${index}.webp`);
      if (!fs.existsSync(targetPath)) {
          console.log(`Converting placeholder: ${file} -> WebP`);
          await sharp(filePath).webp({ quality: 50 }).toFile(targetPath);
      }
      try { fs.unlinkSync(filePath); } catch(e){}
    }
    // 3. Clean up junk
    else if (file.includes('thumbnail') || file.includes('preview') || file.includes('removebg') || (file.endsWith('.jpg') && !file.startsWith('avatar_'))) {
        console.log(`Cleaning up leftover fragment: ${file}`);
        try { fs.unlinkSync(filePath); } catch(e){}
    }
  }
}

processImages().catch(console.error);
