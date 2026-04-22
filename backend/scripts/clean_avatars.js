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
    
    // 1. Process anything that looks like an avatar (avatar_N.png, avatar_N.webp, or the messy ones in mapping)
    const match = file.match(/^avatar_(\d+)\.(png|webp)$/);
    const index = match ? match[1] : mapping[file];
    
    if (index) {
      const targetPath = path.join(avatarsDir, `avatar_${index}.webp`);
      const tempPath = path.join(avatarsDir, `temp_avatar_${index}.webp`);
      
      console.log(`Re-compressing: ${file} -> avatar_${index}.webp`);
      
      try {
        await sharp(filePath).resize(128, 128, { fit: 'cover' }).webp({ quality: 80 }).toFile(tempPath);
        
        // Remove original and rename temp
        setTimeout(() => {
            try { 
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath); 
                fs.renameSync(tempPath, targetPath);
            } catch(e){}
        }, 200);
      } catch (err) { console.error(`Error processing ${file}:`, err); }
    } 
    // 2. Clean up everything else that isn't a final .webp or is a messy named duplicate
    else if (!file.startsWith('avatar_') || file.includes('preview') || file.includes('thumbnail')) {
        console.log(`Cleaning up junk: ${file}`);
        try { fs.unlinkSync(filePath); } catch(e){}
    }
  }
}

processImages().catch(console.error);
