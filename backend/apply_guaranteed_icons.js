import { query } from './db.js';

async function fixBrokenIcons() {
    console.log('Reparando iconos faltantes con SVGs garantizados...');
    
    const fixes = {
        'Redstone Chaqueta del Aldeano': 'robe',
        'Tierra Soportes de Johnny Cage': 'chelsea-boot',
        'Tabardo de Solaire': 'cultist',
        'Peto del Ender Dragon': 'breastplate',
        'Peto Encantado': 'chest-armor',
        'Muspelheim Brazares de Kratos': 'bracers',
        'Soportes del Wither': 'robot-leg',
        'Garras de Raiden': 'claws',
        'Espadón del Abismo': 'broadsword',
        'Grebas del Caballero Alaba': 'leg',
        'Coraza del Gran Maestro': 'metal-plate',
        'Casco de Caos': 'heavy-helm',
        'Casco Divino': 'spartan-helmet',
        'Obsidiana Cofia del Ender Dragon': 'hood',
        'Outworld Hombreras de Johnny Cage': 'shoulder-armor',
        'Infierno Kunai de Shao Kahn': 'blade-drag',
        'Espada Divino': 'gladius',
        'Aura de Pascua': 'party-popper',
        'Sacrificial Altar': 'gem-pendant',
        'Digital Storm': 'polar-star',
        'Void Knight': 'crystal-bars',
        'Event Horizon': 'star-medal',
        'Cosmic Nebula': 'gem-pendant',
        'Easter Celebration': 'present',
        'Rabbit Slayer': 'gladius',
        'Arcane Master': 'wizard-face',
        'Mana Surge': 'bubbling-flask',
        'Ronin.exe': 'bandana',
        'Digital Katana': 'broadsword',
        'Neo Tokyo': 'sunglasses',
        'BLOOD GOD': 'insect-jaws',
        'Abyssal Portal': 'cowl',
        'Dragonborn': 'dragon-head',
        'Lava Core': 'frostfire', // Close enough for elemental
        'Inferno': 'frostfire',
        'Synthetix': 'robot-leg',
        'Prismatic Aura': 'star-medal',
        'Crimson Tide': 'blade-drag'
    };

    try {
        await query('BEGIN');
        let count = 0;
        
        // Asignar los iconos fijados explícitamente
        for (const [name, slug] of Object.entries(fixes)) {
            await query("UPDATE items SET svg_key = $1 WHERE name = $2", [`gi:${slug}`, name]);
            count++;
        }

        // Además, buscar cualquier otro que pueda seguir roto y asignarle uno por defecto
        const res = await query("SELECT id, name FROM items WHERE svg_key IS NULL");
        for (const row of res.rows) {
            await query("UPDATE items SET svg_key = 'gi:star-medal' WHERE id = $1", [row.id]);
            count++;
        }

        await query('COMMIT');
        console.log(`✅ ${count} iconos arreglados exitosamente.`);
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error(err);
        process.exit(1);
    }
}

fixBrokenIcons();
