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
        adjectives: ['del No Muerto', 'del Caballero Alaba', 'de Solaire', 'de Artorias', 'de Havel', 'del Gran Maestro', 'del Cazador de Dragones'],
        lore: {
            common: {
                head: 'Un casco de hierro simple. Protege lo justo mientras aprendes la técnica.',
                weapon: 'Una herramienta robusta. Ideal para tus primeros levantamientos en Lordran.',
                armor: 'Capa protectora estándar. Evita los roces innecesarios con el equipo de gimnasio.',
                boots: 'Calzado básico. Proporciona el agarre necesario para no resbalar en el barro.',
                consumable: 'Un vial refrescante que ayuda a recuperar el aliento tras una serie corta.'
            },
            epic: {
                head: 'Oculta las ojeras de las sesiones de cardio nocturnas bajo un metal forjado en hogueras.',
                weapon: 'Tan pesado que simplemente sostenerlo cuenta como una serie de press militar al fallo.',
                armor: 'Protege contra el catabolismo y los golpes de las mancuernas que se caen por descuido.',
                boots: 'Estabilidad de hierro para que tus pies no se muevan ni un milímetro en sentadillas pesadas.',
                consumable: 'Regeneración muscular imbuida en esencia de alma. No pierdas la humanidad tras el leg day.'
            }
        }
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
        adjectives: ['de Diamante', 'de Hierro', 'de Oro', 'del Ender Dragon', 'del Wither', 'del Aldeano', 'del Creepers'],
        lore: {
            common: {
                head: 'Un casco cuadrado. Protege tu cabeza de bloques de baja densidad.',
                weapon: 'Una herramienta de madera o piedra para empezar a picar tus primeros récords.',
                armor: 'Peto de cuero. Flexible y ligero para tus primeros movimientos de calistenia.',
                boots: 'Botas sencillas. Te mantienen en pie mientras exploras el mundo del fitness.',
                consumable: 'Una manzana roja básica. Aporta la glucosa necesaria para no desmayarte.'
            },
            epic: {
                head: 'Protección modular contra bloques de peso que caen. Resistente al sudor de 8-bits.',
                weapon: 'Ideal para picar récords personales y romper las barreras del estancamiento físico.',
                armor: 'Encantado con Irrompibilidad III. Tus fibras musculares se vuelven tan densas como la obsidiana.',
                boots: 'Soporte absoluto. Evita el retroceso cuando empujas cargas máximas en la jaula.',
                consumable: 'Un pre-entreno cuadrado que te da la energía necesaria para construir un imperio de gains.'
            }
        }
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
        adjectives: ['de Scorpion', 'de Sub-Zero', 'de Raiden', 'de Shao Kahn', 'de Kitana', 'de Liu Kang', 'de Johnny Cage'],
        lore: {
            common: {
                head: 'Una cinta de combate básica. Mantiene el sudor lejos de tus ojos durante el sparring.',
                weapon: 'Un arma de práctica. Ideal para aprender los combos básicos de musculación.',
                armor: 'Chaleco de tela resistente. Permite moverte con agilidad en tus primeros circuitos.',
                boots: 'Calzado ligero. Proporciona la tracción justa para tus primeros saltos.',
                consumable: 'Un tónico revitalizante. Ayuda a calmar los nervios antes de tu primera sesión.'
            },
            epic: {
                head: 'Diseñada para controlar la respiración anaeróbica en los AMRAP más sangrientos.',
                weapon: 'Precisión quirúrgica. Cada movimiento corta el aire y define cada fibra de tu cuerpo.',
                armor: 'Flexibilidad de Outworld. Permite muscle-ups explosivos sin restricciones en las costuras.',
                boots: 'Agilidad sobrenatural. Tus burpees serán tan rápidos que parecerá que te teletransportas.',
                consumable: 'Esencia vital concentrada. Acaba con el agotamiento antes de que él acabe contigo. ¡FINISH IT!'
            }
        }
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
        adjectives: ['de Leviatán', 'de Caos', 'de Valquiria', 'de Kratos', 'de Atreus', 'de Freya', 'de Odín'],
        lore: {
            common: {
                head: 'Una diadema sencilla. Te hace sentir un poco más disciplinado cada mañana.',
                weapon: 'Un hacha de entrenamiento. Forjada para quienes empiezan su viaje hacia el Olimpo.',
                armor: 'Coraza de cuero reforzado. Protege tu torso mientras construyes tu propia leyenda.',
                boots: 'Sandalias de cuero. Cómodas para tus primeros pasos en el camino del guerrero.',
                consumable: 'Un fruto silvestre de Midgard. Endulza el amargor de tus primeras agujetas.'
            },
            epic: {
                head: 'Un aura de disciplina espartana que te obliga a completar cada repetición con honor.',
                weapon: 'Imbuida con el frío de las duchas heladas. Congela el dolor para que sigas tirando.',
                armor: 'Cicatrices de mil batallas contra la gravedad. Hecha para aguantar el peso de los dioses.',
                boots: 'Pasos que retumban como el trueno de Thor. Nada puede detener tu avance hacia el podio.',
                consumable: 'Suplemento prohibido por Zeus. Solo apto para quienes buscan un físico de deidad nórdica.'
            }
        }
    }
};

const rarities = ['common', 'rare', 'especial', 'legendary', 'calistenico'];
const categories = ['head', 'weapon', 'armor', 'boots', 'consumable'];

async function expand() {
    console.log('🚀 Iniciando expansión definitiva de la Armería con Lore Dinámico...');

    try {
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
                        const mainStat = statKeys[Math.floor(Math.random() * statKeys.length)];
                        stats[mainStat] = powerScale;
                        if (rarity === 'legendary' || rarity === 'calistenico') {
                            const secondStat = statKeys.find(k => k !== mainStat);
                            stats[secondStat] = Math.floor(powerScale / 2);
                            if (Math.random() > 0.5) stats.crit_chance = Math.floor(powerScale / 5);
                            else stats.crit_dmg = Math.floor(powerScale / 2);
                        }
                    }

                    const isCommon = rarity === 'common' || rarity === 'rare';
                    const loreType = isCommon ? 'common' : 'epic';
                    const loreText = theme.lore[loreType][cat];

                    const desc = loreText;
                    const price = powerScale * 150;

                    allItems.push({ name, desc, type: cat, rarity, stats, price });
                }
            }
        }

        console.log(`📦 Insertando ${allItems.length} items con lore escalado...`);
        for (const item of allItems) {
            await query(
                'INSERT INTO items (name, description, type, rarity, stats, price) VALUES ($1, $2, $3, $4, $5, $6)',
                [item.name, item.desc, item.type, item.rarity, item.stats, item.price]
            );
        }

        console.log('✅ Armería actualizada con lore coherente y escalado!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en la expansión:', err);
        process.exit(1);
    }
}

expand();
