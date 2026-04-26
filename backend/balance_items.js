import { query } from './db.js';

const statTotalByRarity = {
    'common': 2,
    'uncommon': 4,
    'rare': 7,
    'epic': 11,
    'especial': 11,
    'legendary': 16,
    'calistenico': 25
};

const priceByRarity = {
    'common': 100,
    'uncommon': 250,
    'rare': 600,
    'epic': 1500,
    'especial': 1500,
    'legendary': 5000,
    'calistenico': 15000
};

const keywords = {
    str: ['espada', 'hacha', 'maza', 'martillo', 'coraza', 'peto', 'escudo', 'guerrero', 'espartano', 'kratos', 'caos', 'sangriento', 'fuerza', 'brutal', 'pesado', 'leones', 'acero'],
    dex: ['arco', 'daga', 'kunai', 'abanico', 'lanza', 'botas', 'soportes', 'sandalias', 'grebas', 'ninja', 'scorpion', 'shao', 'aldeano', 'agilidad', 'rápido', 'viento', 'ligero'],
    int: ['túnica', 'cofia', 'capuchón', 'diadema', 'corona', 'vial', 'poción', 'elixir', 'oolacile', 'abismo', 'magia', 'gravedad', 'sabiduría', 'mente', 'hechizo', 'cristal'],
    end: ['armadura', 'placas', 'chaqueta', 'yelmo', 'casco', 'escudo', 'bedrock', 'obsidiana', 'hierro', 'netherite', 'resistencia', 'vitalidad', 'inmortal', 'hueso', 'roca']
};

const loreTemplates = {
    'dark_souls': [
        "Un vestigio de las eras del fuego, forjado en la desesperación.",
        "Aún conserva el calor de las almas que cayeron empuñándolo.",
        "Dicen que perteneció a un caballero legendario que sucumbió a la oscuridad.",
        "Su peso es un recordatorio constante de la maldición de los no muertos."
    ],
    'minecraft': [
        "Fabricado con materiales raros de dimensiones inexploradas.",
        "Su durabilidad es casi infinita; una verdadera obra maestra del crafteo.",
        "Desprende un aura que repele a las criaturas de la noche.",
        "Los aldeanos pagarían una fortuna en esmeraldas por esto."
    ],
    'mortal_kombat': [
        "Un artefacto bañado en la sangre de mil combates (Fatality no incluido).",
        "Forjado en los fosos del Netherrealm, su poder corrompe al débil.",
        "Perteneció a un campeón del torneo. Ahora, te pertenece a ti.",
        "Canaliza la fuerza pura y la brutalidad de las artes marciales."
    ],
    'god_of_war': [
        "Bendecido por los mismísimos dioses del Olimpo (o lo que queda de ellos).",
        "Rebosante de una ira espartana incontrolable.",
        "Tallado por los enanos herreros más hábiles de los nueve reinos.",
        "Su sola presencia hace temblar a las valquirias."
    ],
    'generic': [
        "Un equipo estándar pero confiable para cualquier aventurero.",
        "Forjado con maestría y listo para la batalla.",
        "Proporciona la ventaja necesaria para sobrevivir otro día.",
        "Ligero, resistente y letal en las manos adecuadas."
    ]
};

function determineTheme(name) {
    const n = name.toLowerCase();
    if (n.includes('oolacile') || n.includes('artorias') || n.includes('solaire') || n.includes('havel') || n.includes('anor londo') || n.includes('astora') || n.includes('ceniciento') || n.includes('abismo')) return 'dark_souls';
    if (n.includes('nether') || n.includes('bedrock') || n.includes('obsidiana') || n.includes('ender') || n.includes('creeper') || n.includes('aldeano') || n.includes('redstone') || n.includes('pixelado')) return 'minecraft';
    if (n.includes('scorpion') || n.includes('sub-zero') || n.includes('raiden') || n.includes('shao kahn') || n.includes('liu kang') || n.includes('johnny cage') || n.includes('outworld') || n.includes('infierno')) return 'mortal_kombat';
    if (n.includes('kratos') || n.includes('atreus') || n.includes('freya') || n.includes('odín') || n.includes('espartano') || n.includes('leviatán') || n.includes('valquiria') || n.includes('midgard') || n.includes('muspelheim') || n.includes('alfheim')) return 'god_of_war';
    return 'generic';
}

