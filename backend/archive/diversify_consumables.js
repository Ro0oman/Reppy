import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const { query } = await import('./db.js');

const consumables = [
    // Rarity: common (30 min = 1800s)
    {
        name: 'Vial de Energía Básica',
        description: 'Un pequeño estímulo para tus músculos. Ideal para sesiones rápidas.',
        type: 'consumable',
        rarity: 'common',
        price: 150,
        stats: { duration: 1800, multiplier: 1.1 }
    },
    {
        name: 'Tónico de Concentración',
        description: 'Mejora temporalmente tu Destreza (DEX), aumentando tu precisión y daño crítico.',
        type: 'consumable',
        rarity: 'common',
        price: 200,
        stats: { duration: 1800, dex_bonus: 5 }
    },
    // Rarity: rare (1h = 3600s)
    {
        name: 'Elixir de Resistencia',
        description: 'Te permite aguantar el ritmo durante una hora completa de esfuerzo.',
        type: 'consumable',
        rarity: 'rare',
        price: 500,
        stats: { duration: 3600, multiplier: 1.25 }
    },
    {
        name: 'Brebaje de Potencia',
        description: 'Aumenta masivamente tu Destreza (DEX). Tus golpes serán letales.',
        type: 'consumable',
        rarity: 'rare',
        price: 650,
        stats: { duration: 3600, dex_bonus: 12 }
    },
    // Rarity: especial (3h = 10800s)
    {
        name: 'Esencia de Guerrero',
        description: 'Imbuye tu cuerpo con la tenacidad de los antiguos maestros.',
        type: 'consumable',
        rarity: 'especial',
        price: 1500,
        stats: { duration: 10800, multiplier: 1.6 }
    },
    {
        name: 'Sérum de Precisión Químico',
        description: 'Una mezcla avanzada que eleva tu Destreza (DEX) a niveles sobrehumanos.',
        type: 'consumable',
        rarity: 'especial',
        price: 2200,
        stats: { duration: 10800, dex_bonus: 25 }
    },
    // Rarity: legendary (6h = 21600s)
    {
        name: 'Ambrosía del Olimpo',
        description: 'Un manjar divino que otorga un poder abrumador durante horas.',
        type: 'consumable',
        rarity: 'legendary',
        price: 4500,
        stats: { duration: 21600, multiplier: 2.2 }
    },
    {
        name: 'Sangre de Dragón',
        description: 'La sangre de la bestia fluye por tus venas, otorgándote una Destreza (DEX) legendaria.',
        type: 'consumable',
        rarity: 'legendary',
        price: 6000,
        stats: { duration: 21600, dex_bonus: 50 }
    },
    // Rarity: calistenico (24h = 86400s)
    {
        name: 'Esencia de Gravedad Cero',
        description: 'Domina las leyes de la física. Un día entero de rendimiento supremo.',
        type: 'consumable',
        rarity: 'calistenico',
        price: 12000,
        stats: { duration: 86400, multiplier: 3.5 }
    },
    {
        name: 'Maestría del Cuerpo',
        description: 'La culminación del control físico. Tu Destreza (DEX) es inigualable.',
        type: 'consumable',
        rarity: 'calistenico',
        price: 18000,
        stats: { duration: 86400, dex_bonus: 100 }
    }
];

async function run() {
    console.log('🧹 Actualizando consumibles con bonos de DEX...');
    try {
        await query("DELETE FROM items WHERE type = 'consumable'");
        console.log('📦 Re-insertando consumibles con bonos de estadísticas...');
        
        for (const item of consumables) {
            await query(
                'INSERT INTO items (name, description, type, rarity, price, stats) VALUES ($1, $2, $3, $4, $5, $6)',
                [item.name, item.description, item.type, item.rarity, item.price, item.stats]
            );
        }
        
        console.log('✅ Actualización de consumibles completada!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error durante la actualización:', err);
        process.exit(1);
    }
}

run();
