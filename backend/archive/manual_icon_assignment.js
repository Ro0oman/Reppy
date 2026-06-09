import { query } from './db.js';
import fs from 'fs';

const manualMapping = {
    // HEAD
    "Máscara de Oolacile": "ninja-mask",
    "Diadema de Leviatán": "jeweled-chalice",
    "Corona de Dragón": "crown",
    "Capuchón del Aldeano": "hood",
    "Diadema de Muspelheim": "jeweled-chalice",
    "Casco del Ender Dragon": "dragon-head",
    "Casco de Asesino de Dragones": "spartan-helmet",
    "Escarcha Casco de Sub-Zero": "ninja-mask",
    "Pixelado Cofia de Hierro": "helmet",
    "Casco Espartano": "spartan-helmet",
    "Catarina Yelmo de Artorias": "closed-barbute",
    "Cinta del Infierno": "ninja-mask",
    "Protector de Scorpion": "ninja-mask",
    "Yelmo de Muspelheim": "heavy-helm",
    "Casco del Creepers": "pointy-hat",
    "Casco de Liu Kang": "ninja-mask",
    "Frontal de Muspelheim": "helmet",
    "Obsidiana Cofia del Ender Dragon": "hood",
    "Crafteado Cofia de Diamante": "hood",
    "Yelmo de Anor Londo": "barbute",
    "Diadema de Atreus": "jeweled-chalice",
    "Fatal Casco de Johnny Cage": "sunglasses",
    "Casco de Caos": "visored-helmet",
    "Casco Divino": "roman-helmet",
    "Obsidiana Capuchón de Diamante": "hood",

    // ARMOR
    "Maldito Coraza del Gran Maestro": "breastplate",
    "Placas del End": "metal-plate",
    "Chaqueta de Redstone": "leather-armor",
    "Midgard Brazares de Atreus": "bracers",
    "Almas Coraza de Scorpion": "ninja-armor",
    "Pixelado Chaqueta del Creepers": "robe",
    "Túnica del Cazador de Dragones": "robe",
    "Redstone Chaqueta del Aldeano": "robe",
    "Obsidiana Peto de Oro": "breastplate",
    "Infierno Hombreras de Raiden": "shoulder-armor",
    "Túnica del Nether": "robe",
    "Bedrock Túnica del Wither": "robe",
    "Tierra Hombreras de Shao Kahn": "spiked-armor",
    "Coraza del Gran Maestro": "breastplate",
    "Chaqueta del End": "robe",
    "Outworld Hombreras de Johnny Cage": "chest-armor",
    "Outworld Coraza de Liu Kang": "ninja-armor",
    "Dragón Cota de Solaire": "chain-mail",
    "Coraza de Obsidiana": "breastplate",
    "Tabardo de Solaire": "robe",
    "Armadura de Vanaheim": "leather-armor",
    "Peto del Ender Dragon": "breastplate",
    "Peto Encantado": "breastplate",
    "Chaleco de Liu Kang": "leather-armor",
    "Muspelheim Brazares de Kratos": "bracers",

    // WEAPONS
    "End Espada del Aldeano": "broadsword",
    "Arco del Aldeano": "bow-arrow",
    "Lanza de Solaire": "spear-feather",
    "Espadón del Gran Maestro": "broadsword",
    "Abanico de Liu Kang": "sword-spin",
    "Lanza de Freya": "spear-hook",
    "Azada Pixelado": "pitchfork",
    "Escudo de Alfheim": "round-shield",
    "Overworld Azada de Oro": "pitchfork",
    "Jotunheim Lanza de Freya": "halberd",
    "Espadón del Abismo": "broadsword",
    "Espada Espartano": "gladius",
    "Abanico de Outworld": "sword-spin",
    "Maldito Maza del Cazador de Dragones": "mace-head",
    "Escudo de Helheim": "round-shield",
    "Infierno Kunai de Shao Kahn": "crossed-swords",
    "Maza del Abismo": "flail",
    "Hacha de Midgard": "battle-axe",
    "Maza de Atreus": "warhammer",
    "Maza de Artorias": "mace-head",
    "Lanza de Astora": "spear-feather",
    "Garras de Raiden": "steel-claws",
    "Garras de Escarcha": "claws",
    "Espada Divino": "sword-blade",
    "Helheim Hacha de Kratos": "tomahawk",

    // BOOTS
    "Espartano Soportes de Valquiria": "leg-armor",
    "Grebas de Liu Kang": "leg-armor",
    "Botas del No Muerto": "boots",
    "Calzado de Johnny Cage": "running-shoe",
    "Soportes de Vanaheim": "leather-boot",
    "Calzado del Abismo": "armored-pants",
    "Botas de Caos": "boots",
    "Sandalias de Freya": "sandal",
    "Netherite Soportes de Hierro": "steeltoe-boots",
    "Botas de Almas": "walking-boot",
    "Botas de Escarcha": "boots",
    "Espinilleras de Oolacile": "greaves",
    "Soportes de Odín": "leg-armor",
    "Polainas de Havel": "leg-armor",
    "Tierra Soportes de Johnny Cage": "running-shoe",
    "Polainas de Solaire": "leg-armor",
    "Grebas del Caballero Alaba": "greaves",
    "Soportes del Wither": "armored-pants",
    "Midgard Grebas de Odín": "greaves",
    "Grebas de Outworld": "greaves",
    "Pies de Bedrock": "steeltoe-boots",
    "Tierra Calzado de Liu Kang": "sandal",
    "Botas de Combate": "walking-boot",
    "Sandalias de Alfheim": "sandal",
    "Sangriento Botas de Raiden": "boots",

    // CONSUMABLES
    "Vial de Energía Básica": "bottled-bolt",
    "Elixir de Resistencia": "glass-heart",
    "Esencia de Guerrero": "muscle-up",
    "Ambrosía del Olimpo": "amphora",
    "Esencia de Gravedad Cero": "bubbling-flask"
};

