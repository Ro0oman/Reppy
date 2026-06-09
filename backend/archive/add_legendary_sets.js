import { query } from './db.js';

async function addLegendarySets() {
  console.log('Adding New Legendary Sets with Epic Lore...');
  try {
    const items = [
      // 1. Void Knight Set
      { name: 'Void Knight', description: 'ELITE PROTOCOL: El vacío no es la ausencia de materia, sino la presencia de una gravedad que solo tú puedes dominar. Título reservado para quienes entrenan hasta el olvido.', type: 'title', price: 2500, css_value: 'title-void-knight', rarity: 'legendary', is_seasonal: true },
      { name: 'Event Horizon', description: 'Borde Legendario. Representa el límite donde la pereza desaparece para ser devorada por la disciplina. Una vez cruzas este marco, no hay vuelta atrás.', type: 'border', price: 2500, css_value: 'frame-void', rarity: 'legendary', is_seasonal: true },
      { name: 'Cosmic Nebula', description: 'Fondo Legendario. Tu entrenamiento ha alcanzado una escala astronómica. No eres solo un atleta, eres una fuerza de la naturaleza expandiéndose por el cosmos.', type: 'background', price: 2500, css_value: 'bg-void', rarity: 'legendary', is_seasonal: true },
      
      // 2. Cyber Ronin Set
      { name: 'Ronin.exe', description: 'ELITE PROTOCOL: Un guerrero sin maestro, un código sin errores. Has hackeado tu propio potencial biológico para alcanzar un rendimiento sobrehumano.', type: 'title', price: 2500, css_value: 'title-ronin', rarity: 'legendary', is_seasonal: true },
      { name: 'Digital Katana', description: 'Borde Legendario. Filo de neón puro que corta la fatiga como si fuera software obsoleto. La elegancia cibernética del entrenamiento moderno.', type: 'border', price: 2500, css_value: 'frame-ronin', rarity: 'legendary', is_seasonal: true },
      { name: 'Neo Tokyo', description: 'Fondo Legendario. Lluvia de datos bajo las luces de neón. El gimnasio del futuro no tiene paredes, solo una conexión constante con tu propio progreso.', type: 'background', price: 2500, css_value: 'bg-ronin', rarity: 'legendary', is_seasonal: true },
      
      // 3. Blood God Set
      { name: 'BLOOD GOD', description: 'ELITE PROTOCOL: La sangre es el combustible, el sudor es el tributo. Un título que solo los dioses del hierro pueden portar tras sacrificar su comodidad en el altar de las pesas.', type: 'title', price: 2500, css_value: 'title-blood-god', rarity: 'legendary', is_seasonal: true },
      { name: 'Sacrificial Altar', description: 'Borde Legendario. Runas antiguas bañadas en la energía de mil levantamientos. Este marco no solo contiene tu imagen, contiene tu voluntad inquebrantable.', type: 'border', price: 2500, css_value: 'frame-blood-god', rarity: 'legendary', is_seasonal: true },
      { name: 'Crimson Tide', description: 'Fondo Legendario. Un océano de energía vital que fluye con cada contracción muscular. La gloria no se pide, se arranca del suelo con las manos desnudas.', type: 'background', price: 2500, css_value: 'bg-blood', rarity: 'legendary', is_seasonal: true }
    ];

    for (const item of items) {
      await query(
        `INSERT INTO items (name, description, type, price, css_value, rarity) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (name) 
         DO UPDATE SET description = EXCLUDED.description, price = EXCLUDED.price, css_value = EXCLUDED.css_value, rarity = EXCLUDED.rarity`,
         [item.name, item.description, item.type, item.price, item.css_value, item.rarity]
      );
      console.log(`Added/Updated: ${item.name}`);
    }

    console.log('Expansion de sets con Lore terminada.');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sets:', error);
    process.exit(1);
  }
}

addLegendarySets();