function distributeStats(name, rarity, type) {
    const totalPoints = statTotalByRarity[rarity] || 2;
    const n = name.toLowerCase();
    const stats = { str: 0, dex: 0, int: 0, end: 0 };
    
    // Asignar un "peso" a cada stat basado en el nombre y tipo
    let weights = { str: 0.1, dex: 0.1, int: 0.1, end: 0.1 }; // base weight
    
    // Bonificadores por palabras clave
    for (const [stat, words] of Object.entries(keywords)) {
        for (const word of words) {
            if (n.includes(word)) {
                weights[stat] += 2.0; // Gran bonificador si el nombre lo menciona explícitamente
            }
        }
    }
    
    // Bonificadores por tipo general
    if (type === 'weapon') { weights.str += 1.0; weights.dex += 1.0; }
    if (type === 'armor' || type === 'head') { weights.end += 1.5; }
    if (type === 'boots') { weights.dex += 1.5; }
    if (type === 'consumable') { weights.int += 1.5; } // Pociones escalan mejor con int
    
    // Distribuir los puntos matemáticamente según los pesos
    const totalWeight = weights.str + weights.dex + weights.int + weights.end;
    
    let remainingPoints = totalPoints;
    ['str', 'dex', 'int', 'end'].forEach(stat => {
        const pointsForStat = Math.floor(totalPoints * (weights[stat] / totalWeight));
        if (pointsForStat > 0) {
            stats[stat] = pointsForStat;
            remainingPoints -= pointsForStat;
        }
    });
    
    // Los puntos restantes (por redondeo) van al stat con mayor peso
    if (remainingPoints > 0) {
        let bestStat = 'str';
        let maxWeight = 0;
        ['str', 'dex', 'int', 'end'].forEach(s => {
            if (weights[s] > maxWeight) {
                maxWeight = weights[s];
                bestStat = s;
            }
        });
        stats[bestStat] = (stats[bestStat] || 0) + remainingPoints;
    }
    
    // Limpiar stats en 0
    Object.keys(stats).forEach(key => {
        if (stats[key] === 0) delete stats[key];
    });
    
    return stats;
}

function generateDescription(name, theme) {
    const templates = loreTemplates[theme];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template;
}

async function balanceItems() {
    console.log('⚖️ Iniciando Rebalanceo Perfecto de Ítems...');
    
    try {
        const res = await query("SELECT id, name, type, rarity, description FROM items WHERE type IN ('head', 'weapon', 'armor', 'boots', 'consumable')");
        const items = res.rows;
        
        await query('BEGIN');
        
        for (const item of items) {
            // 1. Calcular Stats lógicos
            const newStats = distributeStats(item.name, item.rarity, item.type);
            
            // 2. Determinar precio correcto por rareza
            const newPrice = priceByRarity[item.rarity];
            
            // 3. Generar descripción coherente
            const theme = determineTheme(item.name);
            const newDesc = generateDescription(item.name, theme);
            
            // 4. Actualizar base de datos sin tocar original_price (que se usa para ofertas)
            await query(
                'UPDATE items SET stats = $1, price = $2, description = $3 WHERE id = $4',
                [newStats, newPrice, newDesc, item.id]
            );
        }
        
        await query('COMMIT');
        console.log(`✅ Balanceo completado para ${items.length} ítems.`);
        console.log('📊 Los ítems ahora tienen stats matemáticas según su nombre y rareza.');
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error('❌ Error en el balanceo:', err);
        process.exit(1);
    }
}

balanceItems();
