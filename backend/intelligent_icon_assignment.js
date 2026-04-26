import { query } from './db.js';
import fs from 'fs';
import path from 'path';

// Cargar catálogo de iconos
const iconData = JSON.parse(fs.readFileSync('./data/game-icons.json', 'utf8'));
const allIcons = [
    ...iconData.head,
    ...iconData.weapon,
    ...iconData.armor,
    ...iconData.boots,
    ...iconData.consumable,
    ...iconData.other
];

// Mapeo de términos en español a palabras clave en inglés para los archivos SVG
const themeKeywords = {
    'dragón': ['dragon', 'drak', 'wyvern', 'lizard'],
    'dragon': ['dragon', 'drak', 'wyvern', 'lizard'],
    'sol': ['sun', 'solar', 'star'],
    'abismo': ['abyss', 'void', 'dark', 'hole', 'black'],
    'ceniciento': ['ash', 'fire', 'flame', 'burning'],
    'maldito': ['curse', 'skull', 'death', 'dark'],
    'nether': ['hell', 'fire', 'flame', 'devil', 'lava'],
    'obsidiana': ['obsidian', 'rock', 'crystal', 'sharp', 'stone'],
    'diamante': ['diamond', 'gem', 'crystal', 'shiny'],
    'hierro': ['iron', 'metal', 'steel', 'anvil'],
    'oro': ['gold', 'coin', 'treasure', 'shiny'],
    'trueno': ['thunder', 'lightning', 'bolt', 'storm'],
    'escarcha': ['frost', 'ice', 'snow', 'cold', 'frozen'],
    'sombra': ['shadow', 'ghost', 'dark', 'ninja'],
    'almas': ['soul', 'ghost', 'spirit', 'wraith'],
    'infierno': ['hell', 'fire', 'flame', 'devil'],
    'leviatán': ['leviathan', 'whale', 'sea', 'monster', 'kraken'],
    'caos': ['chaos', 'spiral', 'magic', 'vortex'],
    'valquiria': ['valkyrie', 'wing', 'angel', 'feathers'],
    'escorpión': ['scorpion', 'insect', 'stinger'],
    'scorpion': ['scorpion', 'insect', 'stinger'],
    'sub-zero': ['ice', 'frost', 'snow', 'cold'],
    'raiden': ['lightning', 'bolt', 'thunder'],
    'kratos': ['axe', 'omega', 'warrior', 'beard'],
    'wither': ['skull', 'skeleton', 'death'],
    'ender': ['eye', 'portal', 'galaxy', 'star'],
    'creepers': ['bomb', 'explosion', 'tnt'],
    'energía': ['energy', 'lightning', 'bolt', 'power', 'battery', 'charge'],
    'resistencia': ['shield', 'muscle', 'heart', 'stone', 'diamond', 'wall'],
    'guerrero': ['warrior', 'sword', 'muscle', 'helmet', 'gladiator'],
    'olimpo': ['greek', 'temple', 'column', 'fruit', 'cup'],
    'ambrosía': ['ambrosia', 'fruit', 'cup', 'nectar'],
    'gravedad': ['gravity', 'weight', 'space', 'planet', 'star', 'atom'],
};

const typeKeywords = {
    'túnica': ['robe', 'tunic', 'cloth'],
    'coraza': ['armor', 'breastplate', 'plate', 'cuirass'],
    'peto': ['armor', 'breastplate', 'plate'],
    'yelmo': ['helmet', 'helm', 'mask'],
    'casco': ['helmet', 'helm', 'mask'],
    'máscara': ['mask', 'face'],
    'espada': ['sword', 'blade', 'katana'],
    'sable': ['saber', 'scimitar', 'blade'],
    'daga': ['dagger', 'knife', 'kunai'],
    'espadón': ['claymore', 'broadsword', 'sword'],
    'hacha': ['axe', 'hatchet', 'tomahawk'],
    'maza': ['mace', 'hammer', 'flail'],
    'martillo': ['hammer', 'warhammer'],
    'lanza': ['spear', 'halberd', 'lance', 'trident'],
    'arco': ['bow', 'arrow'],
    'escudo': ['shield', 'buckler'],
    'botas': ['boot', 'shoe', 'walking-boot'],
    'calzado': ['boot', 'shoe', 'sandal'],
    'grebas': ['leg-armor', 'greave', 'armored-pants'],
    'frasco': ['flask', 'bottle', 'vial'],
    'vial': ['vial', 'flask', 'potion'],
    'pocion': ['potion', 'bottle', 'liquid'],
    'poción': ['potion', 'bottle', 'liquid'],
    'manzana': ['apple', 'fruit'],
    'pan': ['bread', 'loaf'],
    'carne': ['meat', 'steak', 'bone'],
    'anillo': ['ring', 'jewelry']
};

