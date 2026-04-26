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

// Configuración específica de consumibles
const potionConfig = {
    "Vial de Energía Básica": {
        stat: "dex", // Energía = Agilidad/Velocidad
        desc: "Un brebaje efervescente que acelera el ritmo cardíaco. Ideal para largas sesiones de cardio y aumentar la agilidad."
    },
    "Elixir de Resistencia": {
        stat: "end", // Resistencia = Endurance
        desc: "Líquido espeso que endurece la piel y los músculos. Perfecto para aguantar entrenamientos de alta intensidad sin ceder."
    },
    "Esencia de Guerrero": {
        stat: "str", // Guerrero = Fuerza
        desc: "Sangre destilada de campeones antiguos. Al beberla, sientes una fuerza bruta e incontrolable fluir por tus venas."
    },
    "Protocolo de Gravedad Zero": {
        stat: "dex", // Gravedad Zero = Agilidad/Ligereza
        desc: "Nanotecnología líquida que anula parcialmente tu masa corporal. Te sientes ligero como una pluma, maximizando tu destreza."
    },
    "Ambrosía del Olimpo": {
        stat: "all", // Ambrosía = Todos los stats (Equilibrado)
        desc: "El néctar de los mismísimos dioses. Restaura el cuerpo y la mente, otorgando un poder absoluto y equilibrado."
    }
};

async function balanceConsumables() {
    console.log('🧪 Iniciando Balanceo Fino de Pociones y Consumibles...');
    
    try {
        const res = await query("SELECT id, name, rarity FROM items WHERE type = 'consumable'");
        const items = res.rows;
        
        await query('BEGIN');
        
        for (const item of items) {
            const config = potionConfig[item.name];
            if (!config) {
                console.warn(`⚠️ Poción desconocida: ${item.name}`);
                continue;
            }
            
            const totalPoints = statTotalByRarity[item.rarity] || 2;
            let newStats = {};
            
            if (config.stat === 'all') {
                // Distribuir equitativamente
                const base = Math.floor(totalPoints / 4);
                let remainder = totalPoints % 4;
                newStats = { str: base, dex: base, int: base, end: base };
                
                // Repartir el resto
                const statsArray = ['str', 'dex', 'int', 'end'];
                for (let i = 0; i < remainder; i++) {
                    newStats[statsArray[i]] += 1;
                }
                
                // Limpiar ceros
                Object.keys(newStats).forEach(k => {
                    if (newStats[k] === 0) delete newStats[k];
                });
            } else {
                newStats[config.stat] = totalPoints;
            }
            
            await query(
                'UPDATE items SET stats = $1, description = $2 WHERE id = $3',
                [newStats, config.desc, item.id]
            );
        }
        
        await query('COMMIT');
        console.log(`✅ ¡Pociones rebalanceadas con éxito! Procesadas: ${items.length}`);
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error('❌ Error en pociones:', err);
        process.exit(1);
    }
}

balanceConsumables();