const fallbacks = {
    head: 'barbute',
    weapon: 'broadsword',
    armor: 'plate-armor',
    boots: 'boots',
    consumable: 'potion-ball'
};

const iconData = JSON.parse(fs.readFileSync('./data/game-icons.json', 'utf8'));
const allIcons = [
    ...iconData.head,
    ...iconData.weapon,
    ...iconData.armor,
    ...iconData.boots,
    ...iconData.consumable,
    ...iconData.other
].map(i => i.slug);

async function manualAssignment() {
    console.log('✍️ Iniciando Asignación Manual y Revisada de Iconos...');
    
    try {
        const res = await query('SELECT id, name, type FROM items WHERE type IN (\'head\', \'weapon\', \'armor\', \'boots\', \'consumable\')');
        const items = res.rows;
        
        await query('BEGIN');
        
        for (const item of items) {
            let preferred = manualMapping[item.name];
            let slug = '';
            
            if (preferred && allIcons.includes(preferred)) {
                slug = preferred;
            } else {
                console.warn(`⚠️ Icono manual no encontrado para ${item.name} (${preferred}). Usando fallback.`);
                slug = fallbacks[item.type];
            }
            
            await query('UPDATE items SET svg_key = $1 WHERE id = $2', [`gi:${slug}`, item.id]);
        }
        
        await query('COMMIT');
        console.log(`✅ Asignación manual completada para ${items.length} ítems.`);
        
        // Exportar a editable_items.json para que el usuario lo vea
        const editableRes = await query('SELECT id, name, svg_key FROM items WHERE type IN (\'head\', \'weapon\', \'armor\', \'boots\', \'consumable\') ORDER BY id ASC');
        const editableData = editableRes.rows.map(a => ({ id: a.id, name: a.name, icon: a.svg_key }));
        fs.writeFileSync('./data/editable_items.json', JSON.stringify(editableData, null, 2));
        
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

manualAssignment();
