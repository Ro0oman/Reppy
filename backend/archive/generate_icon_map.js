import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/romai/Documents/GitHub/Reppy/frontend/public/game-icons';
const outputFile = 'c:/Users/romai/Documents/GitHub/Reppy/backend/data/game-icons.json';

async function generateJson() {
    console.log('📊 Generando mapa de iconos...');
    
    if (!fs.existsSync(path.dirname(outputFile))) {
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }

    const files = fs.readdirSync(dir);
    const result = {
        head: [],
        weapon: [],
        armor: [],
        boots: [],
        consumable: [],
        other: []
    };

    const keywords = {
        head: ['helmet', 'helm', 'mask', 'crown', 'hood', 'hat', 'cap', 'head', 'visored', 'barbute', 'tiara'],
        weapon: ['sword', 'blade', 'axe', 'mace', 'hammer', 'spear', 'bow', 'arrow', 'dagger', 'katana', 'saber', 'scimitar', 'halberd', 'weapon', 'flail', 'trident', 'rapier', 'kunai', 'shuriken'],
        armor: ['armor', 'plate', 'mail', 'breastplate', 'robe', 'tunic', 'vest', 'cuirass', 'brigandine', 'lamellar', 'gauntlet', 'bracer'],
        boots: ['boot', 'sandal', 'leg', 'foot', 'clog', 'shoe'],
        consumable: ['potion', 'bottle', 'flask', 'apple', 'bread', 'meat', 'glass', 'pill', 'food', 'drink', 'vial', 'fruit', 'potion', 'elixir', 'wine', 'beer', 'coffee', 'liquid', 'beaker', 'flask', 'juice', 'energy-drink', 'jelly', 'syrup', 'tonic']
    };

    for (const file of files) {
        if (file.endsWith('.svg')) {
            const slug = file.replace('.svg', '');
            const name = slug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            let categorized = false;
            for (const [cat, keys] of Object.entries(keywords)) {
                if (keys.some(k => slug.toLowerCase().includes(k))) {
                    result[cat].push({ slug, name });
                    categorized = true;
                    break;
                }
            }
            
            if (!categorized) {
                result.other.push({ slug, name });
            }
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log(`✅ JSON categorizado generado en ${outputFile}`);
    console.log(`📊 Estadísticas: Head: ${result.head.length}, Weapon: ${result.weapon.length}, Armor: ${result.armor.length}, Boots: ${result.boots.length}, Consumable: ${result.consumable.length}, Other: ${result.other.length}`);
}

generateJson();