async function intelligentAssignment() {
    console.log('🧠 Iniciando Asignación Inteligente de Iconos...');
    
    try {
        const res = await query('SELECT id, name, type FROM items WHERE type IN (\'head\', \'weapon\', \'armor\', \'boots\', \'consumable\')');
        const items = res.rows;
        const usedIcons = new Set();
        const assignments = [];

        for (const item of items) {
            const nameLower = item.name.toLowerCase();
            let matchedIcon = null;

            // 1. Buscar por TEMA (ej. Dragon, Nether)
            let themeKeys = [];
            for (const [es, enKeys] of Object.entries(themeKeywords)) {
                if (nameLower.includes(es)) {
                    themeKeys = [...themeKeys, ...enKeys];
                }
            }

            // 2. Buscar por TIPO (ej. Espada, Yelmo)
            let typeKeys = [];
            for (const [es, enKeys] of Object.entries(typeKeywords)) {
                if (nameLower.includes(es)) {
                    typeKeys = [...typeKeys, ...enKeys];
                }
            }

            // Estrategia de búsqueda:
            // Intentar encontrar un icono que tenga TANTO el tema como el tipo
            if (themeKeys.length > 0 && typeKeys.length > 0) {
                matchedIcon = allIcons.find(icon => 
                    themeKeys.some(tk => icon.slug.includes(tk)) && 
                    typeKeys.some(yk => icon.slug.includes(yk)) &&
                    !usedIcons.has(icon.slug)
                );
            }

            // Si no, intentar solo el tema (buscando en la categoría correcta del ítem)
            if (!matchedIcon && themeKeys.length > 0) {
                const catIcons = iconData[item.type] || [];
                matchedIcon = catIcons.find(icon => 
                    themeKeys.some(tk => icon.slug.includes(tk)) && 
                    !usedIcons.has(icon.slug)
                );
                
                // Si no hay en la categoría, buscar en TODAS
                if (!matchedIcon) {
                    matchedIcon = allIcons.find(icon => 
                        themeKeys.some(tk => icon.slug.includes(tk)) && 
                        !usedIcons.has(icon.slug)
                    );
                }
            }

            // Si no, intentar solo el tipo
            if (!matchedIcon && typeKeys.length > 0) {
                matchedIcon = allIcons.find(icon => 
                    typeKeys.some(yk => icon.slug.includes(yk)) && 
                    !usedIcons.has(icon.slug)
                );
            }

            // Si no, usar un icono genérico de la categoría
            if (!matchedIcon) {
                const catIcons = iconData[item.type] || [];
                matchedIcon = catIcons.find(icon => !usedIcons.has(icon.slug));
            }

            if (matchedIcon) {
                usedIcons.add(matchedIcon.slug);
                assignments.push({ id: item.id, name: item.name, icon: `gi:${matchedIcon.slug}` });
            } else {
                console.warn(`⚠️ No se encontró icono ideal para: ${item.name}`);
                // Fallback final: cualquiera de la categoría que no esté muy usado
                const catIcons = iconData[item.type] || [];
                matchedIcon = catIcons[item.id % catIcons.length];
                assignments.push({ id: item.id, name: item.name, icon: `gi:${matchedIcon.slug}` });
            }
        }

        // Actualizar base de datos
        console.log('💾 Guardando cambios en la base de datos...');
        await query('BEGIN');
        for (const ass of assignments) {
            await query('UPDATE items SET svg_key = $1 WHERE id = $2', [ass.icon, ass.id]);
        }
        await query('COMMIT');

        // Exportar a editable_items.json para que el usuario lo vea
        const editableData = assignments.map(a => ({ id: a.id, name: a.name, icon: a.icon }));
        fs.writeFileSync('./data/editable_items.json', JSON.stringify(editableData, null, 2));

        console.log(`✅ ¡Asignación completada! Se han procesado ${assignments.length} ítems.`);
        console.log('📄 Los resultados se han guardado también en backend/data/editable_items.json');
        process.exit(0);
    } catch (err) {
        await query('ROLLBACK');
        console.error('❌ Error en la asignación inteligente:', err);
        process.exit(1);
    }
}

intelligentAssignment();
