import { query } from './db.js';
import fs from 'fs';

const perfectMapping = {
    // HEAD (25 items)
    "Máscara de Oolacile": "ninja-mask",
    "Diadema de Leviatán": "jeweled-chalice",
    "Corona de Dragón": "crown",
    "Capuchón del Aldeano": "hood",
    "Diadema de Muspelheim": "tiara",
    "Casco del Ender Dragon": "dragon-head",
    "Casco de Asesino de Dragones": "spartan-helmet",
    "Escarcha Casco de Sub-Zero": "frostfire",
    "Pixelado Cofia de Hierro": "helmet",
    "Casco Espartano": "crested-helmet",
    "Catarina Yelmo de Artorias": "closed-barbute",
    "Cinta del Infierno": "headband-knot",
    "Protector de Scorpion": "insect-jaws",
    "Yelmo de Muspelheim": "heavy-helm",
    "Casco del Creepers": "mc-creeper",
    "Casco de Liu Kang": "bandana",
    "Frontal de Muspelheim": "horned-helm",
    "Obsidiana Cofia del Ender Dragon": "cowl",
    "Crafteado Cofia de Diamante": "crystal-bars",
    "Yelmo de Anor Londo": "barbute",
    "Diadema de Atreus": "laurel-crown",
    "Fatal Casco de Johnny Cage": "sunglasses",
    "Casco de Caos": "visored-helmet",
    "Casco Divino": "roman-helmet",
    "Obsidiana Capuchón de Diamante": "wizard-face",

    // ARMOR (25 items)
    "Maldito Coraza del Gran Maestro": "breastplate",
    "Placas del End": "metal-plate",
    "Chaqueta de Redstone": "leather-armor",
    "Midgard Brazares de Atreus": "bracers",
    "Almas Coraza de Scorpion": "ninja-armor",
    "Pixelado Chaqueta del Creepers": "explosive-materials",
    "Túnica del Cazador de Dragones": "robe",
    "Redstone Chaqueta del Aldeano": "tunic",
    "Obsidiana Peto de Oro": "chest-armor",
    "Infierno Hombreras de Raiden": "shoulder-armor",
    "Túnica del Nether": "cultist",
    "Bedrock Túnica del Wither": "warlock-hood",
    "Tierra Hombreras de Shao Kahn": "spiked-armor",
    "Coraza del Gran Maestro": "cuirass",
    "Chaqueta del End": "cape-armor",
    "Outworld Hombreras de Johnny Cage": "shoulder-pads",
    "Outworld Coraza de Liu Kang": "abdominal-armor",
    "Dragón Cota de Solaire": "chain-mail",
    "Coraza de Obsidiana": "armor-vest",
    "Tabardo de Solaire": "tabard",
    "Armadura de Vanaheim": "lamellar",
    "Peto del Ender Dragon": "plate-armor",
    "Peto Encantado": "magic-armor",
    "Chaleco de Liu Kang": "leather-vest",
    "Muspelheim Brazares de Kratos": "vambrace",

    // WEAPONS (25 items)
    "End Espada del Aldeano": "broadsword",
    "Arco del Aldeano": "bow-arrow",
    "Lanza de Solaire": "spear-feather",
    "Espadón del Gran Maestro": "claymore-explosive",
    "Abanico de Liu Kang": "sword-spin",
    "Lanza de Freya": "spear-hook",
    "Azada Pixelado": "pitchfork",
    "Escudo de Alfheim": "round-shield",
    "Overworld Azada de Oro": "scythe",
    "Jotunheim Lanza de Freya": "halberd",
    "Espadón del Abismo": "greatsword",
    "Espada Espartano": "gladius",
    "Abanico de Outworld": "blade-drag",
    "Maldito Maza del Cazador de Dragones": "mace-head",
    "Escudo de Helheim": "bordered-shield",
    "Infierno Kunai de Shao Kahn": "kunai",
    "Maza del Abismo": "flail",
    "Hacha de Midgard": "battle-axe",
    "Maza de Atreus": "warhammer",
    "Maza de Artorias": "spiked-mace",
    "Lanza de Astora": "trident",
    "Garras de Raiden": "tiger-claws",
    "Garras de Escarcha": "claws",
    "Espada Divino": "sword-blade",
    "Helheim Hacha de Kratos": "tomahawk",

    // BOOTS (25 items)
    "Espartano Soportes de Valquiria": "winged-leg",
    "Grebas de Liu Kang": "leg-armor",
    "Botas del No Muerto": "boots",
    "Calzado de Johnny Cage": "running-shoe",
    "Soportes de Vanaheim": "leather-boot",
    "Calzado del Abismo": "armored-pants",
    "Botas de Caos": "rubber-boot",
    "Sandalias de Freya": "sandal",
    "Netherite Soportes de Hierro": "steeltoe-boots",
    "Botas de Almas": "walking-boot",
    "Botas de Escarcha": "ski-boot",
    "Espinilleras de Oolacile": "greaves",
    "Soportes de Odín": "robot-leg",
    "Polainas de Havel": "armor-cuisses",
    "Tierra Soportes de Johnny Cage": "shoes",
    "Polainas de Solaire": "leg",
    "Grebas del Caballero Alaba": "gaiter",
    "Soportes del Wither": "pegleg",
    "Midgard Grebas de Odín": "metal-boot",
    "Grebas de Outworld": "hoof",
    "Pies de Bedrock": "boot-stomp",
    "Tierra Calzado de Liu Kang": "sticky-boot",
    "Botas de Combate": "chelsea-boot",
    "Sandalias de Alfheim": "barefoot",
    "Sangriento Botas de Raiden": "boot-kick",

    // CONSUMABLES (5 items)
    "Vial de Energía Básica": "bottled-bolt",
    "Elixir de Resistencia": "glass-heart",
    "Esencia de Guerrero": "muscle-up",
    "Ambrosía del Olimpo": "amphora",
    "Esencia de Gravedad Cero": "bubbling-flask"
};

