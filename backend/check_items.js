import { query } from './db.js';
async function check() {
    try {
        const res = await query(`SELECT id, name, svg_key FROM items WHERE name IN ('Obsidiana Cofia del Ender Dragon', 'Casco del Creepers', 'Peto Encantado', 'Muspelheim Brazares de Kratos', 'Garras de Raiden', 'Espadón del Abismo', 'Tierra Soportes de Johnny Cage', 'Outworld Hombreras de Johnny Cage', 'Infierno Kunai de Shao Kahn', 'Grebas del Caballero Alaba', 'Espada Divino') OR is_seasonal = true`);
        console.log(res.rows);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
