import { query } from './db.js';

async function adjustEconomy() {
    const updates = [
      // Price adjustments
      { name: 'Aura Neón Rosa', price: 250, description: 'Rare Border. Neón rosa pulsante.' },
      { name: 'Aura Fuego Ámbar', price: 800, description: 'Epic Border. Anillo de fuego estático.' },
      { name: 'Brick by Brick', price: 80, description: 'Common Border. Constancia diaria.' },
      { name: 'No Excuses', price: 120, description: 'Common Title. Sin excusas.' },
      { name: 'Guardián del Tubo', price: 400, description: 'Epic Title. Guardián de la barra.' },
      { name: 'Stone Titan', price: 700, description: 'Epic Title. Fuerza bruta.' },
      // Marca del Slayer → EVENT ONLY (price stays but we mark it)
      { name: 'Marca del Slayer', price: 0, description: '🔒 EVENT ONLY — Solo desbloqueable en eventos de Boss.' },
    ];

    try {
        console.log("Adjusting economy...");
        for (let u of updates) {
           await query(`UPDATE cosmetics SET price=$1, description=$2 WHERE name=$3`, [u.price, u.description, u.name]);
           console.log(`${u.name} → ${u.price} coins | ${u.description}`);
        }
        console.log("\nDone adjusting prices.");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
adjustEconomy();
