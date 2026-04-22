import { query } from './db.js';

const themes = {
    'Dark Souls': {
        prefixes: ['Maldito', 'Ceniciento', 'de Lordran', 'de Catarina', 'de Astora', 'de Anor Londo', 'de Oolacile', 'del Abismo', 'de Dragón', 'del Sol'],
        nouns: {
            head: ['Yelmo', 'Máscara', 'Capucha', 'Corona', 'Testa'],
            weapon: ['Espadón', 'Estoc', 'Maza', 'Lanza', 'Daga'],
            armor: ['Coraza', 'Peto', 'Cota', 'Túnica', 'Tabardo'],
            boots: ['Grebas', 'Botas', 'Polainas', 'Espinilleras', 'Calzado'],
            consumable: ['Frasco', 'Alma', 'Resina', 'Humanidad', 'Liquen']
        },
        adjectives: ['del No Muerto', 'del Caballero Alaba', 'de Solaire', 'de Artorias', 'de Havel', 'del Gran Maestro', 'del Cazador de Dragones']
    },
    'Minecraft': {
        prefixes: ['Pixelado', 'de Netherite', 'de Redstone', 'Crafteado', 'del Overworld', 'del End', 'del Nether', 'Encantado', 'de Obsidiana', 'de Bedrock'],
        nouns: {
            head: ['Casco', 'Gorro', 'Cofia', 'Capuchón', 'Frontal'],
            weapon: ['Espada', 'Hacha', 'Pico', 'Azada', 'Arco'],
            armor: ['Peto', 'Coraza', 'Chaqueta', 'Placas', 'Túnica'],
            boots: ['Botas', 'Calzado', 'Protección', 'Pies', 'Soportes'],
            consumable: ['Poción', 'Manzana', 'Pan', 'Guisado', 'Frasco']
        },
        adjectives: ['de Diamante', 'de Hierro', 'de Oro', 'del Ender Dragon', 'del Wither', 'del Aldeano', 'del Creepers']
    },
    'Mortal Kombat': {
        prefixes: ['Fatal', 'Sangriento', 'de Outworld', 'de la Tierra', 'del Infierno', 'del Trueno', 'de Escarcha', 'de la Sombra', 'de Almas', 'de Combate'],
        nouns: {
            head: ['Máscara', 'Protector', 'Capucha', 'Cinta', 'Casco'],
            weapon: ['Kunai', 'Sable', 'Gancho', 'Abanico', 'Garras'],
            armor: ['Traje', 'Uniforme', 'Coraza', 'Chaleco', 'Hombreras'],
            boots: ['Grebas', 'Botas', 'Shinguards', 'Calzado', 'Soportes'],
            consumable: ['Elixir', 'Esencia', 'Vial', 'Tónico', 'Pócima']
        },
        adjectives: ['de Scorpion', 'de Sub-Zero', 'de Raiden', 'de Shao Kahn', 'de Kitana', 'de Liu Kang', 'de Johnny Cage']
    },
    'God of War': {
        prefixes: ['Divino', 'Espartano', 'de Midgard', 'de Asgard', 'de los Gigantes', 'de Helheim', 'de Muspelheim', 'de Alfheim', 'de Vanaheim', 'de Jotunheim'],
        nouns: {
            head: ['Corona', 'Diadema', 'Yelmo', 'Casco', 'Frontal'],
            weapon: ['Hacha', 'Espada', 'Escudo', 'Maza', 'Lanza'],
            armor: ['Hombreras', 'Coraza', 'Peto', 'Brazares', 'Armadura'],
            boots: ['Sandalias', 'Botas', 'Grebas', 'Calzado', 'Soportes'],
            consumable: ['Fruto', 'Sangre', 'Vial', 'Ambrosía', 'Néctar']
        },
        adjectives: ['de Leviatán', 'de Caos', 'de Valquiria', 'de Kratos', 'de Atreus', 'de Freya', 'de Odín']
    }
};

const rarities = ['common', 'rare', 'especial', 'legendary', 'calistenico'];
const categories = ['head', 'weapon', 'armor', 'boots', 'consumable'];

async function expand() {
    console.log('🚀 Iniciando expansión definitiva de la Armería (Sin duplicados)...');

    try {
        // 1. Limpiar items de equipo previos para evitar errores de nombres duplicados
        console.log('🧹 Limpiando equipo antiguo...');
        await query('DELETE FROM items WHERE type IN (\'head\', \'weapon\', \'armor\', \'boots\', \'consumable\')');

        const allItems = [];
        const usedNames = new Set();

        for (const cat of categories) {
            for (const rarity of rarities) {
                for (let i = 0; i < 5; i++) {
                    const themeKeys = Object.keys(themes);
                    const themeName = themeKeys[Math.floor(Math.random() * themeKeys.length)];
                    const theme = themes[themeName];

                    let name = '';
                    let attempts = 0;
                    while (attempts < 50) {
                        const prefix = theme.prefixes[Math.floor(Math.random() * theme.prefixes.length)];
                        const noun = theme.nouns[cat][Math.floor(Math.random() * theme.nouns[cat].length)];
                        const adj = theme.adjectives[Math.floor(Math.random() * theme.adjectives.length)];
                        
                        // Combinaciones aleatorias para asegurar variedad
                        const coin = Math.random();
                        if (coin < 0.33) name = `${noun} ${prefix}`;
                        else if (coin < 0.66) name = `${noun} ${adj}`;
                        else name = `${prefix} ${noun} ${adj}`;

                        if (!usedNames.has(name)) {
                            usedNames.add(name);
                            break;
                        }
                        attempts++;
                    }

                    const powerScale = { common: 2, rare: 5, especial: 10, legendary: 25, calistenico: 55 }[rarity];
                    let stats = {};
                    const statKeys = ['str', 'dex', 'end', 'vig', 'int', 'fth', 'cha'];
                    
                    if (cat === 'consumable') {
                        stats = { 
                            duration: (powerScale * 600), 
                            multiplier: 1 + (powerScale * 0.05) 
                        };
                    } else {
                        // Focus stat
                        const mainStat = statKeys[Math.floor(Math.random() * statKeys.length)];
                        stats[mainStat] = powerScale;
                        
                        // Flavor stats
                        if (rarity === 'legendary' || rarity === 'calistenico') {
                            const secondStat = statKeys.find(k => k !== mainStat);
                            stats[secondStat] = Math.floor(powerScale / 2);
                            
                            // Random "crit" style stats
                            if (Math.random() > 0.5) stats.crit_chance = Math.floor(powerScale / 5);
                            else stats.crit_dmg = Math.floor(powerScale / 2);
                        }
                    }

                    const desc = `Objeto legendario del universo ${themeName}. Imbuido con el poder de ${rarity}.`;
                    const price = powerScale * 150;

                    allItems.push({ name, desc, type: cat, rarity, stats, price });
                }
            }
        }

        console.log(`📦 Insertando ${allItems.length} items únicos...`);
        for (const item of allItems) {
            await query(
                'INSERT INTO items (name, description, type, rarity, stats, price) VALUES ($1, $2, $3, $4, $5, $6)',
                [item.name, item.desc, item.type, item.rarity, item.stats, item.price]
            );
        }

        console.log('✅ Armería expandida con éxito y nombres limpios!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en la expansión:', err);
        process.exit(1);
    }
}

expand();