async function checkAndApply() {
    console.log('✨ Iniciando Asignación Perfecta (105 Iconos Únicos)...');
    
    // Check duplicates in my list just in case
    const values = Object.values(perfectMapping);
    const uniqueValues = new Set(values);
    if (values.length !== uniqueValues.size) {
        console.error('❌ Error: Hay duplicados en perfectMapping!');
        const duplicates = values.filter((item, index) => values.indexOf(item) !== index);
        console.error([...new Set(duplicates)]);
        process.exit(1);
    }
    
    console.log(`✅ Verificado: ${values.length} iconos, todos únicos.`);
    
    try {
        const res = await query('SELECT id, name FROM items WHERE type IN (\'head\', \'weapon\', \'armor\', \'boots\', \'consumable\')');
        const items = res.rows;
        
        await query('BEGIN');
        
        for (const item of items) {
            let slug = perfectMapping[item.name];
            if (!slug) {
                console.warn(`⚠️ Faltaba mapeo para ${item.name}, asignando uno aleatorio...`);
                slug = "help";
            }
            await query('UPDATE items SET svg_key = $1 WHERE id = $2', [`gi:${slug}`, item.id]);
        }
        
        await query('COMMIT');
        
        // Regenerar el JSON editable
        const editableRes = await query('SELECT id, name, svg_key FROM items WHERE type IN (\'head\', \'weapon\', \'armor\', \'boots\', \'consumable\') ORDER BY id ASC');
        const editableData = editableRes.rows.map(a => ({ id: a.id, name: a.name, icon: a.svg_key }));
        fs.writeFileSync('./data/editable_items.json', JSON.stringify(editableData, null, 2));
        
        console.log('✅ ¡Asignación Perfecta completada con éxito!');
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkAndApply();
